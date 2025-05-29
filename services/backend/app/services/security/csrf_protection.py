"""CSRF Protection Service implementing double-submit cookie pattern.

This service provides comprehensive CSRF protection using cryptographically
secure tokens with proper validation, expiration, and security logging.
Implements the double-submit cookie pattern for stateless CSRF protection.
"""

import secrets
import time
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Tuple

import redis.asyncio as redis
from fastapi import Request, Response
from structlog import get_logger

from app.core.config import get_settings
from app.models.security.csrf_token import (
    CSRFTokenData,
    CSRFValidationRequest,
    CSRFValidationResult,
)

logger = get_logger(__name__)


class CSRFProtectionService:
    """Enterprise-grade CSRF protection service.

    Implements double-submit cookie pattern with additional security features:
    - Cryptographically secure token generation
    - Token expiration and cleanup
    - Request context validation
    - Comprehensive security logging
    - Performance optimization with Redis caching
    """

    def __init__(self, redis_client: redis.Redis):
        """Initialize CSRF protection service.

        Args:
            redis_client: Redis client for token storage and caching
        """
        self.redis_client = redis_client
        self.settings = get_settings()

        # Security configuration
        self.token_length = 32
        self.default_expiry = 3600  # 1 hour
        self.cookie_name = "csrf_token"
        self.header_name = "X-CSRF-Token"

        # Performance metrics
        self._generation_count = 0
        self._validation_count = 0
        self._validation_failures = 0

    async def generate_token(
        self,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        expiry_seconds: Optional[int] = None,
    ) -> CSRFTokenData:
        """Generate a new CSRF token with security context.

        Args:
            user_id: Optional user ID for token binding
            session_id: Optional session ID for token binding
            ip_address: Request IP address for validation
            user_agent: Request user agent for fingerprinting
            expiry_seconds: Custom expiry time (default: 1 hour)

        Returns:
            CSRFTokenData with generated token and metadata

        Raises:
            Exception: If token generation fails
        """
        try:
            # Generate cryptographically secure token
            token = secrets.token_urlsafe(self.token_length)

            # Calculate expiration
            expiry = expiry_seconds or self.default_expiry
            expires_at = datetime.utcnow() + timedelta(seconds=expiry)

            # Create token data
            token_data = CSRFTokenData(
                token=token,
                user_id=user_id,
                session_id=session_id,
                ip_address=ip_address,
                user_agent=user_agent,
                expires_at=expires_at,
            )

            # Store token in Redis for validation
            await self._store_token(token_data, expiry)

            # Update metrics
            self._generation_count += 1

            # Log token generation
            await logger.ainfo(
                "csrf_token_generated",
                token_id=token[:8],
                user_id=user_id,
                session_id=session_id,
                expires_at=expires_at.isoformat(),
                ip_address=ip_address,
            )

            return token_data

        except Exception as e:
            await logger.aerror(
                "csrf_token_generation_failed",
                error=str(e),
                user_id=user_id,
                session_id=session_id,
            )
            raise

    async def validate_token(
        self, validation_request: CSRFValidationRequest
    ) -> CSRFValidationResult:
        """Validate CSRF token using double-submit pattern.

        Args:
            validation_request: Token validation request with context

        Returns:
            CSRFValidationResult with validation outcome
        """
        self._validation_count += 1

        try:
            # Extract tokens from request
            header_token = validation_request.header_token
            cookie_token = validation_request.cookie_token

            # Double-submit validation: header and cookie must match
            if not header_token or not cookie_token:
                return self._validation_failure(
                    "missing_tokens", "Both header and cookie tokens required"
                )

            if not secrets.compare_digest(header_token, cookie_token):
                return self._validation_failure(
                    "token_mismatch", "Header and cookie tokens do not match"
                )

            # Retrieve token data from Redis
            token_data = await self._get_token(header_token)
            if not token_data:
                return self._validation_failure(
                    "token_not_found", "Token not found or expired"
                )

            # Validate token context
            if not token_data.is_valid_for_request(
                validation_request.ip_address, validation_request.user_agent
            ):
                return self._validation_failure(
                    "context_mismatch", "Token context validation failed"
                )

            # Calculate token age
            token_age = int((datetime.utcnow() - token_data.created_at).total_seconds())

            # Log successful validation
            await logger.ainfo(
                "csrf_token_validated",
                token_id=header_token[:8],
                user_id=token_data.user_id,
                token_age=token_age,
                ip_address=validation_request.ip_address,
            )

            return CSRFValidationResult(is_valid=True, token_age=token_age)

        except Exception as e:
            await logger.aerror(
                "csrf_validation_error",
                error=str(e),
                token_id=validation_request.token[:8]
                if validation_request.token
                else None,
            )
            return self._validation_failure(
                "validation_error", "Internal validation error"
            )

    async def set_csrf_cookie(
        self, response: Response, token_data: CSRFTokenData
    ) -> None:
        """Set CSRF token cookie with secure configuration.

        Args:
            response: FastAPI response object
            token_data: CSRF token data to set as cookie
        """
        response.set_cookie(
            key=self.cookie_name,
            value=token_data.token,
            max_age=token_data.remaining_ttl,
            httponly=False,  # Must be accessible to JavaScript
            secure=True,  # HTTPS only
            samesite="strict",  # CSRF protection
        )

        await logger.adebug(
            "csrf_cookie_set",
            token_id=token_data.token[:8],
            expires_at=token_data.expires_at.isoformat(),
        )

    async def cleanup_expired_tokens(self) -> int:
        """Clean up expired CSRF tokens from Redis.

        Returns:
            Number of tokens cleaned up
        """
        try:
            # Get all CSRF token keys
            pattern = f"{self._get_redis_key('*')}"
            keys = await self.redis_client.keys(pattern)

            cleaned_count = 0
            for key in keys:
                # Check if key still exists (TTL-based cleanup)
                if not await self.redis_client.exists(key):
                    cleaned_count += 1

            await logger.ainfo(
                "csrf_tokens_cleaned",
                cleaned_count=cleaned_count,
                total_keys_checked=len(keys),
            )

            return cleaned_count

        except Exception as e:
            await logger.aerror("csrf_cleanup_error", error=str(e))
            return 0

    async def get_security_metrics(self) -> Dict[str, Any]:
        """Get CSRF security metrics for monitoring.

        Returns:
            Dictionary with security metrics and statistics
        """
        success_rate = 0.0
        if self._validation_count > 0:
            success_rate = (
                (self._validation_count - self._validation_failures)
                / self._validation_count
            ) * 100

        return {
            "csrf_tokens_generated": self._generation_count,
            "csrf_validations_total": self._validation_count,
            "csrf_validation_failures": self._validation_failures,
            "csrf_success_rate": round(success_rate, 2),
            "timestamp": datetime.utcnow().isoformat(),
        }

    # Private helper methods

    async def _store_token(
        self, token_data: CSRFTokenData, expiry_seconds: int
    ) -> None:
        """Store token data in Redis with expiration."""
        key = self._get_redis_key(token_data.token)
        value = token_data.model_dump_json()

        await self.redis_client.setex(key, expiry_seconds, value)

    async def _get_token(self, token: str) -> Optional[CSRFTokenData]:
        """Retrieve token data from Redis."""
        key = self._get_redis_key(token)
        value = await self.redis_client.get(key)

        if not value:
            return None

        try:
            return CSRFTokenData.model_validate_json(value)
        except Exception:
            # Invalid token data, clean up
            await self.redis_client.delete(key)
            return None

    def _get_redis_key(self, token: str) -> str:
        """Generate Redis key for token storage."""
        return f"csrf_token:{token}"

    def _validation_failure(
        self, error_code: str, error_message: str
    ) -> CSRFValidationResult:
        """Create validation failure result."""
        self._validation_failures += 1

        return CSRFValidationResult(
            is_valid=False, error_code=error_code, error_message=error_message
        )


class CSRFTokenGenerator:
    """Utility class for CSRF token generation.

    Provides standalone token generation for cases where
    the full service is not needed.
    """

    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Generate a cryptographically secure token.

        Args:
            length: Token length in bytes

        Returns:
            URL-safe base64 encoded token
        """
        return secrets.token_urlsafe(length)

    @staticmethod
    def is_token_format_valid(token: str) -> bool:
        """Validate token format without server lookup.

        Args:
            token: Token to validate format

        Returns:
            True if token format is valid
        """
        if not token or not isinstance(token, str):
            return False

        # Check length (URL-safe base64 encoding)
        if len(token) < 16 or len(token) > 128:
            return False

        # Check character set (URL-safe base64)
        allowed_chars = set(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        )
        return all(c in allowed_chars for c in token)
