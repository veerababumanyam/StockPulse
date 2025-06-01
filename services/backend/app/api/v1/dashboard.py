"""
API Endpoints for User Dashboard Configuration
"""
from typing import Any, Dict
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import CurrentUser, get_current_user
from app.schemas.dashboard import (
    DashboardConfigCreate,
    DashboardConfigResponse,
    DashboardConfigUpdate,
    DashboardLayout,
    SaveLayoutRequest,
    SaveLayoutResponse,
)

# We'll need a service to handle database interactions
# from app.services.dashboard_service import dashboard_config_service # Assuming this will be created

# Assuming your User model is in app.models.user
# from app.models.user import User

# Assuming your DashboardConfig model is in app.models.dashboard
# from app.models.dashboard import DashboardConfig as DBDashboardConfig # SQLAlchemy model


# Create router for dashboard endpoints
router = APIRouter(tags=["Dashboards"])

# Default dashboard configuration for new users
DEFAULT_DASHBOARD_CONFIG = {
    "id": "default-dashboard",
    "name": "My Dashboard",
    "description": "Default StockPulse dashboard with essential widgets",
    "version": "1.0.0",
    "isDefault": True,
    "layouts": {
        "lg": {
            "breakpoint": "lg",
            "cols": 12,
            "rowHeight": 60,
            "margin": [16, 16],
            "containerPadding": [16, 16],
            "widgets": [
                # Row 1
                {
                    "id": "portfolio-overview-1",
                    "type": "portfolio-overview",
                    "title": "Portfolio Overview",
                    "position": {"x": 0, "y": 0, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "portfolio-chart-1",
                    "type": "portfolio-chart",
                    "title": "Portfolio Chart",
                    "position": {"x": 3, "y": 0, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "watchlist-1",
                    "type": "watchlist",
                    "title": "My Watchlist",
                    "position": {"x": 6, "y": 0, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "market-summary-1",
                    "type": "market-summary",
                    "title": "Market Summary",
                    "position": {"x": 9, "y": 0, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                # Row 2
                {
                    "id": "ai-insights-1",
                    "type": "ai-insights",
                    "title": "AI Insights",
                    "position": {"x": 0, "y": 3, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "recent-transactions-1",
                    "type": "recent-transactions",
                    "title": "Recent Transactions",
                    "position": {"x": 3, "y": 3, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "performance-metrics-1",
                    "type": "performance-metrics",
                    "title": "Performance Metrics",
                    "position": {"x": 6, "y": 3, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "alerts-1",
                    "type": "alerts",
                    "title": "Alerts",
                    "position": {"x": 9, "y": 3, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                # Row 3
                {
                    "id": "news-feed-1",
                    "type": "news-feed",
                    "title": "Market News",
                    "position": {"x": 0, "y": 6, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "sector-performance-1",
                    "type": "sector-performance",
                    "title": "Sector Performance",
                    "position": {"x": 3, "y": 6, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "top-movers-1",
                    "type": "top-movers",
                    "title": "Top Movers",
                    "position": {"x": 6, "y": 6, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "economic-calendar-1",
                    "type": "economic-calendar",
                    "title": "Economic Calendar",
                    "position": {"x": 9, "y": 6, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
            ],
        },
        "md": {
            "breakpoint": "md",
            "cols": 6,
            "rowHeight": 60,
            "margin": [12, 12],
            "containerPadding": [12, 12],
            "widgets": [
                # Row 1
                {
                    "id": "portfolio-overview-1",
                    "type": "portfolio-overview",
                    "title": "Portfolio Overview",
                    "position": {"x": 0, "y": 0, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "portfolio-chart-1",
                    "type": "portfolio-chart",
                    "title": "Portfolio Chart",
                    "position": {"x": 3, "y": 0, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                # Row 2
                {
                    "id": "watchlist-1",
                    "type": "watchlist",
                    "title": "My Watchlist",
                    "position": {"x": 0, "y": 3, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "market-summary-1",
                    "type": "market-summary",
                    "title": "Market Summary",
                    "position": {"x": 3, "y": 3, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                # Row 3
                {
                    "id": "ai-insights-1",
                    "type": "ai-insights",
                    "title": "AI Insights",
                    "position": {"x": 0, "y": 6, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "recent-transactions-1",
                    "type": "recent-transactions",
                    "title": "Recent Transactions",
                    "position": {"x": 3, "y": 6, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                # Row 4
                {
                    "id": "performance-metrics-1",
                    "type": "performance-metrics",
                    "title": "Performance Metrics",
                    "position": {"x": 0, "y": 9, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "alerts-1",
                    "type": "alerts",
                    "title": "Alerts",
                    "position": {"x": 3, "y": 9, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                # Row 5
                {
                    "id": "news-feed-1",
                    "type": "news-feed",
                    "title": "Market News",
                    "position": {"x": 0, "y": 12, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "sector-performance-1",
                    "type": "sector-performance",
                    "title": "Sector Performance",
                    "position": {"x": 3, "y": 12, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                # Row 6
                {
                    "id": "top-movers-1",
                    "type": "top-movers",
                    "title": "Top Movers",
                    "position": {"x": 0, "y": 15, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "economic-calendar-1",
                    "type": "economic-calendar",
                    "title": "Economic Calendar",
                    "position": {"x": 3, "y": 15, "w": 3, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
            ],
        },
        "sm": {
            "breakpoint": "sm",
            "cols": 4,
            "rowHeight": 60,
            "margin": [8, 8],
            "containerPadding": [8, 8],
            "widgets": [
                {
                    "id": "portfolio-overview-1",
                    "type": "portfolio-overview",
                    "title": "Portfolio Overview",
                    "position": {"x": 0, "y": 0, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "portfolio-chart-1",
                    "type": "portfolio-chart",
                    "title": "Portfolio Chart",
                    "position": {"x": 2, "y": 0, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "watchlist-1",
                    "type": "watchlist",
                    "title": "My Watchlist",
                    "position": {"x": 0, "y": 3, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "market-summary-1",
                    "type": "market-summary",
                    "title": "Market Summary",
                    "position": {"x": 2, "y": 3, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "ai-insights-1",
                    "type": "ai-insights",
                    "title": "AI Insights",
                    "position": {"x": 0, "y": 6, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "recent-transactions-1",
                    "type": "recent-transactions",
                    "title": "Recent Transactions",
                    "position": {"x": 2, "y": 6, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "performance-metrics-1",
                    "type": "performance-metrics",
                    "title": "Performance Metrics",
                    "position": {"x": 0, "y": 9, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "alerts-1",
                    "type": "alerts",
                    "title": "Alerts",
                    "position": {"x": 2, "y": 9, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "news-feed-1",
                    "type": "news-feed",
                    "title": "Market News",
                    "position": {"x": 0, "y": 12, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "sector-performance-1",
                    "type": "sector-performance",
                    "title": "Sector Performance",
                    "position": {"x": 2, "y": 12, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "top-movers-1",
                    "type": "top-movers",
                    "title": "Top Movers",
                    "position": {"x": 0, "y": 15, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "economic-calendar-1",
                    "type": "economic-calendar",
                    "title": "Economic Calendar",
                    "position": {"x": 2, "y": 15, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
            ],
        },
        "xs": {
            "breakpoint": "xs",
            "cols": 2,
            "rowHeight": 60,
            "margin": [8, 8],
            "containerPadding": [8, 8],
            "widgets": [
                {
                    "id": "portfolio-overview-1",
                    "type": "portfolio-overview",
                    "title": "Portfolio Overview",
                    "position": {"x": 0, "y": 0, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "portfolio-chart-1",
                    "type": "portfolio-chart",
                    "title": "Portfolio Chart",
                    "position": {"x": 0, "y": 3, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "watchlist-1",
                    "type": "watchlist",
                    "title": "My Watchlist",
                    "position": {"x": 0, "y": 6, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "market-summary-1",
                    "type": "market-summary",
                    "title": "Market Summary",
                    "position": {"x": 0, "y": 9, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "ai-insights-1",
                    "type": "ai-insights",
                    "title": "AI Insights",
                    "position": {"x": 0, "y": 12, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "recent-transactions-1",
                    "type": "recent-transactions",
                    "title": "Recent Transactions",
                    "position": {"x": 0, "y": 15, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "performance-metrics-1",
                    "type": "performance-metrics",
                    "title": "Performance Metrics",
                    "position": {"x": 0, "y": 18, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "alerts-1",
                    "type": "alerts",
                    "title": "Alerts",
                    "position": {"x": 0, "y": 21, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "news-feed-1",
                    "type": "news-feed",
                    "title": "Market News",
                    "position": {"x": 0, "y": 24, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "sector-performance-1",
                    "type": "sector-performance",
                    "title": "Sector Performance",
                    "position": {"x": 0, "y": 27, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "top-movers-1",
                    "type": "top-movers",
                    "title": "Top Movers",
                    "position": {"x": 0, "y": 30, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "economic-calendar-1",
                    "type": "economic-calendar",
                    "title": "Economic Calendar",
                    "position": {"x": 0, "y": 33, "w": 2, "h": 3},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
            ],
        },
        "xxs": {
            "breakpoint": "xxs",
            "cols": 1,
            "rowHeight": 60,
            "margin": [4, 4],
            "containerPadding": [4, 4],
            "widgets": [
                {
                    "id": "portfolio-overview-1",
                    "type": "portfolio-overview",
                    "title": "Portfolio Overview",
                    "position": {"x": 0, "y": 0, "w": 1, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "market-summary-1",
                    "type": "market-summary",
                    "title": "Market Summary",
                    "position": {"x": 0, "y": 4, "w": 1, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "watchlist-1",
                    "type": "watchlist",
                    "title": "Watchlist",
                    "position": {"x": 0, "y": 8, "w": 1, "h": 6},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "news-feed-1",
                    "type": "news-feed",
                    "title": "Market News",
                    "position": {"x": 0, "y": 14, "w": 1, "h": 6},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
            ],
        },
        "xl": {
            "breakpoint": "xl",
            "cols": 16,
            "rowHeight": 60,
            "margin": [20, 20],
            "containerPadding": [20, 20],
            "widgets": [
                # Row 1 - 4 widgets
                {
                    "id": "portfolio-overview-1",
                    "type": "portfolio-overview",
                    "title": "Portfolio Overview",
                    "position": {"x": 0, "y": 0, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "portfolio-chart-1",
                    "type": "portfolio-chart",
                    "title": "Portfolio Chart",
                    "position": {"x": 4, "y": 0, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "watchlist-1",
                    "type": "watchlist",
                    "title": "My Watchlist",
                    "position": {"x": 8, "y": 0, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "market-summary-1",
                    "type": "market-summary",
                    "title": "Market Summary",
                    "position": {"x": 12, "y": 0, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                # Row 2 - 4 widgets
                {
                    "id": "ai-insights-1",
                    "type": "ai-insights",
                    "title": "AI Insights",
                    "position": {"x": 0, "y": 4, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "recent-transactions-1",
                    "type": "recent-transactions",
                    "title": "Recent Transactions",
                    "position": {"x": 4, "y": 4, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "performance-metrics-1",
                    "type": "performance-metrics",
                    "title": "Performance Metrics",
                    "position": {"x": 8, "y": 4, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "alerts-1",
                    "type": "alerts",
                    "title": "Trading Alerts",
                    "position": {"x": 12, "y": 4, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                # Row 3 - 4 widgets
                {
                    "id": "news-feed-1",
                    "type": "news-feed",
                    "title": "Market News",
                    "position": {"x": 0, "y": 8, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "sector-performance-1",
                    "type": "sector-performance",
                    "title": "Sector Performance",
                    "position": {"x": 4, "y": 8, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "top-movers-1",
                    "type": "top-movers",
                    "title": "Top Movers",
                    "position": {"x": 8, "y": 8, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
                {
                    "id": "economic-calendar-1",
                    "type": "economic-calendar",
                    "title": "Economic Calendar",
                    "position": {"x": 12, "y": 8, "w": 4, "h": 4},
                    "isVisible": True,
                    "isLocked": False,
                    "config": {},
                },
            ],
        },
    },
    "metadata": {
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "createdBy": "system",
        "lastAccessedAt": "2024-01-01T00:00:00Z",
        "accessCount": 0,
        "tags": ["default", "starter"],
    },
}


@router.get(
    "/{dashboard_id}",
    summary="Get dashboard configuration",
    description="Retrieves a dashboard configuration by ID. Returns default configuration for 'default-dashboard'.",
)
async def get_dashboard_config(
    dashboard_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get dashboard configuration by ID.
    For now, returns a default configuration for any dashboard_id.
    In the future, this will fetch user-specific configurations from the database.
    """
    print(
        f"[Dashboard API] Fetching dashboard config for ID: {dashboard_id}, User: {current_user.email}"
    )

    # For now, return the default configuration for any dashboard ID
    # In production, this would query the database for user-specific configurations
    if dashboard_id == "default-dashboard" or True:  # Always return default for now
        return {
            "success": True,
            "data": DEFAULT_DASHBOARD_CONFIG,
            "message": "Dashboard configuration retrieved successfully",
        }

    # Future implementation would check database for user-specific dashboards
    # dashboard_config = await dashboard_service.get_user_dashboard(db, current_user.id, dashboard_id)
    # if not dashboard_config:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail=f"Dashboard '{dashboard_id}' not found"
    #     )
    # return {"success": True, "data": dashboard_config}


@router.put(
    "/{dashboard_id}",
    summary="Save dashboard configuration",
    description="Saves or updates a dashboard configuration.",
)
async def save_dashboard_config(
    dashboard_id: str,
    config: Dict[str, Any],
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Save or update dashboard configuration.
    For now, this is a placeholder that returns success.
    In production, this would save to the database.
    """
    print(
        f"[Dashboard API] Saving dashboard config for ID: {dashboard_id}, User: {current_user.email}"
    )
    print(f"[Dashboard API] Config data: {config}")

    # Future implementation would save to database
    # saved_config = await dashboard_service.save_user_dashboard(db, current_user.id, dashboard_id, config)

    return {
        "success": True,
        "data": config,
        "message": "Dashboard configuration saved successfully",
    }


@router.post(
    "",
    summary="Create new dashboard",
    description="Creates a new dashboard configuration.",
)
async def create_dashboard(
    config: Dict[str, Any],
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new dashboard configuration.
    """
    print(f"[Dashboard API] Creating new dashboard for User: {current_user.email}")

    # Future implementation would create in database
    # new_config = await dashboard_service.create_user_dashboard(db, current_user.id, config)

    return {
        "success": True,
        "data": config,
        "message": "Dashboard created successfully",
    }


# Add other endpoints (PATCH for widget config, DELETE for reset) later.

# To be included in a parent router, e.g., in services/backend/app/api/v1/users.py (if you create one)
# or potentially in services/backend/app/api/v1/auth.py if you want to extend it for /me sub-routes.
