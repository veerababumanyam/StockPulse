"""
Authentication event models for MCP integration.
Tracks authentication events and agent notifications for audit and monitoring.
"""

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.declarative import declarative_base

from .user_context import UserContext

Base = declarative_base()


class AuthenticationEventType(str, Enum):
    """Types of authentication events."""

    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    CONTEXT_UPDATE = "context_update"
    PREFERENCE_CHANGE = "preference_change"
    SESSION_REFRESH = "session_refresh"
    PASSWORD_CHANGE = "password_change"
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"


class AgentNotificationStatus(str, Enum):
    """Status of agent notifications."""

    PENDING = "pending"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETRY = "retry"
    EXPIRED = "expired"


class AuthenticationEvent(BaseModel):
    """Authentication event model for audit trail."""

    event_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()), description="Event identifier"
    )
    event_type: AuthenticationEventType = Field(
        ..., description="Type of authentication event"
    )
    user_id: str = Field(..., description="User identifier")
    user_context: Optional[UserContext] = Field(
        None, description="User context at event time"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Event timestamp"
    )
    session_info: Dict[str, Any] = Field(
        default_factory=dict, description="Session metadata"
    )
    correlation_id: str = Field(..., description="Request correlation identifier")
    ip_address: Optional[str] = Field(None, description="Client IP address")
    user_agent: Optional[str] = Field(None, description="Client user agent")
    additional_data: Dict[str, Any] = Field(
        default_factory=dict, description="Additional event data"
    )

    model_config = ConfigDict(
        use_enum_values=True,
        validate_assignment=True,
        json_encoders={datetime: lambda v: v.isoformat()},
    )


class AgentNotificationEvent(BaseModel):
    """Agent notification event model."""

    event_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()), description="Event identifier"
    )
    target_agent: str = Field(..., description="Target agent name")
    user_id: str = Field(..., description="User identifier")
    event_type: AuthenticationEventType = Field(
        ..., description="Authentication event type"
    )
    payload: Dict[str, Any] = Field(..., description="Notification payload")
    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="Event creation time"
    )
    processed_at: Optional[datetime] = Field(None, description="Event processing time")
    status: AgentNotificationStatus = Field(
        default=AgentNotificationStatus.PENDING, description="Notification status"
    )
    error_message: Optional[str] = Field(None, description="Error message if failed")
    retry_count: int = Field(default=0, description="Number of retry attempts")
    max_retries: int = Field(default=3, description="Maximum retry attempts")
    correlation_id: str = Field(..., description="Request correlation identifier")

    model_config = ConfigDict(
        use_enum_values=True,
        validate_assignment=True,
        json_encoders={datetime: lambda v: v.isoformat()},
    )

    @property
    def is_retryable(self) -> bool:
        """Check if notification can be retried."""
        return (
            self.status == AgentNotificationStatus.FAILED
            and self.retry_count < self.max_retries
        )

    def mark_delivered(self) -> None:
        """Mark notification as successfully delivered."""
        self.status = AgentNotificationStatus.DELIVERED
        self.processed_at = datetime.utcnow()

    def mark_failed(self, error_message: str) -> None:
        """Mark notification as failed."""
        self.status = AgentNotificationStatus.FAILED
        self.error_message = error_message
        self.processed_at = datetime.utcnow()

    def increment_retry(self) -> None:
        """Increment retry count and update status."""
        self.retry_count += 1
        if self.retry_count >= self.max_retries:
            self.status = AgentNotificationStatus.EXPIRED
        else:
            self.status = AgentNotificationStatus.RETRY


class AuthenticationEventTable(Base):
    """SQLAlchemy table for authentication events."""

    __tablename__ = "authentication_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(50), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    event_data = Column(JSONB, nullable=False)
    correlation_id = Column(UUID(as_uuid=True), nullable=False)
    ip_address = Column(String(45))  # IPv6 support
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class AgentNotificationEventTable(Base):
    """SQLAlchemy table for agent notification events."""

    __tablename__ = "agent_notification_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    target_agent = Column(String(100), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    event_type = Column(String(50), nullable=False)
    payload = Column(JSONB, nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    error_message = Column(Text)
    retry_count = Column(String(10), default="0")
    max_retries = Column(String(10), default="3")
    correlation_id = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    processed_at = Column(DateTime(timezone=True))


class EventStatistics(BaseModel):
    """Event statistics model for monitoring."""

    total_auth_events: int = Field(default=0, description="Total authentication events")
    total_agent_notifications: int = Field(
        default=0, description="Total agent notifications"
    )
    successful_notifications: int = Field(
        default=0, description="Successful notifications"
    )
    failed_notifications: int = Field(default=0, description="Failed notifications")
    pending_notifications: int = Field(default=0, description="Pending notifications")
    events_by_type: Dict[str, int] = Field(
        default_factory=dict, description="Events grouped by type"
    )
    events_by_agent: Dict[str, int] = Field(
        default_factory=dict, description="Notifications grouped by agent"
    )
    average_processing_time: float = Field(
        default=0.0, description="Average processing time in seconds"
    )

    model_config = ConfigDict(validate_assignment=True)
