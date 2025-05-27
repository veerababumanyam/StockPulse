import { useState, useEffect, useRef } from 'react';
import { useTelemetry, SpanContext } from '../contexts/TelemetryContext';
import { useGovernance } from '../contexts/GovernanceContext';

// Define the connection pool interface
interface ConnectionPool {
  id: string;
  serverUrl: string;
  maxConnections: number;
  activeConnections: number;
  idleConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  status: 'active' | 'draining' | 'closed';
  lastError?: string;
  createdAt: number;
  connections: PooledConnection[];
}

// Define the pooled connection interface
interface PooledConnection {
  id: string;
  status: 'idle' | 'active' | 'closing';
  createdAt: number;
  lastUsed: number;
  usageCount: number;
  currentOperation?: string;
}

// Define the cache entry interface
interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt: number;
  hitCount: number;
}

// Define the rate limiter interface
interface RateLimiter {
  id: string;
  serverUrl: string;
  maxRequestsPerMinute: number;
  currentRequests: number;
  windowStartTime: number;
  isThrottled: boolean;
  throttledUntil?: number;
}

/**
 * Hook for optimizing MCP performance with connection pooling, caching, and rate limiting
 */
export const useMCPPerformance = () => {
  const telemetry = useTelemetry();
  const governance = useGovernance();
  
  // Connection pools
  const [connectionPools, setConnectionPools] = useState<Record<string, ConnectionPool>>({});
  
  // Cache
  const [cacheHits, setCacheHits] = useState(0);
  const [cacheMisses, setCacheMisses] = useState(0);
  const cacheRef = useRef<Record<string, CacheEntry<any>>>({});
  
  // Rate limiters
  const [rateLimiters, setRateLimiters] = useState<Record<string, RateLimiter>>({});
  
  // Serialization performance metrics
  const [serializationMetrics, setSerializationMetrics] = useState({
    totalSerializationTime: 0,
    totalDeserializationTime: 0,
    serializationCount: 0,
    deserializationCount: 0,
    averageSerializationTime: 0,
    averageDeserializationTime: 0
  });
  
  // Clean up idle connections periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Clean up idle connections
      setConnectionPools(prev => {
        const updated = { ...prev };
        
        Object.keys(updated).forEach(poolId => {
          const pool = updated[poolId];
          
          // Filter out connections that have been idle for too long
          const newConnections = pool.connections.filter(conn => {
            if (conn.status === 'idle' && now - conn.lastUsed > pool.idleTimeout) {
              // Connection has been idle for too long, close it
              return false;
            }
            return true;
          });
          
          // Update pool with filtered connections
          updated[poolId] = {
            ...pool,
            connections: newConnections,
            idleConnections: newConnections.filter(c => c.status === 'idle').length,
            activeConnections: newConnections.filter(c => c.status === 'active').length
          };
        });
        
        return updated;
      });
      
      // Clean up expired cache entries
      const cache = cacheRef.current;
      const newCache: Record<string, CacheEntry<any>> = {};
      let expiredCount = 0;
      
      Object.keys(cache).forEach(key => {
        if (cache[key].expiresAt > now) {
          newCache[key] = cache[key];
        } else {
          expiredCount++;
        }
      });
      
      if (expiredCount > 0) {
        cacheRef.current = newCache;
      }
      
      // Reset rate limiters for new time windows
      setRateLimiters(prev => {
        const updated = { ...prev };
        
        Object.keys(updated).forEach(limiterId => {
          const limiter = updated[limiterId];
          
          // Check if current time window has expired
          if (now - limiter.windowStartTime > 60000) {
            // Start a new time window
            updated[limiterId] = {
              ...limiter,
              currentRequests: 0,
              windowStartTime: now,
              isThrottled: false,
              throttledUntil: undefined
            };
          }
          
          // Check if throttling period has expired
          if (limiter.isThrottled && limiter.throttledUntil && now > limiter.throttledUntil) {
            updated[limiterId] = {
              ...limiter,
              isThrottled: false,
              throttledUntil: undefined
            };
          }
        });
        
        return updated;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  /**
   * Create a new connection pool for an MCP server
   * 
   * @param serverUrl - URL of the MCP server
   * @param options - Pool configuration options
   * @returns The created connection pool
   */
  const createConnectionPool = (
    serverUrl: string, 
    options: {
      maxConnections?: number;
      connectionTimeout?: number;
      idleTimeout?: number;
    } = {}
  ): ConnectionPool => {
    const span = telemetry.startSpan('mcp.performance.create_pool', {
      'mcp.server.url': serverUrl
    });
    
    const poolId = `pool-${serverUrl.replace(/[^a-zA-Z0-9]/g, '-')}`;
    
    // Check if pool already exists
    if (connectionPools[poolId]) {
      telemetry.endSpan(span);
      return connectionPools[poolId];
    }
    
    const pool: ConnectionPool = {
      id: poolId,
      serverUrl,
      maxConnections: options.maxConnections || 10,
      activeConnections: 0,
      idleConnections: 0,
      connectionTimeout: options.connectionTimeout || 30000,
      idleTimeout: options.idleTimeout || 60000,
      status: 'active',
      createdAt: Date.now(),
      connections: []
    };
    
    setConnectionPools(prev => ({
      ...prev,
      [poolId]: pool
    }));
    
    telemetry.addEvent(span, 'mcp.performance.pool_created', {
      'mcp.pool.id': poolId,
      'mcp.pool.max_connections': pool.maxConnections
    });
    
    telemetry.endSpan(span);
    
    // Record in governance
    governance.recordAudit({
      actor: 'system',
      action: 'create_connection_pool',
      resource: serverUrl,
      outcome: 'success',
      details: `Created connection pool for ${serverUrl} with max ${pool.maxConnections} connections`,
      severity: 'info',
      tags: ['mcp', 'performance', 'connection_pool']
    });
    
    return pool;
  };
  
  /**
   * Get a connection from the pool
   * 
   * @param poolId - ID of the connection pool
   * @param operation - Operation to be performed with the connection
   * @returns A promise that resolves to a pooled connection
   */
  const getConnection = async (poolId: string, operation: string): Promise<PooledConnection> => {
    const span = telemetry.startSpan('mcp.performance.get_connection', {
      'mcp.pool.id': poolId,
      'mcp.operation': operation
    });
    
    return new Promise((resolve, reject) => {
      const pool = connectionPools[poolId];
      
      if (!pool) {
        telemetry.recordException(span, new Error(`Connection pool ${poolId} not found`));
        telemetry.endSpan(span);
        reject(new Error(`Connection pool ${poolId} not found`));
        return;
      }
      
      if (pool.status !== 'active') {
        telemetry.recordException(span, new Error(`Connection pool ${poolId} is not active`));
        telemetry.endSpan(span);
        reject(new Error(`Connection pool ${poolId} is not active`));
        return;
      }
      
      // Check if there are idle connections available
      const idleConnection = pool.connections.find(conn => conn.status === 'idle');
      
      if (idleConnection) {
        // Use an existing idle connection
        const updatedConnection: PooledConnection = {
          ...idleConnection,
          status: 'active',
          lastUsed: Date.now(),
          usageCount: idleConnection.usageCount + 1,
          currentOperation: operation
        };
        
        // Update the connection in the pool
        setConnectionPools(prev => {
          const updatedPool = { ...prev[poolId] };
          updatedPool.connections = updatedPool.connections.map(conn => 
            conn.id === idleConnection.id ? updatedConnection : conn
          );
          updatedPool.activeConnections++;
          updatedPool.idleConnections--;
          
          return {
            ...prev,
            [poolId]: updatedPool
          };
        });
        
        telemetry.addEvent(span, 'mcp.performance.reused_connection', {
          'mcp.connection.id': idleConnection.id,
          'mcp.connection.usage_count': updatedConnection.usageCount
        });
        
        telemetry.endSpan(span);
        resolve(updatedConnection);
        return;
      }
      
      // No idle connections available, check if we can create a new one
      if (pool.connections.length < pool.maxConnections) {
        // Create a new connection
        const newConnection: PooledConnection = {
          id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          status: 'active',
          createdAt: Date.now(),
          lastUsed: Date.now(),
          usageCount: 1,
          currentOperation: operation
        };
        
        // Add the new connection to the pool
        setConnectionPools(prev => {
          const updatedPool = { ...prev[poolId] };
          updatedPool.connections = [...updatedPool.connections, newConnection];
          updatedPool.activeConnections++;
          
          return {
            ...prev,
            [poolId]: updatedPool
          };
        });
        
        telemetry.addEvent(span, 'mcp.performance.created_connection', {
          'mcp.connection.id': newConnection.id
        });
        
        telemetry.endSpan(span);
        resolve(newConnection);
        return;
      }
      
      // Pool is at capacity, wait for a connection to become available
      // In a real implementation, this would use a queue and timeout
      telemetry.addEvent(span, 'mcp.performance.waiting_for_connection', {
        'mcp.pool.id': poolId,
        'mcp.pool.active_connections': pool.activeConnections
      });
      
      // Simulate waiting for a connection
      setTimeout(() => {
        // Try again after a delay
        getConnection(poolId, operation)
          .then(connection => {
            telemetry.endSpan(span);
            resolve(connection);
          })
          .catch(error => {
            telemetry.recordException(span, error);
            telemetry.endSpan(span);
            reject(error);
          });
      }, 500);
    });
  };
  
  /**
   * Release a connection back to the pool
   * 
   * @param poolId - ID of the connection pool
   * @param connectionId - ID of the connection to release
   */
  const releaseConnection = (poolId: string, connectionId: string): void => {
    const span = telemetry.startSpan('mcp.performance.release_connection', {
      'mcp.pool.id': poolId,
      'mcp.connection.id': connectionId
    });
    
    const pool = connectionPools[poolId];
    
    if (!pool) {
      telemetry.recordException(span, new Error(`Connection pool ${poolId} not found`));
      telemetry.endSpan(span);
      return;
    }
    
    const connection = pool.connections.find(conn => conn.id === connectionId);
    
    if (!connection) {
      telemetry.recordException(span, new Error(`Connection ${connectionId} not found in pool ${poolId}`));
      telemetry.endSpan(span);
      return;
    }
    
    // Update the connection status
    const updatedConnection: PooledConnection = {
      ...connection,
      status: 'idle',
      lastUsed: Date.now(),
      currentOperation: undefined
    };
    
    // Update the connection in the pool
    setConnectionPools(prev => {
      const updatedPool = { ...prev[poolId] };
      updatedPool.connections = updatedPool.connections.map(conn => 
        conn.id === connectionId ? updatedConnection : conn
      );
      updatedPool.activeConnections--;
      updatedPool.idleConnections++;
      
      return {
        ...prev,
        [poolId]: updatedPool
      };
    });
    
    telemetry.addEvent(span, 'mcp.performance.released_connection', {
      'mcp.connection.id': connectionId,
      'mcp.connection.usage_count': updatedConnection.usageCount
    });
    
    telemetry.endSpan(span);
  };
  
  /**
   * Close a connection pool
   * 
   * @param poolId - ID of the connection pool to close
   */
  const closeConnectionPool = (poolId: string): void => {
    const span = telemetry.startSpan('mcp.performance.close_pool', {
      'mcp.pool.id': poolId
    });
    
    const pool = connectionPools[poolId];
    
    if (!pool) {
      telemetry.recordException(span, new Error(`Connection pool ${poolId} not found`));
      telemetry.endSpan(span);
      return;
    }
    
    // Update the pool status to draining
    setConnectionPools(prev => ({
      ...prev,
      [poolId]: {
        ...prev[poolId],
        status: 'draining'
      }
    }));
    
    // Close all idle connections immediately
    setConnectionPools(prev => {
      const updatedPool = { ...prev[poolId] };
      updatedPool.connections = updatedPool.connections.filter(conn => conn.status !== 'idle');
      updatedPool.idleConnections = 0;
      
      return {
        ...prev,
        [poolId]: updatedPool
      };
    });
    
    // Wait for active connections to finish
    const checkActiveConnections = () => {
      const currentPool = connectionPools[poolId];
      
      if (!currentPool || currentPool.activeConnections === 0) {
        // All connections are closed, remove the pool
        setConnectionPools(prev => {
          const updated = { ...prev };
          delete updated[poolId];
          return updated;
        });
        
        telemetry.addEvent(span, 'mcp.performance.pool_closed', {
          'mcp.pool.id': poolId
        });
        
        telemetry.endSpan(span);
        
        // Record in governance
        governance.recordAudit({
          actor: 'system',
          action: 'close_connection_pool',
          resource: pool.serverUrl,
          outcome: 'success',
          details: `Closed connection pool for ${pool.serverUrl}`,
          severity: 'info',
          tags: ['mcp', 'performance', 'connection_pool']
        });
        
        return;
      }
      
      // Check again after a delay
      setTimeout(checkActiveConnections, 1000);
    };
    
    checkActiveConnections();
  };
  
  /**
   * Set a value in the cache
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlMs - Time to live in milliseconds
   */
  const setCacheValue = <T>(key: string, value: T, ttlMs: number = 60000): void => {
    const span = telemetry.startSpan('mcp.performance.set_cache', {
      'mcp.cache.key': key,
      'mcp.cache.ttl': ttlMs
    });
    
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: now,
      expiresAt: now + ttlMs,
      hitCount: 0
    };
    
    cacheRef.current[key] = entry;
    
    telemetry.addEvent(span, 'mcp.performance.cache_set', {
      'mcp.cache.key': key,
      'mcp.cache.expires_at': entry.expiresAt
    });
    
    telemetry.endSpan(span);
  };
  
  /**
   * Get a value from the cache
   * 
   * @param key - Cache key
   * @returns The cached value, or undefined if not found or expired
   */
  const getCacheValue = <T>(key: string): T | undefined => {
    const span = telemetry.startSpan('mcp.performance.get_cache', {
      'mcp.cache.key': key
    });
    
    const now = Date.now();
    const entry = cacheRef.current[key] as CacheEntry<T> | undefined;
    
    if (!entry || entry.expiresAt <= now) {
      // Cache miss
      setCacheMisses(prev => prev + 1);
      
      telemetry.addEvent(span, 'mcp.performance.cache_miss', {
        'mcp.cache.key': key
      });
      
      telemetry.endSpan(span);
      return undefined;
    }
    
    // Cache hit
    setCacheHits(prev => prev + 1);
    
    // Update hit count
    entry.hitCount++;
    cacheRef.current[key] = entry;
    
    telemetry.addEvent(span, 'mcp.performance.cache_hit', {
      'mcp.cache.key': key,
      'mcp.cache.hit_count': entry.hitCount
    });
    
    telemetry.endSpan(span);
    return entry.value;
  };
  
  /**
   * Clear a specific cache entry
   * 
   * @param key - Cache key to clear
   */
  const clearCacheValue = (key: string): void => {
    const span = telemetry.startSpan('mcp.performance.clear_cache', {
      'mcp.cache.key': key
    });
    
    if (cacheRef.current[key]) {
      delete cacheRef.current[key];
      
      telemetry.addEvent(span, 'mcp.performance.cache_cleared', {
        'mcp.cache.key': key
      });
    }
    
    telemetry.endSpan(span);
  };
  
  /**
   * Clear all cache entries
   */
  const clearCache = (): void => {
    const span = telemetry.startSpan('mcp.performance.clear_all_cache');
    
    const count = Object.keys(cacheRef.current).length;
    cacheRef.current = {};
    
    telemetry.addEvent(span, 'mcp.performance.cache_all_cleared', {
      'mcp.cache.count': count
    });
    
    telemetry.endSpan(span);
    
    // Record in governance
    governance.recordAudit({
      actor: 'system',
      action: 'clear_cache',
      resource: 'mcp_cache',
      outcome: 'success',
      details: `Cleared ${count} cache entries`,
      severity: 'info',
      tags: ['mcp', 'performance', 'cache']
    });
  };
  
  /**
   * Create a rate limiter for an MCP server
   * 
   * @param serverUrl - URL of the MCP server
   * @param maxRequestsPerMinute - Maximum requests allowed per minute
   * @returns The created rate limiter
   */
  const createRateLimiter = (
    serverUrl: string,
    maxRequestsPerMinute: number
  ): RateLimiter => {
    const span = telemetry.startSpan('mcp.performance.create_rate_limiter', {
      'mcp.server.url': serverUrl,
      'mcp.rate_limiter.max_requests': maxRequestsPerMinute
    });
    
    const limiterId = `limiter-${serverUrl.replace(/[^a-zA-Z0-9]/g, '-')}`;
    
    // Check if limiter already exists
    if (rateLimiters[limiterId]) {
      telemetry.endSpan(span);
      return rateLimiters[limiterId];
    }
    
    const limiter: RateLimiter = {
      id: limiterId,
      serverUrl,
      maxRequestsPerMinute,
      currentRequests: 0,
      windowStartTime: Date.now(),
      isThrottled: false
    };
    
    setRateLimiters(prev => ({
      ...prev,
      [limiterId]: limiter
    }));
    
    telemetry.addEvent(span, 'mcp.performance.rate_limiter_created', {
      'mcp.rate_limiter.id': limiterId,
      'mcp.rate_limiter.max_requests': maxRequestsPerMinute
    });
    
    telemetry.endSpan(span);
    
    // Record in governance
    governance.recordAudit({
      actor: 'system',
      action: 'create_rate_limiter',
      resource: serverUrl,
      outcome: 'success',
      details: `Created rate limiter for ${serverUrl} with max ${maxRequestsPerMinute} requests per minute`,
      severity: 'info',
      tags: ['mcp', 'performance', 'rate_limiter']
    });
    
    return limiter;
  };
  
  /**
   * Check if a request is allowed by the rate limiter
   * 
   * @param limiterId - ID of the rate limiter
   * @returns True if the request is allowed, false if it should be throttled
   */
  const checkRateLimit = (limiterId: string): boolean => {
    const span = telemetry.startSpan('mcp.performance.check_rate_limit', {
      'mcp.rate_limiter.id': limiterId
    });
    
    const limiter = rateLimiters[limiterId];
    
    if (!limiter) {
      telemetry.recordException(span, new Error(`Rate limiter ${limiterId} not found`));
      telemetry.endSpan(span);
      return true; // Allow if limiter doesn't exist
    }
    
    // Check if currently throttled
    if (limiter.isThrottled) {
      telemetry.addEvent(span, 'mcp.performance.request_throttled', {
        'mcp.rate_limiter.id': limiterId
      });
      
      telemetry.endSpan(span);
      return false;
    }
    
    const now = Date.now();
    
    // Check if current time window has expired
    if (now - limiter.windowStartTime > 60000) {
      // Start a new time window
      setRateLimiters(prev => ({
        ...prev,
        [limiterId]: {
          ...prev[limiterId],
          currentRequests: 1, // Count this request
          windowStartTime: now
        }
      }));
      
      telemetry.addEvent(span, 'mcp.performance.new_rate_window', {
        'mcp.rate_limiter.id': limiterId
      });
      
      telemetry.endSpan(span);
      return true;
    }
    
    // Check if we've exceeded the limit
    if (limiter.currentRequests >= limiter.maxRequestsPerMinute) {
      // Throttle until the end of the current window
      const throttleTime = 60000 - (now - limiter.windowStartTime);
      
      setRateLimiters(prev => ({
        ...prev,
        [limiterId]: {
          ...prev[limiterId],
          isThrottled: true,
          throttledUntil: now + throttleTime
        }
      }));
      
      telemetry.addEvent(span, 'mcp.performance.rate_limit_exceeded', {
        'mcp.rate_limiter.id': limiterId,
        'mcp.rate_limiter.current_requests': limiter.currentRequests,
        'mcp.rate_limiter.throttle_time': throttleTime
      });
      
      telemetry.endSpan(span);
      
      // Record in governance
      governance.recordAudit({
        actor: 'system',
        action: 'rate_limit_exceeded',
        resource: limiter.serverUrl,
        outcome: 'failure',
        details: `Rate limit exceeded for ${limiter.serverUrl}: ${limiter.currentRequests}/${limiter.maxRequestsPerMinute} requests`,
        severity: 'warning',
        tags: ['mcp', 'performance', 'rate_limiter']
      });
      
      return false;
    }
    
    // Increment the request count
    setRateLimiters(prev => ({
      ...prev,
      [limiterId]: {
        ...prev[limiterId],
        currentRequests: prev[limiterId].currentRequests + 1
      }
    }));
    
    telemetry.addEvent(span, 'mcp.performance.request_allowed', {
      'mcp.rate_limiter.id': limiterId,
      'mcp.rate_limiter.current_requests': limiter.currentRequests + 1
    });
    
    telemetry.endSpan(span);
    return true;
  };
  
  /**
   * Serialize data with performance tracking
   * 
   * @param data - Data to serialize
   * @returns Serialized data string
   */
  const serializeWithPerformance = <T>(data: T): string => {
    const span = telemetry.startSpan('mcp.performance.serialize');
    
    const startTime = performance.now();
    let result: string;
    
    try {
      result = JSON.stringify(data);
    } catch (error) {
      telemetry.recordException(span, error as Error);
      telemetry.endSpan(span);
      throw error;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Update serialization metrics
    setSerializationMetrics(prev => {
      const newCount = prev.serializationCount + 1;
      const newTotal = prev.totalSerializationTime + duration;
      
      return {
        ...prev,
        totalSerializationTime: newTotal,
        serializationCount: newCount,
        averageSerializationTime: newTotal / newCount
      };
    });
    
    telemetry.addEvent(span, 'mcp.performance.serialization_complete', {
      'mcp.serialization.duration': duration,
      'mcp.serialization.size': result.length
    });
    
    telemetry.endSpan(span);
    return result;
  };
  
  /**
   * Deserialize data with performance tracking
   * 
   * @param data - Serialized data string
   * @returns Deserialized data
   */
  const deserializeWithPerformance = <T>(data: string): T => {
    const span = telemetry.startSpan('mcp.performance.deserialize');
    
    const startTime = performance.now();
    let result: T;
    
    try {
      result = JSON.parse(data) as T;
    } catch (error) {
      telemetry.recordException(span, error as Error);
      telemetry.endSpan(span);
      throw error;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Update deserialization metrics
    setSerializationMetrics(prev => {
      const newCount = prev.deserializationCount + 1;
      const newTotal = prev.totalDeserializationTime + duration;
      
      return {
        ...prev,
        totalDeserializationTime: newTotal,
        deserializationCount: newCount,
        averageDeserializationTime: newTotal / newCount
      };
    });
    
    telemetry.addEvent(span, 'mcp.performance.deserialization_complete', {
      'mcp.deserialization.duration': duration,
      'mcp.deserialization.size': data.length
    });
    
    telemetry.endSpan(span);
    return result;
  };
  
  /**
   * Get performance metrics
   * 
   * @returns Current performance metrics
   */
  const getPerformanceMetrics = () => {
    return {
      connectionPools: Object.values(connectionPools),
      cacheMetrics: {
        entries: Object.keys(cacheRef.current).length,
        hits: cacheHits,
        misses: cacheMisses,
        hitRate: cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0
      },
      rateLimiters: Object.values(rateLimiters),
      serializationMetrics
    };
  };
  
  return {
    // Connection pooling
    createConnectionPool,
    getConnection,
    releaseConnection,
    closeConnectionPool,
    
    // Caching
    setCacheValue,
    getCacheValue,
    clearCacheValue,
    clearCache,
    
    // Rate limiting
    createRateLimiter,
    checkRateLimit,
    
    // Serialization
    serializeWithPerformance,
    deserializeWithPerformance,
    
    // Metrics
    getPerformanceMetrics
  };
};

export default useMCPPerformance;
