import React, { useState, useRef, useMemo } from 'react';
import { useSession } from '../../context/SessionContext';
import { 
  CONVERSION_CATEGORIES, 
  CONVERSIONS, 
  ConversionCategoryId, 
  ConversionDefinition, 
  getConversionById, 
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
  Archive, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  X, 
  FileCheck, 
  ChevronDown, 
  ChevronRight, 
  Search,
  Sparkles,
  Layers,
  FileCode
} from 'lucide-react';

const CATEGORY_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  Presentation,
  Table,
  Image: ImageIcon,
  Images,
  Archive,
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
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    documents: true,
    presentations: false,
    spreadsheets: false,
    images_to_pdf: false,
    pdf_to_images: false,
    archives: false,
  });
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedConversion = useMemo(() => {
    return selectedConversionId ? getConversionById(selectedConversionId) : null;
  }, [selectedConversionId]);

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleSelectConversion = (conversionId: string) => {
    setSelectedConversionId(conversionId);
    setSelectedFiles([]);
    setValidationError(null);
    setProgressState({ status: 'idle', phase: '', percent: 0 });
    setConversionResult(null);
  };

  const handleBackToCategories = () => {
    setSelectedConversionId(null);
    setSelectedFiles([]);
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
      // Pick first file
      const validation = validateFileForConversion(files[0], selectedConversion);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid file format.');
        return;
      }
      setSelectedFiles([files[0]]);
    } else {
      // Validate all files
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(e.target.files);
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

  // Filtered conversions by search query
  const filteredConversions = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return CONVERSIONS.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.sourceFormat.toLowerCase().includes(q) ||
      c.targetFormat.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.acceptsExtensions.some(ext => ext.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="w-full flex flex-col space-y-4 select-none">
      {/* 1. Category & Conversion Selector Mode */}
      {!selectedConversion ? (
        <div className="space-y-3.5">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
            <button
              onClick={() => {
                if (onClose) onClose();
                else setActiveUtilityId('compression');
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-700 hover:text-neutral-950 text-xs font-semibold transition cursor-pointer active:scale-95 shadow-2xs"
              title="Return to Image Studio"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-neutral-600" />
              <span>Back to Studio</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 tracking-tight font-display hidden sm:inline">
                Document &amp; File Converter
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                36 in 1 Suite
              </span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search e.g. Word to PDF, Excel, PPTX..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-neutral-100/80 border border-neutral-200/70 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results (When Active) */}
          {filteredConversions ? (
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5">
              {filteredConversions.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-400">
                  No conversion matching "{searchQuery}"
                </div>
              ) : (
                filteredConversions.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversion(conv.id)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 hover:border-blue-400 hover:bg-blue-50/50 bg-white text-left transition flex items-center justify-between group cursor-pointer shadow-2xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-bold text-neutral-900 group-hover:text-blue-900">
                          {conv.name}
                        </span>
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                          {conv.targetFormat}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 truncate">{conv.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))
              )}
            </div>
          ) : (
            /* 6 Collapsible Categories */
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-0.5">
              {CONVERSION_CATEGORIES.map(category => {
                const isExpanded = !!expandedCategories[category.id];
                const categoryConversions = CONVERSIONS.filter(c => c.category === category.id);
                const IconComponent = CATEGORY_ICON_MAP[category.icon] || FileText;

                return (
                  <div 
                    key={category.id} 
                    className="rounded-2xl border border-neutral-200/90 overflow-hidden bg-white shadow-2xs"
                  >
                    {/* Category Header Accordion Button */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full px-3 py-2.5 bg-neutral-50/80 hover:bg-neutral-100/80 transition flex items-center justify-between text-left cursor-pointer border-b border-transparent data-[expanded=true]:border-neutral-200"
                      data-expanded={isExpanded}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-blue-100/70 text-blue-700 shrink-0">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
                            <span>{category.title}</span>
                            <span className="text-[9px] font-mono font-normal text-neutral-400">
                              ({categoryConversions.length})
                            </span>
                          </h4>
                          <p className="text-[10px] text-neutral-500 truncate">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <span className="text-[9px] font-mono text-neutral-500 bg-white px-1.5 py-0.5 rounded border border-neutral-200/80">
                          {category.badge}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Category Options List */}
                    {isExpanded && (
                      <div className="p-1.5 space-y-1 bg-white animate-in slide-in-from-top-1 duration-150">
                        {categoryConversions.map(conv => (
                          <button
                            key={conv.id}
                            onClick={() => handleSelectConversion(conv.id)}
                            className="w-full px-2.5 py-2 rounded-xl hover:bg-blue-50/60 active:bg-blue-100/50 text-left transition flex items-center justify-between group cursor-pointer border border-transparent hover:border-blue-200/60 min-h-[38px]"
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-xs font-semibold text-neutral-800 group-hover:text-blue-900">
                                  {conv.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-neutral-400 pl-2.5">
                                {conv.sourceFormat} &rarr; {conv.targetFormat}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
                              Convert
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 2. Compact Conversion Interface for Selected Tool */
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToCategories}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition cursor-pointer px-2 py-1 rounded-lg hover:bg-neutral-100 min-h-[32px]"
                title="Return to conversion categories"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-500" />
                <span>All Conversions</span>
              </button>
              <span className="text-neutral-300">|</span>
              <button
                onClick={() => {
                  if (onClose) onClose();
                  else setActiveUtilityId('compression');
                }}
                className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition cursor-pointer"
                title="Exit back to Image Studio"
              >
                Exit to Studio
              </button>
            </div>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
              {selectedConversion.sourceFormat} &rarr; {selectedConversion.targetFormat}
            </span>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-1.5 font-display">
              <span>{selectedConversion.name}</span>
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
              {selectedConversion.description}
            </p>
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

          {/* Upload / Drop Area */}
          {selectedFiles.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group ${
                isDragOver
                  ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
                  : 'border-neutral-300 hover:border-blue-500 bg-neutral-50/50 hover:bg-blue-50/20'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex items-center justify-center mb-2.5 text-neutral-700 group-hover:text-blue-600 group-hover:scale-105 transition-all">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-neutral-900 mb-0.5">
                Drop your {selectedConversion.sourceFormat} file here
              </p>
              <p className="text-[11px] text-neutral-500 mb-2.5">
                or click to browse from device
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1 text-[9px] font-mono text-neutral-400">
                <span>Formats: {selectedConversion.acceptsExtensions.join(', ')}</span>
                <span>•</span>
                <span>Max 100 MB</span>
              </div>
            </div>
          ) : (
            /* Selected File(s) Card */
            <div className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  {selectedFiles.length === 1 ? 'Selected Document' : `${selectedFiles.length} Selected Files`}
                </span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-[11px] font-semibold text-neutral-400 hover:text-red-600 transition cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Change File</span>
                </button>
              </div>

              {selectedFiles.map((file, fIdx) => (
                <div 
                  key={fIdx}
                  className="p-2.5 rounded-xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {file.name.split('.').pop() || 'DOC'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-neutral-900 truncate tracking-tight">
                        {file.name}
                      </p>
                      <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold px-1.5 py-0.5 bg-emerald-50 rounded border border-emerald-200/60 shrink-0">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Progress / Status Bar during processing */}
          {progressState.status !== 'idle' && progressState.status !== 'done' && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-950 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>{progressState.phase || 'Processing conversion...'}</span>
                </span>
                <span className="font-mono font-bold text-blue-700 text-xs">
                  {progressState.percent}%
                </span>
              </div>
              {/* Progress bar line */}
              <div className="w-full h-2 rounded-full bg-blue-200/60 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressState.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* 3. Success / Output Download Box */}
          {conversionResult && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-emerald-950">
                    Conversion Completed Successfully!
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5 truncate">
                    {conversionResult.summary || `${conversionResult.primaryFilename} is ready.`}
                  </p>
                </div>
              </div>

              {/* Output File Info Card */}
              <div className="p-3 rounded-xl bg-white border border-emerald-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 truncate max-w-[200px]">
                    {conversionResult.primaryFilename}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    {formatBytes(conversionResult.primarySize)}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500">
                  Format: {selectedConversion.outputExtension.toUpperCase()} • 100% Private Client Generation
                </p>
              </div>

              {/* Main Download Button */}
              <button
                onClick={() => handleDownloadFile(conversionResult.primaryBlob, conversionResult.primaryFilename)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs tracking-wide transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Download {conversionResult.primaryFilename}</span>
              </button>

              {/* Multi-item or ZIP Archive Download (when applicable) */}
              {conversionResult.items && conversionResult.items.length > 1 && (
                <div className="pt-2 border-t border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-emerald-900 font-semibold">
                    <span>Individual Extracted Items ({conversionResult.items.length}):</span>
                    {conversionResult.zipBlob && (
                      <button
                        onClick={() => handleDownloadFile(conversionResult.zipBlob!, conversionResult.zipFilename || 'all_items.zip')}
                        className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Download All (ZIP)</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {conversionResult.items.map(item => (
                      <div 
                        key={item.id}
                        className="p-2 rounded-lg bg-white/90 border border-emerald-100 flex items-center justify-between text-[11px]"
                      >
                        <span className="truncate max-w-[170px] text-neutral-800 font-medium">
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

              {/* Action Buttons: Convert Another & Back to Studio */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedFiles([]);
                    setConversionResult(null);
                    setProgressState({ status: 'idle', phase: '', percent: 0 });
                  }}
                  className="flex-1 w-full py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs transition cursor-pointer min-h-[36px] flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Convert Another File</span>
                </button>
                <button
                  onClick={() => {
                    if (onClose) onClose();
                    else setActiveUtilityId('compression');
                  }}
                  className="w-full sm:w-auto py-2 px-3.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-medium transition cursor-pointer min-h-[36px] flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Back to Studio</span>
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Button (When not converted yet) */}
          {!conversionResult && (
            <button
              onClick={handleStartConversion}
              disabled={selectedFiles.length === 0 || progressState.status === 'processing' || progressState.status === 'generating'}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs tracking-wide transition shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] min-h-[44px]"
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

