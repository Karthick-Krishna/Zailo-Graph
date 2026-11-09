export type ConversionCategoryId = 
  | 'documents'
  | 'presentations'
  | 'spreadsheets'
  | 'images_to_pdf'
  | 'pdf_to_images'
  | 'archives';

export interface ConversionCategory {
  id: ConversionCategoryId;
  title: string;
  description: string;
  icon: string;
  badge: string;
}

export interface ConversionDefinition {
  id: string;
  name: string;
  category: ConversionCategoryId;
  sourceFormat: string;
  targetFormat: string;
  acceptsExtensions: string[];
  acceptsMimeTypes: string[];
  outputExtension: string;
  outputMimeType: string;
  description: string;
  supportsMultipleInput?: boolean;
  supportsBatchOutput?: boolean;
}

export type ConversionStatus = 
  | 'idle'
  | 'validating'
  | 'processing'
  | 'generating'
  | 'done'
  | 'error';

export interface ConvertedOutputItem {
  id: string;
  name: string;
  size: number;
  blob: Blob;
  mimeType: string;
  url: string;
  previewUrl?: string;
  pageOrSlideIndex?: number;
}

export interface ConversionResult {
  primaryBlob: Blob;
  primaryFilename: string;
  primaryMimeType: string;
  primarySize: number;
  items?: ConvertedOutputItem[];
  zipBlob?: Blob;
  zipFilename?: string;
  zipSize?: number;
  summary?: string;
}

export interface ConversionProgressState {
  status: ConversionStatus;
  phase: string;
  percent: number;
  error?: string;
}

