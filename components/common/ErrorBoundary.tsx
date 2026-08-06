import React, { ErrorInfo, ReactNode } from 'react';
import Card from './Card';
import Button from './Button';
import { ThreatIcon } from '../Icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030303] text-brand-text flex items-center justify-center p-6 relative overflow-hidden">
          <div className="grain-overlay"></div>
          <div className="absolute inset-0 tech-bg pointer-events-none opacity-20"></div>
          
          <Card className="w-full max-w-xl p-0 bg-[#0A0A0A] border border-red-500/30 relative overflow-hidden shadow-2xl rounded-lg z-10">
            {/* Header */}
            <div className="bg-red-950/20 p-6 border-b border-red-500/20 flex flex-col items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-red-500/5 blur-3xl"></div>
              <ThreatIcon className="w-12 h-12 text-red-500 mb-4 relative z-10 animate-pulse" />
              <h2 className="text-xl font-bold text-red-500 font-mono uppercase tracking-widest relative z-10">
                SYSTEM_CRITICAL_FAILURE
              </h2>
              <p className="text-[10px] text-gray-500 font-mono mt-1 relative z-10 tracking-widest">
                KERNEL_PANIC // EXCEPTION_CAUGHT
              </p>
            </div>

            {/* Error Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-400 font-mono leading-relaxed">
                Kallipolis ZK Core Engine has intercepted an unhandled runtime exception. Operation has been paused to prevent state corruption or wallet telemetry desync.
              </p>

              {this.state.error && (
                <div className="p-4 bg-[#050505] border border-white/5 rounded-sm space-y-2">
                  <div className="text-[9px] font-mono text-red-400 font-black uppercase tracking-wider">
                    Error Signature
                  </div>
                  <p className="text-[11px] font-mono text-gray-300 break-all select-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              {this.state.errorInfo && (
                <div className="p-4 bg-[#050505] border border-white/5 rounded-sm space-y-1">
                  <div className="text-[9px] font-mono text-gray-500 font-black uppercase tracking-wider">
                    Stack Frame Traces
                  </div>
                  <pre className="text-[9px] font-mono text-gray-500 overflow-x-auto custom-scrollbar max-h-32 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <Button
                onClick={this.handleReset}
                className="w-full py-3 mt-4 bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold uppercase tracking-widest border-none rounded-sm transition-all shadow-[0_0_15px_rgba(239,110,110,0.2)]"
              >
                Reset Kernel & Reload Page
              </Button>
            </div>

            {/* Footer status */}
            <div className="bg-[#030303] py-3 px-6 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gray-600 uppercase">
              <span>MEM_INTEGRITY: SECURED</span>
              <span>SIG_STATE: INTACT</span>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
