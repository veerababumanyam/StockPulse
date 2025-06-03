import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  widgetId: string;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class WidgetErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[${this.props.widgetId}] Error:`, error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-danger-muted text-danger-fg rounded-md">
            <h3 className="font-bold">Something went wrong</h3>
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer">Show details</summary>
              <pre className="mt-2 p-2 bg-black/10 rounded overflow-auto text-xs">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
