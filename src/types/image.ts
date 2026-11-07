export interface ImageMetadata {
  format?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  orientation?: number;
  colorSpace?: string;
  hasAlpha?: boolean;
  camera?: {
    make?: string;
    model?: string;
    lens?: string;
    focalLength?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    dateTime?: string;
  };
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  rawExifTags?: Record<string, any>;
}

export interface ImageItem {
  id: string;
  name: string;
  size: number; // File size in bytes
  type: string; // MIME type
  blob: Blob;
  url: string; // Object URL for original
  width: number;
  height: number;
  previewUrl: string; // Fast 512px thumbnail URL
  metadata: ImageMetadata;
  
  // Transformation result
  processedBlob?: Blob;
  processedUrl?: string;
  processedSize?: number;
  processedWidth?: number;
  processedHeight?: number;
  
  // Status & Progress
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number; // 0 - 100
  error?: string;
  lastUtilityApplied?: string;
  createdAt: number;
}
