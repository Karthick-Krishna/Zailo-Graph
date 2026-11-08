import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const TOOLS_DIR = path.join(ROOT_DIR, 'public', 'tools');
const SITEMAP_FILE = path.join(ROOT_DIR, 'public', 'sitemap.xml');
const ROBOTS_FILE = path.join(ROOT_DIR, 'public', 'robots.txt');

if (!fs.existsSync(TOOLS_DIR)) {
  fs.mkdirSync(TOOLS_DIR, { recursive: true });
}

const UTILITIES_SEO = [
  {
    id: 'workflow-recipes',
    name: '1-Click Workflow Recipes',
    title: 'Free 1-Click Image Automation Recipes - Amazon, YouTube & Passport | ZailoGraph',
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
    name: 'Batch Image Resizing',
    title: 'Free Online Batch Image Resizer - Exact Pixels & Aspect Ratio | ZailoGraph',
    description: 'Resize multiple images simultaneously in your browser. Scale by exact width, height, percentage, or aspect ratio using high-fidelity Lanczos3 resampling with zero quality loss.',
    keywords: 'batch image resizer, resize images online free, bulk photo resize, lanczos3 scaling, high quality image downscaling, private image resizer',
    category: 'optimize',
    h1: 'Batch Image Resizer (Private & Instant)',
    howTo: [
      'Upload single or multiple images into the resizing workspace.',
      'Select scaling mode: Exact dimensions (px), percentage scale (%), or preset aspect ratios.',
      'Choose resampling interpolation (Lanczos3, Bicubic, or Pixel Art nearest-neighbor).',
      'Export individually or download all resized files in a single ZIP package.'
    ],
    faqs: [
      { q: 'Does batch resizing compress or distort aspect ratio?', a: 'You can toggle aspect ratio lock on or off to preserve exact image proportions without distortion.' },
      { q: 'What is the maximum file size supported?', a: 'Free registered users can process images up to 100 MB directly in local browser RAM.' }
    ]
  },
  {
    id: 'compression',
    name: 'Image Compression Studio',
    title: 'Free Online Image Compressor - Lossless & Lossy MozJPEG, WebP, OxiPNG | ZailoGraph',
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
    id: 'heic-converter',
    name: 'HEIC to JPG/PNG Converter',
    title: 'Free Online Apple HEIC to JPG Converter - iPhone Live Photos | ZailoGraph',
    description: 'Convert iPhone and Apple HEIC/HEIF photos to standard JPG or PNG format directly in your browser. Batch conversion with 100% privacy and full EXIF metadata preservation.',
    keywords: 'heic to jpg, convert heic to png, apple heif converter, iphone photo to jpg, batch heic converter, free heic to jpeg online',
    category: 'convert',
    h1: 'Apple HEIC to JPG & PNG Converter',
    howTo: [
      'Drop your iPhone .heic or .heif files into the converter.',
      'Choose your preferred target format: JPEG or Lossless PNG.',
      'Configure output quality and optional EXIF preservation.',
      'Download converted high-resolution images instantly.'
    ],
    faqs: [
      { q: 'Is there a file limit on HEIC conversions?', a: 'No artificial quantity limits. Convert single files or large burst batches locally.' },
      { q: 'Are burst photos and Live Photos supported?', a: 'Yes. Apple iPhone HEIC and HEIF containers are decoded directly via client-side libheif WebAssembly.' }
    ]
  },
  {
    id: 'webp-to-raster',
    name: 'WebP to PNG/JPG Converter',
    title: 'Free Online WebP to PNG & JPG Converter - Lossless Decompression | ZailoGraph',
    description: 'Convert Google WebP images into universally compatible PNG or JPG photos. Preserve full transparency, inspect color depth, and export high-resolution master copies.',
    keywords: 'webp to png, convert webp to jpg, webp decoder, free webp converter online, save webp as png, private webp to jpeg',
    category: 'convert',
    h1: 'WebP to Lossless PNG & JPEG Converter',
    howTo: [
      'Upload one or more .webp image files.',
      'Select output format: Lossless PNG (with alpha transparency) or standard JPEG.',
      'Review output preview in real time.',
      'Download your converted image.'
    ],
    faqs: [
      { q: 'Will transparent backgrounds in WebP turn black or white in PNG?', a: 'Converting to PNG retains full transparent alpha channels without background fills.' },
      { q: 'Can I batch convert WebP files?', a: 'Yes, add multiple WebP files to the queue and download as a ZIP archive.' }
    ]
  },
  {
    id: 'raster-to-webp',
    name: 'PNG/JPG to WebP Converter',
    title: 'Free Online PNG & JPG to Modern WebP Converter - 100% Private | ZailoGraph',
    description: 'Convert legacy PNG, JPG, and BMP images into Google WebP format. Shrink image payload sizes by 30-70% for lightning-fast website performance and Google Core Web Vitals.',
    keywords: 'png to webp, jpg to webp, convert jpeg to webp, next-gen image format, webp encoder online, website speed optimization',
    category: 'convert',
    h1: 'PNG & JPG to Modern WebP Converter',
    howTo: [
      'Select your PNG, JPEG, or BMP photos.',
      'Tune WebP compression quality (recommended: 80-85% for web balance).',
      'Preview visual fidelity and verify exact byte reduction.',
      'Download optimized WebP files for production websites.'
    ],
    faqs: [
      { q: 'Why convert to WebP?', a: 'WebP provides superior lossless and lossy compression, resulting in 26% smaller files than PNG and 25-34% smaller files than JPEG.' },
      { q: 'Do all modern browsers support WebP?', a: 'Yes. WebP is supported by over 97% of global web browsers including Chrome, Safari, Firefox, and Edge.' }
    ]
  },
  {
    id: 'svg-to-png',
    name: 'SVG to High-Res PNG Rasterizer',
    title: 'Free Online SVG to High-Resolution PNG - Up to 16x Print Quality | ZailoGraph',
    description: 'Rasterize scalable vector graphics (SVG) into crisp, pixel-perfect PNG images up to 16x scaling multiplier (300 DPI print grade). Powered by native Resvg WebAssembly.',
    keywords: 'svg to png, high resolution svg rasterizer, convert svg to png 300 dpi, print quality svg, resvg wasm, vector to raster converter',
    category: 'convert',
    h1: 'SVG to High-Res PNG Rasterizer (Up to 16x)',
    howTo: [
      'Upload any valid SVG vector file.',
      'Choose your resolution scale multiplier: 1x, 2x, 4x, 8x, or 16x master print quality.',
      'Toggle transparent background or choose custom background fill.',
      'Export high-DPI rasterized PNG.'
    ],
    faqs: [
      { q: 'Does high scaling cause blurriness?', a: 'No. Because SVGs are mathematical vectors, scaling up to 16x renders sharp curves and edges with zero pixelation.' },
      { q: 'Are complex SVG gradients and CSS filters preserved?', a: 'Yes. Resvg WASM supports the modern SVG 1.1/2.0 specifications including clipping paths and gradients.' }
    ]
  },
  {
    id: 'png-to-svg',
    name: 'PNG to SVG Vectorizer',
    title: 'Free Online PNG to SVG Vectorizer - Trace Bitmap to Vector Paths | ZailoGraph',
    description: 'Convert raster PNG, JPG, and logo graphics into clean, editable SVG vector paths. Auto-trace contours, reduce speckles, and extract multi-color layer paths in your browser.',
    keywords: 'png to svg, vectorizer online, convert logo to svg, image to vector paths, autotrace bitmap, free vectorizer tool',
    category: 'convert',
    h1: 'PNG to SVG Vectorizer & Contour Tracer',
    howTo: [
      'Upload a logo, icon, sketch, or raster graphic.',
      'Select color quantization palette count (2 to 32 colors).',
      'Adjust speckle noise filtering for smoother path geometry.',
      'Download your scalable SVG vector file.'
    ],
    faqs: [
      { q: 'Can I edit the generated SVG in Illustrator or Figma?', a: 'Yes. The output SVG consists of standard path elements compatible with Figma, Adobe Illustrator, and Inkscape.' },
      { q: 'What types of images vectorize best?', a: 'High-contrast logos, icons, line art, signatures, and badges produce optimal vector outlines.' }
    ]
  },
  {
    id: 'rotate-flip',
    name: 'Rotate & Flip Image Studio',
    title: 'Free Online Image Rotator & Mirror Flip - 90°, 180° & Arbitrary Angles | ZailoGraph',
    description: 'Rotate photos by 90°, 180°, 270°, or any degree angle with automatic canvas bounding box expansion. Flip images horizontally and vertically with instant client preview.',
    keywords: 'rotate image online, flip photo horizontally, mirror image online, rotate 90 degrees, angle rotation canvas, free image flip',
    category: 'edit',
    h1: 'Rotate & Flip Image Studio',
    howTo: [
      'Upload your image.',
      'Click quick 90° buttons or slide the fine degree control (0° to 360°).',
      'Toggle horizontal mirror flip or vertical mirror flip.',
      'Export your perfectly aligned image.'
    ],
    faqs: [
      { q: 'Does arbitrary rotation crop off photo corners?', a: 'No. The canvas automatically expands its bounding width and height using exact trigonometry so no pixels are lost.' },
      { q: 'Does rotating reduce image resolution?', a: 'No. Original pixel fidelity is preserved.' }
    ]
  },
  {
    id: 'meme-generator',
    name: 'Meme & Caption Studio',
    title: 'Free Online Meme Generator - Classic Impact Bold Text & Custom Captions | ZailoGraph',
    description: 'Create viral memes with classic bold Impact typography. Customize top and bottom text, font sizes, text color, stroke outlines, and automatic line wrapping privately in your browser.',
    keywords: 'meme generator online, free meme maker, add caption to photo, impact font meme, custom meme creator, private meme maker',
    category: 'edit',
    h1: 'Meme & Caption Studio (Private & Watermark-Free)',
    howTo: [
      'Drop your photo or template into the studio.',
      'Type your Top Caption and Bottom Caption.',
      'Tune font size, outline thickness, and text color.',
      'Download your high-resolution meme without forced watermarks.'
    ],
    faqs: [
      { q: 'Does ZailoGraph add its own watermark to memes?', a: 'Never. Your memes are 100% yours, clean and unbranded.' },
      { q: 'Can I type long sentences?', a: 'Yes. Intelligent word wrapping automatically breaks long sentences into balanced multi-line captions.' }
    ]
  },
  {
    id: 'sharpen-enhance',
    name: 'Sharpen & Enhance Studio',
    title: 'Free Online Image Sharpening & Color Enhancement - WebGL Real-Time | ZailoGraph',
    description: 'Fix blurry photos, boost local contrast, and enhance clarity with hardware-accelerated 60fps WebGL filters. Fine-tune brightness, saturation, and unsharp masking.',
    keywords: 'sharpen blurry image, photo enhance online, unsharp mask tool, increase contrast photo, clear up blurry pictures, webgl image filter',
    category: 'edit',
    h1: 'Sharpen & Enhance Studio',
    howTo: [
      'Upload a blurry or soft photo.',
      'Adjust the Unsharp Mask sharpening radius and intensity.',
      'Balance brightness, contrast, and color vibrancy.',
      'Download your crisp, enhanced image.'
    ],
    faqs: [
      { q: 'How does unsharp masking work?', a: 'It calculates local high-frequency pixel differentials and sharpens edges without amplifying background noise.' },
      { q: 'Can I revert adjustments?', a: 'Yes. All controls have instant reset buttons and non-destructive previews.' }
    ]
  },
  {
    id: 'avatar-crop',
    name: 'Circular Avatar & Image Cropper',
    title: 'Free Online Circular Avatar Cropper - Profile Photos for Social Media | ZailoGraph',
    description: 'Crop images into perfect circles, rounded rectangles, or standard aspect ratios (1:1, 4:5, 16:9). Includes pan, zoom, and transparent PNG background export.',
    keywords: 'circular crop photo, profile picture cropper, round avatar maker, crop image to circle online, square profile photo, avatar crop tool',
    category: 'edit',
    h1: 'Circular Avatar & Image Cropper',
    howTo: [
      'Upload a headshot or portrait photo.',
      'Choose Circular Avatar mode or standard aspect ratios.',
      'Pan and zoom into faces with the position sliders.',
      'Export your circle avatar as a transparent PNG.'
    ],
    faqs: [
      { q: 'Can I use this for LinkedIn, Twitter, and Discord avatars?', a: 'Yes. Circular exports have true transparent corners ready for any avatar upload.' },
      { q: 'Is there a zoom slider?', a: 'Yes, zoom smoothly up to 3.0x with centered boundary clamping.' }
    ]
  },
  {
    id: 'social-presets',
    name: 'Social Media Presets',
    title: 'Free Online Social Media Image Resizer - Instagram, YouTube, LinkedIn | ZailoGraph',
    description: 'Instant resizing for Instagram posts, Stories, YouTube banners, LinkedIn covers, X/Twitter headers, and Open Graph cards with smart blur fill backgrounds.',
    keywords: 'social media image sizes, resize photo for instagram, youtube banner resizer, linkedin cover photo size, twitter header resizer, og image generator',
    category: 'social',
    h1: 'Social Media Presets & Multi-Platform Resizer',
    howTo: [
      'Upload your creative asset.',
      'Select a platform target (Instagram Story, Square Post, YouTube Thumbnail, LinkedIn Banner).',
      'Choose background fill: Smart Gaussian Blur, custom solid color, or fit.',
      'Download perfectly sized social media assets.'
    ],
    faqs: [
      { q: 'What does smart blur background fill do?', a: 'If your photo aspect ratio doesn\'t match the target banner, it fills surrounding letterbox space with an aesthetically blurred version of your image.' },
      { q: 'Are dimensions kept up-to-date with 2026 platform specifications?', a: 'Yes, all presets strictly follow official platform pixel requirements.' }
    ]
  },
  {
    id: 'watermark',
    name: 'Image Watermarking Studio',
    title: 'Free Online Image Watermarking - Text & Logo Branding on 9-Point Grid | ZailoGraph',
    description: 'Protect creative assets with customizable text typography or brand logo watermarks. Features full 9-point anchor alignment, opacity control, and angle rotation.',
    keywords: 'watermark photos online, add logo to image free, protect photos watermark, batch image watermarking, transparent logo overlay, photography watermark',
    category: 'edit',
    h1: 'Image Watermarking Studio (Text & Logo)',
    howTo: [
      'Upload one photo or a batch of images.',
      'Enter custom copyright text or upload your brand PNG logo.',
      'Select position on the 9-point anchor grid (corners, edges, center) and adjust opacity.',
      'Batch process and download watermarked assets.'
    ],
    faqs: [
      { q: 'Can I apply watermarks to 50 photos at once?', a: 'Yes. Use the Batch Queue to apply the same watermark stamp across dozens of photos in seconds.' },
      { q: 'Can I upload a PNG logo with transparency?', a: 'Yes, PNG logos blend cleanly with configurable opacity.' }
    ]
  },
  {
    id: 'collage-maker',
    name: 'Photo Grids & Collages',
    title: 'Free Online Photo Grid & Collage Maker - Multi-Photo Layouts | ZailoGraph',
    description: 'Combine multiple images into dynamic flex grids, split panels, polaroid arrays, and editorial photo collages directly in your browser with adjustable margins.',
    keywords: 'photo collage maker, photo grid online free, combine images side by side, picture collage maker, split photo grid, instagram collage maker',
    category: 'edit',
    h1: 'Photo Grids & Collage Maker',
    howTo: [
      'Add 2 to 9 photos to your workspace.',
      'Select a grid layout: 2-Split, 3-Column, 4-Grid, or Polaroid Array.',
      'Customize gap spacing, corner radius, and background color.',
      'Export high-resolution composite collage image.'
    ],
    faqs: [
      { q: 'How many photos can I include?', a: 'Supports flexible grids from 2 up to 9 images per composite collage.' },
      { q: 'Can I adjust the gap between photos?', a: 'Yes, gaps and rounded corner radius are fully adjustable.' }
    ]
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    title: 'Free Online Color Palette Generator - Extract HEX & CSS Swatches | ZailoGraph',
    description: 'Extract dominant color palettes, HEX codes, RGB values, and CSS variables from any image using fast K-Means color quantization. Export swatch cards with one click.',
    keywords: 'color palette from image, extract hex codes photo, color scheme generator, image color picker, dominant colors extractor, css color palette',
    category: 'edit',
    h1: 'Color Palette Generator & Quantizer',
    howTo: [
      'Upload any photograph, illustration, or graphic.',
      'Select number of dominant swatches to extract (3 to 10 colors).',
      'Click any swatch to copy HEX or RGB code to clipboard.',
      'Export visual swatch card or JSON color manifest.'
    ],
    faqs: [
      { q: 'How does it find the dominant colors?', a: 'It clusters similar pixel hues using K-Means quantization to discover prominent aesthetic harmonies.' },
      { q: 'Can I export CSS custom properties?', a: 'Yes, copy CSS variables ready to paste directly into your stylesheet.' }
    ]
  },
  {
    id: 'passport-photo',
    name: 'Passport & ID Photo Maker',
    title: 'Free Online Passport & ID Photo Maker - Biometric Templates & Sheets | ZailoGraph',
    description: 'Create standard biometric passport, visa, and ID photos for US, EU, UK, and India. Features head/chin height guidelines, whitened background, and printable 4×6 multi-print sheets.',
    keywords: 'passport photo maker, us passport photo 2x2 online, visa photo maker free, biometric id photo, 4x6 passport print sheet, id photo online',
    category: 'edit',
    h1: 'Passport & Biometric ID Photo Maker',
    howTo: [
      'Upload a front-facing portrait photo.',
      'Select country template (US 2×2 inch, EU 35×45mm, India, etc.).',
      'Align facial guidelines (eyes, crown, chin) and enable whitened background.',
      'Export individual passport photo or printable 4×6 photo sheet.'
    ],
    faqs: [
      { q: 'Does it meet official government passport standards?', a: 'Templates strictly adhere to standard biometric dimensions and eye/chin proportions.' },
      { q: 'Can I print the 4×6 sheet at a local pharmacy or store?', a: 'Yes, the generated 4×6 sheet prints 6 standard passport photos at standard 300 DPI.' }
    ]
  },
  {
    id: 'image-splitter',
    name: 'Image Grid Splitter',
    title: 'Free Online Image Grid Splitter - 3x3 Instagram Grids & Carousels | ZailoGraph',
    description: 'Slice large photos into 3×3 Instagram feed grids, 3×1 seamless panoramic carousels, or custom row × column puzzle tiles with automatic numbered ZIP export.',
    keywords: 'split image into 3x3 grid, instagram grid splitter, split photo for carousel, cut image into tiles, panoramic carousel splitter, image splitter online',
    category: 'social',
    h1: 'Image Grid Splitter & Tile Slicer',
    howTo: [
      'Drop your panoramic photo or graphic into the splitter.',
      'Choose preset: 3×3 Instagram Grid, 1×3 Panoramic Carousel, or custom rows & columns.',
      'Verify numbered tile overlays in real-time preview.',
      'Download all segmented tiles in a structured ZIP archive.'
    ],
    faqs: [
      { q: 'Will the slices fit Instagram without gaps?', a: 'Yes. Each slice is mathematically equal to ensure a seamless continuous grid on your social profile.' },
      { q: 'Are tiles numbered in upload order?', a: 'Yes, files are named sequentially (tile_1.jpg, tile_2.jpg, etc.) so uploading is effortless.' }
    ]
  },
  {
    id: 'exif-viewer',
    name: 'EXIF Metadata Viewer',
    title: 'Free Online EXIF Metadata Viewer & GPS Coordinates Map | ZailoGraph',
    description: 'Inspect camera model, lens parameters, ISO, shutter speed, aperture, and embedded GPS coordinates with interactive mapping. 100% private in browser memory.',
    keywords: 'exif viewer online, read photo metadata, check camera settings image, find gps coordinates photo, inspect exif data free, private exif viewer',
    category: 'metadata',
    h1: 'EXIF Metadata Viewer & GPS Extractor',
    howTo: [
      'Drop any JPEG, PNG, WebP, or TIFF image file.',
      'Instantly view camera make, lens aperture, focal length, ISO, and timestamp.',
      'View embedded GPS latitude and longitude on a private map view.',
      'Copy metadata details or export JSON analysis.'
    ],
    faqs: [
      { q: 'Do photos get sent to a server to read metadata?', a: 'No. EXIF parsing runs client-side via exifr WebAssembly. Your location and private data remain strictly on your machine.' },
      { q: 'What image formats have EXIF data?', a: 'Most DSLR, mirrorless, and smartphone JPEG, TIFF, and RAW files contain rich EXIF tags.' }
    ]
  },
  {
    id: 'exif-remover',
    name: 'Lossless EXIF Stripper',
    title: 'Free Online Lossless EXIF Stripper - Sanitize GPS & Privacy Data | ZailoGraph',
    description: 'Sanitize GPS locations, device serial numbers, and personal timestamps from photos without re-compressing image pixels. Lossless bitstream metadata removal for JPEG and PNG.',
    keywords: 'remove exif data online, strip gps from photo, delete photo metadata, lossless exif remover, clean image metadata free, privacy photo stripper',
    category: 'metadata',
    h1: 'Lossless EXIF Stripper & Privacy Sanitizer',
    howTo: [
      'Upload images containing sensitive camera or GPS metadata.',
      'Click Cleanse Metadata to surgically remove APP1 and ancillary metadata chunks.',
      'Verify that all personal identifiers have been eliminated.',
      'Download clean, sanitized photos ready for public sharing.'
    ],
    faqs: [
      { q: 'Does removing EXIF reduce photo visual quality?', a: 'No. Unlike ordinary tools that re-encode pixels, our lossless stripper removes header chunks directly without recompressing pixel data.' },
      { q: 'Is GPS location permanently deleted?', a: 'Yes. GPS IFD blocks are completely removed from the file binary.' }
    ]
  },
  {
    id: 'privacy-redact',
    name: 'Privacy Blur & Redact',
    title: 'Free Online Privacy Blur & Image Redactor - Hide Faces & Numbers | ZailoGraph',
    description: 'Irreversibly blur, pixelate, or black out sensitive faces, license plates, credit card numbers, and confidential documents before sharing online.',
    keywords: 'blur faces photo online, redact image free, pixelate license plate, black out text on picture, blur sensitive info photo, private image redactor',
    category: 'metadata',
    h1: 'Privacy Blur & Image Redaction Studio',
    howTo: [
      'Upload a document, screenshot, or photo.',
      'Select a redaction mode: Gaussian Blur, Mosaic Pixelation, or Solid Blackout.',
      'Position redaction zones over sensitive information.',
      'Export the irreversibly sanitized image.'
    ],
    faqs: [
      { q: 'Can someone undo or un-blur the redacted areas?', a: 'No. The underlying pixels in the exported image file are permanently replaced with blur/blackout pixels.' },
      { q: 'Can I add multiple redaction boxes?', a: 'Yes, add as many independent redaction zones as needed.' }
    ]
  },
  {
    id: 'favicon-studio',
    name: 'Favicon & App Icon Studio',
    title: 'Free Online Favicon & App Icon Generator - Multi-Resolution .ICO Pack | ZailoGraph',
    description: 'Generate multi-resolution .ico files (16×16, 32×32, 48×48), Apple Touch Icons, and manifest.json web app packages from any logo or image.',
    keywords: 'favicon generator, create ico file online, convert png to ico, apple touch icon maker, pwa manifest icon generator, favicon maker free',
    category: 'social',
    h1: 'Favicon & App Icon Studio (Binary .ICO)',
    howTo: [
      'Upload a square logo, icon, or picture (PNG or SVG recommended).',
      'Preview multi-size generation (16px browser tab, 32px bookmark, 48px desktop).',
      'Choose single .ICO container or complete Web App ZIP bundle.',
      'Download assets ready to drop into your website root directory.'
    ],
    faqs: [
      { q: 'Is the .ico file a real binary ICO container?', a: 'Yes. It creates a genuine multi-resolution ICONDIR/ICONDIRENTRY binary container recognized by all browsers.' },
      { q: 'Does it generate Apple Touch Icons?', a: 'Yes, 180×180 Apple Touch Icons and web manifest assets are included.' }
    ]
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64 URI Converter',
    title: 'Free Online Image to Base64 Converter - Data URI, HTML & CSS | ZailoGraph',
    description: 'Convert any image into a base64 data URI string, HTML <img> tag, or CSS background declaration. Instant 1-click clipboard copy with zero server uploads.',
    keywords: 'image to base64, convert photo to data uri, base64 image encoder, base64 html img tag, base64 string generator online, inline image css',
    category: 'convert',
    h1: 'Image to Base64 Data URI Converter',
    howTo: [
      'Drag and drop any image into the encoder.',
      'Select output format: Raw Base64 string, Data URI, HTML <img> snippet, or CSS background-image.',
      'Click Copy to Clipboard.',
      'Paste directly into your web source code.'
    ],
    faqs: [
      { q: 'Why use Base64 images in HTML/CSS?', a: 'Base64 allows embedding small icons directly into HTML or CSS to save HTTP request overhead.' },
      { q: 'Is there a file size recommendation?', a: 'Best used for icons, badges, and small graphics under 50 KB.' }
    ]
  },
  {
    id: 'base64-to-image',
    name: 'Base64 to Image Decoder',
    title: 'Free Online Base64 to Image Decoder - Paste Data URI & Download | ZailoGraph',
    description: 'Paste base64 strings or data URIs to inspect, preview, and download as clean PNG, JPG, or WebP files. Instant decoding without server roundtrips.',
    keywords: 'base64 to image, decode base64 to png, data uri to image file, base64 to jpg converter, view base64 image online, free base64 decoder',
    category: 'convert',
    h1: 'Base64 to Image Decoder & File Generator',
    howTo: [
      'Paste your base64 string or data:image URI into the text box.',
      'Inspect instant image preview and detected MIME type.',
      'Choose output format: PNG, JPEG, or WebP.',
      'Click Download to save the decoded image to your computer.'
    ],
    faqs: [
      { q: 'Does it support strings with or without data:image prefixes?', a: 'Yes, it automatically detects and strips prefixes, whitespace, and line breaks.' },
      { q: 'Are pasted strings stored anywhere?', a: 'No. Decoding happens entirely within browser memory and is discarded when closed.' }
    ]
  },
  {
    id: 'camera-raw',
    name: 'Camera RAW to JPG Converter',
    title: 'Free Online Camera RAW to JPG Studio - Canon, Nikon, Sony, DNG | ZailoGraph',
    description: 'Extract embedded previews and convert DSLR Camera RAW files (Canon CR2/CR3, Nikon NEF, Sony ARW, DNG, Fuji RAF) to high-quality JPEG in your browser.',
    keywords: 'raw to jpg converter, convert cr2 to jpg online, sony arw to jpeg, nikon nef to jpg, dng to jpg free, camera raw converter online',
    category: 'convert',
    h1: 'Camera RAW to JPG Converter Studio',
    howTo: [
      'Upload your camera RAW files (.cr2, .cr3, .nef, .arw, .dng, .orf, .raf).',
      'Preview extracted high-resolution camera JPEG thumbnail.',
      'Configure JPEG export quality and metadata retention.',
      'Save converted JPEGs individually or as a batch ZIP.'
    ],
    faqs: [
      { q: 'Which camera brands are supported?', a: 'Supports major DSLR and mirrorless RAW formats from Canon, Nikon, Sony, Fujifilm, Olympus, and Adobe DNG.' },
      { q: 'Does this require cloud processing?', a: 'No. SubIFD binary extraction runs directly in your browser using WebAssembly.' }
    ]
  }
];

function generateHtmlPage(tool) {
  const canonicalUrl = `https://zailograph.com/tools/${tool.id}.html`;
  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.name,
    "url": canonicalUrl,
    "description": tool.description,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Runs 100% client-side via WebAssembly.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1420"
    }
  }, null, 2);

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": tool.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tool.title}</title>
  <meta name="description" content="${tool.description}">
  <meta name="keywords" content="${tool.keywords}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${tool.title}">
  <meta property="og:description" content="${tool.description}">
  <meta property="og:image" content="https://zailograph.com/zailograph-banner.jpg">
  <meta property="og:site_name" content="ZailoGraph">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${tool.title}">
  <meta name="twitter:description" content="${tool.description}">
  <meta name="twitter:image" content="https://zailograph.com/zailograph-banner.jpg">

  <!-- Structured Data JSON-LD for Google Rich Results -->
  <script type="application/ld+json">
${schemaJson}
  </script>
  <script type="application/ld+json">
${faqSchema}
  </script>

  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/assets/index-Bc-omp9L.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body class="bg-neutral-50 text-neutral-900 antialiased min-h-screen flex flex-col justify-between">
  <!-- Top Global Header -->
  <header class="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2.5 text-neutral-900 font-bold tracking-tight text-lg hover:opacity-90 transition">
        <svg class="w-8 h-8 shrink-0 shadow-xs rounded-xl" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill="#18181B" />
          <path d="M14 16H34L20 32H34" stroke="url(#logo_grad)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
          <defs>
            <linearGradient id="logo_grad" x1="14" y1="16" x2="34" y2="32" gradientUnits="userSpaceOnUse">
              <stop stop-color="#8B5CF6"/>
              <stop offset="0.5" stop-color="#6366F1"/>
              <stop offset="1" stop-color="#06B6D4"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="font-extrabold text-xl tracking-tight">Zailo<span class="text-violet-600">Graph</span></span>
      </a>

      <div class="flex items-center gap-3">
        <a href="/" class="text-xs font-semibold text-neutral-600 hover:text-neutral-900 hidden sm:inline">The 25 Browser Utilities</a>
        <a href="/#tool=${tool.id}" class="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-xs">
          Open Studio &rarr;
        </a>
      </div>
    </div>
  </header>

  <!-- Main Article Content -->
  <main class="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full space-y-12">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-neutral-400">
      <a href="/" class="hover:text-neutral-700">Home</a>
      <span>&rsaquo;</span>
      <span class="text-neutral-500 capitalize">${tool.category}</span>
      <span>&rsaquo;</span>
      <span class="text-neutral-900 font-medium">${tool.name}</span>
    </nav>

    <!-- Hero Header -->
    <div class="text-center space-y-4 max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-800 text-xs font-bold">
        <span>100% Client-Side WebAssembly</span>
        <span>•</span>
        <span>Zero Server Uploads</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
        ${tool.h1}
      </h1>
      <p class="text-base sm:text-lg text-neutral-600 leading-relaxed">
        ${tool.description}
      </p>

      <!-- Launch CTA Card -->
      <div class="pt-6">
        <a 
          href="/#tool=${tool.id}"
          class="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Launch ${tool.name}</span>
          <span class="text-xl">&rarr;</span>
        </a>
        <p class="text-xs text-neutral-400 mt-2.5">Free forever • No credit card required • Privacy guaranteed</p>
      </div>
    </div>

    <!-- How-To Steps Section -->
    <section class="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-10 shadow-sm space-y-6">
      <h2 class="text-2xl font-bold text-neutral-900 tracking-tight">How to Use ${tool.name}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        ${tool.howTo.map((step, idx) => `
          <div class="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
            <span class="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              ${idx + 1}
            </span>
            <p class="text-sm text-neutral-700 leading-relaxed font-medium">${step}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Key Technical Highlights -->
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-2xs space-y-2">
        <h3 class="text-sm font-bold text-neutral-900">Zero Cloud Uploads</h3>
        <p class="text-xs text-neutral-500 leading-relaxed">Your photos never touch remote servers. All processing executes inside your browser memory via WebAssembly.</p>
      </div>
      <div class="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-2xs space-y-2">
        <h3 class="text-sm font-bold text-neutral-900">High-Resolution Outputs</h3>
        <p class="text-xs text-neutral-500 leading-relaxed">Master 4K and 8K image fidelity without forced downsampling, compression artifacts, or added watermarks.</p>
      </div>
      <div class="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-2xs space-y-2">
        <h3 class="text-sm font-bold text-neutral-900">Connected Workflow</h3>
        <p class="text-xs text-neutral-500 leading-relaxed">Send processed results directly into other ZailoGraph utilities without downloading and re-uploading.</p>
      </div>
    </section>

    <!-- FAQ Section for Rich Search Snippets -->
    <section class="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-10 shadow-sm space-y-6">
      <h2 class="text-2xl font-bold text-neutral-900 tracking-tight">Frequently Asked Questions</h2>
      <div class="space-y-4">
        ${tool.faqs.map(f => `
          <div class="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1.5">
            <h3 class="text-sm font-bold text-neutral-900">${f.q}</h3>
            <p class="text-xs text-neutral-600 leading-relaxed">${f.a}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Explore All 25 Utilities Grid -->
    <section class="space-y-6 pt-6 border-t border-neutral-200">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-neutral-900 tracking-tight">Explore The 25 Browser Utilities</h2>
        <a href="/" class="text-xs font-semibold text-violet-600 hover:text-violet-700">View All &rarr;</a>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        ${UTILITIES_SEO.map(u => `
          <a 
            href="/tools/${u.id}.html"
            class="p-3.5 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200/80 hover:border-violet-300 transition text-left group shadow-2xs"
          >
            <span class="block text-xs font-bold text-neutral-800 group-hover:text-violet-600 truncate">${u.name}</span>
            <span class="block text-[10px] text-neutral-400 capitalize mt-0.5">${u.category}</span>
          </a>
        `).join('')}
      </div>
    </section>
  </main>

  <!-- Static SEO Footer -->
  <footer class="w-full bg-neutral-900 text-neutral-300 pt-12 pb-8 border-t border-neutral-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-lg text-white">ZailoGraph</span>
          <span class="text-xs text-neutral-400">by Zorquelz</span>
        </div>
        <p class="text-xs text-neutral-400">100% Client-Side Image Workspace. No Cloud Transmission.</p>
      </div>
      <div class="text-center text-xs text-neutral-500">
        <p>&copy; 2026 ZailoGraph. All 25 browser utilities are 100% free forever.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function generateSitemap() {
  const urls = [
    'https://zailograph.com/',
    ...UTILITIES_SEO.map(u => `https://zailograph.com/tools/${u.id}.html`)
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

function run() {
  console.log(`Generating 25 SEO HTML pages in ${TOOLS_DIR}...`);
  for (const tool of UTILITIES_SEO) {
    const html = generateHtmlPage(tool);
    const dest = path.join(TOOLS_DIR, `${tool.id}.html`);
    fs.writeFileSync(dest, html, 'utf8');
    console.log(`  ✓ ${tool.id}.html`);
  }
  generateSitemap();
  generateRobots();
  console.log('All 25 SEO tool pages generated successfully!');
}

run();
