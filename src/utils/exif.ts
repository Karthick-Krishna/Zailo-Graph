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
  if (dataView.getUint16(0) !== 0xFFD8) {
    // Not a valid JPEG, fallback to returning original blob
    return file;
  }

  const chunks: ArrayBuffer[] = [];
  let offset = 2; // Past SOI marker
  let lastKeptOffset = 0;

  while (offset < dataView.byteLength) {
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

    // Read marker payload length (big-endian 16-bit integer including the 2 length bytes)
    const segmentLength = dataView.getUint16(offset + 2);

    // Metadata markers to strip:
    // 0xE1 = APP1 (EXIF / XMP)
    // 0xE2 = APP2 (ICC / FlashPix) - optional, strip EXIF but preserve if user wanted
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

