"""
User context models for MCP integration.
Contains user preferences, portfolio settings, and trading configurations
that are propagated to agents with appropriate permission filtering.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, field_validator, ConfigDict
from decimal import Decimal


class AgentPermissionLevel(str, Enum):
    """Permission levels for agent access to user context."""
    READ_ONLY = "read_only"
    READ_WRITE = "read_write" 
    ADMIN = "admin"
    RESTRICTED = "restricted"


class UserPreferences(BaseModel):
    """User trading preferences and settings."""
    trading_style: str = Field(..., description="User's preferred trading style")
    risk_tolerance: str = Field(..., description="User's risk tolerance level")
    notification_settings: Dict[str, bool] = Field(default_factory=dict, description="Notification preferences")
    ui_settings: Dict[str, Any] = Field(default_factory=dict, description="UI configuration")
    timezone: str = Field(default="UTC", description="User's timezone")
    
    @field_validator('trading_style')
    @classmethod
    def validate_trading_style(cls, v):
        allowed_styles = ['conservative', 'moderate', 'aggressive', 'day_trading', 'swing_trading', 'long_term']
        if v not in allowed_styles:
            raise ValueError(f'trading_style must be one of {allowed_styles}')
        return v
    
    model_config = ConfigDict(
        validate_assignment=True,
        use_enum_values=True
    )


class PortfolioSettings(BaseModel):
    """Portfolio management settings."""
    rebalancing_frequency: str = Field(..., description="How often to rebalance portfolio")
    asset_allocation: Dict[str, float] = Field(default_factory=dict, description="Target asset allocation")
    max_position_size: Decimal = Field(default=Decimal('0.1'), description="Maximum position size as percentage")
    min_cash_reserve: Decimal = Field(default=Decimal('0.05'), description="Minimum cash reserve percentage")
    
    @field_validator('rebalancing_frequency')
    @classmethod
    def validate_rebalancing_frequency(cls, v):
        allowed_frequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'never']
        if v not in allowed_frequencies:
            raise ValueError(f'rebalancing_frequency must be one of {allowed_frequencies}')
        return v
    
    model_config = ConfigDict(
        validate_assignment=True,
        use_enum_values=True,
        json_encoders={
            Decimal: lambda v: float(v)
        }
    )


class RiskProfile(BaseModel):
    """User risk profile and limits."""
    risk_tolerance: str = Field(..., description="Overall risk tolerance")
    max_daily_loss: Decimal = Field(default=Decimal('0.02'), description="Maximum daily loss percentage")
    max_portfolio_drawdown: Decimal = Field(default=Decimal('0.15'), description="Maximum portfolio drawdown")
    position_sizing_method: str = Field(default="fixed_percentage", description="Position sizing methodology")
    
    @field_validator('risk_tolerance')
    @classmethod
    def validate_risk_tolerance(cls, v):
        allowed_tolerances = ['very_low', 'low', 'moderate', 'high', 'very_high']
        if v not in allowed_tolerances:
            raise ValueError(f'risk_tolerance must be one of {allowed_tolerances}')
        return v
    
    model_config = ConfigDict(
        validate_assignment=True,
        use_enum_values=True,
        json_encoders={
            Decimal: lambda v: float(v)
        }
    )


class TradingStrategy(BaseModel):
    """Trading strategy configuration."""
    strategy_name: str = Field(..., description="Name of the trading strategy")
    enabled: bool = Field(default=True, description="Whether strategy is active")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Strategy parameters")
    risk_limits: Dict[str, Decimal] = Field(default_factory=dict, description="Risk limits for strategy")
    
    model_config = ConfigDict(
        validate_assignment=True,
        use_enum_values=True,
        json_encoders={
            Decimal: lambda v: float(v)
        }
    )


class UserContext(BaseModel):
    """
    Complete user context that gets propagated to agents.
    Contains preferences, portfolio settings, and trading configurations.
    """
    user_id: str = Field(..., description="User identifier")
    preferences: UserPreferences = Field(..., description="User preferences")
    portfolio_settings: PortfolioSettings = Field(..., description="Portfolio configuration")
    risk_profile: RiskProfile = Field(..., description="Risk profile")
    trading_strategies: List[TradingStrategy] = Field(default_factory=list, description="Active trading strategies")
    last_updated: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    session_info: Dict[str, Any] = Field(default_factory=dict, description="Session metadata")
    
    model_config = ConfigDict(
        validate_assignment=True,
        use_enum_values=True,
        json_encoders={
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: float(v)
        }
    )
    
    def to_agent_context(self, agent_name: str, permission_level: AgentPermissionLevel = AgentPermissionLevel.READ_ONLY) -> Dict[str, Any]:
        """
        Convert user context to agent-specific context based on permissions.
        """
        base_context = {
            "user_id": self.user_id,
            "timestamp": self.last_updated.isoformat()
        }
        
        if permission_level == AgentPermissionLevel.RESTRICTED:
            return base_context
        
        # Add basic preferences for READ_ONLY and above
        if permission_level in [AgentPermissionLevel.READ_ONLY, AgentPermissionLevel.READ_WRITE, AgentPermissionLevel.ADMIN]:
            base_context.update({
                "trading_style": self.preferences.trading_style,
                "risk_tolerance": self.risk_profile.risk_tolerance,
                "timezone": self.preferences.timezone
            })
        
        # Add portfolio info for READ_WRITE and above
        if permission_level in [AgentPermissionLevel.READ_WRITE, AgentPermissionLevel.ADMIN]:
            base_context.update({
                "portfolio_settings": {
                    "rebalancing_frequency": self.portfolio_settings.rebalancing_frequency,
                    "asset_allocation": self.portfolio_settings.asset_allocation,
                    "max_position_size": float(self.portfolio_settings.max_position_size)
                },
                "active_strategies": [
                    {"name": strategy.strategy_name, "enabled": strategy.enabled}
                    for strategy in self.trading_strategies
                ]
            })
        
        # Add full context for ADMIN
        if permission_level == AgentPermissionLevel.ADMIN:
            base_context.update({
                "risk_profile": {
                    "max_daily_loss": float(self.risk_profile.max_daily_loss),
                    "max_portfolio_drawdown": float(self.risk_profile.max_portfolio_drawdown),
                    "position_sizing_method": self.risk_profile.position_sizing_method
                },
                "session_info": self.session_info,
                "notification_settings": self.preferences.notification_settings
            })
        
        return base_context
    
    def has_permission_for_agent(self, agent_name: str, required_permission: str) -> bool:
        """
        Check if user has granted specific permission for an agent.
        In a real implementation, this would check against user's agent permissions.
        """
        # For testing purposes, we'll allow basic permissions for known agents
        known_agents = [
            "technical_analysis", "portfolio_optimization", 
            "risk_management", "news_analysis", "user_preference"
        ]
        
        basic_permissions = ["read_user_context", "receive_notifications"]
        
        return (
            agent_name in known_agents and 
            required_permission in basic_permissions
        )
    
    def get_agent_permission_level(self, agent_name: str) -> AgentPermissionLevel:
        """
        Get permission level for specific agent.
        In production, this would be stored in user preferences or database.
        """
        # Default permission mapping for testing
        permission_mapping = {
            "technical_analysis": AgentPermissionLevel.READ_ONLY,
            "portfolio_optimization": AgentPermissionLevel.READ_WRITE,
            "risk_management": AgentPermissionLevel.READ_WRITE,
            "news_analysis": AgentPermissionLevel.READ_ONLY,
            "user_preference": AgentPermissionLevel.ADMIN
        }
        
        return permission_mapping.get(agent_name, AgentPermissionLevel.RESTRICTED) 