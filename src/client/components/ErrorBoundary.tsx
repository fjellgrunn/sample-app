import React from 'react';
import { FallbackProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { getLogger } from '@fjell/logging';

const logger = getLogger('ErrorBoundary');

interface ErrorInfo {
  componentStack?: string | null;
  [key: string]: any;
}

interface ErrorFallbackProps extends FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      border: '2px solid #dc2626',
      borderRadius: '8px',
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    }}>
      <h2>Something went wrong</h2>
      <p><strong>Error:</strong> {error.message}</p>

      {isDevelopment && (
        <details style={{ marginTop: '16px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Stack Trace (Development Only)
          </summary>
          <pre style={{
            marginTop: '8px',
            padding: '12px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            color: '#374151'
          }}>
            {error.stack}
          </pre>
        </details>
      )}

      <button
        onClick={resetErrorBoundary}
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  );
};

const handleError = (error: Error, errorInfo: ErrorInfo) => {
  // Log the error with enhanced information using fjell logging
  logger.error('React Error Boundary caught an error', {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack || 'Not available',
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Server'
  });

  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error reporting service
    // errorReportingService.captureException(error, { extra: errorInfo });
  }
};

interface FjellErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export const FjellErrorBoundary: React.FC<FjellErrorBoundaryProps> = ({
  children,
  fallback: FallbackComponent = ErrorFallback,
  onError = handleError
}) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={onError}
      onReset={() => {
        // Clear any error state in your app if needed
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};
