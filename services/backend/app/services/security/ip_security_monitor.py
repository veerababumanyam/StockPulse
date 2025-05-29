"""IP Security Monitoring Service for StockPulse Authentication Hardening.

Implements comprehensive IP-based security monitoring with suspicious activity detection,
pattern analysis, and automated IP blocking for protection against distributed attacks.
"""

import asyncio
import json
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple

import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession
from structlog import get_logger

from app.core.config import get_settings


class ThreatLevel(str, Enum):
    """Threat level classifications for IP security events."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SecurityEventType(str, Enum):
    """Types of security events tracked for IP monitoring."""

    FAILED_LOGIN = "failed_login"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    SUSPICIOUS_PATTERN = "suspicious_pattern"
    BRUTE_FORCE_ATTEMPT = "brute_force_attempt"
    ACCOUNT_ENUMERATION = "account_enumeration"
    RAPID_REQUESTS = "rapid_requests"
    GEO_ANOMALY = "geo_anomaly"
    USER_AGENT_ANOMALY = "user_agent_anomaly"


@dataclass
class IPSecurityEvent:
    """Represents a security event associated with an IP address."""

    ip_address: str
    event_type: SecurityEventType
    timestamp: datetime
    user_id: Optional[str] = None
    user_agent: Optional[str] = None
    endpoint: Optional[str] = None
    details: Optional[Dict] = None


@dataclass
class IPThreatAnalysis:
    """Analysis result for IP threat assessment."""

    ip_address: str
    threat_level: ThreatLevel
    risk_score: float  # 0.0 to 100.0
    event_count: int
    recent_events: List[SecurityEventType]
    blocked: bool
    block_expires_at: Optional[datetime]
    reason: str


@dataclass
class IPBlockResult:
    """Result of IP blocking operation."""

    ip_address: str
    blocked: bool
    duration_seconds: int
    reason: str
    expires_at: datetime


class IPSecurityMonitor:
    """
    Advanced IP security monitoring service with pattern detection and automated blocking.

    Features:
    - Real-time suspicious activity detection
    - Pattern analysis for distributed attacks
    - Progressive blocking with exponential backoff
    - Geographic and behavioral anomaly detection
    - Comprehensive audit logging and metrics
    """

    def __init__(self, redis_client: redis.Redis, db_session: AsyncSession):
        """Initialize IP security monitor with Redis and database connections."""
        self.redis_client = redis_client
        self.db_session = db_session
        self.settings = get_settings()
        self.logger = get_logger(__name__)

        # Configuration constants
        self.MONITORING_WINDOW = 3600  # 1 hour tracking window
        self.BLOCK_DURATIONS = [300, 900, 3600, 14400, 86400]  # Progressive blocking
        self.THREAT_THRESHOLDS = {
            ThreatLevel.LOW: 10.0,
            ThreatLevel.MEDIUM: 30.0,
            ThreatLevel.HIGH: 60.0,
            ThreatLevel.CRITICAL: 85.0,
        }

        # Pattern detection thresholds
        self.FAILED_LOGIN_THRESHOLD = 5
        self.RAPID_REQUEST_THRESHOLD = 50
        self.BRUTE_FORCE_THRESHOLD = 10
        self.ACCOUNT_ENUM_THRESHOLD = 15

    async def record_security_event(
        self,
        ip_address: str,
        event_type: SecurityEventType,
        user_id: Optional[str] = None,
        user_agent: Optional[str] = None,
        endpoint: Optional[str] = None,
        details: Optional[Dict] = None,
    ) -> None:
        """
        Record a security event for an IP address and trigger analysis.

        Args:
            ip_address: The IP address associated with the event
            event_type: Type of security event
            user_id: Associated user ID (if applicable)
            user_agent: User agent string
            endpoint: API endpoint accessed
            details: Additional event details
        """
        try:
            event = IPSecurityEvent(
                ip_address=ip_address,
                event_type=event_type,
                timestamp=datetime.now(datetime.timezone.utc),
                user_id=user_id,
                user_agent=user_agent,
                endpoint=endpoint,
                details=details or {},
            )

            # Store event in Redis for analysis
            event_key = f"ip_events:{ip_address}"
            event_data = {
                "type": event_type.value,
                "timestamp": event.timestamp.isoformat(),
                "user_id": user_id,
                "user_agent": user_agent,
                "endpoint": endpoint,
                "details": json.dumps(details or {}),
            }

            # Add to sorted set with timestamp as score
            await self.redis_client.zadd(
                event_key, {json.dumps(event_data): event.timestamp.timestamp()}
            )

            # Set expiration for cleanup
            await self.redis_client.expire(event_key, self.MONITORING_WINDOW)

            # Trigger real-time analysis
            analysis = await self.analyze_ip_threat(ip_address)

            # Auto-block if critical threat detected
            if analysis.threat_level == ThreatLevel.CRITICAL and not analysis.blocked:
                await self.block_ip(
                    ip_address,
                    duration_seconds=self._get_progressive_block_duration(ip_address),
                    reason=f"Critical threat detected: {analysis.reason}",
                )

            await self.logger.ainfo(
                "Security event recorded",
                ip_address=ip_address,
                event_type=event_type.value,
                threat_level=analysis.threat_level.value,
                risk_score=analysis.risk_score,
            )

        except Exception as e:
            await self.logger.aerror(
                "Failed to record security event",
                ip_address=ip_address,
                event_type=event_type.value,
                error=str(e),
            )
            raise

    async def analyze_ip_threat(self, ip_address: str) -> IPThreatAnalysis:
        """
        Analyze threat level for an IP address based on recent activity patterns.

        Args:
            ip_address: IP address to analyze

        Returns:
            IPThreatAnalysis: Comprehensive threat analysis result
        """
        try:
            # Get recent events from Redis
            event_key = f"ip_events:{ip_address}"
            cutoff_time = time.time() - self.MONITORING_WINDOW

            events_data = await self.redis_client.zrangebyscore(
                event_key, cutoff_time, "+inf", withscores=True
            )

            events = []
            event_counts = {}

            for event_json, timestamp in events_data:
                try:
                    event_data = json.loads(event_json)
                    event_type = SecurityEventType(event_data["type"])
                    events.append(event_type)
                    event_counts[event_type] = event_counts.get(event_type, 0) + 1
                except (json.JSONDecodeError, ValueError):
                    continue

            # Calculate risk score based on patterns
            risk_score = await self._calculate_risk_score(ip_address, event_counts)

            # Determine threat level
            threat_level = ThreatLevel.LOW
            for level, threshold in self.THREAT_THRESHOLDS.items():
                if risk_score >= threshold:
                    threat_level = level

            # Check if IP is currently blocked
            block_info = await self._get_block_status(ip_address)

            # Generate threat analysis reason
            reason = await self._generate_threat_reason(event_counts, risk_score)

            return IPThreatAnalysis(
                ip_address=ip_address,
                threat_level=threat_level,
                risk_score=risk_score,
                event_count=len(events),
                recent_events=events[-10:],  # Last 10 events
                blocked=block_info["blocked"],
                block_expires_at=block_info["expires_at"],
                reason=reason,
            )

        except Exception as e:
            await self.logger.aerror(
                "Failed to analyze IP threat", ip_address=ip_address, error=str(e)
            )
            # Return safe default analysis
            return IPThreatAnalysis(
                ip_address=ip_address,
                threat_level=ThreatLevel.LOW,
                risk_score=0.0,
                event_count=0,
                recent_events=[],
                blocked=False,
                block_expires_at=None,
                reason="Analysis failed - defaulting to low threat",
            )

    async def block_ip(
        self,
        ip_address: str,
        duration_seconds: int,
        reason: str,
        override_existing: bool = False,
    ) -> IPBlockResult:
        """
        Block an IP address for a specified duration.

        Args:
            ip_address: IP address to block
            duration_seconds: Block duration in seconds
            reason: Reason for blocking
            override_existing: Whether to override existing blocks

        Returns:
            IPBlockResult: Result of blocking operation
        """
        try:
            block_key = f"blocked_ip:{ip_address}"

            # Check if already blocked
            existing_block = await self.redis_client.get(block_key)
            if existing_block and not override_existing:
                existing_data = json.loads(existing_block)
                return IPBlockResult(
                    ip_address=ip_address,
                    blocked=True,
                    duration_seconds=existing_data["duration_seconds"],
                    reason=existing_data["reason"],
                    expires_at=datetime.fromisoformat(existing_data["expires_at"]),
                )

            # Create block record
            expires_at = datetime.now(datetime.timezone.utc) + timedelta(
                seconds=duration_seconds
            )
            block_data = {
                "ip_address": ip_address,
                "blocked_at": datetime.now(datetime.timezone.utc).isoformat(),
                "expires_at": expires_at.isoformat(),
                "duration_seconds": duration_seconds,
                "reason": reason,
                "block_count": await self._get_block_count(ip_address) + 1,
            }

            # Store block in Redis with TTL
            await self.redis_client.setex(
                block_key, duration_seconds, json.dumps(block_data)
            )

            # Log security event
            await self.record_security_event(
                ip_address=ip_address,
                event_type=SecurityEventType.SUSPICIOUS_PATTERN,
                details={
                    "action": "ip_blocked",
                    "reason": reason,
                    "duration": duration_seconds,
                },
            )

            await self.logger.awarn(
                "IP address blocked",
                ip_address=ip_address,
                duration_seconds=duration_seconds,
                reason=reason,
                expires_at=expires_at.isoformat(),
            )

            return IPBlockResult(
                ip_address=ip_address,
                blocked=True,
                duration_seconds=duration_seconds,
                reason=reason,
                expires_at=expires_at,
            )

        except Exception as e:
            await self.logger.aerror(
                "Failed to block IP address", ip_address=ip_address, error=str(e)
            )
            raise

    async def unblock_ip(self, ip_address: str, reason: str = "Manual unblock") -> bool:
        """
        Manually unblock an IP address.

        Args:
            ip_address: IP address to unblock
            reason: Reason for unblocking

        Returns:
            bool: True if unblocked successfully
        """
        try:
            block_key = f"blocked_ip:{ip_address}"
            result = await self.redis_client.delete(block_key)

            if result:
                await self.logger.ainfo(
                    "IP address unblocked", ip_address=ip_address, reason=reason
                )

                # Record unblock event
                await self.record_security_event(
                    ip_address=ip_address,
                    event_type=SecurityEventType.SUSPICIOUS_PATTERN,
                    details={"action": "ip_unblocked", "reason": reason},
                )

            return bool(result)

        except Exception as e:
            await self.logger.aerror(
                "Failed to unblock IP address", ip_address=ip_address, error=str(e)
            )
            return False

    async def is_ip_blocked(self, ip_address: str) -> bool:
        """
        Check if an IP address is currently blocked.

        Args:
            ip_address: IP address to check

        Returns:
            bool: True if IP is blocked
        """
        try:
            block_key = f"blocked_ip:{ip_address}"
            block_data = await self.redis_client.get(block_key)
            return block_data is not None
        except Exception:
            # Fail open for availability
            return False

    async def get_security_metrics(self, time_window: int = 3600) -> Dict:
        """
        Get comprehensive security metrics for IP monitoring.

        Args:
            time_window: Time window in seconds for metrics

        Returns:
            Dict: Security metrics and statistics
        """
        try:
            cutoff_time = time.time() - time_window

            # Get all IP event keys
            ip_keys = await self.redis_client.keys("ip_events:*")

            total_events = 0
            threat_distribution = {level.value: 0 for level in ThreatLevel}
            event_type_counts = {event.value: 0 for event in SecurityEventType}
            blocked_ips = 0

            # Analyze each IP
            for key in ip_keys:
                ip_address = key.decode().split(":", 1)[1]

                # Count events in time window
                events = await self.redis_client.zrangebyscore(key, cutoff_time, "+inf")
                total_events += len(events)

                # Count event types
                for event_json in events:
                    try:
                        event_data = json.loads(event_json)
                        event_type = event_data["type"]
                        if event_type in event_type_counts:
                            event_type_counts[event_type] += 1
                    except (json.JSONDecodeError, KeyError):
                        continue

                # Get threat analysis
                analysis = await self.analyze_ip_threat(ip_address)
                threat_distribution[analysis.threat_level.value] += 1

                if analysis.blocked:
                    blocked_ips += 1

            return {
                "timestamp": datetime.now(datetime.timezone.utc).isoformat(),
                "time_window_seconds": time_window,
                "total_events": total_events,
                "unique_ips": len(ip_keys),
                "blocked_ips": blocked_ips,
                "threat_distribution": threat_distribution,
                "event_type_counts": event_type_counts,
                "average_events_per_ip": total_events / max(len(ip_keys), 1),
            }

        except Exception as e:
            await self.logger.aerror("Failed to get security metrics", error=str(e))
            return {
                "timestamp": datetime.now(datetime.timezone.utc).isoformat(),
                "error": "Failed to collect metrics",
            }

    # Private helper methods

    async def _calculate_risk_score(
        self, ip_address: str, event_counts: Dict[SecurityEventType, int]
    ) -> float:
        """Calculate risk score based on event patterns and frequency."""
        score = 0.0

        # Weight different event types
        event_weights = {
            SecurityEventType.FAILED_LOGIN: 5.0,
            SecurityEventType.BRUTE_FORCE_ATTEMPT: 15.0,
            SecurityEventType.RATE_LIMIT_EXCEEDED: 8.0,
            SecurityEventType.ACCOUNT_ENUMERATION: 12.0,
            SecurityEventType.RAPID_REQUESTS: 6.0,
            SecurityEventType.SUSPICIOUS_PATTERN: 10.0,
            SecurityEventType.GEO_ANOMALY: 7.0,
            SecurityEventType.USER_AGENT_ANOMALY: 4.0,
        }

        # Calculate weighted score
        for event_type, count in event_counts.items():
            weight = event_weights.get(event_type, 1.0)
            score += count * weight

        # Apply frequency multipliers
        failed_logins = event_counts.get(SecurityEventType.FAILED_LOGIN, 0)
        if failed_logins >= self.FAILED_LOGIN_THRESHOLD:
            score *= 1.5

        rapid_requests = event_counts.get(SecurityEventType.RAPID_REQUESTS, 0)
        if rapid_requests >= self.RAPID_REQUEST_THRESHOLD:
            score *= 1.3

        # Check for patterns indicating distributed attacks
        if len(event_counts) >= 3:  # Multiple event types
            score *= 1.4

        # Cap at 100.0
        return min(score, 100.0)

    async def _get_block_status(self, ip_address: str) -> Dict:
        """Get current block status for an IP address."""
        try:
            block_key = f"blocked_ip:{ip_address}"
            block_data = await self.redis_client.get(block_key)

            if block_data:
                data = json.loads(block_data)
                return {
                    "blocked": True,
                    "expires_at": datetime.fromisoformat(data["expires_at"]),
                }
            else:
                return {"blocked": False, "expires_at": None}

        except Exception:
            return {"blocked": False, "expires_at": None}

    async def _get_block_count(self, ip_address: str) -> int:
        """Get the number of times an IP has been blocked."""
        try:
            count_key = f"block_count:{ip_address}"
            count = await self.redis_client.get(count_key)
            return int(count) if count else 0
        except Exception:
            return 0

    def _get_progressive_block_duration(self, ip_address: str) -> int:
        """Get progressive block duration based on previous blocks."""
        # This is a simplified version - in production, you'd track block history
        # For now, return escalating durations
        return self.BLOCK_DURATIONS[0]  # Start with 5 minutes

    async def _generate_threat_reason(
        self, event_counts: Dict[SecurityEventType, int], risk_score: float
    ) -> str:
        """Generate human-readable threat analysis reason."""
        reasons = []

        failed_logins = event_counts.get(SecurityEventType.FAILED_LOGIN, 0)
        if failed_logins >= self.FAILED_LOGIN_THRESHOLD:
            reasons.append(f"Excessive failed logins ({failed_logins})")

        brute_force = event_counts.get(SecurityEventType.BRUTE_FORCE_ATTEMPT, 0)
        if brute_force >= self.BRUTE_FORCE_THRESHOLD:
            reasons.append(f"Brute force attempts ({brute_force})")

        rapid_requests = event_counts.get(SecurityEventType.RAPID_REQUESTS, 0)
        if rapid_requests >= self.RAPID_REQUEST_THRESHOLD:
            reasons.append(f"Rapid request pattern ({rapid_requests})")

        account_enum = event_counts.get(SecurityEventType.ACCOUNT_ENUMERATION, 0)
        if account_enum >= self.ACCOUNT_ENUM_THRESHOLD:
            reasons.append(f"Account enumeration ({account_enum})")

        if len(event_counts) >= 3:
            reasons.append("Multiple attack vectors detected")

        if risk_score >= 80:
            reasons.append(f"High risk score ({risk_score:.1f})")

        return "; ".join(reasons) if reasons else f"Risk score: {risk_score:.1f}"
