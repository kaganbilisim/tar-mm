import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Tarım Cepte yakalanan hata:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#06140f] text-emerald-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0d2218] border border-emerald-800 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-lg font-extrabold text-white mb-2">
              Bir Arayüz Hatası Meydana Geldi
            </h1>
            <p className="text-xs text-emerald-300/80 mb-5 leading-relaxed">
              Oturum veya ekran geçişi sırasında beklenmeyen bir durum oluştu. Verileriniz cihazınızda güvendedir.
            </p>
            {this.state.error?.message && (
              <div className="bg-black/30 p-2.5 rounded-xl text-[11px] text-rose-300 font-mono mb-5 text-left overflow-x-auto border border-rose-950/60">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Uygulamayı Yenile</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

