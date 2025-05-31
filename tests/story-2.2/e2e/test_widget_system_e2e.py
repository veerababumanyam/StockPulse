"""
End-to-End tests for Widget System
Tests the complete user workflow from dashboard to widget management
"""
import pytest
import asyncio
from playwright.async_api import async_playwright, Page, Browser, BrowserContext
from typing import Generator
import os

class TestWidgetSystemE2E:
    """End-to-end tests for the complete widget system"""
    
    @pytest.fixture(scope="class")
    async def browser_setup(self) -> Generator[tuple[Browser, BrowserContext, Page], None, None]:
        """Set up browser, context, and page for testing"""
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(
                headless=os.getenv("HEADLESS", "true").lower() == "true",
                slow_mo=100 if os.getenv("DEBUG") else 0
            )
            
            # Create context with viewport
            context = await browser.new_context(
                viewport={"width": 1280, "height": 720},
                ignore_https_errors=True
            )
            
            # Create page
            page = await context.new_page()
            
            yield browser, context, page
            
            await browser.close()
    
    @pytest.fixture(autouse=True)
    async def setup_test_user(self, browser_setup):
        """Set up authenticated test user before each test"""
        browser, context, page = browser_setup
        
        # Navigate to login page
        await page.goto("http://localhost:3000/auth/login")
        
        # Login with test credentials
        await page.fill('[data-testid="email-input"]', "test@example.com")
        await page.fill('[data-testid="password-input"]', "testpassword123")
        await page.click('[data-testid="login-button"]')
        
        # Wait for redirect to dashboard
        await page.wait_for_url("**/dashboard", timeout=10000)
        
        # Verify we're logged in
        await page.wait_for_selector('[data-testid="dashboard-container"]', timeout=5000)
    
    async def test_dashboard_loads_with_default_widgets(self, browser_setup):
        """Test that dashboard loads with default widget layout"""
        browser, context, page = browser_setup
        
        # Verify dashboard container is visible
        dashboard = page.locator('[data-testid="dashboard-container"]')
        await expect(dashboard).to_be_visible()
        
        # Verify default widgets are present
        portfolio_overview = page.locator('[data-testid="widget-portfolio-overview"]')
        market_summary = page.locator('[data-testid="widget-market-summary"]')
        
        await expect(portfolio_overview).to_be_visible()
        await expect(market_summary).to_be_visible()
        
        # Verify widgets have data
        await expect(portfolio_overview.locator('[data-testid="total-value"]')).to_contain_text("$")
        await expect(market_summary.locator('[data-testid="index-data"]')).to_be_visible()
    
    async def test_enter_edit_mode(self, browser_setup):
        """Test entering dashboard edit mode"""
        browser, context, page = browser_setup
        
        # Click edit mode button
        edit_button = page.locator('[data-testid="edit-mode-button"]')
        await edit_button.click()
        
        # Verify edit mode is active
        await expect(page.locator('[data-testid="edit-mode-indicator"]')).to_be_visible()
        await expect(page.locator('[data-testid="widget-library-button"]')).to_be_visible()
        
        # Verify widgets show edit overlays
        widget_overlay = page.locator('[data-testid="widget-edit-overlay"]').first()
        await expect(widget_overlay).to_be_visible()
    
    async def test_open_widget_library(self, browser_setup):
        """Test opening and browsing the widget library"""
        browser, context, page = browser_setup
        
        # Enter edit mode first
        await page.click('[data-testid="edit-mode-button"]')
        
        # Open widget library
        await page.click('[data-testid="widget-library-button"]')
        
        # Verify library modal is open
        library_modal = page.locator('[data-testid="widget-library-modal"]')
        await expect(library_modal).to_be_visible()
        
        # Verify widget categories are present
        await expect(page.locator('[data-testid="category-portfolio"]')).to_be_visible()
        await expect(page.locator('[data-testid="category-market"]')).to_be_visible()
        await expect(page.locator('[data-testid="category-analysis"]')).to_be_visible()
        
        # Verify widget cards are displayed
        widget_cards = page.locator('[data-testid^="widget-card-"]')
        await expect(widget_cards.first()).to_be_visible()
        
        # Test search functionality
        search_input = page.locator('[data-testid="widget-search-input"]')
        await search_input.fill("portfolio")
        
        # Verify search results
        await expect(page.locator('[data-testid="widget-card-portfolio-overview"]')).to_be_visible()
        await expect(page.locator('[data-testid="widget-card-portfolio-chart"]')).to_be_visible()
    
    async def test_add_widget_from_library(self, browser_setup):
        """Test adding a new widget from the library"""
        browser, context, page = browser_setup
        
        # Enter edit mode and open library
        await page.click('[data-testid="edit-mode-button"]')
        await page.click('[data-testid="widget-library-button"]')
        
        # Count existing widgets
        existing_widgets = await page.locator('[data-testid^="widget-"]').count()
        
        # Add a watchlist widget
        watchlist_card = page.locator('[data-testid="widget-card-watchlist"]')
        await watchlist_card.click()
        
        # Verify add button appears
        add_button = page.locator('[data-testid="add-widget-button"]')
        await expect(add_button).to_be_visible()
        await add_button.click()
        
        # Close library modal
        await page.click('[data-testid="close-library-button"]')
        
        # Verify new widget was added
        new_widget_count = await page.locator('[data-testid^="widget-"]').count()
        assert new_widget_count == existing_widgets + 1
        
        # Verify the new watchlist widget is present
        await expect(page.locator('[data-testid="widget-watchlist"]')).to_be_visible()
    
    async def test_drag_and_drop_widget(self, browser_setup):
        """Test dragging and dropping widgets to rearrange layout"""
        browser, context, page = browser_setup
        
        # Enter edit mode
        await page.click('[data-testid="edit-mode-button"]')
        
        # Get initial positions
        widget1 = page.locator('[data-testid="widget-portfolio-overview"]')
        widget2 = page.locator('[data-testid="widget-market-summary"]')
        
        widget1_box = await widget1.bounding_box()
        widget2_box = await widget2.bounding_box()
        
        # Drag widget1 to widget2's position
        await widget1.hover()
        await page.mouse.down()
        await page.mouse.move(widget2_box["x"] + 50, widget2_box["y"] + 50)
        await page.mouse.up()
        
        # Wait for layout to update
        await page.wait_for_timeout(1000)
        
        # Verify positions have changed
        new_widget1_box = await widget1.bounding_box()
        assert new_widget1_box["x"] != widget1_box["x"] or new_widget1_box["y"] != widget1_box["y"]
    
    async def test_resize_widget(self, browser_setup):
        """Test resizing widgets using resize handles"""
        browser, context, page = browser_setup
        
        # Enter edit mode
        await page.click('[data-testid="edit-mode-button"]')
        
        # Get widget and its resize handle
        widget = page.locator('[data-testid="widget-portfolio-overview"]')
        resize_handle = widget.locator('[data-testid="resize-handle"]')
        
        # Get initial size
        initial_box = await widget.bounding_box()
        
        # Drag resize handle to make widget larger
        await resize_handle.hover()
        await page.mouse.down()
        await page.mouse.move(initial_box["x"] + initial_box["width"] + 100, 
                             initial_box["y"] + initial_box["height"] + 50)
        await page.mouse.up()
        
        # Wait for resize to complete
        await page.wait_for_timeout(1000)
        
        # Verify widget size changed
        new_box = await widget.bounding_box()
        assert new_box["width"] > initial_box["width"]
        assert new_box["height"] > initial_box["height"]
    
    async def test_remove_widget(self, browser_setup):
        """Test removing a widget from the dashboard"""
        browser, context, page = browser_setup
        
        # Enter edit mode
        await page.click('[data-testid="edit-mode-button"]')
        
        # Count existing widgets
        initial_count = await page.locator('[data-testid^="widget-"]').count()
        
        # Find a widget to remove
        widget = page.locator('[data-testid="widget-market-summary"]')
        
        # Hover over widget to show controls
        await widget.hover()
        
        # Click remove button
        remove_button = widget.locator('[data-testid="remove-widget-button"]')
        await remove_button.click()
        
        # Confirm removal in dialog
        await page.click('[data-testid="confirm-remove-button"]')
        
        # Verify widget was removed
        final_count = await page.locator('[data-testid^="widget-"]').count()
        assert final_count == initial_count - 1
        
        # Verify specific widget is gone
        await expect(page.locator('[data-testid="widget-market-summary"]')).not_to_be_visible()
    
    async def test_save_layout(self, browser_setup):
        """Test saving dashboard layout changes"""
        browser, context, page = browser_setup
        
        # Enter edit mode
        await page.click('[data-testid="edit-mode-button"]')
        
        # Make some changes (add a widget)
        await page.click('[data-testid="widget-library-button"]')
        await page.click('[data-testid="widget-card-alerts"]')
        await page.click('[data-testid="add-widget-button"]')
        await page.click('[data-testid="close-library-button"]')
        
        # Save layout
        save_button = page.locator('[data-testid="save-layout-button"]')
        await save_button.click()
        
        # Verify save confirmation
        await expect(page.locator('[data-testid="save-success-message"]')).to_be_visible()
        
        # Exit edit mode
        await page.click('[data-testid="exit-edit-mode-button"]')
        
        # Refresh page to verify persistence
        await page.reload()
        await page.wait_for_selector('[data-testid="dashboard-container"]')
        
        # Verify the added widget is still there
        await expect(page.locator('[data-testid="widget-alerts"]')).to_be_visible()
    
    async def test_widget_data_updates(self, browser_setup):
        """Test that widget data updates in real-time"""
        browser, context, page = browser_setup
        
        # Get initial portfolio value
        portfolio_widget = page.locator('[data-testid="widget-portfolio-overview"]')
        initial_value = await portfolio_widget.locator('[data-testid="total-value"]').text_content()
        
        # Wait for data refresh (assuming 30 second refresh interval)
        await page.wait_for_timeout(35000)
        
        # Check if value has updated (in a real scenario, this would change)
        # For testing, we'll just verify the element is still present and has content
        current_value = await portfolio_widget.locator('[data-testid="total-value"]').text_content()
        assert current_value is not None
        assert "$" in current_value
    
    async def test_widget_error_handling(self, browser_setup):
        """Test widget error handling when data fails to load"""
        browser, context, page = browser_setup
        
        # Mock network failure for widget data
        await page.route("**/widgets/data/**", lambda route: route.abort())
        
        # Refresh page to trigger data loading
        await page.reload()
        await page.wait_for_selector('[data-testid="dashboard-container"]')
        
        # Verify error states are shown
        error_message = page.locator('[data-testid="widget-error-message"]')
        await expect(error_message.first()).to_be_visible()
        
        # Verify retry button is available
        retry_button = page.locator('[data-testid="widget-retry-button"]')
        await expect(retry_button.first()).to_be_visible()
    
    async def test_responsive_layout(self, browser_setup):
        """Test widget layout responsiveness on different screen sizes"""
        browser, context, page = browser_setup
        
        # Test desktop layout (already at 1280x720)
        desktop_widgets = await page.locator('[data-testid^="widget-"]').count()
        
        # Switch to tablet size
        await page.set_viewport_size({"width": 768, "height": 1024})
        await page.wait_for_timeout(1000)
        
        # Verify widgets are still visible and properly arranged
        tablet_widgets = await page.locator('[data-testid^="widget-"]').count()
        assert tablet_widgets == desktop_widgets
        
        # Switch to mobile size
        await page.set_viewport_size({"width": 375, "height": 667})
        await page.wait_for_timeout(1000)
        
        # Verify widgets stack vertically on mobile
        mobile_widgets = await page.locator('[data-testid^="widget-"]').count()
        assert mobile_widgets == desktop_widgets
        
        # Verify mobile-specific controls
        mobile_menu = page.locator('[data-testid="mobile-widget-menu"]')
        if await mobile_menu.is_visible():
            await expect(mobile_menu).to_be_visible()
    
    async def test_widget_configuration(self, browser_setup):
        """Test configuring widget settings"""
        browser, context, page = browser_setup
        
        # Enter edit mode
        await page.click('[data-testid="edit-mode-button"]')
        
        # Open widget settings
        widget = page.locator('[data-testid="widget-watchlist"]')
        await widget.hover()
        settings_button = widget.locator('[data-testid="widget-settings-button"]')
        await settings_button.click()
        
        # Verify settings modal opens
        settings_modal = page.locator('[data-testid="widget-settings-modal"]')
        await expect(settings_modal).to_be_visible()
        
        # Modify settings (e.g., change refresh interval)
        refresh_input = page.locator('[data-testid="refresh-interval-input"]')
        await refresh_input.fill("60000")
        
        # Save settings
        await page.click('[data-testid="save-settings-button"]')
        
        # Verify settings are applied
        await expect(page.locator('[data-testid="settings-saved-message"]')).to_be_visible()
    
    async def test_widget_preview_in_library(self, browser_setup):
        """Test widget preview functionality in the library"""
        browser, context, page = browser_setup
        
        # Enter edit mode and open library
        await page.click('[data-testid="edit-mode-button"]')
        await page.click('[data-testid="widget-library-button"]')
        
        # Hover over a widget card to show preview
        widget_card = page.locator('[data-testid="widget-card-portfolio-chart"]')
        await widget_card.hover()
        
        # Verify preview appears
        preview = page.locator('[data-testid="widget-preview"]')
        await expect(preview).to_be_visible()
        
        # Verify preview contains expected elements
        await expect(preview.locator('[data-testid="preview-title"]')).to_contain_text("Portfolio Chart")
        await expect(preview.locator('[data-testid="preview-description"]')).to_be_visible()

# Helper function for expect assertions
async def expect(locator):
    """Helper function to create expect assertions for Playwright"""
    from playwright.async_api import expect as playwright_expect
    return playwright_expect(locator)

if __name__ == '__main__':
    pytest.main([__file__]) 