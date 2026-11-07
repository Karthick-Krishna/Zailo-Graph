import React, { useRef, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES, UtilityCategory } from '../../types/utility';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { 
  UploadCloud, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Camera, 
  FileCode2, 
  Maximize2,
  FileDown,
  Palette,
  EyeOff,
  IdCard,
  Lock,
  Scissors,
  CheckCircle2,
  Sliders,
  Share2,
  Image as ImageIcon
} from 'lucide-react';

export const LandingWorkspace: React.FC = () => {
  const { addImages, setActiveUtilityId } = useSession();
  const { user, openAuthModal } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<UtilityCategory | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await addImages(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addImages(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // Generate realistic high-res procedural test images for instant test driving
  const loadDemoSample = async (type: 'photo' | 'portrait' | 'vector' | 'art') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'photo') {
      // Landscape sunset gradient with textured mountains and sun
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 800);
      skyGrad.addColorStop(0, '#0F172A');
      skyGrad.addColorStop(0.4, '#1E293B');
      skyGrad.addColorStop(0.7, '#C2410C');
      skyGrad.addColorStop(1, '#F59E0B');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1920, 1080);

      // Glowing Golden Sun
      ctx.save();
      const sunGrad = ctx.createRadialGradient(960, 480, 20, 960, 480, 220);
      sunGrad.addColorStop(0, '#FEF08A');
      sunGrad.addColorStop(0.5, '#F59E0B');
      sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(960, 480, 220, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Mountain silhouette layers
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.moveTo(0, 1080);
      ctx.lineTo(0, 720);
      ctx.lineTo(380, 560);
      ctx.lineTo(820, 780);
      ctx.lineTo(1240, 520);
      ctx.lineTo(1680, 760);
      ctx.lineTo(1920, 680);
      ctx.lineTo(1920, 1080);
      ctx.closePath();
      ctx.fill();

      // Foreground mountain ridge
      ctx.fillStyle = '#09090B';
      ctx.beginPath();
      ctx.moveTo(0, 1080);
      ctx.lineTo(0, 840);
      ctx.lineTo(540, 680);
      ctx.lineTo(960, 890);
      ctx.lineTo(1420, 710);
      ctx.lineTo(1920, 850);
      ctx.lineTo(1920, 1080);
      ctx.closePath();
      ctx.fill();

    } else if (type === 'portrait') {
      // Studio portrait background with simulated subject
      const studioGrad = ctx.createRadialGradient(960, 540, 100, 960, 540, 900);
      studioGrad.addColorStop(0, '#27272A');
      studioGrad.addColorStop(1, '#09090B');
      ctx.fillStyle = studioGrad;
      ctx.fillRect(0, 0, 1920, 1080);

      // Silhouette Head & Shoulders (perfect for AI background removal testing)
      ctx.fillStyle = '#3F3F46';
      ctx.beginPath();
      ctx.arc(960, 440, 160, 0, Math.PI * 2); // Head
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(960, 880, 340, 300, 0, 0, Math.PI * 2); // Torso / Shoulders
      ctx.fill();

      // Studio rim lighting ring
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(960, 440, 168, Math.PI * 0.8, Math.PI * 1.8);
      ctx.stroke();

    } else if (type === 'vector') {
      // Clean graphic design for vectorization and palette extraction
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, 1920, 1080);

      // Geometric dynamic shapes
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.roundRect(400, 300, 340, 340, 40);
      ctx.fill();

      ctx.fillStyle = '#8B5CF6';
      ctx.beginPath();
      ctx.arc(1060, 470, 180, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.moveTo(1380, 640);
      ctx.lineTo(1580, 300);
      ctx.lineTo(1780, 640);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText('ZORQUELZ VECTOR STUDIO', 400, 820);
      ctx.font = '32px monospace';
      ctx.fillStyle = '#64748B';
      ctx.fillText('Sharp SVG Vectorization & Color Quantization Test', 400, 890);

    } else {
      // Art / Texture sample
      const artGrad = ctx.createLinearGradient(0, 0, 1920, 1080);
      artGrad.addColorStop(0, '#312E81');
      artGrad.addColorStop(0.5, '#4C1D95');
      artGrad.addColorStop(1, '#831843');
      ctx.fillStyle = artGrad;
      ctx.fillRect(0, 0, 1920, 1080);
    }

    // Overlay studio metadata watermark in corner
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`ZAILO GRAPH STUDIO SAMPLE • ${type.toUpperCase()} • 1920×1080`, 60, 1020);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `zailo_graph_sample_${type}_1080p.png`, { type: 'image/png' });
        addImages([file]);
      }
    }, 'image/png');
  };

  const filteredUtilities = selectedFilter === 'all' 
    ? UTILITIES 
    : UTILITIES.filter(u => u.category === selectedFilter);

  return (
    <div className="w-full flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif,.cr2,.cr3,.nef,.arw,.dng,.svg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Container */}
      <div className="w-full max-w-5xl flex flex-col items-center space-y-10 relative">
        {/* Subtle Ambient Violet & Cyan Rim Glow from Logo */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-56 bg-gradient-to-r from-violet-600/15 via-indigo-600/10 to-cyan-500/15 blur-3xl pointer-events-none rounded-full"></div>

        {/* Hero Banner Header */}
        <div className="text-center space-y-5 max-w-3xl relative z-10 flex flex-col items-center">
          {/* Logo Brand Emblem with Subtle Glow */}
          <div className="relative group cursor-pointer py-2" onClick={() => fileInputRef.current?.click()}>
            <div className="absolute -inset-4 bg-gradient-to-r from-fuchsia-600/20 via-purple-600/15 to-cyan-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition duration-500"></div>
            <ZailoGraphLogo size="xl" showText={true} showTagline={true} className="relative drop-shadow-xl" />
          </div>

          {/* Privacy Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200/80 text-neutral-800 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 animate-pulse"></span>
            <ShieldCheck className="w-3.5 h-3.5 text-violet-600" />
            <span>100% Private • High-Speed Processing • Built by Zorquelz</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.08]">
            Your images. Your workflow. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Your control.
            </span>
          </h1>

          {/* Brand Tagline Accent */}
          <div className="flex items-center justify-center gap-3 w-full max-w-md pt-0.5">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-violet-300"></div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
              THE BROWSER IMAGE STUDIO
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-cyan-300"></div>
          </div>

          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Compress, vectorize, crop, colorize, and enhance images with WebAssembly and WebGPU. 
            All 25 tools run strictly in your browser — zero cloud latency, zero subscriptions, zero ads.
          </p>
        </div>

        {/* Hero Interactive Drag & Drop Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-3xl border-2 border-dashed p-10 sm:p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group bg-white shadow-sm ${
            isDragOver
              ? 'border-violet-600 bg-violet-50/30 scale-[1.01] shadow-xl shadow-violet-500/10'
              : 'border-neutral-300 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/5'
          }`}
        >
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute inset-0 bg-radial from-violet-50/40 via-transparent to-transparent opacity-70 pointer-events-none rounded-3xl"></div>

          {/* Central Cloud Icon with Logo Tint */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 text-neutral-800 flex items-center justify-center mb-5 group-hover:from-violet-600 group-hover:to-cyan-600 group-hover:text-white transition duration-300 shadow-xs border border-neutral-200/60 group-hover:border-transparent">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
            Drop your images here, or <span className="underline decoration-violet-300 underline-offset-4 group-hover:decoration-violet-600 transition">browse files</span>
          </h2>
          <p className="text-xs text-neutral-500 max-w-md mb-6 leading-relaxed">
            Drag single files or an entire batch. Supports high-res JPEG, PNG, WebP, SVG, Apple HEIC, and Camera RAW (Canon CR2/CR3, Nikon NEF, Sony ARW, Adobe DNG).
          </p>

          {/* Supported Format Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg mb-8">
            {['JPEG / JPG', 'PNG', 'WEBP', 'SVG', 'APPLE HEIC', 'CANON CR2/CR3', 'NIKON NEF', 'SONY ARW', 'ADOBE DNG'].map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-100 text-neutral-600 border border-neutral-200/60"
              >
                {fmt}
              </span>
            ))}
          </div>

          {/* Instant 1-Click Test Drive Row */}
          <div 
            className="w-full pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>No image on hand? Test drive with an instant sample:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => loadDemoSample('photo')}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                title="4K Landscape photo for MozJPEG compression and sharpening"
              >
                <span>🏔️ Landscape (Codecs)</span>
              </button>
              <button
                onClick={() => loadDemoSample('portrait')}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                title="Portrait shot for AI background removal & passport studio"
              >
                <span>👤 Portrait (AI & Crop)</span>
              </button>
              <button
                onClick={() => loadDemoSample('vector')}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                title="Graphic design for SVG vectorization and palette extraction"
              >
                <span>🎨 Logo (Vector & Palette)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Feature Studio Highlights */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col space-y-2 hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/5 transition group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">MozJPEG &amp; OxiPNG</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Industry-standard WASM codecs with interactive side-by-side Before/After diff sliders.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col space-y-2 hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/5 transition group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/60 text-violet-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">WebGPU Neural AI</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Tiled on-device neural background removal, 4× super-resolution, inpainting, and colorization.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col space-y-2 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/5 transition group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200/60 text-cyan-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCode2 className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">SVG &amp; Vectorizer</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Convert PNGs to crisp SVG vectors, and render complex vector drawings up to 16,384px print formats.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col space-y-2 hover:border-rose-300 hover:shadow-md hover:shadow-rose-500/5 transition group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/60 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Camera RAW Studio</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Instant binary preview extraction (&lt;50ms) and 14-bit RAW demosaicing for professional DSLR cameras.
            </p>
          </div>
        </div>

        {/* 25 Browser Utilities Directory */}
        <div className="w-full space-y-6 pt-6 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">The 25 Browser Utilities</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Select any utility below to launch its dedicated workspace with custom parameters.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'All 25' },
                { id: 'optimize', label: 'Optimize' },
                { id: 'convert', label: 'Convert' },
                { id: 'ai', label: 'AI Suite' },
                { id: 'edit', label: 'Edit & Crop' },
                { id: 'metadata', label: 'Metadata' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilter(cat.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                    selectedFilter === cat.id
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Utility Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
            {filteredUtilities.map((u) => {
              const isLocked = u.isCompetitorPaid && !user;
              return (
                <div
                  key={u.id}
                  onClick={() => {
                    setActiveUtilityId(u.id);
                    if (isLocked) {
                      openAuthModal('pro_feature', u.id);
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="p-4 rounded-2xl bg-white hover:bg-neutral-50/90 border border-neutral-200/80 hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/5 transition cursor-pointer flex flex-col justify-between group shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                        {u.category}
                      </span>
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Free Pro</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200/60">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Local</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-neutral-900 group-hover:text-violet-950 transition-colors">
                      {u.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                      {u.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="font-mono">{u.supportsBatch ? 'Batch Capable' : 'Single Studio'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-violet-600 group-hover:translate-x-1 transition duration-150" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Trust Bar */}
        <div className="w-full pt-8 pb-12 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-mono">
          <div>ZAILO GRAPH • ZORQUELZ OPEN PRODUCT ECOSYSTEM</div>
          <div className="flex items-center gap-4">
            <span>ZERO CLOUD TRANSMISSION</span>
            <span>•</span>
            <span>100% PRIVATE &amp; FREE</span>
          </div>
        </div>

      </div>
    </div>
  );
};
