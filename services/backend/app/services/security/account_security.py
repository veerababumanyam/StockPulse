"""Account Security Service implementing comprehensive account protection.

This service provides enterprise-grade account security features including:
- Progressive account lockout mechanisms
- Failed login attempt tracking and analysis
- Brute force attack protection
- Administrative unlock capabilities
- Security event correlation and analysis

Designed for high performance with Redis storage and comprehensive audit trails.
"""

import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession
from structlog import get_logger

from app.core.config import get_settings
from app.models.security.rate_limit import RateLimitType

# TODO: Import RateLimitViolation when needed for violation tracking

logger = get_logger(__name__)


class AccountLockoutEvent:
    """Account lockout event data."""

    def __init__(
        self,
        user_id: str,
        email: str,
        reason: str,
        lockout_duration: int,
        attempt_count: int,
        ip_address: Optional[str] = None,
    ):
        self.event_id = secrets.token_urlsafe(16)
        self.user_id = user_id
        self.email = email
        self.reason = reason
        self.lockout_duration = lockout_duration
        self.attempt_count = attempt_count
        self.ip_address = ip_address
        self.timestamp = datetime.utcnow()
        self.expires_at = datetime.utcnow() + timedelta(seconds=lockout_duration)


class AccountSecurityResult:
    """Result of account security check."""

    def __init__(
        self,
        is_allowed: bool,
        reason: str,
        attempt_count: int,
        time_until_unlock: int = 0,
        next_lockout_duration: int = 0,
    ):
        self.is_allowed = is_allowed
        self.reason = reason
        self.attempt_count = attempt_count
        self.time_until_unlock = time_until_unlock
        self.next_lockout_duration = next_lockout_duration
        self.timestamp = datetime.utcnow()


class AccountSecurityService:
    """Enterprise account security service.

    Implements progressive account lockout, failed attempt tracking,
    and comprehensive security monitoring for user accounts.

    Lockout Strategy:
    - Attempts 1-3: No lockout, logged for monitoring
    - Attempts 4-5: Warning to user, increased monitoring
    - Attempt 6+: Account locked with progressive duration

    Progressive Lockout Duration:
    - 1st lockout: 5 minutes (300 seconds)
    - 2nd lockout: 15 minutes (900 seconds)
    - 3rd lockout: 30 minutes (1800 seconds)
    - 4th+ lockout: 60 minutes (3600 seconds)
    """

    def __init__(self, redis_client: redis.Redis, db_session: AsyncSession):
        """Initialize account security service.

        Args:
            redis_client: Redis client for high-performance tracking
            db_session: Database session for audit persistence
        """
        self.redis_client = redis_client
        self.db_session = db_session
        self.settings = get_settings()

        # Security configuration
        self.max_failed_attempts = 5  # Before lockout
        self.warning_threshold = 3  # When to start warnings
        self.base_lockout_duration = 300  # 5 minutes base
        self.max_lockout_duration = 3600  # 1 hour maximum
        self.attempt_window = 1800  # 30 minutes tracking window

        # Performance metrics
        self._security_checks = 0
        self._lockouts_applied = 0
        self._attempts_blocked = 0

    async def record_failed_attempt(
        self,
        user_id: str,
        email: str,
        ip_address: str,
        attempt_type: str = "login",
        additional_context: Optional[Dict] = None,
    ) -> AccountSecurityResult:
        """Record a failed authentication attempt.

        Args:
            user_id: User identifier
            email: User email address
            ip_address: Source IP address
            attempt_type: Type of attempt (login, password_reset, etc.)
            additional_context: Additional security context

        Returns:
            AccountSecurityResult with security decision
        """
        self._security_checks += 1

        try:
            # Get current attempt count
            attempt_key = self._get_attempt_key(user_id, attempt_type)
            current_attempts = await self._get_attempt_count(attempt_key)

            # Increment attempt counter
            new_attempt_count = current_attempts + 1
            await self._record_attempt(attempt_key, new_attempt_count)

            # Log the failed attempt
            await logger.awarn(
                "account_failed_attempt",
                user_id=user_id,
                email=email,
                ip_address=ip_address,
                attempt_type=attempt_type,
                attempt_count=new_attempt_count,
                additional_context=additional_context,
            )

            # Check if lockout should be applied
            if new_attempt_count > self.max_failed_attempts:
                lockout_duration = self._calculate_lockout_duration(new_attempt_count)

                await self._apply_account_lockout(
                    user_id=user_id,
                    email=email,
                    ip_address=ip_address,
                    attempt_count=new_attempt_count,
                    lockout_duration=lockout_duration,
                    reason=f"Exceeded {self.max_failed_attempts} failed {attempt_type} attempts",
                )

                self._lockouts_applied += 1

                return AccountSecurityResult(
                    is_allowed=False,
                    reason="account_locked",
                    attempt_count=new_attempt_count,
                    time_until_unlock=lockout_duration,
                    next_lockout_duration=self._calculate_lockout_duration(
                        new_attempt_count + 1
                    ),
                )

            # Check if warning threshold reached
            elif new_attempt_count >= self.warning_threshold:
                remaining_attempts = self.max_failed_attempts - new_attempt_count
                next_lockout = self._calculate_lockout_duration(new_attempt_count + 1)

                await logger.awarn(
                    "account_security_warning",
                    user_id=user_id,
                    email=email,
                    remaining_attempts=remaining_attempts,
                    next_lockout_duration=next_lockout,
                )

                return AccountSecurityResult(
                    is_allowed=True,
                    reason="warning_threshold",
                    attempt_count=new_attempt_count,
                    next_lockout_duration=next_lockout,
                )

            # Normal failed attempt - allowed to continue
            return AccountSecurityResult(
                is_allowed=True,
                reason="failed_attempt_recorded",
                attempt_count=new_attempt_count,
            )

        except Exception as e:
            await logger.aerror(
                "account_security_check_failed",
                error=str(e),
                user_id=user_id,
                email=email,
            )
            # Fail open for availability
            return AccountSecurityResult(
                is_allowed=True, reason="security_check_failed", attempt_count=0
            )

    async def check_account_status(
        self, user_id: str, attempt_type: str = "login"
    ) -> AccountSecurityResult:
        """Check if account is currently locked or in warning state.

        Args:
            user_id: User identifier
            attempt_type: Type of attempt to check

        Returns:
            AccountSecurityResult with current status
        """
        try:
            # Check for active lockout
            lockout_key = self._get_lockout_key(user_id)
            lockout_ttl = await self.redis_client.ttl(lockout_key)

            if lockout_ttl > 0:
                self._attempts_blocked += 1

                lockout_info = await self.redis_client.get(lockout_key)
                lockout_data = {}
                if lockout_info:
                    import json

                    lockout_data = json.loads(lockout_info)

                await logger.ainfo(
                    "account_access_blocked",
                    user_id=user_id,
                    time_remaining=lockout_ttl,
                    lockout_reason=lockout_data.get("reason", "unknown"),
                )

                return AccountSecurityResult(
                    is_allowed=False,
                    reason="account_locked",
                    attempt_count=lockout_data.get("attempt_count", 0),
                    time_until_unlock=lockout_ttl,
                )

            # Check current attempt count
            attempt_key = self._get_attempt_key(user_id, attempt_type)
            current_attempts = await self._get_attempt_count(attempt_key)

            if current_attempts >= self.warning_threshold:
                remaining_attempts = self.max_failed_attempts - current_attempts

                return AccountSecurityResult(
                    is_allowed=True,
                    reason="warning_state",
                    attempt_count=current_attempts,
                    next_lockout_duration=self._calculate_lockout_duration(
                        current_attempts + 1
                    ),
                )

            return AccountSecurityResult(
                is_allowed=True, reason="account_normal", attempt_count=current_attempts
            )

        except Exception as e:
            await logger.aerror(
                "account_status_check_failed", error=str(e), user_id=user_id
            )
            # Fail open for availability
            return AccountSecurityResult(
                is_allowed=True, reason="status_check_failed", attempt_count=0
            )

    async def record_successful_attempt(
        self, user_id: str, ip_address: str, attempt_type: str = "login"
    ) -> None:
        """Record successful authentication attempt and reset counters.

        Args:
            user_id: User identifier
            ip_address: Source IP address
            attempt_type: Type of successful attempt
        """
        try:
            # Clear failed attempt counter
            attempt_key = self._get_attempt_key(user_id, attempt_type)
            await self.redis_client.delete(attempt_key)

            # Remove any active lockout
            lockout_key = self._get_lockout_key(user_id)
            await self.redis_client.delete(lockout_key)

            await logger.ainfo(
                "account_successful_attempt",
                user_id=user_id,
                ip_address=ip_address,
                attempt_type=attempt_type,
            )

        except Exception as e:
            await logger.aerror(
                "successful_attempt_recording_failed", error=str(e), user_id=user_id
            )

    async def unlock_account_admin(
        self, user_id: str, admin_user_id: str, reason: str = "administrative_unlock"
    ) -> bool:
        """Administrative unlock of user account.

        Args:
            user_id: User identifier to unlock
            admin_user_id: Administrator performing unlock
            reason: Reason for administrative unlock

        Returns:
            True if unlock successful
        """
        try:
            # Remove lockout
            lockout_key = self._get_lockout_key(user_id)
            await self.redis_client.delete(lockout_key)

            # Clear attempt counters
            attempt_patterns = [
                self._get_attempt_key(user_id, "login"),
                self._get_attempt_key(user_id, "password_reset"),
                self._get_attempt_key(user_id, "email_verification"),
            ]

            for pattern in attempt_patterns:
                await self.redis_client.delete(pattern)

            await logger.ainfo(
                "account_admin_unlock",
                user_id=user_id,
                admin_user_id=admin_user_id,
                reason=reason,
            )

            return True

        except Exception as e:
            await logger.aerror(
                "admin_unlock_failed",
                error=str(e),
                user_id=user_id,
                admin_user_id=admin_user_id,
            )
            return False

    async def get_account_security_metrics(self) -> Dict[str, any]:
        """Get account security metrics and statistics.

        Returns:
            Dictionary with security metrics
        """
        try:
            # Get counts of locked accounts
            locked_accounts = await self._count_locked_accounts()

            # Get recent security events
            recent_violations = await self._get_recent_violations()

            return {
                "total_security_checks": self._security_checks,
                "lockouts_applied": self._lockouts_applied,
                "attempts_blocked": self._attempts_blocked,
                "currently_locked_accounts": locked_accounts,
                "recent_violations_24h": recent_violations,
                "lockout_success_rate": self._calculate_success_rate(),
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            await logger.aerror("metrics_collection_failed", error=str(e))
            return {}

    # Private helper methods

    async def _apply_account_lockout(
        self,
        user_id: str,
        email: str,
        ip_address: str,
        attempt_count: int,
        lockout_duration: int,
        reason: str,
    ) -> None:
        """Apply account lockout with specified duration."""
        lockout_key = self._get_lockout_key(user_id)

        lockout_data = {
            "user_id": user_id,
            "email": email,
            "ip_address": ip_address,
            "attempt_count": attempt_count,
            "reason": reason,
            "locked_at": datetime.utcnow().isoformat(),
            "duration": lockout_duration,
        }

        # Store lockout information
        import json

        await self.redis_client.setex(
            lockout_key, lockout_duration, json.dumps(lockout_data)
        )

        # Create lockout event
        lockout_event = AccountLockoutEvent(
            user_id=user_id,
            email=email,
            reason=reason,
            lockout_duration=lockout_duration,
            attempt_count=attempt_count,
            ip_address=ip_address,
        )

        await logger.aerror(
            "account_locked",
            event_id=lockout_event.event_id,
            user_id=user_id,
            email=email,
            ip_address=ip_address,
            reason=reason,
            lockout_duration=lockout_duration,
            attempt_count=attempt_count,
            expires_at=lockout_event.expires_at.isoformat(),
        )

    async def _get_attempt_count(self, attempt_key: str) -> int:
        """Get current failed attempt count."""
        count = await self.redis_client.get(attempt_key)
        return int(count) if count else 0

    async def _record_attempt(self, attempt_key: str, attempt_count: int) -> None:
        """Record failed attempt with TTL."""
        await self.redis_client.setex(attempt_key, self.attempt_window, attempt_count)

    def _calculate_lockout_duration(self, attempt_count: int) -> int:
        """Calculate progressive lockout duration."""
        if attempt_count <= self.max_failed_attempts:
            return 0

        # Progressive duration: 5min, 15min, 30min, 60min (max)
        lockout_number = attempt_count - self.max_failed_attempts

        if lockout_number == 1:
            return 300  # 5 minutes
        elif lockout_number == 2:
            return 900  # 15 minutes
        elif lockout_number == 3:
            return 1800  # 30 minutes
        else:
            return 3600  # 60 minutes (maximum)

    def _get_attempt_key(self, user_id: str, attempt_type: str) -> str:
        """Generate Redis key for attempt tracking."""
        return f"account_attempts:{user_id}:{attempt_type}"

    def _get_lockout_key(self, user_id: str) -> str:
        """Generate Redis key for account lockout."""
        return f"account_locked:{user_id}"

    async def _count_locked_accounts(self) -> int:
        """Count currently locked accounts."""
        try:
            locked_keys = await self.redis_client.keys("account_locked:*")
            return len(locked_keys) if locked_keys else 0
        except Exception:
            return 0

    async def _get_recent_violations(self) -> int:
        """Get count of recent security violations."""
        # This would integrate with the rate limiting service
        # For now, return current metrics
        return self._lockouts_applied

    def _calculate_success_rate(self) -> float:
        """Calculate security check success rate."""
        if self._security_checks == 0:
            return 100.0

        failed_checks = self._lockouts_applied + self._attempts_blocked
        success_rate = (
            (self._security_checks - failed_checks) / self._security_checks
        ) * 100
        return round(success_rate, 2)
