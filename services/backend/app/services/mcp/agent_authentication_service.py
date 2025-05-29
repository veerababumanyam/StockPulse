"""
Agent Authentication Service for MCP integration.
Handles secure agent authentication and permission validation.
"""

from typing import Optional
from datetime import datetime, timedelta
import structlog

from app.models.mcp.agent_session import AgentSession, AgentCredentials

logger = structlog.get_logger()


class AgentAuthenticationService:
    """Handles secure agent authentication and permission validation."""
    
    def __init__(self):
        # In-memory storage for testing
        # In production, this would use a database
        self._sessions: dict[str, AgentSession] = {}
        self._valid_agents = {
            "technical_analysis": "agent_api_key_tech",
            "portfolio_optimization": "agent_api_key_portfolio",
            "risk_management": "agent_api_key_risk",
            "news_analysis": "agent_api_key_news",
            "user_preference": "agent_api_key_preference"
        }
    
    async def authenticate_agent(self, agent_credentials: AgentCredentials) -> AgentSession:
        """Authenticate agent and create session."""
        try:
            # Validate agent credentials
            expected_key = self._valid_agents.get(agent_credentials.agent_name)
            if not expected_key or expected_key != agent_credentials.api_key:
                raise ValueError("Invalid agent credentials")
            
            # Create agent session
            session = AgentSession(
                user_id=agent_credentials.user_id or "system",
                agent_name=agent_credentials.agent_name,
                session_token=f"token_{agent_credentials.agent_name}_{datetime.utcnow().timestamp()}",
                permissions=agent_credentials.requested_permissions,
                expires_at=datetime.utcnow() + timedelta(minutes=60)
            )
            
            self._sessions[session.session_token] = session
            
            logger.info(
                "agent_authenticated",
                agent_name=agent_credentials.agent_name,
                session_id=session.id,
                user_id=session.user_id
            )
            
            return session
            
        except Exception as e:
            logger.error(
                "agent_authentication_failed",
                agent_name=agent_credentials.agent_name,
                error=str(e)
            )
            raise
    
    async def validate_agent_session(self, session_token: str) -> Optional[AgentSession]:
        """Validate agent session token."""
        try:
            session = self._sessions.get(session_token)
            
            if not session:
                logger.warning(
                    "agent_session_not_found",
                    session_token=session_token[:10] + "..."
                )
                return None
            
            if session.is_expired:
                logger.warning(
                    "agent_session_expired",
                    agent_name=session.agent_name,
                    session_id=session.id
                )
                # Clean up expired session
                del self._sessions[session_token]
                return None
            
            # Update last accessed time
            session.last_accessed = datetime.utcnow()
            
            logger.debug(
                "agent_session_validated",
                agent_name=session.agent_name,
                session_id=session.id
            )
            
            return session
            
        except Exception as e:
            logger.error(
                "agent_session_validation_failed",
                session_token=session_token[:10] + "...",
                error=str(e)
            )
            raise
    
    async def create_agent_session(self, user_id: str, agent_name: str) -> AgentSession:
        """Create agent session for user context access."""
        try:
            # Validate agent exists
            if agent_name not in self._valid_agents:
                raise ValueError(f"Unknown agent: {agent_name}")
            
            session = AgentSession(
                user_id=user_id,
                agent_name=agent_name,
                session_token=f"user_token_{agent_name}_{user_id}_{datetime.utcnow().timestamp()}",
                permissions=["read_user_context"],
                expires_at=datetime.utcnow() + timedelta(minutes=60)
            )
            
            self._sessions[session.session_token] = session
            
            logger.info(
                "agent_session_created",
                agent_name=agent_name,
                user_id=user_id,
                session_id=session.id
            )
            
            return session
            
        except Exception as e:
            logger.error(
                "agent_session_creation_failed",
                agent_name=agent_name,
                user_id=user_id,
                error=str(e)
            )
            raise
    
    async def invalidate_agent_session(self, session_token: str) -> None:
        """Invalidate agent session."""
        try:
            if session_token in self._sessions:
                session = self._sessions[session_token]
                del self._sessions[session_token]
                
                logger.info(
                    "agent_session_invalidated",
                    agent_name=session.agent_name,
                    session_id=session.id
                )
            else:
                logger.warning(
                    "agent_session_not_found_for_invalidation",
                    session_token=session_token[:10] + "..."
                )
                
        except Exception as e:
            logger.error(
                "agent_session_invalidation_failed",
                session_token=session_token[:10] + "...",
                error=str(e)
            )
            raise
    
    async def verify_agent_permissions(self, user_id: str, agent_name: str, action: str) -> bool:
        """Verify agent has permission to perform action for user."""
        try:
            # In a real implementation, this would check user permissions
            # For testing, we'll allow basic read operations
            allowed_actions = ["read_user_context", "receive_notifications"]
            
            has_permission = action in allowed_actions
            
            logger.debug(
                "agent_permission_verified",
                user_id=user_id,
                agent_name=agent_name,
                action=action,
                has_permission=has_permission
            )
            
            return has_permission
            
        except Exception as e:
            logger.error(
                "agent_permission_verification_failed",
                user_id=user_id,
                agent_name=agent_name,
                action=action,
                error=str(e)
            )
            raise 