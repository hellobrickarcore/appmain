// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // #region agent log
    // fetch('http://127.0.0.1:7244/ingest/d7244d3a-90f2-41f3-bc4a-3f7a92e83342',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ErrorBoundary.tsx:componentDidCatch','message':'ErrorBoundary caught error','data':{message:error.message,stack:error.stack,componentStack:errorInfo.componentStack},timestamp:Date.now(),sessionId:'debug-session',runId:'error-catch',hypothesisId:'N'})}).catch(()=>{});
    // #endregion
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Oops! Something went wrong</h1>
            <p className="text-slate-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-2xl font-bold"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

