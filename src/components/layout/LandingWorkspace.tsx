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
  X,
  Image as ImageIcon,
  User,
  PenTool,
  Palette
} from 'lucide-react';
import { Base64Controls } from '../utilities/Base64Controls';
import { DocumentConversionPanel } from '../converter/DocumentConversionPanel';
import { GatedFeatureCard } from '../auth/GatedFeatureCard';
import { ICON_MAP } from './ToolSidebar';
import { Footer } from './Footer';

export const LandingWorkspace: React.FC = () => {
  const { addImages, activeUtilityId, setActiveUtilityId, savedSessionCount, restoreSavedSession, clearSavedSession, setIsMobileToolsOpen } = useSession();
  const { isUtilityUnlocked } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const [showBase64Modal, setShowBase64Modal] = useState(false);
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
        <div className="text-center space-y-4 max-w-2xl relative z-10 flex flex-col items-center px-1">
          {/* Logo Brand Emblem */}
          <div className="cursor-pointer py-1" onClick={() => fileInputRef.current?.click()}>
            <div className="hidden sm:block">
              <ZailoGraphLogo size="xl" showText={true} showTagline={true} />
            </div>
            <div className="hidden min-[380px]:block sm:hidden">
              <ZailoGraphLogo size="lg" showText={true} showTagline={true} />
            </div>
            <div className="min-[380px]:hidden">
              <ZailoGraphLogo size="md" showText={true} showTagline={false} />
            </div>
          </div>

          {/* Privacy Trust Pill */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>100% private • Browser WebAssembly • Zero server uploads</span>
            </div>

            {/* Mobile Navigation Shortcut */}
            <button
              onClick={() => setIsMobileToolsOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All 24 tools</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold text-neutral-900 tracking-tight leading-[1.15]">
            Local-first image studio. <br className="hidden sm:inline" />
            <span className="text-neutral-500 font-normal">
              Private, fast, in your browser.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Compress, convert, resize, and edit images without uploading to cloud servers. 24 utilities running directly on your hardware.
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
            {/* Active Feature Toolbar */}
            <div className="w-full p-4 rounded-xl bg-white border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>Active tool</span>
                </div>
                <div className="flex items-center gap-2">
                  {activeUtilityId !== 'compression' && (
                    <button
                      onClick={() => setActiveUtilityId('compression')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3 text-neutral-500" />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileToolsOpen(true)}
                    className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-medium text-neutral-800 transition cursor-pointer"
                  >
                    <Layers className="w-3 h-3 text-neutral-600" />
                    <span>Change</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <h3 className="text-base font-semibold text-neutral-900 tracking-tight">
                      {activeUtility.name}
                    </h3>
                    {activeUtility.badge && (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {activeUtility.badge}
                      </span>
                    )}
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      {activeUtility.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {activeUtility.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-neutral-700">Supported formats:</span>
                  <span className="font-mono text-neutral-600">{activeUtility.inputFormats.slice(0, 5).join(', ')}</span>
                </div>
                <span className="text-neutral-500 font-mono text-[10px]">
                  Drop files to process
                </span>
              </div>
            </div>

            {/* Interactive Drag & Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full rounded-2xl border-2 border-dashed p-6 sm:p-12 transition cursor-pointer flex flex-col items-center justify-center text-center bg-white shadow-xs ${
                isDragOver
                  ? 'border-blue-600 bg-blue-50/30'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              {/* Central Upload Icon */}
              <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>

              <h2 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1.5">
                Drop files here for <span className="text-blue-600 font-medium">{activeUtility.name}</span>, paste from <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-xs text-neutral-700">Ctrl+V</kbd>, or <span className="underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-600">browse</span>
              </h2>
              <p className="text-xs text-neutral-500 max-w-md mb-5 leading-relaxed">
                Drag single files or an entire batch. Supports AVIF, JPEG, PNG, WebP, SVG, Apple HEIC, and Camera RAW.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition min-h-[36px]"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Choose images</span>
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium text-xs border border-neutral-300 flex items-center justify-center gap-2 cursor-pointer transition min-h-[36px]"
                >
                  <Camera className="w-4 h-4 text-neutral-600" />
                  <span>Camera</span>
                </button>
              </div>

              {/* Supported Format Badges */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg mb-6">
                {['AVIF', 'WEBP', 'JPG', 'PNG', 'SVG', 'HEIC', 'CR2/CR3', 'NEF', 'ARW', 'DNG'].map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2 py-0.5 rounded text-[10px] font-mono text-neutral-600 bg-neutral-100 border border-neutral-200"
                  >
                    {fmt}
                  </span>
                ))}
              </div>

              {/* 1-Click Test Drive Row */}
              <div 
                className="w-full pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                  <span>Samples:</span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
                  <button
                    onClick={() => loadDemoSample('photo')}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Landscape photo sample"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Landscape</span>
                  </button>
                  <button
                    onClick={() => loadDemoSample('portrait')}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Portrait photo sample"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Portrait</span>
                  </button>
                  <button
                    onClick={() => loadDemoSample('vector')}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Vector art sample"
                  >
                    <PenTool className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Vector</span>
                  </button>
                  <button
                    onClick={() => loadDemoSample('art')}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Abstract art sample"
                  >
                    <Palette className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Palette</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clean Collaborative Footer */}
      <Footer />

      {/* Base64 to Image Decoder Modal */}
      {(showBase64Modal || activeUtilityId === 'base64-to-image') && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => {
            setShowBase64Modal(false);
            if (activeUtilityId === 'base64-to-image') {
              setActiveUtilityId('compression');
            }
          }}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowBase64Modal(false);
                    if (activeUtilityId === 'base64-to-image') {
                      setActiveUtilityId('compression');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <h3 className="text-sm font-bold text-neutral-900">Base64 to Image Decoder</h3>
              </div>
              <button
                onClick={() => {
                  setShowBase64Modal(false);
                  if (activeUtilityId === 'base64-to-image') {
                    setActiveUtilityId('compression');
                  }
                }}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Base64Controls />
          </div>
        </div>
      )}
    </div>
  );
};
