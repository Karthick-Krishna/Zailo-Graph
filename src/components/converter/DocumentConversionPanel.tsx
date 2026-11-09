import React, { useState, useRef, useMemo } from 'react';
import { useSession } from '../../context/SessionContext';
import { 
  CONVERSION_CATEGORIES, 
  CONVERSIONS, 
  ConversionCategoryId, 
  ConversionDefinition, 
  getConversionById, 
  findConversionForFile,
  validateFileForConversion,
  executeDocumentConversion 
} from '../../services/conversion';
import { 
  ConversionProgressState, 
  ConversionResult, 
  ConvertedOutputItem 
} from '../../types/conversion';
import { formatBytes } from '../../utils/formatters';
import { 
  FileText, 
  Presentation, 
  Table, 
  Image as ImageIcon, 
  Images, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  X, 
  Search,
  Sparkles,
  Layers,
  FileCode,
  Shield,
  Zap,
  CheckCircle2,
  ChevronRight,
  FileUp,
  SlidersHorizontal
} from 'lucide-react';

const CATEGORY_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  Presentation,
  Table,
  Image: ImageIcon,
  Images,
};

const getFormatBadgeStyle = (format: string) => {
  const f = format.toUpperCase();
  if (f.includes('PDF')) return 'bg-rose-50 text-rose-700 border-rose-200/90';
  if (f.includes('DOC') || f.includes('WORD')) return 'bg-blue-50 text-blue-700 border-blue-200/90';
  if (f.includes('XLS') || f.includes('CSV') || f.includes('ODS')) return 'bg-emerald-50 text-emerald-700 border-emerald-200/90';
  if (f.includes('PPT')) return 'bg-amber-50 text-amber-700 border-amber-200/90';
  if (f.includes('TXT') || f.includes('RTF')) return 'bg-slate-100 text-slate-700 border-slate-200';
  return 'bg-purple-50 text-purple-700 border-purple-200/90';
};

interface DocumentConversionPanelProps {
  initialConversionId?: string;
  isCompact?: boolean;
  onClose?: () => void;
}

export const DocumentConversionPanel: React.FC<DocumentConversionPanelProps> = ({
  initialConversionId,
  isCompact = false,
  onClose,
}) => {
  const { setActiveUtilityId } = useSession();
  const [selectedConversionId, setSelectedConversionId] = useState<string | null>(initialConversionId || null);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<ConversionCategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active conversion job state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [progressState, setProgressState] = useState<ConversionProgressState>({
    status: 'idle',
    phase: '',
    percent: 0,
  });
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // Auto-detected file (when user drops a file in overview mode)
  const [detectedFile, setDetectedFile] = useState<File | null>(null);
  const [compatibleConversions, setCompatibleConversions] = useState<ConversionDefinition[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const universalDropInputRef = useRef<HTMLInputElement>(null);

  const selectedConversion = useMemo(() => {
    return selectedConversionId ? getConversionById(selectedConversionId) : null;
  }, [selectedConversionId]);

  const handleSelectConversion = (conversionId: string, preloadedFile?: File) => {
    setSelectedConversionId(conversionId);
    setValidationError(null);
    setProgressState({ status: 'idle', phase: '', percent: 0 });
    setConversionResult(null);
    if (preloadedFile) {
      setSelectedFiles([preloadedFile]);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleBackToOverview = () => {
    setSelectedConversionId(null);
    setSelectedFiles([]);
    setDetectedFile(null);
    setCompatibleConversions([]);
    setValidationError(null);
    setProgressState({ status: 'idle', phase: '', percent: 0 });
    setConversionResult(null);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processIncomingFiles = (filesList: FileList | File[]) => {
    if (!selectedConversion) return;
    setValidationError(null);
    const files = Array.from(filesList);
    if (files.length === 0) return;

    if (!selectedConversion.supportsMultipleInput && files.length > 1) {
      const validation = validateFileForConversion(files[0], selectedConversion);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid file format.');
        return;
      }
      setSelectedFiles([files[0]]);
    } else {
      for (const f of files) {
        const validation = validateFileForConversion(f, selectedConversion);
        if (!validation.isValid) {
          setValidationError(validation.error || `Invalid file format: ${f.name}`);
          return;
        }
      }
      setSelectedFiles(files);
    }

    setConversionResult(null);
  };

  // Universal drop handler in overview mode
  const handleUniversalFileDrop = (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (files.length === 0) return;
    const file = files[0];
    const compatible = findConversionForFile(file.name);

    if (compatible.length > 0) {
      setDetectedFile(file);
      setCompatibleConversions(compatible);
      setValidationError(null);
    } else {
      setValidationError(`No supported conversion found for "${file.name}". Supported formats include .docx, .pdf, .pptx, .xlsx, .csv, and images.`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (selectedConversion) {
        processIncomingFiles(e.dataTransfer.files);
      } else {
        handleUniversalFileDrop(e.dataTransfer.files);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleUniversalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUniversalFileDrop(e.target.files);
      e.target.value = '';
    }
  };

  const handleStartConversion = async () => {
    if (!selectedConversion || selectedFiles.length === 0) return;

    setValidationError(null);
    setProgressState({
      status: 'validating',
      phase: 'Validating document signature...',
      percent: 10,
    });

    try {
      const result = await executeDocumentConversion(
        selectedConversion.id,
        selectedFiles,
        (progress) => setProgressState(progress)
      );
      setConversionResult(result);
    } catch (err: any) {
      setValidationError(err.message || 'Conversion failed. Please try another file.');
    }
  };

  const handleDownloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  // Filtered conversions by category and search query
  const filteredConversions = useMemo(() => {
    let list = CONVERSIONS;
    if (selectedCategoryTab !== 'all') {
      list = list.filter(c => c.category === selectedCategoryTab);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.sourceFormat.toLowerCase().includes(q) ||
      c.targetFormat.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.acceptsExtensions.some(ext => ext.toLowerCase().includes(q))
    );
  }, [selectedCategoryTab, searchQuery]);

  return (
    <div className="w-full bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-3xl p-4 sm:p-7 md:p-8 shadow-2xl shadow-blue-950/5 select-none transition-all">
      {/* Top Header Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-neutral-100">
        <button
          onClick={() => {
            if (onClose) onClose();
            else setActiveUtilityId('compression');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-700 hover:text-neutral-950 text-xs font-semibold transition cursor-pointer active:scale-95 shadow-2xs"
          title="Return to Image Studio"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-neutral-600" />
          <span>Back to Studio</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 font-semibold">
            <Shield className="w-3 h-3 text-emerald-600" />
            <span>100% Client-Side Privacy</span>
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wide">
            33 in 1 Suite
          </span>
        </div>
      </div>

      {/* Mode 1: Studio Overview & Directory */}
      {!selectedConversion ? (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight font-display flex items-center gap-2">
                  <span>Document &amp; File Converter Studio</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5 max-w-xl leading-relaxed">
                  Convert Word, PDF, Excel, PowerPoint, Text, RTF, and Images locally in your browser. Zero cloud uploads, zero wait times.
                </p>
              </div>
            </div>
          </div>

          {/* Universal Dropzone for Instant Conversion Detection */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => universalDropInputRef.current?.click()}
            className={`relative w-full rounded-2xl border-2 border-dashed p-5 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group ${
              isDragOver
                ? 'border-blue-600 bg-blue-50/70 scale-[1.01] shadow-lg shadow-blue-500/10'
                : 'border-blue-200/90 hover:border-blue-500 bg-gradient-to-br from-blue-50/40 via-sky-50/20 to-white hover:bg-blue-50/30'
            }`}
          >
            <input
              ref={universalDropInputRef}
              type="file"
              onChange={handleUniversalInputChange}
              className="hidden"
            />
            <div className="w-11 h-11 rounded-2xl bg-white border border-blue-200 shadow-xs flex items-center justify-center mb-2.5 text-blue-600 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">
              Drop any document here for instant conversion
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mb-2">
              Drag a file or click to browse. Supports DOCX, DOC, PDF, PPTX, XLSX, XLS, CSV, RTF, TXT, ODT, and images.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-mono text-neutral-500">
              <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200/80 font-medium">Auto Format Detection</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200/80 font-medium">Up to 100 MB</span>
            </div>
          </div>

          {/* Auto-Detected File Card (If user dropped a file directly) */}
          {detectedFile && compatibleConversions.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-blue-500/80 bg-blue-50/50 shadow-md space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {detectedFile.name.split('.').pop()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate">
                      {detectedFile.name}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-500">
                      {formatBytes(detectedFile.size)} • {compatibleConversions.length} available conversions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setDetectedFile(null); setCompatibleConversions([]); }}
                  className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-blue-900 mb-2">
                  Select your target format:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {compatibleConversions.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversion(conv.id, detectedFile)}
                      className="p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white transition group text-left cursor-pointer shadow-2xs flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-bold block truncate group-hover:text-white text-neutral-900">
                          {conv.name}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 group-hover:text-blue-100">
                          &rarr; {conv.targetFormat}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 group-hover:bg-white group-hover:text-blue-700 shrink-0">
                        Convert
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold block">Format Notice</span>
                <span className="text-red-700">{validationError}</span>
              </div>
              <button
                onClick={() => setValidationError(null)}
                className="text-red-400 hover:text-red-700 p-1 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Category Tabs & Search Bar */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  onClick={() => setSelectedCategoryTab('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 min-h-[36px] ${
                    selectedCategoryTab === 'all'
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/80 border border-neutral-200/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>All (33)</span>
                </button>

                {CONVERSION_CATEGORIES.map(cat => {
                  const isSelected = selectedCategoryTab === cat.id;
                  const catConversions = CONVERSIONS.filter(c => c.category === cat.id);
                  const Icon = CATEGORY_ICON_MAP[cat.icon] || FileText;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryTab(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 min-h-[36px] ${
                        isSelected
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/80 border border-neutral-200/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.title}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-neutral-800 text-cyan-300' : 'bg-neutral-200/80 text-neutral-500'
                      }`}>
                        {catConversions.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Search Input */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter 33 tools... (Word, Excel, PDF)"
                  className="w-full pl-8.5 pr-7 py-2 rounded-xl bg-neutral-100/90 border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Conversions Responsive Grid */}
            <div className="pt-2">
              {filteredConversions.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl border border-neutral-200/70 bg-neutral-50/50">
                  <FileCode className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-neutral-700">No conversions match "{searchQuery}"</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Try searching for "PDF", "Word", "Excel", or "PNG"</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategoryTab('all'); }}
                    className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredConversions.map(conv => {
                    const sourceBadgeColor = getFormatBadgeStyle(conv.sourceFormat);
                    const targetBadgeColor = getFormatBadgeStyle(conv.targetFormat);

                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversion(conv.id)}
                        className="p-3.5 sm:p-4 rounded-2xl border border-neutral-200/90 hover:border-blue-400 bg-white hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-white transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-md hover:shadow-blue-500/5 group flex flex-col justify-between"
                      >
                        <div>
                          {/* Format Flow Badges */}
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${sourceBadgeColor}`}>
                              {conv.sourceFormat}
                            </span>
                            <ArrowRight className="w-3 h-3 text-neutral-400" />
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${targetBadgeColor}`}>
                              {conv.targetFormat}
                            </span>
                          </div>

                          {/* Conversion Name */}
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-blue-900 transition-colors">
                            {conv.name}
                          </h4>

                          {/* Description */}
                          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                            {conv.description}
                          </p>
                        </div>

                        {/* Bottom Row: Accepts info and Action Pill */}
                        <div className="mt-3.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[140px]">
                            {conv.acceptsExtensions.join(', ')}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all">
                            <span>Open</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Dedicated Conversion Studio for Selected Operation */
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Breadcrumb Navigation Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToOverview}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition cursor-pointer px-2.5 py-1.5 rounded-xl hover:bg-neutral-100 active:scale-95 shadow-2xs"
                title="Return to all 33 conversions"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-neutral-500" />
                <span>All Conversions</span>
              </button>
              <span className="text-neutral-300">/</span>
              <span className="text-xs font-bold text-neutral-900 font-display">
                {selectedConversion.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getFormatBadgeStyle(selectedConversion.sourceFormat)}`}>
                {selectedConversion.sourceFormat} &rarr; {selectedConversion.targetFormat}
              </span>
            </div>
          </div>

          {/* Operation Title & High-Fidelity Guarantee */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight font-display flex items-center gap-2">
                <span>{selectedConversion.name}</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5 max-w-xl leading-relaxed">
                {selectedConversion.description}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Native Browser Engine</span>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple={selectedConversion.supportsMultipleInput}
            accept={selectedConversion.acceptsExtensions.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Dropzone Area (When no file selected) */}
          {selectedFiles.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group ${
                isDragOver
                  ? 'border-blue-600 bg-blue-50/70 scale-[1.01] shadow-xl shadow-blue-500/10'
                  : 'border-blue-200/90 hover:border-blue-500 bg-gradient-to-br from-blue-50/30 via-sky-50/20 to-white hover:bg-blue-50/40 shadow-xs'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-blue-200 shadow-xs flex items-center justify-center mb-3 text-blue-600 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-neutral-900 mb-1">
                Drop your {selectedConversion.sourceFormat} file here
              </h4>
              <p className="text-xs text-neutral-500 mb-4 max-w-md">
                or click to browse from device. All conversions run locally in browser memory.
              </p>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer transition min-h-[42px]"
              >
                <FileUp className="w-4 h-4" />
                <span>Browse {selectedConversion.sourceFormat} File</span>
              </button>

              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 text-[10px] font-mono text-neutral-400">
                <span>Formats: {selectedConversion.acceptsExtensions.join(', ')}</span>
                <span>•</span>
                <span>Max 100 MB</span>
                {selectedConversion.supportsMultipleInput && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 font-semibold">Multiple Files Supported</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Selected Files Showcase Card */
            <div className="p-4 sm:p-5 rounded-3xl border border-neutral-200/90 bg-neutral-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedFiles.length === 1 ? 'Selected Document' : `${selectedFiles.length} Selected Documents`}</span>
                </span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition cursor-pointer flex items-center gap-1 p-1 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Change File</span>
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedFiles.map((file, fIdx) => (
                  <div 
                    key={fIdx}
                    className="p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {file.name.split('.').pop() || 'DOC'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-200/60 shrink-0">
                      Ready
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-bold block">Validation Error</span>
                <span className="text-red-700 leading-relaxed">{validationError}</span>
              </div>
            </div>
          )}

          {/* Live Progress Bar during active conversion */}
          {progressState.status !== 'idle' && progressState.status !== 'done' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-200/90 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-950 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>{progressState.phase || 'Processing conversion...'}</span>
                </span>
                <span className="font-mono font-bold text-blue-700 text-xs">
                  {progressState.percent}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-blue-200/60 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressState.percent}%` }}
                />
              </div>
              <p className="text-[10px] text-blue-700/80 font-mono">
                Converting via native browser WebAssembly. No data transmitted.
              </p>
            </div>
          )}

          {/* Success / Result Showcase Box */}
          {conversionResult && (
            <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50/90 border border-emerald-200/90 space-y-4 animate-in zoom-in-95 duration-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-emerald-950">
                    Document Converted Successfully!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5 truncate">
                    {conversionResult.summary || `${conversionResult.primaryFilename} is ready for download.`}
                  </p>
                </div>
              </div>

              {/* Output File Info Card */}
              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                    {conversionResult.primaryFilename}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
                    {formatBytes(conversionResult.primarySize)}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500">
                  Target: {selectedConversion.outputExtension.toUpperCase()} • 100% Private Client Generation
                </p>
              </div>

              {/* Primary Download Button */}
              <button
                onClick={() => handleDownloadFile(conversionResult.primaryBlob, conversionResult.primaryFilename)}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] min-h-[48px]"
              >
                <Download className="w-5 h-5" />
                <span>Download {conversionResult.primaryFilename}</span>
              </button>

              {/* Multi-item or ZIP Archive Download */}
              {conversionResult.items && conversionResult.items.length > 1 && (
                <div className="pt-3 border-t border-emerald-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
                    <span>Individual Extracted Items ({conversionResult.items.length}):</span>
                    {conversionResult.zipBlob && (
                      <button
                        onClick={() => handleDownloadFile(conversionResult.zipBlob!, conversionResult.zipFilename || 'all_items.zip')}
                        className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download All (ZIP)</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {conversionResult.items.map(item => (
                      <div 
                        key={item.id}
                        className="p-2.5 rounded-xl bg-white/90 border border-emerald-100 flex items-center justify-between text-xs"
                      >
                        <span className="truncate max-w-[200px] text-neutral-800 font-medium">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-neutral-400">
                            {formatBytes(item.size)}
                          </span>
                          <button
                            onClick={() => handleDownloadFile(item.blob, item.name)}
                            className="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                            title={`Download ${item.name}`}
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post-Conversion Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setSelectedFiles([]);
                    setConversionResult(null);
                    setProgressState({ status: 'idle', phase: '', percent: 0 });
                  }}
                  className="flex-1 w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 font-semibold text-xs transition cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Convert Another File</span>
                </button>
                <button
                  onClick={handleBackToOverview}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-semibold transition cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-neutral-500" />
                  <span>All Conversions</span>
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Button (Before conversion execution) */}
          {!conversionResult && (
            <button
              onClick={handleStartConversion}
              disabled={selectedFiles.length === 0 || progressState.status === 'processing' || progressState.status === 'generating'}
              className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] min-h-[48px]"
            >
              <RefreshCw className={`w-4 h-4 ${progressState.status === 'processing' || progressState.status === 'generating' ? 'animate-spin' : ''}`} />
              <span>
                {progressState.status === 'processing' || progressState.status === 'generating'
                  ? 'Converting Document...'
                  : `Convert to ${selectedConversion.targetFormat}`}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
