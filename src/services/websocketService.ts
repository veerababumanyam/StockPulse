/**
 * WebSocket Service for Real-time Market Insights
 * Handles connection to Market Research Agent WebSocket endpoint
 */

import { getEnvVar } from "../utils/common/env";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  source?: string;
}

export interface MarketInsightUpdate {
  id: string;
  title: string;
  content: string;
  insight_type: string;
  priority: string;
  confidence: number;
  sentiment?: string;
  reference_symbol?: string;
  source: string;
  tags: string[];
  agent_id: string;
  timestamp: string;
  actionable: boolean;
  ag_ui_components?: Array<{
    type: string;
    props: Record<string, any>;
  }>;
}

export interface MarketDataUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface WatchlistItem {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export type MessageHandler = (message: WebSocketMessage) => void;
export type ErrorHandler = (error: Event) => void;
export type ConnectionHandler = (connected: boolean) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval = 30000; // 30 seconds
  
  private messageHandlers = new Map<string, Set<MessageHandler>>();
  private errorHandlers = new Set<ErrorHandler>();
  private connectionHandlers = new Set<ConnectionHandler>();
  
  private readonly baseUrl: string;
  private isConnecting = false;
  private shouldReconnect = true;

  constructor() {
    this.baseUrl = getEnvVar("VITE_MARKET_RESEARCH_AGENT_URL", "http://localhost:9003")
      .replace("http://", "ws://")
      .replace("https://", "wss://");
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      const wsUrl = `${this.baseUrl}/ws`;
      console.log(`[WebSocketService] Connecting to: ${wsUrl}`);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      console.error("[WebSocketService] Connection error:", error);
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    console.log("[WebSocketService] Disconnecting...");
    
    this.shouldReconnect = false;
    this.isConnecting = false;
    
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
    
    this.notifyConnectionHandlers(false);
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Send a message through the WebSocket
   */
  send(message: any): boolean {
    if (!this.isConnected()) {
      console.warn("[WebSocketService] Cannot send message: not connected");
      return false;
    }

    try {
      this.ws!.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("[WebSocketService] Send error:", error);
      return false;
    }
  }

  /**
   * Subscribe to specific message types
   */
  subscribe(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Send subscription message if connected
    if (this.isConnected()) {
      this.send({
        type: "subscribe",
        event: type,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Unsubscribe from message types
   */
  unsubscribe(type: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(type);
        
        // Send unsubscribe message if connected
        if (this.isConnected()) {
          this.send({
            type: "unsubscribe",
            event: type,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(handler: ConnectionHandler): void {
    this.connectionHandlers.add(handler);
  }

  /**
   * Unsubscribe from connection status changes
   */
  offConnectionChange(handler: ConnectionHandler): void {
    this.connectionHandlers.delete(handler);
  }

  /**
   * Subscribe to WebSocket errors
   */
  onError(handler: ErrorHandler): void {
    this.errorHandlers.add(handler);
  }

  /**
   * Unsubscribe from WebSocket errors
   */
  offError(handler: ErrorHandler): void {
    this.errorHandlers.delete(handler);
  }

  /**
   * Get connection status information
   */
  getStatus(): {
    connected: boolean;
    readyState: number | null;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      connected: this.isConnected(),
      readyState: this.ws?.readyState ?? null,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }

  /**
   * Get connection status as string
   * Compatibility method for existing code
   */
  getConnectionStatus(): string {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return "connected";
    } else if (this.ws?.readyState === WebSocket.CONNECTING || this.isConnecting) {
      return "connecting";
    } else {
      return "disconnected";
    }
  }

  /**
   * Subscribe to connection status changes
   * Compatibility method for existing code
   */
  onConnectionStatusChange(callback: (status: string) => void): void {
    const handler = (connected: boolean) => {
      const status = connected ? "connected" : "disconnected";
      callback(status);
    };
    this.onConnectionChange(handler);
  }

  // Private methods
  private handleOpen(event: Event): void {
    console.log("[WebSocketService] Connected successfully");
    
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    this.startHeartbeat();
    this.notifyConnectionHandlers(true);
    
    // Re-subscribe to all active subscriptions
    this.resubscribeAll();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Handle heartbeat responses
      if (message.type === "pong") {
        return;
      }
      
      // Distribute message to handlers
      const handlers = this.messageHandlers.get(message.type);
      if (handlers && handlers.size > 0) {
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error(`[WebSocketService] Handler error for ${message.type}:`, error);
          }
        });
      } else {
        console.log(`[WebSocketService] No handlers for message type: ${message.type}`);
      }
      
    } catch (error) {
      console.error("[WebSocketService] Message parse error:", error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log(`[WebSocketService] Connection closed: ${event.code} - ${event.reason}`);
    
    this.isConnecting = false;
    this.clearTimers();
    this.notifyConnectionHandlers(false);
    
    if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WebSocketService] Max reconnection attempts reached");
    }
  }

  private handleError(event: Event): void {
    console.error("[WebSocketService] WebSocket error:", event);
    
    this.errorHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error("[WebSocketService] Error handler failed:", error);
      }
    });
    
    if (this.isConnecting) {
      this.isConnecting = false;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`[WebSocketService] Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(error => {
        console.error("[WebSocketService] Reconnection failed:", error);
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          type: "ping",
          timestamp: new Date().toISOString()
        });
      }
    }, this.heartbeatInterval);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error("[WebSocketService] Connection handler error:", error);
      }
    });
  }

  private resubscribeAll(): void {
    for (const type of this.messageHandlers.keys()) {
      this.send({
        type: "subscribe",
        event: type,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Global WebSocket service instance
export const webSocketService = new WebSocketService();

/**
 * Connect to market data WebSocket
 * Wrapper function for compatibility with existing code
 */
export const connectToMarketData = async (): Promise<void> => {
  return webSocketService.connect();
};

/**
 * Subscribe to watchlist updates
 * Wrapper function for compatibility with existing code
 */
export const subscribeToWatchlist = (
  items: WatchlistItem[],
  callback: (update: MarketDataUpdate) => void
): (() => void) => {
  const handler = (message: WebSocketMessage) => {
    if (message.type === 'market_data_update' && message.data) {
      // Transform the message data to MarketDataUpdate format
      const update: MarketDataUpdate = {
        symbol: message.data.symbol || '',
        price: message.data.price || 0,
        change: message.data.change || 0,
        changePercent: message.data.changePercent || 0,
        volume: message.data.volume || 0,
        timestamp: message.timestamp
      };
      callback(update);
    }
  };

  webSocketService.subscribe('market_data_update', handler);
  
  // Return unsubscribe function
  return () => {
    webSocketService.unsubscribe('market_data_update', handler);
  };
};

/**
 * Subscribe to single symbol updates
 * Wrapper function for compatibility with existing code
 */
export const subscribeToSymbol = (
  symbol: string,
  callback: (update: MarketDataUpdate) => void
): (() => void) => {
  const handler = (message: WebSocketMessage) => {
    if (message.type === 'market_data_update' && message.data && message.data.symbol === symbol) {
      // Transform the message data to MarketDataUpdate format
      const update: MarketDataUpdate = {
        symbol: message.data.symbol || '',
        price: message.data.price || 0,
        change: message.data.change || 0,
        changePercent: message.data.changePercent || 0,
        volume: message.data.volume || 0,
        timestamp: message.timestamp
      };
      callback(update);
    }
  };

  webSocketService.subscribe('market_data_update', handler);
  
  // Return unsubscribe function
  return () => {
    webSocketService.unsubscribe('market_data_update', handler);
  };
};

// Auto-connect on module load (can be disabled if needed)
if (typeof window !== "undefined") {
  // Only connect in browser environment
  webSocketService.connect().catch(error => {
    console.warn("[WebSocketService] Initial connection failed:", error);
  });
}

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    webSocketService.disconnect();
  });
}

export default webSocketService;
