#!/usr/bin/env python3
"""
StockPulse MCP Registry Server

Simple registry service for MCP server discovery and health monitoring.
"""

import asyncio
import json
import os
from typing import Dict, List, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import structlog

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Configuration
REGISTRY_PORT = int(os.getenv("REGISTRY_PORT", "8001"))
REGISTRY_HOST = os.getenv("REGISTRY_HOST", "0.0.0.0")

# Models
class MCPServerInfo(BaseModel):
    name: str
    host: str
    port: int
    url: str
    status: str = "unknown"
    capabilities: List[str] = []
    last_heartbeat: Optional[datetime] = None
    metadata: Dict = {}

class RegistryStats(BaseModel):
    total_servers: int
    healthy_servers: int
    unhealthy_servers: int
    unknown_servers: int

# FastAPI app
app = FastAPI(
    title="StockPulse MCP Registry",
    description="Registry service for MCP server discovery",
    version="1.0.0"
)

# In-memory registry storage
mcp_servers: Dict[str, MCPServerInfo] = {}

@app.on_event("startup")
async def startup():
    """Initialize registry with known MCP servers."""
    logger.info("Starting MCP Registry", port=REGISTRY_PORT)
    
    # Register known MCP servers
    known_servers = [
        {"name": "stockpulse-auth", "host": "mcp-auth-server", "port": 8002},
        {"name": "stockpulse-postgres", "host": "mcp-postgres-server", "port": 8003},
        {"name": "stockpulse-timescale", "host": "mcp-timescale-server", "port": 8004},
        {"name": "stockpulse-redis", "host": "mcp-redis-server", "port": 8005},
        {"name": "stockpulse-graphiti", "host": "mcp-graphiti-server", "port": 8006},
        {"name": "stockpulse-qdrant", "host": "mcp-qdrant-server", "port": 8007},
    ]
    
    for server_config in known_servers:
        server_info = MCPServerInfo(
            name=server_config["name"],
            host=server_config["host"],
            port=server_config["port"],
            url=f"http://{server_config['host']}:{server_config['port']}"
        )
        mcp_servers[server_info.name] = server_info
        logger.info("Registered MCP server", name=server_info.name, url=server_info.url)

@app.get("/")
async def root():
    """Root endpoint with registry information."""
    return {
        "service": "StockPulse MCP Registry",
        "version": "1.0.0",
        "registered_servers": len(mcp_servers),
        "endpoints": {
            "servers": "/servers",
            "health": "/health",
            "stats": "/stats"
        }
    }

@app.get("/servers")
async def list_servers():
    """List all registered MCP servers."""
    return {
        "servers": list(mcp_servers.values()),
        "total": len(mcp_servers),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/servers/{server_name}")
async def get_server(server_name: str):
    """Get specific MCP server information."""
    if server_name not in mcp_servers:
        raise HTTPException(status_code=404, detail=f"Server '{server_name}' not found")
    
    return mcp_servers[server_name]

@app.post("/servers/register")
async def register_server(server_info: MCPServerInfo):
    """Register a new MCP server."""
    server_info.last_heartbeat = datetime.utcnow()
    mcp_servers[server_info.name] = server_info
    
    logger.info("MCP server registered", name=server_info.name, url=server_info.url)
    
    return {
        "status": "registered",
        "server_name": server_info.name,
        "timestamp": server_info.last_heartbeat.isoformat()
    }

@app.delete("/servers/{server_name}")
async def unregister_server(server_name: str):
    """Unregister an MCP server."""
    if server_name not in mcp_servers:
        raise HTTPException(status_code=404, detail=f"Server '{server_name}' not found")
    
    del mcp_servers[server_name]
    logger.info("MCP server unregistered", name=server_name)
    
    return {
        "status": "unregistered",
        "server_name": server_name,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/servers/{server_name}/heartbeat")
async def server_heartbeat(server_name: str):
    """Receive heartbeat from MCP server."""
    if server_name not in mcp_servers:
        raise HTTPException(status_code=404, detail=f"Server '{server_name}' not found")
    
    mcp_servers[server_name].last_heartbeat = datetime.utcnow()
    mcp_servers[server_name].status = "healthy"
    
    return {
        "status": "heartbeat_received",
        "server_name": server_name,
        "timestamp": mcp_servers[server_name].last_heartbeat.isoformat()
    }

@app.get("/health")
async def health_check():
    """Registry health check."""
    return {
        "status": "healthy",
        "service": "mcp-registry",
        "registered_servers": len(mcp_servers),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/stats")
async def get_stats():
    """Get registry statistics."""
    total = len(mcp_servers)
    healthy = sum(1 for server in mcp_servers.values() if server.status == "healthy")
    unhealthy = sum(1 for server in mcp_servers.values() if server.status == "unhealthy")
    unknown = total - healthy - unhealthy
    
    return RegistryStats(
        total_servers=total,
        healthy_servers=healthy,
        unhealthy_servers=unhealthy,
        unknown_servers=unknown
    )

@app.get("/discovery")
async def discovery_endpoint():
    """MCP service discovery endpoint."""
    return {
        "registry_url": f"http://{REGISTRY_HOST}:{REGISTRY_PORT}",
        "available_servers": [
            {
                "name": server.name,
                "url": server.url,
                "status": server.status,
                "capabilities": server.capabilities
            }
            for server in mcp_servers.values()
        ],
        "protocol_version": "MCP-1.0",
        "features": ["server_discovery", "health_monitoring", "capability_catalog"]
    }

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=REGISTRY_HOST,
        port=REGISTRY_PORT,
        log_level="info"
    ) 