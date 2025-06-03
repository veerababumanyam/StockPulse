"""
Permission Service for StockPulse Backend
Handles user permission verification and role-based access control
"""

from typing import Dict, List, Optional, Set
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.database import AsyncSessionLocal
from ...models.user import User

logger = structlog.get_logger(__name__)

class PermissionService:
    """Service for handling user permissions and role-based access control."""
    
    # Define permission mappings for different user roles
    ROLE_PERMISSIONS: Dict[str, Set[str]] = {
        "admin": {
            "market_insights:read",
            "market_insights:write", 
            "market_insights:query",
            "market_insights:analyze",
            "portfolio:read",
            "portfolio:write",
            "trading:execute",
            "trading:view",
            "users:manage",
            "system:admin"
        },
        "premium_user": {
            "market_insights:read",
            "market_insights:query", 
            "market_insights:analyze",
            "portfolio:read",
            "portfolio:write",
            "trading:execute",
            "trading:view"
        },
        "standard_user": {
            "market_insights:read",
            "market_insights:query",
            "portfolio:read",
            "portfolio:write",
            "trading:view"
        },
        "basic_user": {
            "portfolio:read",
            "trading:view"
        }
    }
    
    @classmethod
    async def verify_user_permission(
        cls, 
        user_id: str, 
        permission: str
    ) -> bool:
        """
        Verify if a user has a specific permission.
        
        Args:
            user_id: The user's ID
            permission: The permission to check (e.g., "market_insights:read")
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        try:
            async with AsyncSessionLocal() as session:
                # Get user with role information
                result = await session.execute(
                    select(User).where(User.id == user_id)
                )
                user = result.scalar_one_or_none()
                
                if not user:
                    logger.warning(f"User not found: {user_id}")
                    return False
                
                # Check if user is active
                if user.status != "active":
                    logger.warning(f"User not active: {user_id}, status: {user.status}")
                    return False
                
                # Get permissions for user's role
                user_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
                role_permissions = cls.ROLE_PERMISSIONS.get(user_role, set())
                
                # Check if permission exists in role permissions
                has_permission = permission in role_permissions
                
                logger.debug(
                    "Permission check",
                    user_id=user_id,
                    permission=permission,
                    user_role=user_role,
                    has_permission=has_permission
                )
                
                return has_permission
                
        except Exception as e:
            logger.error(f"Error checking permission: {e}", user_id=user_id, permission=permission)
            return False
    
    @classmethod
    async def get_user_permissions(cls, user_id: str) -> Set[str]:
        """
        Get all permissions for a user based on their role.
        
        Args:
            user_id: The user's ID
            
        Returns:
            Set[str]: Set of permissions the user has
        """
        try:
            async with AsyncSessionLocal() as session:
                result = await session.execute(
                    select(User).where(User.id == user_id)
                )
                user = result.scalar_one_or_none()
                
                if not user or user.status != "active":
                    return set()
                
                user_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
                return cls.ROLE_PERMISSIONS.get(user_role, set())
                
        except Exception as e:
            logger.error(f"Error getting user permissions: {e}", user_id=user_id)
            return set()
    
    @classmethod
    async def verify_multiple_permissions(
        cls, 
        user_id: str, 
        permissions: List[str],
        require_all: bool = True
    ) -> bool:
        """
        Verify if a user has multiple permissions.
        
        Args:
            user_id: The user's ID
            permissions: List of permissions to check
            require_all: If True, user must have ALL permissions. If False, user needs ANY permission.
            
        Returns:
            bool: True if user meets permission requirements
        """
        try:
            user_permissions = await cls.get_user_permissions(user_id)
            
            if require_all:
                return all(perm in user_permissions for perm in permissions)
            else:
                return any(perm in user_permissions for perm in permissions)
                
        except Exception as e:
            logger.error(f"Error checking multiple permissions: {e}", user_id=user_id)
            return False
    
    @classmethod
    async def is_admin(cls, user_id: str) -> bool:
        """Check if user has admin role."""
        return await cls.verify_user_permission(user_id, "system:admin")
    
    @classmethod
    async def can_access_market_insights(cls, user_id: str) -> bool:
        """Check if user can access market insights."""
        return await cls.verify_user_permission(user_id, "market_insights:read")
    
    @classmethod
    async def can_execute_trades(cls, user_id: str) -> bool:
        """Check if user can execute trades."""
        return await cls.verify_user_permission(user_id, "trading:execute")
    
    @classmethod
    def get_available_roles(cls) -> List[str]:
        """Get list of available user roles."""
        return list(cls.ROLE_PERMISSIONS.keys())
    
    @classmethod
    def get_role_permissions(cls, role: str) -> Set[str]:
        """Get permissions for a specific role."""
        return cls.ROLE_PERMISSIONS.get(role, set()) 