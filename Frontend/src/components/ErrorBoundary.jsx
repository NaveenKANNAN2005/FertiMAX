import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    if (import.meta.env.DEV) {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    if (import.meta.env.PROD) {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">!</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-center text-gray-600 mb-6">
              An unexpected error occurred. Please try refreshing the page or go back home.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-md border border-gray-300">
                <details className="text-xs text-gray-700 cursor-pointer">
                  <summary className="font-bold mb-2">Error Details</summary>
                  <pre className="overflow-auto max-h-40 text-red-600">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="overflow-auto max-h-40 text-red-600 mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              </div>
            )}

            {this.state.errorCount > 3 && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Multiple errors detected. Please refresh your browser.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Try Again
              </button>
              <a
                href="/"
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md text-center transition duration-200"
              >
                Go Home
              </a>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              If the problem persists, please contact our{" "}
              <a href="/contact" className="text-blue-600 hover:underline">
                support team
              </a>
              .
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
