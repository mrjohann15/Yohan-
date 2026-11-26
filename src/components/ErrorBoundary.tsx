import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'May hindi inaasahang error na naganap.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-zinc-200 rounded-xl p-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-zinc-900 mb-3">
              May problema sa pag-load ng tindahan
            </h1>
            <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
              Hindi makakonekta o nagkaroon ng permission error habang ina-access ang database.
              Subukang i-refresh ang page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap"
            >
              I-reload ang Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
