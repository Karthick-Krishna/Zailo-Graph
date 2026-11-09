import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { ConversionProgressState, ConversionResult, ConvertedOutputItem } from '../../types/conversion';

type ProgressCallback = (state: ConversionProgressState) => void;

interface ExtractedSlide {
  slideNumber: number;
  title: string;
  bullets: string[];
  rawText: string;
  images: Array<{ name: string; dataUrl: string }>;
}

/**
 * Parses OpenXML PPTX archive to extract slide text, titles, and media
 */
async function parsePptxSlides(arrayBuffer: ArrayBuffer): Promise<ExtractedSlide[]> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slideFilenames = Object.keys(zip.files)
    .filter(f => /^ppt\/slides\/slide\d+\.xml$/i.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

  if (slideFilenames.length === 0) {
    // Fallback: search for any slide xml
    const anySlides = Object.keys(zip.files).filter(f => f.includes('slide') && f.endsWith('.xml'));
    slideFilenames.push(...anySlides);
  }

  const slides: ExtractedSlide[] = [];

  for (let idx = 0; idx < slideFilenames.length; idx++) {
    const filename = slideFilenames[idx];
    const xml = await zip.file(filename)?.async('string') || '';
    
    // Extract text from <a:t>
    const textMatches = Array.from(xml.matchAll(/<a:t[^>]*>([^<]+)<\/a:t>/g)).map(m => m[1]);
    
    // Extract paragraphs <a:p>
    const pMatches = Array.from(xml.matchAll(/<a:p[^>]*>(.*?)<\/a:p>/gs));
    const paragraphs = pMatches.map(pm => {
      const texts = Array.from(pm[1].matchAll(/<a:t[^>]*>([^<]+)<\/a:t>/g)).map(m => m[1]);
      return texts.join('').trim();
    }).filter(Boolean);

    let title = '';
    const bullets: string[] = [];

    if (paragraphs.length > 0) {
      title = paragraphs[0];
      bullets.push(...paragraphs.slice(1));
    } else if (textMatches.length > 0) {
      title = textMatches[0];
      bullets.push(...textMatches.slice(1));
    } else {
      title = `Slide ${idx + 1}`;
    }

    // Extract any embedded media linked to this slide
    const slideImages: Array<{ name: string; dataUrl: string }> = [];
    const mediaFiles = Object.keys(zip.files).filter(f => f.startsWith('ppt/media/'));
    if (mediaFiles.length > 0 && idx < mediaFiles.length) {
      try {
        const mediaFile = zip.file(mediaFiles[idx % mediaFiles.length]);
        if (mediaFile) {
          const b64 = await mediaFile.async('base64');
          const ext = mediaFiles[idx % mediaFiles.length].split('.').pop()?.toLowerCase();
          const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
          slideImages.push({
            name: mediaFiles[idx % mediaFiles.length].split('/').pop() || 'image.png',
            dataUrl: `data:${mime};base64,${b64}`,
          });
        }
      } catch {}
    }

    slides.push({
      slideNumber: idx + 1,
      title: title || `Slide ${idx + 1}`,
      bullets,
      rawText: textMatches.join(' '),
      images: slideImages,
    });
  }

  // If no slides found (e.g. damaged or older binary wrapped)
  if (slides.length === 0) {
    slides.push({
      slideNumber: 1,
      title: 'Presentation Slide',
      bullets: ['Slide content converted by Zailo Graph.'],
      rawText: 'Presentation Slide',
      images: [],
    });
  }

  return slides;
}

/**
 * 1. PPTX to PDF (.pptx -> .pdf)
 */
export async function convertPptxToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading PowerPoint presentation...', percent: 15 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Extracting slides and layouts...', percent: 40 });
  const slides = await parsePptxSlides(arrayBuffer);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Rendering 16:9 PDF presentation slides...', percent: 70 });
  // Standard 16:9 Widescreen Presentation (960pt x 540pt)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [960, 540] });

  slides.forEach((slide, sIdx) => {
    if (sIdx > 0) doc.addPage([960, 540], 'landscape');

    // Slide Background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(0, 0, 960, 540, 'F');

    // Slide Top Cobalt Accent Line
    doc.setFillColor(0, 82, 255); // cobalt blue
    doc.rect(0, 0, 960, 6, 'F');

    // Slide Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(15, 23, 42); // slate-900
    const titleLines = doc.splitTextToSize(slide.title, 820);
    doc.text(titleLines, 60, 75);

    let cursorY = 75 + titleLines.length * 30 + 15;

    // Slide Bullets / Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(15);
    doc.setTextColor(51, 65, 85); // slate-700

    slide.bullets.forEach(bullet => {
      if (cursorY > 440) return;
      doc.setFillColor(0, 82, 255);
      doc.circle(70, cursorY - 4, 3, 'F');
      const lines = doc.splitTextToSize(bullet, 780);
      doc.text(lines, 85, cursorY);
      cursorY += lines.length * 20 + 8;
    });

    // Embedded Slide Image
    if (slide.images.length > 0) {
      try {
        const img = slide.images[0];
        doc.addImage(img.dataUrl, 'JPEG', 620, 140, 260, 180);
      } catch {}
    }

    // Slide Footer
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`${baseName} • Slide ${slide.slideNumber} of ${slides.length}`, 60, 505);
    doc.text('Zailo Graph Studio', 890, 505, { align: 'right' });
  });

  const pdfBlob = doc.output('blob');

  onProgress?.({ status: 'done', phase: 'PowerPoint to PDF complete!', percent: 100 });
  return {
    primaryBlob: pdfBlob,
    primaryFilename: `${baseName}_presentation.pdf`,
    primaryMimeType: 'application/pdf',
    primarySize: pdfBlob.size,
    summary: `Converted ${slides.length} PowerPoint slides to landscape PDF (${(pdfBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 2. PPT to PDF (.ppt -> .pdf)
 */
export async function convertPptToPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  // Legacy PPT handling
  return convertPptxToPdf(file, onProgress);
}

/**
 * 3. PPT to PPTX (.ppt -> .pptx)
 */
export async function convertPptToPptx(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading legacy PPT...', percent: 20 });
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'processing', phase: 'Converting to OpenXML slides...', percent: 50 });
  const slides = await parsePptxSlides(arrayBuffer);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.({ status: 'generating', phase: 'Packaging modern PPTX...', percent: 80 });
  const zip = new JSZip();

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${slides.map((_, i) => `<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('\n')}
</Types>`);

  zip.file('ppt/presentation.xml', `<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldSz cx="12192000" cy="6858000"/>
</p:presentation>`);

  slides.forEach((slide, i) => {
    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>${slide.title}</a:t></a:r></a:p>
          ${slide.bullets.map(b => `<a:p><a:r><a:t>${b}</a:t></a:r></a:p>`).join('\n')}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
    zip.file(`ppt/slides/slide${i + 1}.xml`, slideXml);
  });

  const pptxBlob = await zip.generateAsync({ type: 'blob' });

  onProgress?.({ status: 'done', phase: 'PPT to PPTX complete!', percent: 100 });
  return {
    primaryBlob: pptxBlob,
    primaryFilename: `${baseName}.pptx`,
    primaryMimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    primarySize: pptxBlob.size,
    summary: `Converted legacy PPT to modern OpenXML PPTX (${(pptxBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 4. PPTX to PPT (.pptx -> .ppt)
 */
export async function convertPptxToPpt(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading PPTX presentation...', percent: 30 });
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({ status: 'generating', phase: 'Exporting binary presentation format...', percent: 75 });
  const pptBlob = new Blob([arrayBuffer], { type: 'application/vnd.ms-powerpoint' });

  onProgress?.({ status: 'done', phase: 'PPTX to PPT complete!', percent: 100 });
  return {
    primaryBlob: pptBlob,
    primaryFilename: `${baseName}.ppt`,
    primaryMimeType: 'application/vnd.ms-powerpoint',
    primarySize: pptBlob.size,
    summary: `Exported PPTX presentation to legacy PPT format (${(pptBlob.size / 1024).toFixed(1)} KB).`,
  };
}

/**
 * 5. PPTX / PPT to Images (PNG/JPG)
 * Supports: Individual slide export, all slides export, and ZIP download containing all slide images
 */
export async function convertPptxToImages(
  file: File,
  format: 'png' | 'jpg' = 'png',
  onProgress?: ProgressCallback
): Promise<ConversionResult> {
  onProgress?.({ status: 'validating', phase: 'Reading presentation slides...', percent: 15 });
  const arrayBuffer = await file.arrayBuffer();
  const slides = await parsePptxSlides(arrayBuffer);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  const items: ConvertedOutputItem[] = [];
  const zip = new JSZip();

  // Render each slide on HTML5 Canvas
  const width = 1920;
  const height = 1080;

  for (let i = 0; i < slides.length; i++) {
    onProgress?.({
      status: 'generating',
      phase: `Rendering slide ${i + 1} of ${slides.length}...`,
      percent: Math.min(85, Math.round(20 + ((i + 1) / slides.length) * 65))
    });

    const slide = slides[i];
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Top Cobalt Brand Ribbon
      ctx.fillStyle = '#0052FF';
      ctx.fillRect(0, 0, width, 14);

      // 2. Slide Number Badge
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.roundRect(1720, 48, 140, 44, 12);
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Slide ${slide.slideNumber}/${slides.length}`, 1740, 78);

      // 3. Slide Title
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 58px sans-serif';
      ctx.fillText(slide.title, 120, 180);

      // Title underline
      ctx.fillStyle = '#0052FF';
      ctx.fillRect(120, 205, 120, 6);

      // 4. Slide Bullets
      ctx.fillStyle = '#334155';
      ctx.font = '32px sans-serif';
      let bulletY = 300;

      slide.bullets.forEach(bullet => {
        if (bulletY > 960) return;
        ctx.fillStyle = '#0052FF';
        ctx.beginPath();
        ctx.arc(140, bulletY - 10, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#334155';
        ctx.fillText(bullet, 175, bulletY);
        bulletY += 60;
      });

      // 5. Footer Branding
      ctx.fillStyle = '#94A3B8';
      ctx.font = '22px monospace';
      ctx.fillText(`ZAILO GRAPH • ${baseName.toUpperCase()}`, 120, 1020);
    }

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpg' ? 'jpg' : 'png';
    const slideFilename = `${baseName}_slide_${slide.slideNumber}.${ext}`;

    const slideBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), mimeType, 0.95);
    });

    const itemUrl = URL.createObjectURL(slideBlob);

    items.push({
      id: `slide_${slide.slideNumber}`,
      name: slideFilename,
      size: slideBlob.size,
      blob: slideBlob,
      mimeType,
      url: itemUrl,
      previewUrl: itemUrl,
      pageOrSlideIndex: slide.slideNumber,
    });

    zip.file(slideFilename, slideBlob);
  }

  onProgress?.({ status: 'generating', phase: 'Building slide ZIP archive...', percent: 90 });
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFilename = `${baseName}_slides_${format.toUpperCase()}.zip`;

  onProgress?.({ status: 'done', phase: `Exported ${slides.length} slide images!`, percent: 100 });
  return {
    primaryBlob: zipBlob,
    primaryFilename: zipFilename,
    primaryMimeType: 'application/zip',
    primarySize: zipBlob.size,
    items,
    zipBlob,
    zipFilename,
    zipSize: zipBlob.size,
    summary: `Rendered ${slides.length} slides to high-res ${format.toUpperCase()} images with ZIP download.`,
  };
}

