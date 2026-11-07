import React, { useState, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';
import { formatBytes } from '../../utils/formatters';
import { Binary, Copy, Check, FileCode, ArrowDown } from 'lucide-react';

export const Base64Controls: React.FC = () => {
  const { activeImage, addImages } = useSession();
  const [base64String, setBase64String] = useState<string>('');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [pasteInput, setPasteInput] = useState<string>('');
  const [decodeError, setDecodeError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeImage) return;

    const reader = new FileReader();
    reader.onload = () => {
      setBase64String(reader.result as string);
    };
    reader.readAsDataURL(activeImage.blob);
  }, [activeImage?.id]);

  if (!activeImage) return null;

  const copyString = (str: string, type: string) => {
    navigator.clipboard.writeText(str);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDecodePasted = async () => {
    if (!pasteInput.trim()) return;
    setDecodeError(null);

    try {
      const trimmed = pasteInput.trim();
      let dataUrl = trimmed;
      if (!trimmed.startsWith('data:')) {
        // Assume PNG base64
        dataUrl = `data:image/png;base64,${trimmed}`;
      }

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `decoded_image_${Date.now()}.${blob.type.split('/')[1] || 'png'}`, {
        type: blob.type,
      });

      await addImages([file]);
      setPasteInput('');
    } catch (err: any) {
      setDecodeError('Invalid Base64 or Data URI string.');
    }
  };

  const base64Bytes = base64String.length;
  const overheadPercent = activeImage.size > 0 
    ? Math.round(((base64Bytes - activeImage.size) / activeImage.size) * 100) 
    : 33;

  return (
    <div className="space-y-5">
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

      {/* Base64 to Image Decoder (Utility 24) */}
      <div className="pt-3 border-t border-neutral-100 space-y-2">
        <label className="block text-xs font-semibold text-neutral-700">Base64 to Image Decoder</label>
        <textarea
          rows={3}
          value={pasteInput}
          onChange={(e) => setPasteInput(e.target.value)}
          placeholder="Paste data:image/... or raw base64 string here..."
          className="w-full p-2.5 rounded-xl border border-neutral-300 text-[11px] font-mono text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        />
        {decodeError && (
          <p className="text-[11px] text-red-600">{decodeError}</p>
        )}
        <button
          onClick={handleDecodePasted}
          disabled={!pasteInput.trim()}
          className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Decode to Image Workspace</span>
        </button>
      </div>
    </div>
  );
};

