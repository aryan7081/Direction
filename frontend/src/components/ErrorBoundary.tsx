'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
              <p className="text-gray-600 mt-2">Please refresh the page and try again.</p>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
