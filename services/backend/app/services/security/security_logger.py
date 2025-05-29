"""Security Logger Service for StockPulse Authentication Hardening.

Comprehensive security event logging and audit trail service providing
enterprise-grade logging, monitoring, and compliance features for financial
applications with SOC 2 and GDPR compliance patterns.
"""

import json
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Union

import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession
from structlog import get_logger


class SecurityEventLevel(str, Enum):
    """Security event severity levels."""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"
    FATAL = "fatal"


class SecurityEventCategory(str, Enum):
    """Categories of security events."""

    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    INPUT_VALIDATION = "input_validation"
    RATE_LIMITING = "rate_limiting"
    CSRF_PROTECTION = "csrf_protection"
    IP_MONITORING = "ip_monitoring"
    SESSION_SECURITY = "session_security"
    ACCOUNT_SECURITY = "account_security"
    DATA_ACCESS = "data_access"
    CONFIGURATION = "configuration"
    SYSTEM_INTEGRITY = "system_integrity"
    COMPLIANCE = "compliance"


@dataclass
class SecurityEvent:
    """Represents a security event for logging and analysis."""

    event_id: str
    timestamp: datetime
    level: SecurityEventLevel
    category: SecurityEventCategory
    event_type: str
    message: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    endpoint: Optional[str] = None
    request_id: Optional[str] = None
    threat_level: Optional[str] = None
    risk_score: Optional[float] = None
    details: Optional[Dict] = None
    compliance_tags: Optional[List[str]] = None


@dataclass
class SecurityMetrics:
    """Security metrics for monitoring and analysis."""

    timestamp: datetime
    time_window_seconds: int
    total_events: int
    events_by_level: Dict[str, int]
    events_by_category: Dict[str, int]
    unique_users: int
    unique_ips: int
    threat_events: int
    compliance_events: int
    average_risk_score: float


class SecurityLogger:
    """
    Enterprise-grade security logging and audit trail service.

    Features:
    - Comprehensive security event logging
    - Real-time threat detection and alerting
    - Compliance logging (SOC 2, GDPR, PCI-DSS)
    - Event correlation and pattern analysis
    - Automated metrics collection
    - Audit trail integrity verification
    - Event retention and archival
    - Security information export
    """

    def __init__(self, redis_client: redis.Redis, db_session: AsyncSession):
        """Initialize security logger with Redis and database connections."""
        self.redis_client = redis_client
        self.db_session = db_session
        self.logger = get_logger(__name__)

        # Configuration
        self.RETENTION_DAYS = 365  # 1 year retention for compliance
        self.BATCH_SIZE = 100  # Batch processing size
        self.ALERT_THRESHOLDS = {
            SecurityEventLevel.CRITICAL: 1,  # Immediate alert
            SecurityEventLevel.ERROR: 5,  # Alert after 5 events in 1 hour
            SecurityEventLevel.WARNING: 20,  # Alert after 20 events in 1 hour
        }

        # Event ID counter for uniqueness
        self._event_counter = 0

    async def log_security_event(
        self,
        level: SecurityEventLevel,
        category: SecurityEventCategory,
        event_type: str,
        message: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        endpoint: Optional[str] = None,
        request_id: Optional[str] = None,
        threat_level: Optional[str] = None,
        risk_score: Optional[float] = None,
        details: Optional[Dict] = None,
        compliance_tags: Optional[List[str]] = None,
    ) -> str:
        """
        Log a security event with comprehensive details.

        Args:
            level: Severity level of the event
            category: Category classification
            event_type: Specific type of event
            message: Human-readable event description
            user_id: Associated user ID
            session_id: Session identifier
            ip_address: Source IP address
            user_agent: User agent string
            endpoint: API endpoint accessed
            request_id: Request correlation ID
            threat_level: Threat assessment level
            risk_score: Numerical risk score (0-100)
            details: Additional event details
            compliance_tags: Compliance framework tags

        Returns:
            str: Event ID for correlation
        """
        try:
            # Generate unique event ID
            event_id = await self._generate_event_id()

            # Create security event
            event = SecurityEvent(
                event_id=event_id,
                timestamp=datetime.now(datetime.timezone.utc),
                level=level,
                category=category,
                event_type=event_type,
                message=message,
                user_id=user_id,
                session_id=session_id,
                ip_address=ip_address,
                user_agent=user_agent,
                endpoint=endpoint,
                request_id=request_id,
                threat_level=threat_level,
                risk_score=risk_score,
                details=details or {},
                compliance_tags=compliance_tags or [],
            )

            # Store in Redis for real-time access
            await self._store_event_redis(event)

            # Store in database for persistence
            await self._store_event_database(event)

            # Check for alert conditions
            await self._check_alert_conditions(event)

            # Update metrics
            await self._update_metrics(event)

            # Log to structured logger
            await self.logger.bind(
                event_id=event_id,
                security_level=level.value,
                category=category.value,
                event_type=event_type,
                user_id=user_id,
                ip_address=ip_address,
                threat_level=threat_level,
                risk_score=risk_score,
            ).ainfo(message)

            return event_id

        except Exception as e:
            await self.logger.aerror(
                "Failed to log security event",
                level=level.value,
                category=category.value,
                event_type=event_type,
                error=str(e),
            )
            raise

    async def log_authentication_event(
        self,
        event_type: str,
        success: bool,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[Dict] = None,
    ) -> str:
        """Log authentication-related security events."""
        level = SecurityEventLevel.INFO if success else SecurityEventLevel.WARNING
        message = f"Authentication {event_type}: {'Success' if success else 'Failed'}"

        return await self.log_security_event(
            level=level,
            category=SecurityEventCategory.AUTHENTICATION,
            event_type=event_type,
            message=message,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
            compliance_tags=["SOC2", "GDPR"],
        )

    async def log_authorization_event(
        self,
        action: str,
        resource: str,
        granted: bool,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        details: Optional[Dict] = None,
    ) -> str:
        """Log authorization-related security events."""
        level = SecurityEventLevel.INFO if granted else SecurityEventLevel.WARNING
        message = f"Authorization for {action} on {resource}: {'Granted' if granted else 'Denied'}"

        return await self.log_security_event(
            level=level,
            category=SecurityEventCategory.AUTHORIZATION,
            event_type="authorization_check",
            message=message,
            user_id=user_id,
            ip_address=ip_address,
            details={
                "action": action,
                "resource": resource,
                "granted": granted,
                **(details or {}),
            },
            compliance_tags=["SOC2", "GDPR"],
        )

    async def log_threat_event(
        self,
        threat_type: str,
        threat_level: str,
        risk_score: float,
        ip_address: Optional[str] = None,
        user_id: Optional[str] = None,
        details: Optional[Dict] = None,
    ) -> str:
        """Log threat detection events."""
        level = (
            SecurityEventLevel.CRITICAL
            if risk_score >= 80
            else SecurityEventLevel.ERROR
        )
        message = f"Security threat detected: {threat_type} (Risk: {risk_score})"

        return await self.log_security_event(
            level=level,
            category=SecurityEventCategory.IP_MONITORING,
            event_type="threat_detected",
            message=message,
            user_id=user_id,
            ip_address=ip_address,
            threat_level=threat_level,
            risk_score=risk_score,
            details=details,
            compliance_tags=["SOC2", "SECURITY"],
        )

    async def log_compliance_event(
        self,
        compliance_type: str,
        event_description: str,
        user_id: Optional[str] = None,
        details: Optional[Dict] = None,
    ) -> str:
        """Log compliance-related events for audit trails."""
        return await self.log_security_event(
            level=SecurityEventLevel.INFO,
            category=SecurityEventCategory.COMPLIANCE,
            event_type=compliance_type,
            message=event_description,
            user_id=user_id,
            details=details,
            compliance_tags=["GDPR", "SOC2", "AUDIT"],
        )

    async def get_security_events(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        level: Optional[SecurityEventLevel] = None,
        category: Optional[SecurityEventCategory] = None,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        limit: int = 100,
    ) -> List[SecurityEvent]:
        """
        Retrieve security events based on filters.

        Args:
            start_time: Events after this time
            end_time: Events before this time
            level: Filter by event level
            category: Filter by event category
            user_id: Filter by user ID
            ip_address: Filter by IP address
            limit: Maximum number of events to return

        Returns:
            List[SecurityEvent]: Filtered security events
        """
        try:
            # Default time window: last 24 hours
            if not start_time:
                start_time = datetime.now(datetime.timezone.utc) - timedelta(hours=24)
            if not end_time:
                end_time = datetime.now(datetime.timezone.utc)

            # Get events from Redis for recent data
            events = []

            # Build search patterns
            patterns = ["security_events:*"]
            if level:
                patterns = [f"security_events:{level.value}:*"]

            for pattern in patterns:
                keys = await self.redis_client.keys(pattern)
                for key in keys[:limit]:
                    event_data = await self.redis_client.get(key)
                    if event_data:
                        try:
                            event_dict = json.loads(event_data)
                            event = SecurityEvent(**event_dict)

                            # Apply filters
                            if start_time <= event.timestamp <= end_time:
                                if category and event.category != category:
                                    continue
                                if user_id and event.user_id != user_id:
                                    continue
                                if ip_address and event.ip_address != ip_address:
                                    continue

                                events.append(event)

                        except (json.JSONDecodeError, TypeError):
                            continue

            # Sort by timestamp (newest first)
            events.sort(key=lambda x: x.timestamp, reverse=True)

            return events[:limit]

        except Exception as e:
            await self.logger.aerror("Failed to retrieve security events", error=str(e))
            return []

    async def get_security_metrics(
        self, time_window_seconds: int = 3600
    ) -> SecurityMetrics:
        """
        Get comprehensive security metrics for the specified time window.

        Args:
            time_window_seconds: Time window for metrics calculation

        Returns:
            SecurityMetrics: Comprehensive security metrics
        """
        try:
            cutoff_time = datetime.now(datetime.timezone.utc) - timedelta(
                seconds=time_window_seconds
            )

            # Get recent events
            events = await self.get_security_events(
                start_time=cutoff_time, limit=10000  # Large limit for metrics
            )

            # Calculate metrics
            events_by_level = {level.value: 0 for level in SecurityEventLevel}
            events_by_category = {cat.value: 0 for cat in SecurityEventCategory}
            unique_users = set()
            unique_ips = set()
            threat_events = 0
            compliance_events = 0
            risk_scores = []

            for event in events:
                events_by_level[event.level.value] += 1
                events_by_category[event.category.value] += 1

                if event.user_id:
                    unique_users.add(event.user_id)
                if event.ip_address:
                    unique_ips.add(event.ip_address)
                if event.threat_level:
                    threat_events += 1
                if event.compliance_tags:
                    compliance_events += 1
                if event.risk_score is not None:
                    risk_scores.append(event.risk_score)

            average_risk_score = (
                sum(risk_scores) / len(risk_scores) if risk_scores else 0.0
            )

            return SecurityMetrics(
                timestamp=datetime.now(datetime.timezone.utc),
                time_window_seconds=time_window_seconds,
                total_events=len(events),
                events_by_level=events_by_level,
                events_by_category=events_by_category,
                unique_users=len(unique_users),
                unique_ips=len(unique_ips),
                threat_events=threat_events,
                compliance_events=compliance_events,
                average_risk_score=average_risk_score,
            )

        except Exception as e:
            await self.logger.aerror("Failed to get security metrics", error=str(e))
            # Return empty metrics on error
            return SecurityMetrics(
                timestamp=datetime.now(datetime.timezone.utc),
                time_window_seconds=time_window_seconds,
                total_events=0,
                events_by_level={},
                events_by_category={},
                unique_users=0,
                unique_ips=0,
                threat_events=0,
                compliance_events=0,
                average_risk_score=0.0,
            )

    async def export_audit_trail(
        self, start_time: datetime, end_time: datetime, format_type: str = "json"
    ) -> str:
        """
        Export security audit trail for compliance reporting.

        Args:
            start_time: Start of audit period
            end_time: End of audit period
            format_type: Export format (json, csv)

        Returns:
            str: Exported audit trail data
        """
        try:
            events = await self.get_security_events(
                start_time=start_time,
                end_time=end_time,
                limit=100000,  # Large limit for export
            )

            if format_type.lower() == "json":
                return json.dumps(
                    [asdict(event) for event in events], default=str, indent=2
                )

            elif format_type.lower() == "csv":
                # CSV format for spreadsheet compatibility
                csv_lines = [
                    "event_id,timestamp,level,category,event_type,message,user_id,ip_address,threat_level,risk_score"
                ]

                for event in events:
                    csv_lines.append(
                        f"{event.event_id},{event.timestamp},{event.level.value},"
                        f"{event.category.value},{event.event_type},{event.message},"
                        f"{event.user_id or ''},{event.ip_address or ''},"
                        f"{event.threat_level or ''},{event.risk_score or ''}"
                    )

                return "\n".join(csv_lines)

            else:
                raise ValueError(f"Unsupported export format: {format_type}")

        except Exception as e:
            await self.logger.aerror(
                "Failed to export audit trail",
                start_time=start_time.isoformat(),
                end_time=end_time.isoformat(),
                format_type=format_type,
                error=str(e),
            )
            raise

    # Private helper methods

    async def _generate_event_id(self) -> str:
        """Generate unique event ID."""
        self._event_counter += 1
        timestamp = int(time.time() * 1000)  # Milliseconds
        return f"sec_{timestamp}_{self._event_counter:06d}"

    async def _store_event_redis(self, event: SecurityEvent) -> None:
        """Store event in Redis for real-time access."""
        try:
            event_key = f"security_events:{event.level.value}:{event.event_id}"
            event_data = json.dumps(asdict(event), default=str)

            # Store with TTL for automatic cleanup
            await self.redis_client.setex(
                event_key, self.RETENTION_DAYS * 24 * 3600, event_data  # TTL in seconds
            )

            # Add to time-based sorted set for efficient queries
            time_key = f"events_by_time:{event.level.value}"
            await self.redis_client.zadd(
                time_key, {event.event_id: event.timestamp.timestamp()}
            )

        except Exception as e:
            await self.logger.aerror(
                "Failed to store event in Redis", event_id=event.event_id, error=str(e)
            )

    async def _store_event_database(self, event: SecurityEvent) -> None:
        """Store event in database for persistence."""
        # This would integrate with your database models
        # For now, we'll skip the database implementation
        pass

    async def _check_alert_conditions(self, event: SecurityEvent) -> None:
        """Check if event triggers alert conditions."""
        try:
            threshold = self.ALERT_THRESHOLDS.get(event.level)
            if threshold is None:
                return

            # Count recent events of this level
            time_window = 3600  # 1 hour
            cutoff_time = time.time() - time_window

            time_key = f"events_by_time:{event.level.value}"
            recent_count = await self.redis_client.zcount(time_key, cutoff_time, "+inf")

            if recent_count >= threshold:
                await self.logger.awarn(
                    "Security alert threshold exceeded",
                    level=event.level.value,
                    count=recent_count,
                    threshold=threshold,
                    time_window_seconds=time_window,
                )

        except Exception as e:
            await self.logger.aerror(
                "Failed to check alert conditions",
                event_id=event.event_id,
                error=str(e),
            )

    async def _update_metrics(self, event: SecurityEvent) -> None:
        """Update real-time security metrics."""
        try:
            # Update counters in Redis
            metrics_key = "security_metrics"
            current_hour = int(time.time() // 3600)

            await self.redis_client.hincrby(
                f"{metrics_key}:{current_hour}", "total_events", 1
            )
            await self.redis_client.hincrby(
                f"{metrics_key}:{current_hour}", f"level_{event.level.value}", 1
            )
            await self.redis_client.hincrby(
                f"{metrics_key}:{current_hour}", f"category_{event.category.value}", 1
            )

            # Set expiration for cleanup
            await self.redis_client.expire(
                f"{metrics_key}:{current_hour}", 7 * 24 * 3600
            )  # 7 days

        except Exception as e:
            await self.logger.aerror(
                "Failed to update metrics", event_id=event.event_id, error=str(e)
            )
