import exifr from 'exifr';
import { ImageMetadata } from '../types/image';

/**
 * Parses EXIF, IPTC, XMP and GPS metadata safely using chunked parsing.
 */
export async function parseImageMetadata(file: Blob | File): Promise<ImageMetadata> {
  try {
    const raw = await exifr.parse(file, {
      tiff: true,
      xmp: true,
      icc: true,
      iptc: true,
      jfif: true,
      gps: true,
    });

    if (!raw) {
      return {};
    }

    const metadata: ImageMetadata = {
      format: raw.format,
      width: raw.ImageWidth || raw.ExifImageWidth,
      height: raw.ImageHeight || raw.ExifImageHeight,
      orientation: raw.Orientation,
      colorSpace: raw.ColorSpace === 1 ? 'sRGB' : raw.ColorSpace === 65535 ? 'Uncalibrated' : raw.ColorSpace,
      camera: {
        make: raw.Make,
        model: raw.Model,
        lens: raw.LensModel || raw.Lens,
        focalLength: raw.FocalLength ? `${raw.FocalLength}mm` : undefined,
        iso: raw.ISO,
        aperture: raw.FNumber ? `ƒ/${raw.FNumber}` : undefined,
        shutterSpeed: raw.ExposureTime ? formatExposureTime(raw.ExposureTime) : undefined,
        dateTime: raw.DateTimeOriginal ? new Date(raw.DateTimeOriginal).toLocaleString() : undefined,
      },
      gps: raw.latitude && raw.longitude ? {
        latitude: raw.latitude,
        longitude: raw.longitude,
        altitude: raw.altitude,
      } : undefined,
      rawExifTags: raw,
    };

    return metadata;
  } catch (err) {
    console.warn('Failed to parse EXIF metadata:', err);
    return {};
  }
}

function formatExposureTime(seconds: number): string {
  if (seconds >= 1) return `${seconds}s`;
  const denom = Math.round(1 / seconds);
  return `1/${denom}s`;
}

/**
 * Losslessly removes EXIF/XMP/IPTC metadata from a JPEG file by directly splicing
 * APP1 (0xFFE1) and related metadata marker segments from the byte array.
 * This guarantees 100% preservation of DCT coefficients and original image quality.
 */
export async function stripJpegMetadataLossless(file: Blob): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const dataView = new DataView(arrayBuffer);

  // Validate SOI (Start of Image) marker: 0xFFD8
  if (dataView.byteLength < 4 || dataView.getUint16(0) !== 0xFFD8) {
    return file;
  }

  const chunks: ArrayBuffer[] = [];
  let offset = 2; // Past SOI marker
  let lastKeptOffset = 0;

  while (offset < dataView.byteLength - 1) {
    // Find next marker (0xFF)
    if (dataView.getUint8(offset) !== 0xFF) {
      offset++;
      continue;
    }

    const marker = dataView.getUint8(offset + 1);

    // Stop scan at SOS (Start of Scan: 0xFFDA) - compressed image data follows
    if (marker === 0xDA) {
      break;
    }

    // Skip standalone markers without length (RST0-RST7: 0xD0-0xD7, SOI: 0xD8)
    if (marker >= 0xD0 && marker <= 0xD8) {
      offset += 2;
      continue;
    }

    // Defensive check: ensure payload length bytes are readable
    if (offset + 4 > dataView.byteLength) break;

    // Read marker payload length (big-endian 16-bit integer including the 2 length bytes)
    const segmentLength = dataView.getUint16(offset + 2);
    if (segmentLength < 2 || offset + 2 + segmentLength > dataView.byteLength) {
      break;
    }

    // Metadata markers to strip:
    // 0xE1 = APP1 (EXIF / XMP)
    // 0xED = APP13 (Photoshop IRB / IPTC)
    // 0xFE = COM (Comment)
    if (marker === 0xE1 || marker === 0xED || marker === 0xFE) {
      // Keep everything before this segment
      if (offset > lastKeptOffset) {
        chunks.push(arrayBuffer.slice(lastKeptOffset, offset));
      }
      // Advance past this segment
      offset += 2 + segmentLength;
      lastKeptOffset = offset;
    } else {
      offset += 2 + segmentLength;
    }
  }

  // Append remaining slice (including SOS and all entropy-coded image data)
  if (lastKeptOffset < arrayBuffer.byteLength) {
    chunks.push(arrayBuffer.slice(lastKeptOffset));
  }

  return new Blob(chunks, { type: 'image/jpeg' });
}

/**
 * Losslessly removes metadata chunks (tEXt, zTXt, iTXt, eXIf) from a PNG file
 * by parsing chunk headers and omitting non-critical metadata chunks without recompressing pixels.
 */
export async function stripPngMetadataLossless(file: Blob): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const dataView = new DataView(arrayBuffer);

  // PNG magic number check: 89 50 4E 47 0D 0A 1A 0A
  if (dataView.byteLength < 8) return file;
  const isPng =
    dataView.getUint8(0) === 0x89 &&
    dataView.getUint8(1) === 0x50 &&
    dataView.getUint8(2) === 0x4E &&
    dataView.getUint8(3) === 0x47 &&
    dataView.getUint8(4) === 0x0D &&
    dataView.getUint8(5) === 0x0A &&
    dataView.getUint8(6) === 0x1A &&
    dataView.getUint8(7) === 0x0A;

  if (!isPng) return file;

  const chunks: ArrayBuffer[] = [];
  let offset = 8; // Past PNG header signature
  let lastKeptOffset = 0;

  const textDecoder = new TextDecoder('ascii');
  const metadataChunkTypes = new Set(['tEXt', 'zTXt', 'iTXt', 'eXIf', 'tIME']);

  while (offset + 8 <= dataView.byteLength) {
    const chunkLength = dataView.getUint32(offset);
    const typeBytes = new Uint8Array(arrayBuffer, offset + 4, 4);
    const chunkType = textDecoder.decode(typeBytes);
    const fullChunkLength = 4 + 4 + chunkLength + 4; // length + type + data + crc

    if (offset + fullChunkLength > dataView.byteLength) break;

    if (metadataChunkTypes.has(chunkType)) {
      if (offset > lastKeptOffset) {
        chunks.push(arrayBuffer.slice(lastKeptOffset, offset));
      }
      offset += fullChunkLength;
      lastKeptOffset = offset;
    } else {
      offset += fullChunkLength;
      if (chunkType === 'IEND') break;
    }
  }

  if (lastKeptOffset < arrayBuffer.byteLength) {
    chunks.push(arrayBuffer.slice(lastKeptOffset));
  }

  return new Blob(chunks, { type: 'image/png' });
}

/**
 * Strips metadata across all formats losslessly where possible (JPEG, PNG).
 */
export async function stripAllImageMetadata(file: Blob): Promise<Blob> {
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    return await stripJpegMetadataLossless(file);
  } else if (file.type === 'image/png') {
    return await stripPngMetadataLossless(file);
  }
  return file;
}

