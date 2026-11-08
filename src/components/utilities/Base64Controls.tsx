import React, { useState, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';
import { formatBytes } from '../../utils/formatters';
import { Binary, Copy, Check, ArrowDown, Sparkles } from 'lucide-react';

export const Base64Controls: React.FC = () => {
  const { activeImage, addBase64Image } = useSession();
  const [base64String, setBase64String] = useState<string>('');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [pasteInput, setPasteInput] = useState<string>('');
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState<boolean>(false);

  useEffect(() => {
    if (!activeImage) {
      setBase64String('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBase64String(reader.result as string);
    };
    reader.readAsDataURL(activeImage.blob);
  }, [activeImage?.id]);

  const copyString = (str: string, type: string) => {
    navigator.clipboard.writeText(str);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDecodePasted = async (inputStr = pasteInput) => {
    if (!inputStr.trim()) return;
    setDecodeError(null);
    setIsDecoding(true);

    try {
      const ok = await addBase64Image(inputStr.trim());
      if (ok) {
        setPasteInput('');
      } else {
        setDecodeError('Failed to decode Base64 data into an image.');
      }
    } catch (err: any) {
      setDecodeError(err.message || 'Invalid Base64 or Data URI string.');
    } finally {
      setIsDecoding(false);
    }
  };

  const loadSampleBase64 = () => {
    // 64x64 Red-to-Cyan gradient PNG sample
    const sample = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAVklEQVR4nO3PMRHAMAzAsPLh9fQf5UBAeW2d2bm759y181r/D+DHvQDegHcDegPeDegNeDegN+DdgN6AdwN6A94N6A14N6A34N2A3oB3A3oD3g3oDXi3b62lAvz4eC8LAAAAAElFTkSuQmCC';
    setPasteInput(sample);
    handleDecodePasted(sample);
  };

  // If no active image in workspace, render the standalone decoder UI
  if (!activeImage) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Binary className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Base64 to Image Decoder</h4>
              <p className="text-[11px] text-neutral-500">Paste raw base64 or Data URI</p>
            </div>
          </div>

          <textarea
            rows={5}
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            placeholder="Paste data:image/png;base64,... or raw base64 string here..."
            className="w-full p-2.5 rounded-xl border border-neutral-300 text-[11px] font-mono text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
          />

          {decodeError && (
            <p className="text-[11px] text-red-600 font-medium">{decodeError}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleDecodePasted()}
              disabled={!pasteInput.trim() || isDecoding}
              className="flex-1 py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>{isDecoding ? 'Decoding...' : 'Decode & Load'}</span>
            </button>
            <button
              onClick={loadSampleBase64}
              className="px-3 py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-medium transition cursor-pointer flex items-center gap-1"
              title="Load sample Base64 image"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Sample</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const base64Bytes = base64String.length;
  const overheadPercent = activeImage.size > 0 
    ? Math.round(((base64Bytes - activeImage.size) / activeImage.size) * 100) 
    : 33;

  return (
    <div className="space-y-4">
      {/* Encoded Telemetry Card */}
      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">Binary Size:</span>
          <span className="font-mono text-neutral-800 font-medium">{formatBytes(activeImage.size)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">Base64 Length:</span>
          <span className="font-mono text-neutral-900 font-bold">{formatBytes(base64Bytes)}</span>
        </div>
        <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
          <span>Encoding Overhead:</span>
          <span className="font-mono text-amber-600 font-semibold">+{overheadPercent}% ASCII</span>
        </div>
      </div>

      {/* Copy Actions */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-neutral-700">Export Formats</label>
        
        <button
          onClick={() => copyString(base64String, 'raw')}
          className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 flex items-center justify-between transition cursor-pointer"
        >
          <span>Raw Data URI (`data:image/...`)</span>
          {copiedType === 'raw' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
        </button>

        <button
          onClick={() => copyString(`<img src="${base64String}" alt="${activeImage.name}" />`, 'html')}
          className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 flex items-center justify-between transition cursor-pointer"
        >
          <span>HTML &lt;img&gt; Tag Snippet</span>
          {copiedType === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
        </button>

        <button
          onClick={() => copyString(`background-image: url("${base64String}");`, 'css')}
          className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-800 flex items-center justify-between transition cursor-pointer"
        >
          <span>CSS background-image Declaration</span>
          {copiedType === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
        </button>
      </div>

      {/* Base64 to Image Decoder */}
      <div className="pt-3 border-t border-neutral-100 space-y-2">
        <label className="block text-xs font-semibold text-neutral-700">Decode Another Base64 String</label>
        <textarea
          rows={3}
          value={pasteInput}
          onChange={(e) => setPasteInput(e.target.value)}
          placeholder="Paste data:image/... or raw base64 string here..."
          className="w-full p-2.5 rounded-xl border border-neutral-300 text-[11px] font-mono text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
        />
        {decodeError && (
          <p className="text-[11px] text-red-600 font-medium">{decodeError}</p>
        )}
        <button
          onClick={() => handleDecodePasted()}
          disabled={!pasteInput.trim() || isDecoding}
          className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>{isDecoding ? 'Decoding...' : 'Decode & Add to Workspace'}</span>
        </button>
      </div>
    </div>
  );
};
