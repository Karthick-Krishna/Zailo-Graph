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
  convertXlsxToPdf,
  convertXlsToXlsx,
  convertXlsxToXls,
  convertCsvToXls,
  convertXlsToPdf,
} from '../services/conversion/spreadsheetConverter';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

describe('Document Conversion System - Registry & Validation', () => {
  it('defines all 5 mandatory conversion categories', () => {
    const categoryIds = CONVERSION_CATEGORIES.map(c => c.id);
    expect(categoryIds).toContain('documents');
    expect(categoryIds).toContain('presentations');
    expect(categoryIds).toContain('spreadsheets');
    expect(categoryIds).toContain('images_to_pdf');
    expect(categoryIds).toContain('pdf_to_images');
  });

  it('contains all 37 specified conversion operations', () => {
    expect(CONVERSIONS.length).toBe(37);

    // Verify key operations exist
    expect(getConversionById('word-to-pdf')).toBeDefined();
    expect(getConversionById('pdf-to-word')).toBeDefined();
    expect(getConversionById('word-doc-to-docx')).toBeDefined();
    expect(getConversionById('docx-to-doc')).toBeDefined();
    expect(getConversionById('txt-to-pdf')).toBeDefined();
    expect(getConversionById('pptx-to-pdf')).toBeDefined();
    expect(getConversionById('pptx-to-images')).toBeDefined();
    expect(getConversionById('xlsx-to-pdf')).toBeDefined();
    expect(getConversionById('xls-to-pdf')).toBeDefined();
    expect(getConversionById('xlsx-to-csv')).toBeDefined();
    expect(getConversionById('xls-to-csv')).toBeDefined();
    expect(getConversionById('csv-to-xlsx')).toBeDefined();
    expect(getConversionById('xls-to-xlsx')).toBeDefined();
    expect(getConversionById('xlsx-to-xls')).toBeDefined();
    expect(getConversionById('csv-to-xls')).toBeDefined();
    expect(getConversionById('xls-to-ods')).toBeDefined();
    expect(getConversionById('ods-to-xls')).toBeDefined();
    expect(getConversionById('images-to-pdf')).toBeDefined();
    expect(getConversionById('pdf-to-png')).toBeDefined();
  });

  it('categorizes operations accurately', () => {
    const docs = getConversionsByCategory('documents');
    expect(docs.length).toBe(10);

    const presentations = getConversionsByCategory('presentations');
    expect(presentations.length).toBe(6);

    const spreadsheets = getConversionsByCategory('spreadsheets');
    expect(spreadsheets.length).toBe(13);

    const imagesToPdf = getConversionsByCategory('images_to_pdf');
    expect(imagesToPdf.length).toBe(6);

    const pdfToImages = getConversionsByCategory('pdf_to_images');
    expect(pdfToImages.length).toBe(2);
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

  it('converts Excel XLSX with embedded images to PDF with graphics preserved', async () => {
    // Create valid base XLSX structure using SheetJS
    const baseWb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Revenue', '$10,000'],
      ['Expenses', '$6,000']
    ]);
    XLSX.utils.book_append_sheet(baseWb, ws, 'Sales Summary');
    const baseBuffer = XLSX.write(baseWb, { type: 'array', bookType: 'xlsx' });

    // Inject drawings, relationships and media image into the XLSX archive
    const zip = await JSZip.loadAsync(baseBuffer);
    zip.file('xl/worksheets/_rels/sheet1.xml.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>');
    zip.file('xl/drawings/drawing1.xml', '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:twoCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:row>2</xdr:row></xdr:from><xdr:to><xdr:col>2</xdr:col><xdr:row>4</xdr:row></xdr:to><xdr:pic><xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId1"/></xdr:blipFill></xdr:pic></xdr:twoCellAnchor></xdr:wsDr>');
    zip.file('xl/drawings/_rels/drawing1.xml.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/></Relationships>');
    
    // 1x1 PNG image
    const pngBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84, 120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
    zip.file('xl/media/image1.png', pngBytes);

    const xlsxBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    const xlsxFile = new File([xlsxBuffer], 'report_with_logo.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const result = await convertXlsxToPdf(xlsxFile);
    expect(result.primaryBlob).toBeDefined();
    expect(result.primaryBlob.size).toBeGreaterThan(1500);
    expect(result.primaryMimeType).toBe('application/pdf');
    expect(result.primaryFilename).toBe('report_with_logo_sheets.pdf');
    expect(result.summary).toContain('embedded image');
  });

  it('supports full bidirectional XLS conversions (XLS <-> XLSX, CSV -> XLS, XLS -> PDF)', async () => {
    // 1. Create a binary BIFF8 XLS workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Product', 'Q1 Sales', 'Q2 Sales'],
      ['Zailo Studio', 12000, 18500],
      ['Coralgenz Pro', 8500, 14200],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Quarterly');
    const xlsBuffer = XLSX.write(wb, { bookType: 'biff8', type: 'array' });
    const xlsFile = new File([xlsBuffer], 'quarterly_report.xls', {
      type: 'application/vnd.ms-excel',
    });

    // 2. Convert XLS -> XLSX
    const xlsxResult = await convertXlsToXlsx(xlsFile);
    expect(xlsxResult.primaryBlob).toBeDefined();
    expect(xlsxResult.primaryFilename).toBe('quarterly_report.xlsx');
    expect(xlsxResult.primaryMimeType).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // 3. Convert XLSX -> XLS
    const convertedXlsxFile = new File([xlsxResult.primaryBlob], 'quarterly_report.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const xlsResult = await convertXlsxToXls(convertedXlsxFile);
    expect(xlsResult.primaryBlob).toBeDefined();
    expect(xlsResult.primaryFilename).toBe('quarterly_report.xls');
    expect(xlsResult.primaryMimeType).toBe('application/vnd.ms-excel');

    // 4. Convert CSV -> XLS
    const csvFile = new File(['Col1,Col2\nVal1,Val2'], 'data.csv', { type: 'text/csv' });
    const csvToXlsResult = await convertCsvToXls(csvFile);
    expect(csvToXlsResult.primaryBlob).toBeDefined();
    expect(csvToXlsResult.primaryFilename).toBe('data.xls');
    expect(csvToXlsResult.primaryMimeType).toBe('application/vnd.ms-excel');

    // 5. Convert XLS -> PDF
    const pdfResult = await convertXlsToPdf(xlsFile);
    expect(pdfResult.primaryBlob).toBeDefined();
    expect(pdfResult.primaryMimeType).toBe('application/pdf');
    expect(pdfResult.primaryFilename).toBe('quarterly_report_sheets.pdf');
  });
});
