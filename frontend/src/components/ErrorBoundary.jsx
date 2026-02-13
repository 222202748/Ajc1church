import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="container py-5 text-center">
          <div className="card shadow-sm border-0 p-5">
            <div className="card-body">
              <i className="bi bi-exclamation-triangle-fill text-warning display-1 mb-4"></i>
              <h2 className="fw-bold mb-3">Something went wrong</h2>
              <p className="text-muted mb-4">
                We apologize for the inconvenience. The application encountered an unexpected error.
              </p>
              <button 
                className="btn btn-primary px-4 py-2"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 text-start">
                  <details style={{ whiteSpace: 'pre-wrap' }}>
                    <summary className="text-danger cursor-pointer">Error Details</summary>
                    <div className="mt-2 p-3 bg-light rounded small">
                      {this.state.error && this.state.error.toString()}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
