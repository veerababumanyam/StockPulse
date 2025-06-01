"""
Pydantic schemas for Dashboard Configuration.
"""
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator

# Mirroring WidgetType from frontend
WidgetTypeLiterals = Literal[
    "portfolio-overview",
    "portfolio-chart",
    "watchlist",
    "market-summary",
    "ai-insights",
    "recent-transactions",
    "performance-metrics",
    "alerts",
    "news-feed",
    "sector-performance",
    "top-movers",
    "economic-calendar",
]


class WidgetInstanceLayout(BaseModel):
    """
    Layout details for a widget instance within a breakpoint.
    """

    x: int
    y: int
    w: int
    h: int
    minW: Optional[int] = None
    maxW: Optional[int] = None
    minH: Optional[int] = None
    maxH: Optional[int] = None
    isDraggable: Optional[bool] = None
    isResizable: Optional[bool] = None
    static: Optional[bool] = None


class WidgetInstance(BaseModel):
    """
    Represents a single widget instance placed on the dashboard.
    """

    id: str = Field(
        ...,
        description="Unique identifier for the widget instance (e.g., 'widget-portfolio-overview-123')",
    )
    type: WidgetTypeLiterals = Field(..., description="The type of the widget.")
    layout: Dict[str, WidgetInstanceLayout] = Field(
        ...,
        description="Layout position and dimensions for different breakpoints. Keys are breakpoint names (e.g., 'lg', 'md').",
    )
    config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Specific configuration for this widget instance.",
    )


class DashboardLayout(BaseModel):
    """
    Defines the arrangement of widgets on the dashboard.
    """

    widgets: List[WidgetInstance] = Field(
        default_factory=list, description="List of widget instances on the dashboard."
    )


class DashboardConfigBase(BaseModel):
    """
    Base schema for dashboard configuration.
    """

    name: str = Field(
        default="My Dashboard", description="Name of the dashboard configuration."
    )
    layout: DashboardLayout = Field(
        default_factory=DashboardLayout,
        description="The layout of widgets on the dashboard.",
    )


class DashboardConfigCreate(DashboardConfigBase):
    """
    Schema for creating a new dashboard configuration.
    """

    pass


class DashboardConfigUpdate(BaseModel):
    """
    Schema for updating an existing dashboard configuration.
    Allows partial updates.
    """

    name: Optional[str] = None
    layout: Optional[DashboardLayout] = None


class DashboardConfigDB(DashboardConfigBase):
    """
    Schema representing dashboard configuration as stored in the database.
    """

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # For Pydantic v2, orm_mode = True


class DashboardConfigResponseData(DashboardConfigDB):
    """
    The 'config' part of the DashboardConfigResponse, matching frontend's DashboardConfig type
    This inherits all fields from DashboardConfigDB
    """

    pass


class DashboardConfigResponse(BaseModel):
    """
    API response schema for fetching dashboard configuration.
    """

    success: bool = True
    config: DashboardConfigResponseData
    message: Optional[str] = None


class SaveLayoutRequest(BaseModel):
    """
    Request schema for saving a dashboard layout.
    Mirrors frontend type.
    """

    layout: DashboardLayout
    timestamp: str  # Keep as string as per frontend, convert in service if needed


class SaveLayoutResponse(BaseModel):
    """
    API response schema for saving a dashboard layout.
    """

    success: bool = True
    config: DashboardConfigResponseData  # This should return the full updated config
    message: Optional[str] = None
