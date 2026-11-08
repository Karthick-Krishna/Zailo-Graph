import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Zailograph error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetWorkspace = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0E1017] text-[#F8F9FA] flex items-center justify-center p-6 selection:bg-violet-500/30">
          <div className="max-w-lg w-full bg-[#161922] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -left-24 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-lg shadow-amber-500/10">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <span className="text-[10px] font-mono font-bold tracking-widest text-violet-400 uppercase mb-1">
                Fault Containment Active
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white mb-2">
                Workspace Exception Caught
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6 max-w-sm">
                A non-fatal error occurred during canvas processing. Your session data is preserved locally in virtual storage.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full mb-4">
                <button
                  onClick={this.handleReload}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold tracking-wide shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Recover Workspace</span>
                </button>
                <button
                  onClick={this.handleResetWorkspace}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98]"
                >
                  <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Reset Cache</span>
                </button>
              </div>

              {/* Technical Details Accordion */}
              <div className="w-full border-t border-white/5 pt-4 text-left">
                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="flex items-center justify-between w-full text-[11px] font-mono text-neutral-400 hover:text-neutral-200 cursor-pointer"
                >
                  <span>Diagnostic Information</span>
                  {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {this.state.showDetails && (
                  <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] text-neutral-300 max-h-48 overflow-y-auto space-y-2">
                    <p className="text-amber-300 font-semibold">{this.state.error?.toString()}</p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="text-neutral-400 whitespace-pre-wrap leading-tight text-[9px]">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
