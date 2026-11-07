/**
 * Codecs and 2D Image Manipulation Web Worker.
 * Executes heavy pixel rendering off the main UI thread via OffscreenCanvas.
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
  opacity: number; // 0 to 1
  color: string;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  rotation: number; // degrees
}

export interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
  isCircle?: boolean;
}

export interface FilterParams {
  brightness: number; // 0 - 2 (1 = normal)
  contrast: number;   // 0 - 2 (1 = normal)
  saturation: number; // 0 - 2 (1 = normal)
  sharpen: number;    // 0 - 5 (0 = none)
  grayscale?: boolean;
}

self.onmessage = async (e: MessageEvent) => {
  const { taskId, type, imageBitmap, params } = e.data;

  try {
    let resultBlob: Blob;

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
      default:
        throw new Error(`Unsupported worker task: ${type}`);
    }

    self.postMessage({
      taskId,
      success: true,
      blob: resultBlob,
      size: resultBlob.size,
    });
  } catch (err: any) {
    self.postMessage({
      taskId,
      success: false,
      error: err.message || 'Worker processing failed',
    });
  }
};

async function processResize(bitmap: ImageBitmap, params: ResizeParams): Promise<Blob> {
  let targetW = bitmap.width;
  let targetH = bitmap.height;

  if (params.scalePercent) {
    const factor = params.scalePercent / 100;
    targetW = Math.max(1, Math.round(bitmap.width * factor));
    targetH = Math.max(1, Math.round(bitmap.height * factor));
  } else if (params.width && params.height) {
    targetW = params.width;
    targetH = params.height;
  } else if (params.width) {
    targetW = params.width;
    targetH = Math.round((bitmap.height * targetW) / bitmap.width);
  } else if (params.height) {
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

async function processCompress(bitmap: ImageBitmap, params: CompressParams): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');

  // If compressing to JPEG, fill canvas with white background for alpha channel
  if (params.format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, bitmap.width, bitmap.height);
  }

  ctx.drawImage(bitmap, 0, 0);

  return await canvas.convertToBlob({
    type: params.format,
    quality: params.quality,
  });
}

async function processCrop(bitmap: ImageBitmap, params: CropParams): Promise<Blob> {
  const { x, y, width, height, isCircle } = params;
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

async function processWatermark(bitmap: ImageBitmap, params: WatermarkParams): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');

  ctx.drawImage(bitmap, 0, 0);

  const { text, fontSize, opacity, color, position, rotation } = params;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.font = `600 ${fontSize}px sans-serif`;

  const textMetrics = ctx.measureText(text);
  const padding = fontSize * 1.5;

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

  ctx.restore();

  return await canvas.convertToBlob({ type: 'image/png' });
}

async function processFilter(bitmap: ImageBitmap, params: FilterParams): Promise<Blob> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');

  const filterStrings: string[] = [];
  if (params.brightness !== 1) filterStrings.push(`brightness(${params.brightness})`);
  if (params.contrast !== 1) filterStrings.push(`contrast(${params.contrast})`);
  if (params.saturation !== 1) filterStrings.push(`saturate(${params.saturation})`);
  if (params.grayscale) filterStrings.push('grayscale(100%)');

  if (filterStrings.length > 0) {
    ctx.filter = filterStrings.join(' ');
  }

  ctx.drawImage(bitmap, 0, 0);

  // If sharpening requested, apply 3x3 convolution
  if (params.sharpen && params.sharpen > 0) {
    const imgData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    applySharpen(imgData, params.sharpen);
    ctx.putImageData(imgData, 0, 0);
  }

  return await canvas.convertToBlob({ type: 'image/png' });
}

function applySharpen(imageData: ImageData, strength: number) {
  const w = imageData.width;
  const h = imageData.height;
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;

  // Unsharp laplacian kernel: [0, -1, 0, -1, 4 + strength, -1, 0, -1, 0]
  const centerWeight = 1 + 4 * (strength * 0.25);
  const edgeWeight = - (strength * 0.25);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;

      for (let c = 0; c < 3; c++) {
        const top = src[((y - 1) * w + x) * 4 + c];
        const bottom = src[((y + 1) * w + x) * 4 + c];
        const left = src[(y * w + (x - 1)) * 4 + c];
        const right = src[(y * w + (x + 1)) * 4 + c];
        const center = src[idx + c];

        const val = center * centerWeight + (top + bottom + left + right) * edgeWeight;
        dst[idx + c] = Math.min(255, Math.max(0, val));
      }
    }
  }
}
