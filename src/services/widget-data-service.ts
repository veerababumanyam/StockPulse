/**
 * Widget Data Subscription Service
 * Manages real-time data flow to widgets with smart caching and subscription management
 */

import { WidgetType, WidgetData } from '../types/dashboard';

// Data subscription configuration
export interface DataSubscription {
  widgetId: string;
  widgetType: WidgetType;
  dataSource: string;
  refreshInterval: number;
  isActive: boolean;
  lastFetched?: Date;
  nextRefresh?: Date;
  retryCount: number;
  maxRetries: number;
}

// Data cache entry
export interface CacheEntry {
  data: any;
  timestamp: Date;
  expiry: Date;
  subscribers: Set<string>;
  isLoading: boolean;
  error?: string;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'data' | 'error' | 'ping' | 'subscription' | 'unsubscription';
  widgetType?: WidgetType;
  dataSource?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}

// Data fetch options
export interface DataFetchOptions {
  forceRefresh?: boolean;
  timeout?: number;
  retryOnError?: boolean;
  cacheStrategy?: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
}

// Event callbacks
export interface DataServiceCallbacks {
  onDataUpdate?: (widgetId: string, data: WidgetData) => void;
  onError?: (widgetId: string, error: string) => void;
  onConnectionChange?: (isConnected: boolean) => void;
  onSubscriptionChange?: (widgetId: string, isSubscribed: boolean) => void;
}

// Widget data service class
class WidgetDataService {
  private subscriptions: Map<string, DataSubscription> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private websocket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();
  private callbacks: DataServiceCallbacks = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  private wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

  constructor() {
    this.initializeWebSocket();
    this.startCacheCleanup();
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: Partial<DataServiceCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Subscribe widget to data updates
   */
  subscribe(
    widgetId: string,
    widgetType: WidgetType,
    dataSource: string,
    refreshInterval: number = 30000
  ): void {
    const subscription: DataSubscription = {
      widgetId,
      widgetType,
      dataSource,
      refreshInterval,
      isActive: true,
      retryCount: 0,
      maxRetries: 3,
    };

    this.subscriptions.set(widgetId, subscription);
    
    // Add to cache subscribers
    const cacheKey = this.getCacheKey(widgetType, dataSource);
    const cacheEntry = this.cache.get(cacheKey);
    if (cacheEntry) {
      cacheEntry.subscribers.add(widgetId);
    }

    // Send WebSocket subscription
    this.sendWebSocketMessage({
      type: 'subscription',
      widgetType,
      dataSource,
    });

    // Start refresh timer
    this.startRefreshTimer(widgetId);

    // Fetch initial data
    this.fetchData(widgetId);

    this.callbacks.onSubscriptionChange?.(widgetId, true);
    console.log(`Widget subscribed: ${widgetId} to ${dataSource}`);
  }

  /**
   * Unsubscribe widget from data updates
   */
  unsubscribe(widgetId: string): void {
    const subscription = this.subscriptions.get(widgetId);
    if (!subscription) return;

    // Remove from cache subscribers
    const cacheKey = this.getCacheKey(subscription.widgetType, subscription.dataSource);
    const cacheEntry = this.cache.get(cacheKey);
    if (cacheEntry) {
      cacheEntry.subscribers.delete(widgetId);
      
      // Clean up cache if no more subscribers
      if (cacheEntry.subscribers.size === 0) {
        this.cache.delete(cacheKey);
      }
    }

    // Stop refresh timer
    this.stopRefreshTimer(widgetId);

    // Send WebSocket unsubscription
    this.sendWebSocketMessage({
      type: 'unsubscription',
      widgetType: subscription.widgetType,
      dataSource: subscription.dataSource,
    });

    this.subscriptions.delete(widgetId);
    this.callbacks.onSubscriptionChange?.(widgetId, false);
    console.log(`Widget unsubscribed: ${widgetId}`);
  }

  /**
   * Fetch data for widget
   */
  async fetchData(widgetId: string, options: DataFetchOptions = {}): Promise<WidgetData | null> {
    const subscription = this.subscriptions.get(widgetId);
    if (!subscription) return null;

    const {
      forceRefresh = false,
      timeout = 10000,
      retryOnError = true,
      cacheStrategy = 'cache-first'
    } = options;

    const cacheKey = this.getCacheKey(subscription.widgetType, subscription.dataSource);
    
    try {
      // Check cache first (unless network-only)
      if (cacheStrategy !== 'network-only' && !forceRefresh) {
        const cached = this.getCachedData(cacheKey);
        if (cached && (cacheStrategy === 'cache-only' || cacheStrategy === 'cache-first')) {
          const widgetData: WidgetData = {
            widgetId,
            data: cached.data,
            isLoading: false,
            lastFetched: cached.timestamp,
            nextRefresh: new Date(Date.now() + subscription.refreshInterval),
          };
          
          this.callbacks.onDataUpdate?.(widgetId, widgetData);
          return widgetData;
        }
      }

      // Skip network fetch if cache-only
      if (cacheStrategy === 'cache-only') {
        return null;
      }

      // Set loading state
      this.updateCacheEntry(cacheKey, {
        isLoading: true,
        error: undefined,
      });

      const loadingData: WidgetData = {
        widgetId,
        data: null,
        isLoading: true,
      };
      this.callbacks.onDataUpdate?.(widgetId, loadingData);

      // Fetch from network
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(
        `${this.baseUrl}/api/v1/widgets/${subscription.widgetType}/data?source=${subscription.dataSource}`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const now = new Date();

      // Update cache
      this.updateCacheEntry(cacheKey, {
        data: data.data || data,
        timestamp: now,
        expiry: new Date(now.getTime() + subscription.refreshInterval),
        isLoading: false,
        error: undefined,
      });

      // Update subscription
      subscription.lastFetched = now;
      subscription.nextRefresh = new Date(now.getTime() + subscription.refreshInterval);
      subscription.retryCount = 0;

      const widgetData: WidgetData = {
        widgetId,
        data: data.data || data,
        isLoading: false,
        lastFetched: now,
        nextRefresh: subscription.nextRefresh,
      };

      this.callbacks.onDataUpdate?.(widgetId, widgetData);
      return widgetData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to fetch data for widget ${widgetId}:`, errorMessage);

      // Update cache with error
      this.updateCacheEntry(cacheKey, {
        isLoading: false,
        error: errorMessage,
      });

      // Handle retries
      if (retryOnError && subscription.retryCount < subscription.maxRetries) {
        subscription.retryCount++;
        const retryDelay = Math.min(1000 * Math.pow(2, subscription.retryCount), 30000);
        
        setTimeout(() => {
          this.fetchData(widgetId, { ...options, retryOnError: false });
        }, retryDelay);
      }

      const errorData: WidgetData = {
        widgetId,
        data: null,
        isLoading: false,
        error: errorMessage,
      };

      this.callbacks.onDataUpdate?.(widgetId, errorData);
      this.callbacks.onError?.(widgetId, errorMessage);
      return errorData;
    }
  }

  /**
   * Get cached data
   */
  getCachedData(cacheKey: string): CacheEntry | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;

    // Check if expired
    if (entry.expiry < new Date()) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry;
  }

  /**
   * Update cache entry
   */
  private updateCacheEntry(cacheKey: string, updates: Partial<CacheEntry>): void {
    const existing = this.cache.get(cacheKey) || {
      data: null,
      timestamp: new Date(),
      expiry: new Date(),
      subscribers: new Set(),
      isLoading: false,
    };

    this.cache.set(cacheKey, { ...existing, ...updates });
  }

  /**
   * Get cache key
   */
  private getCacheKey(widgetType: WidgetType, dataSource: string): string {
    return `${widgetType}:${dataSource}`;
  }

  /**
   * Start refresh timer for widget
   */
  private startRefreshTimer(widgetId: string): void {
    const subscription = this.subscriptions.get(widgetId);
    if (!subscription) return;

    this.stopRefreshTimer(widgetId);

    const timer = setInterval(() => {
      if (subscription.isActive) {
        this.fetchData(widgetId);
      }
    }, subscription.refreshInterval);

    this.refreshTimers.set(widgetId, timer);
  }

  /**
   * Stop refresh timer for widget
   */
  private stopRefreshTimer(widgetId: string): void {
    const timer = this.refreshTimers.get(widgetId);
    if (timer) {
      clearInterval(timer);
      this.refreshTimers.delete(widgetId);
    }
  }

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket(): void {
    try {
      this.websocket = new WebSocket(this.wsUrl);

      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.callbacks.onConnectionChange?.(true);

        // Resubscribe to all active subscriptions
        this.subscriptions.forEach(subscription => {
          this.sendWebSocketMessage({
            type: 'subscription',
            widgetType: subscription.widgetType,
            dataSource: subscription.dataSource,
          });
        });
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.callbacks.onConnectionChange?.(false);
        this.scheduleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket message
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'data':
        if (message.widgetType && message.dataSource && message.data) {
          this.handleRealTimeData(message.widgetType, message.dataSource, message.data);
        }
        break;

      case 'error':
        console.error('WebSocket error message:', message.error);
        break;

      case 'ping':
        this.sendWebSocketMessage({ type: 'ping' });
        break;

      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  /**
   * Handle real-time data update
   */
  private handleRealTimeData(widgetType: WidgetType, dataSource: string, data: any): void {
    const cacheKey = this.getCacheKey(widgetType, dataSource);
    const cacheEntry = this.cache.get(cacheKey);
    
    if (cacheEntry) {
      const now = new Date();
      
      // Update cache
      this.updateCacheEntry(cacheKey, {
        data,
        timestamp: now,
        expiry: new Date(now.getTime() + 300000), // 5 minutes
        isLoading: false,
        error: undefined,
      });

      // Notify all subscribers
      cacheEntry.subscribers.forEach(widgetId => {
        const subscription = this.subscriptions.get(widgetId);
        if (subscription) {
          subscription.lastFetched = now;
          
          const widgetData: WidgetData = {
            widgetId,
            data,
            isLoading: false,
            lastFetched: now,
            nextRefresh: subscription.nextRefresh,
          };

          this.callbacks.onDataUpdate?.(widgetId, widgetData);
        }
      });
    }
  }

  /**
   * Send WebSocket message
   */
  private sendWebSocketMessage(message: WebSocketMessage): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  /**
   * Schedule WebSocket reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.initializeWebSocket();
    }, delay);
  }

  /**
   * Start cache cleanup timer
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = new Date();
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiry < now || entry.subscribers.size === 0) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  /**
   * Pause subscription
   */
  pauseSubscription(widgetId: string): void {
    const subscription = this.subscriptions.get(widgetId);
    if (subscription) {
      subscription.isActive = false;
      this.stopRefreshTimer(widgetId);
    }
  }

  /**
   * Resume subscription
   */
  resumeSubscription(widgetId: string): void {
    const subscription = this.subscriptions.get(widgetId);
    if (subscription) {
      subscription.isActive = true;
      this.startRefreshTimer(widgetId);
      this.fetchData(widgetId);
    }
  }

  /**
   * Update subscription refresh interval
   */
  updateRefreshInterval(widgetId: string, interval: number): void {
    const subscription = this.subscriptions.get(widgetId);
    if (subscription) {
      subscription.refreshInterval = interval;
      if (subscription.isActive) {
        this.startRefreshTimer(widgetId);
      }
    }
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus(widgetId: string): DataSubscription | null {
    return this.subscriptions.get(widgetId) || null;
  }

  /**
   * Get all active subscriptions
   */
  getActiveSubscriptions(): DataSubscription[] {
    return Array.from(this.subscriptions.values()).filter(sub => sub.isActive);
  }

  /**
   * Clear all subscriptions and cache
   */
  clear(): void {
    // Unsubscribe all widgets
    Array.from(this.subscriptions.keys()).forEach(widgetId => {
      this.unsubscribe(widgetId);
    });

    // Clear cache
    this.cache.clear();

    // Close WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { isConnected: boolean; reconnectAttempts: number } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Export singleton instance
export const widgetDataService = new WidgetDataService();

// Export utility functions
export const subscribeWidget = (
  widgetId: string,
  widgetType: WidgetType,
  dataSource: string,
  refreshInterval?: number
) => widgetDataService.subscribe(widgetId, widgetType, dataSource, refreshInterval);

export const unsubscribeWidget = (widgetId: string) => widgetDataService.unsubscribe(widgetId);

export const fetchWidgetData = (widgetId: string, options?: DataFetchOptions) =>
  widgetDataService.fetchData(widgetId, options);

export const setDataServiceCallbacks = (callbacks: Partial<DataServiceCallbacks>) =>
  widgetDataService.setCallbacks(callbacks); 