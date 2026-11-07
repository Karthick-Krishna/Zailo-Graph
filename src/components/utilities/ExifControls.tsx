import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { ShieldCheck, MapPin, Camera, Calendar, FileText, Check, Copy } from 'lucide-react';

export const ExifControls: React.FC = () => {
  const { activeImage, executeActiveUtility } = useSession();
  const [copied, setCopied] = useState(false);
  const [isStripping, setIsStripping] = useState(false);
  const [stripDone, setStripDone] = useState(false);

  if (!activeImage) return null;

  const { metadata } = activeImage;
  const camera = metadata?.camera;
  const gps = metadata?.gps;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStripMetadata = async () => {
    setIsStripping(true);
    // Execute lossless EXIF marker stripping without recompressing pixels
    await executeActiveUtility({ stripMetadata: true });
    setIsStripping(false);
    setStripDone(true);
    setTimeout(() => setStripDone(false), 3000);
  };

  const hasExif = !!(camera?.make || camera?.model || gps?.latitude || metadata?.rawExifTags);

  return (
    <div className="space-y-5">
      {/* Lossless Stripper Card */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Lossless EXIF & GPS Scrubber</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Remove location coordinates, camera serial numbers, and personal timestamps directly from the JPEG marker table without re-compressing pixels.
        </p>
        <button
          onClick={handleStripMetadata}
          disabled={isStripping}
          className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {stripDone ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Metadata Stripped (100% Lossless)</span>
            </>
          ) : isStripping ? (
            <span>Splicing byte markers...</span>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strip All Metadata Now</span>
            </>
          )}
        </button>
      </div>

      {/* Metadata Readout */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-neutral-700">Camera & Shooting Parameters</label>
          {hasExif && (
            <button
              onClick={handleCopyJson}
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          )}
        </div>

        {hasExif ? (
          <div className="space-y-2">
            {/* Device Info */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-neutral-800 pb-1 border-b border-neutral-200/60">
                <Camera className="w-3.5 h-3.5 text-neutral-500" />
                <span>Camera & Lens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Make & Model:</span>
                <span className="font-semibold text-neutral-700">{camera?.make || 'Unknown'} {camera?.model}</span>
              </div>
              {camera?.lens && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Lens:</span>
                  <span className="font-medium text-neutral-700 truncate max-w-[160px]">{camera.lens}</span>
                </div>
              )}
            </div>

            {/* Exposure Settings */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-neutral-800 pb-1 border-b border-neutral-200/60">
                <FileText className="w-3.5 h-3.5 text-neutral-500" />
                <span>Exposure Settings</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-white p-1.5 rounded border border-neutral-200 text-center">
                  <span className="text-neutral-400 text-[10px] block font-sans">Aperture</span>
                  <span className="font-bold text-neutral-800">{camera?.aperture || '—'}</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-neutral-200 text-center">
                  <span className="text-neutral-400 text-[10px] block font-sans">Shutter</span>
                  <span className="font-bold text-neutral-800">{camera?.shutterSpeed || '—'}</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-neutral-200 text-center">
                  <span className="text-neutral-400 text-[10px] block font-sans">ISO</span>
                  <span className="font-bold text-neutral-800">{camera?.iso || '—'}</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-neutral-200 text-center">
                  <span className="text-neutral-400 text-[10px] block font-sans">Focal Length</span>
                  <span className="font-bold text-neutral-800">{camera?.focalLength || '—'}</span>
                </div>
              </div>
            </div>

            {/* GPS Location Coordinates */}
            {gps?.latitude && gps?.longitude && (
              <div className="p-3 rounded-xl bg-red-50/60 border border-red-200/60 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>GPS Home Coordinates Embedded</span>
                </div>
                <p className="text-[11px] font-mono text-red-800">
                  {gps.latitude.toFixed(6)}°, {gps.longitude.toFixed(6)}°
                  {gps.altitude ? ` (${gps.altitude}m alt)` : ''}
                </p>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${gps.latitude}&mlon=${gps.longitude}#map=16/${gps.latitude}/${gps.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-red-700 underline block"
                >
                  View on OpenStreetMap &rarr;
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center">
            <p className="text-xs text-neutral-500">No EXIF or GPS metadata found in this image bitstream.</p>
          </div>
        )}
      </div>
    </div>
  );
};

