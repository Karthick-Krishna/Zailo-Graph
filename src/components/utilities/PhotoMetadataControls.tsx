import React, { useState, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';
import { 
  ShieldCheck, 
  MapPin, 
  Camera, 
  Calendar, 
  FileText, 
  Check, 
  Copy, 
  Edit3, 
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';

export const PhotoMetadataControls: React.FC = () => {
  const { activeImage, setCurrentParams, executeActiveUtility } = useSession();
  const [copied, setCopied] = useState(false);
  const [isStripping, setIsStripping] = useState(false);
  const [stripDone, setStripDone] = useState(false);

  // Editable metadata state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [copyright, setCopyright] = useState('');
  const [cameraMake, setCameraMake] = useState('');
  const [cameraModel, setCameraModel] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Initialize from activeImage metadata
  useEffect(() => {
    if (activeImage) {
      const meta = activeImage.metadata || {};
      const raw = meta.rawExifTags || {};
      const cam = meta.camera || {};
      const gps = meta.gps || {};

      setTitle(raw.ImageDescription || raw.title || raw.Headline || '');
      setArtist(raw.Artist || raw.creator || raw.Byline || '');
      setCopyright(raw.Copyright || raw.copyrightNotice || (raw.Artist ? `© ${new Date().getFullYear()} ${raw.Artist}` : ''));
      setCameraMake(cam.make || raw.Make || '');
      setCameraModel(cam.model || raw.Model || '');
      setDateTime(cam.dateTime || raw.DateTimeOriginal ? String(cam.dateTime || raw.DateTimeOriginal) : '');
      setLatitude(gps.latitude ? String(gps.latitude) : (raw.latitude ? String(raw.latitude) : ''));
      setLongitude(gps.longitude ? String(gps.longitude) : (raw.longitude ? String(raw.longitude) : ''));
    }
  }, [activeImage?.id]);

  // Sync parameters with session
  useEffect(() => {
    setCurrentParams({
      title,
      artist,
      copyright,
      cameraMake,
      cameraModel,
      dateTime,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      stripMetadata: false,
    });
  }, [title, artist, copyright, cameraMake, cameraModel, dateTime, latitude, longitude, setCurrentParams]);

  if (!activeImage) return null;

  const { metadata } = activeImage;
  const camera = metadata?.camera;
  const gps = metadata?.gps;

  const handleCopyJson = () => {
    const payload = {
      title,
      artist,
      copyright,
      camera: {
        make: cameraMake || camera?.make,
        model: cameraModel || camera?.model,
        lens: camera?.lens,
        iso: camera?.iso,
        aperture: camera?.aperture,
        shutterSpeed: camera?.shutterSpeed,
        dateTime: dateTime || camera?.dateTime,
      },
      gps: latitude && longitude ? {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      } : undefined,
      rawExif: metadata?.rawExifTags,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStripMetadata = async () => {
    setIsStripping(true);
    await executeActiveUtility({ stripMetadata: true });
    setIsStripping(false);
    setStripDone(true);
    setTitle('');
    setArtist('');
    setCopyright('');
    setCameraMake('');
    setCameraModel('');
    setDateTime('');
    setLatitude('');
    setLongitude('');
    setTimeout(() => setStripDone(false), 3000);
  };

  const handleClearGps = () => {
    setLatitude('');
    setLongitude('');
  };

  return (
    <div className="space-y-5">
      {/* Lossless Stripper Card */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Lossless Privacy Scrubber</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Instantly erase GPS coordinates, camera serial numbers, and personal timestamps directly from the JPEG marker table without re-compressing image pixels.
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

      {/* Quick Action: Copy JSON */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
          <Edit3 className="w-3.5 h-3.5 text-violet-600" />
          <span>Edit Metadata Tags</span>
        </label>
        <button
          onClick={handleCopyJson}
          className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy JSON'}</span>
        </button>
      </div>

      {/* Editable Fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-medium text-neutral-600 mb-1">Photo Title / Caption</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Mountain Sunset at Dusk"
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-600 mb-1">Author / Photographer</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="e.g., Alex Rivers"
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-600 mb-1">Copyright Notice</label>
          <input
            type="text"
            value={copyright}
            onChange={(e) => setCopyright(e.target.value)}
            placeholder="e.g., © 2026 Alex Rivers. All Rights Reserved."
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">Camera Make</label>
            <input
              type="text"
              value={cameraMake}
              onChange={(e) => setCameraMake(e.target.value)}
              placeholder="e.g., Sony"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-violet-500 transition"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">Camera Model</label>
            <input
              type="text"
              value={cameraModel}
              onChange={(e) => setCameraModel(e.target.value)}
              placeholder="e.g., ILCE-7RM5"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-violet-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-600 mb-1">Date & Time</label>
          <input
            type="text"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            placeholder="e.g., 2026:05:14 18:42:10"
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        {/* GPS Coordinates Section */}
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>GPS Geolocation</span>
            </span>
            {(latitude || longitude) && (
              <button
                type="button"
                onClick={handleClearGps}
                className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove GPS</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-neutral-400 mb-0.5">Latitude</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 37.7749"
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-neutral-400 mb-0.5">Longitude</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., -122.4194"
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Optical Readout summary */}
      {camera && (camera.lens || camera.iso || camera.aperture || camera.shutterSpeed) && (
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-700 text-[11px] pb-1 border-b border-neutral-200">
            <Camera className="w-3.5 h-3.5 text-neutral-500" />
            <span>Optical Parameters</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[11px]">
            {camera.aperture && (
              <div className="bg-white p-1 rounded-lg border border-neutral-200/60">
                <span className="block text-[9px] text-neutral-400 font-sans">Aperture</span>
                <span className="font-bold text-neutral-700">{camera.aperture}</span>
              </div>
            )}
            {camera.shutterSpeed && (
              <div className="bg-white p-1 rounded-lg border border-neutral-200/60">
                <span className="block text-[9px] text-neutral-400 font-sans">Shutter</span>
                <span className="font-bold text-neutral-700">{camera.shutterSpeed}</span>
              </div>
            )}
            {camera.iso && (
              <div className="bg-white p-1 rounded-lg border border-neutral-200/60">
                <span className="block text-[9px] text-neutral-400 font-sans">ISO</span>
                <span className="font-bold text-neutral-700">{camera.iso}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
