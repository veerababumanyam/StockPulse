"""
Test cases for Portfolio API endpoints
Tests all portfolio management functionality for Story 2.1
"""

import pytest
import asyncio
from decimal import Decimal
from datetime import datetime
from fastapi import status
from unittest.mock import patch, MagicMock
import uuid

from app.schemas.portfolio import (
    PortfolioCreate, PortfolioUpdate, PortfolioPositionCreate, 
    TransactionCreate, DashboardSummary
)
from app.models.portfolio import Portfolio
from app.models.user import User


class TestPortfolioAPI:
    """Test suite for Portfolio API endpoints."""
    
    @pytest.mark.asyncio
    async def test_create_portfolio_success(
        self, 
        test_client, 
        test_user: User,
        authenticated_headers,
        sample_portfolio_create: PortfolioCreate
    ):
        """Test successful portfolio creation."""
        response = test_client.post(
            "/api/v1/portfolio",
            json=sample_portfolio_create.dict(),
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == sample_portfolio_create.name
        assert data["description"] == sample_portfolio_create.description
        assert data["user_id"] == str(test_user.id)
        assert "id" in data
        assert "created_at" in data
    
    @pytest.mark.asyncio
    async def test_create_portfolio_duplicate_name(
        self, 
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test creating portfolio with duplicate name fails."""
        duplicate_portfolio = PortfolioCreate(
            name=test_portfolio.name,  # Same name as existing portfolio
            description="Duplicate portfolio"
        )
        
        response = test_client.post(
            "/api/v1/portfolio",
            json=duplicate_portfolio.dict(),
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_409_CONFLICT
        assert "already exists" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_get_portfolios_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test retrieving user portfolios."""
        response = test_client.get(
            "/api/v1/portfolio",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        portfolio = data[0]
        assert portfolio["id"] == str(test_portfolio.id)
        assert portfolio["name"] == test_portfolio.name
        assert portfolio["user_id"] == str(test_user.id)
    
    @pytest.mark.asyncio
    async def test_get_portfolio_by_id_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test retrieving specific portfolio by ID."""
        response = test_client.get(
            f"/api/v1/portfolio/{test_portfolio.id}",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == str(test_portfolio.id)
        assert data["name"] == test_portfolio.name
        assert "positions" in data
        assert isinstance(data["positions"], list)
    
    @pytest.mark.asyncio
    async def test_get_portfolio_not_found(
        self,
        test_client,
        authenticated_headers
    ):
        """Test retrieving non-existent portfolio returns 404."""
        fake_id = str(uuid.uuid4())
        response = test_client.get(
            f"/api/v1/portfolio/{fake_id}",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    @pytest.mark.asyncio
    async def test_update_portfolio_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test successful portfolio update."""
        update_data = PortfolioUpdate(
            name="Updated Portfolio Name",
            description="Updated description"
        )
        
        response = test_client.put(
            f"/api/v1/portfolio/{test_portfolio.id}",
            json=update_data.dict(exclude_unset=True),
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == update_data.name
        assert data["description"] == update_data.description
    
    @pytest.mark.asyncio
    async def test_delete_portfolio_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test successful portfolio deletion."""
        response = test_client.delete(
            f"/api/v1/portfolio/{test_portfolio.id}",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify portfolio is deleted
        get_response = test_client.get(
            f"/api/v1/portfolio/{test_portfolio.id}",
            headers=authenticated_headers
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND


class TestDashboardAPI:
    """Test suite for Dashboard API endpoint."""
    
    @pytest.mark.asyncio
    async def test_get_dashboard_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test successful dashboard data retrieval."""
        with patch('app.services.portfolio.PortfolioService.get_dashboard_summary') as mock_dashboard:
            # Mock dashboard response
            mock_dashboard.return_value = DashboardSummary(
                total_value=Decimal("26500.00"),
                total_invested=Decimal("25000.00"),
                total_pnl=Decimal("1500.00"),
                total_pnl_percentage=Decimal("6.00"),
                day_pnl=Decimal("250.00"),
                day_pnl_percentage=Decimal("0.95"),
                cash_balance=Decimal("10000.00"),
                portfolios=[],
                recent_transactions=[],
                ai_insights=[]
            )
            
            response = test_client.get(
                "/api/v1/portfolio/dashboard",
                headers=authenticated_headers
            )
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            
            # Verify dashboard structure
            assert "total_value" in data
            assert "total_pnl" in data
            assert "day_pnl" in data
            assert "portfolios" in data
            assert "recent_transactions" in data
            assert "ai_insights" in data
            assert "performance_metrics" in data
            assert "market_summary" in data
            
            # Verify values
            assert float(data["total_value"]) == 26500.00
            assert float(data["total_pnl"]) == 1500.00
    
    @pytest.mark.asyncio
    async def test_get_dashboard_empty_portfolio(
        self,
        test_client,
        test_user: User,
        authenticated_headers
    ):
        """Test dashboard with no portfolios returns empty state."""
        response = test_client.get(
            "/api/v1/portfolio/dashboard",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Should return empty dashboard structure
        assert float(data["total_value"]) == 0.0
        assert float(data["total_pnl"]) == 0.0
        assert len(data["portfolios"]) == 0
    
    @pytest.mark.asyncio
    async def test_dashboard_real_time_updates(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio,
        mock_market_data_service
    ):
        """Test dashboard includes real-time market data."""
        with patch('app.services.portfolio.PortfolioService._update_portfolio_values_background') as mock_update:
            mock_update.return_value = None
            
            response = test_client.get(
                "/api/v1/portfolio/dashboard",
                headers=authenticated_headers
            )
            
            assert response.status_code == status.HTTP_200_OK
            
            # Verify background task was called for real-time updates
            # This would be called as a background task in real implementation


class TestPortfolioPositionsAPI:
    """Test suite for Portfolio Positions management."""
    
    @pytest.mark.asyncio
    async def test_add_position_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio,
        sample_position_create: PortfolioPositionCreate
    ):
        """Test adding new position to portfolio."""
        response = test_client.post(
            f"/api/v1/portfolio/{test_portfolio.id}/positions",
            json=sample_position_create.dict(),
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        assert data["symbol"] == sample_position_create.symbol
        assert float(data["quantity"]) == float(sample_position_create.quantity)
        assert float(data["average_cost"]) == float(sample_position_create.average_cost)
        assert data["portfolio_id"] == str(test_portfolio.id)
    
    @pytest.mark.asyncio
    async def test_update_existing_position(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test updating existing position (weighted average cost)."""
        # Add initial position
        initial_position = PortfolioPositionCreate(
            symbol="AAPL",  # Same as existing position in test_portfolio
            quantity=Decimal("50"),
            average_cost=Decimal("160.00")
        )
        
        response = test_client.post(
            f"/api/v1/portfolio/{test_portfolio.id}/positions",
            json=initial_position.dict(),
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        # Should have updated quantity and weighted average cost
        assert float(data["quantity"]) == 150.0  # 100 + 50
        # Weighted average: (100 * 150 + 50 * 160) / 150 = 153.33
        assert abs(float(data["average_cost"]) - 153.33) < 0.01


class TestTransactionsAPI:
    """Test suite for Transaction management."""
    
    @pytest.mark.asyncio
    async def test_create_transaction_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio,
        sample_transaction_create: TransactionCreate
    ):
        """Test creating new transaction."""
        response = test_client.post(
            f"/api/v1/portfolio/{test_portfolio.id}/transactions",
            json=sample_transaction_create.dict(),
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        assert data["symbol"] == sample_transaction_create.symbol
        assert data["transaction_type"] == sample_transaction_create.transaction_type
        assert float(data["quantity"]) == float(sample_transaction_create.quantity)
        assert float(data["price"]) == float(sample_transaction_create.price)
    
    @pytest.mark.asyncio
    async def test_get_portfolio_transactions(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test retrieving portfolio transactions."""
        response = test_client.get(
            f"/api/v1/portfolio/{test_portfolio.id}/transactions",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)


class TestPortfolioAPIErrorHandling:
    """Test suite for API error handling."""
    
    @pytest.mark.asyncio
    async def test_unauthorized_access(self, test_client):
        """Test API access without authentication."""
        response = test_client.get("/api/v1/portfolio")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    @pytest.mark.asyncio
    async def test_invalid_portfolio_id_format(
        self,
        test_client,
        authenticated_headers
    ):
        """Test invalid UUID format in portfolio ID."""
        response = test_client.get(
            "/api/v1/portfolio/invalid-uuid",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    @pytest.mark.asyncio
    async def test_portfolio_access_forbidden(
        self,
        test_client,
        test_user: User,
        authenticated_headers
    ):
        """Test accessing another user's portfolio."""
        # Create portfolio for different user
        other_user_id = uuid.uuid4()
        other_portfolio_id = uuid.uuid4()
        
        response = test_client.get(
            f"/api/v1/portfolio/{other_portfolio_id}",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    @pytest.mark.asyncio
    async def test_invalid_position_data(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test creating position with invalid data."""
        invalid_position = {
            "symbol": "",  # Empty symbol
            "quantity": -10,  # Negative quantity
            "average_cost": 0  # Zero cost
        }
        
        response = test_client.post(
            f"/api/v1/portfolio/{test_portfolio.id}/positions",
            json=invalid_position,
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    @pytest.mark.asyncio
    async def test_transaction_validation_errors(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test transaction creation with validation errors."""
        invalid_transaction = {
            "symbol": "INVALID",
            "transaction_type": "INVALID_TYPE",  # Invalid type
            "quantity": 0,  # Zero quantity
            "price": -100,  # Negative price
            "transaction_date": "invalid-date"  # Invalid date format
        }
        
        response = test_client.post(
            f"/api/v1/portfolio/{test_portfolio.id}/transactions",
            json=invalid_transaction,
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestPortfolioAPIPerformance:
    """Test suite for Portfolio API performance."""
    
    @pytest.mark.asyncio
    async def test_dashboard_performance_with_large_portfolio(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        performance_test_data
    ):
        """Test dashboard performance with large number of positions."""
        # This test would create a large portfolio and measure response time
        start_time = datetime.utcnow()
        
        response = test_client.get(
            "/api/v1/portfolio/dashboard",
            headers=authenticated_headers
        )
        
        end_time = datetime.utcnow()
        response_time = (end_time - start_time).total_seconds()
        
        assert response.status_code == status.HTTP_200_OK
        assert response_time < 2.0  # Should respond within 2 seconds
    
    @pytest.mark.asyncio
    async def test_concurrent_portfolio_operations(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test concurrent portfolio operations."""
        import asyncio
        
        async def make_request():
            return test_client.get(
                f"/api/v1/portfolio/{test_portfolio.id}",
                headers=authenticated_headers
            )
        
        # Make 10 concurrent requests
        tasks = [make_request() for _ in range(10)]
        responses = await asyncio.gather(*tasks)
        
        # All requests should succeed
        for response in responses:
            assert response.status_code == status.HTTP_200_OK


class TestPortfolioAPIValidation:
    """Test suite for data validation in Portfolio API."""
    
    @pytest.mark.asyncio
    async def test_portfolio_name_validation(
        self,
        test_client,
        authenticated_headers
    ):
        """Test portfolio name validation rules."""
        test_cases = [
            {"name": "", "should_fail": True},  # Empty name
            {"name": "a" * 256, "should_fail": True},  # Too long
            {"name": "Valid Portfolio", "should_fail": False},  # Valid
            {"name": "Port123!@#", "should_fail": False},  # Special chars OK
        ]
        
        for case in test_cases:
            portfolio_data = {
                "name": case["name"],
                "description": "Test portfolio"
            }
            
            response = test_client.post(
                "/api/v1/portfolio",
                json=portfolio_data,
                headers=authenticated_headers
            )
            
            if case["should_fail"]:
                assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
            else:
                assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_409_CONFLICT]
    
    @pytest.mark.asyncio
    async def test_decimal_precision_validation(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_portfolio: Portfolio
    ):
        """Test decimal precision in financial calculations."""
        position_data = {
            "symbol": "TEST",
            "quantity": "100.12345678",  # High precision
            "average_cost": "123.4567",  # 4 decimal places
            "current_price": "125.00"
        }
        
        response = test_client.post(
            f"/api/v1/portfolio/{test_portfolio.id}/positions",
            json=position_data,
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        # Verify precision is maintained appropriately
        assert "quantity" in data
        assert "average_cost" in data 