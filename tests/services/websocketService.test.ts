/**
 * WebSocketService Tests
 * Tests for Story 2.4 - WebSocket Service functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  webSocketService,
  WebSocketService,
  MarketDataUpdate,
} from "../../src/services/websocketService";
import { WatchlistItem } from "../../src/types/widget-data";

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public readyState: number = MockWebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    // Simulate connection opening after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event("open"));
      }
    }, 10);
  }

  send(data: string): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error("WebSocket is not open");
    }
    // Simulate successful send
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      if (this.onclose) {
        this.onclose(
          new CloseEvent("close", { code: code || 1000, reason: reason || "" }),
        );
      }
    }, 10);
  }

  // Test helpers
  simulateMessage(data: any): void {
    if (this.onmessage) {
      this.onmessage(
        new MessageEvent("message", { data: JSON.stringify(data) }),
      );
    }
  }

  simulateError(): void {
    if (this.onerror) {
      this.onerror(new Event("error"));
    }
  }

  simulateClose(code: number = 1000, reason: string = ""): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent("close", { code, reason }));
    }
  }
}

// Setup global WebSocket mock
global.WebSocket = MockWebSocket as any;

const mockWatchlistItems: WatchlistItem[] = [
  {
    id: "item1",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 185.42,
    change: 2.34,
    changePercent: 1.28,
    volume: 45678912,
    marketCap: 2890000000000,
    logoUrl: "https://logo.clearbit.com/apple.com",
  },
  {
    id: "item2",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.78,
    change: -1.56,
    changePercent: -1.08,
    volume: 23456789,
    marketCap: 1780000000000,
    logoUrl: "https://logo.clearbit.com/google.com",
  },
];

describe("WebSocketService", () => {
  let mockSocket: MockWebSocket;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();

    // Reset singleton instance
    (WebSocketService as any).instance = undefined;

    // Capture the mock socket instance
    vi.spyOn(global, "WebSocket").mockImplementation((url: string) => {
      mockSocket = new MockWebSocket(url);
      return mockSocket as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();

    // Cleanup any existing connection
    webSocketService.disconnect();
  });

  describe("Singleton Pattern", () => {
    it("returns the same instance", () => {
      const instance1 = WebSocketService.getInstance();
      const instance2 = WebSocketService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("exported service is singleton instance", () => {
      const instance = WebSocketService.getInstance();
      expect(webSocketService).toBe(instance);
    });
  });

  describe("Connection Management", () => {
    it("connects to WebSocket server successfully", async () => {
      const connectPromise = webSocketService.connect();

      // Fast-forward to simulate connection opening
      await vi.advanceTimersByTimeAsync(20);

      await expect(connectPromise).resolves.toBeUndefined();
      expect(webSocketService.getConnectionStatus()).toBe("connected");
    });

    it("handles connection timeout", async () => {
      // Mock WebSocket that never opens
      vi.spyOn(global, "WebSocket").mockImplementation((url: string) => {
        const socket = new MockWebSocket(url);
        socket.readyState = MockWebSocket.CONNECTING; // Never changes to OPEN
        return socket as any;
      });

      const connectPromise = webSocketService.connect();

      // Fast-forward past timeout
      await vi.advanceTimersByTimeAsync(15000);

      await expect(connectPromise).rejects.toThrow(
        "WebSocket connection timeout",
      );
    });

    it("handles connection errors", async () => {
      const connectPromise = webSocketService.connect();

      // Simulate connection error
      setTimeout(() => {
        mockSocket.simulateError();
      }, 5);

      await vi.advanceTimersByTimeAsync(20);

      await expect(connectPromise).rejects.toBeDefined();
      expect(webSocketService.getConnectionStatus()).toBe("error");
    });

    it("disconnects cleanly", async () => {
      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);

      expect(webSocketService.getConnectionStatus()).toBe("connected");

      webSocketService.disconnect();
      await vi.advanceTimersByTimeAsync(20);

      expect(webSocketService.getConnectionStatus()).toBe("disconnected");
    });

    it("does not connect if already connected", async () => {
      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);

      const connectSpy = vi.spyOn(global, "WebSocket");
      connectSpy.mockClear();

      await webSocketService.connect();

      expect(connectSpy).not.toHaveBeenCalled();
    });
  });

  describe("Subscription Management", () => {
    beforeEach(async () => {
      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);
    });

    it("subscribes to a single symbol", () => {
      const callback = vi.fn();
      const unsubscribe = webSocketService.subscribe("AAPL", callback);

      expect(typeof unsubscribe).toBe("function");

      // Verify subscription message was sent
      const sendSpy = vi.spyOn(mockSocket, "send");
      expect(sendSpy).toHaveBeenCalledWith(
        JSON.stringify({
          action: "subscribe",
          symbol: "AAPL",
        }),
      );
    });

    it("unsubscribes from a symbol", () => {
      const callback = vi.fn();
      const unsubscribe = webSocketService.subscribe("AAPL", callback);

      const sendSpy = vi.spyOn(mockSocket, "send");
      sendSpy.mockClear();

      unsubscribe();

      expect(sendSpy).toHaveBeenCalledWith(
        JSON.stringify({
          action: "unsubscribe",
          symbol: "AAPL",
        }),
      );
    });

    it("subscribes to multiple symbols from watchlist", () => {
      const callback = vi.fn();
      const unsubscribe = webSocketService.subscribeToWatchlist(
        mockWatchlistItems,
        callback,
      );

      expect(typeof unsubscribe).toBe("function");

      const sendSpy = vi.spyOn(mockSocket, "send");
      expect(sendSpy).toHaveBeenCalledTimes(2); // One for each symbol
    });

    it("handles multiple callbacks for same symbol", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      webSocketService.subscribe("AAPL", callback1);
      webSocketService.subscribe("AAPL", callback2);

      // Simulate market data update
      const update: MarketDataUpdate = {
        symbol: "AAPL",
        price: 190.5,
        change: 7.42,
        changePercent: 4.05,
        volume: 45678912,
        timestamp: new Date().toISOString(),
      };

      mockSocket.simulateMessage({
        type: "market_data",
        ...update,
      });

      expect(callback1).toHaveBeenCalledWith(update);
      expect(callback2).toHaveBeenCalledWith(update);
    });

    it("only unsubscribes from server when no callbacks remain", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsubscribe1 = webSocketService.subscribe("AAPL", callback1);
      const unsubscribe2 = webSocketService.subscribe("AAPL", callback2);

      const sendSpy = vi.spyOn(mockSocket, "send");
      sendSpy.mockClear();

      // First unsubscribe shouldn't send unsubscribe message
      unsubscribe1();
      expect(sendSpy).not.toHaveBeenCalled();

      // Second unsubscribe should send unsubscribe message
      unsubscribe2();
      expect(sendSpy).toHaveBeenCalledWith(
        JSON.stringify({
          action: "unsubscribe",
          symbol: "AAPL",
        }),
      );
    });
  });

  describe("Message Handling", () => {
    let callback: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);

      callback = vi.fn();
      webSocketService.subscribe("AAPL", callback);
    });

    it("handles market data updates", () => {
      const update = {
        type: "market_data",
        symbol: "AAPL",
        price: 190.5,
        change: 7.42,
        changePercent: 4.05,
        volume: 45678912,
        timestamp: new Date().toISOString(),
      };

      mockSocket.simulateMessage(update);

      expect(callback).toHaveBeenCalledWith({
        symbol: "AAPL",
        price: 190.5,
        change: 7.42,
        changePercent: 4.05,
        volume: 45678912,
        timestamp: update.timestamp,
      });
    });

    it("handles heartbeat messages", () => {
      const sendSpy = vi.spyOn(mockSocket, "send");

      mockSocket.simulateMessage({
        type: "heartbeat",
        timestamp: new Date().toISOString(),
      });

      expect(sendSpy).toHaveBeenCalledWith(
        expect.stringContaining('"action":"heartbeat_response"'),
      );
    });

    it("handles error messages", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockSocket.simulateMessage({
        type: "error",
        message: "Server error occurred",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "[WebSocketService] Server error:",
        "Server error occurred",
      );

      consoleSpy.mockRestore();
    });

    it("handles unknown message types", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockSocket.simulateMessage({
        type: "unknown",
        data: "some data",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "[WebSocketService] Unknown message type:",
        "unknown",
      );

      consoleSpy.mockRestore();
    });

    it("handles malformed JSON messages", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      if (mockSocket.onmessage) {
        mockSocket.onmessage(
          new MessageEvent("message", { data: "invalid json" }),
        );
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        "[WebSocketService] Failed to parse message:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("handles callback errors gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error("Callback error");
      });

      webSocketService.subscribe("AAPL", errorCallback);

      mockSocket.simulateMessage({
        type: "market_data",
        symbol: "AAPL",
        price: 190.5,
        change: 7.42,
        changePercent: 4.05,
        volume: 45678912,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "[WebSocketService] Error in callback:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Connection Status Tracking", () => {
    it("tracks connection status changes", async () => {
      const statusCallback = vi.fn();
      const unsubscribe =
        webSocketService.onConnectionStatusChange(statusCallback);

      // Should immediately call with current status
      expect(statusCallback).toHaveBeenCalledWith("disconnected");

      statusCallback.mockClear();

      // Connect
      const connectPromise = webSocketService.connect();
      expect(statusCallback).toHaveBeenCalledWith("connecting");

      await vi.advanceTimersByTimeAsync(20);
      await connectPromise;

      expect(statusCallback).toHaveBeenCalledWith("connected");

      statusCallback.mockClear();

      // Disconnect
      webSocketService.disconnect();
      await vi.advanceTimersByTimeAsync(20);

      expect(statusCallback).toHaveBeenCalledWith("disconnected");

      unsubscribe();
    });

    it("handles multiple status callbacks", async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      webSocketService.onConnectionStatusChange(callback1);
      webSocketService.onConnectionStatusChange(callback2);

      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);

      expect(callback1).toHaveBeenCalledWith("connected");
      expect(callback2).toHaveBeenCalledWith("connected");
    });

    it("handles status callback errors gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error("Status callback error");
      });

      webSocketService.onConnectionStatusChange(errorCallback);

      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);

      expect(consoleSpy).toHaveBeenCalledWith(
        "[WebSocketService] Error in status callback:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Heartbeat Management", () => {
    beforeEach(async () => {
      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);
    });

    it("sends periodic heartbeat messages", () => {
      const sendSpy = vi.spyOn(mockSocket, "send");
      sendSpy.mockClear();

      // Fast-forward past heartbeat interval
      vi.advanceTimersByTime(30000);

      expect(sendSpy).toHaveBeenCalledWith(
        expect.stringContaining('"action":"heartbeat"'),
      );
    });

    it("stops heartbeat on disconnect", () => {
      const sendSpy = vi.spyOn(mockSocket, "send");

      webSocketService.disconnect();
      sendSpy.mockClear();

      // Fast-forward past heartbeat interval
      vi.advanceTimersByTime(30000);

      expect(sendSpy).not.toHaveBeenCalled();
    });
  });

  describe("Reconnection Logic", () => {
    it("attempts reconnection after connection loss", async () => {
      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);

      const connectSpy = vi.spyOn(webSocketService, "connect");

      // Simulate connection loss
      mockSocket.simulateClose(1006, "Connection lost");
      await vi.advanceTimersByTimeAsync(20);

      expect(webSocketService.getConnectionStatus()).toBe("disconnected");

      // Fast-forward past reconnection interval
      await vi.advanceTimersByTimeAsync(5000);

      expect(connectSpy).toHaveBeenCalled();
    });

    it("stops reconnection attempts after max attempts", async () => {
      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock connect to always fail
      vi.spyOn(webSocketService, "connect").mockRejectedValue(
        new Error("Connection failed"),
      );

      // Simulate connection loss
      mockSocket.simulateClose(1006, "Connection lost");

      // Fast-forward through all reconnection attempts
      for (let i = 0; i < 6; i++) {
        await vi.advanceTimersByTimeAsync(5000);
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        "[WebSocketService] Max reconnection attempts reached",
      );

      consoleSpy.mockRestore();
    });

    it("does not attempt reconnection on normal close", async () => {
      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);

      const connectSpy = vi.spyOn(webSocketService, "connect");
      connectSpy.mockClear();

      // Normal disconnect (user initiated)
      webSocketService.disconnect();
      await vi.advanceTimersByTimeAsync(20);

      // Fast-forward past reconnection interval
      await vi.advanceTimersByTimeAsync(5000);

      expect(connectSpy).not.toHaveBeenCalled();
    });
  });

  describe("Message Sending", () => {
    beforeEach(async () => {
      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);
    });

    it("sends messages when connected", () => {
      const sendSpy = vi.spyOn(mockSocket, "send");

      webSocketService.subscribe("AAPL", vi.fn());

      expect(sendSpy).toHaveBeenCalledWith(
        JSON.stringify({
          action: "subscribe",
          symbol: "AAPL",
        }),
      );
    });

    it("handles send when not connected", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      webSocketService.disconnect();

      webSocketService.subscribe("AAPL", vi.fn());

      expect(consoleSpy).toHaveBeenCalledWith(
        "[WebSocketService] Cannot send message - not connected",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("handles WebSocket constructor errors", async () => {
      vi.spyOn(global, "WebSocket").mockImplementation(() => {
        throw new Error("WebSocket creation failed");
      });

      await expect(webSocketService.connect()).rejects.toThrow(
        "WebSocket creation failed",
      );
      expect(webSocketService.getConnectionStatus()).toBe("error");
    });

    it("cleans up properly on multiple disconnects", async () => {
      await webSocketService.connect();
      await vi.advanceTimersByTimeAsync(20);

      // Multiple disconnects should not cause errors
      webSocketService.disconnect();
      webSocketService.disconnect();
      webSocketService.disconnect();

      expect(webSocketService.getConnectionStatus()).toBe("disconnected");
    });

    it("handles subscription when not connected", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const callback = vi.fn();

      const unsubscribe = webSocketService.subscribe("AAPL", callback);

      expect(typeof unsubscribe).toBe("function");
      expect(consoleSpy).toHaveBeenCalledWith(
        "[WebSocketService] Cannot send message - not connected",
      );

      consoleSpy.mockRestore();
    });
  });
});
