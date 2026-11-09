import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import JSZip from 'jszip';
import { ConversionProgressState, ConversionResult, ConvertedOutputItem } from '../../types/conversion';

type ProgressCallback = (state: ConversionProgressState) => void;

/**
 * Loads an image File into an Image object to read its natural width, height, and data URL
 */
function loadImageData(file: File): Promise<{ width: number; height: number; dataUrl: string; format: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const ext = file.name.split('.').pop()?.toUpperCase() || 'JPEG';
        const format = ext === 'PNG' ? 'PNG' : ext === 'WEBP' ? 'WEBP' : 'JPEG';
        resolve({
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 600,
          dataUrl,
          format,
        });
      };
      img.onerror = () => reject(new Error(`Failed to decode image "${file.name}"`));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`));
    reader.readAsDataURL(file);
  });
}

/**
 * 1. Single Image to PDF (JPG, PNG, WEBP, BMP, TIFF)
 */
export async function convertImageToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Inspecting image dimensions...', percent: 25 });
  const { width, height, dataUrl, format } = await loadImageData(file);

  onProgress?.({ status: 'generating', phase: 'Wrapping image into vector PDF...', percent: 65 });
  const orientation = width >= height ? 'landscape' : 'portrait';
  // Use exact image pixel dimensions in pt for pixel-perfect preservation
  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: [width, height],
  });

  doc.addImage(dataUrl, format, 0, 0, width, height);

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const pdfBlob = doc.output('blob');

  onProgress?.({ status: 'done', phase: 'Image to PDF complete!', percent: 100 });
  return {
    primaryBlob: pdfBlob,
    primaryFilename: `${baseName}.pdf`,
    primaryMimeType: 'application/pdf',
    primarySize: pdfBlob.size,
    summary: `Wrapped ${file.name} (${width}×${height}px) into single-page PDF (${(pdfBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 2. Multiple Images to Single Merged PDF
 */
export async function convertMultipleImagesToPdf(
  files: File[],
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  if (files.length === 0) throw new Error('No files provided for conversion');

  onProgress?.({ status: 'validating', phase: `Validating ${files.length} images...`, percent: 15 });

  let doc: jsPDF | null = null;
  const baseName = files[0].name.replace(/\.[^/.]+$/, '') + `_and_${files.length - 1}_more`;

  for (let i = 0; i < files.length; i++) {
    onProgress?.({
      status: 'generating',
      phase: `Adding image ${i + 1} of ${files.length} to PDF...`,
      percent: Math.min(85, Math.round(20 + ((i + 1) / files.length) * 65))
    });

    const file = files[i];
    const { width, height, dataUrl, format } = await loadImageData(file);
    const orientation = width >= height ? 'landscape' : 'portrait';

    if (i === 0) {
      doc = new jsPDF({
        orientation,
        unit: 'pt',
        format: [width, height],
      });
      doc.addImage(dataUrl, format, 0, 0, width, height);
    } else if (doc) {
      doc.addPage([width, height], orientation);
      doc.addImage(dataUrl, format, 0, 0, width, height);
    }
  }

  const pdfBlob = doc ? doc.output('blob') : new Blob();

  onProgress?.({ status: 'done', phase: `Merged ${files.length} images into PDF!`, percent: 100 });
  return {
    primaryBlob: pdfBlob,
    primaryFilename: `merged_${files.length}_images.pdf`,
    primaryMimeType: 'application/pdf',
    primarySize: pdfBlob.size,
    summary: `Combined ${files.length} images into a single multi-page PDF document (${(pdfBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 3. PDF Pages to Images (JPG or PNG)
 * Renders every page of the PDF to high-resolution images, with individual and ZIP download.
 */
export async function convertPdfToImages(
  file: File,
  format: 'jpg' | 'png' = 'png',
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Loading PDF document...', percent: 15 });
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const items: ConvertedOutputItem[] = [];
  const zip = new JSZip();

  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const ext = format === 'jpg' ? 'jpg' : 'png';

  for (let p = 1; p <= numPages; p++) {
    onProgress?.({
      status: 'generating',
      phase: `Rendering page ${p} of ${numPages} (${format.toUpperCase()})...`,
      percent: Math.min(85, Math.round(20 + (p / numPages) * 65))
    });

    const page = await pdf.getPage(p);
    // Render at 2.0x scale (150-300 DPI high resolution)
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // White page background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: ctx as any,
        viewport,
        canvas,
      }).promise;
    }

    const pageBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), mimeType, 0.92);
    });

    const pageFilename = `${baseName}_page_${p}.${ext}`;
    const pageUrl = URL.createObjectURL(pageBlob);

    items.push({
      id: `page_${p}`,
      name: pageFilename,
      size: pageBlob.size,
      blob: pageBlob,
      mimeType,
      url: pageUrl,
      previewUrl: pageUrl,
      pageOrSlideIndex: p,
    });

    zip.file(pageFilename, pageBlob);
  }

  onProgress?.({ status: 'generating', phase: 'Packaging ZIP archive...', percent: 90 });
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFilename = `${baseName}_pages_${format.toUpperCase()}.zip`;

  // If 1 page, primary is the page itself; if multiple, primary is the ZIP archive
  const primaryBlob = numPages === 1 ? items[0].blob : zipBlob;
  const primaryFilename = numPages === 1 ? items[0].name : zipFilename;
  const primaryMimeType = numPages === 1 ? items[0].mimeType : 'application/zip';

  onProgress?.({ status: 'done', phase: `Extracted ${numPages} pages!`, percent: 100 });
  return {
    primaryBlob,
    primaryFilename,
    primaryMimeType,
    primarySize: primaryBlob.size,
    items,
    zipBlob: numPages > 1 ? zipBlob : undefined,
    zipFilename: numPages > 1 ? zipFilename : undefined,
    zipSize: numPages > 1 ? zipBlob.size : undefined,
    summary: `Rendered ${numPages} page(s) to ${format.toUpperCase()} images at 2× print resolution.`,
  };
}
