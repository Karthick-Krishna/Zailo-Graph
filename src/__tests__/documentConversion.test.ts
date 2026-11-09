import { describe, it, expect } from 'vitest';
import { 
  CONVERSIONS, 
  CONVERSION_CATEGORIES, 
  getConversionById, 
  getConversionsByCategory, 
  findConversionForFile,
  validateFileForConversion 
} from '../services/conversion/conversionRegistry';
import {
  convertTxtToPdf,
  convertRtfToDocx,
  convertDocxToRtf,
} from '../services/conversion/documentConverter';
import {
  convertCsvToXlsx,
  convertXlsxToCsv,
} from '../services/conversion/spreadsheetConverter';
import {
  extractZipArchive,
  sanitizeArchiveFilename,
} from '../services/conversion/archiveConverter';
import JSZip from 'jszip';

describe('Document Conversion System - Registry & Validation', () => {
  it('defines all 6 mandatory conversion categories', () => {
    const categoryIds = CONVERSION_CATEGORIES.map(c => c.id);
    expect(categoryIds).toContain('documents');
    expect(categoryIds).toContain('presentations');
    expect(categoryIds).toContain('spreadsheets');
    expect(categoryIds).toContain('images_to_pdf');
    expect(categoryIds).toContain('pdf_to_images');
    expect(categoryIds).toContain('archives');
  });

  it('contains all 36 specified conversion operations', () => {
    expect(CONVERSIONS.length).toBe(36);

    // Verify key operations exist
    expect(getConversionById('word-to-pdf')).toBeDefined();
    expect(getConversionById('pdf-to-word')).toBeDefined();
    expect(getConversionById('word-doc-to-docx')).toBeDefined();
    expect(getConversionById('docx-to-doc')).toBeDefined();
    expect(getConversionById('pdf-to-txt')).toBeDefined();
    expect(getConversionById('txt-to-pdf')).toBeDefined();
    expect(getConversionById('pptx-to-pdf')).toBeDefined();
    expect(getConversionById('pptx-to-images')).toBeDefined();
    expect(getConversionById('xlsx-to-pdf')).toBeDefined();
    expect(getConversionById('xlsx-to-csv')).toBeDefined();
    expect(getConversionById('csv-to-xlsx')).toBeDefined();
    expect(getConversionById('images-to-pdf')).toBeDefined();
    expect(getConversionById('pdf-to-png')).toBeDefined();
    expect(getConversionById('zip-extract')).toBeDefined();
    expect(getConversionById('tar-extract')).toBeDefined();
    expect(getConversionById('targz-extract')).toBeDefined();
  });

  it('categorizes operations accurately', () => {
    const docs = getConversionsByCategory('documents');
    expect(docs.length).toBe(11);

    const presentations = getConversionsByCategory('presentations');
    expect(presentations.length).toBe(6);

    const spreadsheets = getConversionsByCategory('spreadsheets');
    expect(spreadsheets.length).toBe(8);

    const imagesToPdf = getConversionsByCategory('images_to_pdf');
    expect(imagesToPdf.length).toBe(6);

    const pdfToImages = getConversionsByCategory('pdf_to_images');
    expect(pdfToImages.length).toBe(2);

    const archives = getConversionsByCategory('archives');
    expect(archives.length).toBe(3);
  });

  it('validates file extensions and limits properly', () => {
    const wordConv = getConversionById('word-to-pdf')!;
    const validFile = new File(['mock content'], 'report.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const invalidFile = new File(['mock content'], 'photo.jpg', { type: 'image/jpeg' });

    expect(validateFileForConversion(validFile, wordConv).isValid).toBe(true);
    expect(validateFileForConversion(invalidFile, wordConv).isValid).toBe(false);
  });
});

describe('Document Conversions Engine', () => {
  it('converts TXT to a genuine PDF document', async () => {
    const txtFile = new File(['Zailo Graph Privacy-First Text Document\nLine 2 content.'], 'notes.txt', {
      type: 'text/plain'
    });

    const result = await convertTxtToPdf(txtFile);
    expect(result.primaryBlob).toBeDefined();
    expect(result.primaryBlob.size).toBeGreaterThan(100);
    expect(result.primaryMimeType).toBe('application/pdf');
    expect(result.primaryFilename).toBe('notes.pdf');
  });

  it('converts RTF to editable Word DOCX', async () => {
    const rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Courier;}}\\f0\\fs20 Hello RTF Document\\par}';
    const rtfFile = new File([rtfContent], 'memo.rtf', { type: 'application/rtf' });

    const result = await convertRtfToDocx(rtfFile);
    expect(result.primaryBlob).toBeDefined();
    expect(result.primaryBlob.size).toBeGreaterThan(1000);
    expect(result.primaryMimeType).toContain('wordprocessingml.document');
    expect(result.primaryFilename).toBe('memo.docx');
  });
});

describe('Spreadsheet Conversions Engine', () => {
  it('converts CSV to XLSX and back to CSV losslessly', async () => {
    const originalCsv = 'Item,Quantity,Price\nCamera,5,899\nLens,10,249\nTripod,15,99';
    const csvFile = new File([originalCsv], 'inventory.csv', { type: 'text/csv' });

    // CSV -> XLSX
    const xlsxResult = await convertCsvToXlsx(csvFile);
    expect(xlsxResult.primaryBlob).toBeDefined();
    expect(xlsxResult.primaryBlob.size).toBeGreaterThan(1000);
    expect(xlsxResult.primaryFilename).toBe('inventory.xlsx');

    // XLSX -> CSV
    const xlsxFile = new File([xlsxResult.primaryBlob], 'inventory.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const csvResult = await convertXlsxToCsv(xlsxFile);
    const roundtripText = await csvResult.primaryBlob.text();
    expect(roundtripText.trim()).toBe(originalCsv.trim());
  });
});

describe('Archive Extraction Engine', () => {
  it('extracts ZIP archive files safely and blocks path traversal', async () => {
    const zip = new JSZip();
    zip.file('document.txt', 'Clean contents from Zailo Graph archive test.');
    zip.file('subfolder/data.json', JSON.stringify({ version: '1.0' }));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], 'package.zip', { type: 'application/zip' });

    const result = await extractZipArchive(zipFile);
    expect(result.items).toBeDefined();
    expect(result.items!.length).toBe(2);
    expect(result.items!.some(i => i.name === 'document.txt')).toBe(true);
    expect(result.primaryFilename).toBe('package_extracted.zip');
  });

  it('rejects filenames containing malicious path traversal ../', () => {
    expect(() => sanitizeArchiveFilename('../../etc/passwd')).toThrow(/Security Violation/);
    expect(() => sanitizeArchiveFilename('/root/.ssh/id_rsa')).toThrow(/Security Violation/);
    expect(() => sanitizeArchiveFilename('C:\\Windows\\System32')).toThrow(/Security Violation/);
    expect(sanitizeArchiveFilename('clean/path/document.txt')).toBe('clean/path/document.txt');
  });
});
