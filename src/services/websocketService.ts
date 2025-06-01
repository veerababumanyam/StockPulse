/**
 * WebSocket Service - Real-time Market Data Updates
 * Handles real-time stock price updates for Story 2.4
 */

import { WatchlistItem } from '../types/widget-data';

export interface MarketDataUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
  developmentMode: boolean;
}

export type MarketDataCallback = (update: MarketDataUpdate) => void;
export type ConnectionStatusCallback = (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;

/**
 * WebSocket Service for real-time market data
 */
export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error' = 'disconnected';
  private subscriptions: Map<string, Set<MarketDataCallback>> = new Map();
  private statusCallbacks: Set<ConnectionStatusCallback> = new Set();
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private developmentMockTimer: NodeJS.Timeout | null = null;
  
  private readonly config: WebSocketConfig = {
    url: (typeof process !== 'undefined' && process.env?.REACT_APP_WS_URL) 
      || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL)
      || 'ws://localhost:8000/ws/market-data',
    reconnectAttempts: 3, // Reduced for development
    reconnectInterval: 10000, // Increased interval for development
    heartbeatInterval: 30000,
    developmentMode: (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') 
      || (typeof import.meta !== 'undefined' && import.meta.env?.DEV === true)
      || true, // Default to development mode
  };

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      // In development mode, if we've already failed multiple times, use mock data
      if (this.config.developmentMode && this.reconnectAttempts >= this.config.reconnectAttempts) {
        console.log('[WebSocketService] Using mock data in development mode');
        this.setConnectionStatus('connected');
        this.startDevelopmentMockData();
        resolve();
        return;
      }

      this.setConnectionStatus('connecting');
      
      try {
        this.socket = new WebSocket(this.config.url);
        
        this.socket.onopen = () => {
          console.log('[WebSocketService] Connected to market data stream');
          this.setConnectionStatus('connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.socket.onclose = (event) => {
          console.log('[WebSocketService] Connection closed:', event.reason);
          this.setConnectionStatus('disconnected');
          this.stopHeartbeat();
          
          // In development mode, be less aggressive with reconnection
          if (this.config.developmentMode) {
            this.attemptReconnectGracefully();
          } else {
            this.attemptReconnect();
          }
        };

        this.socket.onerror = (error) => {
          if (this.config.developmentMode) {
            console.warn('[WebSocketService] Connection failed (development mode)');
          } else {
            console.error('[WebSocketService] Connection error:', error);
          }
          this.setConnectionStatus('error');
          reject(error);
        };

        // Shorter timeout for development mode
        const timeout = this.config.developmentMode ? 3000 : 10000;
        setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            this.socket?.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, timeout);

      } catch (error) {
        console.error('[WebSocketService] Failed to create WebSocket:', error);
        this.setConnectionStatus('error');
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();
    this.stopDevelopmentMockData();
    
    if (this.socket) {
      this.socket.close(1000, 'User initiated disconnect');
      this.socket = null;
    }
    
    this.setConnectionStatus('disconnected');
  }

  /**
   * Subscribe to real-time updates for a symbol
   */
  subscribe(symbol: string, callback: MarketDataCallback): () => void {
    const normalizedSymbol = symbol.toUpperCase();
    
    if (!this.subscriptions.has(normalizedSymbol)) {
      this.subscriptions.set(normalizedSymbol, new Set());
    }
    
    this.subscriptions.get(normalizedSymbol)!.add(callback);
    
    // Send subscription request to server
    this.sendMessage({
      action: 'subscribe',
      symbol: normalizedSymbol
    });

    console.log(`[WebSocketService] Subscribed to ${normalizedSymbol}`);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(normalizedSymbol, callback);
    };
  }

  /**
   * Unsubscribe from real-time updates for a symbol
   */
  unsubscribe(symbol: string, callback: MarketDataCallback): void {
    const normalizedSymbol = symbol.toUpperCase();
    const callbacks = this.subscriptions.get(normalizedSymbol);
    
    if (callbacks) {
      callbacks.delete(callback);
      
      // If no more callbacks for this symbol, unsubscribe from server
      if (callbacks.size === 0) {
        this.subscriptions.delete(normalizedSymbol);
        this.sendMessage({
          action: 'unsubscribe',
          symbol: normalizedSymbol
        });
        console.log(`[WebSocketService] Unsubscribed from ${normalizedSymbol}`);
      }
    }
  }

  /**
   * Subscribe to connection status updates
   */
  onConnectionStatusChange(callback: ConnectionStatusCallback): () => void {
    this.statusCallbacks.add(callback);
    
    // Immediately call with current status
    callback(this.connectionStatus);
    
    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  /**
   * Subscribe to multiple symbols at once
   */
  subscribeToWatchlist(watchlistItems: WatchlistItem[], callback: MarketDataCallback): () => void {
    const unsubscribeFunctions = watchlistItems.map(item => 
      this.subscribe(item.symbol, callback)
    );

    // Return function to unsubscribe from all
    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }

  // Private methods

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'market_data':
          this.handleMarketDataUpdate(data);
          break;
        case 'heartbeat':
          this.handleHeartbeat(data);
          break;
        case 'error':
          console.error('[WebSocketService] Server error:', data.message);
          break;
        default:
          console.warn('[WebSocketService] Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('[WebSocketService] Failed to parse message:', error);
    }
  }

  private handleMarketDataUpdate(data: any): void {
    const update: MarketDataUpdate = {
      symbol: data.symbol,
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      volume: data.volume,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    // Notify all subscribers for this symbol
    const callbacks = this.subscriptions.get(update.symbol);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          console.error('[WebSocketService] Error in callback:', error);
        }
      });
    }
  }

  private handleHeartbeat(data: any): void {
    // Respond to server heartbeat
    this.sendMessage({
      action: 'heartbeat_response',
      timestamp: new Date().toISOString()
    });
  }

  private sendMessage(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocketService] Cannot send message - not connected');
    }
  }

  private setConnectionStatus(status: 'connected' | 'disconnected' | 'connecting' | 'error'): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      
      // Notify all status callbacks
      this.statusCallbacks.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.error('[WebSocketService] Error in status callback:', error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      this.sendMessage({
        action: 'heartbeat',
        timestamp: new Date().toISOString()
      });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      console.error('[WebSocketService] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WebSocketService] Attempting reconnection ${this.reconnectAttempts}/${this.config.reconnectAttempts}`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[WebSocketService] Reconnection failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  private attemptReconnectGracefully(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      if (this.config.developmentMode) {
        console.log('[WebSocketService] Switching to mock data (no WebSocket server available)');
        this.setConnectionStatus('connected');
        this.startDevelopmentMockData();
      } else {
        console.error('[WebSocketService] Max reconnection attempts reached');
      }
      return;
    }

    this.reconnectAttempts++;
    
    if (this.config.developmentMode) {
      console.log(`[WebSocketService] Reconnection attempt ${this.reconnectAttempts}/${this.config.reconnectAttempts} (development mode)`);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        if (!this.config.developmentMode) {
          console.error('[WebSocketService] Reconnection failed:', error);
        }
      });
    }, this.config.reconnectInterval);
  }

  private startDevelopmentMockData(): void {
    if (!this.config.developmentMode) return;

    this.stopDevelopmentMockData();
    
    // Generate mock market data updates every 2-5 seconds
    const generateMockUpdate = () => {
      const symbols = Array.from(this.subscriptions.keys());
      if (symbols.length === 0) return;

      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const basePrice = 100 + Math.random() * 200; // $100-$300
      const change = (Math.random() - 0.5) * 10; // -$5 to +$5
      const changePercent = (change / basePrice) * 100;

      const mockUpdate: MarketDataUpdate = {
        symbol,
        price: basePrice + change,
        change,
        changePercent,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        timestamp: new Date().toISOString(),
      };

      this.handleMarketDataUpdate({ ...mockUpdate, type: 'market_data' });
    };

    this.developmentMockTimer = setInterval(generateMockUpdate, 3000);
    console.log('[WebSocketService] Mock data simulation started');
  }

  private stopDevelopmentMockData(): void {
    if (this.developmentMockTimer) {
      clearInterval(this.developmentMockTimer);
      this.developmentMockTimer = null;
    }
  }
}

// Export singleton instance
export const webSocketService = WebSocketService.getInstance();

// Auto-connect when service is imported (optional)
// webSocketService.connect().catch(console.error);

// Export convenience functions
export const subscribeToSymbol = (symbol: string, callback: MarketDataCallback) => 
  webSocketService.subscribe(symbol, callback);

export const subscribeToWatchlist = (watchlistItems: WatchlistItem[], callback: MarketDataCallback) => 
  webSocketService.subscribeToWatchlist(watchlistItems, callback);

export const connectToMarketData = () => 
  webSocketService.connect();

export const disconnectFromMarketData = () => 
  webSocketService.disconnect(); 