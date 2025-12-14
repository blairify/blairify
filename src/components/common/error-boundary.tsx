"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import type React from "react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryInner extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 text-foreground">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-xl p-6 text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>

            <Typography.Heading1 className="text-foreground">
              Something went wrong
            </Typography.Heading1>

            <p className="text-muted-foreground">
              We encountered an unexpected error. Please try refreshing the page
              or contact support if the problem persists.
            </p>

            {errorMessage && (
              <p className="text-xs text-muted-foreground mb-2 break-words">
                <span className="font-semibold text-foreground">Error:</span>{" "}
                {errorMessage}
              </p>
            )}

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-4 text-left rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <summary className="cursor-pointer px-3 py-2 text-foreground/80">
                  Error Details (Development)
                </summary>
                <pre className="text-xs px-3 pb-3 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>

              <Button
                onClick={() => {
                  window.location.href = "/";
                }}
                variant="default"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary(props: Props) {
  return <ErrorBoundaryInner {...props} />;
}

// HOC wrapper for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
