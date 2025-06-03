"""
A2A (Agent-to-Agent) Protocol Implementation
Following Google A2A specification for StockPulse agent communication
"""

import json
import asyncio
from typing import Dict, List, Any, Optional, Callable, Union
from datetime import datetime
from uuid import uuid4
import logging
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class A2AMessage(BaseModel):
    """A2A message format following Google A2A specification."""
    jsonrpc: str = "2.0"
    id: str = Field(default_factory=lambda: str(uuid4()))
    method: str
    params: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    source_agent: Optional[str] = None
    target_agent: Optional[str] = None
    session_id: Optional[str] = None
    priority: str = "normal"  # low, normal, high, critical
    expires_at: Optional[str] = None

class A2AResponse(BaseModel):
    """A2A response format."""
    jsonrpc: str = "2.0"
    id: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    source_agent: Optional[str] = None
    execution_time_ms: Optional[float] = None

class A2AError(Exception):
    """A2A protocol error."""
    def __init__(self, code: str, message: str, data: Optional[Dict[str, Any]] = None):
        self.code = code
        self.message = message
        self.data = data or {}
        super().__init__(f"A2A Error {code}: {message}")

class A2ATask(BaseModel):
    """A2A task lifecycle management."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    status: str = "submitted"  # submitted, working, completed, failed
    method: str
    params: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    completed_at: Optional[str] = None
    agent_id: str
    progress: float = 0.0
    estimated_completion: Optional[str] = None


class JSONRPCHandler:
    """JSON-RPC 2.0 handler for A2A communication with full task lifecycle."""
    
    def __init__(self):
        self.methods: Dict[str, Callable] = {}
        self.tasks: Dict[str, A2ATask] = {}
    
    def register(self, method_name: str, handler: Callable):
        """Register a method handler."""
        self.methods[method_name] = handler
        logger.info(f"Registered A2A method: {method_name}")
    
    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming A2A JSON-RPC request with full lifecycle management."""
        try:
            # Validate JSON-RPC format
            if request.get("jsonrpc") != "2.0":
                return self._create_error_response(
                    request.get("id"), -32600, "Invalid Request"
                )
            
            method = request.get("method")
            params = request.get("params", {})
            request_id = request.get("id")
            
            if not method:
                return self._create_error_response(
                    request_id, -32600, "Missing method"
                )
            
            if method not in self.methods:
                return self._create_error_response(
                    request_id, -32601, f"Method not found: {method}"
                )
            
            # Create task for lifecycle management
            task = A2ATask(
                method=method,
                params=params,
                agent_id=request.get("source_agent", "unknown")
            )
            self.tasks[task.id] = task
            
            # Execute method
            start_time = datetime.utcnow()
            try:
                task.status = "working"
                task.updated_at = datetime.utcnow().isoformat()
                
                result = await self.methods[method](params)
                
                task.status = "completed"
                task.result = result
                task.completed_at = datetime.utcnow().isoformat()
                task.progress = 1.0
                
                execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
                
                return A2AResponse(
                    id=request_id,
                    result=result,
                    source_agent=request.get("target_agent"),
                    execution_time_ms=execution_time
                ).dict()
            
            except A2AError as e:
                task.status = "failed"
                task.error = str(e)
                task.updated_at = datetime.utcnow().isoformat()
                
                return self._create_error_response(
                    request_id, e.code, e.message, e.data
                )
            
            except Exception as e:
                task.status = "failed"
                task.error = str(e)
                task.updated_at = datetime.utcnow().isoformat()
                
                logger.error(f"Method execution error: {e}")
                return self._create_error_response(
                    request_id, -32603, "Internal error", {"details": str(e)}
                )
        
        except Exception as e:
            logger.error(f"Request handling error: {e}")
            return self._create_error_response(
                request.get("id"), -32700, "Parse error"
            )
    
    def _create_error_response(
        self, 
        request_id: Optional[str], 
        code: Union[int, str], 
        message: str, 
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create JSON-RPC error response."""
        return {
            "jsonrpc": "2.0",
            "error": {
                "code": code,
                "message": message,
                "data": data
            },
            "id": request_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def get_task_status(self, task_id: str) -> Optional[A2ATask]:
        """Get task status by ID."""
        return self.tasks.get(task_id)
    
    def list_tasks(self, status: Optional[str] = None) -> List[A2ATask]:
        """List tasks, optionally filtered by status."""
        tasks = list(self.tasks.values())
        if status:
            tasks = [task for task in tasks if task.status == status]
        return tasks


class A2AClient:
    """A2A client for making requests to other agents."""
    
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.session = None
    
    async def call_agent(
        self, 
        target_agent_url: str, 
        method: str, 
        params: Dict[str, Any],
        timeout: float = 30.0
    ) -> Dict[str, Any]:
        """Make A2A call to another agent."""
        try:
            import httpx
            
            message = A2AMessage(
                method=method,
                params=params,
                source_agent=self.agent_id,
                target_agent=target_agent_url.split("/")[-1] if "/" in target_agent_url else target_agent_url
            )
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{target_agent_url}/jsonrpc",
                    json=message.dict(),
                    headers={
                        "Content-Type": "application/json",
                        "User-Agent": f"A2A-Client/{self.agent_id}"
                    }
                )
                
                if response.status_code != 200:
                    raise A2AError(
                        "HTTP_ERROR", 
                        f"HTTP {response.status_code}: {response.text}"
                    )
                
                result = response.json()
                
                if "error" in result:
                    error = result["error"]
                    raise A2AError(
                        error.get("code", "UNKNOWN_ERROR"),
                        error.get("message", "Unknown error"),
                        error.get("data")
                    )
                
                return result.get("result", {})
        
        except Exception as e:
            if not isinstance(e, A2AError):
                logger.error(f"A2A client error: {e}")
                raise A2AError("CLIENT_ERROR", f"Unexpected error: {str(e)}")
            raise


class A2ARegistry:
    """Registry for discovering and managing A2A agents."""
    
    def __init__(self):
        self.agents: Dict[str, Dict[str, Any]] = {}
        self.health_status: Dict[str, Dict[str, Any]] = {}
    
    def register_agent(
        self, 
        agent_id: str, 
        agent_info: Dict[str, Any]
    ):
        """Register an agent in the registry."""
        required_fields = ["name", "url", "capabilities", "version"]
        for field in required_fields:
            if field not in agent_info:
                raise ValueError(f"Missing required field: {field}")
        
        self.agents[agent_id] = {
            **agent_info,
            "registered_at": datetime.utcnow().isoformat(),
            "last_seen": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Registered agent: {agent_id}")
    
    def unregister_agent(self, agent_id: str):
        """Unregister an agent."""
        if agent_id in self.agents:
            del self.agents[agent_id]
            self.health_status.pop(agent_id, None)
            logger.info(f"Unregistered agent: {agent_id}")
    
    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent information."""
        return self.agents.get(agent_id)
    
    def list_agents(self, capability: Optional[str] = None) -> List[Dict[str, Any]]:
        """List agents, optionally filtered by capability."""
        agents = list(self.agents.values())
        
        if capability:
            agents = [
                agent for agent in agents 
                if capability in agent.get("capabilities", [])
            ]
        
        return agents


# Global registry instance
registry = A2ARegistry() 