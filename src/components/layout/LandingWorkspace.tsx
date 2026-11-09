import React, { useRef, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { UTILITIES } from '../../types/utility';
import { ZailoGraphLogo } from '../common/ZailoGraphLogo';
import { 
  UploadCloud, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Layers, 
  Camera, 
  X
} from 'lucide-react';
import { DocumentConversionPanel } from '../converter/DocumentConversionPanel';
import { GatedFeatureCard } from '../auth/GatedFeatureCard';
import { ICON_MAP } from './ToolSidebar';
import { Footer } from './Footer';

export const LandingWorkspace: React.FC = () => {
  const { addImages, activeUtilityId, setActiveUtilityId, savedSessionCount, restoreSavedSession, clearSavedSession, setIsMobileToolsOpen } = useSession();
  const { isUtilityUnlocked } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const activeUtility = UTILITIES.find(u => u.id === activeUtilityId) || UTILITIES[0];
  const isUnlocked = isUtilityUnlocked(activeUtility.id);
  const ActiveIcon = ICON_MAP[activeUtility.icon] || Sparkles;

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
      ctx.fillText('ZAILO GRAPH VECTOR STUDIO', 400, 820);
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

  return (
    <div className="w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto px-3 sm:px-6 py-4 sm:py-10 flex flex-col items-center">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif,.cr2,.cr3,.nef,.arw,.dng,.svg"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Container */}
      <div className="w-full max-w-5xl flex flex-col items-center space-y-8 sm:space-y-10 relative">
        {/* Hero Banner Header */}
        <div className="text-center space-y-4 sm:space-y-5 max-w-3xl relative z-10 flex flex-col items-center px-1">
          {/* Logo Brand Emblem with Subtle Glow */}
          <div className="relative group cursor-pointer py-1 sm:py-2" onClick={() => fileInputRef.current?.click()}>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-sky-500/15 to-blue-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition duration-500"></div>
            <div className="hidden sm:block">
              <ZailoGraphLogo size="xl" showText={true} showTagline={true} className="relative drop-shadow-xl" />
            </div>
            <div className="hidden min-[380px]:block sm:hidden">
              <ZailoGraphLogo size="lg" showText={true} showTagline={true} className="relative drop-shadow-lg" />
            </div>
            <div className="min-[380px]:hidden">
              <ZailoGraphLogo size="md" showText={true} showTagline={false} className="relative drop-shadow-md" />
            </div>
          </div>

          {/* Privacy Trust Pill & Mobile 25 Tools Navigation Shortcut */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200/80 text-neutral-800 text-[11px] sm:text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-sky-400 animate-pulse"></span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>100% Private • Built by Coralgenz Global &amp; Zorquelz Technologies</span>
            </div>

            {/* Mobile Direct Navigation Button */}
            <button
              onClick={() => setIsMobileToolsOpen(true)}
              className="md:hidden inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer active:scale-95"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Browse 25 Tools</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Active Primed Tool Badge (if non-default) */}
          {activeUtilityId && activeUtilityId !== 'workflow-recipes' && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Primed for: <strong>{activeUtility.name}</strong></span>
              <button 
                onClick={() => setActiveUtilityId('workflow-recipes')}
                className="text-blue-500 hover:text-blue-900 font-bold ml-1 text-sm cursor-pointer"
                title="Reset to default"
              >
                &times;
              </button>
            </div>
          )}

          <h1 className="text-2xl min-[360px]:text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.1] font-display">
            Your images. Your workflow. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 bg-clip-text text-transparent">
              Your control.
            </span>
          </h1>

          {/* Brand Tagline Accent */}
          <div className="flex items-center justify-center gap-3 w-full max-w-md pt-0.5">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-blue-300"></div>
            <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
              THE BROWSER IMAGE STUDIO
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-sky-300"></div>
          </div>

          <p className="text-xs sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Compress, vectorize, crop, sharpen, and convert images with WebAssembly and Web Workers. 
            All 25 tools run strictly in your browser — zero cloud latency, zero subscriptions, zero ads.
          </p>
        </div>

        {/* Local Session Recovery Banner (Zero Data Loss) */}
        {savedSessionCount > 0 && (
          <div className="w-full max-w-xl mx-auto p-4 rounded-2xl bg-neutral-900 border border-blue-500/40 text-white flex items-center justify-between shadow-xl shadow-blue-950/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/40 text-sky-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Previous Session Available</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200">
                    {savedSessionCount} {savedSessionCount === 1 ? 'image' : 'images'}
                  </span>
                </p>
                <p className="text-[10px] text-neutral-400">Saved in your browser virtual disk. Restore with zero loss.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearSavedSession}
                className="text-[11px] text-neutral-400 hover:text-white px-2.5 py-1 transition cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={restoreSavedSession}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:opacity-90 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <span>Restore Files</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Feature Showcase, Pro Gate or Document Converter Studio */}
        {!isUnlocked ? (
          <div className="w-full max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
            <GatedFeatureCard utility={activeUtility} />
          </div>
        ) : activeUtilityId === 'document-converter' ? (
          <div className="w-full max-w-5xl animate-in fade-in duration-200">
            <DocumentConversionPanel />
          </div>
        ) : (
          <div className="w-full max-w-3xl flex flex-col items-center space-y-4">
            {/* Highlighted Active Feature Card on Main Screen */}
            <div className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-50/95 via-sky-50/80 to-white border-2 border-blue-400 shadow-xl shadow-blue-500/10 ring-2 ring-blue-300/40 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-mono font-bold uppercase tracking-wider shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  <span>Currently Chosen Feature</span>
                </div>
                <div className="flex items-center gap-2">
                  {activeUtilityId !== 'compression' && (
                    <button
                      onClick={() => setActiveUtilityId('compression')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition active:scale-95 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3 text-neutral-500" />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileToolsOpen(true)}
                    className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-800 transition active:scale-95 cursor-pointer"
                  >
                    <Layers className="w-3 h-3 text-blue-600" />
                    <span>Change</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                  <ActiveIcon className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight font-display">
                      {activeUtility.name}
                    </h3>
                    {activeUtility.badge && (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {activeUtility.badge}
                      </span>
                    )}
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-200/80 text-neutral-700 font-semibold">
                      {activeUtility.category}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {activeUtility.description}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-blue-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-neutral-600">
                  <span className="font-semibold text-neutral-800">Supported input:</span>
                  <span className="font-mono text-neutral-600">{activeUtility.inputFormats.slice(0, 5).join(', ')}</span>
                </div>
                <span className="font-semibold text-blue-700">
                  Drop files below to process with this tool &darr;
                </span>
              </div>
            </div>

            {/* Interactive Drag & Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full rounded-2xl sm:rounded-3xl border-2 border-dashed p-4 sm:p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group bg-white/85 backdrop-blur-xl shadow-lg ${
                isDragOver
                  ? 'border-blue-600 bg-blue-50/50 scale-[1.01] shadow-2xl shadow-blue-500/15'
                  : 'border-blue-200/80 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10'
              }`}
            >
            {/* Subtle Ambient Radial Highlight */}
            <div className="absolute inset-0 bg-radial from-blue-50/40 via-transparent to-transparent opacity-70 pointer-events-none rounded-2xl sm:rounded-3xl"></div>

            {/* Central Cloud Icon with Logo Tint */}
            <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 text-neutral-800 flex items-center justify-center mb-3 sm:mb-5 group-hover:from-blue-600 group-hover:to-sky-500 group-hover:text-white transition duration-300 shadow-xs border border-neutral-200/60 group-hover:border-transparent">
              <UploadCloud className="w-6 sm:w-8 h-6 sm:h-8" />
            </div>

            <h2 className="text-base sm:text-2xl font-bold text-neutral-900 mb-2 leading-snug">
              Drop files here for <span className="text-blue-600 font-extrabold">{activeUtility.name}</span>, paste with <kbd className="hidden sm:inline px-1.5 py-0.5 rounded-md bg-neutral-100 border border-neutral-300 font-mono text-xs text-neutral-700">Ctrl + V</kbd><span className="sm:hidden">clipboard</span>, or <span className="underline decoration-blue-300 underline-offset-4 group-hover:decoration-blue-600 transition">browse</span>
            </h2>
          <p className="text-xs text-neutral-500 max-w-md mb-4 sm:mb-5 leading-relaxed">
            Drag single files or an entire batch. Supports high-res AVIF, JPEG, PNG, WebP, SVG, Apple HEIC, and Camera RAW.
          </p>

          {/* Mobile Direct Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-6 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition min-h-[44px]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Choose Images</span>
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 font-semibold text-xs border border-neutral-300/80 flex items-center justify-center gap-2 cursor-pointer transition min-h-[44px]"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Take Photo</span>
            </button>
          </div>

          {/* Supported Format Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1 max-w-lg mb-4 sm:mb-8">
            {['AVIF', 'WEBP', 'JPG', 'PNG', 'SVG', 'HEIC', 'CR2/CR3', 'NEF', 'ARW', 'DNG'].map((fmt) => (
              <span
                key={fmt}
                className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-medium border bg-neutral-100 text-neutral-600 border-neutral-200/60"
              >
                {fmt}
              </span>
            ))}
          </div>

          {/* Instant 1-Click Test Drive Row */}
          <div 
            className="w-full pt-4 sm:pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>No image on hand? Try instant sample:</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar touch-pan-x">
              <button
                onClick={() => loadDemoSample('photo')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0 min-h-[38px]"
                title="4K Landscape photo for MozJPEG compression and sharpening"
              >
                <span>🏔️ Landscape</span>
              </button>
              <button
                onClick={() => loadDemoSample('portrait')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0 min-h-[38px]"
                title="Portrait shot for passport photo studio"
              >
                <span>👤 Portrait</span>
              </button>
              <button
                onClick={() => loadDemoSample('vector')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0 min-h-[38px]"
                title="Graphic design for SVG vectorization and palette extraction"
              >
                <span>🎨 Logo Art</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>

      {/* Clean Collaborative Footer */}
      <Footer />
    </div>
  );
};
