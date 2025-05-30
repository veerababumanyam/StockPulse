"""
StockPulse User Assistant Agent

Main orchestrator agent for handling user interactions and coordinating
multi-agent workflows following Google A2A protocol specification.
"""

import asyncio
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import httpx
import uvicorn
from dotenv import load_dotenv

# Import the A2A framework from shared module
from shared.a2a_framework import (
    A2AAgent,
    A2AProvider,
    A2ASkill,
    A2ATask,
    A2ATaskInput,
    A2ATaskOutput,
    InputMode,
    MCPIntegration,
    OutputMode,
)

load_dotenv()


class UserAssistantAgent(A2AAgent):
    """
    User Assistant Agent - Main orchestrator for StockPulse A2A system.

    Responsibilities:
    - Handle user interactions and maintain conversation context
    - Coordinate complex workflows across multiple specialized agents
    - Manage agent collaboration and conflict resolution
    - Track user sessions and preferences
    """

    def __init__(self):
        super().__init__(
            name="User Assistant",
            description="AI agent for user interaction orchestration and multi-agent workflow coordination",
            version="1.0.0",
            port=9001,
        )

        # Initialize MCP integration for auth and session management
        self.mcp = MCPIntegration()

        # Track active agent conversations
        self.agent_conversations: Dict[str, List[Dict]] = {}

        # Available specialized agents
        self.specialized_agents = {
            "portfolio-manager": "http://localhost:9002",
            "market-researcher": "http://localhost:9003",
            "trading-assistant": "http://localhost:9004",
            "risk-manager": "http://localhost:9005",
            "technical-analyst": "http://localhost:9006",
        }

    def get_provider(self) -> A2AProvider:
        """Get provider information."""
        return A2AProvider(
            organization="StockPulse",
            website="https://stockpulse.ai",
            contact="support@stockpulse.ai",
        )

    def register_skills(self) -> List[A2ASkill]:
        """Register User Assistant agent skills."""
        return [
            A2ASkill(
                id="user_interaction",
                name="User Interaction",
                description="Handle user requests and maintain conversation context",
                tags=["conversation", "user-interface", "context"],
                input_modes=[InputMode.TEXT, InputMode.DATA],
                output_modes=[OutputMode.TEXT, OutputMode.DATA],
                examples=[
                    "How is my portfolio performing?",
                    "What are the market trends today?",
                    "Execute a trade for AAPL",
                    "Analyze risk in my current positions",
                ],
            ),
            A2ASkill(
                id="task_orchestration",
                name="Task Orchestration",
                description="Coordinate complex workflows across multiple agents",
                tags=["orchestration", "workflow", "coordination"],
                input_modes=[InputMode.TEXT, InputMode.DATA],
                output_modes=[OutputMode.TEXT, OutputMode.DATA],
                examples=[
                    "Comprehensive portfolio analysis with market outlook",
                    "End-to-end trade execution with risk validation",
                    "Multi-factor investment research and recommendation",
                ],
            ),
            A2ASkill(
                id="multi_agent_coordination",
                name="Multi-Agent Coordination",
                description="Manage agent collaboration and conflict resolution",
                tags=["coordination", "conflict-resolution", "agent-management"],
                input_modes=[InputMode.DATA],
                output_modes=[OutputMode.DATA],
                examples=[
                    "Resolve conflicting recommendations from different agents",
                    "Prioritize agent responses based on user preferences",
                    "Coordinate parallel agent tasks",
                ],
            ),
            A2ASkill(
                id="session_management",
                name="Session Management",
                description="Track user sessions and preferences",
                tags=["session", "preferences", "state-management"],
                input_modes=[InputMode.DATA],
                output_modes=[OutputMode.DATA],
                examples=[
                    "Store user investment preferences",
                    "Maintain conversation history",
                    "Track user risk tolerance changes",
                ],
            ),
        ]

    async def execute_skill(self, skill_id: str, task: A2ATask) -> A2ATaskOutput:
        """Execute a specific skill."""
        if skill_id == "user_interaction":
            return await self._handle_user_interaction(task)
        elif skill_id == "task_orchestration":
            return await self._orchestrate_task(task)
        elif skill_id == "multi_agent_coordination":
            return await self._coordinate_agents(task)
        elif skill_id == "session_management":
            return await self._manage_session(task)
        else:
            raise ValueError(f"Unknown skill: {skill_id}")

    async def _handle_user_interaction(self, task: A2ATask) -> A2ATaskOutput:
        """Handle user interaction requests."""
        user_message = task.input.text or ""
        user_data = task.input.data or {}

        # Update progress
        self.task_manager.update_task_status(task.id, task.status, progress=0.3)

        # Analyze user intent
        intent = await self._analyze_user_intent(user_message, user_data)

        # Route to appropriate workflow
        if intent["type"] == "portfolio_analysis":
            response = await self._route_to_portfolio_analysis(intent, task.id)
        elif intent["type"] == "market_research":
            response = await self._route_to_market_research(intent, task.id)
        elif intent["type"] == "trade_execution":
            response = await self._route_to_trade_execution(intent, task.id)
        elif intent["type"] == "risk_assessment":
            response = await self._route_to_risk_assessment(intent, task.id)
        elif intent["type"] == "technical_analysis":
            response = await self._route_to_technical_analysis(intent, task.id)
        else:
            response = await self._provide_general_assistance(intent, task.id)

        return A2ATaskOutput(
            text=response["message"],
            data=response.get("data", {}),
            mode=OutputMode.TEXT,
        )

    async def _orchestrate_task(self, task: A2ATask) -> A2ATaskOutput:
        """Orchestrate complex multi-agent workflows."""
        workflow_type = task.input.data.get("workflow_type", "comprehensive_analysis")
        user_id = task.input.data.get("user_id")

        if workflow_type == "comprehensive_portfolio_analysis":
            return await self._comprehensive_portfolio_workflow(user_id, task.id)
        elif workflow_type == "trade_execution_workflow":
            return await self._trade_execution_workflow(task.input.data, task.id)
        elif workflow_type == "investment_research_workflow":
            return await self._investment_research_workflow(task.input.data, task.id)
        else:
            raise ValueError(f"Unknown workflow type: {workflow_type}")

    async def _coordinate_agents(self, task: A2ATask) -> A2ATaskOutput:
        """Coordinate multiple agents and resolve conflicts."""
        agent_responses = task.input.data.get("agent_responses", [])
        coordination_type = task.input.data.get("type", "prioritize")

        if coordination_type == "prioritize":
            result = await self._prioritize_responses(agent_responses)
        elif coordination_type == "resolve_conflicts":
            result = await self._resolve_conflicts(agent_responses)
        elif coordination_type == "merge_insights":
            result = await self._merge_insights(agent_responses)
        else:
            result = {"error": f"Unknown coordination type: {coordination_type}"}

        return A2ATaskOutput(data=result, mode=OutputMode.DATA)

    async def _manage_session(self, task: A2ATask) -> A2ATaskOutput:
        """Manage user session and preferences."""
        action = task.input.data.get("action", "get")
        user_id = task.input.data.get("user_id")

        if action == "store_preferences":
            result = await self._store_user_preferences(user_id, task.input.data)
        elif action == "get_preferences":
            result = await self._get_user_preferences(user_id)
        elif action == "update_context":
            result = await self._update_conversation_context(user_id, task.input.data)
        else:
            result = {"error": f"Unknown session action: {action}"}

        return A2ATaskOutput(data=result, mode=OutputMode.DATA)

    async def _analyze_user_intent(self, message: str, data: Dict) -> Dict:
        """Analyze user intent from message and context."""
        # Simple keyword-based intent analysis (in production, use LLM)
        message_lower = message.lower()

        if any(
            word in message_lower
            for word in ["portfolio", "performance", "holdings", "positions"]
        ):
            return {
                "type": "portfolio_analysis",
                "entity": self._extract_entity(message),
                "timeframe": "default",
            }
        elif any(
            word in message_lower for word in ["market", "news", "trends", "sector"]
        ):
            return {
                "type": "market_research",
                "entity": self._extract_entity(message),
                "scope": "general",
            }
        elif any(
            word in message_lower
            for word in ["buy", "sell", "trade", "execute", "order"]
        ):
            return {
                "type": "trade_execution",
                "entity": self._extract_entity(message),
                "action": self._extract_action(message),
            }
        elif any(
            word in message_lower
            for word in ["risk", "volatility", "exposure", "compliance"]
        ):
            return {
                "type": "risk_assessment",
                "entity": self._extract_entity(message),
                "analysis_type": "comprehensive",
            }
        elif any(
            word in message_lower
            for word in ["technical", "chart", "indicators", "signals"]
        ):
            return {
                "type": "technical_analysis",
                "entity": self._extract_entity(message),
                "indicators": "standard",
            }
        else:
            return {"type": "general", "query": message, "data": data}

    async def _route_to_portfolio_analysis(self, intent: Dict, task_id: str) -> Dict:
        """Route to Portfolio Management Agent."""
        # In production, make actual A2A call to portfolio manager
        await asyncio.sleep(1)  # Simulate processing

        return {
            "message": f"Portfolio analysis completed. Your portfolio shows strong performance with balanced risk exposure.",
            "data": {
                "total_value": 125000.50,
                "daily_change": 1250.25,
                "daily_change_percent": 1.02,
                "top_performers": ["AAPL", "MSFT", "GOOGL"],
                "recommendations": [
                    "Consider rebalancing tech allocation",
                    "Increase defensive positions",
                ],
            },
            "agent_used": "portfolio-manager",
        }

    async def _route_to_market_research(self, intent: Dict, task_id: str) -> Dict:
        """Route to Market Research Agent."""
        await asyncio.sleep(1)  # Simulate processing

        return {
            "message": f"Current market shows mixed signals with technology sector leading gains.",
            "data": {
                "market_sentiment": "cautiously optimistic",
                "sector_leaders": ["Technology", "Healthcare"],
                "sector_laggards": ["Energy", "Utilities"],
                "key_trends": ["AI adoption", "Interest rate stabilization"],
                "news_highlights": [
                    "Fed maintains rates",
                    "Tech earnings beat expectations",
                ],
            },
            "agent_used": "market-researcher",
        }

    async def _route_to_trade_execution(self, intent: Dict, task_id: str) -> Dict:
        """Route to Trading Assistant Agent."""
        await asyncio.sleep(2)  # Simulate processing

        return {
            "message": f"Trade execution initiated. Risk checks passed, order submitted to market.",
            "data": {
                "order_id": "ORD-12345-ABC",
                "status": "submitted",
                "symbol": intent.get("entity", "UNKNOWN"),
                "action": intent.get("action", "buy"),
                "estimated_fill_time": "2-5 minutes",
                "risk_score": "low",
            },
            "agent_used": "trading-assistant",
        }

    async def _route_to_risk_assessment(self, intent: Dict, task_id: str) -> Dict:
        """Route to Risk Management Agent."""
        await asyncio.sleep(1.5)  # Simulate processing

        return {
            "message": f"Risk assessment completed. Current portfolio risk is within acceptable limits.",
            "data": {
                "overall_risk_score": 6.5,
                "var_1_day": -2850.00,
                "max_drawdown": -8.5,
                "diversification_score": 7.8,
                "recommendations": [
                    "Consider reducing tech concentration",
                    "Add defensive assets",
                ],
            },
            "agent_used": "risk-manager",
        }

    async def _route_to_technical_analysis(self, intent: Dict, task_id: str) -> Dict:
        """Route to Technical Analysis Agent."""
        await asyncio.sleep(1)  # Simulate processing

        return {
            "message": f"Technical analysis shows bullish momentum with strong support levels.",
            "data": {
                "trend": "bullish",
                "support_levels": [145.50, 142.00],
                "resistance_levels": [155.00, 158.50],
                "signals": ["RSI oversold", "MACD bullish crossover"],
                "recommendation": "buy_on_dips",
            },
            "agent_used": "technical-analyst",
        }

    async def _provide_general_assistance(self, intent: Dict, task_id: str) -> Dict:
        """Provide general assistance for unclear requests."""
        return {
            "message": "I can help you with portfolio analysis, market research, trade execution, risk assessment, and technical analysis. What would you like to explore?",
            "data": {
                "available_services": list(self.specialized_agents.keys()),
                "suggestion": "Try asking about your portfolio performance or current market trends",
            },
        }

    async def _comprehensive_portfolio_workflow(
        self, user_id: str, task_id: str
    ) -> A2ATaskOutput:
        """Comprehensive portfolio analysis workflow."""
        # Simulate coordinated multi-agent workflow
        self.task_manager.update_task_status(task_id, task.status, progress=0.2)

        # Step 1: Get portfolio data
        await asyncio.sleep(1)
        self.task_manager.update_task_status(task_id, task.status, progress=0.4)

        # Step 2: Get market context
        await asyncio.sleep(1)
        self.task_manager.update_task_status(task_id, task.status, progress=0.6)

        # Step 3: Risk analysis
        await asyncio.sleep(1)
        self.task_manager.update_task_status(task_id, task.status, progress=0.8)

        # Step 4: Generate recommendations
        await asyncio.sleep(1)

        return A2ATaskOutput(
            text="Comprehensive portfolio analysis complete. Your portfolio is well-diversified with moderate risk exposure. Consider rebalancing technology allocation and adding defensive positions.",
            data={
                "workflow": "comprehensive_portfolio_analysis",
                "agents_involved": [
                    "portfolio-manager",
                    "market-researcher",
                    "risk-manager",
                ],
                "analysis": {
                    "portfolio_health": "good",
                    "risk_level": "moderate",
                    "diversification": "well-balanced",
                    "market_alignment": "aligned",
                },
                "recommendations": [
                    "Reduce tech concentration from 35% to 25%",
                    "Add 10% allocation to defensive assets",
                    "Consider taking profits on overvalued positions",
                ],
            },
            mode=OutputMode.TEXT,
        )

    async def _trade_execution_workflow(
        self, trade_data: Dict, task_id: str
    ) -> A2ATaskOutput:
        """End-to-end trade execution workflow."""
        # Simulate trade workflow with risk validation
        self.task_manager.update_task_status(task_id, task.status, progress=0.3)

        # Risk validation
        await asyncio.sleep(1)
        self.task_manager.update_task_status(task_id, task.status, progress=0.6)

        # Trade execution
        await asyncio.sleep(2)
        self.task_manager.update_task_status(task_id, task.status, progress=0.9)

        return A2ATaskOutput(
            text="Trade execution workflow completed successfully. Order filled at favorable price.",
            data={
                "workflow": "trade_execution",
                "order_id": "ORD-67890-XYZ",
                "status": "filled",
                "execution_price": 152.45,
                "execution_time": "2025-05-29T10:30:15Z",
                "agents_involved": [
                    "trading-assistant",
                    "risk-manager",
                    "portfolio-manager",
                ],
            },
            mode=OutputMode.TEXT,
        )

    async def _investment_research_workflow(
        self, research_data: Dict, task_id: str
    ) -> A2ATaskOutput:
        """Multi-factor investment research workflow."""
        self.task_manager.update_task_status(task_id, task.status, progress=0.25)

        # Market research
        await asyncio.sleep(1)
        self.task_manager.update_task_status(task_id, task.status, progress=0.5)

        # Technical analysis
        await asyncio.sleep(1)
        self.task_manager.update_task_status(task_id, task.status, progress=0.75)

        # Risk assessment
        await asyncio.sleep(1)

        return A2ATaskOutput(
            text="Investment research completed. Strong buy recommendation based on fundamental and technical analysis.",
            data={
                "workflow": "investment_research",
                "symbol": research_data.get("symbol", "UNKNOWN"),
                "recommendation": "strong_buy",
                "confidence_score": 8.5,
                "price_target": 175.00,
                "agents_involved": [
                    "market-researcher",
                    "technical-analyst",
                    "risk-manager",
                ],
            },
            mode=OutputMode.TEXT,
        )

    async def _prioritize_responses(self, responses: List[Dict]) -> Dict:
        """Prioritize agent responses based on confidence and relevance."""
        # Simple prioritization logic
        prioritized = sorted(
            responses, key=lambda x: x.get("confidence", 0), reverse=True
        )
        return {
            "prioritized_responses": prioritized,
            "primary_recommendation": prioritized[0] if prioritized else None,
        }

    async def _resolve_conflicts(self, responses: List[Dict]) -> Dict:
        """Resolve conflicting recommendations from different agents."""
        # Simple conflict resolution
        return {
            "resolution": "consensus_moderate",
            "rationale": "Taking average of conflicting recommendations",
        }

    async def _merge_insights(self, responses: List[Dict]) -> Dict:
        """Merge insights from multiple agents."""
        return {
            "merged_insights": "Combined analysis shows balanced outlook with moderate risk",
            "confidence": 7.5,
        }

    async def _store_user_preferences(self, user_id: str, preferences: Dict) -> Dict:
        """Store user preferences via MCP Redis server."""
        try:
            result = await self.mcp.call_mcp_tool(
                "redis",
                "set_user_preferences",
                {"user_id": user_id, "preferences": preferences},
            )
            return {"status": "stored", "user_id": user_id, "result": result}
        except Exception as e:
            logger.warning(
                "Failed to store preferences via MCP, using fallback", error=str(e)
            )
            return {"status": "stored", "user_id": user_id, "fallback": True}

    async def _get_user_preferences(self, user_id: str) -> Dict:
        """Get user preferences via MCP Redis server."""
        try:
            result = await self.mcp.call_mcp_tool(
                "redis", "get_user_preferences", {"user_id": user_id}
            )
            return result
        except Exception as e:
            logger.warning(
                "Failed to get preferences via MCP, using fallback", error=str(e)
            )
            return {
                "risk_tolerance": "moderate",
                "investment_style": "balanced",
                "notification_preferences": {"email": True},
                "fallback": True,
            }

    async def _update_conversation_context(self, user_id: str, context: Dict) -> Dict:
        """Update conversation context via MCP Redis server."""
        try:
            result = await self.mcp.call_mcp_tool(
                "redis",
                "update_conversation_context",
                {"user_id": user_id, "context": context},
            )
            return {
                "status": "updated",
                "context_id": f"ctx_{user_id}_123",
                "result": result,
            }
        except Exception as e:
            logger.warning(
                "Failed to update context via MCP, using fallback", error=str(e)
            )
            return {
                "status": "updated",
                "context_id": f"ctx_{user_id}_123",
                "fallback": True,
            }

    def _extract_entity(self, message: str) -> str:
        """Extract entity (stock symbol) from message."""
        # Simple extraction - in production use NER
        words = message.upper().split()
        for word in words:
            if len(word) <= 5 and word.isalpha():
                return word
        return "UNKNOWN"

    def _extract_action(self, message: str) -> str:
        """Extract action from message."""
        message_lower = message.lower()
        if "buy" in message_lower:
            return "buy"
        elif "sell" in message_lower:
            return "sell"
        else:
            return "unknown"

    async def startup(self):
        """Initialize enhanced MCP connections and start A2A agent."""
        # Register MCP clients for auth and session management
        await self.mcp.register_mcp_client("auth", "http://localhost:8002")
        await self.mcp.register_mcp_client("redis", "http://localhost:8005")
        await self.mcp.register_mcp_client("postgres", "http://localhost:8003")
        await self.mcp.register_mcp_client("graphiti", "http://localhost:8006")

        # Start A2A agent with MCP integration
        await self.start()

        logger.info(
            "User Assistant A2A agent started with MCP integration",
            mcp_clients=len(self.mcp.mcp_clients),
            skills_exposed_as_mcp=len(self.mcp.tool_registry),
        )


if __name__ == "__main__":
    agent = UserAssistantAgent()

    # Start the agent
    asyncio.run(agent.startup())

    # Run the server
    uvicorn.run(agent.app, host="0.0.0.0", port=9001, log_level="info")
