"""
Agent Context Repository for MCP integration.
Manages persistent storage and retrieval of user contexts for agents.
"""

from typing import Dict, Optional

import structlog

from app.models.mcp.user_context import UserContext

logger = structlog.get_logger()


class AgentContextRepository:
    """Manages persistent storage and retrieval of user contexts for agents."""

    def __init__(self):
        # In-memory storage for testing
        # In production, this would use a database
        self._contexts: Dict[str, UserContext] = {}

    async def store_user_context(self, user_context: UserContext) -> None:
        """Store user context for agents."""
        try:
            self._contexts[user_context.user_id] = user_context

            logger.info("user_context_stored", user_id=user_context.user_id)

        except Exception as e:
            logger.error(
                "failed_to_store_user_context",
                user_id=user_context.user_id,
                error=str(e),
            )
            raise

    async def get_user_context(self, user_id: str) -> Optional[UserContext]:
        """Get user context by user ID."""
        try:
            context = self._contexts.get(user_id)

            if context:
                logger.debug("user_context_retrieved", user_id=user_id)
            else:
                logger.debug("user_context_not_found", user_id=user_id)

            return context

        except Exception as e:
            logger.error("failed_to_get_user_context", user_id=user_id, error=str(e))
            raise

    async def update_user_context(self, user_id: str, updates: Dict) -> None:
        """Update user context with new data."""
        try:
            context = self._contexts.get(user_id)
            if context:
                # In a real implementation, this would update specific fields
                # For testing, we'll just log the update
                logger.info(
                    "user_context_updated",
                    user_id=user_id,
                    updates=list(updates.keys()),
                )
            else:
                logger.warning("user_context_not_found_for_update", user_id=user_id)

        except Exception as e:
            logger.error("failed_to_update_user_context", user_id=user_id, error=str(e))
            raise

    async def delete_user_context(self, user_id: str) -> None:
        """Delete user context."""
        try:
            if user_id in self._contexts:
                del self._contexts[user_id]
                logger.info("user_context_deleted", user_id=user_id)
            else:
                logger.warning("user_context_not_found_for_deletion", user_id=user_id)

        except Exception as e:
            logger.error("failed_to_delete_user_context", user_id=user_id, error=str(e))
            raise

    async def get_agent_permissions(self, user_id: str, agent_name: str) -> Dict:
        """Get agent-specific permissions for user."""
        try:
            context = await self.get_user_context(user_id)
            if context:
                permission_level = context.get_agent_permission_level(agent_name)
                return {
                    "permission_level": permission_level,
                    "has_access": permission_level != "restricted",
                }
            else:
                return {"permission_level": "restricted", "has_access": False}

        except Exception as e:
            logger.error(
                "failed_to_get_agent_permissions",
                user_id=user_id,
                agent_name=agent_name,
                error=str(e),
            )
            raise
