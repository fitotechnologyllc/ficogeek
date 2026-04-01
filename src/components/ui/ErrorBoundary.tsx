"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught Client-Side Exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 bg-red-50/50 border border-red-100 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto my-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
             <h3 className="font-bold text-red-900">Something went wrong</h3>
             <p className="text-xs text-red-600 font-medium leading-relaxed italic">
                A client-side exception occurred in this module.
             </p>
          </div>
          <button 
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
