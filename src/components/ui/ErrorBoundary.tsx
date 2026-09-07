'use client';

import React from 'react';

interface State { hasError: boolean; message: string; stack: string }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '', stack: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message ?? String(error),
      stack: error?.stack ?? '',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
          <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 space-y-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">Something went wrong</h1>
            <p className="text-sm text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 rounded-xl p-3 break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <details className="text-xs text-gray-400 font-mono">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Stack trace
                </summary>
                <pre className="mt-2 overflow-auto max-h-48 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl whitespace-pre-wrap">
                  {this.state.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => { this.setState({ hasError: false, message: '', stack: '' }); window.location.reload(); }}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
