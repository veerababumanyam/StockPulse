"""
User service for authentication operations.
"""
import bcrypt
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserSession
from app.core.database import get_db
from app.core.config import get_settings

settings = get_settings()

class UserService:
    """User service for authentication operations."""
    
    def __init__(self):
        self.bcrypt_rounds = settings.BCRYPT_ROUNDS
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt."""
        salt = bcrypt.gensalt(rounds=self.bcrypt_rounds)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash."""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    async def get_user_by_email(self, email: str, db: AsyncSession) -> Optional[User]:
        """Get user by email."""
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, user_id: str, db: AsyncSession) -> Optional[User]:
        """Get user by ID."""
        result = await db.execute(select(User).filter(User.id == user_id))
        return result.scalar_one_or_none()
    
    async def authenticate_user(self, email: str, password: str, db: AsyncSession) -> Optional[User]:
        """Authenticate user with email and password."""
        user = await self.get_user_by_email(email, db)
        if not user:
            return None
        
        if not self.verify_password(password, user.password_hash):
            return None
            
        return user
    
    async def create_user_session(self, user_id: str, access_token: str, refresh_token: str, 
                                 ip_address: str, user_agent: str, db: AsyncSession) -> UserSession:
        """Create user session record."""
        session = UserSession(
            user_id=user_id,
            session_token=access_token[:50],  # Store first 50 chars for lookup
            refresh_token_hash=self.hash_password(refresh_token),
            expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(session)
        await db.commit()
        return session
    
    async def invalidate_user_session(self, access_token: str, db: AsyncSession):
        """Invalidate user session."""
        session_token = access_token[:50]
        result = await db.execute(
            select(UserSession).filter(UserSession.session_token == session_token)
        )
        session = result.scalar_one_or_none()
        if session:
            await db.delete(session)
            await db.commit()
    
    async def create_user_context(self, user: User) -> Dict[str, Any]:
        """Create user context for MCP agents."""
        return {
            "user_id": str(user.id),
            "email": user.email,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat(),
        }

# Service instance
user_service = UserService() 