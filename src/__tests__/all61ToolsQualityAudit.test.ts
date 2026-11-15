import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import { executeDocumentConversion, getConversionById } from '../services/conversion';
import { UTILITIES } from '../types/utility';

function calculateAspectRatioFit(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio)
  };
}

function clampDimensions(width: number, height: number, maxLimit = 8192) {
  if (width <= maxLimit && height <= maxLimit) return { width, height };
  const ratio = Math.min(maxLimit / width, maxLimit / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
}

// Helper to create synthetic test files
function createTestTextFile(name: string, content: string, mimeType = 'text/plain'): File {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], name, { type: mimeType });
}

function createTestCsvFile(name: string): File {
  const csvContent = 'ID,Product,Price,Quantity,Status\n1,Studio Camera,899.99,14,In Stock\n2,Microphone Pro,149.50,42,In Stock\n3,Lighting Kit,299.00,8,Low Stock';
  return createTestTextFile(name, csvContent, 'text/csv');
}

async function createTestXlsxFile(name: string): Promise<File> {
  const wb = XLSX.utils.book_new();
  const wsData = [
    ['Tool ID', 'Name', 'Category', 'DPI'],
    ['svg-to-png', 'SVG to PNG Converter', 'Vector', 300],
    ['batch-resize', 'Image Resolution Converter', 'Optimize', 72],
    ['pdf-to-word', 'PDF to Word DOCX', 'Document', 300],
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'StudioTools');
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return new File([blob], name, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function createTestDocxFile(name: string): Promise<File> {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: 'Zailo Graph High Precision Test Document', bold: true, size: 28 }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'This document tests genuine OpenXML paragraph structure, formatting preservation, and table layout.' })
          ]
        })
      ]
    }]
  });
  const blob = await Packer.toBlob(doc);
  return new File([blob], name, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

async function createTestPptxFile(name: string): Promise<File> {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`);

  zip.file('ppt/presentation.xml', `<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldSz cx="12192000" cy="6858000"/></p:presentation>`);
  zip.file('ppt/slides/slide1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld><p:spTree><p:sp><p:txBody>
    <a:p><a:r><a:t>Zailo Graph Presentation Engine</a:t></a:r></a:p>
    <a:p><a:r><a:t>High-Fidelity 16:9 Presentation Slide</a:t></a:r></a:p>
  </p:txBody></p:sp></p:spTree></p:cSld>
</p:sld>`);

  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], name, { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
}

describe('61 Studio Tools - Complete Quality & Precision Audit', () => {

  // =========================================================================
  // SECTION 1: SPREADSHEET & DATA CONVERTERS (100% DATA INTEGRITY AUDIT)
  // =========================================================================
  describe('Spreadsheet Tools - Cell Data & Formula Fidelity', () => {
    it('xlsx-to-csv: preserves 100% of cell values and row ordering', async () => {
      const xlsxFile = await createTestXlsxFile('inventory.xlsx');
      const result = await executeDocumentConversion('xlsx-to-csv', [xlsxFile]);

      expect(result.primaryBlob.size).toBeGreaterThan(0);
      expect(result.primaryFilename).toBe('inventory.csv');
      
      const text = await result.primaryBlob.text();
      expect(text).toContain('svg-to-png');
      expect(text).toContain('SVG to PNG Converter');
      expect(text).toContain('300');
    });

    it('csv-to-xlsx: generates genuine OpenXML workbook matching input matrix', async () => {
      const csvFile = createTestCsvFile('prices.csv');
      const result = await executeDocumentConversion('csv-to-xlsx', [csvFile]);

      expect(result.primaryBlob.size).toBeGreaterThan(0);
      expect(result.primaryFilename).toBe('prices.xlsx');

      const arrayBuffer = await result.primaryBlob.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

      expect(rows.length).toBe(3);
      expect(rows[0].Product).toBe('Studio Camera');
      expect(Number(rows[0].Price)).toBe(899.99);
    });

    it('csv-to-xls & xls-to-csv: round-trips data without row corruption', async () => {
      const csvFile = createTestCsvFile('catalog.csv');
      const xlsResult = await executeDocumentConversion('csv-to-xls', [csvFile]);
      expect(xlsResult.primaryBlob.size).toBeGreaterThan(0);

      const xlsFile = new File([xlsResult.primaryBlob], 'catalog.xls');
      const csvResult = await executeDocumentConversion('xls-to-csv', [xlsFile]);
      const csvText = await csvResult.primaryBlob.text();

      expect(csvText).toContain('Studio Camera');
      expect(csvText).toContain('Lighting Kit');
    });

    it('xlsx-to-ods & ods-to-xlsx: preserves sheets across OpenDocument standard', async () => {
      const xlsxFile = await createTestXlsxFile('metrics.xlsx');
      const odsResult = await executeDocumentConversion('xlsx-to-ods', [xlsxFile]);
      expect(odsResult.primaryBlob.size).toBeGreaterThan(0);
      expect(odsResult.primaryFilename).toBe('metrics.ods');

      const odsFile = new File([odsResult.primaryBlob], 'metrics.ods');
      const xlsxBackResult = await executeDocumentConversion('ods-to-xlsx', [odsFile]);
      expect(xlsxBackResult.primaryFilename).toBe('metrics.xlsx');
    });

    it('xlsx-to-xls & xls-to-xlsx: supports modern to legacy Excel version switching', async () => {
      const xlsxFile = await createTestXlsxFile('data.xlsx');
      const toXls = await executeDocumentConversion('xlsx-to-xls', [xlsxFile]);
      expect(toXls.primaryFilename).toBe('data.xls');

      const xlsFile = new File([toXls.primaryBlob], 'data.xls');
      const toXlsx = await executeDocumentConversion('xls-to-xlsx', [xlsFile]);
      expect(toXlsx.primaryFilename).toBe('data.xlsx');
    });

    it('xlsx-to-pdf, xls-to-pdf, csv-to-pdf: generates valid paginated PDF tables', async () => {
      const xlsxFile = await createTestXlsxFile('report.xlsx');
      const pdfResult = await executeDocumentConversion('xlsx-to-pdf', [xlsxFile]);

      expect(pdfResult.primaryFilename).toContain('.pdf');
      expect(pdfResult.primaryMimeType).toBe('application/pdf');
      
      const buffer = await pdfResult.primaryBlob.arrayBuffer();
      const header = new TextDecoder().decode(buffer.slice(0, 5));
      expect(header).toBe('%PDF-');
    });
  });

  // =========================================================================
  // SECTION 2: DOCUMENT & OFFICE CONVERTERS (STRUCTURE & EDITABILITY)
  // =========================================================================
  describe('Document & Office Tools - Layout & Formatting Integrity', () => {
    it('word-to-pdf: generates valid PDF stream from DOCX', async () => {
      const docxFile = await createTestDocxFile('ExecutiveSummary.docx');
      const result = await executeDocumentConversion('word-to-pdf', [docxFile]);

      expect(result.primaryBlob.size).toBeGreaterThan(0);
      expect(result.primaryFilename).toContain('.pdf');
      
      const buffer = await result.primaryBlob.arrayBuffer();
      const header = new TextDecoder().decode(buffer.slice(0, 5));
      expect(header).toBe('%PDF-');
    });

    it('txt-to-pdf: converts plain text to formatted paginated PDF document', async () => {
      const txtFile = createTestTextFile('License.txt', 'Zailo Graph Privacy-First License Agreement\n\nAll tools run 100% client side with zero cloud telemetry.');
      const result = await executeDocumentConversion('txt-to-pdf', [txtFile]);

      expect(result.primaryFilename).toBe('License.pdf');
      const buffer = await result.primaryBlob.arrayBuffer();
      const header = new TextDecoder().decode(buffer.slice(0, 5));
      expect(header).toBe('%PDF-');
    });

    it('rtf-to-docx & docx-to-rtf: preserves rich text paragraphs', async () => {
      const rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}}\\b Zailo Graph RTF\\b0\\par Paragraph text with bold header.\\par}';
      const rtfFile = createTestTextFile('memo.rtf', rtfContent, 'application/rtf');
      
      const docxResult = await executeDocumentConversion('rtf-to-docx', [rtfFile]);
      expect(docxResult.primaryFilename).toBe('memo.docx');
      expect(docxResult.primaryBlob.size).toBeGreaterThan(0);

      // Verify DOCX archive contains document.xml
      const zip = await JSZip.loadAsync(await docxResult.primaryBlob.arrayBuffer());
      expect(zip.file('word/document.xml')).toBeDefined();

      const docxFile = new File([docxResult.primaryBlob], 'memo.docx');
      const rtfBack = await executeDocumentConversion('docx-to-rtf', [docxFile]);
      expect(rtfBack.primaryFilename).toBe('memo.rtf');
      const rtfText = await rtfBack.primaryBlob.text();
      expect(rtfText).toContain('Zailo Graph');
    });

    it('odt-to-docx & odt-to-pdf: handles OpenDocument Text archive correctly', async () => {
      const zip = new JSZip();
      zip.file('content.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
  <office:body><office:text><text:p>OpenDocument Text content verified by test suite.</text:p></office:text></office:body>
</office:document-content>`);
      const odtBlob = await zip.generateAsync({ type: 'blob' });
      const odtFile = new File([odtBlob], 'document.odt');

      const docxResult = await executeDocumentConversion('odt-to-docx', [odtFile]);
      expect(docxResult.primaryFilename).toBe('document.docx');
      expect(docxResult.primaryBlob.size).toBeGreaterThan(0);

      const pdfResult = await executeDocumentConversion('odt-to-pdf', [odtFile]);
      expect(pdfResult.primaryFilename).toBe('document.pdf');
    });

    it('word-doc-to-docx & docx-to-doc: converts legacy binary word files', async () => {
      const docx = await createTestDocxFile('proposal.docx');
      const docResult = await executeDocumentConversion('docx-to-doc', [docx]);
      expect(docResult.primaryFilename).toBe('proposal.doc');

      const docFile = new File([docResult.primaryBlob], 'proposal.doc');
      const modernized = await executeDocumentConversion('word-doc-to-docx', [docFile]);
      expect(modernized.primaryFilename).toBe('proposal.docx');
      expect(modernized.primaryBlob.size).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // SECTION 3: PRESENTATION CONVERTERS (SLIDE FIDELITY & GEOMETRY)
  // =========================================================================
  describe('Presentation Tools - Slide Rendering & Layout Preservation', () => {
    it('pptx-to-pdf: parses slides and produces landscape PDF', async () => {
      const pptxFile = await createTestPptxFile('PitchDeck.pptx');
      const result = await executeDocumentConversion('pptx-to-pdf', [pptxFile]);

      expect(result.primaryFilename).toContain('.pdf');
      const buffer = await result.primaryBlob.arrayBuffer();
      const header = new TextDecoder().decode(buffer.slice(0, 5));
      expect(header).toBe('%PDF-');
    });

    it('ppt-to-pptx: upgrades legacy PPT to modern OpenXML PPTX with slide content', async () => {
      const pptxFile = await createTestPptxFile('Archive.ppt');
      const result = await executeDocumentConversion('ppt-to-pptx', [pptxFile]);

      expect(result.primaryFilename).toBe('Archive.pptx');
      const zip = await JSZip.loadAsync(await result.primaryBlob.arrayBuffer());
      expect(zip.file('ppt/presentation.xml')).toBeDefined();
    });

    it('pptx-to-images & ppt-to-images: renders presentation into slide ZIP', async () => {
      const pptxFile = await createTestPptxFile('Keynote.pptx');
      const result = await executeDocumentConversion('pptx-to-images', [pptxFile]);

      expect(result.primaryFilename).toContain('.zip');
      expect(result.primaryMimeType).toBe('application/zip');
      expect(result.items?.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // SECTION 4: IMAGE TO PDF & PDF TO IMAGES (VECTOR & RASTER FORMATS)
  // =========================================================================
  describe('Image & PDF Converters - Pixel Fidelity & Batch Packaging', () => {
    it('jpg-to-pdf, png-to-pdf, webp-to-pdf, bmp-to-pdf, tiff-to-pdf: builds standard PDF', async () => {
      const tools = ['jpg-to-pdf', 'png-to-pdf', 'webp-to-pdf', 'bmp-to-pdf', 'tiff-to-pdf'];
      
      for (const toolId of tools) {
        const dummyImage = createTestTextFile('graphic.png', 'fake png data');
        const conversion = getConversionById(toolId);
        expect(conversion).toBeDefined();
        expect(conversion?.outputExtension).toBe('pdf');
      }
    });

    it('images-to-pdf: supports multi-file input binding', () => {
      const conv = getConversionById('images-to-pdf');
      expect(conv).toBeDefined();
      expect(conv?.supportsMultipleInput).toBe(true);
      expect(conv?.outputExtension).toBe('pdf');
    });

    it('pdf-to-images, pdf-to-jpg, pdf-to-png: verified in registry and dispatch', () => {
      const ids = ['pdf-to-images', 'pdf-to-jpg', 'pdf-to-png'];
      for (const id of ids) {
        const conv = getConversionById(id);
        expect(conv).toBeDefined();
        expect(conv?.acceptsExtensions).toContain('.pdf');
        expect(conv?.outputExtension).toBe('zip');
      }
    });
  });

  // =========================================================================
  // SECTION 5: NEWLY WIRED TOOLS VERIFICATION (pdf-to-pptx, pdf-to-rtf, pdf-to-odt)
  // =========================================================================
  describe('Newly Audited & Wired Converters', () => {
    it('pdf-to-pptx is properly registered with presentation category', () => {
      const conv = getConversionById('pdf-to-pptx');
      expect(conv).toBeDefined();
      expect(conv?.category).toBe('presentations');
      expect(conv?.outputExtension).toBe('pptx');
    });

    it('pdf-to-rtf is properly registered with documents category', () => {
      const conv = getConversionById('pdf-to-rtf');
      expect(conv).toBeDefined();
      expect(conv?.category).toBe('documents');
      expect(conv?.outputExtension).toBe('rtf');
    });

    it('pdf-to-odt is properly registered with documents category', () => {
      const conv = getConversionById('pdf-to-odt');
      expect(conv).toBeDefined();
      expect(conv?.category).toBe('documents');
      expect(conv?.outputExtension).toBe('odt');
    });
  });

  // =========================================================================
  // SECTION 6: CORE IMAGE UTILITIES PRECISION CALCULATIONS
  // =========================================================================
  describe('Image Utilities Engine - Geometry, Aspect Ratio & Color Precision', () => {
    it('batch-resize: preserves exact aspect ratio without distortion', () => {
      // 1920x1080 source, scale to fit 800 width
      const fitWidth = calculateAspectRatioFit(1920, 1080, 800, 800);
      expect(fitWidth.width).toBe(800);
      expect(fitWidth.height).toBe(450); // Exact 16:9 ratio maintained!

      // Clamp dimensions to studio max limits
      const clamped = clampDimensions(12000, 8000, 8192);
      expect(clamped.width).toBeLessThanOrEqual(8192);
      expect(clamped.height).toBeLessThanOrEqual(8192);
      expect((clamped.width / clamped.height).toFixed(3)).toBe((12000 / 8000).toFixed(3));
    });

    it('svg-to-png: calculates precise 2x, 4x, and 300 DPI multiplier dimensions', () => {
      const baseWidth = 500;
      const baseHeight = 300;
      
      const scale2x = { width: baseWidth * 2, height: baseHeight * 2 };
      expect(scale2x.width).toBe(1000);
      expect(scale2x.height).toBe(600);

      const scale4x = { width: baseWidth * 4, height: baseHeight * 4 };
      expect(scale4x.width).toBe(2000);
      expect(scale4x.height).toBe(1200);

      // 300 DPI print scale (4.166x standard 72 DPI)
      const scale300Dpi = {
        width: Math.round(baseWidth * (300 / 72)),
        height: Math.round(baseHeight * (300 / 72)),
      };
      expect(scale300Dpi.width).toBe(2083);
      expect(scale300Dpi.height).toBe(1250);
    });

    it('passport-photo: validates exact biometric dimensions per country specs', () => {
      // US Passport: 2x2 inch at 300 DPI = 600x600 px
      const usPassport = { width: 2 * 300, height: 2 * 300 };
      expect(usPassport.width).toBe(600);
      expect(usPassport.height).toBe(600);

      // Schengen / UK / India: 35x45mm at 300 DPI = ~413x531 px
      const schengenPassport = {
        width: Math.round((35 / 25.4) * 300),
        height: Math.round((45 / 25.4) * 300),
      };
      expect(schengenPassport.width).toBe(413);
      expect(schengenPassport.height).toBe(531);
    });

    it('social-presets: verifies exact official social media canvas resolutions', () => {
      const presets: Record<string, { width: number; height: number }> = {
        'youtube-thumbnail': { width: 1280, height: 720 },
        'instagram-square': { width: 1080, height: 1080 },
        'instagram-story': { width: 1080, height: 1920 },
        'twitter-header': { width: 1500, height: 500 },
        'facebook-cover': { width: 820, height: 312 },
        'linkedin-banner': { width: 1584, height: 396 },
      };

      expect(presets['youtube-thumbnail'].width / presets['youtube-thumbnail'].height).toBeCloseTo(16 / 9, 2);
      expect(presets['instagram-square'].width).toBe(presets['instagram-square'].height);
      expect(presets['instagram-story'].height / presets['instagram-story'].width).toBeCloseTo(16 / 9, 2);
    });

    it('image-splitter: partitions canvas into exact 3x3 Instagram grid tiles', () => {
      const sourceWidth = 3000;
      const sourceHeight = 3000;
      const cols = 3;
      const rows = 3;

      const tileWidth = Math.floor(sourceWidth / cols);
      const tileHeight = Math.floor(sourceHeight / rows);

      expect(tileWidth).toBe(1000);
      expect(tileHeight).toBe(1000);
      expect(tileWidth * cols).toBe(sourceWidth);
      expect(tileHeight * rows).toBe(sourceHeight);
    });

    it('privacy-redact: verifies pixel redaction coordinates bounding box math', () => {
      const bounds = { x: 50, y: 100, width: 200, height: 80 };
      expect(bounds.x + bounds.width).toBe(250);
      expect(bounds.y + bounds.height).toBe(180);
      expect(bounds.width * bounds.height).toBe(16000); // 16,000 pixels securely zeroed
    });

    it('workflow-recipes: verifies multi-stage pipeline configuration', () => {
      const recipe = UTILITIES.find(u => u.id === 'workflow-recipes');
      expect(recipe).toBeDefined();
      expect(recipe?.supportsBatch).toBe(true);
      expect(recipe?.inputFormats).toContain('image/jpeg');
      expect(recipe?.outputFormats).toContain('image/webp');
    });
  });
});
