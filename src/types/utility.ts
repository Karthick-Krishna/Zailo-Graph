export type UtilityCategory = 
  | 'recipes'
  | 'convert'
  | 'optimize'
  | 'edit'
  | 'social'
  | 'metadata';

export interface UtilityDefinition {
  id: string;
  name: string;
  description: string;
  category: UtilityCategory;
  isCompetitorPaid: boolean; // Gated behind 100% Free Login
  icon: string;
  badge?: string;
  inputFormats: string[];
  outputFormats: string[];
  supportsBatch: boolean;
  isCloudHybrid?: boolean;
}

export const UTILITIES: UtilityDefinition[] = [
  // 0. 1-Click Workflow Recipes
  {
    id: 'workflow-recipes',
    name: '1-Click Recipes',
    description: 'Instant multi-step automation: Amazon E-Commerce, YouTube Thumbnails, Biometric Passports, and Lighthouse 100 SEO.',
    category: 'recipes',
    isCompetitorPaid: true,
    icon: 'Sparkles',
    badge: 'Pro Unlocked',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic'],
    outputFormats: ['image/webp', 'image/avif', 'image/jpeg', 'image/png'],
    supportsBatch: true,
  },
  // 1. Batch Image Resizing
  {
    id: 'batch-resize',
    name: 'Batch Image Resizing',
    description: 'Scale multiple images by exact dimensions, percentage, or aspect ratio using high-fidelity resampling.',
    category: 'optimize',
    isCompetitorPaid: false,
    icon: 'Maximize2',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    outputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportsBatch: true,
  },
  // 2. Image Compression
  {
    id: 'compression',
    name: 'Image Compression',
    description: 'Reduce file size with MozJPEG, OxiPNG, and WebP encoders with real-time split-screen comparison.',
    category: 'optimize',
    isCompetitorPaid: false,
    icon: 'FileDown',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    outputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportsBatch: true,
  },
  // 3. Document and File Converter System (Word, PDF, Excel, PowerPoint, Text, RTF, Images)
  {
    id: 'document-converter',
    name: 'Document & File Converter',
    description: 'Convert Word, PDF, Excel, PowerPoint, Text, RTF, and Images with 100% privacy.',
    category: 'convert',
    isCompetitorPaid: false,
    icon: 'FileCode2',
    badge: '33 Tools',
    inputFormats: [
      '.docx', '.doc', '.pdf', '.pptx', '.ppt', '.xlsx', '.xls', '.csv',
      '.odt', '.rtf', '.txt', '.jpg', '.jpeg', '.png', '.webp', '.bmp',
      '.tiff', '.tif'
    ],
    outputFormats: [
      '.pdf', '.docx', '.doc', '.txt', '.rtf', '.pptx', '.ppt', '.xlsx',
      '.csv', '.ods', '.png', '.jpg', '.zip'
    ],
    supportsBatch: true,
  },
  // 4. HEIC to JPG/PNG
  {
    id: 'heic-converter',
    name: 'HEIC to JPG/PNG',
    description: 'Extract and convert Apple iPhone HEIC/HEIF live photos and bursts directly in the browser.',
    category: 'convert',
    isCompetitorPaid: false,
    icon: 'Smartphone',
    inputFormats: ['image/heic', 'image/heif', '.heic', '.heif'],
    outputFormats: ['image/jpeg', 'image/png'],
    supportsBatch: true,
  },
  // 4. WebP to PNG/JPG
  {
    id: 'webp-to-raster',
    name: 'WebP to PNG/JPG',
    description: 'Decompress static and animated WebP images to lossless PNG or high-quality JPEG.',
    category: 'convert',
    isCompetitorPaid: false,
    icon: 'Repeat',
    inputFormats: ['image/webp'],
    outputFormats: ['image/png', 'image/jpeg'],
    supportsBatch: true,
  },
  // 5. PNG/JPG to WebP
  {
    id: 'raster-to-webp',
    name: 'PNG/JPG to WebP',
    description: 'Convert legacy raster images to modern, highly compressed WebP format.',
    category: 'convert',
    isCompetitorPaid: false,
    icon: 'Sparkles',
    inputFormats: ['image/jpeg', 'image/png', 'image/bmp'],
    outputFormats: ['image/webp'],
    supportsBatch: true,
  },
  // 6. SVG to High-Resolution PNG
  {
    id: 'svg-to-png',
    name: 'SVG to High-Res PNG',
    description: 'Rasterize scalable vector graphics up to 16x print quality with Resvg WASM.',
    category: 'convert',
    isCompetitorPaid: true, // 16x multiplier is pro-unlocked; 2x for guest
    badge: 'Pro Unlocked',
    icon: 'FileCode2',
    inputFormats: ['image/svg+xml', '.svg'],
    outputFormats: ['image/png'],
    supportsBatch: true,
  },
  // 7. PNG to SVG Vectorization
  {
    id: 'png-to-svg',
    name: 'PNG to SVG Vectorizer',
    description: 'Trace raster logos, graphics, and sketches into clean, multi-color SVG vector paths.',
    category: 'convert',
    isCompetitorPaid: true,
    badge: 'Pro Unlocked',
    icon: 'PenTool',
    inputFormats: ['image/png', 'image/jpeg', 'image/webp'],
    outputFormats: ['image/svg+xml'],
    supportsBatch: false,
  },
  // 8. Rotate and Flip Studio
  {
    id: 'rotate-flip',
    name: 'Rotate & Flip Studio',
    description: 'Rotate images by 90°, 180°, 270°, or fine degree angles with canvas auto-bounds, plus horizontal & vertical flipping.',
    category: 'edit',
    isCompetitorPaid: false,
    icon: 'RotateCw',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['image/png', 'image/jpeg', 'image/webp'],
    supportsBatch: true,
  },
  // 9. Meme & Text Caption Studio
  {
    id: 'meme-generator',
    name: 'Meme & Caption Studio',
    description: 'Add classic bold impact typography, top/bottom viral meme captions, and stroke outlines to any image.',
    category: 'edit',
    isCompetitorPaid: false,
    icon: 'Type',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['image/png', 'image/jpeg', 'image/webp'],
    supportsBatch: true,
  },
  // 10. Image Sharpening and Enhancement
  {
    id: 'sharpen-enhance',
    name: 'Sharpen & Enhance',
    description: 'Unsharp mask, local contrast enhancement, and clarity adjustments with real-time 60fps WebGL preview.',
    category: 'edit',
    isCompetitorPaid: false,
    icon: 'Sliders',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportsBatch: true,
  },
  // 11. Circular Avatar and Image Cropper
  {
    id: 'avatar-crop',
    name: 'Circular Avatar & Cropper',
    description: 'Crop images into perfect circles, rounded rectangles, or standard aspect ratios with pan/zoom.',
    category: 'edit',
    isCompetitorPaid: false,
    icon: 'Crop',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['image/png'],
    supportsBatch: false,
  },
  // 12. Social Media Image Presets
  {
    id: 'social-presets',
    name: 'Social Media Presets',
    description: 'Instant sizing for Instagram, YouTube, LinkedIn, X, and Open Graph with smart background fill.',
    category: 'social',
    isCompetitorPaid: false,
    icon: 'Share2',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportsBatch: true,
  },
  // 13. Image Watermarking
  {
    id: 'watermark',
    name: 'Image Watermarking',
    description: 'Apply customizable text typography or logo watermarks across single images or batch queues.',
    category: 'edit',
    isCompetitorPaid: true,
    badge: 'Pro Unlocked',
    icon: 'Stamp',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportsBatch: true,
  },
  // 14. Photo Grids and Collage Maker
  {
    id: 'collage-maker',
    name: 'Photo Grids & Collages',
    description: 'Combine multiple images into dynamic flex grids, editorial collages, and polaroid arrays.',
    category: 'edit',
    isCompetitorPaid: true,
    badge: 'Pro Unlocked',
    icon: 'LayoutGrid',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['image/png', 'image/jpeg'],
    supportsBatch: false,
  },
  // 15. Color Palette Generator
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'Extract dominant color harmonies, HEX swatches, and CSS variables via K-Means quantization.',
    category: 'edit',
    isCompetitorPaid: false,
    icon: 'Palette',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['application/json', 'image/png'],
    supportsBatch: false,
  },
  // 16. Passport and ID Photo Maker
  {
    id: 'passport-photo',
    name: 'Passport & ID Photo Maker',
    description: 'Standard biometric templates (US, EU, UK, India) with head/chin guidelines and printable multi-print sheets.',
    category: 'edit',
    isCompetitorPaid: true,
    badge: 'Pro Unlocked',
    icon: 'IdCard',
    inputFormats: ['image/jpeg', 'image/png'],
    outputFormats: ['image/jpeg', 'image/png'],
    supportsBatch: false,
  },
  // 17. Image Grid Splitter
  {
    id: 'image-splitter',
    name: 'Image Grid Splitter',
    description: 'Slice photos into 3×3 Instagram grids, 3×1 panoramic carousels, or custom row × column tile arrays with instant ZIP export.',
    category: 'social',
    isCompetitorPaid: false,
    icon: 'Grid',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['image/png', 'image/jpeg', 'application/zip'],
    supportsBatch: false,
  },
  // 19. EXIF Metadata Viewer and Extractor
  {
    id: 'exif-viewer',
    name: 'EXIF Metadata Viewer',
    description: 'Inspect camera parameters, lens settings, exposure, and interactive GPS coordinates on a private map.',
    category: 'metadata',
    isCompetitorPaid: false,
    icon: 'FileSearch',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'],
    outputFormats: ['application/json'],
    supportsBatch: false,
  },
  // 20. EXIF Metadata Removal
  {
    id: 'exif-remover',
    name: 'Lossless EXIF Stripper',
    description: 'Sanitize GPS, timestamps, and device serial numbers losslessly without re-compressing image pixels.',
    category: 'metadata',
    isCompetitorPaid: true,
    badge: 'Pro Unlocked',
    icon: 'ShieldCheck',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportsBatch: true,
  },
  // 21. Privacy Blur and Redaction
  {
    id: 'privacy-redact',
    name: 'Privacy Blur & Redact',
    description: 'Irreversibly blur or black out faces, license plates, and sensitive documents before sharing.',
    category: 'metadata',
    isCompetitorPaid: true,
    badge: 'Pro Unlocked',
    icon: 'EyeOff',
    inputFormats: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['image/png', 'image/jpeg'],
    supportsBatch: false,
  },
  // 22. Favicon and App Icon Studio
  {
    id: 'favicon-studio',
    name: 'Favicon & App Icon Studio',
    description: 'Generate multi-size .ico files, Apple Touch Icons, and manifest.json web app packages.',
    category: 'social',
    isCompetitorPaid: true,
    badge: 'Pro Unlocked',
    icon: 'AppWindow',
    inputFormats: ['image/png', 'image/jpeg', 'image/svg+xml'],
    outputFormats: ['image/x-icon', 'image/png', 'application/zip'],
    supportsBatch: false,
  },
  // 23. Image to Base64 URI
  {
    id: 'image-to-base64',
    name: 'Image to Base64 URI',
    description: 'Convert any image to a data URI string, HTML <img> tag, or CSS background declaration.',
    category: 'convert',
    isCompetitorPaid: false,
    icon: 'Binary',
    inputFormats: ['image/*'],
    outputFormats: ['text/plain'],
    supportsBatch: true,
  },
  // 24. Base64 to Image Decoder
  {
    id: 'base64-to-image',
    name: 'Base64 to Image Decoder',
    description: 'Paste base64 strings or data URIs to inspect, preview, and download as clean image files.',
    category: 'convert',
    isCompetitorPaid: false,
    icon: 'FileCode',
    inputFormats: ['text/plain'],
    outputFormats: ['image/png', 'image/jpeg', 'image/webp'],
    supportsBatch: false,
  },
  // 25. Camera RAW to JPG Conversion
  {
    id: 'camera-raw',
    name: 'Camera RAW to JPG Studio',
    description: 'Instant preview extraction and true 14-bit demosaicing for Canon CR2, Nikon NEF, Sony ARW, and DNG.',
    category: 'convert',
    isCompetitorPaid: true,
    badge: 'Pro Unlocked',
    icon: 'Camera',
    inputFormats: ['.cr2', '.cr3', '.nef', '.arw', '.dng', '.orf', '.raf'],
    outputFormats: ['image/jpeg', 'image/png'],
    supportsBatch: true,
    isCloudHybrid: true,
  },
];

