import { describe, it, expect } from 'vitest';
import {
  detectFormat,
  suggestConversion,
  getFileExtension,
  getBaseFilename,
  convertWordToPdf,
  convertWordToWord,
} from '../services/fileConverter';

describe('Universal File Converter Engine', () => {
  it('detects file formats correctly by extension and mimeType', () => {
    const docxFile = new File(['dummy'], 'proposal.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(detectFormat(docxFile)).toBe('docx');

    const pdfFile = new File(['dummy'], 'report.pdf', { type: 'application/pdf' });
    expect(detectFormat(pdfFile)).toBe('pdf');

    const pngFile = new File(['dummy'], 'screenshot.png', { type: 'image/png' });
    expect(detectFormat(pngFile)).toBe('png');

    const docFile = new File(['dummy'], 'legacy.doc', { type: 'application/msword' });
    expect(detectFormat(docFile)).toBe('doc');
  });

  it('suggests the optimal conversion type based on source format', () => {
    const docx = new File([''], 'doc.docx');
    expect(suggestConversion(docx)).toEqual({ type: 'word-to-pdf', targetFormat: 'pdf' });

    const pdf = new File([''], 'doc.pdf');
    expect(suggestConversion(pdf)).toEqual({ type: 'pdf-to-word', targetFormat: 'docx' });

    const img = new File([''], 'photo.jpg');
    expect(suggestConversion(img)).toEqual({ type: 'image-to-pdf', targetFormat: 'pdf' });
  });

  it('correctly handles filename and extension utilities', () => {
    expect(getFileExtension('archive.backup.docx')).toBe('docx');
    expect(getBaseFilename('archive.backup.docx')).toBe('archive.backup');
    expect(getFileExtension('noextension')).toBe('');
  });

  it('converts Word document text to valid PDF output', async () => {
    const sampleWordText = 'Title: Executive Summary\nThis is a sample document for conversion.\nFeatures:\n• Fast\n• Secure\n• Private';
    const mockFile = new File([sampleWordText], 'summary.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    const result = await convertWordToPdf(mockFile);
    expect(result.filename).toBe('summary.pdf');
    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.blob.type).toBe('application/pdf');
    expect(result.blob.size).toBeGreaterThan(500);
  });

  it('normalizes Word to Word (.docx) output', async () => {
    const sampleText = 'Quarterly Report\nRevenue increased by 25%.';
    const mockFile = new File([sampleText], 'quarterly.doc', { type: 'application/msword' });

    const result = await convertWordToWord(mockFile);
    expect(result.filename).toBe('quarterly_normalized.docx');
    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.blob.size).toBeGreaterThan(1000);
  });
});
