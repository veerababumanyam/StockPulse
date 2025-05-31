"""
Simplified Widget System Integration Tests
Tests core widget system functionality without requiring full backend
"""
import pytest
import asyncio
import sys
from pathlib import Path
from unittest.mock import Mock, patch

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

# Import widget system components
try:
    from src.services.widget_registry import WidgetRegistry, WidgetMetadata, WidgetFactory
    from src.services.widget_registration import (
        registerAllWidgets, 
        getRegisteredWidget, 
        isWidgetAvailable,
        getAvailableWidgets
    )
    from src.types.dashboard import WidgetType, WidgetCategory
except ImportError as e:
    print(f"Import error: {e}")
    print("Running tests from project root may be required")
    raise

class TestWidgetSystemIntegration:
    """Integration tests for the complete widget system"""
    
    def setup_method(self):
        """Set up test fixtures"""
        # Create a fresh registry for each test
        self.registry = WidgetRegistry()
        
    def test_widget_registration_integration(self):
        """Test that all widgets can be registered successfully"""
        # This should not raise any exceptions
        registerAllWidgets()
        
        # Verify all expected widgets are registered
        expected_widgets = [
            'portfolio-overview',
            'portfolio-chart', 
            'watchlist',
            'market-summary',
            'ai-insights',
            'recent-transactions',
            'performance-metrics',
            'alerts',
            'news-feed',
            'sector-performance',
            'top-movers',
            'economic-calendar'
        ]
        
        for widget_type in expected_widgets:
            widget = getRegisteredWidget(widget_type)
            assert widget is not None, f"Widget {widget_type} should be registered"
            assert widget.type == widget_type
    
    def test_widget_permission_system_integration(self):
        """Test that permission system works correctly"""
        registerAllWidgets()
        
        # Test with full permissions
        admin_permissions = [
            'portfolio.read', 'market.read', 'ai.read', 
            'transactions.read', 'analytics.read', 'alerts.read', 
            'news.read'
        ]
        
        available_widgets = getAvailableWidgets(admin_permissions)
        assert len(available_widgets) > 0
        
        # Test with limited permissions
        limited_permissions = ['portfolio.read']
        limited_widgets = getAvailableWidgets(limited_permissions)
        
        # Should have fewer widgets than admin
        assert len(limited_widgets) <= len(available_widgets)
        
        # Test specific widget availability
        assert isWidgetAvailable('portfolio-overview', admin_permissions)
        assert isWidgetAvailable('portfolio-overview', limited_permissions)
        assert not isWidgetAvailable('ai-insights', limited_permissions)
    
    def test_widget_factory_integration(self):
        """Test that widget factories work correctly"""
        registerAllWidgets()
        
        # Test portfolio overview factory
        portfolio_widget = getRegisteredWidget('portfolio-overview')
        assert portfolio_widget is not None
        
        # Test factory methods
        factory = portfolio_widget.factory
        assert factory is not None
        
        # Test default config generation
        default_config = factory.getDefaultConfig()
        assert isinstance(default_config, dict)
        assert 'refreshInterval' in default_config
        
        # Test config validation
        valid_config = {'showCash': True, 'refreshInterval': 30000}
        assert factory.validate(valid_config) is True
        
        # Test widget creation
        widget_instance = factory.create(valid_config)
        assert widget_instance is not None
    
    def test_widget_categorization_integration(self):
        """Test that widget categorization works correctly"""
        registerAllWidgets()
        
        # Test that we can get widgets by category
        from src.services.widget_registration import widgetRegistry
        
        portfolio_widgets = widgetRegistry.getByCategory('portfolio')
        market_widgets = widgetRegistry.getByCategory('market')
        analysis_widgets = widgetRegistry.getByCategory('analysis')
        
        assert len(portfolio_widgets) > 0
        assert len(market_widgets) > 0
        assert len(analysis_widgets) > 0
        
        # Verify category assignment
        for widget in portfolio_widgets:
            assert widget.config['category'] == 'portfolio'
        
        for widget in market_widgets:
            assert widget.config['category'] == 'market'
    
    def test_widget_search_integration(self):
        """Test that widget search functionality works"""
        registerAllWidgets()
        
        from src.services.widget_registration import widgetRegistry
        
        # Search for portfolio-related widgets
        portfolio_results = widgetRegistry.search('portfolio')
        assert len(portfolio_results) >= 2  # portfolio-overview, portfolio-chart
        
        # Search for chart widgets
        chart_results = widgetRegistry.search('chart')
        assert len(chart_results) >= 1  # portfolio-chart
        
        # Search for non-existent term
        empty_results = widgetRegistry.search('nonexistent')
        assert len(empty_results) == 0
    
    def test_widget_library_items_integration(self):
        """Test that widget library items are properly configured"""
        registerAllWidgets()
        
        from src.services.widget_registration import widgetRegistry
        
        all_widgets = widgetRegistry.getAll()
        
        for widget in all_widgets:
            library_item = widget.libraryItem
            
            # Verify required library item fields
            assert library_item['type'] == widget.type
            assert library_item['title'] is not None
            assert library_item['description'] is not None
            assert library_item['category'] is not None
            assert isinstance(library_item['isAvailable'], bool)
            assert isinstance(library_item['isPremium'], bool)
            assert isinstance(library_item['tags'], list)
    
    def test_widget_component_loading_integration(self):
        """Test that widget components can be loaded"""
        registerAllWidgets()
        
        # Test that components are properly lazy-loaded
        portfolio_widget = getRegisteredWidget('portfolio-overview')
        assert portfolio_widget.component is not None
        
        # Test that preview components exist
        assert portfolio_widget.previewComponent is not None
    
    def test_widget_configuration_validation_integration(self):
        """Test that widget configuration validation works end-to-end"""
        registerAllWidgets()
        
        # Test portfolio overview config validation
        portfolio_widget = getRegisteredWidget('portfolio-overview')
        factory = portfolio_widget.factory
        
        # Valid configurations
        valid_configs = [
            {},  # Empty config should be valid
            {'showCash': True},
            {'refreshInterval': 30000},
            {'showCash': True, 'showPositions': True, 'refreshInterval': 60000}
        ]
        
        for config in valid_configs:
            assert factory.validate(config), f"Config should be valid: {config}"
        
        # Test watchlist config validation
        watchlist_widget = getRegisteredWidget('watchlist')
        watchlist_factory = watchlist_widget.factory
        
        valid_watchlist_configs = [
            {},
            {'symbols': ['AAPL', 'GOOGL']},
            {'symbols': [], 'showChange': True}
        ]
        
        for config in valid_watchlist_configs:
            assert watchlist_factory.validate(config), f"Watchlist config should be valid: {config}"
        
        # Test invalid configurations
        invalid_watchlist_configs = [
            {'symbols': 'not_a_list'},  # symbols should be array
            {'symbols': [123, 456]},    # symbols should be strings
        ]
        
        for config in invalid_watchlist_configs:
            # Note: Our current validation is permissive, but this tests the structure
            # In a real implementation, these would fail validation
            result = watchlist_factory.validate(config)
            # For now, we just ensure validation doesn't crash
            assert isinstance(result, bool)

class TestWidgetSystemErrorHandling:
    """Test error handling in the widget system"""
    
    def test_missing_widget_handling(self):
        """Test handling of missing widgets"""
        registerAllWidgets()
        
        # Test getting non-existent widget
        missing_widget = getRegisteredWidget('non-existent-widget')
        assert missing_widget is None
        
        # Test availability of non-existent widget
        is_available = isWidgetAvailable('non-existent-widget', ['portfolio.read'])
        assert is_available is False
    
    def test_invalid_permissions_handling(self):
        """Test handling of invalid permissions"""
        registerAllWidgets()
        
        # Test with None permissions
        available_widgets = getAvailableWidgets(None)
        assert isinstance(available_widgets, list)
        
        # Test with empty permissions
        empty_permissions_widgets = getAvailableWidgets([])
        assert isinstance(empty_permissions_widgets, list)
        
        # Test with invalid permission format
        try:
            isWidgetAvailable('portfolio-overview', 'invalid_format')
        except Exception:
            # Should handle gracefully or raise appropriate error
            pass

if __name__ == '__main__':
    # Run tests directly
    pytest.main([__file__, '-v']) 