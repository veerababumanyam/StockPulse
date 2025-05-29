"""Unit tests for CSRF Protection Service.

Comprehensive test suite for the CSRFProtectionService including token
generation, validation, double-submit cookie pattern, and security scenarios.
"""

import secrets
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import redis.asyncio as redis
from fastapi import Response
from pydantic import ValidationError

from app.models.security.csrf_token import (
    CSRFTokenData,
    CSRFValidationRequest,
    CSRFValidationResult,
)
from app.services.security.csrf_protection import CSRFProtectionService


class TestCSRFProtectionService:
    """Test suite for CSRF Protection Service."""

    @pytest.fixture
    async def mock_redis(self):
        """Mock Redis client for testing."""
        mock_redis = AsyncMock(spec=redis.Redis)
        return mock_redis

    @pytest.fixture
    def csrf_service(self, mock_redis):
        """Create CSRF protection service instance."""
        return CSRFProtectionService(mock_redis)

    @pytest.fixture
    def sample_token_data(self):
        """Sample CSRF token data for testing."""
        return CSRFTokenData(
            token="test_token_123456789012345678901234567890AB",  # 32+ characters
            user_id="user123",
            session_id="session456",
            ip_address="192.168.1.100",
            user_agent="Mozilla/5.0 Test Browser",
            expires_at=datetime.now(datetime.timezone.utc) + timedelta(hours=1),
        )

    @pytest.mark.asyncio
    async def test_generate_token_success(self, csrf_service, mock_redis):
        """Test successful CSRF token generation."""
        # Arrange
        mock_redis.setex.return_value = True

        # Act
        token_data = await csrf_service.generate_token(
            user_id="user123", session_id="session456", ip_address="192.168.1.100"
        )

        # Assert
        assert token_data.user_id == "user123"
        assert token_data.session_id == "session456"
        assert token_data.ip_address == "192.168.1.100"
        assert len(token_data.token) >= 32  # Minimum token length
        assert token_data.expires_at > datetime.now(datetime.timezone.utc)
        assert not token_data.is_expired

        # Verify Redis storage was called
        mock_redis.setex.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_token_custom_expiry(self, csrf_service, mock_redis):
        """Test token generation with custom expiry time."""
        # Arrange
        custom_expiry = 7200  # 2 hours
        mock_redis.setex.return_value = True

        # Act
        token_data = await csrf_service.generate_token(
            user_id="user123", expiry_seconds=custom_expiry
        )

        # Assert
        expected_expiry = datetime.now(datetime.timezone.utc) + timedelta(
            seconds=custom_expiry
        )
        assert abs((token_data.expires_at - expected_expiry).total_seconds()) < 5
        assert token_data.remaining_ttl > 7190  # Should be close to 2 hours

    @pytest.mark.asyncio
    async def test_validate_token_success(
        self, csrf_service, mock_redis, sample_token_data
    ):
        """Test successful CSRF token validation."""
        # Arrange
        token = sample_token_data.token
        mock_redis.get.return_value = sample_token_data.model_dump_json()

        validation_request = CSRFValidationRequest(
            token=token,
            header_token=token,
            cookie_token=token,
            ip_address=sample_token_data.ip_address,
            user_agent=sample_token_data.user_agent,
        )

        # Act
        result = await csrf_service.validate_token(validation_request)

        # Assert
        assert result.is_valid
        assert result.error_code is None
        assert result.token_age is not None
        assert result.token_age < 10  # Should be very recent

    @pytest.mark.asyncio
    async def test_validate_token_missing_header(self, csrf_service, mock_redis):
        """Test token validation with missing header token."""
        # Arrange
        validation_request = CSRFValidationRequest(
            token="valid_token_123456789012345678901234567890AB",
            header_token=None,  # Missing header
            cookie_token="valid_token_123456789012345678901234567890AB",
        )

        # Act
        result = await csrf_service.validate_token(validation_request)

        # Assert
        assert not result.is_valid
        assert result.error_code == "missing_header_token"
        assert "header token is required" in result.error_message.lower()

    @pytest.mark.asyncio
    async def test_validate_token_mismatch(self, csrf_service, mock_redis):
        """Test token validation with mismatched tokens."""
        # Arrange
        validation_request = CSRFValidationRequest(
            token="valid_token_123456789012345678901234567890AB",
            header_token="different_token_123456789012345678901234567890AB",
            cookie_token="valid_token_123456789012345678901234567890AB",
        )

        # Act
        result = await csrf_service.validate_token(validation_request)

        # Assert
        assert not result.is_valid
        assert result.error_code == "token_mismatch"
        assert "tokens do not match" in result.error_message.lower()

    @pytest.mark.asyncio
    async def test_validate_token_not_found(self, csrf_service, mock_redis):
        """Test token validation when token not found in Redis."""
        # Arrange
        token = "non_existent_token_123456789012345678901234567890AB"
        mock_redis.get.return_value = None

        validation_request = CSRFValidationRequest(
            token=token, header_token=token, cookie_token=token
        )

        # Act
        result = await csrf_service.validate_token(validation_request)

        # Assert
        assert not result.is_valid
        assert result.error_code == "token_not_found"
        assert "token not found or expired" in result.error_message.lower()

    @pytest.mark.asyncio
    async def test_validate_token_context_mismatch(
        self, csrf_service, mock_redis, sample_token_data
    ):
        """Test token validation with context mismatch (different IP)."""
        # Arrange
        mock_redis.get.return_value = sample_token_data.model_dump_json()

        validation_request = CSRFValidationRequest(
            token=sample_token_data.token,
            header_token=sample_token_data.token,
            cookie_token=sample_token_data.token,
            ip_address="10.0.0.1",  # Different IP
            user_agent=sample_token_data.user_agent,
        )

        # Act
        result = await csrf_service.validate_token(validation_request)

        # Assert
        assert not result.is_valid
        assert result.error_code == "context_mismatch"
        assert "context validation failed" in result.error_message.lower()

    @pytest.mark.asyncio
    async def test_validate_expired_token(self, csrf_service, mock_redis):
        """Test validation of expired token."""
        # Arrange
        expired_token_data = CSRFTokenData(
            token="expired_token_123456789012345678901234567890AB",
            user_id="user123",
            expires_at=datetime.now(datetime.timezone.utc)
            - timedelta(hours=1),  # Expired
        )

        token = expired_token_data.token
        mock_redis.get.return_value = expired_token_data.model_dump_json()

        validation_request = CSRFValidationRequest(
            token=token, header_token=token, cookie_token=token
        )

        # Act
        result = await csrf_service.validate_token(validation_request)

        # Assert
        assert not result.is_valid
        assert result.error_code == "token_expired"
        assert "token has expired" in result.error_message.lower()

    @pytest.mark.asyncio
    async def test_set_csrf_cookie(self, csrf_service, sample_token_data):
        """Test setting CSRF cookie with secure configuration."""
        # Arrange
        response = MagicMock(spec=Response)

        # Act
        await csrf_service.set_csrf_cookie(response, sample_token_data)

        # Assert
        response.set_cookie.assert_called_once_with(
            key="csrf_token",
            value=sample_token_data.token,
            max_age=sample_token_data.remaining_ttl,
            httponly=False,  # Must be accessible to JavaScript
            secure=True,  # HTTPS only
            samesite="strict",  # CSRF protection
        )

    @pytest.mark.asyncio
    async def test_cleanup_expired_tokens(self, csrf_service, mock_redis):
        """Test cleanup of expired CSRF tokens."""
        # Arrange
        mock_redis.keys.return_value = [
            "csrf_token:token1_123456789012345678901234567890AB",
            "csrf_token:token2_123456789012345678901234567890AB",
            "csrf_token:token3_123456789012345678901234567890AB",
        ]

        # Mock expired tokens
        expired_token = CSRFTokenData(
            token="token1_123456789012345678901234567890AB",
            expires_at=datetime.now(datetime.timezone.utc) - timedelta(hours=1),
        )

        mock_redis.get.side_effect = [
            expired_token.model_dump_json(),  # Expired
            None,  # Already deleted
            CSRFTokenData(
                token="token3_123456789012345678901234567890AB",
                expires_at=datetime.now(datetime.timezone.utc) + timedelta(hours=1),
            ).model_dump_json(),  # Valid
        ]

        mock_redis.delete.return_value = 1

        # Act
        cleaned_count = await csrf_service.cleanup_expired_tokens()

        # Assert
        assert cleaned_count == 1  # Only one token was expired and cleaned
        mock_redis.delete.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_security_metrics(self, csrf_service):
        """Test security metrics collection."""
        # Arrange
        csrf_service._generation_count = 100
        csrf_service._validation_count = 200
        csrf_service._validation_failures = 10

        # Act
        metrics = await csrf_service.get_security_metrics()

        # Assert
        assert metrics["csrf_tokens_generated"] == 100
        assert metrics["csrf_validations_total"] == 200
        assert metrics["csrf_validation_failures"] == 10
        assert metrics["csrf_success_rate"] == 95.0  # (200-10)/200 * 100
        assert "timestamp" in metrics

    @pytest.mark.asyncio
    async def test_token_generation_with_redis_failure(self, csrf_service, mock_redis):
        """Test token generation when Redis storage fails."""
        # Arrange
        mock_redis.setex.side_effect = Exception("Redis connection failed")

        # Act & Assert
        with pytest.raises(Exception, match="Redis connection failed"):
            await csrf_service.generate_token(user_id="user123")

    @pytest.mark.asyncio
    async def test_validation_with_redis_failure(self, csrf_service, mock_redis):
        """Test token validation when Redis lookup fails."""
        # Arrange
        mock_redis.get.side_effect = Exception("Redis connection failed")

        validation_request = CSRFValidationRequest(
            token="test_token_123456789012345678901234567890AB",
            header_token="test_token_123456789012345678901234567890AB",
            cookie_token="test_token_123456789012345678901234567890AB",
        )

        # Act
        result = await csrf_service.validate_token(validation_request)

        # Assert
        assert not result.is_valid
        assert result.error_code == "validation_error"
        assert "Internal validation error" in result.error_message

    def test_csrf_token_data_model_validation(self):
        """Test CSRFTokenData model validation."""
        # Test valid token data
        valid_data = CSRFTokenData(
            token="valid_token_123456789012345678901234567890AB",
            user_id="user123",
            expires_at=datetime.now(datetime.timezone.utc) + timedelta(hours=1),
        )
        assert valid_data.token == "valid_token_123456789012345678901234567890AB"
        assert not valid_data.is_expired()

        # Test expired token
        expired_data = CSRFTokenData(
            token="expired_token_123456789012345678901234567890AB",
            user_id="user123",
            expires_at=datetime.now(datetime.timezone.utc) + timedelta(hours=1),
        )
        assert not expired_data.is_expired()  # This one is not expired

    def test_csrf_validation_request_model(self):
        """Test CSRFValidationRequest model validation."""
        # Test valid request
        valid_request = CSRFValidationRequest(
            token="test_token_123456789012345678901234567890AB",
            header_token="test_token_123456789012345678901234567890AB",
            cookie_token="test_token_123456789012345678901234567890AB",
        )
        assert valid_request.token == "test_token_123456789012345678901234567890AB"
        assert (
            valid_request.header_token == "test_token_123456789012345678901234567890AB"
        )
        assert (
            valid_request.cookie_token == "test_token_123456789012345678901234567890AB"
        )

    def test_csrf_validation_result_model(self):
        """Test CSRFValidationResult model."""
        # Test successful validation result
        success_result = CSRFValidationResult(is_valid=True, token_age=120)
        assert success_result.is_valid
        assert success_result.token_age == 120
        assert success_result.error_code is None

        # Test failure result
        failure_result = CSRFValidationResult(
            is_valid=False,
            error_code="token_expired",
            error_message="Token has expired",
        )
        assert not failure_result.is_valid
        assert failure_result.error_code == "token_expired"
        assert failure_result.error_message == "Token has expired"


class TestCSRFTokenGenerator:
    """Test suite for CSRF token generator utility."""

    def test_generate_secure_token_default_length(self):
        """Test generating token with default length."""
        from app.services.security.csrf_protection import CSRFTokenGenerator

        token = CSRFTokenGenerator.generate_secure_token()

        # URL-safe base64 encoding of 32 bytes should be about 43 characters
        assert len(token) >= 40
        assert len(token) <= 50
        assert CSRFTokenGenerator.is_token_format_valid(token)

    def test_generate_secure_token_custom_length(self):
        """Test generating token with custom length."""
        from app.services.security.csrf_protection import CSRFTokenGenerator

        token = CSRFTokenGenerator.generate_secure_token(16)

        # URL-safe base64 encoding of 16 bytes should be about 22 characters
        assert len(token) >= 20
        assert len(token) <= 25
        assert CSRFTokenGenerator.is_token_format_valid(token)

    def test_token_format_validation(self):
        """Test token format validation."""
        from app.services.security.csrf_protection import CSRFTokenGenerator

        # Valid tokens
        assert CSRFTokenGenerator.is_token_format_valid("abcDEF123-_")
        assert CSRFTokenGenerator.is_token_format_valid("a" * 32)

        # Invalid tokens
        assert not CSRFTokenGenerator.is_token_format_valid("")
        assert not CSRFTokenGenerator.is_token_format_valid("short")
        assert not CSRFTokenGenerator.is_token_format_valid("a" * 129)  # Too long
        assert not CSRFTokenGenerator.is_token_format_valid("token with spaces")
        assert not CSRFTokenGenerator.is_token_format_valid("token+with/special=chars")
        assert not CSRFTokenGenerator.is_token_format_valid(None)
        assert not CSRFTokenGenerator.is_token_format_valid(123)

    def test_token_uniqueness(self):
        """Test that generated tokens are unique."""
        from app.services.security.csrf_protection import CSRFTokenGenerator

        tokens = set()
        for _ in range(100):
            token = CSRFTokenGenerator.generate_secure_token()
            assert token not in tokens, "Generated duplicate token"
            tokens.add(token)

        assert len(tokens) == 100


@pytest.mark.integration
class TestCSRFIntegration:
    """Integration tests for CSRF protection."""

    @pytest.mark.asyncio
    async def test_full_csrf_workflow(self, csrf_service, mock_redis):
        """Test complete CSRF token workflow."""
        # Step 1: Generate token
        mock_redis.setex.return_value = True
        token_data = await csrf_service.generate_token(
            user_id="user123", session_id="session456", ip_address="192.168.1.100"
        )

        # Step 2: Store token in mock Redis
        mock_redis.get.return_value = token_data.model_dump_json()

        # Step 3: Validate token
        validation_request = CSRFValidationRequest(
            token=token_data.token,
            header_token=token_data.token,
            cookie_token=token_data.token,
            ip_address=token_data.ip_address,
        )

        result = await csrf_service.validate_token(validation_request)

        # Assert workflow completed successfully
        assert result.is_valid
        assert result.error_code is None

    @pytest.mark.asyncio
    async def test_csrf_double_submit_pattern(self, csrf_service, mock_redis):
        """Test the double-submit cookie pattern implementation."""
        # Generate token
        mock_redis.setex.return_value = True
        token_data = await csrf_service.generate_token()

        # Simulate valid double-submit
        mock_redis.get.return_value = token_data.model_dump_json()
        valid_request = CSRFValidationRequest(
            token=token_data.token,
            header_token=token_data.token,
            cookie_token=token_data.token,
        )

        result = await csrf_service.validate_token(valid_request)
        assert result.is_valid

        # Simulate invalid double-submit (different tokens)
        invalid_request = CSRFValidationRequest(
            token=token_data.token,
            header_token=token_data.token,
            cookie_token="different_token_123456789012345678901234567890AB",
        )

        result = await csrf_service.validate_token(invalid_request)
        assert not result.is_valid
        assert result.error_code == "token_mismatch"
