"""Unit tests for Account Security Service.

Comprehensive test suite for the AccountSecurityService including
progressive account lockout, failed attempt tracking, brute force
protection, and administrative unlock capabilities.
"""

import json
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.security.account_security import (
    AccountLockoutEvent,
    AccountSecurityResult,
    AccountSecurityService,
)


class TestAccountSecurityService:
    """Test suite for Account Security Service."""

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
    def account_security_service(self, mock_redis, mock_db_session):
        """Create account security service instance."""
        return AccountSecurityService(mock_redis, mock_db_session)

    @pytest.mark.asyncio
    async def test_record_failed_attempt_first_time(
        self, account_security_service, mock_redis
    ):
        """Test recording first failed attempt."""
        # Arrange
        user_id = "user123"
        email = "user@example.com"
        ip_address = "192.168.1.100"
        mock_redis.get.return_value = None  # No previous attempts
        mock_redis.setex.return_value = True

        # Act
        result = await account_security_service.record_failed_attempt(
            user_id, email, ip_address
        )

        # Assert
        assert result.is_allowed
        assert result.reason == "failed_attempt_recorded"
        assert result.attempt_count == 1
        assert result.time_until_unlock == 0

        # Verify Redis call
        mock_redis.setex.assert_called_once()

    @pytest.mark.asyncio
    async def test_record_failed_attempt_warning_threshold(
        self, account_security_service, mock_redis
    ):
        """Test recording failed attempt at warning threshold."""
        # Arrange
        user_id = "user123"
        email = "user@example.com"
        ip_address = "192.168.1.100"
        mock_redis.get.return_value = "2"  # 2 previous attempts
        mock_redis.setex.return_value = True

        # Act
        result = await account_security_service.record_failed_attempt(
            user_id, email, ip_address
        )

        # Assert
        assert result.is_allowed
        assert result.reason == "warning_threshold"
        assert result.attempt_count == 3
        assert result.next_lockout_duration == 300  # 5 minutes for next lockout

    @pytest.mark.asyncio
    async def test_record_failed_attempt_lockout_triggered(
        self, account_security_service, mock_redis
    ):
        """Test failed attempt that triggers account lockout."""
        # Arrange
        user_id = "user123"
        email = "user@example.com"
        ip_address = "192.168.1.100"
        mock_redis.get.return_value = "5"  # At max attempts
        mock_redis.setex.return_value = True

        # Act
        result = await account_security_service.record_failed_attempt(
            user_id, email, ip_address
        )

        # Assert
        assert not result.is_allowed
        assert result.reason == "account_locked"
        assert result.attempt_count == 6
        assert result.time_until_unlock == 300  # 5 minutes first lockout
        assert result.next_lockout_duration == 900  # 15 minutes next time

        # Verify lockout was set in Redis
        assert mock_redis.setex.call_count == 2  # attempt counter + lockout

    @pytest.mark.asyncio
    async def test_progressive_lockout_durations(self, account_security_service):
        """Test progressive lockout duration calculation."""
        # Test different attempt counts
        assert (
            account_security_service._calculate_lockout_duration(5) == 0
        )  # No lockout yet
        assert (
            account_security_service._calculate_lockout_duration(6) == 300
        )  # 5 minutes
        assert (
            account_security_service._calculate_lockout_duration(7) == 900
        )  # 15 minutes
        assert (
            account_security_service._calculate_lockout_duration(8) == 1800
        )  # 30 minutes
        assert (
            account_security_service._calculate_lockout_duration(9) == 3600
        )  # 60 minutes (max)
        assert (
            account_security_service._calculate_lockout_duration(15) == 3600
        )  # Still max

    @pytest.mark.asyncio
    async def test_check_account_status_normal(
        self, account_security_service, mock_redis
    ):
        """Test checking account status when account is normal."""
        # Arrange
        user_id = "user123"
        mock_redis.ttl.return_value = -1  # No lockout
        mock_redis.get.return_value = "1"  # 1 failed attempt

        # Act
        result = await account_security_service.check_account_status(user_id)

        # Assert
        assert result.is_allowed
        assert result.reason == "account_normal"
        assert result.attempt_count == 1
        assert result.time_until_unlock == 0

    @pytest.mark.asyncio
    async def test_check_account_status_warning_state(
        self, account_security_service, mock_redis
    ):
        """Test checking account status in warning state."""
        # Arrange
        user_id = "user123"
        mock_redis.ttl.return_value = -1  # No lockout
        mock_redis.get.return_value = "4"  # 4 failed attempts (warning threshold)

        # Act
        result = await account_security_service.check_account_status(user_id)

        # Assert
        assert result.is_allowed
        assert result.reason == "warning_state"
        assert result.attempt_count == 4
        assert result.next_lockout_duration == 300  # Next lockout would be 5 minutes

    @pytest.mark.asyncio
    async def test_check_account_status_locked(
        self, account_security_service, mock_redis
    ):
        """Test checking account status when account is locked."""
        # Arrange
        user_id = "user123"
        lockout_data = {
            "user_id": user_id,
            "email": "user@example.com",
            "reason": "Too many failed attempts",
            "attempt_count": 6,
            "locked_at": datetime.utcnow().isoformat(),
            "duration": 300,
        }

        mock_redis.ttl.return_value = 240  # 4 minutes remaining
        mock_redis.get.return_value = json.dumps(lockout_data)

        # Act
        result = await account_security_service.check_account_status(user_id)

        # Assert
        assert not result.is_allowed
        assert result.reason == "account_locked"
        assert result.attempt_count == 6
        assert result.time_until_unlock == 240

    @pytest.mark.asyncio
    async def test_record_successful_attempt(
        self, account_security_service, mock_redis
    ):
        """Test recording successful attempt clears counters."""
        # Arrange
        user_id = "user123"
        ip_address = "192.168.1.100"
        mock_redis.delete.return_value = 1

        # Act
        await account_security_service.record_successful_attempt(user_id, ip_address)

        # Assert
        # Should delete both attempt counter and lockout
        assert mock_redis.delete.call_count == 2

    @pytest.mark.asyncio
    async def test_unlock_account_admin_success(
        self, account_security_service, mock_redis
    ):
        """Test administrative account unlock."""
        # Arrange
        user_id = "user123"
        admin_user_id = "admin456"
        reason = "Customer service request"
        mock_redis.delete.return_value = 1

        # Act
        result = await account_security_service.unlock_account_admin(
            user_id, admin_user_id, reason
        )

        # Assert
        assert result is True
        # Should delete lockout and attempt counters
        assert mock_redis.delete.call_count == 4  # lockout + 3 attempt patterns

    @pytest.mark.asyncio
    async def test_unlock_account_admin_failure(
        self, account_security_service, mock_redis
    ):
        """Test administrative unlock with Redis failure."""
        # Arrange
        user_id = "user123"
        admin_user_id = "admin456"
        mock_redis.delete.side_effect = Exception("Redis connection failed")

        # Act
        result = await account_security_service.unlock_account_admin(
            user_id, admin_user_id
        )

        # Assert
        assert result is False

    @pytest.mark.asyncio
    async def test_get_account_security_metrics(
        self, account_security_service, mock_redis
    ):
        """Test security metrics collection."""
        # Arrange
        account_security_service._security_checks = 500
        account_security_service._lockouts_applied = 25
        account_security_service._attempts_blocked = 150

        mock_redis.keys.return_value = ["locked:1", "locked:2"]  # 2 locked accounts

        # Act
        metrics = await account_security_service.get_account_security_metrics()

        # Assert
        assert metrics["total_security_checks"] == 500
        assert metrics["lockouts_applied"] == 25
        assert metrics["attempts_blocked"] == 150
        assert metrics["currently_locked_accounts"] == 2
        assert metrics["lockout_success_rate"] == 65.0  # (500-175)/500 * 100
        assert "timestamp" in metrics

    @pytest.mark.asyncio
    async def test_record_failed_attempt_with_context(
        self, account_security_service, mock_redis
    ):
        """Test recording failed attempt with additional context."""
        # Arrange
        user_id = "user123"
        email = "user@example.com"
        ip_address = "192.168.1.100"
        additional_context = {
            "user_agent": "Mozilla/5.0 Test Browser",
            "attempt_source": "mobile_app",
            "timestamp": datetime.utcnow().isoformat(),
        }
        mock_redis.get.return_value = "1"
        mock_redis.setex.return_value = True

        # Act
        result = await account_security_service.record_failed_attempt(
            user_id, email, ip_address, "login", additional_context
        )

        # Assert
        assert result.is_allowed
        assert result.attempt_count == 2

    @pytest.mark.asyncio
    async def test_redis_failure_handling(self, account_security_service, mock_redis):
        """Test handling of Redis connection failures."""
        # Arrange
        user_id = "user123"
        email = "user@example.com"
        ip_address = "192.168.1.100"
        mock_redis.get.side_effect = Exception("Redis connection failed")

        # Act
        result = await account_security_service.record_failed_attempt(
            user_id, email, ip_address
        )

        # Assert - Should fail open for availability
        assert result.is_allowed
        assert result.reason == "security_check_failed"
        assert result.attempt_count == 0

    def test_account_lockout_event_creation(self):
        """Test AccountLockoutEvent data class."""
        # Arrange & Act
        event = AccountLockoutEvent(
            user_id="user123",
            email="user@example.com",
            reason="Too many failed attempts",
            lockout_duration=300,
            attempt_count=6,
            ip_address="192.168.1.100",
        )

        # Assert
        assert event.user_id == "user123"
        assert event.email == "user@example.com"
        assert event.reason == "Too many failed attempts"
        assert event.lockout_duration == 300
        assert event.attempt_count == 6
        assert event.ip_address == "192.168.1.100"
        assert len(event.event_id) > 10  # Should have secure ID
        assert event.expires_at > event.timestamp

    def test_account_security_result_creation(self):
        """Test AccountSecurityResult data class."""
        # Test successful result
        success_result = AccountSecurityResult(
            is_allowed=True,
            reason="account_normal",
            attempt_count=2,
            time_until_unlock=0,
            next_lockout_duration=300,
        )

        assert success_result.is_allowed
        assert success_result.reason == "account_normal"
        assert success_result.attempt_count == 2
        assert success_result.time_until_unlock == 0
        assert success_result.next_lockout_duration == 300

        # Test locked result
        locked_result = AccountSecurityResult(
            is_allowed=False,
            reason="account_locked",
            attempt_count=6,
            time_until_unlock=240,
        )

        assert not locked_result.is_allowed
        assert locked_result.reason == "account_locked"
        assert locked_result.time_until_unlock == 240


@pytest.mark.integration
class TestAccountSecurityIntegration:
    """Integration tests for account security workflows."""

    @pytest.fixture
    def account_security_service(self):
        """Create account security service with mocks."""
        mock_redis = AsyncMock(spec=redis.Redis)
        mock_session = AsyncMock(spec=AsyncSession)
        return AccountSecurityService(mock_redis, mock_session)

    @pytest.mark.asyncio
    async def test_full_lockout_workflow(self, account_security_service):
        """Test complete lockout workflow from attempts to unlock."""
        mock_redis = account_security_service.redis_client
        user_id = "user123"
        email = "user@example.com"
        ip_address = "192.168.1.100"

        # Simulate progressive failed attempts
        attempt_counts = ["0", "1", "2", "3", "4", "5"]
        mock_redis.get.side_effect = attempt_counts
        mock_redis.setex.return_value = True

        results = []

        # Record 6 failed attempts
        for i in range(6):
            result = await account_security_service.record_failed_attempt(
                user_id, email, ip_address
            )
            results.append(result)

        # First 5 should be allowed
        for i in range(5):
            assert results[i].is_allowed

        # 6th should trigger lockout
        assert not results[5].is_allowed
        assert results[5].reason == "account_locked"

        # Test status check during lockout
        lockout_data = {
            "user_id": user_id,
            "attempt_count": 6,
            "reason": "Too many failed attempts",
        }
        mock_redis.ttl.return_value = 180  # 3 minutes left
        mock_redis.get.return_value = json.dumps(lockout_data)

        status = await account_security_service.check_account_status(user_id)
        assert not status.is_allowed
        assert status.time_until_unlock == 180

        # Test administrative unlock
        mock_redis.delete.return_value = 1
        unlock_result = await account_security_service.unlock_account_admin(
            user_id, "admin123", "Customer service request"
        )
        assert unlock_result is True

    @pytest.mark.asyncio
    async def test_successful_attempt_resets_counters(self, account_security_service):
        """Test that successful attempt resets all security counters."""
        mock_redis = account_security_service.redis_client
        user_id = "user123"
        ip_address = "192.168.1.100"

        # Simulate failed attempts building up
        mock_redis.get.return_value = "3"  # 3 failed attempts
        mock_redis.setex.return_value = True

        # Record one more failed attempt
        result = await account_security_service.record_failed_attempt(
            user_id, "user@example.com", ip_address
        )
        assert result.is_allowed
        assert result.attempt_count == 4

        # Record successful attempt
        mock_redis.delete.return_value = 1
        await account_security_service.record_successful_attempt(user_id, ip_address)

        # Verify counters are reset
        mock_redis.delete.assert_called()  # Should clear counters

    @pytest.mark.asyncio
    async def test_multiple_attempt_types_tracking(self, account_security_service):
        """Test tracking different types of attempts separately."""
        mock_redis = account_security_service.redis_client
        user_id = "user123"
        email = "user@example.com"
        ip_address = "192.168.1.100"

        # Mock different attempt types
        mock_redis.get.return_value = "2"
        mock_redis.setex.return_value = True

        # Test login attempts
        login_result = await account_security_service.record_failed_attempt(
            user_id, email, ip_address, "login"
        )
        assert login_result.is_allowed

        # Test password reset attempts
        reset_result = await account_security_service.record_failed_attempt(
            user_id, email, ip_address, "password_reset"
        )
        assert reset_result.is_allowed

        # Verify different Redis keys are used
        assert mock_redis.setex.call_count == 2


class TestAccountSecurityEdgeCases:
    """Test edge cases and error scenarios."""

    @pytest.fixture
    def account_security_service(self):
        """Create service for edge case testing."""
        mock_redis = AsyncMock(spec=redis.Redis)
        mock_session = AsyncMock(spec=AsyncSession)
        return AccountSecurityService(mock_redis, mock_session)

    @pytest.mark.asyncio
    async def test_corrupted_lockout_data(self, account_security_service, mock_redis):
        """Test handling of corrupted lockout data in Redis."""
        # Arrange
        user_id = "user123"
        mock_redis.ttl.return_value = 180  # Lockout active
        mock_redis.get.return_value = "invalid json data"  # Corrupted data

        # Act
        result = await account_security_service.check_account_status(user_id)

        # Assert - Should handle gracefully
        assert not result.is_allowed
        assert result.reason == "account_locked"
        assert result.attempt_count == 0  # Default when data corrupted

    @pytest.mark.asyncio
    async def test_very_high_attempt_count(self, account_security_service, mock_redis):
        """Test handling of very high attempt counts."""
        # Arrange
        user_id = "user123"
        email = "user@example.com"
        ip_address = "192.168.1.100"
        mock_redis.get.return_value = "999"  # Very high count
        mock_redis.setex.return_value = True

        # Act
        result = await account_security_service.record_failed_attempt(
            user_id, email, ip_address
        )

        # Assert
        assert not result.is_allowed
        assert result.time_until_unlock == 3600  # Should cap at max duration

    @pytest.mark.asyncio
    async def test_metrics_with_redis_failure(
        self, account_security_service, mock_redis
    ):
        """Test metrics collection when Redis operations fail."""
        # Arrange
        mock_redis.keys.side_effect = Exception("Redis connection failed")

        # Act
        metrics = await account_security_service.get_account_security_metrics()

        # Assert - Should return empty metrics gracefully
        assert isinstance(metrics, dict)
        # Basic metrics should still be available from service state

    @pytest.mark.asyncio
    async def test_negative_ttl_handling(self, account_security_service, mock_redis):
        """Test handling of negative TTL values."""
        # Arrange
        user_id = "user123"
        mock_redis.ttl.return_value = -2  # Key doesn't exist
        mock_redis.get.return_value = "2"

        # Act
        result = await account_security_service.check_account_status(user_id)

        # Assert
        assert result.is_allowed  # No lockout when TTL indicates no key
        assert result.reason == "account_normal"
