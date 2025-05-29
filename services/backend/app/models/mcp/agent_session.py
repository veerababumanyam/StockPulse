"""
Agent session models for MCP authentication and session management.
"""

from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, DateTime, Boolean, ARRAY, Text
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()


class AgentSession(BaseModel):
    """Agent authentication session model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Session identifier")
    user_id: str = Field(..., description="Associated user identifier")
    agent_name: str = Field(..., description="Agent identifier")
    session_token: str = Field(..., description="JWT session token")
    permissions: List[str] = Field(default_factory=list, description="Granted permissions")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Session creation time")
    expires_at: datetime = Field(..., description="Session expiration time")
    last_accessed: datetime = Field(default_factory=datetime.utcnow, description="Last access time")
    ip_address: Optional[str] = Field(None, description="Client IP address")
    user_agent: Optional[str] = Field(None, description="Client user agent")
    is_active: bool = Field(default=True, description="Session active status")
    
    class Config:
        """Pydantic model configuration."""
        use_enum_values = True
        validate_assignment = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
    @property
    def is_expired(self) -> bool:
        """Check if session is expired."""
        return datetime.utcnow() > self.expires_at
    
    @property
    def time_until_expiry(self) -> timedelta:
        """Get time remaining until session expires."""
        return self.expires_at - datetime.utcnow()
    
    def has_permission(self, permission: str) -> bool:
        """Check if session has specific permission."""
        return permission in self.permissions
    
    def extend_session(self, duration_minutes: int = 60) -> None:
        """Extend session expiration time."""
        self.expires_at = datetime.utcnow() + timedelta(minutes=duration_minutes)
        self.last_accessed = datetime.utcnow()


class AgentSessionTable(Base):
    """SQLAlchemy table for agent sessions."""
    __tablename__ = "agent_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    agent_name = Column(String(100), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    permissions = Column(ARRAY(String), nullable=False, default=[])
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    last_accessed = Column(DateTime(timezone=True), default=datetime.utcnow)
    ip_address = Column(INET)
    user_agent = Column(Text)
    is_active = Column(Boolean, default=True)


class AgentCredentials(BaseModel):
    """Agent credential model for authentication."""
    agent_name: str = Field(..., description="Agent identifier")
    api_key: str = Field(..., description="Agent API key")
    client_secret: str = Field(..., description="Agent client secret")
    requested_permissions: List[str] = Field(default_factory=list, description="Requested permissions")
    user_id: Optional[str] = Field(None, description="User context for the session")
    
    class Config:
        """Pydantic model configuration."""
        validate_assignment = True


class AgentSessionStats(BaseModel):
    """Agent session statistics model."""
    total_sessions: int = Field(default=0, description="Total number of sessions")
    active_sessions: int = Field(default=0, description="Number of active sessions")
    expired_sessions: int = Field(default=0, description="Number of expired sessions")
    sessions_by_agent: dict = Field(default_factory=dict, description="Sessions grouped by agent")
    average_session_duration: float = Field(default=0.0, description="Average session duration in minutes")
    
    class Config:
        """Pydantic model configuration."""
        validate_assignment = True 