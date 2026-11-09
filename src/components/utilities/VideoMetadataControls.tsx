import React, { useState, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';
import { 
  Video, 
  Film, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  Edit3, 
  FileVideo,
  Sparkles,
  Layers
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export const VideoMetadataControls: React.FC = () => {
  const { activeImage, setCurrentParams, executeActiveUtility } = useSession();
  const [copied, setCopied] = useState(false);
  const [isStripping, setIsStripping] = useState(false);
  const [stripDone, setStripDone] = useState(false);

  // Video container tags
  const [videoTitle, setVideoTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [copyright, setCopyright] = useState('');

  // Video playback & duration readout
  const [duration, setDuration] = useState<number | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (activeImage) {
      const isVideo = activeImage.type?.startsWith('video/') || 
                      activeImage.name.toLowerCase().endsWith('.mp4') || 
                      activeImage.name.toLowerCase().endsWith('.mov') || 
                      activeImage.name.toLowerCase().endsWith('.webm');
      
      if (isVideo && activeImage.url) {
        const vid = document.createElement('video');
        vid.preload = 'metadata';
        vid.src = activeImage.url;
        vid.onloadedmetadata = () => {
          setDuration(vid.duration);
          setVideoDimensions({
            width: vid.videoWidth,
            height: vid.videoHeight,
          });
        };
      }

      // Pre-populate sensible defaults from file name or metadata
      const cleanName = activeImage.name.replace(/\.[^/.]+$/, '');
      setVideoTitle(cleanName);
      setYear(String(new Date().getFullYear()));
      setCopyright(`© ${new Date().getFullYear()} All Rights Reserved.`);
    }
  }, [activeImage?.id, activeImage?.url]);

  // Sync parameters with session
  useEffect(() => {
    setCurrentParams({
      videoTitle,
      artist,
      year,
      description,
      copyright,
      stripMetadata: false,
    });
  }, [videoTitle, artist, year, description, copyright, setCurrentParams]);

  if (!activeImage) return null;

  const handleCopyJson = () => {
    const data = {
      title: videoTitle,
      artist,
      year,
      description,
      copyright,
      duration: duration ? `${duration.toFixed(1)}s` : undefined,
      resolution: videoDimensions ? `${videoDimensions.width}x${videoDimensions.height}` : undefined,
      fileName: activeImage.name,
      fileSize: formatBytes(activeImage.size),
      mimeType: activeImage.type,
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStripMetadata = async () => {
    setIsStripping(true);
    await executeActiveUtility({ stripMetadata: true });
    setIsStripping(false);
    setStripDone(true);
    setVideoTitle('');
    setArtist('');
    setYear('');
    setDescription('');
    setCopyright('');
    setTimeout(() => setStripDone(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Video Privacy Scrubber */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Video Privacy & Tag Scrubber</span>
        </div>
        <p className="text-[11px] text-indigo-800 leading-relaxed">
          Sanitize MP4, MOV, and WebM container tags. Erase device fingerprints, editing software metadata, and geolocation tags before publishing.
        </p>
        <button
          onClick={handleStripMetadata}
          disabled={isStripping}
          className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {stripDone ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Video Metadata Scrubbed</span>
            </>
          ) : isStripping ? (
            <span>Processing stream...</span>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strip Video Tags Now</span>
            </>
          )}
        </button>
      </div>

      {/* Stream Inspection Readout */}
      <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-neutral-200/60">
          <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-neutral-600" />
            <span>Container Stream Info</span>
          </span>
          <button
            onClick={handleCopyJson}
            className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[11px]">
          <div className="bg-white p-1.5 rounded-xl border border-neutral-200/60">
            <span className="block text-[9px] text-neutral-400 font-sans">Resolution</span>
            <span className="font-bold text-neutral-700 truncate">
              {videoDimensions ? `${videoDimensions.width}×${videoDimensions.height}` : `${activeImage.width}×${activeImage.height}`}
            </span>
          </div>
          <div className="bg-white p-1.5 rounded-xl border border-neutral-200/60">
            <span className="block text-[9px] text-neutral-400 font-sans">Duration</span>
            <span className="font-bold text-neutral-700">
              {duration ? `${duration.toFixed(1)}s` : '--'}
            </span>
          </div>
          <div className="bg-white p-1.5 rounded-xl border border-neutral-200/60">
            <span className="block text-[9px] text-neutral-400 font-sans">Size</span>
            <span className="font-bold text-neutral-700">
              {formatBytes(activeImage.size)}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Video Tags */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Edit Container Metadata Tags</span>
        </label>

        <div>
          <label className="block text-[11px] font-medium text-neutral-600 mb-1">Video Title</label>
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="e.g., Summer Reel 2026 4K"
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-600 mb-1">Director / Author / Artist</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="e.g., Studio Vision"
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">Release Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2026"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">Copyright</label>
            <input
              type="text"
              value={copyright}
              onChange={(e) => setCopyright(e.target.value)}
              placeholder="e.g., © 2026 Studio Vision"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-neutral-600 mb-1">Description / Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="e.g., Rendered with master audio and color correction."
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-indigo-500 transition resize-none"
          />
        </div>
      </div>
    </div>
  );
};

