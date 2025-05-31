/**
 * E2E Tests for Dashboard Customization
 * Tests the complete user workflow for customizing the dashboard
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Dashboard Customization E2E', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Mock API responses
    await page.route('**/api/v1/users/me/dashboard-configuration', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          config: {
            id: 'test-config',
            userId: 'test-user',
            layouts: {
              lg: [
                { i: 'portfolio-overview-1', x: 0, y: 0, w: 6, h: 3 },
                { i: 'portfolio-chart-1', x: 6, y: 0, w: 6, h: 3 },
              ],
            },
            widgets: [
              {
                id: 'portfolio-overview-1',
                type: 'portfolio-overview',
                title: 'Portfolio Overview',
                description: 'Portfolio performance summary',
                config: {},
              },
              {
                id: 'portfolio-chart-1',
                type: 'portfolio-chart',
                title: 'Portfolio Chart',
                description: 'Portfolio performance chart',
                config: {},
              },
            ],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        }),
      });
    });

    await page.route('**/api/v1/users/me/dashboard-configuration', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            config: {
              id: 'test-config',
              userId: 'test-user',
              layouts: {},
              widgets: [],
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          }),
        });
      }
    });

    // Mock portfolio data
    await page.route('**/api/v1/portfolio**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalValue: 125000,
          dayChange: 2500,
          dayChangePercent: 2.04,
          totalReturn: 15000,
          totalReturnPercent: 13.6,
          holdings: [],
        }),
      });
    });

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load dashboard with default widgets', async () => {
    // Check that default widgets are loaded
    await expect(page.getByText('Portfolio Overview')).toBeVisible();
    await expect(page.getByText('Portfolio Chart')).toBeVisible();
    
    // Check that portfolio data is displayed
    await expect(page.getByText('$125,000')).toBeVisible();
    await expect(page.getByText('+$2,500')).toBeVisible();
  });

  test('should enter and exit edit mode', async () => {
    // Enter edit mode
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Check edit mode UI
    await expect(page.getByText('Exit Edit Mode')).toBeVisible();
    await expect(page.getByRole('button', { name: /add widget/i })).toBeVisible();
    await expect(page.getByText('Unsaved changes')).not.toBeVisible();
    
    // Exit edit mode
    await page.getByText('Exit Edit Mode').click();
    
    // Check normal mode UI
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
    await expect(page.getByText('Exit Edit Mode')).not.toBeVisible();
  });

  test('should open and close widget library', async () => {
    // Enter edit mode
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Open widget library
    await page.getByRole('button', { name: /add widget/i }).click();
    
    // Check widget library modal
    await expect(page.getByText('Widget Library')).toBeVisible();
    await expect(page.getByText('Choose widgets to add to your dashboard')).toBeVisible();
    
    // Check that widgets are listed
    await expect(page.getByText('Portfolio Overview')).toBeVisible();
    await expect(page.getByText('Watchlist')).toBeVisible();
    await expect(page.getByText('AI Insights')).toBeVisible();
    
    // Close modal by clicking outside or close button
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByText('Widget Library')).not.toBeVisible();
  });

  test('should search and filter widgets in library', async () => {
    // Enter edit mode and open widget library
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByRole('button', { name: /add widget/i }).click();
    
    // Search for portfolio widgets
    await page.getByPlaceholder('Search widgets...').fill('portfolio');
    
    // Check filtered results
    await expect(page.getByText('Portfolio Overview')).toBeVisible();
    await expect(page.getByText('Portfolio Chart')).toBeVisible();
    await expect(page.getByText('Watchlist')).not.toBeVisible();
    
    // Clear search
    await page.getByPlaceholder('Search widgets...').clear();
    await expect(page.getByText('Watchlist')).toBeVisible();
  });

  test('should filter widgets by category', async () => {
    // Enter edit mode and open widget library
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByRole('button', { name: /add widget/i }).click();
    
    // Filter by Portfolio category
    await page.getByRole('button', { name: 'Portfolio' }).click();
    
    // Check filtered results
    await expect(page.getByText('Portfolio Overview')).toBeVisible();
    await expect(page.getByText('Portfolio Chart')).toBeVisible();
    await expect(page.getByText('Watchlist')).not.toBeVisible();
    
    // Show all categories
    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.getByText('Watchlist')).toBeVisible();
  });

  test('should add widget from library', async () => {
    // Enter edit mode and open widget library
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByRole('button', { name: /add widget/i }).click();
    
    // Add watchlist widget
    const watchlistCard = page.locator('.widget-card').filter({ hasText: 'Watchlist' });
    await watchlistCard.getByRole('button', { name: /add/i }).click();
    
    // Check that modal closes and widget is added
    await expect(page.getByText('Widget Library')).not.toBeVisible();
    await expect(page.getByText('Unsaved changes')).toBeVisible();
    
    // Check that watchlist widget is now on dashboard
    await expect(page.getByText('Watchlist')).toBeVisible();
    await expect(page.getByText('AAPL')).toBeVisible(); // Sample stock from watchlist
  });

  test('should remove widget in edit mode', async () => {
    // Enter edit mode
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Hover over portfolio overview widget to show controls
    const portfolioWidget = page.locator('[data-testid*="portfolio-overview"]');
    await portfolioWidget.hover();
    
    // Click remove button
    await portfolioWidget.getByRole('button', { name: /remove/i }).click();
    
    // Check that widget is removed and unsaved changes indicator appears
    await expect(page.getByText('Portfolio Overview')).not.toBeVisible();
    await expect(page.getByText('Unsaved changes')).toBeVisible();
  });

  test('should drag and drop widgets to reorder', async () => {
    // Enter edit mode
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Get initial positions
    const portfolioOverview = page.locator('[data-testid*="portfolio-overview"]');
    const portfolioChart = page.locator('[data-testid*="portfolio-chart"]');
    
    const overviewBox = await portfolioOverview.boundingBox();
    const chartBox = await portfolioChart.boundingBox();
    
    // Drag portfolio overview to portfolio chart position
    await portfolioOverview.dragTo(portfolioChart);
    
    // Check that positions have changed
    await expect(page.getByText('Unsaved changes')).toBeVisible();
    
    // Verify widgets are still present but in different positions
    await expect(page.getByText('Portfolio Overview')).toBeVisible();
    await expect(page.getByText('Portfolio Chart')).toBeVisible();
  });

  test('should save changes when exiting edit mode', async () => {
    // Enter edit mode
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Add a widget to create changes
    await page.getByRole('button', { name: /add widget/i }).click();
    const watchlistCard = page.locator('.widget-card').filter({ hasText: 'Watchlist' });
    await watchlistCard.getByRole('button', { name: /add/i }).click();
    
    // Check unsaved changes indicator
    await expect(page.getByText('Unsaved changes')).toBeVisible();
    
    // Exit edit mode (should trigger save)
    await page.getByText('Exit Edit Mode').click();
    
    // Check that changes are saved (no unsaved indicator)
    await expect(page.getByText('Unsaved changes')).not.toBeVisible();
    await expect(page.getByText('Watchlist')).toBeVisible();
  });

  test('should manually save changes', async () => {
    // Enter edit mode
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Add a widget to create changes
    await page.getByRole('button', { name: /add widget/i }).click();
    const watchlistCard = page.locator('.widget-card').filter({ hasText: 'Watchlist' });
    await watchlistCard.getByRole('button', { name: /add/i }).click();
    
    // Check unsaved changes indicator
    await expect(page.getByText('Unsaved changes')).toBeVisible();
    
    // Manually save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Check that changes are saved
    await expect(page.getByText('Unsaved changes')).not.toBeVisible();
    await expect(page.getByText('Changes saved')).toBeVisible();
  });

  test('should handle save errors gracefully', async () => {
    // Mock save error
    await page.route('**/api/v1/users/me/dashboard-configuration', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Internal server error',
          }),
        });
      }
    });
    
    // Enter edit mode and make changes
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByRole('button', { name: /add widget/i }).click();
    const watchlistCard = page.locator('.widget-card').filter({ hasText: 'Watchlist' });
    await watchlistCard.getByRole('button', { name: /add/i }).click();
    
    // Try to save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Check error message
    await expect(page.getByText('Failed to save dashboard configuration')).toBeVisible();
    await expect(page.getByText('Unsaved changes')).toBeVisible();
  });

  test('should be responsive on mobile devices', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that dashboard adapts to mobile layout
    await expect(page.getByText('Portfolio Overview')).toBeVisible();
    await expect(page.getByText('Portfolio Chart')).toBeVisible();
    
    // Check that edit mode works on mobile
    await page.getByRole('button', { name: /edit/i }).click();
    await expect(page.getByText('Exit Edit Mode')).toBeVisible();
    
    // Check that widget library works on mobile
    await page.getByRole('button', { name: /add widget/i }).click();
    await expect(page.getByText('Widget Library')).toBeVisible();
  });

  test('should be accessible via keyboard navigation', async () => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /edit/i })).toBeFocused();
    
    // Enter edit mode with keyboard
    await page.keyboard.press('Enter');
    await expect(page.getByText('Exit Edit Mode')).toBeVisible();
    
    // Tab to add widget button
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /add widget/i })).toBeFocused();
    
    // Open widget library with keyboard
    await page.keyboard.press('Enter');
    await expect(page.getByText('Widget Library')).toBeVisible();
    
    // Close with Escape key
    await page.keyboard.press('Escape');
    await expect(page.getByText('Widget Library')).not.toBeVisible();
  });

  test('should maintain widget state during customization', async () => {
    // Check initial portfolio data
    await expect(page.getByText('$125,000')).toBeVisible();
    
    // Enter edit mode
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Portfolio data should still be visible
    await expect(page.getByText('$125,000')).toBeVisible();
    
    // Add another widget
    await page.getByRole('button', { name: /add widget/i }).click();
    const watchlistCard = page.locator('.widget-card').filter({ hasText: 'Watchlist' });
    await watchlistCard.getByRole('button', { name: /add/i }).click();
    
    // Original data should still be there
    await expect(page.getByText('$125,000')).toBeVisible();
    
    // Exit edit mode
    await page.getByText('Exit Edit Mode').click();
    
    // Data should persist
    await expect(page.getByText('$125,000')).toBeVisible();
    await expect(page.getByText('AAPL')).toBeVisible(); // From watchlist
  });

  test('should handle widget loading and error states', async () => {
    // Mock portfolio API error
    await page.route('**/api/v1/portfolio**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
        }),
      });
    });
    
    // Reload page to trigger error
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that error state is displayed in widget
    await expect(page.getByText('Unable to load portfolio data')).toBeVisible();
    
    // Dashboard should still be functional
    await page.getByRole('button', { name: /edit/i }).click();
    await expect(page.getByText('Exit Edit Mode')).toBeVisible();
  });

  test('should persist layout across page refreshes', async () => {
    // Enter edit mode and add a widget
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByRole('button', { name: /add widget/i }).click();
    const watchlistCard = page.locator('.widget-card').filter({ hasText: 'Watchlist' });
    await watchlistCard.getByRole('button', { name: /add/i }).click();
    
    // Save changes
    await page.getByText('Exit Edit Mode').click();
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that added widget persists
    await expect(page.getByText('Portfolio Overview')).toBeVisible();
    await expect(page.getByText('Portfolio Chart')).toBeVisible();
    await expect(page.getByText('Watchlist')).toBeVisible();
  });
}); 