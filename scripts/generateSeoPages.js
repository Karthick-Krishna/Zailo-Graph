import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const TOOLS_DIR = path.join(ROOT_DIR, 'tools');
const PUBLIC_TOOLS_DIR = path.join(ROOT_DIR, 'public', 'tools');
const SITEMAP_FILE = path.join(ROOT_DIR, 'public', 'sitemap.xml');
const ROBOTS_FILE = path.join(ROOT_DIR, 'public', 'robots.txt');

[TOOLS_DIR, PUBLIC_TOOLS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// All 60 tool definitions (20 primary + 3 legacy format aliases + 37 document conversions)
export const ALL_TOOLS_SEO = [
  // ==========================================
  // SECTION 1: 20 PRIMARY STUDIO UTILITIES
  // ==========================================
  {
    id: 'workflow-recipes',
    name: '1-Click Workflow Recipes',
    title: 'Free 1-Click Image Automation Recipes - Amazon, YouTube & Passport | Zailo Graph',
    description: 'Automate multi-step image workflows in one click. Instant presets for Amazon FBA white backgrounds, YouTube thumbnails, passport biometrics, and SEO WebP compression.',
    keywords: 'image automation, 1-click recipes, amazon product photo white background, youtube thumbnail resizer, passport photo maker, batch image optimization',
    category: 'recipes',
    h1: '1-Click Image Automation Recipes',
    howTo: [
      'Select a workflow recipe (e.g., Amazon FBA, YouTube Thumbnail, Biometric Passport).',
      'Drop your single image or batch queue into the browser canvas.',
      'Review instant automated resizing, background processing, and format encoding.',
      'Download individual processed files or complete ZIP archive.'
    ],
    faqs: [
      { q: 'Are images uploaded to any cloud servers?', a: 'No. All recipe automations run entirely inside your browser using WebAssembly. Your photos never leave your device.' },
      { q: 'Can I process multiple images at once?', a: 'Yes. You can drag and drop up to 50 photos into the batch queue for simultaneous recipe execution.' }
    ]
  },
  {
    id: 'batch-resize',
    name: 'Image Resolution Converter',
    title: 'Free Image Resolution Converter - Change Pixel Dimensions & DPI Online | Zailo Graph',
    description: 'Convert and scale image resolution by exact pixel dimensions, percentage, or aspect ratio using high-fidelity Lanczos3 resampling with zero quality loss. 100% private in-browser tool.',
    keywords: 'image resolution converter, change image resolution, photo resolution converter, resize image resolution, convert image resolution online, high resolution image converter, lanczos3 resizer',
    category: 'optimize',
    h1: 'Image Resolution Converter (Private & Lossless)',
    howTo: [
      'Upload single or multiple images into the resolution converter workspace.',
      'Select scaling mode: Exact pixel dimensions (px), percentage scale (%), or preset aspect ratios.',
      'Choose resampling filter (Lanczos3 for maximum sharpness, Bicubic, or Pixel Art nearest-neighbor).',
      'Export individually or download all converted resolution files in a single ZIP package.'
    ],
    faqs: [
      { q: 'Does changing image resolution reduce quality?', a: 'Our engine uses Lanczos-3 sinc mathematical interpolation to preserve edge sharpness and prevent blurring during resolution scaling.' },
      { q: 'Can I convert resolution without changing the aspect ratio?', a: 'Yes. The aspect ratio lock toggle keeps your proportions mathematically locked.' }
    ]
  },
  {
    id: 'compression',
    name: 'Image Compression Studio',
    title: 'Free Online Image Compressor - Lossless & Lossy MozJPEG, WebP, OxiPNG | Zailo Graph',
    description: 'Compress JPG, PNG, and WebP images by up to 90% without visible quality loss. Powered by native MozJPEG, OxiPNG, and WebP WebAssembly codecs with real-time split-screen preview.',
    keywords: 'compress image online, free photo compressor, reduce image size, mozjpeg wasm, oxipng optimizer, webp compression, lossless compression',
    category: 'optimize',
    h1: 'Client-Side Image Compression Studio',
    howTo: [
      'Drag and drop your JPG, PNG, or WebP photo into the studio.',
      'Adjust the quality slider and view live before/after comparison with the interactive split wipe.',
      'Inspect real-time byte savings and file size metrics.',
      'Click Download to save your optimized lightweight image.'
    ],
    faqs: [
      { q: 'How does this compare to TinyPNG or other online tools?', a: 'Unlike TinyPNG, your images are NEVER uploaded to an external server. Compression executes 100% locally on your computer hardware via WASM.' },
      { q: 'Does PNG compression remove transparency?', a: 'No. Alpha transparency is strictly preserved across all compression modes.' }
    ]
  },
  {
    id: 'document-converter',
    name: 'Document & File Converter',
    title: 'Free Online Document Converter - Word, PDF, Excel, PowerPoint & Archives | Zailo Graph',
    description: 'Convert Word DOCX, PDF, Excel XLSX, PowerPoint PPTX, RTF, ODT, CSV, Images and Archives directly in your browser. 37 professional conversion tools with 100% privacy and zero cloud uploads.',
    keywords: 'word to pdf, pdf to word docx, excel to pdf, pptx to pdf, pptx to images, csv to xlsx, odt to docx, rtf to pdf, image to pdf, pdf to jpg, private document converter',
    category: 'convert',
    h1: 'Privacy-First Document & File Converter',
    howTo: [
      'Select your conversion type from Documents, Presentations, Spreadsheets, Images to PDF, PDF to Images, or Archives.',
      'Drop your Word, PDF, Excel, PowerPoint, image, or archive file into the converter.',
      'Click Convert to execute genuine client-side formatting and layout transformation.',
      'Download your converted file instantly or get all pages/slides in a clean ZIP package.'
    ],
    faqs: [
      { q: 'Is my document uploaded to a third-party server?', a: 'No. All document conversions run 100% inside your browser using WebAssembly. Your files never touch a cloud server.' },
      { q: 'Does PDF to Word produce editable text?', a: 'Yes. Our conversion engine extracts editable text, reconstructs tables, and outputs genuine OpenXML DOCX documents.' }
    ]
  },
  {
    id: 'format-converter',
    name: 'Universal Image Converter',
    title: 'Free Universal Image Converter - Convert Between JPG, PNG, WebP & AVIF | Zailo Graph',
    description: 'Convert any image format seamlessly in your browser. Convert Apple HEIC, WebP, PNG, JPEG, and AVIF with custom quality, EXIF metadata retention, and background fill options. 100% private.',
    keywords: 'image converter, convert to jpg, convert to png, webp to jpg, heic to jpg, image format converter, avif converter, batch image converter',
    category: 'convert',
    h1: 'Universal Image Format Converter (JPG, PNG, WebP, AVIF)',
    howTo: [
      'Select or drop your source image in any format (HEIC, WebP, PNG, JPG, AVIF).',
      'Choose your destination format: JPG/JPEG, PNG, WebP, or AVIF.',
      'Configure output quality, background fill for transparent images, and EXIF metadata retention.',
      'Click Convert and download your converted high-fidelity image.'
    ],
    faqs: [
      { q: 'Can I convert Apple iPhone HEIC photos to JPG?', a: 'Yes. Universal Image Converter decodes Apple HEIC and HEIF photos directly in browser memory and outputs high-resolution JPG or PNG.' },
      { q: 'Does converting PNG to JPG support background color?', a: 'Yes. You can customize the background fill color (white, black, or custom hex) to replace transparent alpha channels.' }
    ]
  },
  {
    id: 'svg-to-png',
    name: 'SVG to PNG Converter',
    title: 'Free Online SVG to PNG Converter - High DPI Vector Rasterizer | Zailo Graph',
    description: 'Convert vector SVG files into crisp, high-resolution PNG raster graphics at 1x, 2x, 4x, or custom DPI up to 8192px with full transparency preservation. 100% private in-browser conversion.',
    keywords: 'svg to png, convert svg to png, high res svg rasterizer, vector to png 300 dpi, svg to transparent png, svg batch converter',
    category: 'convert',
    h1: 'High-Resolution SVG to PNG Rasterizer',
    howTo: [
      'Drop your SVG vector file into the conversion workspace.',
      'Select your scaling multiplier (1x, 2x, 4x Ultra HD, or Custom Dimensions up to 8K).',
      'Toggle transparent background or choose solid color fill.',
      'Export crystal-clear PNG with zero vector curve degradation.'
    ],
    faqs: [
      { q: 'Does rasterizing cause pixelation or blur?', a: 'No. Vectors are re-rendered mathematically directly at your desired target canvas dimensions before rasterization.' },
      { q: 'Can I export at 300 DPI for print?', a: 'Yes. Toggle 300 DPI print-ready mode to produce publication-grade raster graphics.' }
    ]
  },
  {
    id: 'png-to-svg',
    name: 'PNG to SVG Vectorizer',
    title: 'Free Online Image Vectorizer - Convert PNG & JPG to Scalable SVG | Zailo Graph',
    description: 'Convert raster PNG and JPG images into clean, scalable vector SVG paths. Trace logos, silhouettes, and illustrations locally in browser memory without quality degradation.',
    keywords: 'png to svg, convert image to vector, vectorize logo, bitmap to vector svg, trace bitmap to svg, autotrace online free',
    category: 'convert',
    h1: 'Client-Side Bitmap to Vector SVG Converter',
    howTo: [
      'Upload your PNG, JPG, or WebP logo, icon, or artwork.',
      'Select vectorization mode: Monochrome Silhouette, Color Posterize, or High-Fidelity Contour.',
      'Fine-tune color count, speckle noise reduction, and path smoothness.',
      'Download clean, infinite-resolution SVG vector markup.'
    ],
    faqs: [
      { q: 'What types of images vectorize best?', a: 'High-contrast logos, line art, icons, illustrations, and typography produce optimal clean vector curves.' },
      { q: 'Are my images uploaded to an AI tracing server?', a: 'No. Tracing and curve fitting algorithms execute completely inside your browser.' }
    ]
  },
  {
    id: 'rotate-flip',
    name: 'Image Rotate & Flip',
    title: 'Free Online Image Rotate & Flip - 90°, 180°, 270° & Mirror Reflection | Zailo Graph',
    description: 'Rotate images by 90, 180, 270 degrees, arbitrary angle skew, and mirror flip horizontally or vertically. Instant client-side transformation with zero loss of quality.',
    keywords: 'rotate image online, flip image horizontally, mirror photo, flip vertically, rotate photo 90 degrees, straighten photo',
    category: 'edit',
    h1: 'Lossless Image Rotate & Mirror Flip',
    howTo: [
      'Drop your photo into the rotation workspace.',
      'Click 90° Clockwise, Counter-Clockwise, or 180° inversion.',
      'Toggle Flip Horizontal (Mirror) or Flip Vertical.',
      'Download your reoriented photo instantly.'
    ],
    faqs: [
      { q: 'Does rotating recompress my photo?', a: 'Orthogonal rotations (90°, 180°, 270°) and axis flips preserve pixel fidelity without degradation.' },
      { q: 'Does it fix iPhone EXIF orientation issues?', a: 'Yes. It normalizes EXIF orientation tags to standard canonical pixel coordinate layouts.' }
    ]
  },
  {
    id: 'meme-generator',
    name: 'Meme Generator Studio',
    title: 'Free Online Meme Generator - Custom Text, Impact Font & Templates | Zailo Graph',
    description: 'Create viral memes with custom top and bottom text, classic Impact font styling with black outline stroke, custom positioning, and watermark-free export.',
    keywords: 'meme generator, make a meme online free, impact font meme maker, meme maker without watermark, private meme generator',
    category: 'edit',
    h1: 'Fast, Watermark-Free Online Meme Generator',
    howTo: [
      'Upload any photo or template image.',
      'Type your punchline in Top Text and Bottom Text fields.',
      'Adjust font size, text color, stroke outline thickness, and all-caps styling.',
      'Download your high-resolution meme without forced watermarks.'
    ],
    faqs: [
      { q: 'Does Zailo Graph add a watermark to my memes?', a: 'Never. All generated memes are 100% clean and watermark-free.' },
      { q: 'Can I use custom fonts or colors?', a: 'Yes. You can customize text color, outline stroke, font size, and text alignment.' }
    ]
  },
  {
    id: 'image-splitter',
    name: 'Image Grid Splitter',
    title: 'Free Online Image Grid Splitter - 3x3 Instagram Grids & Carousels | Zailo Graph',
    description: 'Slice photos into 3x3 Instagram grid posts, 3x1 seamless panorama carousels, or custom rows and columns. Export numbered tiles packaged in a single ZIP file.',
    keywords: 'image grid splitter, slice photo instagram 3x3, split image into tiles, panoramic carousel splitter, instagram grid maker',
    category: 'social',
    h1: 'Social Grid & Panorama Image Splitter',
    howTo: [
      'Upload the photo or panorama you want to split.',
      'Choose a preset (Instagram 3×3 Grid, 3×1 Carousel) or define custom Row × Column counts.',
      'Preview cut lines and slice boundaries on the canvas.',
      'Click Download to receive all numbered tiles in a clean ZIP archive.'
    ],
    faqs: [
      { q: 'Are the split tiles numbered in the correct order for Instagram?', a: 'Yes. Tiles are automatically indexed from top-left to bottom-right (tile_1.jpg, tile_2.jpg, etc.) for seamless sequential uploading.' },
      { q: 'Does slicing reduce resolution?', a: 'No. Each tile is cropped directly from master image pixels with zero downsampling.' }
    ]
  },
  {
    id: 'sharpen-enhance',
    name: 'Sharpen & Enhance',
    title: 'Free Online Image Sharpen & Enhance - Unsharp Mask & Micro-Contrast | Zailo Graph',
    description: 'Enhance photo sharpness, micro-contrast, and clarity using professional Unsharp Mask and high-pass convolution filters with real-time before/after inspection.',
    keywords: 'sharpen image online, unsharp mask wasm, enhance photo clarity, fix blurry photo, increase image contrast',
    category: 'optimize',
    h1: 'Professional Image Sharpening & Clarity Studio',
    howTo: [
      'Upload your photo into the enhancement canvas.',
      'Adjust Sharpening Radius and Amount sliders to bring out crisp details.',
      'Fine-tune Micro-Contrast and Saturation for punchy visuals.',
      'Compare original vs enhanced with the live split slider and download.'
    ],
    faqs: [
      { q: 'How does Unsharp Mask differ from basic contrast?', a: 'Unsharp Mask detects high-frequency pixel edges and sharpens contrast along boundaries without blowing out flat areas.' },
      { q: 'Can it fix out-of-focus photos?', a: 'It significantly restores edge clarity and micro-detail on soft photos.' }
    ]
  },
  {
    id: 'social-presets',
    name: 'Social Media Presets',
    title: 'Free Social Media Image Resizer - Instagram, YouTube, TikTok & LinkedIn | Zailo Graph',
    description: 'Instant pixel-perfect dimensions for Instagram Posts & Stories, YouTube Banners & Thumbnails, TikTok, Twitter/X Headers, LinkedIn, and Facebook with smart crop centering.',
    keywords: 'social media image resizer, instagram post dimensions, youtube thumbnail resizer, linkedin banner size, tiktok photo size, crop for social media',
    category: 'social',
    h1: 'Instant Social Media Image Resizing & Cropping',
    howTo: [
      'Drop your photo or banner artwork into the social resizer.',
      'Select your target network and format (Instagram Square, Story, YouTube Banner, Twitter Header, etc.).',
      'Adjust smart crop focus to frame the subject perfectly.',
      'Download optimized asset ready for immediate upload.'
    ],
    faqs: [
      { q: 'Are these aspect ratios kept up-to-date with 2026 platform specifications?', a: 'Yes. All presets strictly follow official 2026 resolution guidelines for Meta, Google, ByteDance, and LinkedIn.' },
      { q: 'Can I export for multiple platforms simultaneously?', a: 'Yes. Add multiple presets to batch queue and export all platform variants in one ZIP.' }
    ]
  },
  {
    id: 'watermark',
    name: 'Watermark Stamper',
    title: 'Free Online Watermark Stamper - Text & Logo Branding Protection | Zailo Graph',
    description: 'Protect creative assets with customizable text or PNG logo watermarks. Position in corners, center, or tile across the entire image with opacity control.',
    keywords: 'watermark photos online, add logo to photo, batch watermark images, copyright stamp photo, tile watermark free',
    category: 'edit',
    h1: 'Client-Side Photo Watermark & Copyright Stamper',
    howTo: [
      'Upload the photo or batch queue you want to protect.',
      'Choose Text Watermark (with custom font, color, and size) or upload your PNG logo.',
      'Adjust opacity transparency, rotation angle, and 9-point anchor alignment (or full diagonal tiling).',
      'Download protected watermarked images instantly.'
    ],
    faqs: [
      { q: 'Can I batch watermark multiple photos at once?', a: 'Yes. Upload up to 50 photos in batch mode and apply your brand watermark across all files simultaneously.' },
      { q: 'Does watermarking re-encode EXIF copyright metadata?', a: 'Yes. You can optionally embed your copyright notice into the EXIF header simultaneously.' }
    ]
  },
  {
    id: 'collage-maker',
    name: 'Photo Collage Maker',
    title: 'Free Online Photo Collage Maker - Multi-Photo Grids & Layouts | Zailo Graph',
    description: 'Combine multiple photos into beautiful collage layouts. Choose from 2x2 grids, side-by-side comparisons, mosaic arrangements, with custom borders and spacing.',
    keywords: 'photo collage maker, combine photos online, photo grid maker, side by side image maker, picture collage creator',
    category: 'edit',
    h1: 'Creative Multi-Photo Collage & Grid Studio',
    howTo: [
      'Select your collage layout template (Side-by-Side, 2×2 Grid, 3-Photo Hero, Mosaic).',
      'Drop images into designated collage slots.',
      'Adjust border spacing thickness, corner roundness, and background canvas color.',
      'Download your high-resolution finished collage.'
    ],
    faqs: [
      { q: 'What is the maximum resolution for collage exports?', a: 'Collages export at up to 4K resolution (3840×2160) for crystal-clear prints.' },
      { q: 'Can I swap photos between collage cells?', a: 'Yes. Simply drag and drop photos between cells to reorder.' }
    ]
  },
  {
    id: 'color-palette',
    name: 'Color Palette Extractor',
    title: 'Free Online Color Palette Extractor - Extract Hex & RGB Colors | Zailo Graph',
    description: 'Extract dominant color palettes and harmonious shades from any image using k-means color clustering. Copy HEX, RGB, CSS variables, and Tailwind color configurations.',
    keywords: 'color palette extractor, extract colors from image, image to hex palette, photo color picker, dominant colors from picture, css palette generator',
    category: 'social',
    h1: 'Smart Image Color Palette Extractor',
    howTo: [
      'Drop any photo, UI design, or artwork into the palette extractor.',
      'View automatically extracted dominant color swatches with luminance metrics.',
      'Choose palette size (4 to 8 dominant color shades).',
      'Click to copy HEX codes, RGB strings, CSS root variables, or Tailwind JSON tokens.'
    ],
    faqs: [
      { q: 'How does it pick dominant colors?', a: 'It utilizes an in-browser k-means clustering algorithm to group perceptually similar pixel vectors in CIELAB color space.' },
      { q: 'Can I copy the palette for Tailwind CSS?', a: 'Yes. One click exports a structured JSON snippet ready to paste directly into tailwind.config.js.' }
    ]
  },
  {
    id: 'passport-photo',
    name: 'Passport & ID Photo Maker',
    title: 'Free Online Passport & ID Photo Maker - US, EU, UK & India Biometric Specs | Zailo Graph',
    description: 'Create compliant biometric passport, visa, and ID photos for US, EU/Schengen, UK, and India with head height guidelines, background whitening, and printable 4x6 sheets.',
    keywords: 'passport photo maker, us passport photo size 2x2, biometric id photo maker, visa photo creator, printable 4x6 passport sheet, free passport photo online',
    category: 'edit',
    h1: 'Compliant Biometric Passport & ID Photo Maker',
    howTo: [
      'Upload a clear portrait facing forward.',
      'Select your target country template (US 2×2 inch, EU Schengen 35×45mm, UK, India Pan/Passport).',
      'Align facial crown and chin within the interactive biometric guideline markers.',
      'Toggle background whitening and download individual photo or multi-print 4×6 photo sheet.'
    ],
    faqs: [
      { q: 'Are these dimensions compliant with official embassy standards?', a: 'Yes. Dimensions, aspect ratios, and head-to-chin percentage tolerances strictly conform to ICAO Doc 9303 biometric specifications.' },
      { q: 'Can I print at a local pharmacy or home photo printer?', a: 'Yes. The 4×6 inch multi-print grid fits standard 10×15 cm photo paper and contains multiple standard cuts.' }
    ]
  },
  {
    id: 'favicon-studio',
    name: 'Favicon & App Icon Studio',
    title: 'Free Favicon Generator - Multi-Size .ICO, Apple Touch & Web Manifest | Zailo Graph',
    description: 'Generate multi-size .ico files (16x16, 32x32, 48x48), Apple Touch Icons, and manifest.json web app packages from any square logo or image.',
    keywords: 'favicon generator, generate .ico file, apple touch icon generator, web manifest icons, convert png to favicon ico, pwa icon generator',
    category: 'social',
    h1: 'Professional Favicon & Web App Icon Studio',
    howTo: [
      'Upload your square logo or icon (PNG, SVG, or JPG).',
      'Preview rendered appearance in browser tab simulations (Light & Dark mode).',
      'Select generation package: Multi-layer .ICO, Apple Touch Icon (180×180), and Android PWA icons.',
      'Download complete favicon bundle with ready-to-paste HTML header tags.'
    ],
    faqs: [
      { q: 'Does the .ico file contain multiple embedded resolutions?', a: 'Yes. The generated .ico package includes true multi-resolution bitmaps (16×16, 32×32, and 48×48) inside a single container.' },
      { q: 'Does it include HTML tags for my website <head>?', a: 'Yes. Complete snippet markup is provided for instant copy-pasting.' }
    ]
  },
  {
    id: 'photo-metadata-editor',
    name: 'Photo Metadata Editor',
    title: 'Free Photo Metadata Editor - View, Edit & Strip EXIF & GPS Online | Zailo Graph',
    description: 'Inspect, edit, add, or strip EXIF, IPTC, and XMP metadata tags directly in your browser. Edit Author, Copyright, DateTime, Camera parameters, and GPS coordinates with zero server uploads.',
    keywords: 'photo metadata editor, edit exif online, change photo date, edit photo author copyright, remove gps from photo, exif editor free, view photo metadata',
    category: 'metadata',
    h1: 'Privacy-First Photo Metadata (EXIF/IPTC) Editor',
    howTo: [
      'Upload your JPG, PNG, WebP, or TIFF photograph.',
      'Inspect existing EXIF tags: Camera Make/Model, Shutter, Aperture, ISO, and GPS location.',
      'Edit or add metadata fields: Title, Author/Photographer, Copyright notice, Creation date, or GPS coordinates.',
      'Click Apply to update metadata or click "Strip All Metadata" for 100% privacy scrubbing.'
    ],
    faqs: [
      { q: 'Can I remove GPS coordinates while keeping camera details?', a: 'Yes. You can selectively delete or modify GPS coordinates while retaining camera settings and copyright information.' },
      { q: 'Is metadata editing lossless?', a: 'Yes. Metadata updates modify container headers directly without recompressing pixel bitstreams.' }
    ]
  },
  {
    id: 'video-metadata-editor',
    name: 'Video Metadata Editor',
    title: 'Free Video Metadata Editor - Edit MP4, MOV & WebM Container Tags | Zailo Graph',
    description: 'Inspect and edit video container metadata tags: Title, Artist, Year, Description, and Copyright for MP4, MOV, and WebM videos. 100% private client-side processing.',
    keywords: 'video metadata editor, edit mp4 tags online, change video title author, edit mov metadata, strip video metadata, mp4 tag editor free, private video editor',
    category: 'metadata',
    h1: 'Client-Side Video Container Metadata Editor',
    howTo: [
      'Drag and drop your MP4, MOV, or WebM video file.',
      'Inspect stream information: Resolution, Duration, Format, and Container Tags.',
      'Edit Title, Artist, Director, Release Year, Description, and Copyright notice.',
      'Click Apply to export your video with updated metadata or sanitize all tags.'
    ],
    faqs: [
      { q: 'Does editing video metadata require re-encoding video tracks?', a: 'No. Metadata tags are stored in container atom headers, allowing instant updates without time-consuming video transcoding.' },
      { q: 'Are my videos uploaded to any server?', a: 'No. Videos are processed entirely inside your local browser memory using WebAssembly.' }
    ]
  },
  {
    id: 'privacy-redact',
    name: 'Privacy Blur & Redact',
    title: 'Free Online Image Redaction - Blur & Black Out Faces, IDs & Plates | Zailo Graph',
    description: 'Irreversibly blur or black out faces, license plates, credit cards, and sensitive document text before sharing. Permanent pixel-level destruction with zero data leaks.',
    keywords: 'blur face online, redact document image, blackout sensitive info photo, blur license plate, private photo redaction, permanent pixel blur',
    category: 'metadata',
    h1: 'Irreversible Privacy Blur & Document Redaction',
    howTo: [
      'Upload the image or confidential document to redact.',
      'Click and drag bounding boxes over faces, license plates, or confidential numbers.',
      'Choose redaction style: Deep Gaussian Blur or Solid Opaque Blackout.',
      'Download permanently sanitized image with zero recoverable underlying pixels.'
    ],
    faqs: [
      { q: 'Can someone undo or un-blur the redacted areas?', a: 'No. The redaction permanently overwrites and destroys original underlying pixel data on the HTML5 Canvas.' },
      { q: 'Is EXIF metadata removed when redacting?', a: 'Yes. Redaction exports automatically scrub GPS coordinates and camera fingerprints for complete privacy.' }
    ]
  },

  // ==========================================
  // SECTION 2: 3 LEGACY FORMAT ALIASES
  // ==========================================
  {
    id: 'heic-converter',
    name: 'Apple HEIC to JPG Converter',
    title: 'Free Apple HEIC to JPG Converter - Convert iPhone Photos Online | Zailo Graph',
    description: 'Convert Apple iPhone HEIC and HEIF photos to universal high-quality JPG or PNG images directly in your browser. 100% private with zero file uploads.',
    keywords: 'heic to jpg, convert heic to jpg online, iphone photo converter, heic to png, apple heic converter, free heic to jpg batch',
    category: 'convert',
    h1: 'Apple HEIC to High-Fidelity JPG Converter',
    howTo: [
      'Select or drop Apple HEIC or HEIF photos from your iPhone or Mac.',
      'Select destination format: JPG/JPEG or PNG.',
      'Adjust quality slider and choose whether to preserve camera EXIF tags.',
      'Download converted photos individually or in a single ZIP package.'
    ],
    faqs: [
      { q: 'Why convert HEIC to JPG?', a: 'While HEIC offers great compression on Apple devices, JPG is universally supported across Windows, Android, websites, and photo printing services.' },
      { q: 'Is there a file size limit?', a: 'Free registered accounts can convert HEIC files up to 100 MB directly in local browser RAM.' }
    ]
  },
  {
    id: 'webp-to-raster',
    name: 'WebP to PNG/JPG Converter',
    title: 'Free WebP to PNG & JPG Converter - Convert WebP Images Online | Zailo Graph',
    description: 'Convert modern WebP images to traditional PNG (with transparency) or high-quality JPG formats in your browser without quality loss.',
    keywords: 'webp to png, webp to jpg, convert webp online free, save webp as png, webp to jpeg converter, batch webp converter',
    category: 'convert',
    h1: 'Instant WebP to PNG & JPG Image Converter',
    howTo: [
      'Upload single or multiple WebP images.',
      'Choose output format: PNG (retains transparency) or JPG (custom compression).',
      'Configure background color if converting transparent WebP to JPG.',
      'Download converted files instantly.'
    ],
    faqs: [
      { q: 'Will converting WebP to PNG maintain transparent backgrounds?', a: 'Yes. Full 8-bit alpha transparency is strictly preserved when converting to PNG.' },
      { q: 'Can I batch convert WebP files?', a: 'Yes. Drag and drop multiple WebP images to batch convert all files in one click.' }
    ]
  },
  {
    id: 'raster-to-webp',
    name: 'PNG/JPG to WebP Converter',
    title: 'Free JPG & PNG to WebP Converter - High-Efficiency Next-Gen Images | Zailo Graph',
    description: 'Convert JPG and PNG images into modern Google WebP format. Reduce file sizes by 30-50% for Lighthouse 100 web performance while preserving visual fidelity.',
    keywords: 'png to webp, jpg to webp, convert to webp online, reduce image size webp, next-gen image converter, lighthouse 100 image optimization',
    category: 'convert',
    h1: 'Next-Gen JPG & PNG to WebP Converter',
    howTo: [
      'Drop your JPG, PNG, or AVIF images into the converter.',
      'Set target WebP quality (80-85% recommended for web performance).',
      'Review real-time file size savings and visual fidelity.',
      'Download your optimized lightweight WebP files.'
    ],
    faqs: [
      { q: 'Why should I convert images to WebP?', a: 'WebP provides superior lossless and lossy compression, resulting in 26% smaller files than PNGs and 25-34% smaller than JPEGs for faster site loading.' },
      { q: 'Are all modern web browsers compatible with WebP?', a: 'Yes. Over 97% of global web browsers natively support WebP images.' }
    ]
  },

  // ==========================================
  // SECTION 3: 37 DOCUMENT CONVERSIONS
  // ==========================================
  {
    id: 'word-to-pdf',
    name: 'Word to PDF Converter',
    title: 'Free Word to PDF Converter - Convert DOCX & DOC to PDF Online | Zailo Graph',
    description: 'Convert Microsoft Word DOCX and DOC documents to professional, layout-preserved PDF files directly in your browser. 100% private with zero cloud uploads.',
    keywords: 'word to pdf, convert word to pdf online free, docx to pdf, doc to pdf converter, private word to pdf, client side docx converter',
    category: 'convert',
    h1: 'Private Word to PDF Converter (DOCX & DOC)',
    howTo: [
      'Drop your Word document (.docx or .doc) into the converter.',
      'Review formatting, tables, headings, and embedded images.',
      'Click Convert to generate an authentic vector PDF.',
      'Download your PDF instantly.'
    ],
    faqs: [
      { q: 'Is my Word document uploaded to a server?', a: 'No. Document parsing and PDF generation execute 100% inside your browser.' },
      { q: 'Are fonts and tables preserved?', a: 'Yes. Our converter maintains typography, margins, headings, and table structures.' }
    ]
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word Converter',
    title: 'Free PDF to Word Converter - Convert PDF to Editable DOCX | Zailo Graph',
    description: 'Convert PDF documents into editable Microsoft Word DOCX files. Extracts text, tables, and formatting directly in your browser with zero server transmission.',
    keywords: 'pdf to word, convert pdf to docx, editable word from pdf, free pdf to word converter, pdf to doc online private',
    category: 'convert',
    h1: 'PDF to Editable Word (DOCX) Converter',
    howTo: [
      'Upload your PDF document.',
      'Our engine extracts text streams, layout blocks, and tables.',
      'Click Convert to generate a formatted DOCX document.',
      'Download and edit in Microsoft Word, Google Docs, or LibreOffice.'
    ],
    faqs: [
      { q: 'Can I edit the converted Word file?', a: 'Yes. The output is a genuine OpenXML DOCX document with editable text and paragraphs.' },
      { q: 'Is confidential data protected?', a: 'Completely. Conversion runs locally in browser memory.' }
    ]
  },
  {
    id: 'word-doc-to-docx',
    name: 'Word DOC to DOCX Converter',
    title: 'Free Word DOC to DOCX Converter - Upgrade Legacy Word Files | Zailo Graph',
    description: 'Modernize legacy Word 97-2003 binary .doc files into OpenXML DOCX format directly in your browser.',
    keywords: 'doc to docx, convert legacy word to docx, word 97-2003 to docx, upgrade doc file online',
    category: 'convert',
    h1: 'Legacy Word DOC to Modern DOCX Converter',
    howTo: [
      'Upload your legacy .doc Word file.',
      'Click Convert to modernize the binary structure into OpenXML format.',
      'Download your clean .docx document.'
    ],
    faqs: [
      { q: 'Why convert DOC to DOCX?', a: 'DOCX is the modern XML standard supported by all current office suites and provides smaller file sizes.' }
    ]
  },
  {
    id: 'docx-to-doc',
    name: 'Word DOCX to DOC Converter',
    title: 'Free Word DOCX to DOC Converter - Convert to Legacy Word Format | Zailo Graph',
    description: 'Convert modern Word DOCX documents to legacy Word 97-2003 DOC format for compatibility with older software systems.',
    keywords: 'docx to doc, convert word to old doc, word docx to 97-2003, doc converter online',
    category: 'convert',
    h1: 'Word DOCX to Legacy DOC Converter',
    howTo: [
      'Upload your modern .docx document.',
      'Click Convert to generate a legacy-compatible .doc file.',
      'Download your file.'
    ],
    faqs: [
      { q: 'When is DOC format needed?', a: 'Older enterprise systems or legacy hardware sometimes require binary .doc files.' }
    ]
  },
  {
    id: 'txt-to-pdf',
    name: 'TXT to PDF Converter',
    title: 'Free Text TXT to PDF Converter - Create Formatted PDF from Plain Text | Zailo Graph',
    description: 'Convert plain text TXT files into clean, professional PDF documents with customizable typography and margins. 100% private in-browser tool.',
    keywords: 'txt to pdf, convert text file to pdf, plain text to pdf, notepad to pdf online free',
    category: 'convert',
    h1: 'Plain Text TXT to Formatted PDF Converter',
    howTo: [
      'Upload or paste your plain text (.txt) file.',
      'Click Convert to format text with clean margins and page numbering.',
      'Download your publication-ready PDF.'
    ],
    faqs: [
      { q: 'Does it support multi-page text files?', a: 'Yes. Long text files are automatically paginated with clean headers and page counts.' }
    ]
  },
  {
    id: 'rtf-to-pdf',
    name: 'RTF to PDF Converter',
    title: 'Free RTF to PDF Converter - Convert Rich Text to PDF Online | Zailo Graph',
    description: 'Convert Rich Text Format (.rtf) documents to PDF with styled fonts, colors, and layout preserved.',
    keywords: 'rtf to pdf, rich text format to pdf, convert rtf to pdf free online',
    category: 'convert',
    h1: 'Rich Text Format (RTF) to PDF Converter',
    howTo: [
      'Upload your .rtf rich text document.',
      'Review formatting styles and click Convert.',
      'Download your formatted PDF.'
    ],
    faqs: [
      { q: 'Are bold, italics, and font sizes preserved?', a: 'Yes. RTF style control words are translated into PDF text styling.' }
    ]
  },
  {
    id: 'pdf-to-rtf',
    name: 'PDF to RTF Converter',
    title: 'Free PDF to RTF Converter - Extract Rich Text from PDF | Zailo Graph',
    description: 'Extract formatted text and paragraphs from PDF documents into Rich Text Format (.rtf).',
    keywords: 'pdf to rtf, convert pdf to rich text, extract text from pdf rtf',
    category: 'convert',
    h1: 'PDF to Rich Text Format (RTF) Converter',
    howTo: [
      'Upload your PDF document.',
      'Click Convert to extract text with paragraph formatting.',
      'Download your .rtf file.'
    ],
    faqs: [
      { q: 'Can RTF be opened in WordPad and TextEdit?', a: 'Yes. RTF is universally supported by basic system text editors.' }
    ]
  },
  {
    id: 'rtf-to-docx',
    name: 'RTF to Word DOCX Converter',
    title: 'Free RTF to DOCX Converter - Convert Rich Text to Word | Zailo Graph',
    description: 'Convert Rich Text Format (.rtf) files into modern Microsoft Word DOCX documents with styles preserved.',
    keywords: 'rtf to docx, convert rtf to word docx, rich text to docx online free',
    category: 'convert',
    h1: 'Rich Text Format (RTF) to Word DOCX Converter',
    howTo: [
      'Upload your .rtf file.',
      'Click Convert to generate an OpenXML DOCX document.',
      'Download your Word file.'
    ],
    faqs: [
      { q: 'Does it preserve fonts and alignments?', a: 'Yes. Heading styles and alignments are converted into Word styles.' }
    ]
  },
  {
    id: 'docx-to-rtf',
    name: 'Word DOCX to RTF Converter',
    title: 'Free Word DOCX to RTF Converter - Export Word to Rich Text | Zailo Graph',
    description: 'Export Microsoft Word DOCX files to universal Rich Text Format (.rtf) for cross-platform compatibility.',
    keywords: 'docx to rtf, convert word to rtf, save docx as rich text format',
    category: 'convert',
    h1: 'Word DOCX to Rich Text Format (RTF) Converter',
    howTo: [
      'Upload your Word DOCX file.',
      'Click Convert to export as universal RTF.',
      'Download your .rtf file.'
    ],
    faqs: [
      { q: 'Why export to RTF?', a: 'RTF can be opened on virtually any device without installing Microsoft Office.' }
    ]
  },
  {
    id: 'odt-to-pdf',
    name: 'ODT to PDF Converter',
    title: 'Free ODT to PDF Converter - Convert OpenDocument Text to PDF | Zailo Graph',
    description: 'Convert LibreOffice and OpenOffice OpenDocument Text (.odt) files to PDF directly in your browser.',
    keywords: 'odt to pdf, convert opendocument to pdf, libreoffice to pdf online, openoffice to pdf',
    category: 'convert',
    h1: 'OpenDocument Text (ODT) to PDF Converter',
    howTo: [
      'Upload your .odt file.',
      'Click Convert to render document layout into vector PDF.',
      'Download your PDF.'
    ],
    faqs: [
      { q: 'Does it support LibreOffice Writer files?', a: 'Yes. All standard ODF text documents are fully supported.' }
    ]
  },
  {
    id: 'pdf-to-odt',
    name: 'PDF to ODT Converter',
    title: 'Free PDF to ODT Converter - Convert PDF to OpenDocument Text | Zailo Graph',
    description: 'Convert PDF documents into editable OpenDocument Text (.odt) for LibreOffice and Apache OpenOffice.',
    keywords: 'pdf to odt, convert pdf to opendocument, pdf to libreoffice writer, editable odt from pdf',
    category: 'convert',
    h1: 'PDF to OpenDocument Text (ODT) Converter',
    howTo: [
      'Upload your PDF document.',
      'Click Convert to extract editable text into an OpenDocument container.',
      'Download your .odt file.'
    ],
    faqs: [
      { q: 'Can I edit the output in LibreOffice?', a: 'Yes. The file opens natively in LibreOffice Writer.' }
    ]
  },
  {
    id: 'odt-to-docx',
    name: 'ODT to Word DOCX Converter',
    title: 'Free ODT to Word DOCX Converter - Convert OpenDocument to Word | Zailo Graph',
    description: 'Convert LibreOffice ODT text documents into Microsoft Word DOCX format seamlessly in browser memory.',
    keywords: 'odt to docx, convert libreoffice to word, opendocument to docx online free',
    category: 'convert',
    h1: 'OpenDocument (ODT) to Word DOCX Converter',
    howTo: [
      'Upload your .odt document.',
      'Click Convert to transform into Microsoft Word DOCX.',
      'Download your Word file.'
    ],
    faqs: [
      { q: 'Is formatting preserved between ODT and Word?', a: 'Yes. Text formatting, tables, and lists are converted accurately.' }
    ]
  },
  {
    id: 'pptx-to-pdf',
    name: 'PowerPoint PPTX to PDF Converter',
    title: 'Free PowerPoint to PDF Converter - Convert PPTX to PDF Online | Zailo Graph',
    description: 'Convert Microsoft PowerPoint presentations (.pptx) into crisp, presentation-ready PDF slides with 100% privacy.',
    keywords: 'pptx to pdf, powerpoint to pdf, convert slides to pdf online free, pptx to pdf private',
    category: 'convert',
    h1: 'PowerPoint PPTX to PDF Presentation Converter',
    howTo: [
      'Drop your PowerPoint .pptx presentation into the workspace.',
      'Click Convert to transform slides into sequential PDF pages.',
      'Download your presentation PDF.'
    ],
    faqs: [
      { q: 'Are slide graphics and text preserved?', a: 'Yes. Slide layouts, text elements, and embedded visuals are preserved.' }
    ]
  },
  {
    id: 'ppt-to-pdf',
    name: 'PowerPoint PPT to PDF Converter',
    title: 'Free Legacy PPT to PDF Converter - Convert PowerPoint to PDF | Zailo Graph',
    description: 'Convert legacy Microsoft PowerPoint 97-2003 presentations (.ppt) into clean PDF documents.',
    keywords: 'ppt to pdf, convert old powerpoint to pdf, legacy ppt to pdf online',
    category: 'convert',
    h1: 'Legacy PowerPoint PPT to PDF Converter',
    howTo: [
      'Upload your .ppt presentation.',
      'Click Convert to generate vector PDF pages.',
      'Download your PDF.'
    ],
    faqs: [
      { q: 'Does it support older PowerPoint files?', a: 'Yes. Binary .ppt files from PowerPoint 97-2003 are supported.' }
    ]
  },
  {
    id: 'pptx-to-images',
    name: 'PowerPoint PPTX to Slide Images',
    title: 'Free PPTX to Images Converter - Extract Slides as High-Res Images | Zailo Graph',
    description: 'Convert PowerPoint PPTX slides into high-resolution JPG or PNG images packaged in a clean ZIP download.',
    keywords: 'pptx to images, powerpoint to jpg, extract slides as png, pptx to photos zip',
    category: 'convert',
    h1: 'PowerPoint PPTX to High-Resolution Slide Images',
    howTo: [
      'Upload your PowerPoint .pptx presentation.',
      'Select output format: PNG or JPG.',
      'Click Convert to render each slide into a high-DPI image.',
      'Download all slide images in a single ZIP archive.'
    ],
    faqs: [
      { q: 'Are slides numbered sequentially?', a: 'Yes. Slide files are named slide_1.png, slide_2.png, etc.' }
    ]
  },
  {
    id: 'ppt-to-images',
    name: 'PowerPoint PPT to Slide Images',
    title: 'Free PPT to Images Converter - Convert Legacy Slides to Images | Zailo Graph',
    description: 'Convert legacy PowerPoint .ppt presentations into crisp PNG or JPG slide images with instant ZIP export.',
    keywords: 'ppt to images, convert old powerpoint to jpg, ppt slides to png zip',
    category: 'convert',
    h1: 'Legacy PowerPoint PPT to Slide Images',
    howTo: [
      'Upload your legacy .ppt presentation.',
      'Click Convert to extract each slide as an image.',
      'Download your ZIP package.'
    ],
    faqs: [
      { q: 'Can I use slide images for social media or presentations?', a: 'Yes. Slide images are high resolution and ready for embedding.' }
    ]
  },
  {
    id: 'pdf-to-pptx',
    name: 'PDF to PowerPoint PPTX Converter',
    title: 'Free PDF to PowerPoint Converter - Convert PDF Pages to Slides | Zailo Graph',
    description: 'Convert PDF document pages into editable Microsoft PowerPoint presentation slides (.pptx).',
    keywords: 'pdf to pptx, convert pdf to powerpoint, pdf pages to slides, pdf to presentation online',
    category: 'convert',
    h1: 'PDF to PowerPoint PPTX Presentation Converter',
    howTo: [
      'Upload your PDF presentation or document.',
      'Click Convert to transform pages into sequential presentation slides.',
      'Download your .pptx file.'
    ],
    faqs: [
      { q: 'Does each PDF page become a slide?', a: 'Yes. Each page is mapped directly into an individual presentation slide.' }
    ]
  },
  {
    id: 'ppt-to-pptx',
    name: 'PowerPoint PPT to PPTX Converter',
    title: 'Free PowerPoint PPT to PPTX Converter - Upgrade Old Slides | Zailo Graph',
    description: 'Upgrade legacy PowerPoint 97-2003 binary .ppt files to modern OpenXML .pptx format.',
    keywords: 'ppt to pptx, upgrade old powerpoint to pptx, convert ppt to pptx online',
    category: 'convert',
    h1: 'PowerPoint PPT to Modern PPTX Converter',
    howTo: [
      'Upload your .ppt file.',
      'Click Convert to modernize into OpenXML PPTX.',
      'Download your file.'
    ],
    faqs: [
      { q: 'Why upgrade to PPTX?', a: 'PPTX files load faster, have smaller file sizes, and are compatible with modern presentation tools.' }
    ]
  },
  {
    id: 'xlsx-to-pdf',
    name: 'Excel XLSX to PDF Converter',
    title: 'Free Excel to PDF Converter - Convert XLSX Spreadsheets to PDF | Zailo Graph',
    description: 'Convert Microsoft Excel spreadsheets (.xlsx) to professional PDF tables with gridlines, formulas, and formatting preserved.',
    keywords: 'xlsx to pdf, excel to pdf, convert spreadsheet to pdf online free, excel table to pdf',
    category: 'convert',
    h1: 'Excel XLSX Spreadsheet to PDF Converter',
    howTo: [
      'Drop your Excel .xlsx workbook into the converter.',
      'Select active worksheets to include in the PDF.',
      'Click Convert to generate clean, printable tables with gridlines.',
      'Download your PDF document.'
    ],
    faqs: [
      { q: 'Are cell gridlines and formatting preserved?', a: 'Yes. Borders, fills, and alignments are translated into PDF table styling.' }
    ]
  },
  {
    id: 'xls-to-pdf',
    name: 'Excel XLS to PDF Converter',
    title: 'Free Legacy Excel XLS to PDF Converter - Convert Spreadsheets | Zailo Graph',
    description: 'Convert legacy Microsoft Excel 97-2003 spreadsheets (.xls) into formatted PDF documents.',
    keywords: 'xls to pdf, convert old excel to pdf, legacy spreadsheet to pdf online',
    category: 'convert',
    h1: 'Legacy Excel XLS to PDF Converter',
    howTo: [
      'Upload your legacy .xls spreadsheet.',
      'Click Convert to render worksheets into formatted PDF pages.',
      'Download your PDF.'
    ],
    faqs: [
      { q: 'Does it handle multiple worksheets?', a: 'Yes. All active sheets are converted into sequential PDF pages.' }
    ]
  },
  {
    id: 'xlsx-to-csv',
    name: 'Excel XLSX to CSV Converter',
    title: 'Free Excel XLSX to CSV Converter - Export Spreadsheets to CSV | Zailo Graph',
    description: 'Convert Microsoft Excel XLSX workbooks into clean Comma-Separated Values (.csv) for database import and data science.',
    keywords: 'xlsx to csv, excel to csv, convert spreadsheet to csv online, export excel data to csv',
    category: 'convert',
    h1: 'Excel XLSX to Clean CSV Data Converter',
    howTo: [
      'Upload your Excel .xlsx workbook.',
      'Select the target sheet to export.',
      'Click Convert to export sanitized CSV data.',
      'Download your .csv file.'
    ],
    faqs: [
      { q: 'Does it handle commas and quotes inside cells?', a: 'Yes. Standard RFC 4180 CSV escaping is strictly applied.' }
    ]
  },
  {
    id: 'xls-to-csv',
    name: 'Excel XLS to CSV Converter',
    title: 'Free Excel XLS to CSV Converter - Export Legacy Sheets to CSV | Zailo Graph',
    description: 'Convert legacy Excel 97-2003 spreadsheets (.xls) into standard CSV text files for analytics and database loading.',
    keywords: 'xls to csv, convert old excel to csv, legacy spreadsheet to csv online',
    category: 'convert',
    h1: 'Legacy Excel XLS to Standard CSV Converter',
    howTo: [
      'Upload your legacy .xls file.',
      'Click Convert to export table data into CSV.',
      'Download your .csv file.'
    ],
    faqs: [
      { q: 'Is data extraction private?', a: 'Yes. Your spreadsheet data never leaves your browser.' }
    ]
  },
  {
    id: 'csv-to-xlsx',
    name: 'CSV to Excel XLSX Converter',
    title: 'Free CSV to Excel Converter - Convert CSV to Formatted XLSX | Zailo Graph',
    description: 'Convert Comma-Separated Values (.csv) into styled Microsoft Excel XLSX workbooks with auto-detected data types.',
    keywords: 'csv to xlsx, convert csv to excel, csv to spreadsheet online, make excel from csv',
    category: 'convert',
    h1: 'CSV to Microsoft Excel XLSX Workbook Converter',
    howTo: [
      'Upload or paste your CSV data file.',
      'Our engine detects numbers, dates, and text strings.',
      'Click Convert to generate an authentic OpenXML XLSX workbook.',
      'Download your Excel file.'
    ],
    faqs: [
      { q: 'Are numbers and currencies formatted correctly?', a: 'Yes. Numeric columns are parsed into genuine numeric cells.' }
    ]
  },
  {
    id: 'xls-to-xlsx',
    name: 'Excel XLS to XLSX Converter',
    title: 'Free Excel XLS to XLSX Converter - Upgrade Old Spreadsheets | Zailo Graph',
    description: 'Upgrade legacy Excel 97-2003 .xls spreadsheets to modern OpenXML .xlsx workbooks directly in your browser.',
    keywords: 'xls to xlsx, convert old excel to xlsx, upgrade xls file online, excel 97-2003 to modern excel',
    category: 'convert',
    h1: 'Legacy Excel XLS to Modern XLSX Converter',
    howTo: [
      'Upload your legacy .xls file.',
      'Click Convert to upgrade workbook structure to XLSX.',
      'Download your modern Excel workbook.'
    ],
    faqs: [
      { q: 'Why upgrade XLS to XLSX?', a: 'XLSX supports over 1 million rows and has much better compression.' }
    ]
  },
  {
    id: 'xlsx-to-xls',
    name: 'Excel XLSX to XLS Converter',
    title: 'Free Excel XLSX to XLS Converter - Save as Legacy Excel Format | Zailo Graph',
    description: 'Convert modern Excel XLSX workbooks into legacy Excel 97-2003 .xls format for backward compatibility.',
    keywords: 'xlsx to xls, convert excel to old format, save xlsx as xls, legacy excel converter',
    category: 'convert',
    h1: 'Excel XLSX to Legacy XLS Converter',
    howTo: [
      'Upload your modern .xlsx workbook.',
      'Click Convert to format into legacy .xls.',
      'Download your .xls file.'
    ],
    faqs: [
      { q: 'What is the row limit for XLS?', a: 'Legacy XLS files support up to 65,536 rows per sheet.' }
    ]
  },
  {
    id: 'csv-to-xls',
    name: 'CSV to Excel XLS Converter',
    title: 'Free CSV to Legacy Excel XLS Converter | Zailo Graph',
    description: 'Convert CSV data files into legacy Microsoft Excel 97-2003 .xls format.',
    keywords: 'csv to xls, convert csv to legacy excel, export csv as old excel',
    category: 'convert',
    h1: 'CSV to Legacy Excel XLS Converter',
    howTo: [
      'Upload your CSV file.',
      'Click Convert to generate an .xls spreadsheet.',
      'Download your file.'
    ],
    faqs: [
      { q: 'Can it be opened in older Excel versions?', a: 'Yes. Fully compatible with Excel 97, 2000, and 2003.' }
    ]
  },
  {
    id: 'xls-to-ods',
    name: 'Excel XLS to ODS Converter',
    title: 'Free Excel to OpenDocument Spreadsheet (ODS) Converter | Zailo Graph',
    description: 'Convert Microsoft Excel spreadsheets into LibreOffice Calc OpenDocument Spreadsheet format (.ods).',
    keywords: 'xls to ods, excel to libreoffice calc, convert spreadsheet to opendocument ods',
    category: 'convert',
    h1: 'Excel XLS to OpenDocument Spreadsheet (ODS) Converter',
    howTo: [
      'Upload your Excel spreadsheet.',
      'Click Convert to translate into OpenDocument ODS format.',
      'Download your .ods file.'
    ],
    faqs: [
      { q: 'Does it open natively in LibreOffice Calc?', a: 'Yes. Complete native compatibility with LibreOffice and OpenOffice.' }
    ]
  },
  {
    id: 'ods-to-xls',
    name: 'ODS to Excel XLS Converter',
    title: 'Free ODS to Excel Converter - OpenDocument to Excel | Zailo Graph',
    description: 'Convert LibreOffice Calc OpenDocument Spreadsheet (.ods) files to Microsoft Excel format.',
    keywords: 'ods to xls, libreoffice calc to excel, convert opendocument spreadsheet to excel',
    category: 'convert',
    h1: 'OpenDocument Spreadsheet (ODS) to Excel Converter',
    howTo: [
      'Upload your .ods file.',
      'Click Convert to transform into Excel format.',
      'Download your file.'
    ],
    faqs: [
      { q: 'Are spreadsheet formulas retained?', a: 'Standard mathematical and financial formulas are preserved.' }
    ]
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF Converter',
    title: 'Free Images to PDF Converter - Combine JPG & PNG into One PDF | Zailo Graph',
    description: 'Combine multiple JPG, PNG, and WebP images into a single professional PDF document. Reorder pages and customize margins.',
    keywords: 'images to pdf, convert jpg to pdf, combine photos into one pdf, png to pdf multiple pages, private image to pdf',
    category: 'convert',
    h1: 'Multiple Images to Single PDF Converter',
    howTo: [
      'Drop your single or multiple photos (JPG, PNG, WebP) into the converter.',
      'Reorder images by dragging into desired page sequence.',
      'Select page orientation (Portrait, Landscape, or Auto-fit).',
      'Download your combined PDF document.'
    ],
    faqs: [
      { q: 'Can I combine different image formats into one PDF?', a: 'Yes. You can mix JPG, PNG, WebP, and AVIF photos in the same document.' }
    ]
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF Converter',
    title: 'Free JPG to PDF Converter - Convert JPEG Photos to PDF Online | Zailo Graph',
    description: 'Convert JPG photos into clean PDF documents with custom margins and orientation.',
    keywords: 'jpg to pdf, jpeg to pdf, convert photo to pdf online free, save jpg as pdf',
    category: 'convert',
    h1: 'High-Fidelity JPG to PDF Converter',
    howTo: [
      'Upload your JPG image.',
      'Choose page layout and margins.',
      'Download your PDF instantly.'
    ],
    faqs: [
      { q: 'Does it compress the JPG?', a: 'No. Original image resolution is preserved inside the PDF stream.' }
    ]
  },
  {
    id: 'png-to-pdf',
    name: 'PNG to PDF Converter',
    title: 'Free PNG to PDF Converter - Convert PNG Images to PDF Online | Zailo Graph',
    description: 'Convert PNG images with crisp text, diagrams, and transparency into vector PDF documents.',
    keywords: 'png to pdf, convert transparent png to pdf, save png as pdf online free',
    category: 'convert',
    h1: 'Crisp PNG to PDF Document Converter',
    howTo: [
      'Upload your PNG graphic or screenshot.',
      'Select layout options and click Convert.',
      'Download your PDF.'
    ],
    faqs: [
      { q: 'Is transparency supported?', a: 'Yes. Alpha transparency is rendered cleanly with a white background.' }
    ]
  },
  {
    id: 'webp-to-pdf',
    name: 'WebP to PDF Converter',
    title: 'Free WebP to PDF Converter - Convert Modern WebP to PDF | Zailo Graph',
    description: 'Convert next-generation WebP images into universal PDF documents directly in your browser.',
    keywords: 'webp to pdf, convert webp image to pdf, save webp as pdf document',
    category: 'convert',
    h1: 'WebP to Universal PDF Converter',
    howTo: [
      'Upload your WebP image.',
      'Click Convert to package into a clean PDF page.',
      'Download your PDF.'
    ],
    faqs: [
      { q: 'Can I combine multiple WebP files into one PDF?', a: 'Yes. Simply select multiple WebP files to generate a multi-page PDF.' }
    ]
  },
  {
    id: 'bmp-to-pdf',
    name: 'BMP to PDF Converter',
    title: 'Free BMP to PDF Converter - Convert Bitmap Images to PDF | Zailo Graph',
    description: 'Convert Windows Bitmap (.bmp) images into lightweight PDF documents with modern compression.',
    keywords: 'bmp to pdf, convert bitmap to pdf, save bmp as pdf online free',
    category: 'convert',
    h1: 'Windows Bitmap (BMP) to PDF Converter',
    howTo: [
      'Upload your .bmp image file.',
      'Click Convert to compress and embed into PDF.',
      'Download your PDF.'
    ],
    faqs: [
      { q: 'Does it reduce large BMP file sizes?', a: 'Yes. Uncompressed BMP data is efficiently compressed when embedded in the PDF.' }
    ]
  },
  {
    id: 'tiff-to-pdf',
    name: 'TIFF to PDF Converter',
    title: 'Free TIFF to PDF Converter - Convert Multi-Page TIFF to PDF | Zailo Graph',
    description: 'Convert scanned multi-page TIFF images into search-friendly, standard PDF documents.',
    keywords: 'tiff to pdf, convert multi page tiff to pdf, tif to pdf scanner online',
    category: 'convert',
    h1: 'Multi-Page TIFF to Standard PDF Converter',
    howTo: [
      'Upload your .tiff or .tif scanned document.',
      'Click Convert to transform scanned pages into PDF.',
      'Download your PDF.'
    ],
    faqs: [
      { q: 'Does it support multi-page TIFF files?', a: 'Yes. Every page in the TIFF container is extracted into a corresponding PDF page.' }
    ]
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images Converter',
    title: 'Free PDF to Images Converter - Extract PDF Pages as JPG & PNG | Zailo Graph',
    description: 'Extract every page of a PDF document as high-resolution JPG or PNG images with batch ZIP download.',
    keywords: 'pdf to images, extract images from pdf, convert pdf to photos, pdf to jpg zip',
    category: 'convert',
    h1: 'PDF to High-Resolution Images (JPG & PNG)',
    howTo: [
      'Upload your PDF document.',
      'Select output image format: PNG or JPG.',
      'Choose rendering resolution (150 DPI or 300 DPI high-definition).',
      'Download all pages in a single ZIP package.'
    ],
    faqs: [
      { q: 'Is there a page limit?', a: 'You can extract documents with dozens of pages directly in your browser memory.' }
    ]
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG Converter',
    title: 'Free PDF to JPG Converter - Convert PDF Pages to JPEG Images | Zailo Graph',
    description: 'Convert PDF pages into high-quality JPEG photos with custom DPI settings and instant ZIP export.',
    keywords: 'pdf to jpg, convert pdf to jpeg online free, save pdf as jpg photos, pdf to jpg high quality',
    category: 'convert',
    h1: 'High-Fidelity PDF to JPG Image Converter',
    howTo: [
      'Upload your PDF file.',
      'Choose JPG quality level.',
      'Click Convert to render pages into JPEG images.',
      'Download individual pages or complete ZIP archive.'
    ],
    faqs: [
      { q: 'Can I download a single page instead of the whole document?', a: 'Yes. You can select specific pages or download everything.' }
    ]
  },
  {
    id: 'pdf-to-png',
    name: 'PDF to PNG Converter',
    title: 'Free PDF to PNG Converter - Lossless PDF Page Rendering | Zailo Graph',
    description: 'Render PDF pages into crystal-clear lossless PNG images. Ideal for presentations, graphics, and text readability.',
    keywords: 'pdf to png, convert pdf to png high resolution, lossless pdf to png online free',
    category: 'convert',
    h1: 'Lossless PDF to Crystal-Clear PNG Converter',
    howTo: [
      'Upload your PDF document.',
      'Click Convert to render vector typography into crisp PNG bitmaps.',
      'Download your PNG files in a clean ZIP.'
    ],
    faqs: [
      { q: 'Why choose PNG over JPG for PDF extraction?', a: 'PNG avoids compression artifacts around text and line art, making it much sharper for reading.' }
    ]
  }
];

function generateHtmlPage(tool) {
  const schemaApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': tool.name,
    'url': `https://zailograph.com/tools/${tool.id}.html`,
    'description': tool.description,
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Any (Web Browser)',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'author': {
      '@type': 'Organization',
      'name': 'Coralgenz Global & Zorquelz Technologies'
    }
  };

  const schemaBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://zailograph.com/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': tool.category.toUpperCase(),
        'item': `https://zailograph.com/#category=${tool.category}`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': tool.name,
        'item': `https://zailograph.com/tools/${tool.id}.html`
      }
    ]
  };

  const schemaFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': tool.faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }))
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
  <title>${tool.title}</title>
  <meta name="description" content="${tool.description}" />
  <meta name="keywords" content="${tool.keywords}" />
  <link rel="canonical" href="https://zailograph.com/tools/${tool.id}.html" />
  
  <!-- Open Graph / Social Sharing -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://zailograph.com/tools/${tool.id}.html" />
  <meta property="og:title" content="${tool.title}" />
  <meta property="og:description" content="${tool.description}" />
  <meta property="og:site_name" content="Zailo Graph" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${tool.title}" />
  <meta name="twitter:description" content="${tool.description}" />

  <!-- Structured Data JSON-LD -->
  <script type="application/ld+json">
    ${JSON.stringify(schemaApp)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(schemaBreadcrumbs)}
  </script>
  <script type="application/ld+json">
    ${JSON.stringify(schemaFaq)}
  </script>

  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="theme-color" content="#09090B" />
  <link rel="apple-touch-icon" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body class="bg-[#FAFAFA] text-[#09090B] antialiased selection:bg-neutral-900 selection:text-white min-h-screen flex flex-col justify-between">
  <!-- Interactive Standalone Tool Mount Root -->
  <div id="root">
    <!-- Static Fallback / Crawlable Container (immediately visible to search engines) -->
    <header class="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2.5 text-neutral-900 font-bold tracking-tight text-base hover:opacity-90 transition">
          <svg class="w-7 h-7 shrink-0 rounded-xl" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="14" fill="#18181B" />
            <path d="M14 16H34L20 32H34" stroke="url(#logo_grad_${tool.id})" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="logo_grad_${tool.id}" x1="14" y1="16" x2="34" y2="32" gradientUnits="userSpaceOnUse">
                <stop stop-color="#8B5CF6"/>
                <stop offset="0.5" stop-color="#6366F1"/>
                <stop offset="1" stop-color="#06B6D4"/>
              </linearGradient>
            </defs>
          </svg>
          <span class="font-extrabold text-lg tracking-tight">Zailo<span class="text-violet-600">Graph</span></span>
        </a>

        <div class="flex items-center gap-3">
          <a href="/" class="text-xs font-semibold text-neutral-600 hover:text-neutral-900">Explore All Tools</a>
          <a href="/" class="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs">
            Open Studio Hub &rarr;
          </a>
        </div>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-800 text-xs font-bold mb-4">
        <span>100% Client-Side WebAssembly</span>
        <span>•</span>
        <span>Zero Server Uploads</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-3">
        ${tool.h1}
      </h1>
      <p class="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
        ${tool.description}
      </p>
    </div>
  </div>

  <!-- Vite React Module Mount -->
  <script type="module" src="/src/main.tsx"></script>

  <!-- Static Crawlable SEO Body for Search Engines -->
  <main class="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full space-y-12 border-t border-neutral-200/80">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-neutral-400">
      <a href="/" class="hover:text-neutral-700">Home</a>
      <span>&rsaquo;</span>
      <span class="text-neutral-500 capitalize">${tool.category}</span>
      <span>&rsaquo;</span>
      <span class="text-neutral-900 font-medium">${tool.name}</span>
    </nav>

    <!-- How-To Steps Section -->
    <section class="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-5">
      <h2 class="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">How to Use ${tool.name}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${tool.howTo.map((step, idx) => `
          <div class="flex items-start gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
            <span class="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              ${idx + 1}
            </span>
            <p class="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">${step}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Technical Architecture Highlights -->
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs space-y-1.5">
        <h3 class="text-xs font-bold text-neutral-900 uppercase tracking-wide">Zero Cloud Uploads</h3>
        <p class="text-xs text-neutral-500 leading-relaxed">Your files never touch remote servers. All processing executes inside your browser memory via WebAssembly.</p>
      </div>
      <div class="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs space-y-1.5">
        <h3 class="text-xs font-bold text-neutral-900 uppercase tracking-wide">High-Fidelity Output</h3>
        <p class="text-xs text-neutral-500 leading-relaxed">Master 4K and 8K visual fidelity without forced downsampling, compression artifacts, or added watermarks.</p>
      </div>
      <div class="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs space-y-1.5">
        <h3 class="text-xs font-bold text-neutral-900 uppercase tracking-wide">Connected Toolchain</h3>
        <p class="text-xs text-neutral-500 leading-relaxed">Send processed results directly into other Zailo Graph utilities without re-uploading.</p>
      </div>
    </section>

    <!-- FAQ Section for Rich Search Snippets -->
    <section class="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-5">
      <h2 class="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">Frequently Asked Questions</h2>
      <div class="space-y-3">
        ${tool.faqs.map(f => `
          <div class="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
            <h3 class="text-xs sm:text-sm font-bold text-neutral-900">${f.q}</h3>
            <p class="text-xs text-neutral-600 leading-relaxed">${f.a}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Explore All 60 Tools Grid -->
    <section class="space-y-4 pt-6 border-t border-neutral-200">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-neutral-900 tracking-tight">Explore The 60 Browser Utilities</h2>
        <a href="/" class="text-xs font-semibold text-violet-600 hover:text-violet-700">Studio Hub &rarr;</a>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        ${ALL_TOOLS_SEO.map(u => `
          <a 
            href="/tools/${u.id}.html"
            class="p-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/80 hover:border-violet-300 transition text-left group shadow-2xs"
          >
            <span class="block text-xs font-bold text-neutral-800 group-hover:text-violet-600 truncate">${u.name}</span>
            <span class="block text-[10px] text-neutral-400 capitalize mt-0.5">${u.category}</span>
          </a>
        `).join('')}
      </div>
    </section>
  </main>

  <!-- Static SEO Footer -->
  <footer class="w-full bg-white text-neutral-600 pt-8 pb-6 border-t border-neutral-200 mt-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-base text-neutral-900">Zailo Graph</span>
          <span class="text-xs text-neutral-500 font-medium">by Coralgenz Global &amp; Zorquelz Technologies</span>
        </div>
        <p class="text-xs text-neutral-500">100% Client-Side Image Workspace. No Cloud Transmission.</p>
      </div>
      <div class="text-center text-xs text-neutral-500">
        <p>&copy; 2026 Zailo Graph by Coralgenz Global &amp; Zorquelz Technologies. All 60 browser utilities are 100% free forever.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function generateSitemap() {
  const urls = [
    'https://zailograph.com/',
    ...ALL_TOOLS_SEO.map(u => `https://zailograph.com/tools/${u.id}.html`)
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === 'https://zailograph.com/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(SITEMAP_FILE, xml, 'utf8');
  console.log(`Generated sitemap.xml with ${urls.length} URLs.`);
}

function generateRobots() {
  const content = `User-agent: *
Allow: /
Sitemap: https://zailograph.com/sitemap.xml
`;
  fs.writeFileSync(ROBOTS_FILE, content, 'utf8');
  console.log('Generated robots.txt.');
}

function cleanObsoleteFiles() {
  const validIds = new Set(ALL_TOOLS_SEO.map(t => `${t.id}.html`));
  [TOOLS_DIR, PUBLIC_TOOLS_DIR].forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.html') && !validIds.has(file)) {
          fs.unlinkSync(path.join(dir, file));
          console.log(`  Removed obsolete: ${dir}/${file}`);
        }
      }
    }
  });
}

function run() {
  console.log(`Generating ${ALL_TOOLS_SEO.length} SEO HTML pages in tools/ and public/tools/...`);
  cleanObsoleteFiles();
  for (const tool of ALL_TOOLS_SEO) {
    const html = generateHtmlPage(tool);
    fs.writeFileSync(path.join(TOOLS_DIR, `${tool.id}.html`), html, 'utf8');
    fs.writeFileSync(path.join(PUBLIC_TOOLS_DIR, `${tool.id}.html`), html, 'utf8');
  }
  generateSitemap();
  generateRobots();
  console.log(`All ${ALL_TOOLS_SEO.length} SEO tool pages generated successfully! Total site pages: ${ALL_TOOLS_SEO.length + 1} (including index.html).`);
}

run();
