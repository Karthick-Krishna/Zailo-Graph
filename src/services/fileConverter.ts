import { jsPDF } from 'jspdf';
import { Document, Paragraph, TextRun, HeadingLevel, Packer, PageBreak } from 'docx';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import JSZip from 'jszip';
import { ConversionType, ConversionResult, ConvertedPageResult } from '../types/converter';

// Configure PDF.js worker for in-browser client execution
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker initialization notice:', e);
  }
}

/**
 * Extract clean extension without leading dot
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()!.toLowerCase().trim();
};

/**
 * Strip extension from filename
 */
export const getBaseFilename = (filename: string): string => {
  return filename.replace(/\.[^/.]+$/, '');
};

/**
 * Detect file format from name and mimeType
 */
export const detectFormat = (file: File): string => {
  const ext = getFileExtension(file.name);
  if (ext) return ext;

  if (file.type === 'application/pdf') return 'pdf';
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (file.type === 'application/msword') return 'doc';
  if (file.type.startsWith('image/jpeg')) return 'jpg';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  if (file.type === 'image/avif') return 'avif';
  if (file.type === 'image/svg+xml') return 'svg';
  
  return 'unknown';
};

/**
 * Determine default conversion type and target format based on file
 */
export const suggestConversion = (file: File): { type: ConversionType; targetFormat: string } => {
  const format = detectFormat(file);

  switch (format) {
    case 'docx':
    case 'doc':
      return { type: 'word-to-pdf', targetFormat: 'pdf' };
    case 'pdf':
      return { type: 'pdf-to-word', targetFormat: 'docx' };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp':
    case 'avif':
    case 'svg':
    case 'bmp':
      return { type: 'image-to-pdf', targetFormat: 'pdf' };
    default:
      return { type: 'word-to-pdf', targetFormat: 'pdf' };
  }
};

/**
 * Group raw text items from PDF.js into visual reading lines
 */
function groupPdfTextIntoLines(items: any[]): Array<{ text: string; isBold: boolean; isHeading: boolean }> {
  if (!items || items.length === 0) return [];

  // Sort items primarily by Y descending (PDF coords start at bottom), then by X ascending
  const sorted = [...items].filter(it => it.str && it.str.trim().length > 0).sort((a, b) => {
    const yA = a.transform ? a.transform[5] : 0;
    const yB = b.transform ? b.transform[5] : 0;
    const diffY = yB - yA;
    if (Math.abs(diffY) > 4) return diffY;
    const xA = a.transform ? a.transform[4] : 0;
    const xB = b.transform ? b.transform[4] : 0;
    return xA - xB;
  });

  const lines: Array<{ text: string; isBold: boolean; isHeading: boolean }> = [];
  let currentLine: string[] = [];
  let currentY: number | null = null;
  let maxFontSizeInLine = 0;
  let isLineBold = false;

  for (const item of sorted) {
    const y = item.transform ? Math.round(item.transform[5]) : 0;
    const fontSize = item.transform ? Math.abs(item.transform[0]) : 12;
    const fontName = (item.fontName || '').toLowerCase();
    const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy');

    if (currentY === null || Math.abs(currentY - y) <= 4) {
      currentLine.push(item.str);
      currentY = y;
      if (fontSize > maxFontSizeInLine) maxFontSizeInLine = fontSize;
      if (isBold) isLineBold = true;
    } else {
      const lineText = currentLine.join(' ').replace(/\s+/g, ' ').trim();
      if (lineText) {
        lines.push({
          text: lineText,
          isBold: isLineBold,
          isHeading: maxFontSizeInLine >= 16,
        });
      }
      currentLine = [item.str];
      currentY = y;
      maxFontSizeInLine = fontSize;
      isLineBold = isBold;
    }
  }

  if (currentLine.length > 0) {
    const lineText = currentLine.join(' ').replace(/\s+/g, ' ').trim();
    if (lineText) {
      lines.push({
        text: lineText,
        isBold: isLineBold,
        isHeading: maxFontSizeInLine >= 16,
      });
    }
  }

  return lines;
}

/**
 * 1. WORD TO PDF CONVERTER
 * Converts DOCX and DOC documents into clean, searchable, multi-page vector PDF files.
 */
export const convertWordToPdf = async (
  file: File,
  onProgress?: (progress: number, message?: string) => void
): Promise<ConversionResult> => {
  onProgress?.(10, 'Reading Word document...');
  const baseName = getBaseFilename(file.name);
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(30, 'Parsing document elements & typography...');
  let rawText = '';
  let htmlContent = '';

  try {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    htmlContent = result.value;
  } catch (err) {
    console.warn('Mammoth HTML parsing fallback:', err);
  }

  try {
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    rawText = textResult.value;
  } catch (err) {
    console.warn('Mammoth raw text parsing fallback:', err);
  }

  // Fallback for older or binary Word files
  if (!htmlContent && !rawText) {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const decoded = decoder.decode(arrayBuffer);
    rawText = decoded.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  onProgress?.(60, 'Generating vector PDF document...');

  // Standard A4: 595.28 pt x 841.89 pt
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const usableWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Header banner
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(20, 24, 33);
  pdf.text(baseName, margin, cursorY);
  cursorY += 28;

  pdf.setDrawColor(220, 225, 235);
  pdf.setLineWidth(1);
  pdf.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 24;

  // Process text paragraphs
  const paragraphs = (rawText || htmlContent.replace(/<[^>]+>/g, '\n'))
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (paragraphs.length === 0) {
    paragraphs.push('Empty document or no extractable text found.');
  }

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(50, 55, 65);

  const lineHeight = 16;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const isHeading = para.length < 80 && (i === 0 || para.endsWith(':') || /^[A-Z0-9\s]{3,40}$/.test(para));

    if (isHeading) {
      cursorY += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(15, 23, 42);
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(51, 65, 85);
    }

    const wrappedLines: string[] = pdf.splitTextToSize(para, usableWidth);

    for (const line of wrappedLines) {
      if (cursorY + lineHeight > pageHeight - margin) {
        pdf.addPage();
        cursorY = margin;
      }
      pdf.text(line, margin, cursorY);
      cursorY += lineHeight;
    }

    cursorY += isHeading ? 6 : 8;

    if (i % 20 === 0) {
      onProgress?.(Math.min(88, Math.round(60 + (i / paragraphs.length) * 28)));
    }
  }

  onProgress?.(95, 'Finalizing PDF output...');
  const pdfBytes = pdf.output('arraybuffer');
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${baseName}.pdf`,
  };
};

/**
 * 2. PDF TO WORD CONVERTER
 * Converts PDF files into fully editable Microsoft Word (.docx) documents.
 */
export const convertPdfToWord = async (
  file: File,
  onProgress?: (progress: number, message?: string) => void
): Promise<ConversionResult> => {
  onProgress?.(10, 'Loading PDF document...');
  const baseName = getBaseFilename(file.name);
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const docChildren: Paragraph[] = [];

  // Title heading
  docChildren.push(
    new Paragraph({
      text: baseName,
      heading: HeadingLevel.TITLE,
      spacing: { after: 240 },
    })
  );

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progressPercent = Math.round(15 + (pageNum / numPages) * 70);
    onProgress?.(progressPercent, `Extracting text and structure from page ${pageNum} of ${numPages}...`);

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const lines = groupPdfTextIntoLines(textContent.items);

    if (lines.length === 0) {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: `[Page ${pageNum}: Scanned image or vector diagram without text layer]`, italics: true })],
          spacing: { after: 120 },
        })
      );
    } else {
      for (const line of lines) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.text,
                bold: line.isBold,
                size: line.isHeading ? 28 : 22, // in half-points (22 = 11pt)
              }),
            ],
            spacing: { after: line.isHeading ? 160 : 100 },
          })
        );
      }
    }

    // Insert Page Break between PDF pages
    if (pageNum < numPages) {
      docChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
  }

  onProgress?.(90, 'Packaging editable Word (.docx) document...');

  const doc = new Document({
    creator: 'Zailo Graph Universal File Converter',
    title: baseName,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in dxa
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  return {
    blob,
    filename: `${baseName}.docx`,
  };
};

/**
 * 3. IMAGE TO PDF CONVERTER
 * Converts single or multiple images (JPG, PNG, WEBP, AVIF, SVG) into a high-fidelity PDF.
 */
export const convertImageToPdf = async (
  file: File,
  options?: { pageSize?: 'a4' | 'letter' | 'fit'; orientation?: 'auto' | 'portrait' | 'landscape' },
  onProgress?: (progress: number, message?: string) => void
): Promise<ConversionResult> => {
  return convertMultipleImagesToPdf([file], options, onProgress);
};

export const convertMultipleImagesToPdf = async (
  files: File[],
  options?: { pageSize?: 'a4' | 'letter' | 'fit'; orientation?: 'auto' | 'portrait' | 'landscape' },
  onProgress?: (progress: number, message?: string) => void
): Promise<ConversionResult> => {
  if (files.length === 0) {
    throw new Error('No images provided for PDF conversion.');
  }

  onProgress?.(10, 'Initializing PDF compiler...');
  const baseName = files.length === 1 ? getBaseFilename(files[0].name) : `zailograph_images_collection`;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: options?.pageSize === 'letter' ? 'letter' : 'a4',
  });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progressPercent = Math.round(15 + (i / files.length) * 75);
    onProgress?.(progressPercent, `Embedding image ${i + 1} of ${files.length}...`);

    // Load image as ImageBitmap/Canvas to get exact dimensions and uniform PNG/JPEG data URL
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0);
    }
    bitmap.close();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Page orientation
    const isLandscape = imgWidth > imgHeight;
    const orientation = options?.orientation === 'portrait' ? 'p' : options?.orientation === 'landscape' ? 'l' : isLandscape ? 'l' : 'p';

    if (i > 0) {
      pdf.addPage('a4', orientation);
    } else {
      // Reconfigure first page orientation
      if (orientation === 'l') {
        pdf.deletePage(1);
        pdf.addPage('a4', 'l');
      }
    }

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    const targetW = pageWidth - margin * 2;
    const targetH = pageHeight - margin * 2;

    const scale = Math.min(targetW / imgWidth, targetH / imgHeight);
    const renderW = imgWidth * scale;
    const renderH = imgHeight * scale;

    const posX = (pageWidth - renderW) / 2;
    const posY = (pageHeight - renderH) / 2;

    pdf.addImage(dataUrl, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');
  }

  onProgress?.(95, 'Packaging PDF file...');
  const arrayBuffer = pdf.output('arraybuffer');
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

  return {
    blob,
    filename: `${baseName}.pdf`,
  };
};

/**
 * 4. WORD TO WORD CONVERTER
 * Converts and normalizes between Word formats (DOC to clean standard OpenXML DOCX).
 */
export const convertWordToWord = async (
  file: File,
  onProgress?: (progress: number, message?: string) => void
): Promise<ConversionResult> => {
  onProgress?.(15, 'Reading source Word document structure...');
  const baseName = getBaseFilename(file.name);
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(45, 'Extracting document text and styles...');
  let rawText = '';

  try {
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    rawText = textResult.value;
  } catch (err) {
    console.warn('Mammoth text extraction:', err);
  }

  if (!rawText) {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    rawText = decoder.decode(arrayBuffer).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  onProgress?.(75, 'Rebuilding normalized Microsoft Word (.docx)...');

  const paragraphs = rawText
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const docChildren: Paragraph[] = [
    new Paragraph({
      text: baseName,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    }),
  ];

  for (const para of paragraphs) {
    const isHeading = para.length < 75 && (para.endsWith(':') || /^[A-Z0-9\s]{3,40}$/.test(para));
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: para,
            bold: isHeading,
            size: isHeading ? 26 : 22,
          }),
        ],
        spacing: { after: isHeading ? 140 : 100 },
      })
    );
  }

  const doc = new Document({
    creator: 'Zailo Graph Universal File Converter',
    title: `${baseName} (Normalized)`,
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  return {
    blob,
    filename: `${baseName}_normalized.docx`,
  };
};

/**
 * 5. PDF TO IMAGE CONVERTER
 * Converts PDF pages into crystal-clear high-res PNG or JPG images with individual and ZIP download.
 */
export const convertPdfToImages = async (
  file: File,
  options?: { format?: 'png' | 'jpeg'; dpiScale?: number },
  onProgress?: (progress: number, message?: string) => void
): Promise<ConversionResult> => {
  onProgress?.(10, 'Loading PDF document...');
  const baseName = getBaseFilename(file.name);
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const targetFormat = options?.format === 'jpeg' ? 'jpeg' : 'png';
  const mimeType = targetFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
  const ext = targetFormat === 'jpeg' ? 'jpg' : 'png';
  const scale = options?.dpiScale || 2.0; // 2x scale = 150-300 DPI crisp render

  const pages: ConvertedPageResult[] = [];
  const zip = new JSZip();

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progressPercent = Math.round(15 + (pageNum / numPages) * 75);
    onProgress?.(progressPercent, `Rendering PDF page ${pageNum} of ${numPages} (${scale}x high-definition)...`);

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context creation failed.');
    }

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    const pageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => {
          if (b) resolve(b);
          else reject(new Error(`Failed to export page ${pageNum} to ${ext}`));
        },
        mimeType,
        0.95
      );
    });

    const pageFileName = `${baseName}_page_${pageNum}.${ext}`;
    const pageUrl = URL.createObjectURL(pageBlob);

    pages.push({
      pageNum,
      name: pageFileName,
      blob: pageBlob,
      url: pageUrl,
      width: viewport.width,
      height: viewport.height,
    });

    zip.file(pageFileName, pageBlob);
  }

  onProgress?.(95, 'Packaging image output...');

  if (numPages === 1) {
    return {
      blob: pages[0].blob,
      filename: pages[0].name,
      pages,
    };
  }

  // Multi-page: return ZIP of all pages plus the individual page results
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return {
    blob: zipBlob,
    filename: `${baseName}_images_bundle.zip`,
    pages,
  };
};

/**
 * 6. IMAGE TO WORD (OCR) CONVERTER
 * Uses in-browser WebAssembly Tesseract OCR to extract text from images and compile an editable Word (.docx).
 */
export const convertImageToWordOcr = async (
  file: File,
  options?: { ocrLang?: string },
  onProgress?: (progress: number, message?: string) => void
): Promise<ConversionResult> => {
  onProgress?.(10, 'Initializing WebAssembly OCR engine...');
  const baseName = getBaseFilename(file.name);

  // Pre-process image into clean canvas/dataUrl for best OCR recognition
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(bitmap, 0, 0);
  }
  bitmap.close();

  onProgress?.(25, 'Scanning and extracting characters from image...');

  const { data } = await Tesseract.recognize(canvas, options?.ocrLang || 'eng', {
    logger: m => {
      if (m.status === 'recognizing text' && m.progress !== undefined) {
        const p = Math.round(25 + m.progress * 60);
        onProgress?.(p, `Recognizing text (${Math.round(m.progress * 100)}%)...`);
      }
    },
  });

  const recognizedText = data.text ? data.text.trim() : '';
  onProgress?.(88, 'Formatting extracted text into Microsoft Word document...');

  const docChildren: Paragraph[] = [
    new Paragraph({
      text: `${baseName} — Extracted Text (OCR)`,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 180 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Processed by Zailo Graph AI OCR Engine • Confidence: ${Math.round(data.confidence || 90)}%`,
          italics: true,
          size: 18,
          color: '64748B',
        }),
      ],
      spacing: { after: 240 },
    }),
  ];

  const lines = recognizedText
    .split(/\n+/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    docChildren.push(
      new Paragraph({
        text: 'No readable text was detected in this image. Please ensure the image has clear, legible text with good contrast.',
        spacing: { after: 120 },
      })
    );
  } else {
    for (const line of lines) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  const doc = new Document({
    creator: 'Zailo Graph Universal File Converter',
    title: `${baseName} OCR Extract`,
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  return {
    blob,
    filename: `${baseName}_ocr_text.docx`,
    extraText: recognizedText,
  };
};

/**
 * Universal Master Converter Router
 * Automatically routes file to the matching conversion function
 */
export const executeConversion = async (
  item: { file: File; conversionType: ConversionType; options?: any },
  onProgress?: (progress: number, message?: string) => void
): Promise<ConversionResult> => {
  switch (item.conversionType) {
    case 'word-to-pdf':
      return convertWordToPdf(item.file, onProgress);
    case 'pdf-to-word':
      return convertPdfToWord(item.file, onProgress);
    case 'image-to-pdf':
      return convertImageToPdf(item.file, item.options, onProgress);
    case 'word-to-word':
      return convertWordToWord(item.file, onProgress);
    case 'pdf-to-image':
      return convertPdfToImages(item.file, item.options, onProgress);
    case 'image-to-word':
      return convertImageToWordOcr(item.file, item.options, onProgress);
    default:
      throw new Error(`Unsupported conversion type: ${item.conversionType}`);
  }
};
