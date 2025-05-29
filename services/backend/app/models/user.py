"""
User database models.
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import INET, UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class UserRole(str, Enum):
    """User role enumeration."""

    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"


class UserStatus(str, Enum):
    """User approval status enumeration."""

    PENDING = "pending"  # Awaiting admin approval
    APPROVED = "approved"  # Approved by admin
    REJECTED = "rejected"  # Rejected by admin
    SUSPENDED = "suspended"  # Temporarily suspended


class User(Base):
    """User model for authentication."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.PENDING, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(UUID(as_uuid=True), nullable=True)  # Admin who approved
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    sessions = relationship(
        "UserSession", back_populates="user", cascade="all, delete-orphan"
    )
    audit_logs = relationship(
        "AuthAuditLog", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"

    def is_admin(self) -> bool:
        """Check if user has admin role."""
        return self.role == UserRole.ADMIN

    def is_moderator(self) -> bool:
        """Check if user has moderator role."""
        return self.role == UserRole.MODERATOR

    def is_approved(self) -> bool:
        """Check if user is approved and can access the system."""
        return self.status == UserStatus.APPROVED and self.is_active

    def is_pending_approval(self) -> bool:
        """Check if user is waiting for admin approval."""
        return self.status == UserStatus.PENDING

    def is_rejected(self) -> bool:
        """Check if user registration was rejected."""
        return self.status == UserStatus.REJECTED

    def can_login(self) -> bool:
        """Check if user can login (approved, active, not locked)."""
        return (
            self.is_approved() 
            and self.is_active 
            and (self.locked_until is None or self.locked_until < datetime.utcnow())
        )


class UserSession(Base):
    """User session model for session management."""

    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    refresh_token_hash = Column(String(255), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        return f"<UserSession(id={self.id}, user_id={self.user_id})>"


class AuthAuditLog(Base):
    """Authentication audit log for security monitoring."""

    __tablename__ = "auth_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    event_type = Column(String(100), nullable=False, index=True)
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    success = Column(Boolean, nullable=False)
    details = Column(Text, nullable=True)  # JSON string for additional details
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self):
        return f"<AuthAuditLog(id={self.id}, event_type={self.event_type}, success={self.success})>"
