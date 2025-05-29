"""
Agent Registry Service for MCP integration.
Manages registration and discovery of available agents.
"""

from typing import Any, Dict, List, Optional

from app.models.mcp.user_context import AgentPermissionLevel


class AgentRegistry:
    """Manages registration and discovery of available agents."""

    REGISTERED_AGENTS = {
        "technical_analysis": {
            "name": "Technical Analysis Agent",
            "endpoint": "http://localhost:8003",
            "capabilities": [
                "chart_analysis",
                "technical_indicators",
                "pattern_recognition",
            ],
            "required_permissions": ["read_market_data", "access_user_preferences"],
        },
        "portfolio_optimization": {
            "name": "Portfolio Optimization Agent",
            "endpoint": "http://localhost:8004",
            "capabilities": [
                "portfolio_rebalancing",
                "asset_allocation",
                "risk_assessment",
            ],
            "required_permissions": ["read_portfolio", "read_risk_profile"],
        },
        "risk_management": {
            "name": "Risk Management Agent",
            "endpoint": "http://localhost:8005",
            "capabilities": [
                "risk_monitoring",
                "position_sizing",
                "stop_loss_management",
            ],
            "required_permissions": [
                "read_positions",
                "read_risk_profile",
                "send_alerts",
            ],
        },
        "news_analysis": {
            "name": "News Analysis Agent",
            "endpoint": "http://localhost:8006",
            "capabilities": [
                "sentiment_analysis",
                "news_filtering",
                "impact_assessment",
            ],
            "required_permissions": ["read_user_preferences", "access_news_feeds"],
        },
        "user_preference": {
            "name": "User Preference Agent",
            "endpoint": "http://localhost:8007",
            "capabilities": [
                "preference_learning",
                "behavior_analysis",
                "personalization",
            ],
            "required_permissions": ["read_user_data", "update_preferences"],
        },
    }

    def get_registered_agents(self) -> List[str]:
        """Get list of all registered agent names."""
        return list(self.REGISTERED_AGENTS.keys())

    def get_agent_config(self, agent_name: str) -> Optional[Dict[str, Any]]:
        """Get configuration for a specific agent."""
        return self.REGISTERED_AGENTS.get(agent_name)

    def get_required_permission(self, agent_name: str) -> AgentPermissionLevel:
        """Get required permission level for an agent."""
        permission_map = {
            "technical_analysis": AgentPermissionLevel.READ_ONLY,
            "portfolio_optimization": AgentPermissionLevel.READ_WRITE,
            "risk_management": AgentPermissionLevel.READ_ONLY,
            "news_analysis": AgentPermissionLevel.READ_ONLY,
            "user_preference": AgentPermissionLevel.READ_WRITE,
        }
        return permission_map.get(agent_name, AgentPermissionLevel.RESTRICTED)

    def is_agent_registered(self, agent_name: str) -> bool:
        """Check if an agent is registered."""
        return agent_name in self.REGISTERED_AGENTS

    def get_agents_by_capability(self, capability: str) -> List[str]:
        """Get agents that have a specific capability."""
        agents = []
        for agent_name, config in self.REGISTERED_AGENTS.items():
            if capability in config.get("capabilities", []):
                agents.append(agent_name)
        return agents
