"""
StockPulse A2A Registry Service

Central registry for A2A agent discovery, health monitoring, and capability management.
Provides service discovery, agent catalog, and monitoring functionality.
"""

import asyncio
import json
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
import httpx

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import structlog

load_dotenv()
logger = structlog.get_logger()


class AgentRegistration(BaseModel):
    """Agent registration model."""
    id: str = Field(..., description="Unique agent identifier")
    name: str = Field(..., description="Agent name")
    description: str = Field(..., description="Agent description")
    url: str = Field(..., description="Agent base URL")
    port: int = Field(..., description="Agent port")
    version: str = Field("1.0.0", description="Agent version")
    skills: List[str] = Field(default_factory=list, description="Agent skill IDs")
    status: str = Field("unknown", description="Agent health status")
    last_heartbeat: Optional[datetime] = Field(None, description="Last heartbeat timestamp")
    metadata: Dict = Field(default_factory=dict, description="Additional metadata")


class SkillInfo(BaseModel):
    """Skill information model."""
    skill_id: str
    skill_name: str
    description: str
    agent_id: str
    agent_name: str
    tags: List[str] = Field(default_factory=list)
    examples: List[str] = Field(default_factory=list)


class HealthCheck(BaseModel):
    """Health check result model."""
    agent_id: str
    status: str  # healthy, unhealthy, unknown
    response_time_ms: Optional[float] = None
    error: Optional[str] = None
    timestamp: datetime
    details: Dict = Field(default_factory=dict)


class A2ARegistryService:
    """A2A Registry Service for agent discovery and management."""
    
    def __init__(self):
        self.app = FastAPI(
            title="StockPulse A2A Registry",
            description="Central registry for A2A agent discovery and management",
            version="1.0.0"
        )
        
        # Agent registry storage
        self.agents: Dict[str, AgentRegistration] = {}
        self.agent_cards: Dict[str, Dict] = {}  # Cached agent cards
        self.health_history: Dict[str, List[HealthCheck]] = {}
        
        # Configuration
        self.health_check_interval = 30  # seconds
        self.max_health_history = 100  # per agent
        self.agent_timeout = 10.0  # seconds
        
        # HTTP client for agent communication
        self.http_client = httpx.AsyncClient(timeout=self.agent_timeout)
        
        # Built-in agent configurations
        self.default_agents = {
            "user-assistant": {
                "id": "user-assistant",
                "name": "User Assistant",
                "description": "Main orchestrator for user interactions and workflow coordination",
                "url": "http://localhost:9001",
                "port": 9001,
                "skills": ["user_interaction", "task_orchestration", "multi_agent_coordination", "session_management"]
            },
            "portfolio-manager": {
                "id": "portfolio-manager", 
                "name": "Portfolio Manager",
                "description": "Portfolio analysis, performance tracking, and optimization",
                "url": "http://localhost:9002",
                "port": 9002,
                "skills": ["portfolio_analysis", "performance_tracking", "rebalancing_recommendations", "position_management", "allocation_optimization"]
            },
            "market-researcher": {
                "id": "market-researcher",
                "name": "Market Researcher", 
                "description": "Market analysis, news research, and trend identification",
                "url": "http://localhost:9003",
                "port": 9003,
                "skills": ["market_analysis", "news_research", "company_analysis", "trend_identification", "sector_analysis", "sentiment_analysis"]
            },
            "trading-assistant": {
                "id": "trading-assistant",
                "name": "Trading Assistant",
                "description": "Trade execution, order management, and real-time monitoring", 
                "url": "http://localhost:9004",
                "port": 9004,
                "skills": ["trade_execution", "order_management", "risk_checking", "price_monitoring", "execution_analytics"]
            },
            "risk-manager": {
                "id": "risk-manager",
                "name": "Risk Manager",
                "description": "Risk assessment, compliance, and exposure monitoring",
                "url": "http://localhost:9005", 
                "port": 9005,
                "skills": ["risk_assessment", "position_sizing", "volatility_analysis", "compliance_checking", "stress_testing", "exposure_monitoring"]
            },
            "technical-analyst": {
                "id": "technical-analyst",
                "name": "Technical Analyst",
                "description": "Technical analysis, signal generation, and pattern recognition",
                "url": "http://localhost:9006",
                "port": 9006,
                "skills": ["technical_indicators", "chart_analysis", "signal_generation", "pattern_recognition", "momentum_analysis", "support_resistance"]
            }
        }
        
        self._setup_routes()
        logger.info("A2A Registry initialized")
    
    def _setup_routes(self):
        """Setup FastAPI routes."""
        
        @self.app.get("/")
        async def root():
            """Root endpoint with registry information."""
            return {
                "service": "StockPulse A2A Registry",
                "version": "1.0.0",
                "agents_registered": len(self.agents),
                "uptime": "system_uptime_placeholder",
                "endpoints": {
                    "agents": "/agents",
                    "skills": "/skills", 
                    "health": "/health",
                    "register": "/agents/register",
                    "agent_card": "/agents/{agent_id}/card"
                }
            }
        
        @self.app.get("/agents")
        async def list_agents():
            """List all registered agents."""
            return {
                "agents": list(self.agents.values()),
                "total": len(self.agents),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        @self.app.get("/agents/{agent_id}")
        async def get_agent(agent_id: str):
            """Get specific agent details."""
            if agent_id not in self.agents:
                raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
            
            agent = self.agents[agent_id]
            agent_card = self.agent_cards.get(agent_id, {})
            health_checks = self.health_history.get(agent_id, [])[-10:]  # Last 10 checks
            
            return {
                "agent": agent,
                "agent_card": agent_card,
                "recent_health_checks": health_checks,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        @self.app.get("/skills")
        async def list_skills():
            """List all available skills across agents."""
            skills = []
            for agent_id, agent in self.agents.items():
                agent_card = self.agent_cards.get(agent_id, {})
                card_skills = agent_card.get("skills", [])
                
                for skill in card_skills:
                    skills.append(SkillInfo(
                        skill_id=skill.get("id", "unknown"),
                        skill_name=skill.get("name", "Unknown"),
                        description=skill.get("description", ""),
                        agent_id=agent_id,
                        agent_name=agent.name,
                        tags=skill.get("tags", []),
                        examples=skill.get("examples", [])
                    ))
            
            return {
                "skills": skills,
                "total": len(skills),
                "agents_with_skills": len([a for a in self.agents.values() if a.skills]),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        @self.app.get("/health")
        async def overall_health():
            """Get overall system health."""
            agent_health = {}
            healthy_count = 0
            
            for agent_id, agent in self.agents.items():
                recent_checks = self.health_history.get(agent_id, [])
                if recent_checks:
                    latest_check = recent_checks[-1]
                    agent_health[agent_id] = {
                        "status": latest_check.status,
                        "last_check": latest_check.timestamp.isoformat(),
                        "response_time_ms": latest_check.response_time_ms
                    }
                    if latest_check.status == "healthy":
                        healthy_count += 1
                else:
                    agent_health[agent_id] = {
                        "status": "unknown",
                        "last_check": None,
                        "response_time_ms": None
                    }
            
            total_agents = len(self.agents)
            health_percentage = (healthy_count / total_agents * 100) if total_agents > 0 else 0
            
            return {
                "overall_status": "healthy" if health_percentage >= 80 else "degraded" if health_percentage >= 50 else "unhealthy",
                "healthy_agents": healthy_count,
                "total_agents": total_agents,
                "health_percentage": health_percentage,
                "agent_health": agent_health,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        @self.app.post("/agents/register")
        async def register_agent(registration: AgentRegistration):
            """Register a new agent."""
            registration.last_heartbeat = datetime.now(timezone.utc)
            self.agents[registration.id] = registration
            
            # Fetch agent card
            try:
                agent_card = await self._fetch_agent_card(registration.url)
                self.agent_cards[registration.id] = agent_card
                
                # Update skills from agent card
                if "skills" in agent_card:
                    registration.skills = [skill["id"] for skill in agent_card["skills"]]
                
            except Exception as e:
                logger.warning("Failed to fetch agent card", agent_id=registration.id, error=str(e))
            
            logger.info("Agent registered", agent_id=registration.id, name=registration.name)
            
            return {
                "status": "registered",
                "agent_id": registration.id,
                "timestamp": registration.last_heartbeat.isoformat()
            }
        
        @self.app.delete("/agents/{agent_id}")
        async def deregister_agent(agent_id: str):
            """Deregister an agent."""
            if agent_id not in self.agents:
                raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
            
            del self.agents[agent_id]
            if agent_id in self.agent_cards:
                del self.agent_cards[agent_id]
            if agent_id in self.health_history:
                del self.health_history[agent_id]
            
            logger.info("Agent deregistered", agent_id=agent_id)
            
            return {
                "status": "deregistered",
                "agent_id": agent_id,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        @self.app.get("/agents/{agent_id}/card")
        async def get_agent_card(agent_id: str):
            """Get agent card (capability definition)."""
            if agent_id not in self.agents:
                raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
            
            if agent_id not in self.agent_cards:
                # Try to fetch fresh agent card
                agent = self.agents[agent_id]
                try:
                    agent_card = await self._fetch_agent_card(agent.url)
                    self.agent_cards[agent_id] = agent_card
                except Exception as e:
                    raise HTTPException(status_code=503, detail=f"Could not fetch agent card: {str(e)}")
            
            return self.agent_cards[agent_id]
        
        @self.app.post("/agents/{agent_id}/heartbeat")
        async def agent_heartbeat(agent_id: str):
            """Receive heartbeat from agent."""
            if agent_id not in self.agents:
                raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
            
            self.agents[agent_id].last_heartbeat = datetime.now(timezone.utc)
            self.agents[agent_id].status = "healthy"
            
            return {
                "status": "heartbeat_received",
                "agent_id": agent_id,
                "timestamp": self.agents[agent_id].last_heartbeat.isoformat()
            }
        
        @self.app.get("/discovery")
        async def discovery_endpoint():
            """Service discovery endpoint for A2A ecosystem."""
            return {
                "registry_url": "http://localhost:9000",
                "available_agents": [
                    {
                        "id": agent.id,
                        "name": agent.name,
                        "url": agent.url,
                        "skills": agent.skills,
                        "status": agent.status
                    }
                    for agent in self.agents.values()
                ],
                "protocol_version": "A2A-1.0",
                "features": ["agent_discovery", "health_monitoring", "skill_catalog"]
            }
    
    async def _fetch_agent_card(self, agent_url: str) -> Dict:
        """Fetch agent card from agent's well-known endpoint."""
        card_url = f"{agent_url}/.well-known/agent.json"
        
        try:
            response = await self.http_client.get(card_url)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            logger.error("Failed to fetch agent card", url=card_url, error=str(e))
            raise
        except httpx.HTTPStatusError as e:
            logger.error("Agent card endpoint returned error", url=card_url, status=e.response.status_code)
            raise
    
    async def _health_check_agent(self, agent: AgentRegistration) -> HealthCheck:
        """Perform health check on a specific agent."""
        health_url = f"{agent.url}/health"
        start_time = datetime.now()
        
        try:
            response = await self.http_client.get(health_url)
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            
            if response.status_code == 200:
                health_data = response.json()
                return HealthCheck(
                    agent_id=agent.id,
                    status="healthy",
                    response_time_ms=response_time,
                    timestamp=datetime.now(timezone.utc),
                    details=health_data
                )
            else:
                return HealthCheck(
                    agent_id=agent.id,
                    status="unhealthy",
                    response_time_ms=response_time,
                    error=f"HTTP {response.status_code}",
                    timestamp=datetime.now(timezone.utc)
                )
                
        except Exception as e:
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            return HealthCheck(
                agent_id=agent.id,
                status="unhealthy",
                response_time_ms=response_time,
                error=str(e),
                timestamp=datetime.now(timezone.utc)
            )
    
    async def _health_check_loop(self):
        """Background health check loop."""
        while True:
            try:
                await asyncio.sleep(self.health_check_interval)
                
                # Perform health checks for all agents
                health_tasks = []
                for agent in self.agents.values():
                    health_tasks.append(self._health_check_agent(agent))
                
                if health_tasks:
                    health_results = await asyncio.gather(*health_tasks, return_exceptions=True)
                    
                    for result in health_results:
                        if isinstance(result, HealthCheck):
                            agent_id = result.agent_id
                            
                            # Update agent status
                            if agent_id in self.agents:
                                self.agents[agent_id].status = result.status
                                self.agents[agent_id].last_heartbeat = result.timestamp
                            
                            # Store health history
                            if agent_id not in self.health_history:
                                self.health_history[agent_id] = []
                            
                            self.health_history[agent_id].append(result)
                            
                            # Limit history size
                            if len(self.health_history[agent_id]) > self.max_health_history:
                                self.health_history[agent_id] = self.health_history[agent_id][-self.max_health_history:]
                        
                        elif isinstance(result, Exception):
                            logger.error("Health check failed", error=str(result))
                
            except Exception as e:
                logger.error("Health check loop error", error=str(e))
    
    async def _auto_register_default_agents(self):
        """Auto-register default StockPulse agents."""
        for agent_config in self.default_agents.values():
            registration = AgentRegistration(**agent_config)
            self.agents[registration.id] = registration
            
            # Try to fetch agent card
            try:
                agent_card = await self._fetch_agent_card(registration.url)
                self.agent_cards[registration.id] = agent_card
                logger.info("Auto-registered agent", agent_id=registration.id)
            except Exception as e:
                logger.warning("Could not fetch card for default agent", agent_id=registration.id, error=str(e))
    
    async def startup(self):
        """Initialize registry service."""
        logger.info("Starting A2A Registry service")
        
        # Auto-register default agents
        await self._auto_register_default_agents()
        
        # Start health check loop
        asyncio.create_task(self._health_check_loop())
        
        logger.info("A2A Registry started", agents_registered=len(self.agents))
    
    async def shutdown(self):
        """Cleanup on shutdown."""
        await self.http_client.aclose()
        logger.info("A2A Registry shut down")


# Global registry instance
registry_service = A2ARegistryService()


if __name__ == "__main__":
    # Start the registry
    asyncio.run(registry_service.startup())
    
    # Run the server
    uvicorn.run(
        registry_service.app,
        host="0.0.0.0",
        port=9000,
        log_level="info"
    ) 