"""
API Keys Model
Database model for storing encrypted API keys for external services
Follows enterprise security standards for sensitive data storage
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from .base import Base

class APIKey(Base):
    """
    API Key Model
    Stores encrypted API keys for external service integrations
    """
    __tablename__ = "api_keys"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign key to user
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # API key metadata
    provider_id = Column(String(50), nullable=False, index=True)  # e.g., 'openai', 'anthropic', 'fmp'
    name = Column(String(100), nullable=False)  # User-defined name for the key
    description = Column(Text, nullable=True)  # Optional description
    
    # Encrypted key storage
    encrypted_key = Column(Text, nullable=False)  # Base64 encoded encrypted key
    key_hash = Column(String(64), nullable=False, index=True)  # SHA-256 hash for deduplication
    
    # Usage tracking
    usage_count = Column(Integer, default=0, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    
    # Status and lifecycle
    is_active = Column(Boolean, default=True, nullable=False)
    is_validated = Column(Boolean, default=False, nullable=False)  # Whether key has been tested
    validation_error = Column(Text, nullable=True)  # Last validation error if any
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Security fields
    created_ip = Column(String(45), nullable=True)  # IPv6 support
    last_used_ip = Column(String(45), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="api_keys")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_api_keys_user_provider', 'user_id', 'provider_id'),
        Index('idx_api_keys_active_provider', 'is_active', 'provider_id'),
        Index('idx_api_keys_usage', 'last_used_at', 'usage_count'),
    )
    
    def __repr__(self):
        return f"<APIKey(id={self.id}, user_id={self.user_id}, provider={self.provider_id}, name='{self.name}')>"

class APIProvider(Base):
    """
    API Provider Model
    Defines available API providers and their configuration
    """
    __tablename__ = "api_providers"
    
    # Primary key
    id = Column(String(50), primary_key=True)  # e.g., 'openai', 'anthropic'
    
    # Provider metadata
    name = Column(String(100), nullable=False)  # Display name
    description = Column(Text, nullable=True)
    website_url = Column(String(255), nullable=True)
    docs_url = Column(String(255), nullable=True)
    
    # Configuration
    category = Column(String(50), nullable=False, index=True)  # 'ai', 'financial', 'data'
    key_format = Column(String(200), nullable=True)  # Description of expected key format
    validation_endpoint = Column(String(255), nullable=True)  # API endpoint to test key validity
    rate_limit_per_minute = Column(Integer, nullable=True)  # Default rate limit
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)  # Whether this is a premium provider
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<APIProvider(id='{self.id}', name='{self.name}', category='{self.category}')>"

class APIKeyUsage(Base):
    """
    API Key Usage Model
    Tracks detailed usage statistics for API keys
    """
    __tablename__ = "api_key_usage"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign key to API key
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id", ondelete="CASCADE"), nullable=False)
    
    # Usage details
    endpoint = Column(String(255), nullable=True)  # Which API endpoint was called
    method = Column(String(10), nullable=True)  # HTTP method
    tokens_used = Column(Integer, nullable=True)  # For AI providers
    cost_cents = Column(Integer, nullable=True)  # Cost in cents
    
    # Response details
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Context
    request_id = Column(String(100), nullable=True)  # For tracing
    user_agent = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    
    # Timestamp
    used_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    api_key = relationship("APIKey", backref="usage_logs")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_api_usage_key_date', 'api_key_id', 'used_at'),
        Index('idx_api_usage_status', 'status_code', 'used_at'),
    )
    
    def __repr__(self):
        return f"<APIKeyUsage(id={self.id}, api_key_id={self.api_key_id}, endpoint='{self.endpoint}')>" 