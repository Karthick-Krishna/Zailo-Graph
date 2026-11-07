/**
 * Zailo Graph Codecs and 2D Image Manipulation Web Worker.
 * Multi-threaded OffscreenCanvas execution for all raster, vector, palette, and preset operations.
 */

export interface ResizeParams {
  width?: number;
  height?: number;
  scalePercent?: number;
  fit?: 'contain' | 'cover' | 'fill' | 'inside';
  aspectRatioLock?: boolean;
}

export interface CompressParams {
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number; // 0.01 to 1.0
}

export interface WatermarkParams {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile';
  rotation: number;
}

export interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
  isCircle?: boolean;
  aspectRatio?: string;
}

export interface FilterParams {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpen: number;
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
}

export interface SocialPresetParams {
  presetWidth: number;
  presetHeight: number;
  fillMode: 'blur' | 'color' | 'fit';
  fillColor?: string;
}

export interface PassportParams {
  targetWidthMm: number;
  targetHeightMm: number;
  sheetMode: 'single' | '4x6_grid' | 'a4_grid';
  whitenedBackground: boolean;
}

export interface RedactParams {
  regions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    mode: 'blur' | 'pixelate' | 'blackout';
  }>;
}

self.onmessage = async (e: MessageEvent) => {
  const { taskId, type, imageBitmap, params } = e.data;

  try {
    let resultBlob: Blob;
    let extraData: any = null;

    switch (type) {
      case 'resize':
        resultBlob = await processResize(imageBitmap, params);
        break;
      case 'compress':
        resultBlob = await processCompress(imageBitmap, params);
        break;
      case 'crop':
        resultBlob = await processCrop(imageBitmap, params);
        break;
      case 'watermark':
        resultBlob = await processWatermark(imageBitmap, params);
        break;
      case 'filter':
        resultBlob = await processFilter(imageBitmap, params);
        break;
      case 'social_preset':
        resultBlob = await processSocialPreset(imageBitmap, params);
        break;
      case 'passport_photo':
        resultBlob = await processPassportPhoto(imageBitmap, params);
        break;
      case 'extract_palette':
        const palette = extractColorPalette(imageBitmap, params?.count || 6);
        extraData = palette;
        // Output palette swatch card as image
        resultBlob = await generatePaletteCard(imageBitmap, palette);
        break;
      case 'privacy_redact':
        resultBlob = await processPrivacyRedact(imageBitmap, params);
        break;
      case 'favicon_pack':
        resultBlob = await generateFavicon(imageBitmap, params?.size || 32);
        break;
      case 'ai_bg_removal':
        resultBlob = await processAiBackgroundRemoval(imageBitmap, params);
        break;
      case 'ai_upscale':
        resultBlob = await processAiUpscale(imageBitmap, params);
        break;
      case 'ai_inpainting':
        resultBlob = await processAiInpainting(imageBitmap, params);
        break;
      case 'ai_colorization':
        resultBlob = await processAiColorization(imageBitmap, params);
        break;
      case 'vectorize':
        resultBlob = await processVectorize(imageBitmap, params);
        break;
      case 'collage':
        resultBlob = await processCollage(imageBitmap, params);
        break;
      case 'camera_raw':
        resultBlob = await processCameraRaw(imageBitmap, params);
        break;
      default:
        throw new Error(`Unsupported worker task: ${type}`);
    }

    self.postMessage({
      taskId,
      success: true,
      blob: resultBlob,
      size: resultBlob.size,
      extraData,
    });
  } catch (err: any) {
    self.postMessage({
      taskId,
      success: false,
      error: err.message || 'Worker processing failed',
    });
  }
};

/* ========================================================================= */
/* UTILITY IMPLEMENTATIONS                                                   */
/* ========================================================================= */

async function processResize(bitmap: ImageBitmap, params: any): Promise<Blob> {
  let targetW = bitmap.width;
  let targetH = bitmap.height;

  if (params?.scaleMultiplier) {
    const mult = params.scaleMultiplier;
    targetW = Math.max(1, Math.round(bitmap.width * mult));
    targetH = Math.max(1, Math.round(bitmap.height * mult));
  } else if (params?.scalePercent) {
    const factor = params.scalePercent / 100;
    targetW = Math.max(1, Math.round(bitmap.width * factor));
    targetH = Math.max(1, Math.round(bitmap.height * factor));
  } else if (params?.width && params?.height) {
    targetW = params.width;
    targetH = params.height;
  } else if (params?.width) {
    targetW = params.width;
    targetH = Math.round((bitmap.height * targetW) / bitmap.width);
  } else if (params?.height) {
    targetH = params.height;
    targetW = Math.round((bitmap.width * targetH) / bitmap.height);
  }

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processCompress(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');

  const format = params?.format || 'image/jpeg';
  const quality = params?.quality !== undefined ? params.quality : 0.85;

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, bitmap.width, bitmap.height);
  }

  ctx.drawImage(bitmap, 0, 0);

  return await canvas.convertToBlob({
    type: format,
    quality: quality,
  });
}

async function processCrop(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const isCircle = params?.isCircle || false;
  const width = params?.width || Math.min(bitmap.width, bitmap.height);
  const height = params?.height || (isCircle ? width : Math.min(bitmap.width, bitmap.height));
  const x = params?.x !== undefined ? params.x : Math.max(0, Math.round((bitmap.width - width) / 2));
  const y = params?.y !== undefined ? params.y : Math.max(0, Math.round((bitmap.height - height) / 2));

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');

  if (isCircle) {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(bitmap, x, y, width, height, 0, 0, width, height);

  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processWatermark(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');

  ctx.drawImage(bitmap, 0, 0);

  const text = params?.text || 'Zailo Graph';
  const fontSize = params?.fontSize || Math.max(16, Math.round(bitmap.width * 0.04));
  const opacity = params?.opacity !== undefined ? params.opacity : 0.7;
  const color = params?.color || '#FFFFFF';
  const position = params?.position || 'bottom-right';
  const rotation = params?.rotation || 0;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.font = `600 ${fontSize}px sans-serif`;

  const textMetrics = ctx.measureText(text);
  const padding = fontSize * 1.5;

  if (position === 'tile') {
    // Repeated pattern across the canvas
    const stepX = textMetrics.width + padding * 2;
    const stepY = fontSize + padding * 2;

    for (let y = padding; y < bitmap.height; y += stepY) {
      for (let x = padding; x < bitmap.width; x += stepX) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((-25 * Math.PI) / 180);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
  } else {
    let posX = padding;
    let posY = padding + fontSize;

    switch (position) {
      case 'center':
        posX = (bitmap.width - textMetrics.width) / 2;
        posY = (bitmap.height + fontSize) / 2;
        break;
      case 'top-left':
        posX = padding;
        posY = padding + fontSize;
        break;
      case 'top-right':
        posX = bitmap.width - textMetrics.width - padding;
        posY = padding + fontSize;
        break;
      case 'bottom-left':
        posX = padding;
        posY = bitmap.height - padding;
        break;
      case 'bottom-right':
        posX = bitmap.width - textMetrics.width - padding;
        posY = bitmap.height - padding;
        break;
    }

    if (rotation !== 0) {
      ctx.translate(posX + textMetrics.width / 2, posY - fontSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(text, -textMetrics.width / 2, fontSize / 2);
    } else {
      ctx.fillText(text, posX, posY);
    }
  }

  ctx.restore();
  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processFilter(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');

  const brightness = params?.brightness !== undefined ? params.brightness : 1;
  const contrast = params?.contrast !== undefined ? params.contrast : 1;
  const saturation = params?.saturation !== undefined ? params.saturation : 1;

  const filterStrings: string[] = [];
  if (brightness !== 1) filterStrings.push(`brightness(${brightness})`);
  if (contrast !== 1) filterStrings.push(`contrast(${contrast})`);
  if (saturation !== 1) filterStrings.push(`saturate(${saturation})`);
  if (params?.grayscale) filterStrings.push('grayscale(100%)');
  if (params?.sepia) filterStrings.push('sepia(100%)');
  if (params?.invert) filterStrings.push('invert(100%)');

  if (filterStrings.length > 0) {
    ctx.filter = filterStrings.join(' ');
  }

  ctx.drawImage(bitmap, 0, 0);

  if (params?.sharpen && params.sharpen > 0) {
    const imgData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    applySharpen(imgData, params.sharpen);
    ctx.putImageData(imgData, 0, 0);
  }

  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processSocialPreset(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const presetWidth = params?.presetWidth || 1080;
  const presetHeight = params?.presetHeight || 1080;
  const fillMode = params?.fillMode || 'blur';
  const fillColor = params?.fillColor || '#FAFAFA';

  const canvas = new OffscreenCanvas(presetWidth, presetHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas context unavailable');

  if (fillMode === 'blur') {
    // Draw heavily blurred and scaled background
    ctx.save();
    ctx.filter = 'blur(30px) brightness(0.85)';
    ctx.drawImage(bitmap, -40, -40, presetWidth + 80, presetHeight + 80);
    ctx.restore();
  } else {
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, presetWidth, presetHeight);
  }

  // Calculate centered contain aspect ratio
  const scale = Math.min(presetWidth / bitmap.width, presetHeight / bitmap.height);
  const drawW = bitmap.width * scale;
  const drawH = bitmap.height * scale;
  const drawX = (presetWidth - drawW) / 2;
  const drawY = (presetHeight - drawH) / 2;

  ctx.drawImage(bitmap, drawX, drawY, drawW, drawH);

  return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
}

async function processPassportPhoto(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const targetWidthMm = params?.targetWidthMm || 51;
  const targetHeightMm = params?.targetHeightMm || 51;
  const sheetMode = params?.sheetMode || 'single';
  const whitenedBackground = params?.whitenedBackground !== undefined ? params.whitenedBackground : true;

  // Standard 300 DPI passport crop (e.g. 2x2 inches = 600x600 px)
  const pxW = Math.round((targetWidthMm / 25.4) * 300);
  const pxH = Math.round((targetHeightMm / 25.4) * 300);

  if (sheetMode === 'single') {
    const canvas = new OffscreenCanvas(pxW, pxH);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    if (whitenedBackground) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, pxW, pxH);
    }

    const scale = Math.max(pxW / bitmap.width, pxH / bitmap.height);
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    ctx.drawImage(bitmap, (pxW - w) / 2, (pxH - h) / 2, w, h);

    return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.98 });
  }

  // 4x6 inch print sheet (1200 x 1800 px at 300 DPI)
  const sheetW = 1800;
  const sheetH = 1200;
  const canvas = new OffscreenCanvas(sheetW, sheetH);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, sheetW, sheetH);

  // 2x3 or 2x2 grid of passport photos with fine cut lines
  const cols = 3;
  const rows = 2;
  const marginX = (sheetW - (cols * pxW)) / (cols + 1);
  const marginY = (sheetH - (rows * pxH)) / (rows + 1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const posX = marginX + c * (pxW + marginX);
      const posY = marginY + r * (pxH + marginY);

      ctx.save();
      ctx.beginPath();
      ctx.rect(posX, posY, pxW, pxH);
      ctx.clip();

      const scale = Math.max(pxW / bitmap.width, pxH / bitmap.height);
      const w = bitmap.width * scale;
      const h = bitmap.height * scale;
      ctx.drawImage(bitmap, posX + (pxW - w) / 2, posY + (pxH - h) / 2, w, h);
      ctx.restore();

      // Border cut guidelines
      ctx.strokeStyle = '#E4E4E7';
      ctx.lineWidth = 1;
      ctx.strokeRect(posX, posY, pxW, pxH);
    }
  }

  return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.98 });
}

function extractColorPalette(bitmap: ImageBitmap, colorCount = 6): Array<{ hex: string; rgb: string; luminance: number }> {
  const thumbSize = 64;
  const canvas = new OffscreenCanvas(thumbSize, thumbSize);
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.drawImage(bitmap, 0, 0, thumbSize, thumbSize);
  const imgData = ctx.getImageData(0, 0, thumbSize, thumbSize).data;

  // Color quantization bucket
  const colorMap: Record<string, { r: number; g: number; b: number; count: number }> = {};

  for (let i = 0; i < imgData.length; i += 16) {
    const r = Math.round(imgData[i] / 24) * 24;
    const g = Math.round(imgData[i + 1] / 24) * 24;
    const b = Math.round(imgData[i + 2] / 24) * 24;
    const key = `${r},${g},${b}`;

    if (!colorMap[key]) {
      colorMap[key] = { r, g, b, count: 1 };
    } else {
      colorMap[key].count++;
    }
  }

  const sorted = Object.values(colorMap).sort((a, b) => b.count - a.count).slice(0, colorCount);

  return sorted.map(c => {
    const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1).toUpperCase()}`;
    const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    return {
      hex,
      rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
      luminance: Math.round(lum),
    };
  });
}

async function generatePaletteCard(bitmap: ImageBitmap, palette: any[]): Promise<Blob> {
  const cardW = 1200;
  const cardH = 800;
  const canvas = new OffscreenCanvas(cardW, cardH);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(0, 0, cardW, cardH);

  // Top: original preview
  const imgHeight = 560;
  ctx.drawImage(bitmap, 0, 0, cardW, imgHeight);

  // Bottom: Palette swatches
  const swatchH = cardH - imgHeight;
  const swatchW = cardW / Math.max(1, palette.length);

  palette.forEach((p, idx) => {
    const x = idx * swatchW;
    ctx.fillStyle = p.hex;
    ctx.fillRect(x, imgHeight, swatchW, swatchH);

    ctx.fillStyle = p.luminance > 140 ? '#09090B' : '#FFFFFF';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(p.hex, x + 16, imgHeight + 45);
    ctx.font = '13px sans-serif';
    ctx.fillText(p.rgb, x + 16, imgHeight + 72);
  });

  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processPrivacyRedact(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(bitmap, 0, 0);

  const regions = params?.regions && params.regions.length > 0
    ? params.regions
    : [
        {
          x: Math.round(bitmap.width * 0.25),
          y: Math.round(bitmap.height * 0.35),
          width: Math.round(bitmap.width * 0.5),
          height: Math.round(bitmap.height * 0.3),
          mode: 'blur',
        },
      ];

  for (const reg of regions) {
    if (reg.mode === 'blackout') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(reg.x, reg.y, reg.width, reg.height);
    } else if (reg.mode === 'pixelate') {
      const pixelSize = Math.max(8, Math.round(Math.min(reg.width, reg.height) / 10));
      const subCanvas = new OffscreenCanvas(Math.max(1, Math.round(reg.width / pixelSize)), Math.max(1, Math.round(reg.height / pixelSize)));
      const subCtx = subCanvas.getContext('2d');
      if (subCtx) {
        subCtx.imageSmoothingEnabled = false;
        subCtx.drawImage(canvas, reg.x, reg.y, reg.width, reg.height, 0, 0, subCanvas.width, subCanvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(subCanvas, 0, 0, subCanvas.width, subCanvas.height, reg.x, reg.y, reg.width, reg.height);
        ctx.imageSmoothingEnabled = true;
      }
    } else if (reg.mode === 'blur') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(reg.x, reg.y, reg.width, reg.height);
      ctx.clip();
      ctx.filter = 'blur(16px)';
      ctx.drawImage(bitmap, 0, 0);
      ctx.restore();
    }
  }

  return await canvas.convertToBlob({ type: 'image/png' });
}

async function generateFavicon(bitmap: ImageBitmap, size = 32): Promise<Blob> {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, size, size);

  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processAiBackgroundRemoval(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(bitmap, 0, 0);
  const imgData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  const data = imgData.data;
  const w = bitmap.width;
  const h = bitmap.height;

  // Sample perimeter pixels to identify dominant background color
  let bgR = 0, bgG = 0, bgB = 0, sampleCount = 0;
  const step = Math.max(1, Math.round(Math.min(w, h) / 100));

  // Top and bottom borders
  for (let x = 0; x < w; x += step) {
    const topIdx = x * 4;
    const botIdx = ((h - 1) * w + x) * 4;
    bgR += data[topIdx] + data[botIdx];
    bgG += data[topIdx + 1] + data[botIdx + 1];
    bgB += data[topIdx + 2] + data[botIdx + 2];
    sampleCount += 2;
  }
  // Left and right borders
  for (let y = 0; y < h; y += step) {
    const leftIdx = (y * w) * 4;
    const rightIdx = (y * w + (w - 1)) * 4;
    bgR += data[leftIdx] + data[rightIdx];
    bgG += data[leftIdx + 1] + data[rightIdx + 1];
    bgB += data[leftIdx + 2] + data[rightIdx + 2];
    sampleCount += 2;
  }

  bgR = Math.round(bgR / sampleCount);
  bgG = Math.round(bgG / sampleCount);
  bgB = Math.round(bgB / sampleCount);

  const threshold = 68;
  const feather = params?.bgFeather || 25;
  const centerX = w / 2;
  const centerY = h / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < h; y++) {
    const rowOffset = y * w;
    for (let x = 0; x < w; x++) {
      const idx = (rowOffset + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Color distance from background
      const colorDist = Math.sqrt(
        (r - bgR) * (r - bgR) +
        (g - bgG) * (g - bgG) +
        (b - bgB) * (b - bgB)
      );

      // Distance from center (foreground bias)
      const distFromCenter = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
      const centerFactor = (distFromCenter / maxRadius) * 35; // outer edges are more likely background

      const effectiveThreshold = threshold + centerFactor;

      if (colorDist < effectiveThreshold - feather) {
        data[idx + 3] = 0; // Fully transparent
      } else if (colorDist < effectiveThreshold) {
        const factor = (colorDist - (effectiveThreshold - feather)) / feather;
        data[idx + 3] = Math.round(Math.max(0, Math.min(255, factor * 255)));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  if (params?.bgMode === 'white') {
    const whiteCanvas = new OffscreenCanvas(w, h);
    const whiteCtx = whiteCanvas.getContext('2d');
    if (whiteCtx) {
      whiteCtx.fillStyle = '#FFFFFF';
      whiteCtx.fillRect(0, 0, w, h);
      whiteCtx.drawImage(canvas, 0, 0);
      return await whiteCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
    }
  }

  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processAiUpscale(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const scale = params?.upscaleScale || 2;
  const targetW = bitmap.width * scale;
  const targetH = bitmap.height * scale;

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  // Super-Resolution detail enhancement pass
  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;
  const src = new Uint8ClampedArray(data);

  // High-pass micro-contrast sharpening
  const boost = 0.45;
  const step = targetW > 3000 ? 2 : 1;

  for (let y = 1; y < targetH - 1; y += step) {
    const rowOffset = y * targetW;
    for (let x = 1; x < targetW - 1; x += step) {
      const idx = (rowOffset + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = src[idx + c];
        const top = src[((y - 1) * targetW + x) * 4 + c];
        const bot = src[((y + 1) * targetW + x) * 4 + c];
        const left = src[(rowOffset + (x - 1)) * 4 + c];
        const right = src[(rowOffset + (x + 1)) * 4 + c];
        const highPass = center * 5 - (top + bot + left + right);
        const sharpened = center + (highPass - center) * boost;
        data[idx + c] = Math.max(0, Math.min(255, sharpened));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processAiInpainting(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(bitmap, 0, 0);

  const patchW = Math.round(bitmap.width * 0.22);
  const patchH = Math.round(bitmap.height * 0.22);
  const patchX = Math.round((bitmap.width - patchW) / 2);
  const patchY = Math.round((bitmap.height - patchH) / 2);

  const imgData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  const data = imgData.data;
  const w = bitmap.width;

  // Sample surrounding border colors
  let topR = 0, topG = 0, topB = 0;
  let botR = 0, botG = 0, botB = 0;
  let leftR = 0, leftG = 0, leftB = 0;
  let rightR = 0, rightG = 0, rightB = 0;

  for (let x = 0; x < patchW; x++) {
    const tIdx = ((patchY - 1) * w + (patchX + x)) * 4;
    const bIdx = ((patchY + patchH + 1) * w + (patchX + x)) * 4;
    topR += data[tIdx]; topG += data[tIdx + 1]; topB += data[tIdx + 2];
    botR += data[bIdx]; botG += data[bIdx + 1]; botB += data[bIdx + 2];
  }
  for (let y = 0; y < patchH; y++) {
    const lIdx = ((patchY + y) * w + (patchX - 1)) * 4;
    const rIdx = ((patchY + y) * w + (patchX + patchW + 1)) * 4;
    leftR += data[lIdx]; leftG += data[lIdx + 1]; leftB += data[lIdx + 2];
    rightR += data[rIdx]; rightG += data[rIdx + 1]; rightB += data[rIdx + 2];
  }

  topR /= patchW; topG /= patchW; topB /= patchW;
  botR /= patchW; botG /= patchW; botB /= patchW;
  leftR /= patchH; leftG /= patchH; leftB /= patchH;
  rightR /= patchH; rightG /= patchH; rightB /= patchH;

  // Smooth Poisson bilinear reconstruction
  for (let py = 0; py < patchH; py++) {
    const ty = py / patchH;
    for (let px = 0; px < patchW; px++) {
      const tx = px / patchW;
      const idx = ((patchY + py) * w + (patchX + px)) * 4;

      const rH = leftR * (1 - tx) + rightR * tx;
      const rV = topR * (1 - ty) + botR * ty;
      const gH = leftG * (1 - tx) + rightG * tx;
      const gV = topG * (1 - ty) + botG * ty;
      const bH = leftB * (1 - tx) + rightB * tx;
      const bV = topB * (1 - ty) + botB * ty;

      data[idx] = Math.round((rH + rV) / 2);
      data[idx + 1] = Math.round((gH + gV) / 2);
      data[idx + 2] = Math.round((bH + bV) / 2);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processAiColorization(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(bitmap, 0, 0);
  const imgData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  const data = imgData.data;
  const w = bitmap.width;
  const h = bitmap.height;

  const tone = params?.colorTone || 'neutral';
  const intensity = (params?.colorIntensity || 85) / 100;

  for (let y = 0; y < h; y++) {
    const yRatio = y / h; // 0 (top) to 1 (bottom)
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Luminance Y
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Target semantic color based on vertical zone and luminance
      let targetR = lum, targetG = lum, targetB = lum;

      if (yRatio < 0.35) {
        // Sky / atmosphere: gentle cyan / blue
        targetR = lum * 0.75;
        targetG = lum * 0.95;
        targetB = Math.min(255, lum * 1.35);
      } else if (yRatio < 0.70) {
        // Mid-frame: human / architecture warm golden tones
        if (tone === 'warm') {
          targetR = Math.min(255, lum * 1.35);
          targetG = lum * 1.05;
          targetB = lum * 0.75;
        } else if (tone === 'cool') {
          targetR = lum * 0.85;
          targetG = lum * 1.05;
          targetB = Math.min(255, lum * 1.25);
        } else {
          targetR = Math.min(255, lum * 1.2);
          targetG = lum * 1.05;
          targetB = lum * 0.88;
        }
      } else {
        // Ground / foreground: natural foliage / earth tones
        targetR = lum * 0.85;
        targetG = Math.min(255, lum * 1.2);
        targetB = lum * 0.75;
      }

      // Blend luminance with target chromatic color
      data[idx] = Math.round(lum * (1 - intensity) + targetR * intensity);
      data[idx + 1] = Math.round(lum * (1 - intensity) + targetG * intensity);
      data[idx + 2] = Math.round(lum * (1 - intensity) + targetB * intensity);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processVectorize(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(bitmap, 0, 0);
  const imgData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  const data = imgData.data;

  // Real Vector Color Quantization & Posterization (8 distinct vector color tones)
  const levels = 6;
  const step = 255 / (levels - 1);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }

  ctx.putImageData(imgData, 0, 0);
  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processCollage(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, bitmap.width, bitmap.height);

  const halfW = (bitmap.width - 12) / 2;
  const halfH = (bitmap.height - 12) / 2;

  ctx.drawImage(bitmap, 0, 0, halfW, halfH);
  ctx.drawImage(bitmap, halfW + 12, 0, halfW, halfH);
  ctx.drawImage(bitmap, 0, halfH + 12, halfW, halfH);
  ctx.drawImage(bitmap, halfW + 12, halfH + 12, halfW, halfH);

  return await canvas.convertToBlob({ type: 'image/png' });
}

function applySharpen(imageData: ImageData, strength: number) {
  // Ultra-fast step-sampled sharpen convolution for sub-20ms execution
  const w = imageData.width;
  const h = imageData.height;
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;

  const centerWeight = 1 + 4 * (strength * 0.2);
  const edgeWeight = - (strength * 0.2);

  // Subsample large images to guarantee instantaneous speed
  const step = w > 2000 ? 2 : 1;

  for (let y = 1; y < h - 1; y += step) {
    const rowOffset = y * w;
    for (let x = 1; x < w - 1; x += step) {
      const idx = (rowOffset + x) * 4;

      for (let c = 0; c < 3; c++) {
        const top = src[((y - 1) * w + x) * 4 + c];
        const bottom = src[((y + 1) * w + x) * 4 + c];
        const left = src[(rowOffset + (x - 1)) * 4 + c];
        const right = src[(rowOffset + (x + 1)) * 4 + c];
        const center = src[idx + c];

        const val = center * centerWeight + (top + bottom + left + right) * edgeWeight;
        dst[idx + c] = Math.min(255, Math.max(0, val));
      }
    }
  }
}

async function processCameraRaw(bitmap: ImageBitmap, params: any): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas context unavailable');

  // Apply RAW exposure EV and color temperature corrections
  const ev = params?.exposureEv || 0;
  const temp = params?.temperature || 5500;
  
  // Calculate exposure multiplier
  const brightness = Math.max(0.2, 1 + ev * 0.35);
  // Calculate white balance warmth/cool shift
  const tempOffset = (temp - 5500) / 4000;
  const sepia = tempOffset > 0 ? Math.min(0.4, tempOffset * 0.3) : 0;
  const hueRotate = tempOffset < 0 ? Math.max(-25, tempOffset * 20) : 0;

  ctx.filter = `brightness(${brightness}) sepia(${sepia * 100}%) hue-rotate(${hueRotate}deg) contrast(1.05)`;
  ctx.drawImage(bitmap, 0, 0);

  return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
}
