"""Rate Limiting Service implementing multi-level protection.

This service provides comprehensive rate limiting with multiple tiers:
- IP-based rate limiting
- Account-based rate limiting
- Global rate limiting
- Endpoint-specific rate limiting

Features progressive blocking, violation tracking, and Redis-based storage
for high-performance distributed rate limiting.
"""

import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import redis.asyncio as redis
from fastapi import Request
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from structlog import get_logger

from app.core.config import get_settings
from app.models.security.rate_limit import (
    RateLimit,
    RateLimitData,
    RateLimitResult,
    RateLimitType,
    RateLimitViolation,
)

logger = get_logger(__name__)


class RateLimitingService:
    """Enterprise-grade rate limiting service.

    Implements multi-level rate limiting with Redis for performance
    and database persistence for audit trails and long-term analysis.

    Rate Limiting Tiers:
    - IP Level: 60 requests/minute per IP address
    - Account Level: 5 failed login attempts per account
    - Global Level: 10000 requests/minute total
    - Endpoint Specific: Custom limits per endpoint type
    """

    def __init__(self, redis_client: redis.Redis, db_session: AsyncSession):
        """Initialize rate limiting service.

        Args:
            redis_client: Redis client for high-performance counting
            db_session: Database session for persistence and audit
        """
        self.redis_client = redis_client
        self.db_session = db_session
        self.settings = get_settings()

        # Rate limiting configuration
        self.ip_limit = 60  # requests per minute
        self.account_limit = 5  # failed attempts
        self.global_limit = 10000  # requests per minute
        self.endpoint_limits = {
            "/auth/login": 10,  # per minute per IP
            "/auth/register": 5,  # per minute per IP
            "/auth/password-reset": 3,  # per minute per IP
        }

        # Performance metrics
        self._check_count = 0
        self._violation_count = 0
        self._block_count = 0

    async def check_ip_rate_limit(
        self, ip_address: str, endpoint: Optional[str] = None
    ) -> RateLimitResult:
        """Check IP-based rate limiting.

        Args:
            ip_address: Client IP address
            endpoint: Optional specific endpoint for custom limits

        Returns:
            RateLimitResult with allow/deny decision and metadata
        """
        self._check_count += 1

        try:
            # Determine rate limit for this IP/endpoint combination
            if endpoint and endpoint in self.endpoint_limits:
                max_requests = self.endpoint_limits[endpoint]
                limit_type = RateLimitType.ENDPOINT_SPECIFIC
                identifier = f"{ip_address}:{endpoint}"
            else:
                max_requests = self.ip_limit
                limit_type = RateLimitType.IP_BASED
                identifier = ip_address

            # Check Redis cache first for performance
            result = await self._check_redis_limit(
                limit_type=limit_type,
                identifier=identifier,
                max_requests=max_requests,
                window_seconds=60,  # 1 minute window
            )

            if not result.is_allowed:
                await self._record_violation(
                    limit_type=limit_type, identifier=identifier, endpoint=endpoint
                )

            return result

        except Exception as e:
            await logger.aerror(
                "ip_rate_limit_check_failed",
                error=str(e),
                ip_address=ip_address,
                endpoint=endpoint,
            )
            # Fail open for availability
            return RateLimitResult(
                is_allowed=True,
                limit_type=RateLimitType.IP_BASED,
                identifier=ip_address,
                current_count=0,
                max_requests=max_requests,
                remaining_requests=max_requests,
                time_until_reset=60,
                error_message="Rate limit check failed, allowing request",
            )

    async def check_account_rate_limit(
        self, user_id: str, action: str = "login_attempt"
    ) -> RateLimitResult:
        """Check account-based rate limiting.

        Args:
            user_id: User ID or email for account identification
            action: Type of action (login_attempt, password_reset, etc.)

        Returns:
            RateLimitResult with allow/deny decision
        """
        try:
            identifier = f"account:{user_id}:{action}"

            # Account limits are typically longer windows
            window_seconds = 300  # 5 minutes for login attempts
            max_requests = self.account_limit

            result = await self._check_redis_limit(
                limit_type=RateLimitType.ACCOUNT_BASED,
                identifier=identifier,
                max_requests=max_requests,
                window_seconds=window_seconds,
            )

            if not result.is_allowed:
                await self._record_violation(
                    limit_type=RateLimitType.ACCOUNT_BASED, identifier=identifier
                )

                # Check if account should be locked
                await self._check_account_lockout(user_id, action)

            return result

        except Exception as e:
            await logger.aerror(
                "account_rate_limit_check_failed",
                error=str(e),
                user_id=user_id,
                action=action,
            )
            # Fail closed for security-critical account checks
            return RateLimitResult(
                is_allowed=False,
                limit_type=RateLimitType.ACCOUNT_BASED,
                identifier=user_id,
                current_count=max_requests,
                max_requests=max_requests,
                remaining_requests=0,
                time_until_reset=window_seconds,
                error_message="Account rate limit check failed, denying request",
            )

    async def check_global_rate_limit(self) -> RateLimitResult:
        """Check global rate limiting across all requests.

        Returns:
            RateLimitResult with global rate limit status
        """
        try:
            identifier = "global:all_requests"

            result = await self._check_redis_limit(
                limit_type=RateLimitType.GLOBAL,
                identifier=identifier,
                max_requests=self.global_limit,
                window_seconds=60,  # 1 minute window
            )

            if not result.is_allowed:
                await self._record_violation(
                    limit_type=RateLimitType.GLOBAL, identifier=identifier
                )
                await logger.awarn(
                    "global_rate_limit_exceeded",
                    current_count=result.current_count,
                    max_requests=result.max_requests,
                )

            return result

        except Exception as e:
            await logger.aerror("global_rate_limit_check_failed", error=str(e))
            # Fail open for global limits to maintain availability
            return RateLimitResult(
                is_allowed=True,
                limit_type=RateLimitType.GLOBAL,
                identifier="global",
                current_count=0,
                max_requests=self.global_limit,
                remaining_requests=self.global_limit,
                time_until_reset=60,
            )

    async def check_all_limits(
        self, request: Request, user_id: Optional[str] = None, action: str = "request"
    ) -> Tuple[bool, List[RateLimitResult]]:
        """Check all applicable rate limits for a request.

        Args:
            request: FastAPI request object
            user_id: Optional user ID for account limits
            action: Action type for account limits

        Returns:
            Tuple of (is_allowed, list_of_results)
        """
        results = []

        # Get IP address from request
        ip_address = self._get_client_ip(request)
        endpoint = request.url.path

        # Check global rate limit first
        global_result = await self.check_global_rate_limit()
        results.append(global_result)

        # Check IP-based rate limit
        ip_result = await self.check_ip_rate_limit(ip_address, endpoint)
        results.append(ip_result)

        # Check account-based rate limit if user is provided
        if user_id:
            account_result = await self.check_account_rate_limit(user_id, action)
            results.append(account_result)

        # Request is allowed only if all limits pass
        is_allowed = all(result.is_allowed for result in results)

        # Log the combined result
        await logger.ainfo(
            "rate_limit_check_completed",
            ip_address=ip_address,
            endpoint=endpoint,
            user_id=user_id,
            is_allowed=is_allowed,
            results_count=len(results),
        )

        return is_allowed, results

    async def record_successful_request(
        self, request: Request, user_id: Optional[str] = None
    ) -> None:
        """Record a successful request for rate limiting.

        Args:
            request: FastAPI request object
            user_id: Optional user ID
        """
        ip_address = self._get_client_ip(request)
        endpoint = request.url.path

        # Increment all applicable counters
        await self._increment_redis_counter("global:all_requests", 60)
        await self._increment_redis_counter(ip_address, 60)

        if endpoint in self.endpoint_limits:
            await self._increment_redis_counter(f"{ip_address}:{endpoint}", 60)

    async def get_rate_limit_status(
        self, identifier: str, limit_type: RateLimitType
    ) -> Optional[RateLimitData]:
        """Get current rate limit status for an identifier.

        Args:
            identifier: IP address, user ID, or other identifier
            limit_type: Type of rate limit to check

        Returns:
            RateLimitData if found, None otherwise
        """
        try:
            # Check Redis for current status
            redis_key = self._get_redis_key(identifier)
            current_count = await self.redis_client.get(redis_key)
            ttl = await self.redis_client.ttl(redis_key)

            if current_count is None:
                return None

            # Get appropriate max_requests for limit type
            max_requests = self._get_max_requests_for_type(limit_type)

            return RateLimitData(
                limit_type=limit_type,
                identifier=identifier,
                endpoint=None,
                current_count=int(current_count),
                max_requests=max_requests,
                window_start=datetime.utcnow() - timedelta(seconds=60 - ttl),
                window_duration=60,
                remaining_requests=max(0, max_requests - int(current_count)),
                time_until_reset=max(0, ttl),
            )

        except Exception as e:
            await logger.aerror(
                "rate_limit_status_check_failed",
                error=str(e),
                identifier=identifier,
                limit_type=limit_type.value,
            )
            return None

    async def reset_rate_limit(
        self, identifier: str, limit_type: RateLimitType
    ) -> bool:
        """Reset rate limit for an identifier (admin function).

        Args:
            identifier: IP address, user ID, or other identifier
            limit_type: Type of rate limit to reset

        Returns:
            True if reset successful
        """
        try:
            redis_key = self._get_redis_key(identifier)
            await self.redis_client.delete(redis_key)

            await logger.ainfo(
                "rate_limit_reset", identifier=identifier, limit_type=limit_type.value
            )

            return True

        except Exception as e:
            await logger.aerror(
                "rate_limit_reset_failed",
                error=str(e),
                identifier=identifier,
                limit_type=limit_type.value,
            )
            return False

    async def get_security_metrics(self) -> Dict[str, int]:
        """Get rate limiting security metrics.

        Returns:
            Dictionary with security metrics and statistics
        """
        return {
            "rate_limit_checks": self._check_count,
            "rate_limit_violations": self._violation_count,
            "accounts_blocked": self._block_count,
            "timestamp": datetime.utcnow().isoformat(),
        }

    # Private helper methods

    async def _check_redis_limit(
        self,
        limit_type: RateLimitType,
        identifier: str,
        max_requests: int,
        window_seconds: int,
    ) -> RateLimitResult:
        """Check rate limit using Redis sliding window."""
        redis_key = self._get_redis_key(identifier)

        # Use Redis pipeline for atomic operations
        async with self.redis_client.pipeline() as pipe:
            # Get current count
            current_count = await self.redis_client.get(redis_key) or 0
            current_count = int(current_count)

            # Check if limit exceeded
            is_allowed = current_count < max_requests

            if is_allowed:
                # Increment counter
                await pipe.incr(redis_key)
                # Set expiration if this is a new key
                if current_count == 0:
                    await pipe.expire(redis_key, window_seconds)
                await pipe.execute()
                current_count += 1

            # Get TTL for time_until_reset
            ttl = await self.redis_client.ttl(redis_key)
            time_until_reset = max(0, ttl) if ttl > 0 else window_seconds

            return RateLimitResult(
                is_allowed=is_allowed,
                limit_type=limit_type,
                identifier=identifier,
                current_count=current_count,
                max_requests=max_requests,
                remaining_requests=max(0, max_requests - current_count),
                time_until_reset=time_until_reset,
                violation_recorded=not is_allowed,
            )

    async def _increment_redis_counter(
        self, identifier: str, window_seconds: int
    ) -> None:
        """Increment Redis counter for successful requests."""
        redis_key = self._get_redis_key(identifier)

        async with self.redis_client.pipeline() as pipe:
            await pipe.incr(redis_key)
            await pipe.expire(redis_key, window_seconds)
            await pipe.execute()

    async def _record_violation(
        self, limit_type: RateLimitType, identifier: str, endpoint: Optional[str] = None
    ) -> None:
        """Record rate limit violation for audit and analysis."""
        self._violation_count += 1

        violation = RateLimitViolation(
            violation_id=secrets.token_urlsafe(16),
            limit_type=limit_type,
            identifier=identifier,
            endpoint=endpoint,
            timestamp=datetime.utcnow(),
        )

        await logger.awarn(
            "rate_limit_violation",
            violation_id=violation.violation_id,
            limit_type=limit_type.value,
            identifier=identifier,
            endpoint=endpoint,
        )

    async def _check_account_lockout(self, user_id: str, action: str) -> None:
        """Check if account should be locked due to violations."""
        # Get violation count from Redis
        violation_key = f"violations:account:{user_id}:{action}"
        violation_count = await self.redis_client.get(violation_key) or 0
        violation_count = int(violation_count)

        if violation_count >= self.account_limit:
            # Progressive lockout duration
            lockout_duration = min(
                300 * (2 ** (violation_count - self.account_limit)), 3600
            )

            # Set account lockout in Redis
            lockout_key = f"locked:account:{user_id}"
            await self.redis_client.setex(lockout_key, lockout_duration, "locked")

            self._block_count += 1

            await logger.aerror(
                "account_locked",
                user_id=user_id,
                action=action,
                violation_count=violation_count,
                lockout_duration=lockout_duration,
            )

    def _get_redis_key(self, identifier: str) -> str:
        """Generate Redis key for rate limiting."""
        return f"rate_limit:{identifier}"

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request."""
        # Check for forwarded headers first
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fallback to direct connection IP
        return request.client.host if request.client else "unknown"

    def _get_max_requests_for_type(self, limit_type: RateLimitType) -> int:
        """Get max requests for a rate limit type."""
        if limit_type == RateLimitType.IP_BASED:
            return self.ip_limit
        elif limit_type == RateLimitType.ACCOUNT_BASED:
            return self.account_limit
        elif limit_type == RateLimitType.GLOBAL:
            return self.global_limit
        else:
            return 60  # Default for endpoint-specific
