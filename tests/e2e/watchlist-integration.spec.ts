/**
 * Watchlist Integration Tests
 * End-to-end tests for Story 2.4 - Watchlist Widget complete functionality
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Watchlist Widget Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard with watchlist widget
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Ensure user is authenticated (use test user setup)
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test_token_123');
    });
  });

  test.describe('Widget Rendering', () => {
    test('displays watchlist widget on dashboard', async ({ page }) => {
      // Wait for watchlist widget to appear
      await expect(page.locator('[data-testid="watchlist-widget"]')).toBeVisible();
      
      // Check widget title
      await expect(page.locator('[data-testid="watchlist-title"]')).toContainText('Watchlist');
      
      // Check for add button
      await expect(page.locator('[data-testid="watchlist-add-button"]')).toBeVisible();
    });

    test('shows loading state initially', async ({ page }) => {
      // Intercept API call to add delay
      await page.route('/api/v1/users/me/watchlist', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });

      await page.reload();
      
      // Check loading state
      await expect(page.locator('[data-testid="watchlist-loading"]')).toBeVisible();
      await expect(page.locator('[data-testid="watchlist-loading"]')).toContainText('Loading watchlist...');
    });

    test('displays stock items when loaded', async ({ page }) => {
      // Mock API response with test data
      await page.route('/api/v1/users/me/watchlist', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              watchlistId: 'test-watchlist',
              name: 'My Watchlist',
              items: [
                {
                  id: 'item1',
                  symbol: 'AAPL',
                  name: 'Apple Inc.',
                  price: 185.42,
                  change: 2.34,
                  changePercent: 1.28,
                  volume: 45678912,
                  marketCap: 2890000000000,
                  logoUrl: 'https://logo.clearbit.com/apple.com',
                },
                {
                  id: 'item2',
                  symbol: 'GOOGL',
                  name: 'Alphabet Inc.',
                  price: 142.78,
                  change: -1.56,
                  changePercent: -1.08,
                  volume: 23456789,
                  marketCap: 1780000000000,
                  logoUrl: 'https://logo.clearbit.com/google.com',
                },
              ],
            },
          }),
        });
      });

      await page.reload();
      
      // Wait for items to load
      await expect(page.locator('[data-testid="watchlist-item-AAPL"]')).toBeVisible();
      await expect(page.locator('[data-testid="watchlist-item-GOOGL"]')).toBeVisible();
      
      // Check stock data display
      await expect(page.locator('[data-testid="stock-symbol-AAPL"]')).toContainText('AAPL');
      await expect(page.locator('[data-testid="stock-name-AAPL"]')).toContainText('Apple Inc.');
      await expect(page.locator('[data-testid="stock-price-AAPL"]')).toContainText('$185.42');
      await expect(page.locator('[data-testid="stock-change-AAPL"]')).toContainText('+$2.34 (+1.28%)');
    });

    test('shows empty state when no items', async ({ page }) => {
      // Mock empty watchlist response
      await page.route('/api/v1/users/me/watchlist', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              watchlistId: 'test-watchlist',
              name: 'My Watchlist',
              items: [],
            },
          }),
        });
      });

      await page.reload();
      
      // Check empty state
      await expect(page.locator('[data-testid="watchlist-empty"]')).toBeVisible();
      await expect(page.locator('[data-testid="watchlist-empty"]')).toContainText('No stocks in your watchlist');
      await expect(page.locator('[data-testid="watchlist-empty"]')).toContainText('Add your first stock to get started');
    });
  });

  test.describe('Add Symbol Functionality', () => {
    test('opens add symbol modal on button click', async ({ page }) => {
      await page.locator('[data-testid="watchlist-add-button"]').click();
      
      // Check modal is open
      await expect(page.locator('[data-testid="add-symbol-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-symbol-title"]')).toContainText('Add Stock to Watchlist');
      await expect(page.locator('[data-testid="symbol-input"]')).toBeVisible();
    });

    test('validates symbol input', async ({ page }) => {
      await page.locator('[data-testid="watchlist-add-button"]').click();
      
      // Try to submit empty form
      await page.locator('[data-testid="add-symbol-submit"]').click();
      
      // Check validation message
      await expect(page.locator('[data-testid="symbol-error"]')).toContainText('Symbol is required');
    });

    test('validates symbol format', async ({ page }) => {
      await page.locator('[data-testid="watchlist-add-button"]').click();
      
      // Enter invalid symbol
      await page.locator('[data-testid="symbol-input"]').fill('INVALID123');
      await page.locator('[data-testid="add-symbol-submit"]').click();
      
      // Check validation message
      await expect(page.locator('[data-testid="symbol-error"]')).toContainText('Symbol must be 1-5 letters only');
    });

    test('successfully adds a valid symbol', async ({ page }) => {
      // Mock symbol validation
      await page.route('/api/v1/market/quote/TSLA', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              symbol: 'TSLA',
              name: 'Tesla Inc.',
              price: 250.50,
              change: 5.25,
              changePercent: 2.14,
              volume: 25000000,
            },
          }),
        });
      });

      // Mock add symbol API
      await page.route('/api/v1/users/me/watchlist', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { symbol: 'TSLA', name: 'Tesla Inc.' },
              message: 'Symbol added successfully',
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.locator('[data-testid="watchlist-add-button"]').click();
      
      // Enter valid symbol
      await page.locator('[data-testid="symbol-input"]').fill('TSLA');
      
      // Wait for validation to complete
      await expect(page.locator('[data-testid="symbol-validation"]')).toContainText('TSLA is valid');
      
      // Submit form
      await page.locator('[data-testid="add-symbol-submit"]').click();
      
      // Check success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('TSLA added to watchlist successfully');
      
      // Modal should close
      await expect(page.locator('[data-testid="add-symbol-modal"]')).not.toBeVisible();
    });

    test('handles duplicate symbol error', async ({ page }) => {
      // Mock add symbol API to return duplicate error
      await page.route('/api/v1/users/me/watchlist', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              message: 'Symbol already exists in watchlist',
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.locator('[data-testid="watchlist-add-button"]').click();
      await page.locator('[data-testid="symbol-input"]').fill('AAPL');
      await page.locator('[data-testid="add-symbol-submit"]').click();
      
      // Check error message
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Symbol already exists in watchlist');
    });
  });

  test.describe('Remove Symbol Functionality', () => {
    test('shows remove button on hover', async ({ page }) => {
      // Hover over a stock item
      await page.locator('[data-testid="watchlist-item-AAPL"]').hover();
      
      // Check remove button appears
      await expect(page.locator('[data-testid="remove-button-AAPL"]')).toBeVisible();
    });

    test('successfully removes a symbol', async ({ page }) => {
      // Mock remove API
      await page.route('/api/v1/users/me/watchlist/AAPL', async route => {
        if (route.request().method() === 'DELETE') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Symbol removed successfully',
            }),
          });
        }
      });

      // Hover and click remove
      await page.locator('[data-testid="watchlist-item-AAPL"]').hover();
      await page.locator('[data-testid="remove-button-AAPL"]').click();
      
      // Check success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('AAPL removed from watchlist successfully');
    });
  });

  test.describe('Navigation Functionality', () => {
    test('navigates to stock detail page on click', async ({ page }) => {
      // Click on stock item
      await page.locator('[data-testid="watchlist-item-AAPL"]').click();
      
      // Check navigation to stock detail page
      await expect(page).toHaveURL(/\/stock\/AAPL/);
    });

    test('displays stock detail page with correct data', async ({ page }) => {
      // Mock stock detail API
      await page.route('/api/v1/market/quote/AAPL', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              symbol: 'AAPL',
              name: 'Apple Inc.',
              price: 185.42,
              change: 2.34,
              changePercent: 1.28,
              volume: 45678912,
              marketCap: 2890000000000,
              peRatio: 28.5,
              eps: 6.51,
              dividend: 0.24,
              description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
              sector: 'Technology',
              industry: 'Consumer Electronics',
              employees: 164000,
            },
          }),
        });
      });

      await page.goto('/stock/AAPL');
      
      // Check stock detail page content
      await expect(page.locator('[data-testid="stock-symbol"]')).toContainText('AAPL');
      await expect(page.locator('[data-testid="stock-name"]')).toContainText('Apple Inc.');
      await expect(page.locator('[data-testid="stock-price"]')).toContainText('$185.42');
      await expect(page.locator('[data-testid="stock-change"]')).toContainText('+$2.34 (+1.28%)');
      await expect(page.locator('[data-testid="stock-pe-ratio"]')).toContainText('28.5');
      await expect(page.locator('[data-testid="stock-eps"]')).toContainText('6.51');
    });

    test('allows adding/removing from watchlist on stock detail page', async ({ page }) => {
      await page.goto('/stock/TSLA');
      
      // Mock add to watchlist API
      await page.route('/api/v1/users/me/watchlist', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Symbol added successfully',
            }),
          });
        }
      });

      // Click add to watchlist button
      await page.locator('[data-testid="add-to-watchlist"]').click();
      
      // Check success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('TSLA added to watchlist successfully');
      
      // Button should change to remove
      await expect(page.locator('[data-testid="remove-from-watchlist"]')).toBeVisible();
    });
  });

  test.describe('Real-time Updates', () => {
    test('displays connection status indicator', async ({ page }) => {
      // Check for connection status indicator
      await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();
      
      // Should show "Live" when connected
      await expect(page.locator('[data-testid="connection-status"]')).toContainText('Live');
    });

    test('simulates real-time price updates', async ({ page }) => {
      // Mock WebSocket connection (simplified for testing)
      await page.evaluate(() => {
        // Simulate WebSocket message
        const mockUpdate = {
          symbol: 'AAPL',
          price: 190.50,
          change: 7.42,
          changePercent: 4.05,
          volume: 45678912,
        };
        
        // Dispatch custom event to simulate WebSocket update
        window.dispatchEvent(new CustomEvent('mock-websocket-update', { detail: mockUpdate }));
      });
      
      // Check that price was updated
      await expect(page.locator('[data-testid="stock-price-AAPL"]')).toContainText('$190.50');
      await expect(page.locator('[data-testid="stock-change-AAPL"]')).toContainText('+$7.42 (+4.05%)');
    });

    test('handles connection loss gracefully', async ({ page }) => {
      // Simulate WebSocket disconnection
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('mock-websocket-disconnect'));
      });
      
      // Check connection status changes to "Delayed"
      await expect(page.locator('[data-testid="connection-status"]')).toContainText('Delayed');
    });
  });

  test.describe('Error Handling', () => {
    test('displays error state when API fails', async ({ page }) => {
      // Mock API failure
      await page.route('/api/v1/users/me/watchlist', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Internal server error',
          }),
        });
      });

      await page.reload();
      
      // Check error state
      await expect(page.locator('[data-testid="watchlist-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="watchlist-error"]')).toContainText('Error loading watchlist');
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('retries loading on retry button click', async ({ page }) => {
      let callCount = 0;
      
      // Mock API to fail first time, succeed second time
      await page.route('/api/v1/users/me/watchlist', async route => {
        callCount++;
        if (callCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              message: 'Internal server error',
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                watchlistId: 'test-watchlist',
                name: 'My Watchlist',
                items: [
                  {
                    id: 'item1',
                    symbol: 'AAPL',
                    name: 'Apple Inc.',
                    price: 185.42,
                    change: 2.34,
                    changePercent: 1.28,
                    volume: 45678912,
                  },
                ],
              },
            }),
          });
        }
      });

      await page.reload();
      
      // Wait for error state
      await expect(page.locator('[data-testid="watchlist-error"]')).toBeVisible();
      
      // Click retry
      await page.locator('[data-testid="retry-button"]').click();
      
      // Check that data loads successfully
      await expect(page.locator('[data-testid="watchlist-item-AAPL"]')).toBeVisible();
    });

    test('handles network timeout gracefully', async ({ page }) => {
      // Mock slow API response
      await page.route('/api/v1/users/me/watchlist', async route => {
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
        await route.continue();
      });

      await page.reload();
      
      // Should show loading state
      await expect(page.locator('[data-testid="watchlist-loading"]')).toBeVisible();
      
      // Wait for timeout (implementation dependent)
      await page.waitForTimeout(5000);
      
      // Should show error state after timeout
      await expect(page.locator('[data-testid="watchlist-error"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('keyboard navigation works correctly', async ({ page }) => {
      // Tab to add button
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="watchlist-add-button"]')).toBeFocused();
      
      // Enter to open modal
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="add-symbol-modal"]')).toBeVisible();
      
      // Tab to input
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="symbol-input"]')).toBeFocused();
      
      // Escape to close modal
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="add-symbol-modal"]')).not.toBeVisible();
    });

    test('has proper ARIA labels', async ({ page }) => {
      // Check ARIA labels exist
      await expect(page.locator('[data-testid="watchlist-add-button"]')).toHaveAttribute('aria-label', 'Add stock to watchlist');
      await expect(page.locator('[data-testid="watchlist-refresh-button"]')).toHaveAttribute('aria-label', 'Refresh watchlist data');
    });

    test('supports screen reader navigation', async ({ page }) => {
      // Check for proper heading structure
      await expect(page.locator('[data-testid="watchlist-title"]')).toHaveAttribute('role', 'heading');
      
      // Check for proper list structure
      await expect(page.locator('[data-testid="watchlist-items"]')).toHaveAttribute('role', 'list');
      await expect(page.locator('[data-testid="watchlist-item-AAPL"]')).toHaveAttribute('role', 'listitem');
    });
  });

  test.describe('Responsive Design', () => {
    test('adapts to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check mobile-specific layout
      await expect(page.locator('[data-testid="watchlist-widget"]')).toBeVisible();
      
      // Check that all elements are still accessible
      await expect(page.locator('[data-testid="watchlist-add-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="watchlist-item-AAPL"]')).toBeVisible();
    });

    test('adapts to tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Check tablet-specific layout
      await expect(page.locator('[data-testid="watchlist-widget"]')).toBeVisible();
      
      // Check that touch interactions work
      await page.locator('[data-testid="watchlist-item-AAPL"]').tap();
      await expect(page).toHaveURL(/\/stock\/AAPL/);
    });
  });

  test.describe('Performance', () => {
    test('loads within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="watchlist-widget"]')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('handles large watchlists efficiently', async ({ page }) => {
      // Mock large watchlist (50 items)
      const largeWatchlist = Array.from({ length: 50 }, (_, i) => ({
        id: `item${i}`,
        symbol: `SYM${i.toString().padStart(2, '0')}`,
        name: `Company ${i}`,
        price: 100 + Math.random() * 100,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 10000000),
      }));

      await page.route('/api/v1/users/me/watchlist', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              watchlistId: 'large-watchlist',
              name: 'Large Watchlist',
              items: largeWatchlist,
            },
          }),
        });
      });

      const startTime = Date.now();
      await page.reload();
      
      // Wait for all items to load
      await expect(page.locator('[data-testid="watchlist-item-SYM00"]')).toBeVisible();
      await expect(page.locator('[data-testid="watchlist-item-SYM49"]')).toBeVisible();
      
      const renderTime = Date.now() - startTime;
      
      // Should render large list within 5 seconds
      expect(renderTime).toBeLessThan(5000);
    });
  });
}); 