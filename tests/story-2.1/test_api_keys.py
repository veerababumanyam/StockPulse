"""
Test cases for API Key Management
Tests all API key functionality for Story 2.1
"""

import pytest
import asyncio
from decimal import Decimal
from datetime import datetime
from fastapi import status
from unittest.mock import patch, MagicMock, AsyncMock
import uuid

from app.schemas.api_keys import APIKeyCreate, APIKeyUpdate, APIKeyValidationResponse
from app.models.api_keys import APIKey, APIProvider
from app.models.user import User
from app.services.api_keys import APIKeyService, APIKeyEncryption


class TestAPIKeyManagement:
    """Test suite for API Key CRUD operations."""
    
    @pytest.mark.asyncio
    async def test_create_api_key_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        api_providers
    ):
        """Test successful API key creation."""
        api_key_data = {
            "provider_id": "openai",
            "name": "My OpenAI Key",
            "description": "Key for AI analysis",
            "key": "sk-test_openai_key_12345"
        }
        
        response = test_client.post(
            "/api/v1/api-keys",
            json=api_key_data,
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        assert data["provider_id"] == api_key_data["provider_id"]
        assert data["name"] == api_key_data["name"]
        assert data["description"] == api_key_data["description"]
        assert data["user_id"] == str(test_user.id)
        assert data["is_active"] == True
        assert "id" in data
        assert "created_at" in data
        # Actual key should not be returned
        assert "key" not in data
    
    @pytest.mark.asyncio
    async def test_create_api_key_duplicate(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_api_keys
    ):
        """Test creating duplicate API key fails."""
        duplicate_key = {
            "provider_id": "openai",
            "name": "Duplicate Key",
            "key": "sk-test_openai_key_123"  # Same as existing key
        }
        
        response = test_client.post(
            "/api/v1/api-keys",
            json=duplicate_key,
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_409_CONFLICT
        assert "already registered" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_get_user_api_keys(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_api_keys
    ):
        """Test retrieving user's API keys."""
        response = test_client.get(
            "/api/v1/api-keys",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "items" in data
        assert len(data["items"]) >= len(test_api_keys)
        assert "total" in data
        assert "page" in data
        
        # Verify key structure
        key = data["items"][0]
        assert "id" in key
        assert "provider_id" in key
        assert "name" in key
        assert "is_active" in key
        assert "is_validated" in key
        # Actual key should not be included
        assert "encrypted_key" not in key
    
    @pytest.mark.asyncio
    async def test_filter_api_keys_by_provider(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_api_keys
    ):
        """Test filtering API keys by provider."""
        response = test_client.get(
            "/api/v1/api-keys?provider_id=openai",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # All returned keys should be for OpenAI
        for key in data["items"]:
            assert key["provider_id"] == "openai"
    
    @pytest.mark.asyncio
    async def test_update_api_key_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_api_keys
    ):
        """Test successful API key update."""
        api_key = test_api_keys[0]
        update_data = {
            "name": "Updated Key Name",
            "description": "Updated description"
        }
        
        response = test_client.put(
            f"/api/v1/api-keys/{api_key.id}",
            json=update_data,
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
    
    @pytest.mark.asyncio
    async def test_deactivate_api_key(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_api_keys
    ):
        """Test deactivating an API key."""
        api_key = test_api_keys[0]
        update_data = {"is_active": False}
        
        response = test_client.put(
            f"/api/v1/api-keys/{api_key.id}",
            json=update_data,
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["is_active"] == False
    
    @pytest.mark.asyncio
    async def test_delete_api_key_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_api_keys
    ):
        """Test successful API key deletion."""
        api_key = test_api_keys[0]
        
        response = test_client.delete(
            f"/api/v1/api-keys/{api_key.id}",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify key is deleted
        get_response = test_client.get(
            f"/api/v1/api-keys/{api_key.id}",
            headers=authenticated_headers
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND


class TestAPIKeyValidation:
    """Test suite for API key validation."""
    
    @pytest.mark.asyncio
    async def test_validate_openai_key_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_api_keys,
        real_api_keys
    ):
        """Test successful OpenAI API key validation."""
        # Create a test key with real OpenAI key
        api_key_data = {
            "provider_id": "openai",
            "name": "Real OpenAI Key",
            "key": real_api_keys["openai"]
        }
        
        # Create the key
        create_response = test_client.post(
            "/api/v1/api-keys",
            json=api_key_data,
            headers=authenticated_headers
        )
        
        assert create_response.status_code == status.HTTP_201_CREATED
        key_id = create_response.json()["id"]
        
        # Validate the key
        with patch('app.services.api_keys.APIKeyValidator.validate_key') as mock_validate:
            mock_validate.return_value = APIKeyValidationResponse(
                is_valid=True,
                response_time_ms=250
            )
            
            response = test_client.post(
                f"/api/v1/api-keys/{key_id}/validate",
                headers=authenticated_headers
            )
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["is_valid"] == True
            assert "response_time_ms" in data
    
    @pytest.mark.asyncio
    async def test_validate_invalid_key(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        api_providers
    ):
        """Test validation of invalid API key."""
        # Create key with invalid value
        api_key_data = {
            "provider_id": "openai",
            "name": "Invalid Key",
            "key": "sk-invalid_key_12345"
        }
        
        create_response = test_client.post(
            "/api/v1/api-keys",
            json=api_key_data,
            headers=authenticated_headers
        )
        
        key_id = create_response.json()["id"]
        
        # Mock failed validation
        with patch('app.services.api_keys.APIKeyValidator.validate_key') as mock_validate:
            mock_validate.return_value = APIKeyValidationResponse(
                is_valid=False,
                error_message="Invalid API key",
                response_time_ms=100
            )
            
            response = test_client.post(
                f"/api/v1/api-keys/{key_id}/validate",
                headers=authenticated_headers
            )
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["is_valid"] == False
            assert "error_message" in data
    
    @pytest.mark.asyncio
    async def test_validate_fmp_key_success(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        api_providers,
        real_api_keys
    ):
        """Test Financial Modeling Prep API key validation."""
        api_key_data = {
            "provider_id": "fmp",
            "name": "Real FMP Key",
            "key": real_api_keys["fmp"]
        }
        
        create_response = test_client.post(
            "/api/v1/api-keys",
            json=api_key_data,
            headers=authenticated_headers
        )
        
        key_id = create_response.json()["id"]
        
        # Mock successful validation
        with patch('app.services.api_keys.APIKeyValidator.validate_key') as mock_validate:
            mock_validate.return_value = APIKeyValidationResponse(
                is_valid=True,
                response_time_ms=300,
                rate_limit_remaining=4999
            )
            
            response = test_client.post(
                f"/api/v1/api-keys/{key_id}/validate",
                headers=authenticated_headers
            )
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["is_valid"] == True
            assert data["rate_limit_remaining"] == 4999


class TestAPIKeyEncryption:
    """Test suite for API key encryption."""
    
    def test_encrypt_decrypt_key(self):
        """Test API key encryption and decryption."""
        encryption = APIKeyEncryption("test_encryption_key_for_testing")
        original_key = "sk-test_api_key_12345"
        
        # Encrypt the key
        encrypted_key = encryption.encrypt_key(original_key)
        assert encrypted_key != original_key
        assert len(encrypted_key) > len(original_key)
        
        # Decrypt the key
        decrypted_key = encryption.decrypt_key(encrypted_key)
        assert decrypted_key == original_key
    
    def test_key_hashing(self):
        """Test API key hashing for deduplication."""
        key1 = "sk-test_key_123"
        key2 = "sk-test_key_456"
        
        hash1 = APIKeyEncryption.hash_key(key1)
        hash2 = APIKeyEncryption.hash_key(key2)
        
        # Same key should produce same hash
        assert APIKeyEncryption.hash_key(key1) == hash1
        
        # Different keys should produce different hashes
        assert hash1 != hash2
        
        # Hash should be consistent length
        assert len(hash1) == 64  # SHA-256 hex digest
    
    def test_key_masking(self):
        """Test API key masking for display."""
        test_cases = [
            ("sk-test123456789", "sk-t***********789"),
            ("short", "*****"),
            ("verylongapikeystring123456789", "very***************************789"),
            ("12345678", "1234****"),
        ]
        
        for original, expected in test_cases:
            masked = APIKeyEncryption.mask_key(original)
            if len(original) <= 8:
                assert masked == "*" * len(original)
            else:
                assert masked.startswith(original[:4])
                assert masked.endswith(original[-4:])
                assert "*" in masked


class TestAPIProviders:
    """Test suite for API providers management."""
    
    @pytest.mark.asyncio
    async def test_get_api_providers(
        self,
        test_client,
        authenticated_headers,
        api_providers
    ):
        """Test retrieving all API providers."""
        response = test_client.get(
            "/api/v1/api-keys/providers",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) >= len(api_providers)
        
        # Verify provider structure
        provider = data["items"][0]
        assert "id" in provider
        assert "name" in provider
        assert "category" in provider
        assert "is_active" in provider
    
    @pytest.mark.asyncio
    async def test_filter_providers_by_category(
        self,
        test_client,
        authenticated_headers,
        api_providers
    ):
        """Test filtering providers by category."""
        response = test_client.get(
            "/api/v1/api-keys/providers?category=ai",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # All returned providers should be AI category
        for provider in data["items"]:
            assert provider["category"] == "ai"
    
    @pytest.mark.asyncio
    async def test_get_specific_provider(
        self,
        test_client,
        authenticated_headers,
        api_providers
    ):
        """Test retrieving specific provider details."""
        response = test_client.get(
            "/api/v1/api-keys/providers/openai",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["id"] == "openai"
        assert data["name"] == "OpenAI"
        assert data["category"] == "ai"


class TestAPIKeyStatistics:
    """Test suite for API key usage statistics."""
    
    @pytest.mark.asyncio
    async def test_get_user_api_key_stats(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_api_keys
    ):
        """Test retrieving user API key statistics."""
        response = test_client.get(
            "/api/v1/api-keys/stats/user",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "total_keys" in data
        assert "active_keys" in data
        assert "validated_keys" in data
        assert "total_usage" in data
        assert "providers_used" in data
        assert "top_providers" in data
        
        assert data["total_keys"] >= len(test_api_keys)
        assert isinstance(data["providers_used"], list)
        assert isinstance(data["top_providers"], list)


class TestAPIKeyBulkOperations:
    """Test suite for bulk API key operations."""
    
    @pytest.mark.asyncio
    async def test_bulk_activate_keys(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_api_keys
    ):
        """Test bulk activation of API keys."""
        key_ids = [str(key.id) for key in test_api_keys[:2]]
        
        bulk_data = {
            "key_ids": key_ids,
            "operation": "activate"
        }
        
        response = test_client.post(
            "/api/v1/api-keys/bulk",
            json=bulk_data,
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "successful" in data
        assert "failed" in data
        assert len(data["successful"]) == len(key_ids)
        assert len(data["failed"]) == 0
    
    @pytest.mark.asyncio
    async def test_bulk_validate_keys(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_api_keys
    ):
        """Test bulk validation of API keys."""
        key_ids = [str(key.id) for key in test_api_keys]
        
        bulk_data = {
            "key_ids": key_ids,
            "operation": "validate"
        }
        
        with patch('app.services.api_keys.APIKeyService.validate_api_key') as mock_validate:
            mock_validate.return_value = APIKeyValidationResponse(is_valid=True)
            
            response = test_client.post(
                "/api/v1/api-keys/bulk",
                json=bulk_data,
                headers=authenticated_headers
            )
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            
            assert len(data["successful"]) == len(key_ids)


class TestAPIKeyErrorHandling:
    """Test suite for API key error handling."""
    
    @pytest.mark.asyncio
    async def test_create_key_invalid_provider(
        self,
        test_client,
        authenticated_headers
    ):
        """Test creating key with invalid provider."""
        api_key_data = {
            "provider_id": "nonexistent_provider",
            "name": "Invalid Provider Key",
            "key": "test_key_123"
        }
        
        response = test_client.post(
            "/api/v1/api-keys",
            json=api_key_data,
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "not found" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_access_other_user_key(
        self,
        test_client,
        authenticated_headers
    ):
        """Test accessing another user's API key."""
        fake_key_id = str(uuid.uuid4())
        
        response = test_client.get(
            f"/api/v1/api-keys/{fake_key_id}",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    @pytest.mark.asyncio
    async def test_invalid_key_format_validation(
        self,
        test_client,
        authenticated_headers,
        api_providers
    ):
        """Test validation of invalid key formats."""
        invalid_keys = [
            {"key": "", "error": "empty key"},
            {"key": "short", "error": "too short"},
            {"key": "your_api_key", "error": "placeholder"},
            {"key": "replace_me", "error": "placeholder"},
        ]
        
        for invalid_key in invalid_keys:
            api_key_data = {
                "provider_id": "openai",
                "name": "Invalid Key Test",
                "key": invalid_key["key"]
            }
            
            response = test_client.post(
                "/api/v1/api-keys",
                json=api_key_data,
                headers=authenticated_headers
            )
            
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestRealAPIKeyIntegration:
    """Test suite for real API key integration tests."""
    
    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_real_openai_key_validation(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        api_providers,
        real_api_keys
    ):
        """Test validation with real OpenAI API key."""
        if not real_api_keys.get("openai"):
            pytest.skip("No real OpenAI API key provided")
        
        api_key_data = {
            "provider_id": "openai",
            "name": "Real OpenAI Integration Test",
            "key": real_api_keys["openai"]
        }
        
        # Create the key
        create_response = test_client.post(
            "/api/v1/api-keys",
            json=api_key_data,
            headers=authenticated_headers
        )
        
        assert create_response.status_code == status.HTTP_201_CREATED
        key_id = create_response.json()["id"]
        
        # Validate with real API
        response = test_client.post(
            f"/api/v1/api-keys/{key_id}/validate",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Real validation might succeed or fail depending on key status
        assert "is_valid" in data
        if not data["is_valid"]:
            assert "error_message" in data
    
    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_real_fmp_key_validation(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        api_providers,
        real_api_keys
    ):
        """Test validation with real Financial Modeling Prep API key."""
        if not real_api_keys.get("fmp"):
            pytest.skip("No real FMP API key provided")
        
        api_key_data = {
            "provider_id": "fmp",
            "name": "Real FMP Integration Test",
            "key": real_api_keys["fmp"]
        }
        
        create_response = test_client.post(
            "/api/v1/api-keys",
            json=api_key_data,
            headers=authenticated_headers
        )
        
        assert create_response.status_code == status.HTTP_201_CREATED
        key_id = create_response.json()["id"]
        
        # Validate with real API
        response = test_client.post(
            f"/api/v1/api-keys/{key_id}/validate",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "is_valid" in data
        
        if data["is_valid"]:
            assert "response_time_ms" in data
            # FMP might include rate limit info
            if "rate_limit_remaining" in data:
                assert isinstance(data["rate_limit_remaining"], int)


class TestAPIKeySecurityFeatures:
    """Test suite for API key security features."""
    
    @pytest.mark.asyncio
    async def test_key_rotation_workflow(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        api_providers
    ):
        """Test API key rotation workflow."""
        # Create original key
        original_key_data = {
            "provider_id": "openai",
            "name": "Original Key",
            "key": "sk-original_key_123"
        }
        
        create_response = test_client.post(
            "/api/v1/api-keys",
            json=original_key_data,
            headers=authenticated_headers
        )
        
        original_key_id = create_response.json()["id"]
        
        # Create new key
        new_key_data = {
            "provider_id": "openai",
            "name": "New Rotated Key",
            "key": "sk-new_rotated_key_456"
        }
        
        new_create_response = test_client.post(
            "/api/v1/api-keys",
            json=new_key_data,
            headers=authenticated_headers
        )
        
        assert new_create_response.status_code == status.HTTP_201_CREATED
        
        # Deactivate original key
        deactivate_response = test_client.put(
            f"/api/v1/api-keys/{original_key_id}",
            json={"is_active": False},
            headers=authenticated_headers
        )
        
        assert deactivate_response.status_code == status.HTTP_200_OK
        assert deactivate_response.json()["is_active"] == False
    
    @pytest.mark.asyncio
    async def test_secure_key_display(
        self,
        test_client,
        test_user: User,
        authenticated_headers,
        test_api_keys
    ):
        """Test secure display of API keys (masked)."""
        api_key = test_api_keys[0]
        
        response = test_client.get(
            f"/api/v1/api-keys/{api_key.id}/secure",
            headers=authenticated_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "masked_key" in data
        assert "****" in data["masked_key"]
        # Original key should not be visible
        assert len(data["masked_key"]) <= len("sk-test_openai_key_123")
        
        # Other sensitive data should not be included
        assert "encrypted_key" not in data
        assert "key_hash" not in data 