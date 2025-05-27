import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the OpenTelemetry context interface
interface TelemetryContextType {
  startSpan: (name: string, attributes?: Record<string, any>) => SpanContext;
  endSpan: (spanContext: SpanContext) => void;
  addEvent: (spanContext: SpanContext, name: string, attributes?: Record<string, any>) => void;
  setSpanAttribute: (spanContext: SpanContext, key: string, value: any) => void;
  recordException: (spanContext: SpanContext, exception: Error) => void;
  getCurrentTraceId: () => string | null;
  isTracingEnabled: boolean;
  setTracingEnabled: (enabled: boolean) => void;
}

// Define the span context interface
export interface SpanContext {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  startTime: number;
  attributes: Record<string, any>;
  events: SpanEvent[];
  status: 'unset' | 'ok' | 'error';
}

// Define the span event interface
interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, any>;
}

// Create the context with default values
const TelemetryContext = createContext<TelemetryContextType>({
  startSpan: () => ({ 
    id: '', 
    traceId: '', 
    name: '', 
    startTime: 0, 
    attributes: {}, 
    events: [], 
    status: 'unset' 
  }),
  endSpan: () => {},
  addEvent: () => {},
  setSpanAttribute: () => {},
  recordException: () => {},
  getCurrentTraceId: () => null,
  isTracingEnabled: false,
  setTracingEnabled: () => {},
});

// Generate a random ID for spans and traces
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Provider component
export const TelemetryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTracingEnabled, setTracingEnabled] = useState<boolean>(true);
  const [activeSpans, setActiveSpans] = useState<Record<string, SpanContext>>({});
  const [currentTraceId, setCurrentTraceId] = useState<string | null>(null);

  // Initialize OpenTelemetry
  useEffect(() => {
    if (isTracingEnabled) {
      console.log('OpenTelemetry tracing initialized');
      // In a real implementation, this would initialize the OpenTelemetry SDK
      // and configure exporters, samplers, etc.
    }
  }, [isTracingEnabled]);

  // Start a new span
  const startSpan = (name: string, attributes: Record<string, any> = {}): SpanContext => {
    if (!isTracingEnabled) {
      return { 
        id: '', 
        traceId: '', 
        name, 
        startTime: 0, 
        attributes: {}, 
        events: [], 
        status: 'unset' 
      };
    }

    const spanId = generateId();
    const traceId = currentTraceId || generateId();
    
    if (!currentTraceId) {
      setCurrentTraceId(traceId);
    }

    const span: SpanContext = {
      id: spanId,
      traceId,
      name,
      startTime: Date.now(),
      attributes: {
        ...attributes,
        'mcp.component': 'stockpulse',
      },
      events: [],
      status: 'unset',
    };

    setActiveSpans(prev => ({
      ...prev,
      [spanId]: span
    }));

    console.log(`[OpenTelemetry] Started span: ${name} (${spanId})`);
    return span;
  };

  // End a span
  const endSpan = (spanContext: SpanContext): void => {
    if (!isTracingEnabled || !spanContext.id) return;

    const { id } = spanContext;
    const span = activeSpans[id];
    
    if (!span) {
      console.warn(`[OpenTelemetry] Attempted to end non-existent span: ${id}`);
      return;
    }

    const duration = Date.now() - span.startTime;
    console.log(`[OpenTelemetry] Ended span: ${span.name} (${id}) - Duration: ${duration}ms`);

    // In a real implementation, this would export the span to a collector
    // For now, we'll just remove it from active spans
    setActiveSpans(prev => {
      const newSpans = { ...prev };
      delete newSpans[id];
      return newSpans;
    });

    // If this was the root span, clear the current trace ID
    if (Object.keys(activeSpans).length === 1) {
      setCurrentTraceId(null);
    }
  };

  // Add an event to a span
  const addEvent = (spanContext: SpanContext, name: string, attributes: Record<string, any> = {}): void => {
    if (!isTracingEnabled || !spanContext.id) return;

    const { id } = spanContext;
    const span = activeSpans[id];
    
    if (!span) {
      console.warn(`[OpenTelemetry] Attempted to add event to non-existent span: ${id}`);
      return;
    }

    const event: SpanEvent = {
      name,
      timestamp: Date.now(),
      attributes,
    };

    setActiveSpans(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        events: [...prev[id].events, event],
      },
    }));

    console.log(`[OpenTelemetry] Added event: ${name} to span: ${span.name} (${id})`);
  };

  // Set an attribute on a span
  const setSpanAttribute = (spanContext: SpanContext, key: string, value: any): void => {
    if (!isTracingEnabled || !spanContext.id) return;

    const { id } = spanContext;
    const span = activeSpans[id];
    
    if (!span) {
      console.warn(`[OpenTelemetry] Attempted to set attribute on non-existent span: ${id}`);
      return;
    }

    setActiveSpans(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        attributes: {
          ...prev[id].attributes,
          [key]: value,
        },
      },
    }));
  };

  // Record an exception on a span
  const recordException = (spanContext: SpanContext, exception: Error): void => {
    if (!isTracingEnabled || !spanContext.id) return;

    const { id } = spanContext;
    const span = activeSpans[id];
    
    if (!span) {
      console.warn(`[OpenTelemetry] Attempted to record exception on non-existent span: ${id}`);
      return;
    }

    addEvent(spanContext, 'exception', {
      'exception.type': exception.name,
      'exception.message': exception.message,
      'exception.stacktrace': exception.stack,
    });

    setActiveSpans(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: 'error',
      },
    }));

    console.error(`[OpenTelemetry] Recorded exception in span: ${span.name} (${id})`, exception);
  };

  // Get the current trace ID
  const getCurrentTraceId = (): string | null => {
    return currentTraceId;
  };

  return (
    <TelemetryContext.Provider
      value={{
        startSpan,
        endSpan,
        addEvent,
        setSpanAttribute,
        recordException,
        getCurrentTraceId,
        isTracingEnabled,
        setTracingEnabled,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

// Custom hook to use the telemetry context
export const useTelemetry = () => useContext(TelemetryContext);

// Higher-order component to wrap a component with tracing
export const withTracing = <P extends object>(
  Component: React.ComponentType<P>,
  spanName: string,
  getAttributes?: (props: P) => Record<string, any>
): React.FC<P> => {
  const WithTracing: React.FC<P> = (props) => {
    const { startSpan, endSpan } = useTelemetry();
    const [spanContext, setSpanContext] = useState<SpanContext | null>(null);

    useEffect(() => {
      const attributes = getAttributes ? getAttributes(props) : {};
      const span = startSpan(spanName, attributes);
      setSpanContext(span);

      return () => {
        if (span) {
          endSpan(span);
        }
      };
    }, []);

    return <Component {...props} />;
  };

  return WithTracing;
};

// Utility function to create a traced function
export const traceFunction = <T extends (...args: any[]) => any>(
  fn: T,
  spanName: string,
  getAttributes?: (args: Parameters<T>) => Record<string, any>
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    const telemetry = useContext(TelemetryContext);
    const attributes = getAttributes ? getAttributes(args) : {};
    const span = telemetry.startSpan(spanName, attributes);

    try {
      const result = fn(...args);

      // Handle promises
      if (result instanceof Promise) {
        return result
          .then((value) => {
            telemetry.endSpan(span);
            return value;
          })
          .catch((error) => {
            telemetry.recordException(span, error);
            telemetry.endSpan(span);
            throw error;
          }) as ReturnType<T>;
      }

      telemetry.endSpan(span);
      return result;
    } catch (error) {
      telemetry.recordException(span, error as Error);
      telemetry.endSpan(span);
      throw error;
    }
  };
};
