"""
StockPulse A2A Framework

Core framework for implementing Google Agent-to-Agent (A2A) protocol compliant agents.
Provides base classes, task management, agent cards, and MCP integration.
"""

import asyncio
import json
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

import httpx
import structlog
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from sse_starlette import EventSourceResponse

logger = structlog.get_logger()


class TaskStatus(str, Enum):
    """A2A Task Status enum following Google A2A specification."""

    SUBMITTED = "submitted"
    WORKING = "working"
    INPUT_REQUIRED = "input-required"
    COMPLETED = "completed"
    CANCELED = "canceled"
    FAILED = "failed"


class InputMode(str, Enum):
    """Supported input modes for A2A communication."""

    TEXT = "text"
    DATA = "data"
    IMAGE = "image"
    AUDIO = "audio"
    FILE = "file"


class OutputMode(str, Enum):
    """Supported output modes for A2A communication."""

    TEXT = "text"
    DATA = "data"
    IMAGE = "image"
    AUDIO = "audio"
    FILE = "file"
    CHART = "chart"


class AuthScheme(str, Enum):
    """Supported authentication schemes."""

    BEARER = "bearer"
    OAUTH2 = "oauth2"
    API_KEY = "apikey"


class A2ASkill(BaseModel):
    """A2A Skill definition following Google A2A specification."""

    id: str = Field(..., description="Unique skill identifier")
    name: str = Field(..., description="Human-readable skill name")
    description: str = Field(..., description="Detailed skill description")
    tags: List[str] = Field(
        default_factory=list, description="Skill categorization tags"
    )
    input_modes: List[InputMode] = Field(
        default=[InputMode.TEXT], description="Supported input modes"
    )
    output_modes: List[OutputMode] = Field(
        default=[OutputMode.TEXT], description="Supported output modes"
    )
    examples: List[str] = Field(default_factory=list, description="Example usage")
    parameters: Optional[Dict[str, Any]] = Field(
        None, description="Optional skill parameters schema"
    )


class A2AProvider(BaseModel):
    """A2A Provider information."""

    organization: str = Field(..., description="Organization name")
    website: Optional[str] = Field(None, description="Organization website")
    contact: Optional[str] = Field(None, description="Contact information")


class A2ACapabilities(BaseModel):
    """A2A Agent capabilities."""

    streaming: bool = Field(True, description="Supports streaming responses")
    push_notifications: bool = Field(True, description="Supports push notifications")
    state_transition_history: bool = Field(True, description="Maintains state history")
    file_upload: bool = Field(False, description="Supports file uploads")
    multi_modal: bool = Field(False, description="Supports multi-modal communication")


class A2AAuthentication(BaseModel):
    """A2A Authentication configuration."""

    schemes: List[AuthScheme] = Field(..., description="Supported auth schemes")
    required: bool = Field(True, description="Whether authentication is required")


class A2AAgentCard(BaseModel):
    """A2A Agent Card following Google A2A specification."""

    name: str = Field(..., description="Agent name")
    description: str = Field(..., description="Agent description")
    version: str = Field(..., description="Agent version")
    provider: A2AProvider = Field(..., description="Provider information")
    url: str = Field(..., description="Agent base URL")
    documentation_url: Optional[str] = Field(None, description="Documentation URL")
    capabilities: A2ACapabilities = Field(default_factory=A2ACapabilities)
    authentication: A2AAuthentication = Field(
        default_factory=lambda: A2AAuthentication(schemes=[AuthScheme.BEARER])
    )
    default_input_modes: List[InputMode] = Field(default=[InputMode.TEXT])
    default_output_modes: List[OutputMode] = Field(default=[OutputMode.TEXT])
    skills: List[A2ASkill] = Field(..., description="Available skills")


class A2ATaskInput(BaseModel):
    """Input for A2A task."""

    text: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    files: Optional[List[str]] = None
    mode: InputMode = InputMode.TEXT


class A2ATaskOutput(BaseModel):
    """Output from A2A task."""

    text: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    files: Optional[List[str]] = None
    mode: OutputMode = OutputMode.TEXT


class A2ATask(BaseModel):
    """A2A Task following Google A2A specification."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: TaskStatus = TaskStatus.SUBMITTED
    skill_id: str = Field(..., description="Target skill ID")
    input: A2ATaskInput = Field(..., description="Task input")
    output: Optional[A2ATaskOutput] = None
    error: Optional[str] = None
    progress: float = Field(0.0, ge=0.0, le=1.0, description="Task progress (0.0-1.0)")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class A2AJsonRpcRequest(BaseModel):
    """JSON-RPC 2.0 request for A2A communication."""

    jsonrpc: str = "2.0"
    method: str
    params: Optional[Dict[str, Any]] = None
    id: Optional[Union[str, int]] = None


class A2AJsonRpcResponse(BaseModel):
    """JSON-RPC 2.0 response for A2A communication."""

    jsonrpc: str = "2.0"
    result: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None
    id: Optional[Union[str, int]] = None


class TaskManager:
    """A2A Task lifecycle management."""

    def __init__(self):
        self.tasks: Dict[str, A2ATask] = {}
        self.task_handlers: Dict[str, asyncio.Task] = {}

    def create_task(self, skill_id: str, input_data: A2ATaskInput) -> A2ATask:
        """Create a new A2A task."""
        task = A2ATask(skill_id=skill_id, input=input_data)
        self.tasks[task.id] = task
        logger.info("Created A2A task", task_id=task.id, skill_id=skill_id)
        return task

    def get_task(self, task_id: str) -> Optional[A2ATask]:
        """Get task by ID."""
        return self.tasks.get(task_id)

    def update_task_status(
        self,
        task_id: str,
        status: TaskStatus,
        output: Optional[A2ATaskOutput] = None,
        error: Optional[str] = None,
        progress: Optional[float] = None,
    ) -> bool:
        """Update task status and output."""
        if task_id not in self.tasks:
            return False

        task = self.tasks[task_id]
        task.status = status
        task.updated_at = datetime.now(timezone.utc)

        if output:
            task.output = output
        if error:
            task.error = error
        if progress is not None:
            task.progress = progress
        if status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELED]:
            task.completed_at = datetime.now(timezone.utc)

        logger.info(
            "Updated A2A task", task_id=task_id, status=status, progress=progress
        )
        return True

    def cancel_task(self, task_id: str) -> bool:
        """Cancel a running task."""
        if task_id not in self.tasks:
            return False

        # Cancel asyncio handler if exists
        if task_id in self.task_handlers:
            self.task_handlers[task_id].cancel()
            del self.task_handlers[task_id]

        return self.update_task_status(task_id, TaskStatus.CANCELED)

    def register_handler(self, task_id: str, handler: asyncio.Task):
        """Register asyncio task handler."""
        self.task_handlers[task_id] = handler

    def cleanup_completed_tasks(self, max_age_hours: int = 24):
        """Cleanup old completed tasks."""
        cutoff = datetime.now(timezone.utc).timestamp() - (max_age_hours * 3600)
        to_remove = []

        for task_id, task in self.tasks.items():
            if (
                task.completed_at
                and task.completed_at.timestamp() < cutoff
                and task.status
                in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELED]
            ):
                to_remove.append(task_id)

        for task_id in to_remove:
            del self.tasks[task_id]
            if task_id in self.task_handlers:
                del self.task_handlers[task_id]

        if to_remove:
            logger.info("Cleaned up completed A2A tasks", count=len(to_remove))


class A2AAgent(ABC):
    """Base class for A2A agents following Google A2A specification."""

    def __init__(
        self,
        name: str,
        description: str,
        version: str = "1.0.0",
        port: int = 9000,
        base_url: Optional[str] = None,
    ):
        self.name = name
        self.description = description
        self.version = version
        self.port = port
        self.base_url = base_url or f"https://localhost:{port}"

        self.app = FastAPI(title=f"StockPulse {name}", version=version)
        self.task_manager = TaskManager()
        self.skills: Dict[str, A2ASkill] = {}

        # Setup routes
        self._setup_routes()

        logger.info("Initialized A2A agent", name=name, port=port)

    @abstractmethod
    def get_provider(self) -> A2AProvider:
        """Get provider information."""
        pass

    @abstractmethod
    def register_skills(self) -> List[A2ASkill]:
        """Register agent skills."""
        pass

    @abstractmethod
    async def execute_skill(self, skill_id: str, task: A2ATask) -> A2ATaskOutput:
        """Execute a specific skill."""
        pass

    def add_skill(self, skill: A2ASkill):
        """Add a skill to the agent."""
        self.skills[skill.id] = skill
        logger.info("Registered A2A skill", skill_id=skill.id, agent=self.name)

    def get_agent_card(self) -> A2AAgentCard:
        """Generate agent card following A2A specification."""
        return A2AAgentCard(
            name=f"StockPulse {self.name}",
            description=self.description,
            version=self.version,
            provider=self.get_provider(),
            url=self.base_url,
            documentation_url=f"{self.base_url}/docs",
            skills=list(self.skills.values()),
        )

    def _setup_routes(self):
        """Setup FastAPI routes for A2A protocol."""

        @self.app.get("/.well-known/agent.json")
        async def agent_card():
            """Serve agent card at well-known location."""
            return self.get_agent_card()

        @self.app.post("/jsonrpc")
        async def json_rpc_endpoint(request: A2AJsonRpcRequest):
            """Main JSON-RPC 2.0 endpoint for A2A communication."""
            try:
                if request.method == "tasks/send":
                    return await self._handle_task_send(request)
                elif request.method == "tasks/get":
                    return await self._handle_task_get(request)
                elif request.method == "tasks/cancel":
                    return await self._handle_task_cancel(request)
                else:
                    return A2AJsonRpcResponse(
                        error={"code": -32601, "message": "Method not found"},
                        id=request.id,
                    )
            except Exception as e:
                logger.error("A2A JSON-RPC error", error=str(e), method=request.method)
                return A2AJsonRpcResponse(
                    error={"code": -32603, "message": "Internal error"}, id=request.id
                )

        @self.app.get("/tasks/{task_id}/stream")
        async def stream_task(task_id: str):
            """Stream task updates via SSE."""
            return EventSourceResponse(self._stream_task_updates(task_id))

        @self.app.get("/health")
        async def health_check():
            """Health check endpoint."""
            return {
                "status": "healthy",
                "agent": self.name,
                "version": self.version,
                "tasks": {
                    "total": len(self.task_manager.tasks),
                    "active": len(
                        [
                            t
                            for t in self.task_manager.tasks.values()
                            if t.status in [TaskStatus.SUBMITTED, TaskStatus.WORKING]
                        ]
                    ),
                },
            }

    async def _handle_task_send(self, request: A2AJsonRpcRequest) -> A2AJsonRpcResponse:
        """Handle tasks/send JSON-RPC method."""
        params = request.params or {}
        skill_id = params.get("skill_id")
        input_data = A2ATaskInput(**params.get("input", {}))

        if skill_id not in self.skills:
            return A2AJsonRpcResponse(
                error={"code": -32602, "message": f"Skill '{skill_id}' not found"},
                id=request.id,
            )

        # Create task
        task = self.task_manager.create_task(skill_id, input_data)

        # Start task execution
        handler = asyncio.create_task(self._execute_task(task))
        self.task_manager.register_handler(task.id, handler)

        return A2AJsonRpcResponse(
            result={"task_id": task.id, "status": task.status}, id=request.id
        )

    async def _handle_task_get(self, request: A2AJsonRpcRequest) -> A2AJsonRpcResponse:
        """Handle tasks/get JSON-RPC method."""
        params = request.params or {}
        task_id = params.get("task_id")

        task = self.task_manager.get_task(task_id)
        if not task:
            return A2AJsonRpcResponse(
                error={"code": -32602, "message": f"Task '{task_id}' not found"},
                id=request.id,
            )

        return A2AJsonRpcResponse(result=task.dict(), id=request.id)

    async def _handle_task_cancel(
        self, request: A2AJsonRpcRequest
    ) -> A2AJsonRpcResponse:
        """Handle tasks/cancel JSON-RPC method."""
        params = request.params or {}
        task_id = params.get("task_id")

        success = self.task_manager.cancel_task(task_id)
        if not success:
            return A2AJsonRpcResponse(
                error={"code": -32602, "message": f"Task '{task_id}' not found"},
                id=request.id,
            )

        return A2AJsonRpcResponse(
            result={"task_id": task_id, "status": "canceled"}, id=request.id
        )

    async def _execute_task(self, task: A2ATask):
        """Execute task asynchronously."""
        try:
            # Update to working status
            self.task_manager.update_task_status(
                task.id, TaskStatus.WORKING, progress=0.1
            )

            # Execute the skill
            output = await self.execute_skill(task.skill_id, task)

            # Mark as completed
            self.task_manager.update_task_status(
                task.id, TaskStatus.COMPLETED, output=output, progress=1.0
            )

        except Exception as e:
            logger.error("Task execution failed", task_id=task.id, error=str(e))
            self.task_manager.update_task_status(
                task.id, TaskStatus.FAILED, error=str(e)
            )

    async def _stream_task_updates(self, task_id: str):
        """Stream task status updates via SSE."""
        task = self.task_manager.get_task(task_id)
        if not task:
            yield {"event": "error", "data": "Task not found"}
            return

        last_status = None
        while task.status not in [
            TaskStatus.COMPLETED,
            TaskStatus.FAILED,
            TaskStatus.CANCELED,
        ]:
            if task.status != last_status:
                yield {
                    "event": "status",
                    "data": json.dumps(
                        {
                            "task_id": task_id,
                            "status": task.status,
                            "progress": task.progress,
                        }
                    ),
                }
                last_status = task.status

            await asyncio.sleep(1)

        # Send final status
        yield {"event": "completed", "data": json.dumps(task.dict())}

    async def start(self):
        """Start the A2A agent server with enhanced MCP integration."""
        # Register skills
        skills = self.register_skills()
        for skill in skills:
            self.add_skill(skill)

        # Initialize MCP integration
        if hasattr(self, "mcp"):
            # Register A2A skills as MCP tools for hybrid interoperability
            for skill in skills:
                self.mcp.register_a2a_skill_as_mcp_tool(skill, self.base_url)

            # Expose this agent as an MCP server (skills available as MCP tools)
            await self.mcp.expose_as_mcp_server(self)

        logger.info(
            "Starting A2A agent with MCP integration",
            name=self.name,
            port=self.port,
            skills=len(skills),
            mcp_enabled=hasattr(self, "mcp"),
        )

        # Start background cleanup task
        asyncio.create_task(self._cleanup_loop())

    async def _cleanup_loop(self):
        """Background task cleanup loop."""
        while True:
            await asyncio.sleep(3600)  # Run every hour
            self.task_manager.cleanup_completed_tasks()


class MCPIntegration:
    """Enhanced MCP client integration for A2A agents following A2A+MCP hybrid architecture."""

    def __init__(self):
        self.mcp_clients: Dict[str, Any] = {}
        self.tool_registry: Dict[str, Dict[str, Any]] = {}
        self.resource_registry: Dict[str, Dict[str, Any]] = {}

    async def register_mcp_client(self, name: str, server_url: str):
        """Register an MCP client for database/tool access."""
        try:
            # Create HTTP client for MCP server communication
            client = httpx.AsyncClient(base_url=server_url, timeout=30.0)

            # Test connection with a simple health check
            try:
                response = await client.get("/health")
                if response.status_code == 200:
                    self.mcp_clients[name] = {
                        "url": server_url,
                        "client": client,
                        "connected": True,
                        "capabilities": await self._get_mcp_capabilities(client),
                    }
                    logger.info("Registered MCP client", name=name, url=server_url)
                else:
                    raise Exception(f"Health check failed: {response.status_code}")
            except Exception as e:
                logger.warning(
                    "MCP client connection failed, registering as offline",
                    name=name,
                    error=str(e),
                )
                self.mcp_clients[name] = {
                    "url": server_url,
                    "client": client,
                    "connected": False,
                    "capabilities": {},
                }

        except Exception as e:
            logger.error("Failed to register MCP client", name=name, error=str(e))

    async def _get_mcp_capabilities(self, client: httpx.AsyncClient) -> Dict[str, Any]:
        """Get MCP server capabilities and available tools/resources."""
        try:
            # Try to get MCP server capabilities
            response = await client.post("/mcp/capabilities")
            if response.status_code == 200:
                return response.json()
        except Exception:
            pass

        return {"tools": [], "resources": []}

    async def call_mcp_tool(
        self, client_name: str, tool_name: str, params: Dict[str, Any]
    ) -> Any:
        """Call MCP tool through registered client."""
        if client_name not in self.mcp_clients:
            raise ValueError(f"MCP client '{client_name}' not registered")

        client_info = self.mcp_clients[client_name]
        if not client_info["connected"]:
            raise Exception(f"MCP client '{client_name}' is not connected")

        client = client_info["client"]

        try:
            # MCP tool call via JSON-RPC
            mcp_request = {
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {"name": tool_name, "arguments": params},
                "id": str(uuid.uuid4()),
            }

            response = await client.post("/mcp/jsonrpc", json=mcp_request)
            if response.status_code == 200:
                result = response.json()
                if "error" in result:
                    raise Exception(f"MCP tool error: {result['error']}")

                logger.info(
                    "Called MCP tool",
                    client=client_name,
                    tool=tool_name,
                    params=params,
                    success=True,
                )
                return result.get("result", {})
            else:
                raise Exception(f"HTTP error: {response.status_code}")

        except Exception as e:
            logger.error(
                "MCP tool call failed", client=client_name, tool=tool_name, error=str(e)
            )
            raise

    async def query_mcp_resource(self, client_name: str, resource_uri: str) -> Any:
        """Query MCP resource through registered client."""
        if client_name not in self.mcp_clients:
            raise ValueError(f"MCP client '{client_name}' not registered")

        client_info = self.mcp_clients[client_name]
        if not client_info["connected"]:
            raise Exception(f"MCP client '{client_name}' is not connected")

        client = client_info["client"]

        try:
            mcp_request = {
                "jsonrpc": "2.0",
                "method": "resources/read",
                "params": {"uri": resource_uri},
                "id": str(uuid.uuid4()),
            }

            response = await client.post("/mcp/jsonrpc", json=mcp_request)
            if response.status_code == 200:
                result = response.json()
                if "error" in result:
                    raise Exception(f"MCP resource error: {result['error']}")

                logger.info(
                    "Queried MCP resource",
                    client=client_name,
                    resource=resource_uri,
                    success=True,
                )
                return result.get("result", {})
            else:
                raise Exception(f"HTTP error: {response.status_code}")

        except Exception as e:
            logger.error(
                "MCP resource query failed",
                client=client_name,
                resource=resource_uri,
                error=str(e),
            )
            raise

    def register_a2a_skill_as_mcp_tool(self, skill: A2ASkill, agent_base_url: str):
        """Register an A2A skill as an MCP tool for cross-protocol interoperability."""
        tool_definition = {
            "name": f"a2a_{skill.id}",
            "description": skill.description,
            "inputSchema": {
                "type": "object",
                "properties": skill.parameters or {},
                "additionalProperties": True,
            },
            "agent_url": agent_base_url,
            "skill_id": skill.id,
            "examples": skill.examples,
            "tags": skill.tags + ["a2a-agent"],
        }

        self.tool_registry[skill.id] = tool_definition
        logger.info(
            "Registered A2A skill as MCP tool",
            skill_id=skill.id,
            tool_name=f"a2a_{skill.id}",
        )

    def get_mcp_tool_list(self) -> List[Dict[str, Any]]:
        """Get list of available MCP tools including A2A skills."""
        return list(self.tool_registry.values())

    async def call_a2a_skill_via_mcp(
        self, skill_id: str, arguments: Dict[str, Any]
    ) -> Any:
        """Call an A2A skill that was registered as an MCP tool."""
        if skill_id not in self.tool_registry:
            raise ValueError(f"A2A skill '{skill_id}' not registered as MCP tool")

        tool_def = self.tool_registry[skill_id]
        agent_url = tool_def["agent_url"]

        try:
            async with httpx.AsyncClient() as client:
                # Call A2A agent via JSON-RPC
                a2a_request = {
                    "jsonrpc": "2.0",
                    "method": "tasks/send",
                    "params": {
                        "skill_id": skill_id,
                        "input": {"data": arguments, "mode": "data"},
                    },
                    "id": str(uuid.uuid4()),
                }

                response = await client.post(f"{agent_url}/jsonrpc", json=a2a_request)
                if response.status_code == 200:
                    result = response.json()
                    if "error" in result:
                        raise Exception(f"A2A agent error: {result['error']}")

                    task_id = result["result"]["task_id"]

                    # Poll for completion (simplified approach)
                    for _ in range(30):  # Max 30 seconds
                        get_request = {
                            "jsonrpc": "2.0",
                            "method": "tasks/get",
                            "params": {"task_id": task_id},
                            "id": str(uuid.uuid4()),
                        }

                        task_response = await client.post(
                            f"{agent_url}/jsonrpc", json=get_request
                        )
                        if task_response.status_code == 200:
                            task_result = task_response.json()
                            task_data = task_result.get("result", {})

                            if task_data.get("status") == "completed":
                                return task_data.get("output", {})
                            elif task_data.get("status") == "failed":
                                raise Exception(
                                    f"A2A task failed: {task_data.get('error')}"
                                )

                        await asyncio.sleep(1)

                    raise Exception("A2A task timeout")
                else:
                    raise Exception(f"HTTP error: {response.status_code}")

        except Exception as e:
            logger.error(
                "A2A skill call via MCP failed", skill_id=skill_id, error=str(e)
            )
            raise

    async def expose_as_mcp_server(self, agent: "A2AAgent", port: int = None):
        """Expose A2A agent skills as MCP server endpoints."""
        if port is None:
            port = agent.port + 1000  # Offset MCP port from A2A port

        # Add MCP-specific routes to the agent's FastAPI app
        @agent.app.post("/mcp/jsonrpc")
        async def mcp_jsonrpc_endpoint(request: dict):
            """MCP JSON-RPC endpoint exposing A2A skills as tools."""
            try:
                method = request.get("method")
                params = request.get("params", {})
                request_id = request.get("id")

                if method == "tools/list":
                    tools = []
                    for skill in agent.skills.values():
                        tools.append(
                            {
                                "name": f"a2a_{skill.id}",
                                "description": skill.description,
                                "inputSchema": {
                                    "type": "object",
                                    "properties": skill.parameters or {},
                                    "additionalProperties": True,
                                },
                            }
                        )

                    return {
                        "jsonrpc": "2.0",
                        "result": {"tools": tools},
                        "id": request_id,
                    }

                elif method == "tools/call":
                    tool_name = params.get("name", "")
                    if tool_name.startswith("a2a_"):
                        skill_id = tool_name[4:]  # Remove "a2a_" prefix

                        if skill_id in agent.skills:
                            # Create A2A task for the skill
                            task_input = A2ATaskInput(
                                data=params.get("arguments", {}), mode=InputMode.DATA
                            )
                            task = agent.task_manager.create_task(skill_id, task_input)

                            # Execute skill synchronously for MCP
                            try:
                                output = await agent.execute_skill(skill_id, task)
                                agent.task_manager.update_task_status(
                                    task.id, TaskStatus.COMPLETED, output=output
                                )

                                return {
                                    "jsonrpc": "2.0",
                                    "result": {
                                        "content": [
                                            {
                                                "type": "text",
                                                "text": output.text or str(output.data),
                                            }
                                        ]
                                    },
                                    "id": request_id,
                                }
                            except Exception as e:
                                agent.task_manager.update_task_status(
                                    task.id, TaskStatus.FAILED, error=str(e)
                                )
                                raise
                        else:
                            raise ValueError(f"Skill '{skill_id}' not found")
                    else:
                        raise ValueError(f"Unknown tool: {tool_name}")

                else:
                    return {
                        "jsonrpc": "2.0",
                        "error": {"code": -32601, "message": "Method not found"},
                        "id": request_id,
                    }

            except Exception as e:
                logger.error(
                    "MCP endpoint error", error=str(e), method=request.get("method")
                )
                return {
                    "jsonrpc": "2.0",
                    "error": {"code": -32603, "message": str(e)},
                    "id": request.get("id"),
                }

        @agent.app.get("/mcp/capabilities")
        async def mcp_capabilities():
            """MCP server capabilities."""
            return {
                "capabilities": {
                    "tools": {"list": True, "call": True},
                    "resources": {"read": False},
                    "prompts": {"list": False},
                },
                "serverInfo": {
                    "name": f"StockPulse {agent.name} MCP Adapter",
                    "version": agent.version,
                },
            }

        logger.info(
            "Exposed A2A agent as MCP server",
            agent=agent.name,
            mcp_port=port,
            skills=len(agent.skills),
        )

    async def close_all(self):
        """Close all MCP connections."""
        for name, client_info in self.mcp_clients.items():
            if client_info.get("client"):
                try:
                    await client_info["client"].aclose()
                    logger.info("Closed MCP client", name=name)
                except Exception as e:
                    logger.warning("Error closing MCP client", name=name, error=str(e))
        self.mcp_clients.clear()
        self.tool_registry.clear()
        self.resource_registry.clear()
