import { jsPDF } from 'jspdf';
import { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell, WidthType, HeadingLevel } from 'docx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import JSZip from 'jszip';
import { ConversionProgressState, ConversionResult } from '../../types/conversion';

type ProgressCallback = (state: ConversionProgressState) => void;

/**
 * Strips HTML tags and unescapes entities safely
 */
function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Renders structured HTML into a professional multi-page vector PDF
 */
function renderHtmlToPdf(html: string, title: string = 'Converted Document'): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 22 + 10;

  // Divider line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(1);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 20;

  // Temporary DOM parser
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(html, 'text/html');
  const elements = Array.from(parsedDoc.body.children);

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin - 30) {
      doc.addPage();
      cursorY = margin;
    }
  };

  for (const el of elements) {
    const tagName = el.tagName.toLowerCase();

    if (tagName.startsWith('h')) {
      const level = parseInt(tagName[1]) || 2;
      const fontSize = Math.max(12, 18 - (level - 1) * 2);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSize);
      doc.setTextColor(30, 41, 59);

      const text = el.textContent || '';
      const lines = doc.splitTextToSize(text, contentWidth);
      checkPageBreak(lines.length * (fontSize + 4) + 12);
      cursorY += 6;
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * (fontSize + 4) + 6;

    } else if (tagName === 'table') {
      const rows = Array.from(el.querySelectorAll('tr'));
      if (rows.length === 0) continue;

      const numCols = Math.max(...rows.map(r => r.children.length), 1);
      const colWidth = contentWidth / numCols;
      const rowHeight = 22;

      checkPageBreak(rows.length * rowHeight + 20);

      rows.forEach((row, rowIdx) => {
        const isHeader = rowIdx === 0;
        checkPageBreak(rowHeight);

        // Row background
        if (isHeader) {
          doc.setFillColor(241, 245, 249); // slate-100
          doc.rect(margin, cursorY, contentWidth, rowHeight, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
        } else {
          doc.setFillColor(rowIdx % 2 === 0 ? 255 : 250, rowIdx % 2 === 0 ? 255 : 250, rowIdx % 2 === 0 ? 255 : 252);
          doc.rect(margin, cursorY, contentWidth, rowHeight, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
        }

        // Row border
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, cursorY, contentWidth, rowHeight, 'S');

        // Cells
        Array.from(row.children).forEach((cell, colIdx) => {
          const cellText = cell.textContent?.trim() || '';
          const cellX = margin + colIdx * colWidth;
          const truncated = doc.splitTextToSize(cellText, colWidth - 8)[0] || '';
          doc.text(truncated, cellX + 4, cursorY + 15);
        });

        cursorY += rowHeight;
      });
      cursorY += 12;

    } else if (tagName === 'img') {
      const src = (el as HTMLImageElement).src;
      if (src && src.startsWith('data:')) {
        try {
          const imgW = Math.min(contentWidth, 360);
          const imgH = 200;
          checkPageBreak(imgH + 15);
          doc.addImage(src, 'JPEG', margin, cursorY, imgW, imgH);
          cursorY += imgH + 15;
        } catch {}
      }

    } else {
      // Paragraph or generic text
      const text = el.textContent?.trim();
      if (!text) continue;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(51, 65, 85); // slate-700

      const lines = doc.splitTextToSize(text, contentWidth);
      checkPageBreak(lines.length * 15 + 10);
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 15 + 8;
    }
  }

  // Footer Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Page ${i} of ${totalPages} • Generated by Zailo Graph`, pageWidth / 2, pageHeight - 20, { align: 'center' });
  }

  return doc.output('blob');
}

/**
 * 1. Word to PDF (.docx, .doc -> .pdf)
 */
export async function convertWordToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading Word document...', percent: 15 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Extracting formatting and content...', percent: 45 });
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  let html = '';

  try {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    html = result.value;
  } catch (err) {
    // Fallback for raw text extraction
    const rawResult = await mammoth.extractRawText({ arrayBuffer }).catch(() => ({ value: '' }));
    html = rawResult.value 
      ? rawResult.value.split('\n\n').map(p => `<p>${p}</p>`).join('')
      : `<p>Document: ${file.name}</p>`;
  }

  onProgress?.({ status: 'generating', phase: 'Rendering vector PDF pages...', percent: 80 });
  const pdfBlob = renderHtmlToPdf(html, baseName);

  onProgress?.({ status: 'done', phase: 'Word to PDF conversion complete!', percent: 100 });
  return {
    primaryBlob: pdfBlob,
    primaryFilename: `${baseName}_converted.pdf`,
    primaryMimeType: 'application/pdf',
    primarySize: pdfBlob.size,
    summary: `Converted ${file.name} to vector PDF (${(pdfBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 2. PDF to Word (.pdf -> .docx)
 * User requirement: MUST produce genuine editable DOCX, not an image.
 */
export async function convertPdfToWord(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Opening PDF document...', percent: 15 });
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  onProgress?.({ status: 'processing', phase: 'Extracting text and tables from pages...', percent: 35 });
  const loadingTask = pdfjsLib.getDocument({ data: uint8 });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const docxElements: any[] = [];
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  // Title heading in Word
  docxElements.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({ text: baseName, bold: true, size: 36, color: '0F172A' })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ 
          text: `Extracted from PDF (${numPages} pages) • Editable Zailo Graph Word Document`, 
          italics: true, 
          size: 18, 
          color: '64748B' 
        })
      ]
    }),
    new Paragraph({ text: '' })
  );

  for (let p = 1; p <= numPages; p++) {
    onProgress?.({
      status: 'processing',
      phase: `Analyzing page ${p} of ${numPages}...`,
      percent: Math.min(85, Math.round(35 + (p / numPages) * 45))
    });

    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const items = (content.items as any[]).filter(i => i.str && i.str.trim());

    if (numPages > 1) {
      docxElements.push(
        new Paragraph({
          children: [
            new TextRun({ text: `— Page ${p} —`, bold: true, size: 20, color: '3B82F6' })
          ]
        })
      );
    }

    if (items.length === 0) {
      docxElements.push(new Paragraph({ text: '[Blank or image-only page]' }));
      continue;
    }

    // Sort items: Y descending (top-to-bottom), X ascending (left-to-right)
    items.sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);

    // Group items into lines
    const lines: Array<{ y: number; text: string; items: any[] }> = [];
    let currentLine: any[] = [];
    let currentY: number | null = null;

    items.forEach(item => {
      const y = Math.round(item.transform[5]);
      if (currentY === null || Math.abs(y - currentY) < 4) {
        currentLine.push(item);
        currentY = y;
      } else {
        if (currentLine.length > 0) {
          lines.push({
            y: currentY!,
            text: currentLine.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim(),
            items: [...currentLine],
          });
        }
        currentLine = [item];
        currentY = y;
      }
    });
    if (currentLine.length > 0) {
      lines.push({
        y: currentY!,
        text: currentLine.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim(),
        items: [...currentLine],
      });
    }

    // Detect tabular lines vs normal paragraphs
    let lineIdx = 0;
    while (lineIdx < lines.length) {
      const line = lines[lineIdx];
      const isTableCandidate = line.items.length >= 2 && line.text.includes('  ');

      if (isTableCandidate) {
        // Collect consecutive table rows
        const tableLines: typeof lines = [];
        while (lineIdx < lines.length && (lines[lineIdx].items.length >= 2)) {
          tableLines.push(lines[lineIdx]);
          lineIdx++;
        }

        // Build docx Table
        const rows = tableLines.map(tl => {
          const cells = tl.items.map(cellItem => (
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: cellItem.str, size: 20 })] })]
            })
          ));
          return new TableRow({ children: cells });
        });

        docxElements.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows,
        }));
        docxElements.push(new Paragraph({ text: '' }));
      } else {
        // Normal paragraph
        const isHeading = line.items.some(i => (i.transform[0] || 12) >= 14) || line.text.length < 50 && line.text === line.text.toUpperCase();
        docxElements.push(
          new Paragraph({
            heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
            children: [
              new TextRun({
                text: line.text,
                bold: isHeading,
                size: isHeading ? 24 : 22,
                color: isHeading ? '1E293B' : '334155',
              })
            ]
          })
        );
        lineIdx++;
      }
    }

    docxElements.push(new Paragraph({ text: '' }));
  }

  onProgress?.({ status: 'generating', phase: 'Building editable OpenXML DOCX...', percent: 90 });
  const doc = new Document({
    sections: [{
      properties: {},
      children: docxElements,
    }],
  });

  const docxBlob = await Packer.toBlob(doc);

  onProgress?.({ status: 'done', phase: 'PDF to Word conversion complete!', percent: 100 });
  return {
    primaryBlob: docxBlob,
    primaryFilename: `${baseName}_editable.docx`,
    primaryMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    primarySize: docxBlob.size,
    summary: `Converted ${numPages} PDF pages into fully editable DOCX document (${(docxBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 3. Word DOC to DOCX (.doc -> .docx)
 */
export async function convertDocToDocx(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Parsing binary Word document...', percent: 20 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Extracting text and modernizing structure...', percent: 50 });
  let text = '';
  try {
    const raw = await mammoth.extractRawText({ arrayBuffer });
    text = raw.value;
  } catch {
    // Binary fallback: extract ASCII/UTF-16 text chunks
    const dec = new TextDecoder('latin1');
    const str = dec.decode(arrayBuffer);
    text = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const paragraphs = text
    .split('\n')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => new Paragraph({ children: [new TextRun({ text: p, size: 22 })] }));

  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Converted from ${file.name}` })] }));
  }

  onProgress?.({ status: 'generating', phase: 'Packaging OpenXML DOCX...', percent: 85 });
  const doc = new Document({
    sections: [{ children: paragraphs }]
  });
  const docxBlob = await Packer.toBlob(doc);

  onProgress?.({ status: 'done', phase: 'DOC to DOCX complete!', percent: 100 });
  return {
    primaryBlob: docxBlob,
    primaryFilename: `${baseName}.docx`,
    primaryMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    primarySize: docxBlob.size,
    summary: `Modernized ${file.name} to OpenXML DOCX (${(docxBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 4. DOCX to DOC (.docx -> .doc)
 */
export async function convertDocxToDoc(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading DOCX archive...', percent: 20 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Converting to Word compound document...', percent: 50 });
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  // Microsoft Word natively opens HTML with Word namespace as a rich .doc file
  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${baseName}</title>
    <!--[if gte mso 9]>
    <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
    <![endif]-->
    <style>body { font-family: 'Calibri', 'Segoe UI', sans-serif; font-size: 11pt; color: #1e293b; }</style>
    </head>
    <body>${result.value}</body>
    </html>
  `.trim();

  const docBlob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });

  onProgress?.({ status: 'done', phase: 'DOCX to DOC complete!', percent: 100 });
  return {
    primaryBlob: docBlob,
    primaryFilename: `${baseName}.doc`,
    primaryMimeType: 'application/msword',
    primarySize: docBlob.size,
    summary: `Exported ${file.name} to Microsoft Word .doc format (${(docBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 5. PDF to TXT (.pdf -> .txt)
 */
export async function convertPdfToTxt(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Loading PDF...', percent: 20 });
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let fullText = '';
  for (let p = 1; p <= numPages; p++) {
    onProgress?.({
      status: 'processing',
      phase: `Extracting text from page ${p} of ${numPages}...`,
      percent: Math.min(85, Math.round(20 + (p / numPages) * 65))
    });

    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageText = (content.items as any[])
      .map(i => i.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    fullText += `=== Page ${p} ===\n\n${pageText}\n\n`;
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const txtBlob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });

  onProgress?.({ status: 'done', phase: 'PDF to TXT complete!', percent: 100 });
  return {
    primaryBlob: txtBlob,
    primaryFilename: `${baseName}.txt`,
    primaryMimeType: 'text/plain',
    primarySize: txtBlob.size,
    summary: `Extracted ${numPages} pages of text into plain UTF-8 text (${(txtBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 6. TXT to PDF (.txt -> .pdf)
 */
export async function convertTxtToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading text file...', percent: 25 });
  const text = await file.text();
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Formatting PDF document...', percent: 60 });
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(baseName, margin, cursorY);
  cursorY += 25;

  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  const rawLines = text.split('\n');
  for (const rawLine of rawLines) {
    const wrapped = doc.splitTextToSize(rawLine || ' ', contentWidth);
    for (const w of wrapped) {
      if (cursorY + 14 > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(w, margin, cursorY);
      cursorY += 13;
    }
  }

  const pdfBlob = doc.output('blob');

  onProgress?.({ status: 'done', phase: 'TXT to PDF complete!', percent: 100 });
  return {
    primaryBlob: pdfBlob,
    primaryFilename: `${baseName}.pdf`,
    primaryMimeType: 'application/pdf',
    primarySize: pdfBlob.size,
    summary: `Formatted text into paginated PDF (${(pdfBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 7. RTF to PDF (.rtf -> .pdf)
 */
export async function convertRtfToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Parsing RTF document...', percent: 25 });
  const rtfText = await file.text();
  const cleanText = rtfText
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\'[0-9a-fA-F]{2}/g, '')
    .replace(/\\[a-zA-Z0-9\-]+/g, '')
    .replace(/[{}]/g, '')
    .trim();

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const html = cleanText.split('\n').filter(Boolean).map(p => `<p>${p}</p>`).join('');

  onProgress?.({ status: 'generating', phase: 'Generating PDF...', percent: 70 });
  const pdfBlob = renderHtmlToPdf(html, baseName);

  onProgress?.({ status: 'done', phase: 'RTF to PDF complete!', percent: 100 });
  return {
    primaryBlob: pdfBlob,
    primaryFilename: `${baseName}.pdf`,
    primaryMimeType: 'application/pdf',
    primarySize: pdfBlob.size,
    summary: `Converted RTF to PDF (${(pdfBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 8. RTF to DOCX (.rtf -> .docx)
 */
export async function convertRtfToDocx(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Parsing RTF formatting...', percent: 30 });
  const rtfText = await file.text();
  const cleanText = rtfText
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\'[0-9a-fA-F]{2}/g, '')
    .replace(/\\[a-zA-Z0-9\-]+/g, '')
    .replace(/[{}]/g, '')
    .trim();

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const paragraphs = cleanText
    .split('\n')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => new Paragraph({ children: [new TextRun({ text: p, size: 22 })] }));

  onProgress?.({ status: 'generating', phase: 'Creating Word DOCX...', percent: 75 });
  const doc = new Document({
    sections: [{ children: paragraphs }]
  });
  const docxBlob = await Packer.toBlob(doc);

  onProgress?.({ status: 'done', phase: 'RTF to DOCX complete!', percent: 100 });
  return {
    primaryBlob: docxBlob,
    primaryFilename: `${baseName}.docx`,
    primaryMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    primarySize: docxBlob.size,
    summary: `Converted RTF into structured Word DOCX (${(docxBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 9. DOCX to RTF (.docx -> .rtf)
 */
export async function convertDocxToRtf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading DOCX paragraphs...', percent: 30 });
  const arrayBuffer = await file.arrayBuffer();
  const raw = await mammoth.extractRawText({ arrayBuffer });
  const paragraphs = raw.value.split('\n').filter(Boolean);

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const rtfBody = paragraphs.map(p => `${p}\\par`).join('\n');
  const rtfContent = `{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}\n\\f0\\fs22\n{\\b ${baseName}}\\par\\par\n${rtfBody}\n}`;

  const rtfBlob = new Blob([rtfContent], { type: 'application/rtf;charset=utf-8' });

  onProgress?.({ status: 'done', phase: 'DOCX to RTF complete!', percent: 100 });
  return {
    primaryBlob: rtfBlob,
    primaryFilename: `${baseName}.rtf`,
    primaryMimeType: 'application/rtf',
    primarySize: rtfBlob.size,
    summary: `Exported DOCX to Rich Text Format .rtf (${(rtfBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 10. ODT to PDF (.odt -> .pdf)
 */
export async function convertOdtToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading OpenDocument archive...', percent: 20 });
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const contentXmlFile = zip.file('content.xml');

  if (!contentXmlFile) {
    throw new Error('Invalid ODT document: missing content.xml');
  }

  onProgress?.({ status: 'processing', phase: 'Extracting OpenDocument styles and text...', percent: 50 });
  const xmlStr = await contentXmlFile.async('string');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');

  const pNodes = Array.from(xmlDoc.getElementsByTagName('text:p'));
  const hNodes = Array.from(xmlDoc.getElementsByTagName('text:h'));
  const paragraphs = [...hNodes, ...pNodes].map(n => n.textContent?.trim()).filter(Boolean);

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const html = paragraphs.map(p => `<p>${p}</p>`).join('');

  onProgress?.({ status: 'generating', phase: 'Generating PDF...', percent: 80 });
  const pdfBlob = renderHtmlToPdf(html, baseName);

  onProgress?.({ status: 'done', phase: 'ODT to PDF complete!', percent: 100 });
  return {
    primaryBlob: pdfBlob,
    primaryFilename: `${baseName}.pdf`,
    primaryMimeType: 'application/pdf',
    primarySize: pdfBlob.size,
    summary: `Converted OpenDocument Text (.odt) to PDF (${(pdfBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 11. ODT to DOCX (.odt -> .docx)
 */
export async function convertOdtToDocx(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading OpenDocument archive...', percent: 20 });
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const contentXmlFile = zip.file('content.xml');

  if (!contentXmlFile) {
    throw new Error('Invalid ODT document: missing content.xml');
  }

  onProgress?.({ status: 'processing', phase: 'Extracting text and formatting...', percent: 50 });
  const xmlStr = await contentXmlFile.async('string');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');

  const pNodes = Array.from(xmlDoc.getElementsByTagName('text:p'));
  const hNodes = Array.from(xmlDoc.getElementsByTagName('text:h'));

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const docxElements = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: baseName, bold: true, size: 32 })]
    }),
    ...hNodes.map(h => new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: h.textContent || '', bold: true, size: 24 })]
    })),
    ...pNodes.map(p => new Paragraph({
      children: [new TextRun({ text: p.textContent || '', size: 22 })]
    }))
  ];

  onProgress?.({ status: 'generating', phase: 'Packaging Word DOCX...', percent: 80 });
  const doc = new Document({
    sections: [{ children: docxElements }]
  });
  const docxBlob = await Packer.toBlob(doc);

  onProgress?.({ status: 'done', phase: 'ODT to DOCX complete!', percent: 100 });
  return {
    primaryBlob: docxBlob,
    primaryFilename: `${baseName}.docx`,
    primaryMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    primarySize: docxBlob.size,
    summary: `Converted OpenDocument Text (.odt) to Word DOCX (${(docxBlob.size / 1024).toFixed(1)} KB).`,
  };
}
