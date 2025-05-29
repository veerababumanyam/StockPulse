"""
Security service for authentication security features.
"""
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.user import User, AuthAuditLog
from app.core.config import get_settings
from app.core.redis import get_redis

settings = get_settings()

class SecurityService:
    """Security service for authentication features."""
    
    async def log_security_event(
        self, 
        event_type: str, 
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        details: Optional[Dict[str, Any]] = None,
        db: Optional[AsyncSession] = None
    ):
        """Log security event to audit log."""
        if not db:
            # For now, just print to console
            print(f"SECURITY EVENT: {event_type} - Success: {success} - User: {user_id} - IP: {ip_address}")
            return
        
        log_entry = AuthAuditLog(
            user_id=user_id,
            event_type=event_type,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            details=json.dumps(details) if details else None
        )
        db.add(log_entry)
        await db.commit()
    
    async def is_ip_blocked(self, ip_address: str) -> bool:
        """Check if IP address is blocked."""
        # Simplified implementation - always return False for now
        return False
    
    async def is_account_locked(self, email: str) -> bool:
        """Check if account is locked."""
        # Simplified implementation - always return False for now
        return False
    
    async def record_failed_login_attempt(self, email: str, ip_address: str):
        """Record failed login attempt."""
        # For now, just log it
        await self.log_security_event(
            "failed_login_attempt",
            ip_address=ip_address,
            success=False,
            details={"email": email}
        )
    
    async def clear_failed_login_attempts(self, email: str):
        """Clear failed login attempts for email."""
        # For now, just log it
        await self.log_security_event(
            "failed_attempts_cleared",
            success=True,
            details={"email": email}
        )

# Service instance
security_service = SecurityService() 