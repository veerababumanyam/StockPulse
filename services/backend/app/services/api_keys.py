"""
API Keys Service
Service layer for managing API keys with encryption and validation
Follows enterprise security standards for sensitive data handling
"""
import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
import aiohttp
import asyncio
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from ..models.api_keys import APIKey, APIProvider, APIKeyUsage
from ..models.user import User
from ..schemas.api_keys import (
    APIKeyCreate, APIKeyUpdate, APIKeyResponse, APIKeySecure,
    APIProviderCreate, APIProviderUpdate, APIProvider as APIProviderSchema,
    APIKeyValidationRequest, APIKeyValidationResponse,
    APIKeyStats, UserAPIKeyStats, APIKeyUsage as APIKeyUsageSchema,
    APIKeyListResponse
)
from ..core.events import EventBus, APIKeyEvent
from ..core.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

class APIKeyEncryption:
    """
    Handles encryption and decryption of API keys
    Uses Fernet symmetric encryption with PBKDF2 key derivation
    """
    
    def __init__(self, encryption_key: Optional[str] = None):
        self.encryption_key = encryption_key or os.getenv("API_KEY_ENCRYPTION_KEY")
        if not self.encryption_key:
            # Generate a new key if none provided (for development)
            self.encryption_key = Fernet.generate_key().decode()
            logger.warning("No encryption key provided, using generated key (not for production)")
        
        self.fernet = self._create_fernet()
    
    def _create_fernet(self) -> Fernet:
        """Create Fernet instance with proper key derivation"""
        if isinstance(self.encryption_key, str):
            key_bytes = self.encryption_key.encode()
        else:
            key_bytes = self.encryption_key
            
        # Use PBKDF2 for key derivation
        salt = b"stockpulse_api_keys_salt"  # In production, use a random salt per key
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(key_bytes))
        return Fernet(key)
    
    def encrypt_key(self, api_key: str) -> str:
        """Encrypt an API key"""
        try:
            encrypted = self.fernet.encrypt(api_key.encode())
            return base64.b64encode(encrypted).decode()
        except Exception as e:
            logger.error(f"Failed to encrypt API key: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to encrypt API key"
            )
    
    def decrypt_key(self, encrypted_key: str) -> str:
        """Decrypt an API key"""
        try:
            encrypted_bytes = base64.b64decode(encrypted_key.encode())
            decrypted = self.fernet.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Failed to decrypt API key: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to decrypt API key"
            )
    
    @staticmethod
    def hash_key(api_key: str) -> str:
        """Create SHA-256 hash of API key for deduplication"""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    @staticmethod
    def mask_key(api_key: str) -> str:
        """Create masked version of API key for display"""
        if len(api_key) <= 8:
            return "*" * len(api_key)
        return api_key[:4] + "*" * (len(api_key) - 8) + api_key[-4:]

class APIKeyValidator:
    """
    Validates API keys against their respective providers
    """
    
    # Provider-specific validation endpoints
    VALIDATION_ENDPOINTS = {
        'openai': 'https://api.openai.com/v1/models',
        'anthropic': 'https://api.anthropic.com/v1/messages',
        'gemini': 'https://generativelanguage.googleapis.com/v1/models',
        'fmp': 'https://financialmodelingprep.com/api/v3/profile/AAPL',
        'alpha_vantage': 'https://www.alphavantage.co/query',
        'polygon': 'https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-01/2023-01-02',
        'taapi': 'https://api.taapi.io/rsi',
    }
    
    async def validate_key(self, provider_id: str, api_key: str) -> APIKeyValidationResponse:
        """Validate an API key against its provider"""
        start_time = datetime.utcnow()
        
        try:
            if provider_id not in self.VALIDATION_ENDPOINTS:
                return APIKeyValidationResponse(
                    is_valid=False,
                    error_message=f"Validation not supported for provider: {provider_id}"
                )
            
            endpoint = self.VALIDATION_ENDPOINTS[provider_id]
            headers = self._get_headers(provider_id, api_key)
            params = self._get_params(provider_id, api_key)
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    endpoint,
                    headers=headers,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    response_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                    
                    if response.status == 200:
                        return APIKeyValidationResponse(
                            is_valid=True,
                            response_time_ms=response_time_ms,
                            rate_limit_remaining=self._extract_rate_limit(response),
                            rate_limit_reset=self._extract_rate_limit_reset(response)
                        )
                    else:
                        error_text = await response.text()
                        return APIKeyValidationResponse(
                            is_valid=False,
                            error_message=f"HTTP {response.status}: {error_text[:200]}",
                            response_time_ms=response_time_ms
                        )
                        
        except asyncio.TimeoutError:
            return APIKeyValidationResponse(
                is_valid=False,
                error_message="Validation request timed out"
            )
        except Exception as e:
            logger.error(f"API key validation failed for {provider_id}: {e}")
            return APIKeyValidationResponse(
                is_valid=False,
                error_message=f"Validation error: {str(e)[:200]}"
            )
    
    def _get_headers(self, provider_id: str, api_key: str) -> Dict[str, str]:
        """Get authentication headers for provider"""
        if provider_id == 'openai':
            return {'Authorization': f'Bearer {api_key}'}
        elif provider_id == 'anthropic':
            return {'x-api-key': api_key, 'anthropic-version': '2023-06-01'}
        elif provider_id == 'gemini':
            return {}
        elif provider_id in ['fmp', 'alpha_vantage', 'polygon', 'taapi']:
            return {}
        return {}
    
    def _get_params(self, provider_id: str, api_key: str) -> Dict[str, str]:
        """Get query parameters for provider"""
        if provider_id == 'gemini':
            return {'key': api_key}
        elif provider_id == 'fmp':
            return {'apikey': api_key}
        elif provider_id == 'alpha_vantage':
            return {'function': 'TIME_SERIES_INTRADAY', 'symbol': 'AAPL', 'interval': '1min', 'apikey': api_key}
        elif provider_id == 'polygon':
            return {'apikey': api_key}
        elif provider_id == 'taapi':
            return {'secret': api_key, 'exchange': 'binance', 'symbol': 'BTC/USDT', 'interval': '1h'}
        return {}
    
    def _extract_rate_limit(self, response) -> Optional[int]:
        """Extract rate limit remaining from response headers"""
        rate_limit_headers = [
            'x-ratelimit-remaining',
            'x-rate-limit-remaining', 
            'ratelimit-remaining',
            'rate-limit-remaining'
        ]
        for header in rate_limit_headers:
            if header in response.headers:
                try:
                    return int(response.headers[header])
                except ValueError:
                    continue
        return None
    
    def _extract_rate_limit_reset(self, response) -> Optional[datetime]:
        """Extract rate limit reset time from response headers"""
        reset_headers = [
            'x-ratelimit-reset',
            'x-rate-limit-reset',
            'ratelimit-reset',
            'rate-limit-reset'
        ]
        for header in reset_headers:
            if header in response.headers:
                try:
                    timestamp = int(response.headers[header])
                    return datetime.fromtimestamp(timestamp)
                except (ValueError, TypeError):
                    continue
        return None

class APIKeyService:
    """
    Service for managing API keys with enterprise features
    """
    
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.encryption = APIKeyEncryption()
        self.validator = APIKeyValidator()
    
    async def create_api_key(
        self,
        db: AsyncSession,
        user_id: UUID,
        api_key_data: APIKeyCreate,
        client_ip: Optional[str] = None
    ) -> APIKeyResponse:
        """Create a new API key with encryption"""
        
        # Check if provider exists
        provider = await self.get_provider(db, api_key_data.provider_id)
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {api_key_data.provider_id} not found"
            )
        
        # Check for duplicate key hash
        key_hash = APIKeyEncryption.hash_key(api_key_data.key)
        existing = await db.execute(
            select(APIKey).where(
                and_(
                    APIKey.user_id == user_id,
                    APIKey.key_hash == key_hash,
                    APIKey.is_active == True
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This API key is already registered"
            )
        
        # Encrypt the key
        encrypted_key = self.encryption.encrypt_key(api_key_data.key)
        
        # Create the database record
        db_api_key = APIKey(
            user_id=user_id,
            provider_id=api_key_data.provider_id,
            name=api_key_data.name,
            description=api_key_data.description,
            encrypted_key=encrypted_key,
            key_hash=key_hash,
            created_ip=client_ip
        )
        
        db.add(db_api_key)
        await db.commit()
        await db.refresh(db_api_key)
        
        # Validate the key in background if auto-validation is enabled
        asyncio.create_task(self._validate_key_async(db, db_api_key.id, api_key_data.key))
        
        # Emit event
        await self.event_bus.emit(APIKeyEvent(
            event_type="api_key_created",
            user_id=user_id,
            api_key_id=db_api_key.id,
            provider_id=api_key_data.provider_id,
            metadata={"name": api_key_data.name}
        ))
        
        # Return response without the actual key
        return APIKeyResponse(
            id=db_api_key.id,
            user_id=db_api_key.user_id,
            provider_id=db_api_key.provider_id,
            name=db_api_key.name,
            description=db_api_key.description,
            usage_count=db_api_key.usage_count,
            last_used_at=db_api_key.last_used_at,
            is_active=db_api_key.is_active,
            is_validated=db_api_key.is_validated,
            validation_error=db_api_key.validation_error,
            created_at=db_api_key.created_at,
            updated_at=db_api_key.updated_at,
            provider_name=provider.name,
            provider_category=provider.category
        )
    
    async def get_user_api_keys(
        self,
        db: AsyncSession,
        user_id: UUID,
        provider_id: Optional[str] = None,
        category: Optional[str] = None,
        include_inactive: bool = False,
        page: int = 1,
        per_page: int = 50
    ) -> APIKeyListResponse:
        """Get user's API keys with pagination and filtering"""
        
        # Build query
        query = select(APIKey).where(APIKey.user_id == user_id)
        
        if provider_id:
            query = query.where(APIKey.provider_id == provider_id)
        
        if not include_inactive:
            query = query.where(APIKey.is_active == True)
        
        if category:
            # Join with provider to filter by category
            query = query.join(APIProvider).where(APIProvider.category == category)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page).order_by(desc(APIKey.created_at))
        
        # Execute query with provider info
        result = await db.execute(
            query.options(selectinload(APIKey.user))
        )
        api_keys = result.scalars().all()
        
        # Convert to response format
        items = []
        for api_key in api_keys:
            # Get provider info
            provider = await self.get_provider(db, api_key.provider_id)
            
            items.append(APIKeyResponse(
                id=api_key.id,
                user_id=api_key.user_id,
                provider_id=api_key.provider_id,
                name=api_key.name,
                description=api_key.description,
                usage_count=api_key.usage_count,
                last_used_at=api_key.last_used_at,
                is_active=api_key.is_active,
                is_validated=api_key.is_validated,
                validation_error=api_key.validation_error,
                created_at=api_key.created_at,
                updated_at=api_key.updated_at,
                provider_name=provider.name if provider else None,
                provider_category=provider.category if provider else None
            ))
        
        return APIKeyListResponse(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            has_next=offset + per_page < total,
            has_prev=page > 1
        )
    
    async def get_api_key_for_provider(
        self,
        db: AsyncSession,
        user_id: UUID,
        provider_id: str
    ) -> Optional[str]:
        """Get decrypted API key for a specific provider"""
        
        result = await db.execute(
            select(APIKey).where(
                and_(
                    APIKey.user_id == user_id,
                    APIKey.provider_id == provider_id,
                    APIKey.is_active == True,
                    APIKey.is_validated == True
                )
            ).order_by(desc(APIKey.last_used_at))
        )
        
        api_key = result.scalar_one_or_none()
        if not api_key:
            return None
        
        # Update usage tracking
        api_key.usage_count += 1
        api_key.last_used_at = datetime.utcnow()
        await db.commit()
        
        # Decrypt and return the key
        return self.encryption.decrypt_key(api_key.encrypted_key)
    
    async def update_api_key(
        self,
        db: AsyncSession,
        user_id: UUID,
        api_key_id: UUID,
        update_data: APIKeyUpdate
    ) -> APIKeyResponse:
        """Update API key metadata"""
        
        result = await db.execute(
            select(APIKey).where(
                and_(
                    APIKey.id == api_key_id,
                    APIKey.user_id == user_id
                )
            )
        )
        
        api_key = result.scalar_one_or_none()
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        # Update fields
        if update_data.name is not None:
            api_key.name = update_data.name
        if update_data.description is not None:
            api_key.description = update_data.description
        if update_data.is_active is not None:
            api_key.is_active = update_data.is_active
        
        api_key.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(api_key)
        
        # Get provider info for response
        provider = await self.get_provider(db, api_key.provider_id)
        
        return APIKeyResponse(
            id=api_key.id,
            user_id=api_key.user_id,
            provider_id=api_key.provider_id,
            name=api_key.name,
            description=api_key.description,
            usage_count=api_key.usage_count,
            last_used_at=api_key.last_used_at,
            is_active=api_key.is_active,
            is_validated=api_key.is_validated,
            validation_error=api_key.validation_error,
            created_at=api_key.created_at,
            updated_at=api_key.updated_at,
            provider_name=provider.name if provider else None,
            provider_category=provider.category if provider else None
        )
    
    async def delete_api_key(
        self,
        db: AsyncSession,
        user_id: UUID,
        api_key_id: UUID
    ) -> bool:
        """Delete an API key"""
        
        result = await db.execute(
            select(APIKey).where(
                and_(
                    APIKey.id == api_key_id,
                    APIKey.user_id == user_id
                )
            )
        )
        
        api_key = result.scalar_one_or_none()
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        await db.delete(api_key)
        await db.commit()
        
        # Emit event
        await self.event_bus.emit(APIKeyEvent(
            event_type="api_key_deleted",
            user_id=user_id,
            api_key_id=api_key_id,
            provider_id=api_key.provider_id,
            metadata={"name": api_key.name}
        ))
        
        return True
    
    async def validate_api_key(
        self,
        db: AsyncSession,
        user_id: UUID,
        api_key_id: UUID
    ) -> APIKeyValidationResponse:
        """Validate an API key against its provider"""
        
        result = await db.execute(
            select(APIKey).where(
                and_(
                    APIKey.id == api_key_id,
                    APIKey.user_id == user_id
                )
            )
        )
        
        api_key = result.scalar_one_or_none()
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        # Decrypt the key
        decrypted_key = self.encryption.decrypt_key(api_key.encrypted_key)
        
        # Validate with provider
        validation_result = await self.validator.validate_key(
            api_key.provider_id,
            decrypted_key
        )
        
        # Update validation status
        api_key.is_validated = validation_result.is_valid
        api_key.validation_error = validation_result.error_message
        api_key.updated_at = datetime.utcnow()
        
        await db.commit()
        
        return validation_result
    
    async def _validate_key_async(self, db: AsyncSession, api_key_id: UUID, api_key: str):
        """Background task to validate API key"""
        try:
            result = await db.execute(select(APIKey).where(APIKey.id == api_key_id))
            db_api_key = result.scalar_one_or_none()
            
            if db_api_key:
                validation_result = await self.validator.validate_key(
                    db_api_key.provider_id,
                    api_key
                )
                
                db_api_key.is_validated = validation_result.is_valid
                db_api_key.validation_error = validation_result.error_message
                await db.commit()
                
        except Exception as e:
            logger.error(f"Background API key validation failed: {e}")
    
    # Provider management methods
    async def get_providers(self, db: AsyncSession, category: Optional[str] = None) -> List[APIProviderSchema]:
        """Get all available API providers"""
        query = select(APIProvider).where(APIProvider.is_active == True)
        
        if category:
            query = query.where(APIProvider.category == category)
        
        result = await db.execute(query.order_by(APIProvider.name))
        providers = result.scalars().all()
        
        return [APIProviderSchema.from_orm(provider) for provider in providers]
    
    async def get_provider(self, db: AsyncSession, provider_id: str) -> Optional[APIProviderSchema]:
        """Get a specific provider"""
        result = await db.execute(
            select(APIProvider).where(APIProvider.id == provider_id)
        )
        provider = result.scalar_one_or_none()
        return APIProviderSchema.from_orm(provider) if provider else None 