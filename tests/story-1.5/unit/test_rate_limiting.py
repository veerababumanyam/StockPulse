"""Unit tests for Rate Limiting Service.

Comprehensive test suite for the RateLimitingService including IP-based,
account-based, global, and endpoint-specific rate limiting with violation
tracking and progressive lockout mechanisms.
"""

import json
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import redis.asyncio as redis
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.security.rate_limit import (
    RateLimit,
    RateLimitData,
    RateLimitResult,
    RateLimitType,
    RateLimitViolation,
)
from app.services.security.rate_limiting import RateLimitingService


class TestRateLimitingService:
    """Test suite for Rate Limiting Service."""

    @pytest.fixture
    async def mock_redis(self):
        """Mock Redis client for testing."""
        mock_redis = AsyncMock(spec=redis.Redis)
        return mock_redis

    @pytest.fixture
    async def mock_db_session(self):
        """Mock database session for testing."""
        mock_session = AsyncMock(spec=AsyncSession)
        return mock_session

    @pytest.fixture
    def rate_limiting_service(self, mock_redis, mock_db_session):
        """Create rate limiting service instance."""
        return RateLimitingService(mock_redis, mock_db_session)

    @pytest.fixture
    def mock_request(self):
        """Mock FastAPI request object."""
        request = MagicMock(spec=Request)
        request.url.path = "/auth/login"
        request.client.host = "192.168.1.100"
        request.headers = {"X-Forwarded-For": "192.168.1.100"}
        return request

    @pytest.mark.asyncio
    async def test_ip_rate_limit_success(self, rate_limiting_service, mock_redis):
        """Test successful IP rate limit check within limits."""
        # Arrange
        ip_address = "192.168.1.100"
        mock_redis.get.return_value = "5"  # Current count
        mock_redis.ttl.return_value = 45  # TTL remaining
        mock_redis.incr.return_value = 6
        mock_redis.expire.return_value = True

        # Act
        result = await rate_limiting_service.check_ip_rate_limit(ip_address)

        # Assert
        assert result.is_allowed
        assert result.limit_type == RateLimitType.IP_BASED
        assert result.identifier == ip_address
        assert result.current_count == 6
        assert result.max_requests == 60
        assert result.remaining_requests == 54
        assert result.time_until_reset == 45
        assert not result.violation_recorded

    @pytest.mark.asyncio
    async def test_ip_rate_limit_exceeded(self, rate_limiting_service, mock_redis):
        """Test IP rate limit exceeded scenario."""
        # Arrange
        ip_address = "192.168.1.100"
        mock_redis.get.return_value = "60"  # At limit
        mock_redis.ttl.return_value = 30

        # Act
        result = await rate_limiting_service.check_ip_rate_limit(ip_address)

        # Assert
        assert not result.is_allowed
        assert result.limit_type == RateLimitType.IP_BASED
        assert result.current_count == 60
        assert result.max_requests == 60
        assert result.remaining_requests == 0
        assert result.violation_recorded

    @pytest.mark.asyncio
    async def test_endpoint_specific_rate_limit(
        self, rate_limiting_service, mock_redis
    ):
        """Test endpoint-specific rate limiting."""
        # Arrange
        ip_address = "192.168.1.100"
        endpoint = "/auth/login"
        mock_redis.get.return_value = "8"
        mock_redis.ttl.return_value = 30
        mock_redis.incr.return_value = 9

        # Act
        result = await rate_limiting_service.check_ip_rate_limit(ip_address, endpoint)

        # Assert
        assert result.is_allowed
        assert result.limit_type == RateLimitType.ENDPOINT_SPECIFIC
        assert result.identifier == f"{ip_address}:{endpoint}"
        assert result.max_requests == 10  # Login endpoint limit
        assert result.current_count == 9
        assert result.remaining_requests == 1

    @pytest.mark.asyncio
    async def test_endpoint_specific_rate_limit_exceeded(
        self, rate_limiting_service, mock_redis
    ):
        """Test endpoint-specific rate limit exceeded."""
        # Arrange
        ip_address = "192.168.1.100"
        endpoint = "/auth/login"
        mock_redis.get.return_value = "10"  # At limit
        mock_redis.ttl.return_value = 45

        # Act
        result = await rate_limiting_service.check_ip_rate_limit(ip_address, endpoint)

        # Assert
        assert not result.is_allowed
        assert result.limit_type == RateLimitType.ENDPOINT_SPECIFIC
        assert result.current_count == 10
        assert result.max_requests == 10
        assert result.remaining_requests == 0
        assert result.violation_recorded

    @pytest.mark.asyncio
    async def test_account_rate_limit_success(self, rate_limiting_service, mock_redis):
        """Test successful account rate limit check."""
        # Arrange
        user_id = "user123"
        action = "login_attempt"
        mock_redis.get.return_value = "2"  # Current count
        mock_redis.ttl.return_value = 180  # 3 minutes remaining
        mock_redis.incr.return_value = 3

        # Act
        result = await rate_limiting_service.check_account_rate_limit(user_id, action)

        # Assert
        assert result.is_allowed
        assert result.limit_type == RateLimitType.ACCOUNT_BASED
        assert result.identifier == f"account:{user_id}:{action}"
        assert result.current_count == 3
        assert result.max_requests == 5
        assert result.remaining_requests == 2

    @pytest.mark.asyncio
    async def test_account_rate_limit_exceeded(self, rate_limiting_service, mock_redis):
        """Test account rate limit exceeded with lockout."""
        # Arrange
        user_id = "user123"
        action = "login_attempt"
        mock_redis.get.return_value = "5"  # At limit
        mock_redis.ttl.return_value = 240

        # Act
        result = await rate_limiting_service.check_account_rate_limit(user_id, action)

        # Assert
        assert not result.is_allowed
        assert result.limit_type == RateLimitType.ACCOUNT_BASED
        assert result.current_count == 5
        assert result.max_requests == 5
        assert result.remaining_requests == 0
        assert result.violation_recorded

    @pytest.mark.asyncio
    async def test_global_rate_limit_success(self, rate_limiting_service, mock_redis):
        """Test successful global rate limit check."""
        # Arrange
        mock_redis.get.return_value = "5000"  # Current count
        mock_redis.ttl.return_value = 45
        mock_redis.incr.return_value = 5001

        # Act
        result = await rate_limiting_service.check_global_rate_limit()

        # Assert
        assert result.is_allowed
        assert result.limit_type == RateLimitType.GLOBAL
        assert result.identifier == "global:all_requests"
        assert result.current_count == 5001
        assert result.max_requests == 10000
        assert result.remaining_requests == 4999

    @pytest.mark.asyncio
    async def test_global_rate_limit_exceeded(self, rate_limiting_service, mock_redis):
        """Test global rate limit exceeded."""
        # Arrange
        mock_redis.get.return_value = "10000"  # At limit
        mock_redis.ttl.return_value = 30

        # Act
        result = await rate_limiting_service.check_global_rate_limit()

        # Assert
        assert not result.is_allowed
        assert result.limit_type == RateLimitType.GLOBAL
        assert result.current_count == 10000
        assert result.max_requests == 10000
        assert result.remaining_requests == 0
        assert result.violation_recorded

    @pytest.mark.asyncio
    async def test_check_all_limits_success(
        self, rate_limiting_service, mock_redis, mock_request
    ):
        """Test checking all rate limits with success."""
        # Arrange
        user_id = "user123"
        action = "login"

        # Mock Redis responses for all checks
        mock_redis.get.side_effect = ["5000", "30", "2"]  # global, ip, account
        mock_redis.ttl.return_value = 45
        mock_redis.incr.side_effect = [5001, 31, 3]

        # Act
        is_allowed, results = await rate_limiting_service.check_all_limits(
            mock_request, user_id, action
        )

        # Assert
        assert is_allowed
        assert len(results) == 3  # global, ip, account
        assert all(result.is_allowed for result in results)

        # Check result types
        result_types = [result.limit_type for result in results]
        assert RateLimitType.GLOBAL in result_types
        assert RateLimitType.ENDPOINT_SPECIFIC in result_types  # Login endpoint
        assert RateLimitType.ACCOUNT_BASED in result_types

    @pytest.mark.asyncio
    async def test_check_all_limits_blocked_by_ip(
        self, rate_limiting_service, mock_redis, mock_request
    ):
        """Test checking all limits with IP limit blocking request."""
        # Arrange
        user_id = "user123"

        # Mock Redis responses - IP limit exceeded
        mock_redis.get.side_effect = [
            "5000",
            "10",
            "2",
        ]  # global ok, ip exceeded, account ok
        mock_redis.ttl.return_value = 45
        mock_redis.incr.side_effect = [
            5001,
            None,
            3,
        ]  # IP doesn't increment when blocked

        # Act
        is_allowed, results = await rate_limiting_service.check_all_limits(
            mock_request, user_id
        )

        # Assert
        assert not is_allowed  # Blocked by IP limit
        assert len(results) == 3

        # Find IP result
        ip_result = next(
            r for r in results if r.limit_type == RateLimitType.ENDPOINT_SPECIFIC
        )
        assert not ip_result.is_allowed
        assert ip_result.current_count == 10
        assert ip_result.max_requests == 10

    @pytest.mark.asyncio
    async def test_record_successful_request(
        self, rate_limiting_service, mock_redis, mock_request
    ):
        """Test recording successful request increments."""
        # Arrange
        user_id = "user123"

        # Act
        await rate_limiting_service.record_successful_request(mock_request, user_id)

        # Assert
        # Should increment global and IP counters
        assert mock_redis.incr.call_count >= 2
        assert mock_redis.expire.call_count >= 2

    @pytest.mark.asyncio
    async def test_get_rate_limit_status_found(self, rate_limiting_service, mock_redis):
        """Test getting rate limit status when data exists."""
        # Arrange
        identifier = "192.168.1.100"
        limit_type = RateLimitType.IP_BASED
        mock_redis.get.return_value = "25"
        mock_redis.ttl.return_value = 45

        # Act
        status = await rate_limiting_service.get_rate_limit_status(
            identifier, limit_type
        )

        # Assert
        assert status is not None
        assert status.limit_type == limit_type
        assert status.identifier == identifier
        assert status.current_count == 25
        assert status.max_requests == 60  # IP limit
        assert status.remaining_requests == 35
        assert status.time_until_reset == 45

    @pytest.mark.asyncio
    async def test_get_rate_limit_status_not_found(
        self, rate_limiting_service, mock_redis
    ):
        """Test getting rate limit status when no data exists."""
        # Arrange
        identifier = "192.168.1.200"
        limit_type = RateLimitType.IP_BASED
        mock_redis.get.return_value = None

        # Act
        status = await rate_limiting_service.get_rate_limit_status(
            identifier, limit_type
        )

        # Assert
        assert status is None

    @pytest.mark.asyncio
    async def test_reset_rate_limit_success(self, rate_limiting_service, mock_redis):
        """Test successful rate limit reset."""
        # Arrange
        identifier = "192.168.1.100"
        limit_type = RateLimitType.IP_BASED
        mock_redis.delete.return_value = 1

        # Act
        result = await rate_limiting_service.reset_rate_limit(identifier, limit_type)

        # Assert
        assert result is True
        mock_redis.delete.assert_called_once()

    @pytest.mark.asyncio
    async def test_reset_rate_limit_failure(self, rate_limiting_service, mock_redis):
        """Test rate limit reset with Redis failure."""
        # Arrange
        identifier = "192.168.1.100"
        limit_type = RateLimitType.IP_BASED
        mock_redis.delete.side_effect = Exception("Redis connection failed")

        # Act
        result = await rate_limiting_service.reset_rate_limit(identifier, limit_type)

        # Assert
        assert result is False

    @pytest.mark.asyncio
    async def test_get_security_metrics(self, rate_limiting_service):
        """Test security metrics collection."""
        # Arrange
        rate_limiting_service._check_count = 1000
        rate_limiting_service._violation_count = 50
        rate_limiting_service._block_count = 10

        # Act
        metrics = await rate_limiting_service.get_security_metrics()

        # Assert
        assert metrics["rate_limit_checks"] == 1000
        assert metrics["rate_limit_violations"] == 50
        assert metrics["accounts_blocked"] == 10
        assert "timestamp" in metrics

    @pytest.mark.asyncio
    async def test_redis_pipeline_operations(self, rate_limiting_service, mock_redis):
        """Test Redis pipeline operations for atomic increments."""
        # Arrange
        mock_pipeline = AsyncMock()
        mock_redis.pipeline.return_value.__aenter__.return_value = mock_pipeline
        mock_redis.get.return_value = "5"
        mock_redis.ttl.return_value = 45

        # Act
        result = await rate_limiting_service._check_redis_limit(
            limit_type=RateLimitType.IP_BASED,
            identifier="192.168.1.100",
            max_requests=60,
            window_seconds=60,
        )

        # Assert
        assert result.is_allowed
        mock_redis.pipeline.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_client_ip_forwarded_for(self, rate_limiting_service):
        """Test IP extraction from X-Forwarded-For header."""
        # Arrange
        request = MagicMock()
        request.headers = {
            "X-Forwarded-For": "203.0.113.1, 70.41.3.18, 150.172.238.178"
        }

        # Act
        ip = rate_limiting_service._get_client_ip(request)

        # Assert
        assert ip == "203.0.113.1"  # First IP in chain

    @pytest.mark.asyncio
    async def test_get_client_ip_real_ip(self, rate_limiting_service):
        """Test IP extraction from X-Real-IP header."""
        # Arrange
        request = MagicMock()
        request.headers = {"X-Real-IP": "203.0.113.50"}

        # Act
        ip = rate_limiting_service._get_client_ip(request)

        # Assert
        assert ip == "203.0.113.50"

    @pytest.mark.asyncio
    async def test_get_client_ip_direct_connection(self, rate_limiting_service):
        """Test IP extraction from direct connection."""
        # Arrange
        request = MagicMock()
        request.headers = {}
        request.client.host = "192.168.1.100"

        # Act
        ip = rate_limiting_service._get_client_ip(request)

        # Assert
        assert ip == "192.168.1.100"

    @pytest.mark.asyncio
    async def test_get_client_ip_no_client(self, rate_limiting_service):
        """Test IP extraction when no client info available."""
        # Arrange
        request = MagicMock()
        request.headers = {}
        request.client = None

        # Act
        ip = rate_limiting_service._get_client_ip(request)

        # Assert
        assert ip == "unknown"

    def test_get_max_requests_for_type(self, rate_limiting_service):
        """Test getting max requests for different limit types."""
        # Test each limit type
        assert (
            rate_limiting_service._get_max_requests_for_type(RateLimitType.IP_BASED)
            == 60
        )
        assert (
            rate_limiting_service._get_max_requests_for_type(
                RateLimitType.ACCOUNT_BASED
            )
            == 5
        )
        assert (
            rate_limiting_service._get_max_requests_for_type(RateLimitType.GLOBAL)
            == 10000
        )
        assert (
            rate_limiting_service._get_max_requests_for_type(
                RateLimitType.ENDPOINT_SPECIFIC
            )
            == 60
        )

    @pytest.mark.asyncio
    async def test_redis_failure_ip_limit_fail_open(
        self, rate_limiting_service, mock_redis
    ):
        """Test Redis failure causes IP limit to fail open for availability."""
        # Arrange
        ip_address = "192.168.1.100"
        mock_redis.get.side_effect = Exception("Redis connection failed")

        # Act
        result = await rate_limiting_service.check_ip_rate_limit(ip_address)

        # Assert
        assert result.is_allowed  # Fails open
        assert "Rate limit check failed, allowing request" in result.error_message

    @pytest.mark.asyncio
    async def test_redis_failure_account_limit_fail_closed(
        self, rate_limiting_service, mock_redis
    ):
        """Test Redis failure causes account limit to fail closed for security."""
        # Arrange
        user_id = "user123"
        mock_redis.get.side_effect = Exception("Redis connection failed")

        # Act
        result = await rate_limiting_service.check_account_rate_limit(user_id)

        # Assert
        assert not result.is_allowed  # Fails closed for security
        assert (
            "Account rate limit check failed, denying request" in result.error_message
        )

    @pytest.mark.asyncio
    async def test_redis_failure_global_limit_fail_open(
        self, rate_limiting_service, mock_redis
    ):
        """Test Redis failure causes global limit to fail open for availability."""
        # Arrange
        mock_redis.get.side_effect = Exception("Redis connection failed")

        # Act
        result = await rate_limiting_service.check_global_rate_limit()

        # Assert
        assert result.is_allowed  # Fails open for availability


@pytest.mark.integration
class TestRateLimitingIntegration:
    """Integration tests for rate limiting scenarios."""

    @pytest.fixture
    def rate_limiting_service(self):
        """Create rate limiting service with real-like mocks."""
        mock_redis = AsyncMock(spec=redis.Redis)
        mock_session = AsyncMock(spec=AsyncSession)
        return RateLimitingService(mock_redis, mock_session)

    @pytest.mark.asyncio
    async def test_progressive_rate_limiting_workflow(self, rate_limiting_service):
        """Test progressive rate limiting with increasing violations."""
        mock_redis = rate_limiting_service.redis_client
        user_id = "user123"

        # Mock progressive attempts
        attempt_counts = [1, 2, 3, 4, 5, 6]  # 6th should trigger lockout
        mock_redis.get.side_effect = [str(count - 1) for count in attempt_counts]
        mock_redis.incr.side_effect = attempt_counts
        mock_redis.ttl.return_value = 240  # 4 minutes remaining

        results = []
        for count in attempt_counts:
            result = await rate_limiting_service.check_account_rate_limit(user_id)
            results.append(result)

        # First 5 attempts should be allowed
        for i in range(5):
            assert results[i].is_allowed, f"Attempt {i+1} should be allowed"
            assert results[i].attempt_count == i + 1

        # 6th attempt should be blocked
        assert not results[5].is_allowed
        assert results[5].attempt_count == 6

    @pytest.mark.asyncio
    async def test_multi_endpoint_rate_limiting(self, rate_limiting_service):
        """Test different rate limits for different endpoints."""
        mock_redis = rate_limiting_service.redis_client
        ip_address = "192.168.1.100"

        # Test login endpoint (10/min limit)
        mock_redis.get.return_value = "9"
        mock_redis.ttl.return_value = 30
        mock_redis.incr.return_value = 10

        login_result = await rate_limiting_service.check_ip_rate_limit(
            ip_address, "/auth/login"
        )
        assert login_result.is_allowed
        assert login_result.max_requests == 10

        # Test register endpoint (5/min limit)
        mock_redis.get.return_value = "4"
        mock_redis.incr.return_value = 5

        register_result = await rate_limiting_service.check_ip_rate_limit(
            ip_address, "/auth/register"
        )
        assert register_result.is_allowed
        assert register_result.max_requests == 5

        # Test password reset endpoint (3/min limit)
        mock_redis.get.return_value = "2"
        mock_redis.incr.return_value = 3

        reset_result = await rate_limiting_service.check_ip_rate_limit(
            ip_address, "/auth/password-reset"
        )
        assert reset_result.is_allowed
        assert reset_result.max_requests == 3

    @pytest.mark.asyncio
    async def test_concurrent_rate_limit_checks(self, rate_limiting_service):
        """Test handling concurrent rate limit checks."""
        mock_redis = rate_limiting_service.redis_client

        # Simulate concurrent requests
        mock_redis.get.return_value = "58"  # Near limit
        mock_redis.ttl.return_value = 45
        mock_redis.incr.side_effect = [59, 60, 61]  # Last one exceeds

        # Simulate 3 concurrent requests
        results = []
        for i in range(3):
            result = await rate_limiting_service.check_ip_rate_limit(f"192.168.1.{i}")
            results.append(result)

        # All should be processed (Redis handles atomicity)
        assert len(results) == 3
        assert all(isinstance(result, RateLimitResult) for result in results)


class TestRateLimitingEdgeCases:
    """Test edge cases and error scenarios."""

    @pytest.fixture
    def rate_limiting_service(self):
        """Create rate limiting service for edge case testing."""
        mock_redis = AsyncMock(spec=redis.Redis)
        mock_session = AsyncMock(spec=AsyncSession)
        return RateLimitingService(mock_redis, mock_session)

    @pytest.mark.asyncio
    async def test_negative_ttl_handling(self, rate_limiting_service):
        """Test handling of negative TTL values."""
        mock_redis = rate_limiting_service.redis_client
        mock_redis.get.return_value = "30"
        mock_redis.ttl.return_value = -1  # Key exists but no TTL

        result = await rate_limiting_service.check_ip_rate_limit("192.168.1.100")

        assert result.time_until_reset == 60  # Default window

    @pytest.mark.asyncio
    async def test_large_count_values(self, rate_limiting_service):
        """Test handling of unusually large count values."""
        mock_redis = rate_limiting_service.redis_client
        mock_redis.get.return_value = "999999"  # Very large count
        mock_redis.ttl.return_value = 30

        result = await rate_limiting_service.check_ip_rate_limit("192.168.1.100")

        assert not result.is_allowed
        assert result.remaining_requests == 0  # Should be clamped to 0

    @pytest.mark.asyncio
    async def test_empty_identifier_handling(self, rate_limiting_service):
        """Test handling of empty or invalid identifiers."""
        mock_redis = rate_limiting_service.redis_client
        mock_redis.get.return_value = "0"
        mock_redis.ttl.return_value = 60
        mock_redis.incr.return_value = 1

        # Test with empty string
        result = await rate_limiting_service.check_ip_rate_limit("")
        assert result.is_allowed

        # Test with None-like values handled by client IP extraction
        request = MagicMock()
        request.headers = {}
        request.client = None

        ip = rate_limiting_service._get_client_ip(request)
        assert ip == "unknown"
