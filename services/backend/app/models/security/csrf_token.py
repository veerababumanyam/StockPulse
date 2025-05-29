"""CSRF Token models for double-submit cookie pattern protection.

This module provides data models for CSRF token generation, validation,
and management using cryptographically secure tokens with proper expiration
and validation mechanisms.
"""

from datetime import datetime, timedelta
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class CSRFTokenData(BaseModel):
    """CSRF token data for validation and generation.

    Used for token generation, validation, and secure transmission
    between client and server using double-submit cookie pattern.
    """

    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        arbitrary_types_allowed=True,
    )

    token: str = Field(
        ...,
        description="Cryptographically secure CSRF token",
        min_length=32,
        max_length=64,
    )

    user_id: Optional[str] = Field(
        None, description="User ID associated with token (optional)"
    )

    session_id: Optional[str] = Field(None, description="Session ID for token binding")

    expires_at: datetime = Field(..., description="Token expiration timestamp")

    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="Token creation timestamp"
    )

    ip_address: Optional[str] = Field(
        None, description="IP address for additional validation"
    )

    user_agent: Optional[str] = Field(None, description="User agent for fingerprinting")

    @property
    def is_expired(self) -> bool:
        """Check if token has expired."""
        return datetime.utcnow() > self.expires_at

    @property
    def remaining_ttl(self) -> int:
        """Get remaining time-to-live in seconds."""
        if self.is_expired:
            return 0
        return int((self.expires_at - datetime.utcnow()).total_seconds())

    def is_valid_for_request(
        self, ip_address: Optional[str] = None, user_agent: Optional[str] = None
    ) -> bool:
        """Validate token for specific request context.

        Args:
            ip_address: Request IP address for validation
            user_agent: Request user agent for validation

        Returns:
            True if token is valid for the request context
        """
        if self.is_expired:
            return False

        # Optional IP validation (can be disabled for mobile users)
        if self.ip_address and ip_address:
            if self.ip_address != ip_address:
                return False

        # Optional User-Agent validation (can be disabled for compatibility)
        if self.user_agent and user_agent:
            if self.user_agent != user_agent:
                return False

        return True


class CSRFToken(Base):
    """Database model for CSRF token storage.

    Stores CSRF tokens in database for server-side validation
    and cleanup of expired tokens.
    """

    __tablename__ = "csrf_tokens"

    id = Column(Integer, primary_key=True, index=True)

    token = Column(
        String(64),
        unique=True,
        index=True,
        nullable=False,
        doc="Cryptographically secure CSRF token",
    )

    user_id = Column(
        String(36), index=True, nullable=True, doc="User ID associated with token"
    )

    session_id = Column(
        String(64), index=True, nullable=True, doc="Session ID for token binding"
    )

    ip_address = Column(
        String(45),  # IPv6 compatible
        nullable=True,
        doc="IP address for additional validation",
    )

    user_agent = Column(String(512), nullable=True, doc="User agent for fingerprinting")

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
        doc="Token creation timestamp",
    )

    expires_at = Column(
        DateTime, nullable=False, index=True, doc="Token expiration timestamp"
    )

    is_used = Column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether token has been used (for one-time tokens)",
    )

    def __repr__(self) -> str:
        """String representation of CSRF token."""
        return f"<CSRFToken(token={self.token[:8]}..., user_id={self.user_id})>"

    def to_model(self) -> CSRFTokenData:
        """Convert to Pydantic model."""
        return CSRFTokenData(
            token=self.token,
            user_id=self.user_id,
            session_id=self.session_id,
            expires_at=self.expires_at,
            created_at=self.created_at,
            ip_address=self.ip_address,
            user_agent=self.user_agent,
        )

    @property
    def is_expired(self) -> bool:
        """Check if token has expired."""
        return datetime.utcnow() > self.expires_at

    @classmethod
    def create_from_data(cls, token_data: CSRFTokenData) -> "CSRFToken":
        """Create database model from Pydantic data."""
        return cls(
            token=token_data.token,
            user_id=token_data.user_id,
            session_id=token_data.session_id,
            ip_address=token_data.ip_address,
            user_agent=token_data.user_agent,
            created_at=token_data.created_at,
            expires_at=token_data.expires_at,
        )


class CSRFValidationRequest(BaseModel):
    """Request model for CSRF token validation.

    Used when validating CSRF tokens from client requests
    with proper context information.
    """

    model_config = ConfigDict(str_strip_whitespace=True)

    token: str = Field(..., description="CSRF token to validate", min_length=1)

    header_token: Optional[str] = Field(
        None, description="CSRF token from request header"
    )

    cookie_token: Optional[str] = Field(None, description="CSRF token from cookie")

    ip_address: Optional[str] = Field(None, description="Request IP address")

    user_agent: Optional[str] = Field(None, description="Request user agent")


class CSRFValidationResult(BaseModel):
    """Result of CSRF token validation.

    Provides detailed validation results for security logging
    and proper error handling.
    """

    model_config = ConfigDict()

    is_valid: bool = Field(..., description="Whether token validation passed")

    error_code: Optional[str] = Field(
        None, description="Error code if validation failed"
    )

    error_message: Optional[str] = Field(
        None, description="Human-readable error message"
    )

    token_age: Optional[int] = Field(None, description="Token age in seconds")

    validation_timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="When validation was performed"
    )
