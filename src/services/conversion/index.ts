import { ConversionDefinition, ConversionProgressState, ConversionResult } from '../../types/conversion';
export * from '../../types/conversion';
export * from './conversionRegistry';
import { getConversionById } from './conversionRegistry';
import {
  convertWordToPdf,
  convertPdfToWord,
  convertDocToDocx,
  convertDocxToDoc,
  convertPdfToTxt,
  convertTxtToPdf,
  convertRtfToPdf,
  convertRtfToDocx,
  convertDocxToRtf,
  convertOdtToPdf,
  convertOdtToDocx,
} from './documentConverter';
import {
  convertPptxToPdf,
  convertPptToPdf,
  convertPptToPptx,
  convertPptxToPpt,
  convertPptxToImages,
} from './presentationConverter';
import {
  convertXlsxToPdf,
  convertXlsToPdf,
  convertXlsxToCsv,
  convertXlsToCsv,
  convertCsvToXlsx,
  convertCsvToPdf,
  convertXlsxToOds,
  convertOdsToXlsx,
} from './spreadsheetConverter';
import {
  convertImageToPdf,
  convertMultipleImagesToPdf,
  convertPdfToImages,
} from './imageDocumentConverter';

type ProgressCallback = (state: ConversionProgressState) => void;

/**
 * Universal conversion dispatcher
 */
export async function executeDocumentConversion(
  conversionId: string,
  files: File[],
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  if (files.length === 0) {
    throw new Error('Please select at least one file to convert.');
  }

  const file = files[0];
  const conversion = getConversionById(conversionId);
  if (!conversion) {
    throw new Error(`Unknown conversion utility ID "${conversionId}".`);
  }

  try {
    switch (conversionId) {
      // A. Document Conversions
      case 'word-to-pdf':
        return await convertWordToPdf(file, onProgress);
      case 'pdf-to-word':
        return await convertPdfToWord(file, onProgress);
      case 'word-doc-to-docx':
        return await convertDocToDocx(file, onProgress);
      case 'docx-to-doc':
        return await convertDocxToDoc(file, onProgress);
      case 'pdf-to-txt':
        return await convertPdfToTxt(file, onProgress);
      case 'txt-to-pdf':
        return await convertTxtToPdf(file, onProgress);
      case 'rtf-to-pdf':
        return await convertRtfToPdf(file, onProgress);
      case 'rtf-to-docx':
        return await convertRtfToDocx(file, onProgress);
      case 'docx-to-rtf':
        return await convertDocxToRtf(file, onProgress);
      case 'odt-to-pdf':
        return await convertOdtToPdf(file, onProgress);
      case 'odt-to-docx':
        return await convertOdtToDocx(file, onProgress);

      // B. Presentation Conversions
      case 'pptx-to-pdf':
        return await convertPptxToPdf(file, onProgress);
      case 'ppt-to-pdf':
        return await convertPptToPdf(file, onProgress);
      case 'ppt-to-pptx':
        return await convertPptToPptx(file, onProgress);
      case 'pptx-to-ppt':
        return await convertPptxToPpt(file, onProgress);
      case 'pptx-to-images':
        return await convertPptxToImages(file, 'png', onProgress);
      case 'ppt-to-images':
        return await convertPptxToImages(file, 'png', onProgress);

      // C. Spreadsheet Conversions
      case 'xlsx-to-pdf':
        return await convertXlsxToPdf(file, onProgress);
      case 'xls-to-pdf':
        return await convertXlsToPdf(file, onProgress);
      case 'xlsx-to-csv':
        return await convertXlsxToCsv(file, onProgress);
      case 'xls-to-csv':
        return await convertXlsToCsv(file, onProgress);
      case 'csv-to-xlsx':
        return await convertCsvToXlsx(file, onProgress);
      case 'csv-to-pdf':
        return await convertCsvToPdf(file, onProgress);
      case 'xlsx-to-ods':
        return await convertXlsxToOds(file, onProgress);
      case 'ods-to-xlsx':
        return await convertOdsToXlsx(file, onProgress);

      // D. Image and Document Conversions
      case 'jpg-to-pdf':
      case 'png-to-pdf':
      case 'webp-to-pdf':
      case 'bmp-to-pdf':
      case 'tiff-to-pdf':
        return await convertImageToPdf(file, onProgress);
      case 'images-to-pdf':
        return await convertMultipleImagesToPdf(files, onProgress);
      case 'pdf-to-jpg':
        return await convertPdfToImages(file, 'jpg', onProgress);
      case 'pdf-to-png':
        return await convertPdfToImages(file, 'png', onProgress);

      default:
        throw new Error(`Conversion handler for "${conversionId}" is not implemented.`);
    }
  } catch (err: any) {
    onProgress?.({
      status: 'error',
      phase: 'Conversion failed',
      percent: 0,
      error: err.message || 'An unexpected error occurred during conversion.',
    });
    throw err;
  }
}

export * from './conversionRegistry';
