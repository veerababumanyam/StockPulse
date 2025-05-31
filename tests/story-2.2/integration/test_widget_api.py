"""
Integration tests for Widget API Endpoints
Tests the complete widget data flow from API to database
"""
import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from datetime import datetime, timedelta

# Import the FastAPI app and dependencies
from services.backend.main import app
from services.backend.app.core.dependencies import get_current_user
from services.backend.app.schemas.widgets import (
    WidgetDataResponse,
    BulkWidgetDataResponse,
    WidgetConfigRequest,
    WidgetConfigResponse,
    WidgetSubscriptionRequest,
    WidgetSubscriptionResponse,
    WidgetMetricsResponse,
)

class TestWidgetDataAPI:
    """Integration tests for widget data endpoints"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.client = TestClient(app)
        
        # Mock user for authentication
        self.mock_user = Mock()
        self.mock_user.id = "test-user-123"
        self.mock_user.email = "test@example.com"
        
        # Override authentication dependency
        app.dependency_overrides[get_current_user] = lambda: self.mock_user
    
    def teardown_method(self):
        """Clean up after tests"""
        app.dependency_overrides.clear()
    
    def test_get_widget_data_portfolio_overview(self):
        """Test getting portfolio overview widget data"""
        response = self.client.get("/widgets/data/portfolio-overview")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "widget_type" in data
        assert "data" in data
        assert "timestamp" in data
        assert "is_cached" in data
        
        assert data["widget_type"] == "portfolio-overview"
        assert "total_value" in data["data"]
        assert "day_change" in data["data"]
        assert "positions" in data["data"]
        assert "cash" in data["data"]
    
    def test_get_widget_data_market_summary(self):
        """Test getting market summary widget data"""
        response = self.client.get("/widgets/data/market-summary")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["widget_type"] == "market-summary"
        assert "indices" in data["data"]
        assert len(data["data"]["indices"]) > 0
        
        # Verify index data structure
        index = data["data"]["indices"][0]
        assert "symbol" in index
        assert "value" in index
        assert "change" in index
        assert "change_percent" in index
    
    def test_get_widget_data_watchlist_with_config(self):
        """Test getting watchlist data with custom configuration"""
        config = {"symbols": ["AAPL", "GOOGL", "MSFT"]}
        response = self.client.get(
            "/widgets/data/watchlist",
            params={"config": config}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["widget_type"] == "watchlist"
        assert "stocks" in data["data"]
        
        # Verify custom symbols are included
        symbols = [stock["symbol"] for stock in data["data"]["stocks"]]
        assert "AAPL" in symbols
        assert "GOOGL" in symbols
        assert "MSFT" in symbols
    
    def test_get_widget_data_unknown_type(self):
        """Test getting data for unknown widget type"""
        response = self.client.get("/widgets/data/unknown-widget")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["widget_type"] == "unknown-widget"
        assert "error" in data["data"]
        assert "Unknown widget type" in data["data"]["error"]
    
    def test_get_bulk_widget_data(self):
        """Test getting bulk widget data"""
        widget_types = ["portfolio-overview", "market-summary", "watchlist"]
        
        response = self.client.post(
            "/widgets/data/bulk",
            json=widget_types
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "widget_data" in data
        assert "errors" in data
        assert "timestamp" in data
        
        # Verify all requested widgets are included
        assert len(data["widget_data"]) == 3
        assert "portfolio-overview" in data["widget_data"]
        assert "market-summary" in data["widget_data"]
        assert "watchlist" in data["widget_data"]
        
        # Verify no errors
        assert len(data["errors"]) == 0
    
    def test_get_bulk_widget_data_with_configs(self):
        """Test getting bulk widget data with custom configurations"""
        widget_types = ["watchlist", "recent-transactions"]
        configs = {
            "watchlist": {"symbols": ["AAPL", "TSLA"]},
            "recent-transactions": {"limit": 5}
        }
        
        response = self.client.post(
            "/widgets/data/bulk",
            json=widget_types,
            params={"configs": configs}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify watchlist has custom symbols
        watchlist_data = data["widget_data"]["watchlist"]["data"]
        assert len(watchlist_data["stocks"]) == 2
        
        # Verify transactions has custom limit
        transactions_data = data["widget_data"]["recent-transactions"]["data"]
        assert len(transactions_data["transactions"]) == 5

class TestWidgetConfigAPI:
    """Integration tests for widget configuration endpoints"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.client = TestClient(app)
        
        # Mock user for authentication
        self.mock_user = Mock()
        self.mock_user.id = "test-user-123"
        
        # Override authentication dependency
        app.dependency_overrides[get_current_user] = lambda: self.mock_user
    
    def teardown_method(self):
        """Clean up after tests"""
        app.dependency_overrides.clear()
    
    def test_update_widget_config(self):
        """Test updating widget configuration"""
        widget_id = "widget-123"
        config_request = {
            "widget_type": "portfolio-overview",
            "config": {
                "showCash": True,
                "showPositions": True,
                "refreshInterval": 30000
            }
        }
        
        response = self.client.post(
            f"/widgets/config/{widget_id}",
            json=config_request
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["widget_id"] == widget_id
        assert data["widget_type"] == "portfolio-overview"
        assert data["config"]["showCash"] is True
        assert data["config"]["refreshInterval"] == 30000
        assert "updated_at" in data
        assert "message" in data
    
    def test_get_widget_config(self):
        """Test getting widget configuration"""
        widget_id = "widget-123"
        
        response = self.client.get(f"/widgets/config/{widget_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["widget_id"] == widget_id
        assert "widget_type" in data
        assert "config" in data
        assert "updated_at" in data
        assert "message" in data

class TestWidgetSubscriptionAPI:
    """Integration tests for widget subscription endpoints"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.client = TestClient(app)
        
        # Mock user for authentication
        self.mock_user = Mock()
        self.mock_user.id = "test-user-123"
        
        # Override authentication dependency
        app.dependency_overrides[get_current_user] = lambda: self.mock_user
    
    def teardown_method(self):
        """Clean up after tests"""
        app.dependency_overrides.clear()
    
    def test_subscribe_to_widgets(self):
        """Test subscribing to widget updates"""
        subscription_request = {
            "widget_types": ["portfolio-overview", "market-summary"],
            "refresh_intervals": {
                "portfolio-overview": 30000,
                "market-summary": 60000
            }
        }
        
        response = self.client.post(
            "/widgets/subscribe",
            json=subscription_request
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "subscription_id" in data
        assert data["widget_types"] == ["portfolio-overview", "market-summary"]
        assert str(self.mock_user.id) in data["user_id"]
        assert data["is_active"] is True
        assert "created_at" in data
        assert "message" in data
    
    def test_unsubscribe_from_widgets(self):
        """Test unsubscribing from widget updates"""
        subscription_id = "sub_test_123"
        
        response = self.client.delete(f"/widgets/subscribe/{subscription_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "unsubscribed" in data["message"].lower()

class TestWidgetMetricsAPI:
    """Integration tests for widget metrics endpoints"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.client = TestClient(app)
        
        # Mock user for authentication
        self.mock_user = Mock()
        self.mock_user.id = "test-user-123"
        
        # Override authentication dependency
        app.dependency_overrides[get_current_user] = lambda: self.mock_user
    
    def teardown_method(self):
        """Clean up after tests"""
        app.dependency_overrides.clear()
    
    def test_get_widget_metrics_default_timeframe(self):
        """Test getting widget metrics with default timeframe"""
        response = self.client.get("/widgets/metrics")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["timeframe"] == "7d"  # Default timeframe
        assert "metrics" in data
        assert "generated_at" in data
        
        # Verify metrics structure
        metrics = data["metrics"]
        assert "total_widgets" in metrics
        assert "active_widgets" in metrics
        assert "most_used_widget" in metrics
        assert "usage_by_widget" in metrics
        assert isinstance(metrics["usage_by_widget"], dict)
    
    def test_get_widget_metrics_custom_timeframe(self):
        """Test getting widget metrics with custom timeframe"""
        response = self.client.get("/widgets/metrics?timeframe=30d")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["timeframe"] == "30d"
        assert "metrics" in data

class TestWidgetAPIAuthentication:
    """Integration tests for widget API authentication"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.client = TestClient(app)
    
    def test_widget_data_requires_authentication(self):
        """Test that widget data endpoints require authentication"""
        response = self.client.get("/widgets/data/portfolio-overview")
        
        # Should return 401 or 403 without authentication
        assert response.status_code in [401, 403]
    
    def test_widget_config_requires_authentication(self):
        """Test that widget config endpoints require authentication"""
        response = self.client.get("/widgets/config/widget-123")
        
        # Should return 401 or 403 without authentication
        assert response.status_code in [401, 403]
    
    def test_widget_subscription_requires_authentication(self):
        """Test that widget subscription endpoints require authentication"""
        response = self.client.post("/widgets/subscribe", json={"widget_types": []})
        
        # Should return 401 or 403 without authentication
        assert response.status_code in [401, 403]
    
    def test_widget_metrics_requires_authentication(self):
        """Test that widget metrics endpoints require authentication"""
        response = self.client.get("/widgets/metrics")
        
        # Should return 401 or 403 without authentication
        assert response.status_code in [401, 403]

class TestWidgetAPIPerformance:
    """Integration tests for widget API performance"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.client = TestClient(app)
        
        # Mock user for authentication
        self.mock_user = Mock()
        self.mock_user.id = "test-user-123"
        
        # Override authentication dependency
        app.dependency_overrides[get_current_user] = lambda: self.mock_user
    
    def teardown_method(self):
        """Clean up after tests"""
        app.dependency_overrides.clear()
    
    def test_bulk_widget_data_performance(self):
        """Test that bulk widget data is faster than individual requests"""
        import time
        
        # Test individual requests
        start_time = time.time()
        for widget_type in ["portfolio-overview", "market-summary", "watchlist"]:
            response = self.client.get(f"/widgets/data/{widget_type}")
            assert response.status_code == 200
        individual_time = time.time() - start_time
        
        # Test bulk request
        start_time = time.time()
        response = self.client.post(
            "/widgets/data/bulk",
            json=["portfolio-overview", "market-summary", "watchlist"]
        )
        assert response.status_code == 200
        bulk_time = time.time() - start_time
        
        # Bulk should be faster (allowing some margin for test variability)
        assert bulk_time < individual_time * 0.8
    
    def test_widget_data_response_time(self):
        """Test that widget data responses are within acceptable time limits"""
        import time
        
        start_time = time.time()
        response = self.client.get("/widgets/data/portfolio-overview")
        response_time = time.time() - start_time
        
        assert response.status_code == 200
        # Response should be under 1 second
        assert response_time < 1.0

if __name__ == '__main__':
    pytest.main([__file__]) 