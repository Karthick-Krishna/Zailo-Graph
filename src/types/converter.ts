export type ConversionType = 
  | 'word-to-pdf'
  | 'pdf-to-word'
  | 'image-to-pdf'
  | 'word-to-word'
  | 'pdf-to-image'
  | 'image-to-word';

export type ConversionCategory = 'all' | 'documents' | 'pdf' | 'images' | 'ocr';

export interface ConversionTypeDefinition {
  id: ConversionType;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  sourceFormats: string[]; // e.g. ['docx', 'doc']
  targetFormats: string[]; // e.g. ['pdf']
  defaultTarget: string;
  badge?: string;
}

export const CONVERSION_TYPES: ConversionTypeDefinition[] = [
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    shortTitle: 'Word → PDF',
    description: 'Convert DOC and DOCX files into professional, vector PDF documents.',
    iconName: 'FileText',
    sourceFormats: ['docx', 'doc'],
    targetFormats: ['pdf'],
    defaultTarget: 'pdf',
    badge: 'Popular',
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    shortTitle: 'PDF → Word',
    description: 'Convert PDF files into fully editable Microsoft Word (.docx) documents.',
    iconName: 'FileCode2',
    sourceFormats: ['pdf'],
    targetFormats: ['docx'],
    defaultTarget: 'docx',
    badge: 'Editable',
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    shortTitle: 'Image → PDF',
    description: 'Combine JPG, PNG, WEBP, and AVIF images into clean single or multi-page PDFs.',
    iconName: 'Images',
    sourceFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg'],
    targetFormats: ['pdf'],
    defaultTarget: 'pdf',
    badge: 'Batch',
  },
  {
    id: 'word-to-word',
    title: 'Word to Word',
    shortTitle: 'Word → Word',
    description: 'Convert and normalize between compatible Word document formats (DOC & DOCX).',
    iconName: 'Repeat',
    sourceFormats: ['doc', 'docx'],
    targetFormats: ['docx'],
    defaultTarget: 'docx',
    badge: 'Repair',
  },
  {
    id: 'pdf-to-image',
    title: 'PDF to Image',
    shortTitle: 'PDF → Image',
    description: 'Render PDF pages into crystal-clear high-res JPG or PNG images with ZIP export.',
    iconName: 'Image',
    sourceFormats: ['pdf'],
    targetFormats: ['png', 'jpg'],
    defaultTarget: 'png',
    badge: 'High DPI',
  },
  {
    id: 'image-to-word',
    title: 'Image to Word (OCR)',
    shortTitle: 'Image → Word',
    description: 'Extract text from scanned photos and receipts via client-side OCR into editable Word.',
    iconName: 'ScanText',
    sourceFormats: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
    targetFormats: ['docx'],
    defaultTarget: 'docx',
    badge: 'AI OCR',
  },
];

export interface ConvertedPageResult {
  pageNum: number;
  name: string;
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

export interface ConverterQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  sourceFormat: string; // e.g. 'docx'
  targetFormat: string; // e.g. 'pdf'
  conversionType: ConversionType;
  status: 'idle' | 'converting' | 'completed' | 'error';
  progress: number; // 0 to 100
  statusMessage?: string;
  resultBlob?: Blob;
  resultUrl?: string;
  resultName?: string;
  resultSize?: number;
  pages?: ConvertedPageResult[];
  error?: string;
  convertedAt?: number;
  options?: {
    pageSize?: 'a4' | 'letter' | 'fit';
    orientation?: 'auto' | 'portrait' | 'landscape';
    pdfDpi?: number;
    imageQuality?: number;
    combineImages?: boolean;
    ocrLang?: string;
  };
}

export interface ConversionResult {
  blob: Blob;
  filename: string;
  pages?: ConvertedPageResult[];
  extraText?: string;
}
