import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { ConversionProgressState, ConversionResult } from '../../types/conversion';

type ProgressCallback = (state: ConversionProgressState) => void;

export interface SpreadsheetImage {
  id: string;
  sheetName?: string;
  fromCol?: number;
  fromRow?: number;
  toCol?: number;
  toRow?: number;
  dataUrl: string;
  format: 'PNG' | 'JPEG' | 'WEBP';
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Converts a Uint8Array into a base64 string safely without call stack overflow
 */
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

/**
 * Extracts width and height from PNG or JPEG byte streams synchronously
 */
function getDimensionsFromBytes(bytes: Uint8Array, format: 'PNG' | 'JPEG' | 'WEBP'): { width: number; height: number; aspectRatio: number } {
  try {
    if (format === 'PNG' && bytes.length > 24) {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const width = view.getUint32(16);
      const height = view.getUint32(20);
      if (width > 0 && height > 0) {
        return { width, height, aspectRatio: width / height };
      }
    } else if (format === 'JPEG' && bytes.length > 20) {
      let i = 2;
      while (i < bytes.length - 8) {
        if (bytes[i] === 0xff) {
          const marker = bytes[i + 1];
          if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
            const height = (bytes[i + 5] << 8) | bytes[i + 6];
            const width = (bytes[i + 7] << 8) | bytes[i + 8];
            if (width > 0 && height > 0) {
              return { width, height, aspectRatio: width / height };
            }
          }
          const len = (bytes[i + 2] << 8) | bytes[i + 3];
          i += 2 + len;
        } else {
          i++;
        }
      }
    }
  } catch (e) {
    // Fallback to safe defaults
  }
  return { width: 300, height: 200, aspectRatio: 1.5 };
}

/**
 * Scans raw byte buffer for embedded PNG and JPEG files (used for legacy binary .xls / BIFF8)
 */
function extractRawImagesFromBuffer(bytes: Uint8Array): SpreadsheetImage[] {
  const images: SpreadsheetImage[] = [];

  // 1. Scan for PNG: 89 50 4E 47 0D 0A 1A 0A
  for (let i = 0; i < bytes.length - 8; i++) {
    if (
      bytes[i] === 0x89 && bytes[i + 1] === 0x50 && bytes[i + 2] === 0x4e && bytes[i + 3] === 0x47 &&
      bytes[i + 4] === 0x0d && bytes[i + 5] === 0x0a && bytes[i + 6] === 0x1a && bytes[i + 7] === 0x0a
    ) {
      // Find IEND chunk: 49 45 4E 44 AE 42 60 82
      for (let j = i + 8; j < bytes.length - 8; j++) {
        if (
          bytes[j] === 0x49 && bytes[j + 1] === 0x45 && bytes[j + 2] === 0x4e && bytes[j + 3] === 0x44 &&
          bytes[j + 4] === 0xae && bytes[j + 5] === 0x42 && bytes[j + 6] === 0x60 && bytes[j + 7] === 0x82
        ) {
          const pngBytes = bytes.subarray(i, j + 8);
          const dataUrl = `data:image/png;base64,${uint8ToBase64(pngBytes)}`;
          const dims = getDimensionsFromBytes(pngBytes, 'PNG');
          images.push({
            id: `raw_img_${images.length + 1}`,
            format: 'PNG',
            dataUrl,
            width: dims.width,
            height: dims.height,
            aspectRatio: dims.aspectRatio,
          });
          i = j + 8;
          break;
        }
      }
    }
  }

  // 2. Scan for JPEG: FF D8 FF
  for (let i = 0; i < bytes.length - 3; i++) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0xd8 && bytes[i + 2] === 0xff) {
      // Find EOI marker: FF D9
      for (let j = i + 3; j < bytes.length - 1; j++) {
        if (bytes[j] === 0xff && bytes[j + 1] === 0xd9) {
          const jpegBytes = bytes.subarray(i, j + 2);
          if (jpegBytes.length > 500) {
            const dataUrl = `data:image/jpeg;base64,${uint8ToBase64(jpegBytes)}`;
            const dims = getDimensionsFromBytes(jpegBytes, 'JPEG');
            images.push({
              id: `raw_img_${images.length + 1}`,
              format: 'JPEG',
              dataUrl,
              width: dims.width,
              height: dims.height,
              aspectRatio: dims.aspectRatio,
            });
            i = j + 2;
            break;
          }
        }
      }
    }
  }

  return images;
}

/**
 * Extracts embedded images and drawing anchors from an Excel workbook (.xlsx / .xls)
 */
async function extractSpreadsheetImages(arrayBuffer: ArrayBuffer, fileName: string): Promise<SpreadsheetImage[]> {
  const bytes = new Uint8Array(arrayBuffer);
  const isZip = bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07);

  // If not a ZIP package (legacy BIFF8 .xls binary compound file), scan for embedded byte streams
  if (!isZip) {
    return extractRawImagesFromBuffer(bytes);
  }

  const images: SpreadsheetImage[] = [];

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const mediaMap = new Map<string, SpreadsheetImage>();

    // 1. Collect all media images from xl/media/
    for (const [path, fileObj] of Object.entries(zip.files)) {
      if (fileObj.dir) continue;
      const lower = path.toLowerCase();
      if (lower.match(/\.(png|jpg|jpeg|webp|bmp)$/)) {
        const fileBytes = await fileObj.async('uint8array');
        let format: 'PNG' | 'JPEG' | 'WEBP' = 'PNG';
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) format = 'JPEG';
        else if (lower.endsWith('.webp')) format = 'WEBP';

        const mime = format === 'JPEG' ? 'image/jpeg' : format === 'WEBP' ? 'image/webp' : 'image/png';
        const dataUrl = `data:${mime};base64,${uint8ToBase64(fileBytes)}`;
        const dims = getDimensionsFromBytes(fileBytes, format);

        mediaMap.set(path, {
          id: path,
          format,
          dataUrl,
          width: dims.width,
          height: dims.height,
          aspectRatio: dims.aspectRatio,
        });
      }
    }

    if (mediaMap.size === 0) {
      return [];
    }

    // 2. Map sheet name -> worksheet xml path
    const sheetXmlMap = new Map<string, string>();
    const wbXml = await zip.file('xl/workbook.xml')?.async('text');
    const wbRelsXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('text');

    if (wbXml && wbRelsXml) {
      const relMatches = wbRelsXml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g);
      const rels = new Map<string, string>();
      for (const m of relMatches) {
        let t = m[2];
        if (!t.startsWith('xl/')) t = 'xl/' + t.replace(/^\//, '');
        rels.set(m[1], t);
      }

      const sheetMatches = wbXml.matchAll(/<sheet[^>]+name="([^"]+)"[^>]+r:id="([^"]+)"/g);
      for (const sm of sheetMatches) {
        const sheetPath = rels.get(sm[2]);
        if (sheetPath) {
          sheetXmlMap.set(sm[1], sheetPath);
        }
      }
    }

    // 3. For each worksheet, parse drawing relationships and anchors
    const assignedMediaPaths = new Set<string>();

    for (const [sheetName, sheetXmlPath] of sheetXmlMap.entries()) {
      // Find worksheet rels file: e.g. xl/worksheets/_rels/sheet1.xml.rels
      const parts = sheetXmlPath.split('/');
      const fileNameOnly = parts.pop() || '';
      const dirPath = parts.join('/');
      const sheetRelsPath = `${dirPath}/_rels/${fileNameOnly}.rels`;
      const sheetRelsXml = await zip.file(sheetRelsPath)?.async('text');

      if (!sheetRelsXml) continue;

      // Find drawing relationship target: e.g. ../drawings/drawing1.xml
      const drawingRelMatches = sheetRelsXml.matchAll(/<Relationship[^>]+Type="[^"]*drawing"[^>]+Target="([^"]+)"/g);
      for (const drm of drawingRelMatches) {
        let drawingPath = drm[1];
        if (drawingPath.startsWith('../')) {
          drawingPath = 'xl/' + drawingPath.replace(/^\.\.\//, '');
        } else if (!drawingPath.startsWith('xl/')) {
          drawingPath = `${dirPath}/${drawingPath}`;
        }

        const drawingXml = await zip.file(drawingPath)?.async('text');
        const drawingRelsPath = drawingPath.replace(/([^/]+)$/, '_rels/$1.rels');
        const drawingRelsXml = await zip.file(drawingRelsPath)?.async('text');

        if (!drawingXml) continue;

        // Map rId -> media path in drawing rels
        const drawingMediaMap = new Map<string, string>();
        if (drawingRelsXml) {
          const dRels = drawingRelsXml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g);
          for (const drm2 of dRels) {
            let target = drm2[2];
            if (target.startsWith('../')) {
              target = 'xl/' + target.replace(/^\.\.\//, '');
            } else if (!target.startsWith('xl/')) {
              target = 'xl/drawings/' + target;
            }
            drawingMediaMap.set(drm2[1], target);
          }
        }

        // Parse anchors in drawingXml (twoCellAnchor, oneCellAnchor, absoluteAnchor)
        const anchorBlocks = drawingXml.match(/<xdr:(?:twoCellAnchor|oneCellAnchor|absoluteAnchor)[\s\S]*?<\/xdr:(?:twoCellAnchor|oneCellAnchor|absoluteAnchor)>/g) || [];

        for (const block of anchorBlocks) {
          const colFrom = block.match(/<xdr:from>[\s\S]*?<xdr:col>(\d+)<\/xdr:col>/);
          const rowFrom = block.match(/<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/);
          const colTo = block.match(/<xdr:to>[\s\S]*?<xdr:col>(\d+)<\/xdr:col>/);
          const rowTo = block.match(/<xdr:to>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/);
          const blip = block.match(/r:embed="([^"]+)"/) || block.match(/embed="([^"]+)"/);

          if (blip) {
            const rId = blip[1];
            const mediaPath = drawingMediaMap.get(rId);
            if (mediaPath && mediaMap.has(mediaPath)) {
              const baseImg = mediaMap.get(mediaPath)!;
              images.push({
                ...baseImg,
                id: `${sheetName}_${rId}_${images.length + 1}`,
                sheetName,
                fromCol: colFrom ? parseInt(colFrom[1], 10) : undefined,
                fromRow: rowFrom ? parseInt(rowFrom[1], 10) : undefined,
                toCol: colTo ? parseInt(colTo[1], 10) : undefined,
                toRow: rowTo ? parseInt(rowTo[1], 10) : undefined,
              });
              assignedMediaPaths.add(mediaPath);
            }
          }
        }
      }
    }

    // 4. Any media image in xl/media/ that wasn't specifically anchored, include it so no image is lost
    for (const [mediaPath, img] of mediaMap.entries()) {
      if (!assignedMediaPaths.has(mediaPath)) {
        images.push({
          ...img,
          id: `unanchored_${images.length + 1}`,
          sheetName: undefined, // Will be rendered on the active sheet or at the end
        });
      }
    }

    return images;
  } catch (err) {
    console.warn('Error parsing XLSX media relationships:', err);
    // Fallback to raw byte scan
    return extractRawImagesFromBuffer(bytes);
  }
}

/**
 * Renders spreadsheet matrix rows and embedded images into a paginated PDF document
 */
function renderSpreadsheetToPdf(
  wb: XLSX.WorkBook, 
  title: string, 
  images: SpreadsheetImage[] = []
): Blob {
  // Landscape A4 for wide tabular data (841.89 pt x 595.28 pt)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let isFirstPage = true;
  const renderedImageIds = new Set<string>();

  wb.SheetNames.forEach((sheetName, sheetIdx) => {
    const ws = wb.Sheets[sheetName];
    const data: any[][] = ws ? XLSX.utils.sheet_to_json(ws, { header: 1 }) : [];

    // Filter images that belong to this sheet, or unassigned images on the first sheet
    const sheetImages = images.filter(img => 
      img.sheetName === sheetName || 
      (!img.sheetName && sheetIdx === 0)
    );

    // If both data and images are empty, skip sheet
    if (data.length === 0 && sheetImages.length === 0) return;

    if (!isFirstPage) {
      doc.addPage([pageWidth, pageHeight], 'landscape');
    }
    isFirstPage = false;

    let cursorY = margin;

    // Sheet Title & Tab Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`${title} • Sheet: ${sheetName}`, margin, cursorY);
    cursorY += 24;

    // 1. Top Header / Logo Images (anchored to row <= 1, or first unassociated banner image on sheet 0)
    const topImages = sheetImages.filter(img => 
      (img.fromRow !== undefined && img.fromRow <= 1) || 
      (img.fromRow === undefined && sheetIdx === 0 && img.id === 'raw_img_1' && img.aspectRatio > 1.2)
    );
    for (const img of topImages) {
      const maxH = 90;
      const targetH = Math.min(img.height || 60, maxH);
      const targetW = img.aspectRatio ? Math.min(targetH * img.aspectRatio, contentWidth) : Math.min(img.width || 140, 240);

      if (cursorY + targetH > pageHeight - margin - 30) {
        doc.addPage([pageWidth, pageHeight], 'landscape');
        cursorY = margin;
      }

      try {
        doc.addImage(img.dataUrl, img.format, margin, cursorY, targetW, targetH);
        cursorY += targetH + 14;
        renderedImageIds.add(img.id);
      } catch (e) {
        console.warn('Failed to render top image in spreadsheet:', e);
      }
    }

    // 2. Render Table Data with inline image support
    if (data.length > 0) {
      // Determine number of columns and truncate to reasonable display width
      const maxCols = Math.min(Math.max(...data.map(row => (Array.isArray(row) ? row.length : 0))), 12);
      if (maxCols > 0) {
        const colWidth = contentWidth / maxCols;
        const defaultRowHeight = 20;

        data.forEach((row, rowIdx) => {
          // Check for images anchored to this row
          const rowImages = sheetImages.filter(img => !renderedImageIds.has(img.id) && img.fromRow === rowIdx);
          const hasRowImages = rowImages.length > 0;
          const maxImgH = hasRowImages ? Math.max(...rowImages.map(img => Math.min(img.height || 45, 80))) : 0;
          const actualRowHeight = hasRowImages ? Math.max(defaultRowHeight, maxImgH + 8) : defaultRowHeight;

          // Check page break
          if (cursorY + actualRowHeight > pageHeight - margin - 25) {
            doc.addPage([pageWidth, pageHeight], 'landscape');
            cursorY = margin;

            // Repeat title header on new page
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(100, 116, 139);
            doc.text(`${title} (${sheetName} cont.)`, margin, cursorY);
            cursorY += 18;
          }

          const isHeader = rowIdx === 0;

          // Row background
          if (isHeader) {
            doc.setFillColor(15, 23, 42); // slate-900
            doc.rect(margin, cursorY, contentWidth, actualRowHeight, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
          } else {
            doc.setFillColor(rowIdx % 2 === 0 ? 255 : 248, rowIdx % 2 === 0 ? 255 : 250, rowIdx % 2 === 0 ? 255 : 252);
            doc.rect(margin, cursorY, contentWidth, actualRowHeight, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
          }

          // Border lines
          doc.setDrawColor(226, 232, 240); // slate-200
          doc.setLineWidth(0.75);
          doc.rect(margin, cursorY, contentWidth, actualRowHeight, 'S');

          // Cell text
          for (let colIdx = 0; colIdx < maxCols; colIdx++) {
            const val = Array.isArray(row) ? row[colIdx] : '';
            const cellText = val !== undefined && val !== null ? String(val).trim() : '';
            const cellX = margin + colIdx * colWidth;

            // Draw vertical cell divider
            if (colIdx > 0) {
              doc.line(cellX, cursorY, cellX, cursorY + actualRowHeight);
            }

            const truncated = doc.splitTextToSize(cellText, colWidth - 8)[0] || '';
            const textY = isHeader ? cursorY + 13 : cursorY + (hasRowImages ? 14 : 13);
            doc.text(truncated, cellX + 4, textY);
          }

          // Draw anchored row images inside their cell
          if (hasRowImages) {
            for (const img of rowImages) {
              const colIdx = Math.min(img.fromCol || 0, maxCols - 1);
              const cellX = margin + colIdx * colWidth;
              const maxCellW = colWidth - 6;
              const maxCellH = actualRowHeight - 6;
              let targetW = maxCellW;
              let targetH = maxCellH;

              if (img.aspectRatio) {
                if (maxCellW / img.aspectRatio <= maxCellH) {
                  targetH = maxCellW / img.aspectRatio;
                } else {
                  targetW = maxCellH * img.aspectRatio;
                }
              }

              try {
                doc.addImage(img.dataUrl, img.format, cellX + (colWidth - targetW) / 2, cursorY + (actualRowHeight - targetH) / 2, targetW, targetH);
                renderedImageIds.add(img.id);
              } catch (e) {
                console.warn('Failed to draw cell image:', e);
              }
            }
          }

          cursorY += actualRowHeight;
        });
      }
    }

    // 3. Render Remaining Sheet Images (Charts / Floating Graphics / Below-Table Figures)
    const remainingImages = sheetImages.filter(img => !renderedImageIds.has(img.id));
    if (remainingImages.length > 0) {
      cursorY += 16;

      if (data.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        doc.text(`Sheet Figures & Illustrations (${sheetName})`, margin, cursorY);
        cursorY += 14;
      }

      for (const img of remainingImages) {
        const maxW = Math.min(contentWidth, 540);
        const maxH = 280;

        let targetW = Math.min(img.width || 360, maxW);
        let targetH = img.aspectRatio ? targetW / img.aspectRatio : Math.min(img.height || 220, maxH);

        if (targetH > maxH) {
          targetH = maxH;
          targetW = img.aspectRatio ? targetH * img.aspectRatio : targetW;
        }

        if (cursorY + targetH + 30 > pageHeight - margin - 20) {
          doc.addPage([pageWidth, pageHeight], 'landscape');
          cursorY = margin + 15;
        }

        try {
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.5);
          doc.rect(margin - 2, cursorY - 2, targetW + 4, targetH + 4, 'S');

          doc.addImage(img.dataUrl, img.format, margin, cursorY, targetW, targetH);
          cursorY += targetH + 18;
          renderedImageIds.add(img.id);
        } catch (e) {
          console.warn('Failed to render sheet figure:', e);
        }
      }
    }
  });

  // 4. Fallback: Any completely unrendered images in the entire workbook
  const unrendered = images.filter(img => !renderedImageIds.has(img.id));
  if (unrendered.length > 0) {
    doc.addPage([pageWidth, pageHeight], 'landscape');
    let cursorY = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`${title} • Embedded Workbook Figures`, margin, cursorY);
    cursorY += 24;

    for (const img of unrendered) {
      const maxW = Math.min(contentWidth, 540);
      const maxH = 280;
      let targetW = Math.min(img.width || 360, maxW);
      let targetH = img.aspectRatio ? targetW / img.aspectRatio : Math.min(img.height || 220, maxH);

      if (targetH > maxH) {
        targetH = maxH;
        targetW = img.aspectRatio ? targetH * img.aspectRatio : targetW;
      }

      if (cursorY + targetH + 30 > pageHeight - margin - 20) {
        doc.addPage([pageWidth, pageHeight], 'landscape');
        cursorY = margin + 15;
      }

      try {
        doc.addImage(img.dataUrl, img.format, margin, cursorY, targetW, targetH);
        cursorY += targetH + 18;
      } catch (e) {
        console.warn('Failed to render fallback image:', e);
      }
    }
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${p} of ${totalPages} • Generated by Zailo Graph Spreadsheet Engine`, pageWidth / 2, pageHeight - 15, { align: 'center' });
  }

  return doc.output('blob');
}

/**
 * 1. Excel XLSX to PDF (.xlsx -> .pdf)
 */
export async function convertXlsxToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading Excel workbook and media...', percent: 15 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Extracting embedded images and charts...', percent: 35 });
  const images = await extractSpreadsheetImages(arrayBuffer, file.name);

  onProgress?.({ status: 'processing', phase: 'Parsing worksheets and formulas...', percent: 60 });
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Rendering tables and images to PDF...', percent: 85 });
  const pdfBlob = renderSpreadsheetToPdf(wb, baseName, images);

  const imageCountNotice = images.length > 0 ? ` with ${images.length} embedded image(s)` : '';
  onProgress?.({ status: 'done', phase: 'Excel to PDF complete!', percent: 100 });
  return {
    primaryBlob: pdfBlob,
    primaryFilename: `${baseName}_sheets.pdf`,
    primaryMimeType: 'application/pdf',
    primarySize: pdfBlob.size,
    summary: `Converted ${wb.SheetNames.length} Excel sheet(s)${imageCountNotice} to formatted PDF (${(pdfBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 2. Excel XLS to PDF (.xls -> .pdf)
 */
export async function convertXlsToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  return convertXlsxToPdf(file, onProgress);
}

/**
 * 3. XLSX to CSV (.xlsx -> .csv)
 */
export async function convertXlsxToCsv(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading Excel worksheet...', percent: 25 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Extracting tabular data to CSV...', percent: 60 });
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];
  const csvText = XLSX.utils.sheet_to_csv(ws);

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const csvBlob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });

  onProgress?.({ status: 'done', phase: 'XLSX to CSV complete!', percent: 100 });
  return {
    primaryBlob: csvBlob,
    primaryFilename: `${baseName}.csv`,
    primaryMimeType: 'text/csv',
    primarySize: csvBlob.size,
    summary: `Exported ${firstSheetName} to standard RFC 4180 CSV (${(csvBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 4. XLS to CSV (.xls -> .csv)
 */
export async function convertXlsToCsv(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  return convertXlsxToCsv(file, onProgress);
}

/**
 * 5. CSV to XLSX (.csv -> .xlsx)
 */
export async function convertCsvToXlsx(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Parsing CSV dataset...', percent: 25 });
  const text = await file.text();

  onProgress?.({ status: 'processing', phase: 'Building Excel workbook...', percent: 60 });
  const wb = XLSX.read(text, { type: 'string' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Packaging OpenXML XLSX...', percent: 85 });
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const xlsxBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  onProgress?.({ status: 'done', phase: 'CSV to XLSX complete!', percent: 100 });
  return {
    primaryBlob: xlsxBlob,
    primaryFilename: `${baseName}.xlsx`,
    primaryMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    primarySize: xlsxBlob.size,
    summary: `Converted CSV into formatted Microsoft Excel workbook (${(xlsxBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 6. CSV to PDF (.csv -> .pdf)
 */
export async function convertCsvToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading CSV dataset...', percent: 25 });
  const text = await file.text();

  onProgress?.({ status: 'processing', phase: 'Parsing table rows...', percent: 55 });
  const wb = XLSX.read(text, { type: 'string' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Rendering PDF table...', percent: 80 });
  const pdfBlob = renderSpreadsheetToPdf(wb, baseName, []);

  onProgress?.({ status: 'done', phase: 'CSV to PDF complete!', percent: 100 });
  return {
    primaryBlob: pdfBlob,
    primaryFilename: `${baseName}_table.pdf`,
    primaryMimeType: 'application/pdf',
    primarySize: pdfBlob.size,
    summary: `Rendered tabular CSV to paginated PDF table (${(pdfBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 7. XLSX to ODS (.xlsx -> .ods)
 */
export async function convertXlsxToOds(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading Excel workbook...', percent: 25 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Converting to OpenDocument Spreadsheet...', percent: 60 });
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Packaging ODS archive...', percent: 85 });
  const buffer = XLSX.write(wb, { bookType: 'ods', type: 'array' });
  const odsBlob = new Blob([buffer], { type: 'application/vnd.oasis.opendocument.spreadsheet' });

  onProgress?.({ status: 'done', phase: 'XLSX to ODS complete!', percent: 100 });
  return {
    primaryBlob: odsBlob,
    primaryFilename: `${baseName}.ods`,
    primaryMimeType: 'application/vnd.oasis.opendocument.spreadsheet',
    primarySize: odsBlob.size,
    summary: `Converted Excel XLSX into OpenDocument Spreadsheet .ods (${(odsBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 8. ODS to XLSX (.ods -> .xlsx)
 */
export async function convertOdsToXlsx(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading OpenDocument Spreadsheet...', percent: 25 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Converting to Microsoft Excel...', percent: 60 });
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Packaging OpenXML XLSX...', percent: 85 });
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const xlsxBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  onProgress?.({ status: 'done', phase: 'ODS to XLSX complete!', percent: 100 });
  return {
    primaryBlob: xlsxBlob,
    primaryFilename: `${baseName}.xlsx`,
    primaryMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    primarySize: xlsxBlob.size,
    summary: `Converted OpenDocument Spreadsheet into Microsoft Excel XLSX (${(xlsxBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 9. Excel XLS to XLSX (.xls -> .xlsx)
 */
export async function convertXlsToXlsx(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading Excel 97-2003 workbook...', percent: 25 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Extracting worksheets and formulas...', percent: 60 });
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Packaging modern OpenXML XLSX...', percent: 85 });
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const xlsxBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  onProgress?.({ status: 'done', phase: 'XLS to XLSX complete!', percent: 100 });
  return {
    primaryBlob: xlsxBlob,
    primaryFilename: `${baseName}.xlsx`,
    primaryMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    primarySize: xlsxBlob.size,
    summary: `Converted legacy Excel XLS into modern Microsoft Excel XLSX with ${wb.SheetNames.length} sheet(s) (${(xlsxBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 10. Excel XLSX to XLS (.xlsx -> .xls)
 */
export async function convertXlsxToXls(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading Excel XLSX workbook...', percent: 25 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Converting workbook structures...', percent: 60 });
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Encoding binary BIFF8 XLS...', percent: 85 });
  const buffer = XLSX.write(wb, { bookType: 'biff8', type: 'array' });
  const xlsBlob = new Blob([buffer], { type: 'application/vnd.ms-excel' });

  onProgress?.({ status: 'done', phase: 'XLSX to XLS complete!', percent: 100 });
  return {
    primaryBlob: xlsBlob,
    primaryFilename: `${baseName}.xls`,
    primaryMimeType: 'application/vnd.ms-excel',
    primarySize: xlsBlob.size,
    summary: `Converted Microsoft Excel XLSX into legacy Excel 97-2003 XLS with ${wb.SheetNames.length} sheet(s) (${(xlsBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 11. CSV to XLS (.csv -> .xls)
 */
export async function convertCsvToXls(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Parsing CSV dataset...', percent: 25 });
  const text = await file.text();

  onProgress?.({ status: 'processing', phase: 'Building spreadsheet records...', percent: 60 });
  const wb = XLSX.read(text, { type: 'string' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Encoding binary BIFF8 XLS...', percent: 85 });
  const buffer = XLSX.write(wb, { bookType: 'biff8', type: 'array' });
  const xlsBlob = new Blob([buffer], { type: 'application/vnd.ms-excel' });

  onProgress?.({ status: 'done', phase: 'CSV to XLS complete!', percent: 100 });
  return {
    primaryBlob: xlsBlob,
    primaryFilename: `${baseName}.xls`,
    primaryMimeType: 'application/vnd.ms-excel',
    primarySize: xlsBlob.size,
    summary: `Converted CSV into legacy Excel 97-2003 XLS workbook (${(xlsBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 12. XLS to ODS (.xls -> .ods)
 */
export async function convertXlsToOds(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading Excel XLS workbook...', percent: 25 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Translating spreadsheet sheets...', percent: 60 });
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Packaging OpenDocument Spreadsheet...', percent: 85 });
  const buffer = XLSX.write(wb, { bookType: 'ods', type: 'array' });
  const odsBlob = new Blob([buffer], { type: 'application/vnd.oasis.opendocument.spreadsheet' });

  onProgress?.({ status: 'done', phase: 'XLS to ODS complete!', percent: 100 });
  return {
    primaryBlob: odsBlob,
    primaryFilename: `${baseName}.ods`,
    primaryMimeType: 'application/vnd.oasis.opendocument.spreadsheet',
    primarySize: odsBlob.size,
    summary: `Converted Excel XLS into OpenDocument Spreadsheet .ods (${(odsBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 13. ODS to XLS (.ods -> .xls)
 */
export async function convertOdsToXls(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading OpenDocument Spreadsheet...', percent: 25 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Converting to Microsoft Excel...', percent: 60 });
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Encoding binary BIFF8 XLS...', percent: 85 });
  const buffer = XLSX.write(wb, { bookType: 'biff8', type: 'array' });
  const xlsBlob = new Blob([buffer], { type: 'application/vnd.ms-excel' });

  onProgress?.({ status: 'done', phase: 'ODS to XLS complete!', percent: 100 });
  return {
    primaryBlob: xlsBlob,
    primaryFilename: `${baseName}.xls`,
    primaryMimeType: 'application/vnd.ms-excel',
    primarySize: xlsBlob.size,
    summary: `Converted OpenDocument Spreadsheet into Excel XLS (${(xlsBlob.size / 1024).toFixed(1)} KB).`,
  };
}
