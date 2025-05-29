"""
User service for authentication operations.
"""
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import bcrypt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.models.user import User, UserRole, UserSession, UserStatus

settings = get_settings()


class UserService:
    """User service for authentication operations."""

    def __init__(self):
        self.bcrypt_rounds = settings.BCRYPT_ROUNDS

    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt."""
        salt = bcrypt.gensalt(rounds=self.bcrypt_rounds)
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash."""
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

    async def create_user(
        self,
        email: str,
        password: str,
        db: AsyncSession,
        role: UserRole = UserRole.USER,
    ) -> User:
        """Create a new user."""
        # Check if user already exists
        existing_user = await self.get_user_by_email(email, db)
        if existing_user:
            raise ValueError(f"User with email {email} already exists")

        # Create user
        password_hash = self.hash_password(password)
        user = User(email=email, password_hash=password_hash, role=role, is_active=True)

        db.add(user)
        await db.commit()
        await db.refresh(user)

        return user

    async def get_user_by_email(self, email: str, db: AsyncSession) -> Optional[User]:
        """Get user by email."""
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: str, db: AsyncSession) -> Optional[User]:
        """Get user by ID."""
        result = await db.execute(select(User).filter(User.id == user_id))
        return result.scalar_one_or_none()

    async def authenticate_user(
        self, email: str, password: str, db: AsyncSession
    ) -> Optional[User]:
        """Authenticate user with email and password."""
        user = await self.get_user_by_email(email, db)
        if not user:
            return None

        if not self.verify_password(password, user.password_hash):
            return None

        return user

    async def create_user_session(
        self,
        user_id: str,
        access_token: str,
        refresh_token: str,
        ip_address: str,
        user_agent: str,
        db: AsyncSession,
    ) -> UserSession:
        """Create user session record."""
        session_token = access_token[:50]  # Store first 50 chars for lookup

        # Check if a session with this token already exists
        result = await db.execute(
            select(UserSession).filter(UserSession.session_token == session_token)
        )
        existing_session = result.scalar_one_or_none()

        if existing_session:
            # Update existing session instead of creating a new one
            existing_session.refresh_token_hash = self.hash_password(refresh_token)
            existing_session.expires_at = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
            existing_session.ip_address = ip_address
            existing_session.user_agent = user_agent
            existing_session.created_at = datetime.utcnow()  # Update last activity time
            await db.commit()
            return existing_session

        # Optionally clean up old sessions for this user to prevent accumulation
        # Delete sessions older than 24 hours for this user
        old_sessions_cutoff = datetime.utcnow() - timedelta(hours=24)
        old_sessions_result = await db.execute(
            select(UserSession).filter(
                UserSession.user_id == user_id,
                UserSession.created_at < old_sessions_cutoff,
            )
        )
        for old_session in old_sessions_result.scalars():
            await db.delete(old_session)

        # Create new session
        session = UserSession(
            user_id=user_id,
            session_token=session_token,
            refresh_token_hash=self.hash_password(refresh_token),
            expires_at=datetime.utcnow()
            + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            ip_address=ip_address,
            user_agent=user_agent,
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

    async def get_pending_users(self, db: AsyncSession) -> list[User]:
        """Get all users pending approval."""
        result = await db.execute(
            select(User).filter(User.status == UserStatus.PENDING)
            .order_by(User.created_at.desc())
        )
        return result.scalars().all()

    async def approve_user(self, user_id: str, admin_id: str, db: AsyncSession) -> User:
        """Approve a pending user."""
        user = await self.get_user_by_id(user_id, db)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        if user.status != UserStatus.PENDING:
            raise ValueError(f"User {user.email} is not pending approval")
        
        user.status = UserStatus.APPROVED
        user.approved_at = datetime.utcnow()
        user.approved_by = admin_id
        user.rejection_reason = None  # Clear any previous rejection reason
        
        await db.commit()
        await db.refresh(user)
        return user

    async def reject_user(
        self, 
        user_id: str, 
        admin_id: str, 
        reason: str, 
        db: AsyncSession
    ) -> User:
        """Reject a pending user."""
        user = await self.get_user_by_id(user_id, db)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        if user.status != UserStatus.PENDING:
            raise ValueError(f"User {user.email} is not pending approval")
        
        user.status = UserStatus.REJECTED
        user.approved_by = admin_id
        user.rejection_reason = reason
        
        await db.commit()
        await db.refresh(user)
        return user

    async def suspend_user(
        self, 
        user_id: str, 
        admin_id: str, 
        reason: str, 
        db: AsyncSession
    ) -> User:
        """Suspend an approved user."""
        user = await self.get_user_by_id(user_id, db)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        user.status = UserStatus.SUSPENDED
        user.rejection_reason = reason
        
        await db.commit()
        await db.refresh(user)
        return user

    async def reactivate_user(self, user_id: str, admin_id: str, db: AsyncSession) -> User:
        """Reactivate a suspended user."""
        user = await self.get_user_by_id(user_id, db)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        user.status = UserStatus.APPROVED
        user.rejection_reason = None
        user.approved_by = admin_id
        
        await db.commit()
        await db.refresh(user)
        return user


# Service instance
user_service = UserService()
