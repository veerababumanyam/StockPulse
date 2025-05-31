"""
API Keys Schemas
Pydantic models for API key management with proper validation
Follows enterprise security standards for sensitive data handling
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator, root_validator
from uuid import UUID
import re

# Base schemas
class APIProviderBase(BaseModel):
    """Base schema for API provider"""
    id: str = Field(..., min_length=1, max_length=50, description="Unique provider identifier")
    name: str = Field(..., min_length=1, max_length=100, description="Display name")
    description: Optional[str] = Field(None, description="Provider description")
    website_url: Optional[str] = Field(None, description="Provider website")
    docs_url: Optional[str] = Field(None, description="API documentation URL")
    category: str = Field(..., description="Provider category (ai, financial, data)")
    key_format: Optional[str] = Field(None, description="Expected key format description")
    validation_endpoint: Optional[str] = Field(None, description="Endpoint for key validation")
    rate_limit_per_minute: Optional[int] = Field(None, ge=1, description="Rate limit per minute")
    is_active: bool = Field(True, description="Whether provider is active")
    is_premium: bool = Field(False, description="Whether provider requires premium access")

    @validator('category')
    def validate_category(cls, v):
        allowed_categories = ['ai', 'financial', 'data', 'other']
        if v not in allowed_categories:
            raise ValueError(f'Category must be one of: {", ".join(allowed_categories)}')
        return v

    @validator('website_url', 'docs_url', 'validation_endpoint')
    def validate_urls(cls, v):
        if v and not re.match(r'^https?://', v):
            raise ValueError('URL must start with http:// or https://')
        return v

class APIProviderCreate(APIProviderBase):
    """Schema for creating API provider"""
    pass

class APIProviderUpdate(BaseModel):
    """Schema for updating API provider"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    website_url: Optional[str] = None
    docs_url: Optional[str] = None
    category: Optional[str] = None
    key_format: Optional[str] = None
    validation_endpoint: Optional[str] = None
    rate_limit_per_minute: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None
    is_premium: Optional[bool] = None

class APIProvider(APIProviderBase):
    """Schema for API provider response"""
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# API Key schemas
class APIKeyBase(BaseModel):
    """Base schema for API key"""
    provider_id: str = Field(..., min_length=1, max_length=50, description="Provider identifier")
    name: str = Field(..., min_length=1, max_length=100, description="User-defined key name")
    description: Optional[str] = Field(None, max_length=500, description="Optional description")

class APIKeyCreate(APIKeyBase):
    """Schema for creating API key"""
    key: str = Field(..., min_length=5, max_length=2000, description="The actual API key")
    
    @validator('key')
    def validate_key(cls, v):
        # Remove any whitespace
        v = v.strip()
        if not v:
            raise ValueError('API key cannot be empty')
        # Basic validation - key should not contain obvious placeholder text
        invalid_patterns = ['your_api_key', 'replace_me', 'example', 'placeholder']
        if any(pattern in v.lower() for pattern in invalid_patterns):
            raise ValueError('Please provide a valid API key')
        return v

class APIKeyUpdate(BaseModel):
    """Schema for updating API key"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None

class APIKeyResponse(APIKeyBase):
    """Schema for API key response (without actual key)"""
    id: UUID
    user_id: UUID
    usage_count: int
    last_used_at: Optional[datetime]
    is_active: bool
    is_validated: bool
    validation_error: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Provider information (joined)
    provider_name: Optional[str] = None
    provider_category: Optional[str] = None
    
    class Config:
        from_attributes = True

class APIKeySecure(APIKeyResponse):
    """Schema for API key with masked key (for display)"""
    masked_key: str = Field(..., description="Masked version of the key for display")

class APIKeyWithProvider(APIKeyResponse):
    """Schema for API key with full provider details"""
    provider: Optional[APIProvider] = None

# Usage schemas
class APIKeyUsageBase(BaseModel):
    """Base schema for API key usage"""
    endpoint: Optional[str] = Field(None, max_length=255)
    method: Optional[str] = Field(None, max_length=10)
    tokens_used: Optional[int] = Field(None, ge=0)
    cost_cents: Optional[int] = Field(None, ge=0)
    status_code: Optional[int] = Field(None, ge=100, le=599)
    response_time_ms: Optional[int] = Field(None, ge=0)
    error_message: Optional[str] = None
    request_id: Optional[str] = Field(None, max_length=100)

class APIKeyUsageCreate(APIKeyUsageBase):
    """Schema for creating usage record"""
    api_key_id: UUID

class APIKeyUsage(APIKeyUsageBase):
    """Schema for usage record response"""
    id: UUID
    api_key_id: UUID
    user_agent: Optional[str]
    ip_address: Optional[str]
    used_at: datetime
    
    class Config:
        from_attributes = True

# Validation schemas
class APIKeyValidationRequest(BaseModel):
    """Schema for API key validation request"""
    provider_id: str
    key: str
    
class APIKeyValidationResponse(BaseModel):
    """Schema for API key validation response"""
    is_valid: bool
    error_message: Optional[str] = None
    response_time_ms: Optional[int] = None
    rate_limit_remaining: Optional[int] = None
    rate_limit_reset: Optional[datetime] = None

# List and pagination schemas
class APIKeyListResponse(BaseModel):
    """Schema for paginated API key list"""
    items: List[APIKeyResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

class APIProviderListResponse(BaseModel):
    """Schema for API provider list"""
    items: List[APIProvider]
    total: int

# Statistics schemas
class APIKeyStats(BaseModel):
    """Schema for API key usage statistics"""
    total_requests: int
    successful_requests: int
    failed_requests: int
    total_tokens_used: Optional[int] = None
    total_cost_cents: Optional[int] = None
    average_response_time_ms: Optional[float] = None
    last_used_at: Optional[datetime] = None
    usage_by_day: Dict[str, int] = Field(default_factory=dict)  # date -> request_count
    
class UserAPIKeyStats(BaseModel):
    """Schema for user's overall API key statistics"""
    total_keys: int
    active_keys: int
    validated_keys: int
    total_usage: int
    providers_used: List[str]
    monthly_costs_cents: Dict[str, int] = Field(default_factory=dict)  # month -> cost
    top_providers: List[Dict[str, Any]] = Field(default_factory=list)

# Bulk operations schemas
class BulkAPIKeyOperation(BaseModel):
    """Schema for bulk API key operations"""
    key_ids: List[UUID] = Field(..., min_items=1, max_items=100)
    operation: str = Field(..., pattern=r'^(activate|deactivate|delete|validate)$')
    
class BulkAPIKeyResult(BaseModel):
    """Schema for bulk operation results"""
    successful: List[UUID]
    failed: List[Dict[str, Any]]  # {"id": UUID, "error": str}
    
# Configuration schemas
class APIKeyConfiguration(BaseModel):
    """Schema for API key configuration settings"""
    max_keys_per_user: int = Field(default=50, ge=1, le=1000)
    max_keys_per_provider: int = Field(default=10, ge=1, le=100)
    auto_validate_keys: bool = Field(default=True)
    track_detailed_usage: bool = Field(default=True)
    encryption_enabled: bool = Field(default=True)
    
class APIKeyMetrics(BaseModel):
    """Schema for API key metrics and monitoring"""
    total_keys_in_system: int
    active_keys: int
    keys_by_provider: Dict[str, int]
    keys_by_category: Dict[str, int]
    average_usage_per_key: float
    top_used_providers: List[Dict[str, Any]]
    validation_success_rate: float
    
# Error schemas
class APIKeyError(BaseModel):
    """Schema for API key error responses"""
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "error_code": "INVALID_API_KEY",
                "message": "The provided API key is invalid or has been revoked",
                "details": {"provider": "openai", "key_prefix": "sk-..."}
            }
        } 