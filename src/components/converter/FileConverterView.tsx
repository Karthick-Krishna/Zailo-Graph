import React, { useState, useRef, useCallback } from 'react';
import { 
  CONVERSION_TYPES, 
  ConversionType, 
  ConverterQueueItem, 
  ConvertedPageResult 
} from '../../types/converter';
import { 
  detectFormat, 
  suggestConversion, 
  executeConversion, 
  convertMultipleImagesToPdf 
} from '../../services/fileConverter';
import { formatBytes } from '../../utils/formatters';
import { 
  UploadCloud, 
  FileText, 
  FileCode2, 
  Image, 
  Images, 
  ScanText, 
  Repeat, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Play, 
  X, 
  ChevronDown, 
  Archive, 
  ShieldCheck, 
  Layers, 
  FolderArchive,
  ArrowRight,
  RefreshCw,
  Eye,
  Sliders
} from 'lucide-react';
import { Footer } from '../layout/Footer';

const ICON_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  FileCode2,
  Images,
  Image,
  Repeat,
  ScanText,
};

export const FileConverterView: React.FC = () => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ConversionType | 'all'>('all');
  const [queue, setQueue] = useState<ConverterQueueItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConvertingBatch, setIsConvertingBatch] = useState(false);
  const [activePreviewPage, setActivePreviewPage] = useState<ConvertedPageResult | null>(null);
  const [combineImagesIntoSinglePdf, setCombineImagesIntoSinglePdf] = useState(true);
  const [pdfPageSize, setPdfPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [pdfOrientation, setPdfOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [ocrLang, setOcrLang] = useState<string>('eng');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter conversions or presets
  const activePreset = CONVERSION_TYPES.find(c => c.id === selectedTypeFilter);

  // Handle file addition to queue
  const addFilesToQueue = useCallback((newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const items: ConverterQueueItem[] = newFiles.map(file => {
      const detected = detectFormat(file);
      let targetConv: ConversionType = 'word-to-pdf';
      let targetFmt = 'pdf';

      if (selectedTypeFilter !== 'all') {
        const preset = CONVERSION_TYPES.find(t => t.id === selectedTypeFilter);
        if (preset) {
          targetConv = preset.id;
          targetFmt = preset.defaultTarget;
        }
      } else {
        const suggestion = suggestConversion(file);
        targetConv = suggestion.type;
        targetFmt = suggestion.targetFormat;
      }

      return {
        id: 'conv_' + Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        sourceFormat: detected,
        targetFormat: targetFmt,
        conversionType: targetConv,
        status: 'idle',
        progress: 0,
        options: {
          pageSize: pdfPageSize,
          orientation: pdfOrientation,
          combineImages: combineImagesIntoSinglePdf,
          ocrLang,
        },
      };
    });

    setQueue(prev => [...prev, ...items]);
  }, [selectedTypeFilter, pdfPageSize, pdfOrientation, combineImagesIntoSinglePdf, ocrLang]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // Remove single item from queue
  const removeItem = (id: string) => {
    setQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.resultUrl) {
        URL.revokeObjectURL(item.resultUrl);
      }
      if (item?.pages) {
        item.pages.forEach(p => URL.revokeObjectURL(p.url));
      }
      return prev.filter(i => i.id !== id);
    });
  };

  // Clear entire queue
  const clearQueue = () => {
    queue.forEach(item => {
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
      if (item.pages) item.pages.forEach(p => URL.revokeObjectURL(p.url));
    });
    setQueue([]);
  };

  // Change target format for a specific queued item
  const updateItemTarget = (id: string, newTarget: string) => {
    setQueue(prev => prev.map(item => {
      if (item.id !== id) return item;

      let newType = item.conversionType;
      if (item.sourceFormat === 'pdf') {
        if (newTarget === 'docx') newType = 'pdf-to-word';
        else if (newTarget === 'png' || newTarget === 'jpg') newType = 'pdf-to-image';
      } else if (item.sourceFormat === 'docx' || item.sourceFormat === 'doc') {
        if (newTarget === 'pdf') newType = 'word-to-pdf';
        else if (newTarget === 'docx') newType = 'word-to-word';
      } else {
        // Image
        if (newTarget === 'pdf') newType = 'image-to-pdf';
        else if (newTarget === 'docx') newType = 'image-to-word';
      }

      return {
        ...item,
        targetFormat: newTarget,
        conversionType: newType,
      };
    }));
  };

  // Convert a single queued item
  const convertSingleItem = async (id: string) => {
    const item = queue.find(i => i.id === id);
    if (!item || item.status === 'converting') return;

    setQueue(prev => prev.map(i => i.id === id ? { 
      ...i, 
      status: 'converting', 
      progress: 5, 
      statusMessage: 'Preparing conversion engine...',
      error: undefined 
    } : i));

    try {
      const result = await executeConversion(
        { 
          file: item.file, 
          conversionType: item.conversionType, 
          options: item.options 
        },
        (progress, statusMessage) => {
          setQueue(prev => prev.map(i => i.id === id ? { ...i, progress, statusMessage } : i));
        }
      );

      const resultUrl = URL.createObjectURL(result.blob);

      setQueue(prev => prev.map(i => i.id === id ? {
        ...i,
        status: 'completed',
        progress: 100,
        statusMessage: 'Conversion completed successfully!',
        resultBlob: result.blob,
        resultUrl,
        resultName: result.filename,
        resultSize: result.blob.size,
        pages: result.pages,
        convertedAt: Date.now(),
      } : i));
    } catch (err: any) {
      console.error('File conversion failed:', err);
      setQueue(prev => prev.map(i => i.id === id ? {
        ...i,
        status: 'error',
        progress: 0,
        statusMessage: 'Conversion failed',
        error: err.message || 'Error occurred during processing.',
      } : i));
    }
  };

  // Batch Convert All Items in Queue
  const convertAll = async () => {
    if (isConvertingBatch || queue.length === 0) return;
    setIsConvertingBatch(true);

    // If combining multiple images into single PDF option is selected
    const imageToPdfItems = queue.filter(i => i.conversionType === 'image-to-pdf' && i.status !== 'completed');
    if (combineImagesIntoSinglePdf && imageToPdfItems.length > 1) {
      const firstId = imageToPdfItems[0].id;
      setQueue(prev => prev.map(i => imageToPdfItems.some(it => it.id === i.id) ? {
        ...i,
        status: 'converting',
        progress: 10,
        statusMessage: `Compiling ${imageToPdfItems.length} images into unified PDF...`
      } : i));

      try {
        const imageFiles = imageToPdfItems.map(i => i.file);
        const result = await convertMultipleImagesToPdf(imageFiles, {
          pageSize: pdfPageSize,
          orientation: pdfOrientation,
        }, (progress, msg) => {
          setQueue(prev => prev.map(i => imageToPdfItems.some(it => it.id === i.id) ? {
            ...i,
            progress,
            statusMessage: msg
          } : i));
        });

        const resultUrl = URL.createObjectURL(result.blob);

        setQueue(prev => prev.map(i => {
          if (i.id === firstId) {
            return {
              ...i,
              name: `Combined PDF (${imageFiles.length} images)`,
              status: 'completed',
              progress: 100,
              statusMessage: 'Merged into single PDF document',
              resultBlob: result.blob,
              resultUrl,
              resultName: result.filename,
              resultSize: result.blob.size,
              convertedAt: Date.now(),
            };
          } else if (imageToPdfItems.some(it => it.id === i.id)) {
            return {
              ...i,
              status: 'completed',
              progress: 100,
              statusMessage: 'Included in unified PDF batch',
              resultUrl,
              resultName: result.filename,
              resultSize: result.blob.size,
              convertedAt: Date.now(),
            };
          }
          return i;
        }));
      } catch (err: any) {
        setQueue(prev => prev.map(i => imageToPdfItems.some(it => it.id === i.id) ? {
          ...i,
          status: 'error',
          error: err.message || 'Batch PDF combination failed.'
        } : i));
      }
    }

    // Convert all remaining idle/error items
    const pendingItems = queue.filter(i => i.status === 'idle' || i.status === 'error');
    for (const item of pendingItems) {
      // If already processed as part of combined image batch, skip
      const current = queue.find(q => q.id === item.id);
      if (current?.status === 'completed') continue;
      await convertSingleItem(item.id);
    }

    setIsConvertingBatch(false);
  };

  // Download converted file
  const downloadResult = (item: ConverterQueueItem) => {
    if (!item.resultBlob && !item.resultUrl) return;
    const url = item.resultUrl || URL.createObjectURL(item.resultBlob!);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.resultName || `converted_${item.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download all completed results bundled into a ZIP archive
  const downloadAllZip = async () => {
    const completedItems = queue.filter(i => i.status === 'completed' && i.resultBlob);
    if (completedItems.length === 0) return;

    if (completedItems.length === 1) {
      downloadResult(completedItems[0]);
      return;
    }

    const zip = new (await import('jszip')).default();
    const usedNames = new Set<string>();

    for (let idx = 0; idx < completedItems.length; idx++) {
      const it = completedItems[idx];
      let fname = it.resultName || `document_${idx + 1}.${it.targetFormat}`;
      // ensure unique filename in zip
      if (usedNames.has(fname)) {
        fname = `${idx + 1}_${fname}`;
      }
      usedNames.add(fname);
      zip.file(fname, it.resultBlob!);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zailograph_converted_bundle_${completedItems.length}_files.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  // Format Icon helper
  const renderFormatBadgeIcon = (format: string) => {
    const f = format.toLowerCase();
    if (f === 'pdf') {
      return (
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 text-red-600 border border-red-200/80 flex items-center justify-center shrink-0 shadow-2xs">
          <FileText className="w-5 h-5" />
        </div>
      );
    }
    if (f === 'docx' || f === 'doc') {
      return (
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs">
          <FileCode2 className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
        <Image className="w-5 h-5" />
      </div>
    );
  };

  // Possible target formats based on source
  const getAvailableTargets = (sourceFormat: string): string[] => {
    const f = sourceFormat.toLowerCase();
    if (f === 'docx' || f === 'doc') return ['pdf', 'docx'];
    if (f === 'pdf') return ['docx', 'png', 'jpg'];
    return ['pdf', 'docx'];
  };

  const completedCount = queue.filter(i => i.status === 'completed').length;
  const pendingCount = queue.filter(i => i.status === 'idle' || i.status === 'error').length;

  return (
    <div className="w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col items-center">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".docx,.doc,.pdf,.jpg,.jpeg,.png,.webp,.avif,.svg,.bmp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="w-full max-w-5xl flex flex-col items-center space-y-6 sm:space-y-8 relative">
        {/* Hero Header */}
        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl relative z-10 flex flex-col items-center px-1">
          {/* Subtle Glow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-900 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Universal Document &amp; Image Engine</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">100% PRIVATE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-[1.1] font-display">
            Convert Any File. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 bg-clip-text text-transparent">
              Zero Cloud Latency.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Convert Word to PDF, PDF to editable Word, Images to PDF, PDF to Images, and Scanned Images to Word with in-browser OCR. 
            All files stay strictly on your device.
          </p>

          {/* Privacy Trust Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] font-medium text-neutral-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Server Uploads</span>
            </span>
            <span className="text-neutral-300">•</span>
            <span>Up to 100 MB per file</span>
            <span className="text-neutral-300">•</span>
            <span>Batch Multi-File Support</span>
          </div>
        </div>

        {/* Conversion Type Quick Selector Pills / Tabs */}
        <div className="w-full flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
          <button
            onClick={() => setSelectedTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 border ${
              selectedTypeFilter === 'all'
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700 shadow-2xs'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>All Formats</span>
          </button>

          {CONVERSION_TYPES.map(conv => {
            const isSelected = selectedTypeFilter === conv.id;
            const Icon = ICON_COMPONENTS[conv.iconName] || FileText;
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedTypeFilter(conv.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  isSelected
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                    : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700 shadow-2xs'
                }`}
                title={conv.description}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-300' : 'text-blue-600'}`} />
                <span>{conv.shortTitle}</span>
                {conv.badge && (
                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {conv.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Conversion Hint Banner */}
        {activePreset && (
          <div className="w-full max-w-2xl px-4 py-2.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-3 text-xs text-blue-950 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span><strong>{activePreset.title} Mode:</strong> {activePreset.description}</span>
            </div>
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className="text-blue-600 hover:text-blue-900 font-bold text-xs cursor-pointer shrink-0"
            >
              Reset to Auto
            </button>
          </div>
        )}

        {/* Interactive Drag & Drop Box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-2xl sm:rounded-3xl border-2 border-dashed p-6 sm:p-10 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group bg-white/90 backdrop-blur-xl shadow-lg ${
            isDragOver
              ? 'border-blue-600 bg-blue-50/60 scale-[1.01] shadow-2xl shadow-blue-500/15'
              : 'border-blue-200/80 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10'
          }`}
        >
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute inset-0 bg-radial from-blue-50/40 via-transparent to-transparent opacity-70 pointer-events-none rounded-2xl sm:rounded-3xl"></div>

          <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 text-neutral-800 flex items-center justify-center mb-3 sm:mb-4 group-hover:from-blue-600 group-hover:to-sky-500 group-hover:text-white transition duration-300 shadow-xs border border-neutral-200/60 group-hover:border-transparent">
            <UploadCloud className="w-6 sm:w-8 h-6 sm:h-8" />
          </div>

          <h2 className="text-base sm:text-xl font-bold text-neutral-900 mb-1.5 leading-snug">
            Drop Word, PDF, or Image files here, or <span className="underline decoration-blue-300 underline-offset-4 group-hover:decoration-blue-600 transition">browse</span>
          </h2>
          <p className="text-xs text-neutral-500 max-w-md mb-4 sm:mb-5 leading-relaxed">
            Drag single files or an entire batch. Supports DOC, DOCX, PDF, JPG, PNG, WEBP, AVIF, and SVG.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition min-h-[42px]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Choose Files to Convert</span>
            </button>
          </div>

          {/* Format Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg mt-5">
            {['DOCX', 'DOC', 'PDF', 'JPG', 'PNG', 'WEBP', 'AVIF', 'SVG'].map(fmt => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border bg-neutral-100 text-neutral-600 border-neutral-200/60"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {/* Global Conversion Options Bar (When Image to PDF or PDF to Image queued) */}
        {queue.length > 0 && (
          <div className="w-full bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Conversion Preferences</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Combine Images Option */}
              <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={combineImagesIntoSinglePdf}
                  onChange={(e) => setCombineImagesIntoSinglePdf(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>Merge multiple images into 1 PDF</span>
              </label>

              {/* Page Size */}
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 text-[11px]">Page:</span>
                <select
                  value={pdfPageSize}
                  onChange={(e) => setPdfPageSize(e.target.value as any)}
                  className="px-2 py-1 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 text-xs font-semibold cursor-pointer"
                >
                  <option value="a4">A4 Standard</option>
                  <option value="letter">US Letter</option>
                  <option value="fit">Fit to Image</option>
                </select>
              </div>

              {/* Orientation */}
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 text-[11px]">Orientation:</span>
                <select
                  value={pdfOrientation}
                  onChange={(e) => setPdfOrientation(e.target.value as any)}
                  className="px-2 py-1 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 text-xs font-semibold cursor-pointer"
                >
                  <option value="auto">Auto (Match Image)</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Files / Conversion Queue Section */}
        {queue.length > 0 && (
          <div className="w-full space-y-3">
            {/* Queue Header with Global Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span>Conversion Queue</span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {queue.length} {queue.length === 1 ? 'file' : 'files'}
                  </span>
                  {completedCount > 0 && (
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {completedCount} ready
                    </span>
                  )}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add More</span>
                </button>

                <button
                  onClick={clearQueue}
                  className="px-2.5 py-1.5 rounded-xl border border-neutral-200 hover:border-red-300 hover:bg-red-50 text-neutral-600 hover:text-red-600 text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Remove all files from queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                {/* Primary Convert All Button */}
                {pendingCount > 0 && (
                  <button
                    onClick={convertAll}
                    disabled={isConvertingBatch}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isConvertingBatch ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Converting...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Convert All ({pendingCount})</span>
                      </>
                    )}
                  </button>
                )}

                {/* Batch Download ZIP Button */}
                {completedCount > 1 && (
                  <button
                    onClick={downloadAllZip}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                    title="Download all converted files as a ZIP archive"
                  >
                    <FolderArchive className="w-3.5 h-3.5" />
                    <span>Download All (ZIP)</span>
                  </button>
                )}
              </div>
            </div>

            {/* List of File Cards */}
            <div className="space-y-2.5">
              {queue.map((item) => {
                const availableTargets = getAvailableTargets(item.sourceFormat);
                const isItemConverting = item.status === 'converting';
                const isItemDone = item.status === 'completed';
                const isItemError = item.status === 'error';

                return (
                  <div
                    key={item.id}
                    className={`relative w-full rounded-2xl border p-3.5 sm:p-4 bg-white transition-all shadow-xs ${
                      isItemDone
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : isItemError
                        ? 'border-red-300 bg-red-50/20'
                        : isItemConverting
                        ? 'border-blue-400 ring-2 ring-blue-100'
                        : 'border-neutral-200/90 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Format Icon & File Details */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {renderFormatBadgeIcon(item.sourceFormat)}

                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate" title={item.name}>
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500 font-mono">
                            <span>{formatBytes(item.size)}</span>
                            <span>•</span>
                            <span className="uppercase font-semibold text-neutral-700 bg-neutral-100 px-1.5 py-0.2 rounded">
                              {item.sourceFormat}
                            </span>
                            <ArrowRight className="w-3 h-3 text-neutral-400" />
                            <span className="uppercase font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                              {item.targetFormat}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Center: Target Format Dropdown */}
                      {!isItemDone && (
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <span className="text-[11px] text-neutral-500 font-medium">To:</span>
                          <select
                            value={item.targetFormat}
                            onChange={(e) => updateItemTarget(item.id, e.target.value)}
                            disabled={isItemConverting}
                            className="px-2.5 py-1.5 rounded-xl border border-neutral-300 bg-white hover:border-neutral-400 text-xs font-bold text-neutral-800 transition cursor-pointer shadow-2xs uppercase"
                          >
                            {availableTargets.map(tgt => (
                              <option key={tgt} value={tgt}>
                                {tgt.toUpperCase()} {tgt === 'docx' && item.sourceFormat === 'jpg' ? '(OCR)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 justify-end">
                        {/* Idle / Convert Single */}
                        {item.status === 'idle' && (
                          <button
                            onClick={() => convertSingleItem(item.id)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm shadow-blue-600/25 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Convert</span>
                          </button>
                        )}

                        {/* In Progress Spinner */}
                        {isItemConverting && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="font-mono text-[11px]">{item.progress}%</span>
                          </div>
                        )}

                        {/* Completed: Download Button */}
                        {isItemDone && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => downloadResult(item)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                              title={`Download ${item.resultName || 'file'}`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                              {item.resultSize && (
                                <span className="font-mono text-[10px] opacity-90">({formatBytes(item.resultSize)})</span>
                              )}
                            </button>

                            {/* If PDF to Image has multiple pages, show ZIP download */}
                            {item.pages && item.pages.length > 1 && (
                              <button
                                onClick={() => downloadResult(item)}
                                className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs"
                                title="Download all pages in ZIP bundle"
                              >
                                <Archive className="w-3.5 h-3.5" />
                                <span>ZIP ({item.pages.length}p)</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Retry on Error */}
                        {isItemError && (
                          <button
                            onClick={() => convertSingleItem(item.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}

                        {/* Remove from queue */}
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={isItemConverting}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded-lg transition cursor-pointer disabled:opacity-30"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Status Text */}
                    {isItemConverting && (
                      <div className="mt-3 space-y-1.5">
                        <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-300 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-blue-700 font-medium animate-pulse flex items-center gap-1.5">
                          <span>{item.statusMessage || 'Processing...'}</span>
                        </p>
                      </div>
                    )}

                    {/* Success Message Banner */}
                    {isItemDone && (
                      <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800">
                        <span className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item.resultName} generated successfully!</span>
                        </span>
                        <span className="font-mono text-emerald-600 text-[10px]">100% In-Browser</span>
                      </div>
                    )}

                    {/* Error Message Banner */}
                    {isItemError && (
                      <div className="mt-2.5 pt-2 border-t border-red-100 flex items-center gap-1.5 text-[11px] text-red-700">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{item.error}</span>
                      </div>
                    )}

                    {/* Multi-Page PDF Images Preview Bar */}
                    {item.pages && item.pages.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-neutral-100">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                          Rendered Pages ({item.pages.length} Pages):
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
                          {item.pages.map(page => (
                            <div
                              key={page.pageNum}
                              className="group/page relative rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 shrink-0 shadow-2xs hover:border-blue-400 transition"
                            >
                              <img
                                src={page.url}
                                alt={page.name}
                                className="w-16 h-20 object-cover cursor-pointer"
                                onClick={() => setActivePreviewPage(page)}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/page:opacity-100 transition flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setActivePreviewPage(page)}
                                  className="p-1 rounded bg-white text-neutral-900 shadow-xs cursor-pointer"
                                  title="View page full-screen"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <a
                                  href={page.url}
                                  download={page.name}
                                  className="p-1 rounded bg-blue-600 text-white shadow-xs cursor-pointer"
                                  title="Download this page image"
                                >
                                  <Download className="w-3 h-3" />
                                </a>
                              </div>
                              <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold bg-black/60 text-white px-1 rounded">
                                p.{page.pageNum}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feature Highlights Section */}
        <div className="w-full pt-8 sm:pt-12 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              🔒
            </div>
            <h4 className="text-sm font-bold text-neutral-900">100% Private &amp; Offline-Capable</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Your confidential Word documents and PDFs never touch external servers. All conversions execute strictly inside client WebAssembly and OpenXML engines.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h4 className="text-sm font-bold text-neutral-900">Instant Vector &amp; DOCX Output</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Preserves text typography, headings, formatting, and high-definition raster images when creating genuine Microsoft Word (.docx) and Adobe PDF files.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              🔍
            </div>
            <h4 className="text-sm font-bold text-neutral-900">AI OCR Text Extraction</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Extract editable paragraphs, lines, and data from receipts and scanned photos directly into formatted Word documents without retyping a single word.
            </p>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Page Image Preview Modal */}
      {activePreviewPage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActivePreviewPage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-900 font-mono">
                {activePreviewPage.name} ({activePreviewPage.width}×{activePreviewPage.height}px)
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={activePreviewPage.url}
                  download={activePreviewPage.name}
                  className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Page</span>
                </a>
                <button
                  onClick={() => setActivePreviewPage(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-neutral-100/70 rounded-xl">
              <img
                src={activePreviewPage.url}
                alt={activePreviewPage.name}
                className="max-w-full max-h-[75vh] object-contain rounded shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
