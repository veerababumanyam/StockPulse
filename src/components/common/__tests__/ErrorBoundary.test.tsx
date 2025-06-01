import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { WidgetErrorBoundary } from '../ErrorBoundary';

// A component that throws an error
const ErrorComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('WidgetErrorBoundary', () => {
  // Mock console.error to avoid error logs in test output
  const originalError = console.error;
  
  beforeAll(() => {
    console.error = vi.fn();
  });
  
  afterAll(() => {
    console.error = originalError;
  });
  
  it('renders children when there is no error', () => {
    render(
      <WidgetErrorBoundary widgetId="test-widget">
        <div data-testid="child">Child component</div>
      </WidgetErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
  
  it('displays error message when child throws', () => {
    // Prevent React from logging the error to console
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <WidgetErrorBoundary widgetId="test-widget">
        <ErrorComponent shouldThrow={true} />
      </WidgetErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Show details')).toBeInTheDocument();
    
    // Clean up
    errorSpy.mockRestore();
  });
  
  it('displays custom fallback when provided', () => {
    const Fallback = () => <div>Custom error fallback</div>;
    
    // Prevent React from logging the error to console
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <WidgetErrorBoundary 
        widgetId="test-widget"
        fallback={<Fallback />}
      >
        <ErrorComponent shouldThrow={true} />
      </WidgetErrorBoundary>
    );
    
    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    
    // Clean up
    errorSpy.mockRestore();
  });
  
  it('shows error details when details are expanded', () => {
    // Prevent React from logging the error to console
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <WidgetErrorBoundary widgetId="test-widget">
        <ErrorComponent shouldThrow={true} />
      </WidgetErrorBoundary>
    );
    
    // Click to show details
    act(() => {
      screen.getByText('Show details').click();
    });
    
    // Get the pre element directly
    const preElement = document.querySelector('pre');
    expect(preElement).toBeInTheDocument();
    expect(preElement?.textContent).toContain('Test error');
    
    // Clean up
    errorSpy.mockRestore();
  });
  
  it('logs errors to console', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');
    
    render(
      <WidgetErrorBoundary widgetId="test-widget">
        <ErrorComponent shouldThrow={true} />
      </WidgetErrorBoundary>
    );
    
    expect(errorSpy).toHaveBeenCalledWith(
      '[test-widget] Error:',
      error,
      expect.any(Object) // errorInfo object
    );
    
    // Clean up
    errorSpy.mockRestore();
  });
});
