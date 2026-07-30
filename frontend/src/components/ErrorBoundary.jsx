import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-2xl w-full">
            <h1 className="text-red-500 text-2xl font-black mb-4">Application Error Caught</h1>
            <p className="text-red-400 mb-6 font-medium">Please send this stack trace to the AI assistant so it can fix the bug.</p>
            <div className="bg-black/50 p-4 rounded-xl overflow-x-auto text-left">
              <pre className="text-red-300 text-[10px] font-mono whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
                <br /><br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
