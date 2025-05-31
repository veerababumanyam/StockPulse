"""
Pydantic schemas for widget data management
"""
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import UUID

# Widget Data Schemas

class WidgetDataResponse(BaseModel):
    """Response schema for widget data"""
    widget_type: str = Field(..., description="Type of widget")
    data: Dict[str, Any] = Field(..., description="Widget data payload")
    timestamp: datetime = Field(..., description="When the data was generated")
    is_cached: bool = Field(default=False, description="Whether data is from cache")
    cache_expires_at: Optional[datetime] = Field(None, description="When cached data expires")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class BulkWidgetDataResponse(BaseModel):
    """Response schema for bulk widget data requests"""
    widget_data: Dict[str, WidgetDataResponse] = Field(..., description="Widget data by type")
    errors: Dict[str, str] = Field(default_factory=dict, description="Errors by widget type")
    timestamp: datetime = Field(..., description="When the bulk request was processed")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Widget Configuration Schemas

class WidgetConfigRequest(BaseModel):
    """Request schema for widget configuration updates"""
    widget_type: str = Field(..., description="Type of widget")
    config: Dict[str, Any] = Field(..., description="Widget configuration data")
    
class WidgetConfigResponse(BaseModel):
    """Response schema for widget configuration"""
    widget_id: str = Field(..., description="Unique widget instance ID")
    widget_type: str = Field(..., description="Type of widget")
    config: Dict[str, Any] = Field(..., description="Widget configuration data")
    updated_at: datetime = Field(..., description="When configuration was last updated")
    message: str = Field(..., description="Response message")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Widget Subscription Schemas

class WidgetSubscriptionRequest(BaseModel):
    """Request schema for widget subscriptions"""
    widget_types: List[str] = Field(..., description="List of widget types to subscribe to")
    refresh_intervals: Optional[Dict[str, int]] = Field(None, description="Custom refresh intervals by widget type")
    
class WidgetSubscriptionResponse(BaseModel):
    """Response schema for widget subscriptions"""
    subscription_id: str = Field(..., description="Unique subscription ID")
    widget_types: List[str] = Field(..., description="Subscribed widget types")
    user_id: UUID = Field(..., description="User ID")
    created_at: datetime = Field(..., description="When subscription was created")
    is_active: bool = Field(..., description="Whether subscription is active")
    message: str = Field(..., description="Response message")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Widget Metrics Schemas

class WidgetMetricsResponse(BaseModel):
    """Response schema for widget usage metrics"""
    timeframe: str = Field(..., description="Timeframe for metrics")
    metrics: Dict[str, Any] = Field(..., description="Usage metrics data")
    generated_at: datetime = Field(..., description="When metrics were generated")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Widget Library Schemas

class WidgetLibraryItem(BaseModel):
    """Schema for widget library items"""
    widget_type: str = Field(..., description="Type of widget")
    title: str = Field(..., description="Display title")
    description: str = Field(..., description="Widget description")
    category: str = Field(..., description="Widget category")
    icon: str = Field(..., description="Icon identifier")
    is_available: bool = Field(..., description="Whether widget is available to user")
    is_premium: bool = Field(default=False, description="Whether widget requires premium subscription")
    tags: List[str] = Field(default_factory=list, description="Search tags")
    preview_url: Optional[str] = Field(None, description="Preview image URL")

class WidgetLibraryResponse(BaseModel):
    """Response schema for widget library"""
    widgets: List[WidgetLibraryItem] = Field(..., description="Available widgets")
    categories: List[str] = Field(..., description="Available categories")
    total_count: int = Field(..., description="Total number of widgets")
    
# Widget Performance Schemas

class WidgetPerformanceMetrics(BaseModel):
    """Schema for widget performance metrics"""
    widget_type: str = Field(..., description="Type of widget")
    load_time_ms: float = Field(..., description="Average load time in milliseconds")
    error_rate: float = Field(..., description="Error rate percentage")
    cache_hit_rate: float = Field(..., description="Cache hit rate percentage")
    last_updated: datetime = Field(..., description="When metrics were last updated")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class WidgetPerformanceResponse(BaseModel):
    """Response schema for widget performance data"""
    metrics: List[WidgetPerformanceMetrics] = Field(..., description="Performance metrics by widget")
    overall_performance: Dict[str, float] = Field(..., description="Overall performance summary")
    generated_at: datetime = Field(..., description="When performance data was generated")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Widget Health Schemas

class WidgetHealthStatus(BaseModel):
    """Schema for widget health status"""
    widget_type: str = Field(..., description="Type of widget")
    status: str = Field(..., description="Health status (healthy, degraded, unhealthy)")
    last_check: datetime = Field(..., description="When health was last checked")
    response_time_ms: Optional[float] = Field(None, description="Response time in milliseconds")
    error_message: Optional[str] = Field(None, description="Error message if unhealthy")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class WidgetHealthResponse(BaseModel):
    """Response schema for widget health checks"""
    overall_status: str = Field(..., description="Overall system health status")
    widget_statuses: List[WidgetHealthStatus] = Field(..., description="Health status by widget")
    checked_at: datetime = Field(..., description="When health check was performed")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 