/**
 * Error Message Component
 * Reusable error display with consistent styling and retry functionality
 */
import React from 'react';
import { PortfolioError } from '../../types/portfolio';

interface ErrorMessageProps {
  error: PortfolioError | Error | string;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  className = '',
  showDetails = false,
}) => {
  const getErrorMessage = (): string => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return error.message || 'An unexpected error occurred';
  };

  const getErrorCode = (): string | undefined => {
    if (typeof error === 'object' && 'code' in error) {
      return error.code;
    }
    return undefined;
  };

  const getErrorDetails = (): Record<string, any> | undefined => {
    if (typeof error === 'object' && 'details' in error) {
      return error.details;
    }
    return undefined;
  };

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {getErrorCode() && (
              <span className="mr-2 font-mono text-xs">
                [{getErrorCode()}]
              </span>
            )}
            Error
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{getErrorMessage()}</p>
            {showDetails && getErrorDetails() && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">
                  Technical Details
                </summary>
                <pre className="mt-1 overflow-auto rounded bg-red-100 p-2 text-xs">
                  {JSON.stringify(getErrorDetails(), null, 2)}
                </pre>
              </details>
            )}
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage; 