"""
API Keys API Endpoints
RESTful API for managing API keys with enterprise security features
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.dependencies import get_current_user, CurrentUser
from ...core.events import get_event_bus, EventBus
from ...models.user import User
from ...schemas.api_keys import (
    APIKeyCreate, APIKeyUpdate, APIKeyResponse, APIKeySecure,
    APIKeyListResponse, APIKeyValidationResponse,
    APIProvider, APIProviderListResponse,
    APIKeyStats, UserAPIKeyStats,
    BulkAPIKeyOperation, BulkAPIKeyResult
)
from ...services.api_keys import APIKeyService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api-keys", tags=["API Keys"])
security = HTTPBearer()

# Dependency to get API key service
async def get_api_key_service(event_bus: EventBus = Depends(get_event_bus)) -> APIKeyService:
    return APIKeyService(event_bus)

@router.get("/providers", response_model=APIProviderListResponse)
async def get_api_providers(
    category: Optional[str] = Query(None, description="Filter by provider category"),
    db: AsyncSession = Depends(get_db),
    service: APIKeyService = Depends(get_api_key_service)
):
    """
    Get all available API providers
    
    - **category**: Optional filter by category (ai, financial, data)
    """
    try:
        providers = await service.get_providers(db, category=category)
        return APIProviderListResponse(
            items=providers,
            total=len(providers)
        )
    except Exception as e:
        logger.error(f"Failed to get API providers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve API providers"
        )

@router.get("/providers/{provider_id}", response_model=APIProvider)
async def get_api_provider(
    provider_id: str,
    db: AsyncSession = Depends(get_db),
    service: APIKeyService = Depends(get_api_key_service)
):
    """
    Get details for a specific API provider
    """
    try:
        provider = await service.get_provider(db, provider_id)
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {provider_id} not found"
            )
        return provider
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get API provider {provider_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve API provider"
        )

@router.post("", response_model=APIKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    api_key_data: APIKeyCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    service: APIKeyService = Depends(get_api_key_service)
):
    """
    Create a new API key
    
    - **provider_id**: The API provider identifier
    - **name**: User-defined name for the key
    - **description**: Optional description
    - **key**: The actual API key (will be encrypted)
    
    The API key will be encrypted before storage and validated in the background.
    """
    try:
        client_ip = request.client.host if request.client else None
        api_key = await service.create_api_key(
            db=db,
            user_id=current_user.id,
            api_key_data=api_key_data,
            client_ip=client_ip
        )
        
        logger.info(f"API key created for user {current_user.id}, provider {api_key_data.provider_id}")
        return api_key
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create API key"
        )

@router.get("", response_model=APIKeyListResponse)
async def get_user_api_keys(
    provider_id: Optional[str] = Query(None, description="Filter by provider ID"),
    category: Optional[str] = Query(None, description="Filter by provider category"),
    include_inactive: bool = Query(False, description="Include inactive keys"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    service: APIKeyService = Depends(get_api_key_service)
):
    """
    Get user's API keys with pagination and filtering
    
    - **provider_id**: Filter by specific provider
    - **category**: Filter by provider category (ai, financial, data)
    - **include_inactive**: Include deactivated keys
    - **page**: Page number for pagination
    - **per_page**: Number of items per page (max 100)
    """
    try:
        return await service.get_user_api_keys(
            db=db,
            user_id=current_user.id,
            provider_id=provider_id,
            category=category,
            include_inactive=include_inactive,
            page=page,
            per_page=per_page
        )
    except Exception as e:
        logger.error(f"Failed to get user API keys: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve API keys"
        )

@router.get("/{api_key_id}", response_model=APIKeyResponse)
async def get_api_key(
    api_key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    service: APIKeyService = Depends(get_api_key_service)
):
    """
    Get details for a specific API key
    """
    try:
        # Get the user's API keys and find the requested one
        api_keys = await service.get_user_api_keys(
            db=db,
            user_id=current_user.id,
            include_inactive=True,
            per_page=1000  # Get all to find the specific key
        )
        
        api_key = next((key for key in api_keys.items if key.id == api_key_id), None)
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        return api_key
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get API key {api_key_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve API key"
        )

@router.put("/{api_key_id}", response_model=APIKeyResponse)
async def update_api_key(
    api_key_id: UUID,
    update_data: APIKeyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    service: APIKeyService = Depends(get_api_key_service)
):
    """
    Update API key metadata
    
    - **name**: Update the key name
    - **description**: Update the description
    - **is_active**: Activate or deactivate the key
    
    Note: The actual API key value cannot be updated for security reasons.
    """
    try:
        updated_key = await service.update_api_key(
            db=db,
            user_id=current_user.id,
            api_key_id=api_key_id,
            update_data=update_data
        )
        
        logger.info(f"API key {api_key_id} updated by user {current_user.id}")
        return updated_key
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update API key {api_key_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update API key"
        )

@router.delete("/{api_key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    api_key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    service: APIKeyService = Depends(get_api_key_service)
):
    """
    Delete an API key
    
    This action is irreversible. The key will be permanently removed from the system.
    """
    try:
        await service.delete_api_key(
            db=db,
            user_id=current_user.id,
            api_key_id=api_key_id
        )
        
        logger.info(f"API key {api_key_id} deleted by user {current_user.id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete API key {api_key_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete API key"
        )

@router.post("/{api_key_id}/validate", response_model=APIKeyValidationResponse)
async def validate_api_key(
    api_key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    service: APIKeyService = Depends(get_api_key_service)
):
    """
    Validate an API key against its provider
    
    Tests the API key by making a test request to the provider's API.
    Updates the validation status in the database.
    """
    try:
        validation_result = await service.validate_api_key(
            db=db,
            user_id=current_user.id,
            api_key_id=api_key_id
        )
        
        logger.info(f"API key {api_key_id} validation: {validation_result.is_valid}")
        return validation_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to validate API key {api_key_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate API key"
        )

@router.get("/{api_key_id}/secure", response_model=APIKeySecure)
async def get_api_key_secure(
    api_key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    service: APIKeyService = Depends(get_api_key_service)
):
    """
    Get API key with masked key value for display purposes
    
    Returns the API key details with the key value masked for security.
    Use this endpoint when you need to display the key but don't need the actual value.
    """
    try:
        # Get the basic API key info
        api_keys = await service.get_user_api_keys(
            db=db,
            user_id=current_user.id,
            include_inactive=True,
            per_page=1000
        )
        
        api_key = next((key for key in api_keys.items if key.id == api_key_id), None)
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        # Get the actual key to create masked version
        actual_key = await service.get_api_key_for_provider(
            db=db,
            user_id=current_user.id,
            provider_id=api_key.provider_id
        )
        
        masked_key = service.encryption.mask_key(actual_key) if actual_key else "****"
        
        return APIKeySecure(
            **api_key.dict(),
            masked_key=masked_key
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get secure API key {api_key_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve API key"
        )

@router.post("/bulk", response_model=BulkAPIKeyResult)
async def bulk_api_key_operation(
    operation: BulkAPIKeyOperation,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    service: APIKeyService = Depends(get_api_key_service)
):
    """
    Perform bulk operations on API keys
    
    - **activate**: Activate multiple keys
    - **deactivate**: Deactivate multiple keys
    - **delete**: Delete multiple keys
    - **validate**: Validate multiple keys
    
    Returns a list of successful and failed operations.
    """
    try:
        successful = []
        failed = []
        
        for key_id in operation.key_ids:
            try:
                if operation.operation == "activate":
                    await service.update_api_key(
                        db=db,
                        user_id=current_user.id,
                        api_key_id=key_id,
                        update_data=APIKeyUpdate(is_active=True)
                    )
                elif operation.operation == "deactivate":
                    await service.update_api_key(
                        db=db,
                        user_id=current_user.id,
                        api_key_id=key_id,
                        update_data=APIKeyUpdate(is_active=False)
                    )
                elif operation.operation == "delete":
                    await service.delete_api_key(
                        db=db,
                        user_id=current_user.id,
                        api_key_id=key_id
                    )
                elif operation.operation == "validate":
                    await service.validate_api_key(
                        db=db,
                        user_id=current_user.id,
                        api_key_id=key_id
                    )
                
                successful.append(key_id)
                
            except Exception as e:
                failed.append({
                    "id": key_id,
                    "error": str(e)
                })
        
        logger.info(f"Bulk operation {operation.operation} completed: {len(successful)} successful, {len(failed)} failed")
        
        return BulkAPIKeyResult(
            successful=successful,
            failed=failed
        )
        
    except Exception as e:
        logger.error(f"Bulk API key operation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bulk operation failed"
        )

@router.get("/stats/user", response_model=UserAPIKeyStats)
async def get_user_api_key_stats(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
    service: APIKeyService = Depends(get_api_key_service)
):
    """
    Get comprehensive statistics for user's API keys
    
    Returns usage statistics, provider distribution, and cost analysis.
    """
    try:
        # Get all user's API keys
        api_keys = await service.get_user_api_keys(
            db=db,
            user_id=current_user.id,
            include_inactive=True,
            per_page=1000
        )
        
        # Calculate statistics
        total_keys = len(api_keys.items)
        active_keys = sum(1 for key in api_keys.items if key.is_active)
        validated_keys = sum(1 for key in api_keys.items if key.is_validated)
        total_usage = sum(key.usage_count for key in api_keys.items)
        
        # Get provider usage
        providers_used = list(set(key.provider_id for key in api_keys.items))
        
        # Calculate top providers by usage
        provider_usage = {}
        for key in api_keys.items:
            provider_usage[key.provider_id] = provider_usage.get(key.provider_id, 0) + key.usage_count
        
        top_providers = [
            {"provider": provider, "usage": usage}
            for provider, usage in sorted(provider_usage.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        return UserAPIKeyStats(
            total_keys=total_keys,
            active_keys=active_keys,
            validated_keys=validated_keys,
            total_usage=total_usage,
            providers_used=providers_used,
            monthly_costs_cents={},  # Would require usage tracking with cost data
            top_providers=top_providers
        )
        
    except Exception as e:
        logger.error(f"Failed to get user API key stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve API key statistics"
        ) 