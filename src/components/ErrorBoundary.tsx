/**
 * PRP-027 Task 5.2: Error Boundary Component
 *
 * Graceful error handling for React component tree.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { withTranslation, type WithTranslation } from "react-i18next";

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { t } = this.props;

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center p-8"
          style={{ fontFamily: "'Press Start 2P'" }}
        >
          <div className="pixel-box p-8 max-w-lg text-center">
            <div className="text-6xl mb-6">💥</div>
            <h1
              style={{ fontSize: "16px", color: "#ff6b9d", marginBottom: "16px" }}
            >
              {t('error.title')}
            </h1>
            <p
              style={{
                fontSize: "8px",
                color: "#eef5db",
                lineHeight: "2",
                marginBottom: "24px",
              }}
            >
              {t('error.message')}
              <br />
              {t('error.instruction')}
            </p>

            {this.state.error && (
              <details className="text-left mb-6">
                <summary
                  style={{ fontSize: "6px", color: "#4a4a6e", cursor: "pointer" }}
                >
                  {t('error.technicalDetails')}
                </summary>
                <pre
                  className="mt-2 p-3 bg-[#16213e] overflow-auto"
                  style={{
                    fontSize: "6px",
                    color: "#ff6b9d",
                    maxHeight: "100px",
                  }}
                >
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="pixel-btn"
                style={{ fontSize: "10px" }}
              >
                ↻ {t('common.retry')}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="pixel-btn pixel-btn-yellow"
                style={{ fontSize: "10px" }}
              >
                {t('common.refreshPage')}
              </button>
            </div>

            <p
              style={{
                fontSize: "6px",
                color: "#4a4a6e",
                marginTop: "24px",
              }}
            >
              {t('error.reportIssue')}{" "}
              <a
                href="https://github.com/typequests/typebit8/issues"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#3bceac" }}
              >
                {t('error.reportLink')}
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent);
