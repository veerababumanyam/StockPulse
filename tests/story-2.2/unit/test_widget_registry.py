"""
Unit tests for Widget Registry System
Tests the core widget registration and management functionality
"""
import pytest
from unittest.mock import Mock, patch

# Import the widget registry and related components
from src.services.widget_registry import WidgetRegistry, WidgetMetadata, WidgetFactory
from src.services.widget_registration import registerAllWidgets, getRegisteredWidget, isWidgetAvailable
from src.types.dashboard import WidgetType, WidgetCategory

class TestWidgetRegistry:
    """Test cases for the WidgetRegistry class"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.registry = WidgetRegistry()
        
        # Mock widget component
        self.mock_component = Mock()
        self.mock_preview_component = Mock()
        
        # Sample widget metadata
        self.sample_metadata = WidgetMetadata(
            type='test-widget',
            config={
                'id': 'test-widget',
                'type': 'test-widget',
                'title': 'Test Widget',
                'description': 'A test widget',
                'icon': 'TestIcon',
                'category': 'portfolio',
                'isEnabled': True,
            },
            libraryItem={
                'type': 'test-widget',
                'title': 'Test Widget',
                'description': 'A test widget for testing',
                'icon': Mock(),
                'category': 'portfolio',
                'isAvailable': True,
                'isPremium': False,
                'tags': ['test', 'widget'],
            },
            component=self.mock_component,
            previewComponent=self.mock_preview_component,
            permissions=['test.read'],
            dataRequirements=['test_data'],
        )
        
        # Sample widget factory
        self.sample_factory = WidgetFactory(
            create=Mock(return_value=self.mock_component),
            validate=Mock(return_value=True),
            getDefaultConfig=Mock(return_value={'test': True}),
        )
    
    def test_register_widget(self):
        """Test widget registration"""
        # Register widget
        self.registry.register(self.sample_metadata, self.sample_factory)
        
        # Verify widget is registered
        assert self.registry.has('test-widget')
        registered_widget = self.registry.get('test-widget')
        assert registered_widget is not None
        assert registered_widget.type == 'test-widget'
        assert registered_widget.config['title'] == 'Test Widget'
    
    def test_register_duplicate_widget(self):
        """Test registering duplicate widget throws error"""
        # Register widget first time
        self.registry.register(self.sample_metadata, self.sample_factory)
        
        # Try to register again - should raise error
        with pytest.raises(ValueError, match="Widget test-widget is already registered"):
            self.registry.register(self.sample_metadata, self.sample_factory)
    
    def test_get_nonexistent_widget(self):
        """Test getting non-existent widget returns None"""
        result = self.registry.get('nonexistent-widget')
        assert result is None
    
    def test_get_all_widgets(self):
        """Test getting all registered widgets"""
        # Register multiple widgets
        metadata2 = {**self.sample_metadata}
        metadata2['type'] = 'test-widget-2'
        metadata2['config']['id'] = 'test-widget-2'
        metadata2['config']['type'] = 'test-widget-2'
        metadata2['libraryItem']['type'] = 'test-widget-2'
        
        self.registry.register(self.sample_metadata, self.sample_factory)
        self.registry.register(metadata2, self.sample_factory)
        
        all_widgets = self.registry.getAll()
        assert len(all_widgets) == 2
        widget_types = [w.type for w in all_widgets]
        assert 'test-widget' in widget_types
        assert 'test-widget-2' in widget_types
    
    def test_get_widgets_by_category(self):
        """Test getting widgets by category"""
        # Register widgets in different categories
        portfolio_metadata = {**self.sample_metadata}
        portfolio_metadata['config']['category'] = 'portfolio'
        portfolio_metadata['libraryItem']['category'] = 'portfolio'
        
        market_metadata = {**self.sample_metadata}
        market_metadata['type'] = 'market-widget'
        market_metadata['config']['id'] = 'market-widget'
        market_metadata['config']['type'] = 'market-widget'
        market_metadata['config']['category'] = 'market'
        market_metadata['libraryItem']['type'] = 'market-widget'
        market_metadata['libraryItem']['category'] = 'market'
        
        self.registry.register(portfolio_metadata, self.sample_factory)
        self.registry.register(market_metadata, self.sample_factory)
        
        portfolio_widgets = self.registry.getByCategory('portfolio')
        market_widgets = self.registry.getByCategory('market')
        
        assert len(portfolio_widgets) == 1
        assert len(market_widgets) == 1
        assert portfolio_widgets[0].config['category'] == 'portfolio'
        assert market_widgets[0].config['category'] == 'market'
    
    def test_search_widgets(self):
        """Test widget search functionality"""
        # Register widgets with different tags
        widget1_metadata = {**self.sample_metadata}
        widget1_metadata['libraryItem']['tags'] = ['portfolio', 'overview']
        
        widget2_metadata = {**self.sample_metadata}
        widget2_metadata['type'] = 'chart-widget'
        widget2_metadata['config']['id'] = 'chart-widget'
        widget2_metadata['config']['type'] = 'chart-widget'
        widget2_metadata['libraryItem']['type'] = 'chart-widget'
        widget2_metadata['libraryItem']['tags'] = ['portfolio', 'chart', 'visualization']
        
        self.registry.register(widget1_metadata, self.sample_factory)
        self.registry.register(widget2_metadata, self.sample_factory)
        
        # Search by tag
        portfolio_results = self.registry.search('portfolio')
        chart_results = self.registry.search('chart')
        
        assert len(portfolio_results) == 2
        assert len(chart_results) == 1
        assert chart_results[0].type == 'chart-widget'
    
    def test_check_permissions(self):
        """Test permission checking"""
        self.registry.register(self.sample_metadata, self.sample_factory)
        
        # Test with correct permissions
        assert self.registry.checkPermissions('test-widget', ['test.read'])
        assert self.registry.checkPermissions('test-widget', ['test.read', 'other.permission'])
        
        # Test with incorrect permissions
        assert not self.registry.checkPermissions('test-widget', ['wrong.permission'])
        assert not self.registry.checkPermissions('test-widget', [])
    
    def test_is_available(self):
        """Test widget availability checking"""
        # Register enabled widget
        enabled_metadata = {**self.sample_metadata}
        enabled_metadata['config']['isEnabled'] = True
        enabled_metadata['libraryItem']['isAvailable'] = True
        
        # Register disabled widget
        disabled_metadata = {**self.sample_metadata}
        disabled_metadata['type'] = 'disabled-widget'
        disabled_metadata['config']['id'] = 'disabled-widget'
        disabled_metadata['config']['type'] = 'disabled-widget'
        disabled_metadata['config']['isEnabled'] = False
        disabled_metadata['libraryItem']['type'] = 'disabled-widget'
        disabled_metadata['libraryItem']['isAvailable'] = False
        
        self.registry.register(enabled_metadata, self.sample_factory)
        self.registry.register(disabled_metadata, self.sample_factory)
        
        assert self.registry.isAvailable('test-widget')
        assert not self.registry.isAvailable('disabled-widget')
    
    def test_get_categories_with_counts(self):
        """Test getting categories with widget counts"""
        # Register widgets in different categories
        portfolio_metadata1 = {**self.sample_metadata}
        portfolio_metadata1['config']['category'] = 'portfolio'
        portfolio_metadata1['libraryItem']['category'] = 'portfolio'
        
        portfolio_metadata2 = {**self.sample_metadata}
        portfolio_metadata2['type'] = 'portfolio-widget-2'
        portfolio_metadata2['config']['id'] = 'portfolio-widget-2'
        portfolio_metadata2['config']['type'] = 'portfolio-widget-2'
        portfolio_metadata2['config']['category'] = 'portfolio'
        portfolio_metadata2['libraryItem']['type'] = 'portfolio-widget-2'
        portfolio_metadata2['libraryItem']['category'] = 'portfolio'
        
        market_metadata = {**self.sample_metadata}
        market_metadata['type'] = 'market-widget'
        market_metadata['config']['id'] = 'market-widget'
        market_metadata['config']['type'] = 'market-widget'
        market_metadata['config']['category'] = 'market'
        market_metadata['libraryItem']['type'] = 'market-widget'
        market_metadata['libraryItem']['category'] = 'market'
        
        self.registry.register(portfolio_metadata1, self.sample_factory)
        self.registry.register(portfolio_metadata2, self.sample_factory)
        self.registry.register(market_metadata, self.sample_factory)
        
        categories = self.registry.getCategoriesWithCounts()
        
        # Find portfolio and market categories
        portfolio_category = next((c for c in categories if c['category'] == 'portfolio'), None)
        market_category = next((c for c in categories if c['category'] == 'market'), None)
        
        assert portfolio_category is not None
        assert portfolio_category['count'] == 2
        assert market_category is not None
        assert market_category['count'] == 1

class TestWidgetRegistration:
    """Test cases for widget registration functions"""
    
    @patch('src.services.widget_registration.widgetRegistry')
    def test_register_all_widgets(self, mock_registry):
        """Test registering all widgets"""
        mock_registry.register = Mock()
        mock_registry.getAll = Mock(return_value=[])
        mock_registry.getCategoriesWithCounts = Mock(return_value=[])
        
        # Call registration function
        registerAllWidgets()
        
        # Verify registry.register was called for each widget type
        assert mock_registry.register.call_count == 12  # 12 widget types defined
    
    def test_get_registered_widget_exists(self):
        """Test getting an existing registered widget"""
        with patch('src.services.widget_registration.widgetRegistry') as mock_registry:
            mock_widget = Mock()
            mock_registry.get.return_value = mock_widget
            
            result = getRegisteredWidget('portfolio-overview')
            
            assert result == mock_widget
            mock_registry.get.assert_called_once_with('portfolio-overview')
    
    def test_get_registered_widget_not_exists(self):
        """Test getting a non-existent widget"""
        with patch('src.services.widget_registration.widgetRegistry') as mock_registry:
            mock_registry.get.return_value = None
            
            result = getRegisteredWidget('nonexistent-widget')
            
            assert result is None
            mock_registry.get.assert_called_once_with('nonexistent-widget')
    
    def test_is_widget_available_true(self):
        """Test widget availability check when widget is available"""
        with patch('src.services.widget_registration.widgetRegistry') as mock_registry:
            mock_registry.isAvailable.return_value = True
            mock_registry.checkPermissions.return_value = True
            
            result = isWidgetAvailable('portfolio-overview', ['portfolio.read'])
            
            assert result is True
            mock_registry.isAvailable.assert_called_once_with('portfolio-overview')
            mock_registry.checkPermissions.assert_called_once_with('portfolio-overview', ['portfolio.read'])
    
    def test_is_widget_available_false_not_available(self):
        """Test widget availability check when widget is not available"""
        with patch('src.services.widget_registration.widgetRegistry') as mock_registry:
            mock_registry.isAvailable.return_value = False
            mock_registry.checkPermissions.return_value = True
            
            result = isWidgetAvailable('portfolio-overview', ['portfolio.read'])
            
            assert result is False
            mock_registry.isAvailable.assert_called_once_with('portfolio-overview')
    
    def test_is_widget_available_false_no_permissions(self):
        """Test widget availability check when user lacks permissions"""
        with patch('src.services.widget_registration.widgetRegistry') as mock_registry:
            mock_registry.isAvailable.return_value = True
            mock_registry.checkPermissions.return_value = False
            
            result = isWidgetAvailable('portfolio-overview', ['wrong.permission'])
            
            assert result is False
            mock_registry.isAvailable.assert_called_once_with('portfolio-overview')
            mock_registry.checkPermissions.assert_called_once_with('portfolio-overview', ['wrong.permission'])

class TestWidgetFactory:
    """Test cases for widget factory functionality"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.mock_component = Mock()
        
    def test_widget_factory_create(self):
        """Test widget factory create method"""
        factory = WidgetFactory(
            create=Mock(return_value=self.mock_component),
            validate=Mock(return_value=True),
            getDefaultConfig=Mock(return_value={'test': True}),
        )
        
        config = {'custom': 'config'}
        result = factory.create(config)
        
        assert result == self.mock_component
        factory.create.assert_called_once_with(config)
    
    def test_widget_factory_validate_valid(self):
        """Test widget factory validation with valid config"""
        factory = WidgetFactory(
            create=Mock(),
            validate=Mock(return_value=True),
            getDefaultConfig=Mock(),
        )
        
        config = {'valid': 'config'}
        result = factory.validate(config)
        
        assert result is True
        factory.validate.assert_called_once_with(config)
    
    def test_widget_factory_validate_invalid(self):
        """Test widget factory validation with invalid config"""
        factory = WidgetFactory(
            create=Mock(),
            validate=Mock(return_value=False),
            getDefaultConfig=Mock(),
        )
        
        config = {'invalid': 'config'}
        result = factory.validate(config)
        
        assert result is False
        factory.validate.assert_called_once_with(config)
    
    def test_widget_factory_get_default_config(self):
        """Test widget factory default config retrieval"""
        default_config = {'default': 'config'}
        factory = WidgetFactory(
            create=Mock(),
            validate=Mock(),
            getDefaultConfig=Mock(return_value=default_config),
        )
        
        result = factory.getDefaultConfig()
        
        assert result == default_config
        factory.getDefaultConfig.assert_called_once()

if __name__ == '__main__':
    pytest.main([__file__]) 