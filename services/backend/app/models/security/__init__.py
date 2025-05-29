"""Security models for StockPulse authentication hardening.

This package contains all security-related data models for comprehensive
authentication protection including CSRF tokens, rate limiting, security
events, and IP monitoring.
"""

from .csrf_token import CSRFToken, CSRFTokenData
from .rate_limit import RateLimit, RateLimitType, RateLimitViolation

# TODO: Add these imports when modules are implemented
# from .ip_security import BlockedIP, IPSecurityInfo, SuspiciousActivity
# from .security_event import SecurityEvent, SecurityEventType, SecurityIncident

__all__ = [
    # CSRF Protection
    "CSRFToken",
    "CSRFTokenData",
    # Rate Limiting
    "RateLimit",
    "RateLimitType",
    "RateLimitViolation",
    # TODO: Add these exports when modules are implemented
    # # Security Events
    # "SecurityEvent",
    # "SecurityEventType",
    # "SecurityIncident",
    # # IP Security
    # "IPSecurityInfo",
    # "SuspiciousActivity",
    # "BlockedIP",
]
