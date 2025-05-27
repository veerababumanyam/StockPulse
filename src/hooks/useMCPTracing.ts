import { useState, useEffect } from 'react';
import { useTelemetry, SpanContext } from '../contexts/TelemetryContext';

/**
 * Hook for tracing MCP operations with OpenTelemetry
 * 
 * This hook provides utilities for tracing MCP operations, including
 * server discovery, connection, and request/response cycles.
 */
export const useMCPTracing = () => {
  const telemetry = useTelemetry();
  const [activeOperationSpan, setActiveOperationSpan] = useState<SpanContext | null>(null);
  
  // Clean up any active spans when component unmounts
  useEffect(() => {
    return () => {
      if (activeOperationSpan) {
        telemetry.endSpan(activeOperationSpan);
      }
    };
  }, [activeOperationSpan, telemetry]);
  
  /**
   * Start tracing a server discovery operation
   * 
   * @param method - Discovery method (registry, network, url, qrcode)
   * @param query - Search query or URL
   * @returns Span context for the operation
   */
  const traceDiscovery = (method: string, query: string) => {
    const span = telemetry.startSpan('mcp.discovery', {
      'mcp.discovery.method': method,
      'mcp.discovery.query': query,
      'mcp.operation.type': 'discovery'
    });
    
    setActiveOperationSpan(span);
    return span;
  };
  
  /**
   * Start tracing a server connection operation
   * 
   * @param serverId - ID of the server being connected to
   * @param serverName - Name of the server being connected to
   * @param serverUrl - URL of the server being connected to
   * @returns Span context for the operation
   */
  const traceConnection = (serverId: string, serverName: string, serverUrl: string) => {
    const span = telemetry.startSpan('mcp.connection', {
      'mcp.server.id': serverId,
      'mcp.server.name': serverName,
      'mcp.server.url': serverUrl,
      'mcp.operation.type': 'connection'
    });
    
    setActiveOperationSpan(span);
    return span;
  };
  
  /**
   * Start tracing a server request operation
   * 
   * @param serverId - ID of the server being requested
   * @param serverName - Name of the server being requested
   * @param operationType - Type of operation being performed
   * @param requestData - Data being sent in the request
   * @returns Span context for the operation
   */
  const traceRequest = (serverId: string, serverName: string, operationType: string, requestData?: any) => {
    const span = telemetry.startSpan('mcp.request', {
      'mcp.server.id': serverId,
      'mcp.server.name': serverName,
      'mcp.operation.type': operationType,
      'mcp.request.timestamp': new Date().toISOString()
    });
    
    if (requestData) {
      telemetry.setSpanAttribute(span, 'mcp.request.data', JSON.stringify(requestData));
    }
    
    setActiveOperationSpan(span);
    return span;
  };
  
  /**
   * Record a successful response to a request
   * 
   * @param span - Span context for the operation
   * @param responseData - Data received in the response
   * @param latency - Latency of the request in milliseconds
   */
  const recordResponse = (span: SpanContext, responseData: any, latency: number) => {
    telemetry.addEvent(span, 'mcp.response', {
      'mcp.response.timestamp': new Date().toISOString(),
      'mcp.response.latency': latency,
      'mcp.response.status': 'success'
    });
    
    telemetry.setSpanAttribute(span, 'mcp.response.latency', latency);
    telemetry.endSpan(span);
    
    if (span.id === activeOperationSpan?.id) {
      setActiveOperationSpan(null);
    }
  };
  
  /**
   * Record an error response to a request
   * 
   * @param span - Span context for the operation
   * @param error - Error that occurred
   * @param latency - Latency of the request in milliseconds
   */
  const recordError = (span: SpanContext, error: Error, latency: number) => {
    telemetry.addEvent(span, 'mcp.error', {
      'mcp.error.timestamp': new Date().toISOString(),
      'mcp.error.message': error.message,
      'mcp.error.type': error.name,
      'mcp.response.latency': latency,
      'mcp.response.status': 'error'
    });
    
    telemetry.recordException(span, error);
    telemetry.endSpan(span);
    
    if (span.id === activeOperationSpan?.id) {
      setActiveOperationSpan(null);
    }
  };
  
  /**
   * End the current operation span
   */
  const endCurrentOperation = () => {
    if (activeOperationSpan) {
      telemetry.endSpan(activeOperationSpan);
      setActiveOperationSpan(null);
    }
  };
  
  return {
    traceDiscovery,
    traceConnection,
    traceRequest,
    recordResponse,
    recordError,
    endCurrentOperation,
    activeOperationSpan,
    isTracingEnabled: telemetry.isTracingEnabled,
    getCurrentTraceId: telemetry.getCurrentTraceId
  };
};

export default useMCPTracing;
