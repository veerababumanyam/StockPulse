"""Rate Limiting models for multi-level protection against abuse.

This module provides data models for rate limiting including IP-based,
account-based, and global rate limiting with violation tracking and
progressive lockout mechanisms.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Boolean, Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class RateLimitType(str, Enum):
    """Types of rate limiting implemented."""

    IP_BASED = "ip_based"
    ACCOUNT_BASED = "account_based"
    GLOBAL = "global"
    ENDPOINT_SPECIFIC = "endpoint_specific"


class RateLimitViolation(BaseModel):
    """Rate limit violation data for tracking and analysis.

    Used for recording and analyzing rate limit violations to detect
    patterns and implement progressive restrictions.
    """

    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)

    violation_id: str = Field(..., description="Unique violation identifier")

    limit_type: RateLimitType = Field(..., description="Type of rate limit violated")

    identifier: str = Field(..., description="IP address, user ID, or other identifier")

    endpoint: Optional[str] = Field(
        None, description="API endpoint if endpoint-specific limit"
    )

    violation_count: int = Field(
        default=1, description="Number of violations in this incident"
    )

    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="When violation occurred"
    )

    user_agent: Optional[str] = Field(
        None, description="User agent for pattern analysis"
    )

    is_blocked: bool = Field(
        default=False, description="Whether identifier is currently blocked"
    )


class RateLimit(Base):
    """Database model for rate limiting storage and tracking.

    Stores rate limit counters, violations, and blocking information
    for different types of rate limiting.
    """

    __tablename__ = "rate_limits"

    id = Column(Integer, primary_key=True, index=True)

    limit_type = Column(
        SQLEnum(RateLimitType), nullable=False, index=True, doc="Type of rate limit"
    )

    identifier = Column(
        String(255),
        nullable=False,
        index=True,
        doc="IP address, user ID, or other identifier",
    )

    endpoint = Column(
        String(255),
        nullable=True,
        index=True,
        doc="API endpoint for endpoint-specific limits",
    )

    current_count = Column(
        Integer, default=0, nullable=False, doc="Current request count in time window"
    )

    max_requests = Column(
        Integer, nullable=False, doc="Maximum requests allowed in time window"
    )

    window_start = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="Start of current time window",
    )

    window_duration = Column(
        Integer, nullable=False, doc="Time window duration in seconds"
    )

    violation_count = Column(
        Integer, default=0, nullable=False, doc="Total number of violations"
    )

    is_blocked = Column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether identifier is currently blocked",
    )

    blocked_until = Column(
        DateTime, nullable=True, doc="When block expires (if blocked)"
    )

    last_violation = Column(DateTime, nullable=True, doc="Timestamp of last violation")

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="When rate limit record was created",
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="When rate limit record was last updated",
    )

    def __repr__(self) -> str:
        """String representation of rate limit."""
        return (
            f"<RateLimit(type={self.limit_type}, "
            f"identifier={self.identifier}, "
            f"count={self.current_count}/{self.max_requests})>"
        )

    @property
    def is_window_expired(self) -> bool:
        """Check if current time window has expired."""
        window_end = self.window_start + timedelta(seconds=self.window_duration)
        return datetime.utcnow() > window_end

    @property
    def is_limit_exceeded(self) -> bool:
        """Check if rate limit has been exceeded."""
        return self.current_count >= self.max_requests

    @property
    def remaining_requests(self) -> int:
        """Get remaining requests in current window."""
        return max(0, self.max_requests - self.current_count)

    @property
    def time_until_reset(self) -> int:
        """Get seconds until rate limit window resets."""
        if self.is_window_expired:
            return 0
        window_end = self.window_start + timedelta(seconds=self.window_duration)
        return int((window_end - datetime.utcnow()).total_seconds())

    def reset_window(self) -> None:
        """Reset the rate limiting window."""
        self.window_start = datetime.utcnow()
        self.current_count = 0

    def increment_count(self) -> None:
        """Increment request count for current window."""
        if self.is_window_expired:
            self.reset_window()
        self.current_count += 1
        self.updated_at = datetime.utcnow()

    def record_violation(self) -> None:
        """Record a rate limit violation."""
        self.violation_count += 1
        self.last_violation = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def block_identifier(self, duration_seconds: int) -> None:
        """Block identifier for specified duration."""
        self.is_blocked = True
        self.blocked_until = datetime.utcnow() + timedelta(seconds=duration_seconds)
        self.updated_at = datetime.utcnow()

    def unblock_identifier(self) -> None:
        """Unblock identifier."""
        self.is_blocked = False
        self.blocked_until = None
        self.updated_at = datetime.utcnow()

    def to_model(self) -> "RateLimitData":
        """Convert to Pydantic model."""
        return RateLimitData(
            limit_type=self.limit_type,
            identifier=self.identifier,
            endpoint=self.endpoint,
            current_count=self.current_count,
            max_requests=self.max_requests,
            window_start=self.window_start,
            window_duration=self.window_duration,
            violation_count=self.violation_count,
            is_blocked=self.is_blocked,
            blocked_until=self.blocked_until,
            remaining_requests=self.remaining_requests,
            time_until_reset=self.time_until_reset,
        )


class RateLimitData(BaseModel):
    """Pydantic model for rate limiting data transfer.

    Used for API responses and data validation when working
    with rate limiting information.
    """

    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)

    limit_type: RateLimitType = Field(..., description="Type of rate limit")

    identifier: str = Field(..., description="IP address, user ID, or other identifier")

    endpoint: Optional[str] = Field(
        None, description="API endpoint for endpoint-specific limits"
    )

    current_count: int = Field(..., description="Current request count in time window")

    max_requests: int = Field(
        ..., description="Maximum requests allowed in time window"
    )

    window_start: datetime = Field(..., description="Start of current time window")

    window_duration: int = Field(..., description="Time window duration in seconds")

    violation_count: int = Field(default=0, description="Total number of violations")

    is_blocked: bool = Field(
        default=False, description="Whether identifier is currently blocked"
    )

    blocked_until: Optional[datetime] = Field(
        None, description="When block expires (if blocked)"
    )

    remaining_requests: int = Field(
        ..., description="Remaining requests in current window"
    )

    time_until_reset: int = Field(
        ..., description="Seconds until rate limit window resets"
    )


class RateLimitResult(BaseModel):
    """Result of rate limit checking operation.

    Provides comprehensive information about rate limit status
    for proper response handling and user feedback.
    """

    model_config = ConfigDict()

    is_allowed: bool = Field(..., description="Whether request is allowed")

    limit_type: RateLimitType = Field(..., description="Type of rate limit checked")

    identifier: str = Field(..., description="Identifier that was checked")

    current_count: int = Field(..., description="Current request count")

    max_requests: int = Field(..., description="Maximum requests allowed")

    remaining_requests: int = Field(..., description="Remaining requests in window")

    time_until_reset: int = Field(..., description="Seconds until limit resets")

    violation_recorded: bool = Field(
        default=False, description="Whether violation was recorded"
    )

    is_blocked: bool = Field(default=False, description="Whether identifier is blocked")

    error_message: Optional[str] = Field(
        None, description="Error message if request denied"
    )
