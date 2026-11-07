import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { AppWindow, Download, Copy, Check, Code } from 'lucide-react';
import JSZip from 'jszip';

export const FaviconStudioControls: React.FC = () => {
  const { activeImage, executeActiveUtility } = useSession();
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!activeImage) return null;

  const htmlSnippet = `<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

  const manifestSnippet = `{
  "name": "My Web Application",
  "short_name": "App",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}`;

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(null as any), 2000);
  };

  const copyManifest = () => {
    navigator.clipboard.writeText(manifestSnippet);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(null as any), 2000);
  };

  const handleDownloadFaviconPack = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Helper to generate resized PNG blob
      const createResizedPng = async (size: number): Promise<Blob> => {
        const bmp = await createImageBitmap(activeImage.blob);
        const canvas = new OffscreenCanvas(size, size);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(bmp, 0, 0, size, size);
        }
        bmp.close();
        return await canvas.convertToBlob({ type: 'image/png' });
      };

      const [p16, p32, p48, p180, p192, p512] = await Promise.all([
        createResizedPng(16),
        createResizedPng(32),
        createResizedPng(48),
        createResizedPng(180),
        createResizedPng(192),
        createResizedPng(512),
      ]);

      zip.file('favicon-16x16.png', p16);
      zip.file('favicon-32x32.png', p32);
      zip.file('favicon-48x48.png', p48);
      zip.file('apple-touch-icon.png', p180);
      zip.file('android-chrome-192x192.png', p192);
      zip.file('android-chrome-512x512.png', p512);
      zip.file('favicon.ico', p32); // Modern browsers read PNG favicon.ico
      zip.file('site.webmanifest', manifestSnippet);
      zip.file('html-head-snippet.html', htmlSnippet);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeImage.name.replace(/\.[^/.]+$/, '')}_favicon_pack.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create favicon zip pack:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1-Click ZIP Pack Export */}
      <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs">
          <AppWindow className="w-4 h-4 text-amber-400" />
          <span>Full Production Favicon & Icon Pack</span>
        </div>
        <p className="text-[11px] text-neutral-300 leading-relaxed">
          Generates 16×16, 32×32, 48×48 `.ico`, Apple Touch 180×180, Android 192/512, and `manifest.json`.
        </p>
        <button
          onClick={handleDownloadFaviconPack}
          disabled={isZipping}
          className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isZipping ? (
            <span>Generating ZIP Archive...</span>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download Complete Pack (.ZIP)</span>
            </>
          )}
        </button>
      </div>

      {/* Code Snippets */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-neutral-700">HTML &lt;head&gt; Code</label>
            <button
              onClick={copyHtml}
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              {copiedHtml ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedHtml ? 'Copied' : 'Copy HTML'}</span>
            </button>
          </div>
          <pre className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[10px] font-mono text-neutral-700 overflow-x-auto">
            {htmlSnippet}
          </pre>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-neutral-700">site.webmanifest</label>
            <button
              onClick={copyManifest}
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              {copiedManifest ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedManifest ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[10px] font-mono text-neutral-700 overflow-x-auto max-h-32">
            {manifestSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};

