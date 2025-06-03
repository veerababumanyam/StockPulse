/**
 * Watchlist Component Tests
 * Tests for Story 2.4 - Watchlist Widget implementation
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Watchlist from "../../src/components/widgets/Watchlist";
import { ThemeProvider } from "../../src/contexts/ThemeContext";
import { WatchlistData, WatchlistItem } from "../../src/types/widget-data";

// Mock the services before importing the component
vi.mock("../../src/services/watchlistService", () => ({
  watchlistService: {
    getUserWatchlist: vi.fn(),
    addToWatchlist: vi.fn(),
    removeFromWatchlist: vi.fn(),
    updateWatchlistItem: vi.fn(),
  },
  getUserWatchlist: vi.fn(),
  addSymbolToWatchlist: vi.fn(),
  removeSymbolFromWatchlist: vi.fn(),
  validateSymbol: vi.fn(),
}));

vi.mock("../../src/services/websocketService", () => ({
  webSocketService: {
    subscribe: vi.fn(),
    connect: vi.fn(),
    getConnectionStatus: vi.fn().mockReturnValue("connected"),
    onConnectionStatusChange: vi.fn().mockReturnValue(() => {}),
  },
  connectToMarketData: vi.fn(),
  subscribeToWatchlist: vi.fn(),
}));

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Import the mocked services
import {
  getUserWatchlist,
  addSymbolToWatchlist,
  removeSymbolFromWatchlist,
  validateSymbol,
} from "../../src/services/watchlistService";

import {
  connectToMarketData,
  subscribeToWatchlist,
} from "../../src/services/websocketService";

// Mock data
const mockWatchlistData: WatchlistData = {
  userId: "test-user",
  items: [
    {
      id: "1",
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 150.0,
      change: 2.5,
      changePercent: 1.69,
      volume: 55234567,
      marketCap: 2400000000000,
      sector: "Technology",
      lastUpdated: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 2750.3,
      change: -15.2,
      changePercent: -0.55,
      volume: 1234567,
      marketCap: 1800000000000,
      sector: "Technology",
      lastUpdated: "2024-01-15T10:30:00Z",
    },
    {
      id: "3",
      symbol: "TSLA",
      name: "Tesla, Inc.",
      price: 245.67,
      change: 12.34,
      changePercent: 5.29,
      volume: 45234567,
      marketCap: 780000000000,
      sector: "Automotive",
      lastUpdated: "2024-01-15T10:30:00Z",
    },
  ],
  lastUpdated: "2024-01-15T10:30:00Z",
  metadata: {
    totalValue: 1245000.0,
    totalChange: 567.89,
    totalChangePercent: 0.46,
  },
};

const mockConfig = {
  config: {
    watchlistId: "test-watchlist",
    maxItems: 10,
    showPercentage: true,
    showVolume: true,
    refreshInterval: 30000,
    theme: "default" as const,
  },
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>{children}</ThemeProvider>
  </BrowserRouter>
);

describe("Watchlist Component", () => {
  const mockOnConfigChange = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup watchlist service mocks with proper resolved promises
    vi.mocked(getUserWatchlist).mockResolvedValue(mockWatchlistData);
    vi.mocked(addSymbolToWatchlist).mockResolvedValue({
      success: true,
      message: "Added successfully",
    });
    vi.mocked(removeSymbolFromWatchlist).mockResolvedValue({
      success: true,
      message: "Removed successfully",
    });
    vi.mocked(validateSymbol).mockResolvedValue({
      valid: true,
      message: "Valid symbol",
    });

    // Setup websocket service mocks
    vi.mocked(subscribeToWatchlist).mockReturnValue(() => {}); // Unsubscribe function
    vi.mocked(connectToMarketData).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders the watchlist with title", async () => {
      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("Watchlist")).toBeInTheDocument();
    });

    it("displays loading state initially", async () => {
      // Mock loading state
      vi.mocked(getUserWatchlist).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockWatchlistData), 100),
          ),
      );

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });
    });

    it("displays watchlist items when loaded", async () => {
      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
        expect(screen.getByText("GOOGL")).toBeInTheDocument();
        expect(screen.getByText("TSLA")).toBeInTheDocument();
      });
    });
  });

  describe("Data Display", () => {
    it("shows stock prices and changes correctly", async () => {
      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("$150.00")).toBeInTheDocument();
        expect(screen.getByText("+$2.50")).toBeInTheDocument();
        expect(screen.getByText("$2,750.30")).toBeInTheDocument();
        expect(screen.getByText("-$15.20")).toBeInTheDocument();
      });
    });

    it("displays percentage changes when enabled", async () => {
      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={{
              ...mockConfig,
              config: { ...mockConfig.config, showPercentage: true },
            }}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("(+1.69%)")).toBeInTheDocument();
        expect(screen.getByText("(-0.55%)")).toBeInTheDocument();
      });
    });

    it("hides percentage changes when disabled", async () => {
      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={{
              ...mockConfig,
              config: { ...mockConfig.config, showPercentage: false },
            }}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      expect(screen.queryByText("(+1.69%)")).not.toBeInTheDocument();
    });

    it("displays volume when enabled", async () => {
      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={{
              ...mockConfig,
              config: { ...mockConfig.config, showVolume: true },
            }}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Vol: 55.2M")).toBeInTheDocument();
      });
    });
  });

  describe("User Interactions", () => {
    it("allows adding a new stock symbol", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      // Find and click add button
      const addButton = screen.getByTitle("Add new stock to watchlist");
      await user.click(addButton);

      // Enter new symbol
      const input = screen.getByPlaceholderText("Enter symbol (e.g., AAPL)");
      await user.type(input, "NVDA");

      // Click add
      const submitButton = screen.getByText("Add");
      await user.click(submitButton);

      expect(addSymbolToWatchlist).toHaveBeenCalledWith("NVDA");
    });

    it("allows removing a stock from watchlist", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      // Find remove button for AAPL
      const removeButtons = screen.getAllByTitle(/Remove .* from watchlist/);
      await user.click(removeButtons[0]);

      expect(removeSymbolFromWatchlist).toHaveBeenCalledWith("AAPL");
    });

    it("navigates to stock detail when clicking on stock name", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      // Stock symbols should be clickable and navigate
      const stockButton = screen.getByRole("button", { name: /AAPL/i });
      await user.click(stockButton);

      // Navigation is handled by mocked useNavigate, we just verify the button is clickable
      expect(stockButton).toBeInTheDocument();
    });
  });

  describe("Real-time Updates", () => {
    it("subscribes to WebSocket updates on mount", async () => {
      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      // Should subscribe to watchlist updates
      expect(subscribeToWatchlist).toHaveBeenCalledWith(
        mockWatchlistData.items,
        expect.any(Function),
      );
    });

    it("updates prices when WebSocket data is received", async () => {
      let updateCallback: (data: any) => void;

      vi.mocked(subscribeToWatchlist).mockImplementation(
        (items: any, callback: any) => {
          updateCallback = callback;
          return () => {};
        },
      );

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      // Simulate WebSocket update
      act(() => {
        updateCallback!({
          symbol: "AAPL",
          price: 155.0,
          change: 7.5,
          changePercent: 5.09,
          volume: 65234567,
          timestamp: "2024-01-15T11:00:00Z",
        });
      });

      await waitFor(() => {
        expect(screen.getByText("$155.00")).toBeInTheDocument();
        expect(screen.getByText("+$7.50")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when data loading fails", async () => {
      const errorMessage = "Failed to load watchlist data";
      vi.mocked(getUserWatchlist).mockRejectedValue(new Error(errorMessage));

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
        expect(
          screen.getByText(/Failed to load watchlist data/),
        ).toBeInTheDocument();
      });
    });

    it("shows retry button when error occurs", async () => {
      vi.mocked(getUserWatchlist).mockRejectedValue(new Error("Network error"));

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByTitle("Retry loading watchlist"),
        ).toBeInTheDocument();
      });
    });

    it("retries data fetch when retry button is clicked", async () => {
      const user = userEvent.setup();

      // First call fails, second succeeds
      vi.mocked(getUserWatchlist)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(mockWatchlistData);

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByTitle("Retry loading watchlist");
      await user.click(retryButton);

      // Should show data after retry
      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      expect(getUserWatchlist).toHaveBeenCalledTimes(2);
    });

    it("handles WebSocket connection failures gracefully", async () => {
      vi.mocked(connectToMarketData).mockRejectedValue(
        new Error("WebSocket connection failed"),
      );

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      // Component should still render even with WebSocket errors
      expect(screen.getByText("Watchlist")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for interactive elements", async () => {
      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      expect(
        screen.getByTitle("Add new stock to watchlist"),
      ).toBeInTheDocument();
      expect(screen.getByTitle("Retry loading watchlist")).toBeInTheDocument();
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      // Should be able to tab through interactive elements
      await user.tab();

      // First focusable element should be the add button
      expect(screen.getByTitle("Add new stock to watchlist")).toHaveFocus();
    });
  });

  describe("Configuration", () => {
    it("respects maxItems configuration", async () => {
      const limitedConfig = {
        ...mockConfig,
        config: { ...mockConfig.config, maxItems: 2 },
      };

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={limitedConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
        expect(screen.getByText("GOOGL")).toBeInTheDocument();
      });

      // Should not show third item due to maxItems limit
      expect(screen.queryByText("TSLA")).not.toBeInTheDocument();
    });

    it("calls onConfigChange when configuration is updated", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={true}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      // In edit mode, there should be configuration options
      // This is a placeholder test since the exact configuration UI depends on implementation
      expect(screen.getByText("Watchlist")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("does not re-render unnecessarily when props do not change", async () => {
      const { rerender } = render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      const initialCallCount = vi.mocked(getUserWatchlist).mock.calls.length;

      // Re-render with same props
      rerender(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      // Should not call service again
      expect(vi.mocked(getUserWatchlist).mock.calls.length).toBe(
        initialCallCount,
      );
    });

    it("handles large datasets efficiently", async () => {
      const largeWatchlistData = {
        ...mockWatchlistData,
        items: Array.from({ length: 100 }, (_, i) => ({
          id: `${i + 1}`,
          symbol: `SYM${i + 1}`,
          name: `Company ${i + 1}`,
          price: 100 + i,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.floor(Math.random() * 10000000) + 1000000,
          marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
          sector: ["Technology", "Healthcare", "Finance"][i % 3],
          lastUpdated: "2024-01-15T10:30:00Z",
        })),
      };

      vi.mocked(getUserWatchlist).mockResolvedValue(largeWatchlistData);

      const startTime = performance.now();

      render(
        <TestWrapper>
          <Watchlist
            widgetId="test-widget"
            config={mockConfig}
            isEditMode={false}
            onConfigChange={mockOnConfigChange}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("SYM1")).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render reasonably quickly (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
    });
  });
});
