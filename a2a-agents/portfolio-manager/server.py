"""
StockPulse Portfolio Management Agent

Specialized A2A agent for portfolio analysis, performance tracking, 
and investment optimization following Google A2A protocol specification.
"""

import asyncio
import json
import os
from typing import Dict, List, Optional
from datetime import datetime, timedelta

import uvicorn
from dotenv import load_dotenv

# Import the A2A framework
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'shared'))

from a2a_framework import (
    A2AAgent, A2ASkill, A2AProvider, A2ATask, A2ATaskInput, A2ATaskOutput,
    InputMode, OutputMode, MCPIntegration
)

load_dotenv()


class PortfolioManagerAgent(A2AAgent):
    """
    Portfolio Management Agent - Specialized for portfolio operations.
    
    Responsibilities:
    - Comprehensive portfolio performance analysis
    - Real-time portfolio monitoring and tracking
    - Portfolio rebalancing recommendations
    - Position management and allocation optimization
    - Performance attribution and risk metrics
    """
    
    def __init__(self):
        super().__init__(
            name="Portfolio Manager",
            description="AI agent for portfolio management, analysis, and optimization",
            version="1.0.0",
            port=9002
        )
        
        # Initialize MCP integration for database access
        self.mcp = MCPIntegration()
        
        # Portfolio analysis cache
        self.analysis_cache: Dict[str, Dict] = {}
        
        # Performance thresholds and alerts
        self.performance_thresholds = {
            "min_diversification_score": 7.0,
            "max_concentration_percentage": 30.0,
            "volatility_warning_threshold": 0.25,
            "drawdown_warning_threshold": -0.15
        }
    
    def get_provider(self) -> A2AProvider:
        """Get provider information."""
        return A2AProvider(
            organization="StockPulse",
            website="https://stockpulse.ai",
            contact="portfolio@stockpulse.ai"
        )
    
    def register_skills(self) -> List[A2ASkill]:
        """Register Portfolio Management agent skills."""
        return [
            A2ASkill(
                id="portfolio_analysis",
                name="Portfolio Analysis",
                description="Comprehensive portfolio performance analysis with risk metrics",
                tags=["portfolio", "analysis", "performance", "risk"],
                input_modes=[InputMode.TEXT, InputMode.DATA],
                output_modes=[OutputMode.TEXT, OutputMode.DATA],
                examples=[
                    "Analyze my portfolio performance over the last quarter",
                    "What are my best and worst performing holdings?",
                    "Show me my asset allocation breakdown",
                    "Calculate my portfolio's risk metrics"
                ],
                parameters={
                    "user_id": {"type": "string", "required": True},
                    "timeframe": {"type": "string", "enum": ["1D", "1W", "1M", "3M", "1Y", "ALL"], "default": "1M"},
                    "include_benchmarks": {"type": "boolean", "default": True}
                }
            ),
            A2ASkill(
                id="performance_tracking",
                name="Performance Tracking",
                description="Real-time portfolio monitoring and performance tracking",
                tags=["performance", "tracking", "monitoring", "real-time"],
                input_modes=[InputMode.DATA],
                output_modes=[OutputMode.DATA],
                examples=[
                    "Track daily portfolio performance",
                    "Monitor position changes and updates",
                    "Generate performance alerts and notifications"
                ],
                parameters={
                    "user_id": {"type": "string", "required": True},
                    "alert_types": {"type": "array", "items": {"type": "string"}}
                }
            ),
            A2ASkill(
                id="rebalancing_recommendations",
                name="Rebalancing Recommendations", 
                description="Portfolio optimization and rebalancing suggestions",
                tags=["rebalancing", "optimization", "allocation", "strategy"],
                input_modes=[InputMode.DATA],
                output_modes=[OutputMode.TEXT, OutputMode.DATA],
                examples=[
                    "Suggest portfolio rebalancing to target allocation",
                    "Optimize my portfolio for better diversification",
                    "Recommend tax-efficient portfolio adjustments"
                ],
                parameters={
                    "user_id": {"type": "string", "required": True},
                    "target_allocation": {"type": "object"},
                    "rebalancing_strategy": {"type": "string", "enum": ["conservative", "moderate", "aggressive"], "default": "moderate"}
                }
            ),
            A2ASkill(
                id="position_management",
                name="Position Management",
                description="Track and manage individual holdings and positions",
                tags=["positions", "holdings", "management", "tracking"],
                input_modes=[InputMode.TEXT, InputMode.DATA],
                output_modes=[OutputMode.TEXT, OutputMode.DATA],
                examples=[
                    "Show my largest positions by weight",
                    "Track position performance since purchase",
                    "Identify positions for profit-taking or loss-cutting"
                ]
            ),
            A2ASkill(
                id="allocation_optimization",
                name="Allocation Optimization",
                description="Asset allocation strategy optimization and analysis",
                tags=["allocation", "optimization", "strategy", "diversification"],
                input_modes=[InputMode.DATA],
                output_modes=[OutputMode.TEXT, OutputMode.DATA],
                examples=[
                    "Optimize asset allocation for risk-adjusted returns",
                    "Analyze sector and geographic diversification",
                    "Suggest alternative investments for better diversification"
                ]
            )
        ]
    
    async def execute_skill(self, skill_id: str, task: A2ATask) -> A2ATaskOutput:
        """Execute a specific skill."""
        if skill_id == "portfolio_analysis":
            return await self._analyze_portfolio(task)
        elif skill_id == "performance_tracking":
            return await self._track_performance(task)
        elif skill_id == "rebalancing_recommendations":
            return await self._generate_rebalancing_recommendations(task)
        elif skill_id == "position_management":
            return await self._manage_positions(task)
        elif skill_id == "allocation_optimization":
            return await self._optimize_allocation(task)
        else:
            raise ValueError(f"Unknown skill: {skill_id}")
    
    async def _analyze_portfolio(self, task: A2ATask) -> A2ATaskOutput:
        """Comprehensive portfolio analysis."""
        # Extract parameters
        user_id = task.input.data.get("user_id") if task.input.data else None
        timeframe = task.input.data.get("timeframe", "1M") if task.input.data else "1M"
        include_benchmarks = task.input.data.get("include_benchmarks", True) if task.input.data else True
        
        if not user_id:
            return A2ATaskOutput(
                text="Error: User ID is required for portfolio analysis",
                mode=OutputMode.TEXT
            )
        
        # Update progress
        self.task_manager.update_task_status(task.id, task.status, progress=0.2)
        
        # Get portfolio data via MCP
        portfolio_data = await self._get_portfolio_data(user_id)
        
        self.task_manager.update_task_status(task.id, task.status, progress=0.4)
        
        # Get performance data
        performance_data = await self._get_performance_data(user_id, timeframe)
        
        self.task_manager.update_task_status(task.id, task.status, progress=0.6)
        
        # Calculate risk metrics
        risk_metrics = await self._calculate_risk_metrics(portfolio_data, performance_data)
        
        self.task_manager.update_task_status(task.id, task.status, progress=0.8)
        
        # Generate analysis summary
        analysis = await self._generate_portfolio_analysis(
            portfolio_data, performance_data, risk_metrics, timeframe, include_benchmarks
        )
        
        return A2ATaskOutput(
            text=analysis["summary"],
            data=analysis["detailed_data"],
            mode=OutputMode.TEXT
        )
    
    async def _track_performance(self, task: A2ATask) -> A2ATaskOutput:
        """Real-time performance tracking."""
        user_id = task.input.data.get("user_id")
        alert_types = task.input.data.get("alert_types", ["performance", "volatility", "concentration"])
        
        # Get current portfolio snapshot
        current_snapshot = await self._get_current_portfolio_snapshot(user_id)
        
        # Calculate daily performance metrics
        daily_metrics = await self._calculate_daily_metrics(current_snapshot)
        
        # Check for alerts
        alerts = await self._check_performance_alerts(daily_metrics, alert_types)
        
        return A2ATaskOutput(
            data={
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "performance_metrics": daily_metrics,
                "alerts": alerts,
                "tracking_status": "active"
            },
            mode=OutputMode.DATA
        )
    
    async def _generate_rebalancing_recommendations(self, task: A2ATask) -> A2ATaskOutput:
        """Generate portfolio rebalancing recommendations."""
        user_id = task.input.data.get("user_id")
        target_allocation = task.input.data.get("target_allocation", {})
        strategy = task.input.data.get("rebalancing_strategy", "moderate")
        
        # Get current portfolio
        current_portfolio = await self._get_portfolio_data(user_id)
        
        # Calculate current allocation
        current_allocation = await self._calculate_current_allocation(current_portfolio)
        
        # Generate rebalancing plan
        rebalancing_plan = await self._create_rebalancing_plan(
            current_allocation, target_allocation, strategy
        )
        
        # Calculate tax implications
        tax_implications = await self._calculate_tax_implications(rebalancing_plan, user_id)
        
        summary = self._format_rebalancing_summary(rebalancing_plan, tax_implications)
        
        return A2ATaskOutput(
            text=summary,
            data={
                "rebalancing_plan": rebalancing_plan,
                "tax_implications": tax_implications,
                "current_allocation": current_allocation,
                "target_allocation": target_allocation,
                "strategy": strategy
            },
            mode=OutputMode.TEXT
        )
    
    async def _manage_positions(self, task: A2ATask) -> A2ATaskOutput:
        """Manage individual positions."""
        user_query = task.input.text or ""
        user_id = task.input.data.get("user_id") if task.input.data else None
        
        # Get all positions
        positions = await self._get_user_positions(user_id)
        
        # Analyze positions
        position_analysis = await self._analyze_positions(positions, user_query)
        
        return A2ATaskOutput(
            text=position_analysis["summary"],
            data=position_analysis["detailed_data"],
            mode=OutputMode.TEXT
        )
    
    async def _optimize_allocation(self, task: A2ATask) -> A2ATaskOutput:
        """Optimize asset allocation."""
        user_id = task.input.data.get("user_id")
        optimization_objective = task.input.data.get("objective", "risk_adjusted_return")
        constraints = task.input.data.get("constraints", {})
        
        # Get portfolio and market data
        portfolio_data = await self._get_portfolio_data(user_id)
        market_data = await self._get_market_data_for_optimization()
        
        # Run optimization
        optimized_allocation = await self._run_allocation_optimization(
            portfolio_data, market_data, optimization_objective, constraints
        )
        
        # Generate recommendations
        optimization_summary = await self._generate_optimization_summary(optimized_allocation)
        
        return A2ATaskOutput(
            text=optimization_summary["text"],
            data=optimization_summary["data"],
            mode=OutputMode.TEXT
        )
    
    # MCP Integration Methods
    async def _get_portfolio_data(self, user_id: str) -> Dict:
        """Get portfolio data via MCP PostgreSQL server."""
        # In production, this would call the actual MCP server
        return await self.mcp.call_mcp_tool(
            "postgres",
            "get_user_portfolios",
            {"user_id": user_id}
        )
    
    async def _get_performance_data(self, user_id: str, timeframe: str) -> Dict:
        """Get performance data via MCP TimescaleDB server."""
        return await self.mcp.call_mcp_tool(
            "timescale",
            "get_portfolio_performance_timeseries",
            {"user_id": user_id, "timeframe": timeframe}
        )
    
    async def _get_current_portfolio_snapshot(self, user_id: str) -> Dict:
        """Get current portfolio snapshot."""
        # Mock data for demonstration
        return {
            "user_id": user_id,
            "total_value": 125000.50,
            "positions": [
                {"symbol": "AAPL", "shares": 100, "current_price": 150.25, "value": 15025.00, "weight": 0.12},
                {"symbol": "MSFT", "shares": 80, "current_price": 280.50, "value": 22440.00, "weight": 0.18},
                {"symbol": "GOOGL", "shares": 50, "current_price": 125.75, "value": 6287.50, "weight": 0.05},
                {"symbol": "NVDA", "shares": 75, "current_price": 425.00, "value": 31875.00, "weight": 0.25},
                {"symbol": "TSLA", "shares": 60, "current_price": 185.25, "value": 11115.00, "weight": 0.09}
            ],
            "cash": 38257.00,
            "last_updated": datetime.now().isoformat()
        }
    
    # Analysis Methods
    async def _calculate_risk_metrics(self, portfolio_data: Dict, performance_data: Dict) -> Dict:
        """Calculate portfolio risk metrics."""
        # Mock risk calculations
        await asyncio.sleep(0.5)  # Simulate calculation time
        
        return {
            "sharpe_ratio": 1.85,
            "sortino_ratio": 2.12,
            "max_drawdown": -0.085,
            "volatility": 0.185,
            "beta": 1.05,
            "var_95": -0.028,
            "expected_shortfall": -0.042,
            "diversification_ratio": 0.78
        }
    
    async def _generate_portfolio_analysis(self, portfolio_data: Dict, performance_data: Dict, 
                                         risk_metrics: Dict, timeframe: str, include_benchmarks: bool) -> Dict:
        """Generate comprehensive portfolio analysis."""
        
        # Calculate performance metrics
        total_return = 8.5  # Mock 8.5% return
        benchmark_return = 7.2  # Mock S&P 500 return
        
        # Generate analysis summary
        summary = f"""Portfolio Analysis Summary ({timeframe}):

📊 Performance Highlights:
• Total Portfolio Value: ${portfolio_data.get('total_value', 125000):,.2f}
• Period Return: +{total_return:.1f}% (vs benchmark: +{benchmark_return:.1f}%)
• Sharpe Ratio: {risk_metrics['sharpe_ratio']:.2f}
• Max Drawdown: {risk_metrics['max_drawdown']:.1%}

🎯 Key Observations:
• Technology sector concentration at 30% (above recommended 25%)
• Strong risk-adjusted performance with Sharpe ratio of {risk_metrics['sharpe_ratio']:.2f}
• Diversification score of {risk_metrics['diversification_ratio']:.2f} indicates good spread

⚠️ Recommendations:
• Consider reducing tech concentration by 5%
• Add defensive positions (utilities, consumer staples)
• Maintain current volatility profile"""

        detailed_data = {
            "performance_summary": {
                "total_return": total_return,
                "benchmark_return": benchmark_return,
                "excess_return": total_return - benchmark_return,
                "total_value": portfolio_data.get('total_value', 125000),
                "timeframe": timeframe
            },
            "risk_metrics": risk_metrics,
            "sector_allocation": {
                "Technology": 30.0,
                "Healthcare": 15.0,
                "Financial": 12.0,
                "Consumer": 18.0,
                "Industrial": 10.0,
                "Cash": 15.0
            },
            "top_performers": ["NVDA (+12.5%)", "AAPL (+8.2%)", "MSFT (+6.8%)"],
            "recommendations": [
                "Reduce technology allocation from 30% to 25%",
                "Add 5% allocation to defensive sectors",
                "Consider profit-taking on NVDA position"
            ]
        }
        
        return {"summary": summary, "detailed_data": detailed_data}
    
    async def _calculate_daily_metrics(self, portfolio_snapshot: Dict) -> Dict:
        """Calculate daily performance metrics."""
        return {
            "daily_pnl": 1250.75,
            "daily_return": 1.02,
            "volatility_24h": 0.025,
            "largest_position_weight": 0.25,
            "concentration_score": 6.8,
            "cash_percentage": 15.2
        }
    
    async def _check_performance_alerts(self, metrics: Dict, alert_types: List[str]) -> List[Dict]:
        """Check for performance-related alerts."""
        alerts = []
        
        if "concentration" in alert_types and metrics["largest_position_weight"] > self.performance_thresholds["max_concentration_percentage"] / 100:
            alerts.append({
                "type": "concentration_warning",
                "message": f"Largest position represents {metrics['largest_position_weight']:.1%} of portfolio",
                "severity": "medium"
            })
        
        if "volatility" in alert_types and metrics["volatility_24h"] > self.performance_thresholds["volatility_warning_threshold"]:
            alerts.append({
                "type": "volatility_spike",
                "message": f"24h volatility elevated at {metrics['volatility_24h']:.1%}",
                "severity": "low"
            })
        
        return alerts
    
    async def _calculate_current_allocation(self, portfolio_data: Dict) -> Dict:
        """Calculate current asset allocation."""
        return {
            "Technology": 30.0,
            "Healthcare": 15.0,
            "Financial": 12.0,
            "Consumer": 18.0,
            "Industrial": 10.0,
            "Cash": 15.0
        }
    
    async def _create_rebalancing_plan(self, current: Dict, target: Dict, strategy: str) -> Dict:
        """Create portfolio rebalancing plan."""
        # Mock rebalancing logic
        return {
            "trades_required": [
                {"action": "sell", "asset": "NVDA", "amount": 2500.00, "reason": "reduce tech concentration"},
                {"action": "buy", "asset": "VTI", "amount": 1500.00, "reason": "add diversification"},
                {"action": "buy", "asset": "XLU", "amount": 1000.00, "reason": "add defensive allocation"}
            ],
            "estimated_fees": 15.00,
            "expected_improvement": {
                "diversification_score": "+0.2",
                "risk_reduction": "-2.5%"
            }
        }
    
    async def _calculate_tax_implications(self, rebalancing_plan: Dict, user_id: str) -> Dict:
        """Calculate tax implications of rebalancing."""
        return {
            "short_term_gains": 150.00,
            "long_term_gains": 850.00,
            "estimated_tax_liability": 295.00,
            "tax_loss_harvesting_opportunities": 125.00
        }
    
    def _format_rebalancing_summary(self, plan: Dict, tax_implications: Dict) -> str:
        """Format rebalancing recommendations summary."""
        return f"""Portfolio Rebalancing Recommendations:

🔄 Proposed Changes:
• Reduce NVDA position by $2,500 (lower tech concentration)
• Add $1,500 to broad market index (VTI)
• Add $1,000 to utilities sector (XLU)

💰 Financial Impact:
• Trading Fees: ${plan['estimated_fees']:.2f}
• Tax Liability: ${tax_implications['estimated_tax_liability']:.2f}
• Expected Risk Reduction: {plan['expected_improvement']['risk_reduction']}

✅ Benefits:
• Improved diversification score by {plan['expected_improvement']['diversification_score']}
• Better sector balance
• Reduced concentration risk"""
    
    async def _analyze_positions(self, positions: List[Dict], query: str) -> Dict:
        """Analyze individual positions based on query."""
        # Mock position analysis
        return {
            "summary": "Your largest positions are NVDA (25%), MSFT (18%), and Cash (15%). NVDA has strong momentum but consider taking some profits.",
            "detailed_data": {
                "positions_by_weight": [
                    {"symbol": "NVDA", "weight": 25.0, "performance_1m": 12.5, "status": "overweight"},
                    {"symbol": "MSFT", "weight": 18.0, "performance_1m": 6.8, "status": "target"},
                    {"symbol": "Cash", "weight": 15.0, "performance_1m": 0.4, "status": "high"}
                ],
                "profit_taking_candidates": ["NVDA"],
                "underperformers": []
            }
        }
    
    async def _get_user_positions(self, user_id: str) -> List[Dict]:
        """Get user positions via MCP."""
        return await self.mcp.call_mcp_tool(
            "postgres",
            "get_user_trades",
            {"user_id": user_id}
        )
    
    async def _get_market_data_for_optimization(self) -> Dict:
        """Get market data for optimization."""
        return {"correlations": {}, "expected_returns": {}, "risk_free_rate": 0.045}
    
    async def _run_allocation_optimization(self, portfolio: Dict, market: Dict, objective: str, constraints: Dict) -> Dict:
        """Run portfolio optimization algorithm."""
        # Mock optimization
        return {
            "optimal_weights": {
                "Technology": 25.0,
                "Healthcare": 20.0,
                "Financial": 15.0,
                "Consumer": 15.0,
                "Industrial": 10.0,
                "Utilities": 10.0,
                "Cash": 5.0
            },
            "expected_return": 0.098,
            "expected_volatility": 0.165,
            "sharpe_ratio": 0.85
        }
    
    async def _generate_optimization_summary(self, optimization: Dict) -> Dict:
        """Generate optimization summary."""
        return {
            "text": "Optimized allocation suggests reducing cash and tech concentration while increasing healthcare and utilities exposure for better risk-adjusted returns.",
            "data": optimization
        }
    
    async def startup(self):
        """Initialize MCP connections on startup."""
        await self.mcp.register_mcp_client("postgres", "http://localhost:8003")
        await self.mcp.register_mcp_client("timescale", "http://localhost:8004")
        await self.mcp.register_mcp_client("redis", "http://localhost:8005")
        await self.start()


if __name__ == "__main__":
    agent = PortfolioManagerAgent()
    
    # Start the agent
    asyncio.run(agent.startup())
    
    # Run the server
    uvicorn.run(
        agent.app,
        host="0.0.0.0",
        port=9002,
        log_level="info"
    ) 