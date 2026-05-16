import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: 20,
            color: "#f0f2f5",
            fontFamily: "'Lora-Regular', 'Georgia', serif",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 32, marginBottom: 16 }}>Что-то пошло не так</h1>
          <p style={{ fontSize: 16, marginBottom: 24, maxWidth: 400 }}>
            Произошла непредвиденная ошибка. Пожалуйста, перезагрузите страницу или попробуйте позже.
          </p>
          <p style={{ fontSize: 12, color: "#6b7280" }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24,
              padding: "12px 32px",
              fontSize: 16,
              background: "#14b8a6",
              color: "#0b0d10",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Перезагрузить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
