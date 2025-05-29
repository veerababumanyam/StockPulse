# StockPulse MCP (Model Context Protocol) Architecture

This directory contains the MCP (Model Context Protocol) servers that provide a standardized interface for AI agents to interact with all StockPulse databases and services.

## 🏗️ **Architecture Overview**

The MCP layer creates a unified, type-safe interface for AI agents to access:

- **Authentication** services (login, sessions, user management)
- **PostgreSQL** database (portfolios, trades, user data)
- **TimescaleDB** (historical market data, time-series analytics)
- **Redis** (caching, real-time data, notifications)
- **Graphiti/Neo4j** (knowledge graphs, RAG capabilities)
- **Qdrant** (vector storage, semantic search)

## 📁 **Directory Structure**

```
mcp-servers/
├── auth-server/           # Authentication MCP server
├── postgres-server/       # PostgreSQL MCP server
├── redis-server/         # Redis MCP server
├── timescale-server/     # TimescaleDB MCP server
├── graphiti-server/      # Graphiti/Neo4j MCP server
├── qdrant-server/        # Qdrant vector MCP server
├── registry/             # MCP server discovery service
├── docker-compose.mcp.yml # MCP servers orchestration
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## 🚀 **Quick Start**

### Prerequisites

1. **Main StockPulse databases running** (PostgreSQL, Redis, TimescaleDB, Neo4j, Qdrant)
2. **Docker and Docker Compose installed**
3. **Python 3.11+ with pip**

### 1. Install Dependencies

```bash
cd mcp-servers
pip install -r requirements.txt
```

### 2. Environment Setup

Copy environment variables from the main backend:

```bash
cp ../services/backend/.env .env
```

### 3. Build and Run MCP Servers

```bash
# Build all MCP server images
docker-compose -f docker-compose.mcp.yml build

# Start all MCP servers
docker-compose -f docker-compose.mcp.yml up -d

# Check status
docker-compose -f docker-compose.mcp.yml ps
```

### 4. Verify MCP Registry

```bash
# Check MCP server registry
curl http://localhost:8001/servers

# Check available tools
curl http://localhost:8001/tools
```

## 🛠️ **Available MCP Servers**

### 1. **Authentication Server** (`mcp-auth-server`)

**Port:** Internal only
**Purpose:** User authentication and session management

**Available Tools:**

- `authenticate_user` - Login with email/password
- `validate_token` - JWT token validation
- `create_user` - New user registration
- `get_user_profile` - Retrieve user information
- `update_user_profile` - Update user data
- `invalidate_session` - Logout functionality
- `get_user_sessions` - Active session management

**Example Usage:**

```python
# Authenticate user
await mcp_client.call_tool("authenticate_user", {
    "email": "user@example.com",
    "password": "secure_password"
})
```

### 2. **PostgreSQL Server** (`mcp-postgres-server`)

**Port:** Internal only
**Purpose:** Relational data operations

**Available Tools:**

- `execute_query` - Safe SELECT query execution
- `get_user_portfolios` - Portfolio information
- `get_user_trades` - Trading history
- `get_user_watchlist` - Watchlist management
- `add_to_watchlist` - Add symbols to watch
- `get_portfolio_performance` - Performance metrics
- `get_database_schema` - Schema introspection
- `get_table_stats` - Database statistics

**Example Usage:**

```python
# Get user portfolios
await mcp_client.call_tool("get_user_portfolios", {
    "user_id": "user_123"
})

# Safe SQL query execution
await mcp_client.call_tool("execute_query", {
    "query": "SELECT symbol, quantity FROM portfolios WHERE user_id = $1",
    "parameters": ["user_123"]
})
```

### 3. **TimescaleDB Server** (`mcp-timescale-server`)

**Port:** Internal only
**Purpose:** Time-series data and market analytics

**Available Tools:**

- `get_stock_prices` - Historical price data
- `get_real_time_prices` - Current market prices
- `get_technical_indicators` - SMA, RSI, MACD, Bollinger Bands
- `get_trading_signals` - Buy/sell/hold signals
- `get_market_volatility` - Volatility analysis
- `get_options_data` - Options chain information
- `get_portfolio_performance_timeseries` - Performance over time
- `get_market_correlation` - Symbol correlation analysis
- `aggregate_market_data` - Continuous aggregates

**Example Usage:**

```python
# Get stock price history
await mcp_client.call_tool("get_stock_prices", {
    "symbol": "AAPL",
    "start_date": "2025-01-01",
    "end_date": "2025-05-29",
    "interval": "1d"
})

# Get technical indicators
await mcp_client.call_tool("get_technical_indicators", {
    "symbol": "AAPL",
    "indicators": ["sma", "rsi", "macd"],
    "period": "30d"
})
```

### 4. **Redis Server** (`mcp-redis-server`)

**Port:** Internal only
**Purpose:** Caching and real-time operations

**Available Tools:**

- `cache_set/get/delete/exists` - Cache operations
- `session_set/get/delete` - Session management
- `real_time_price_set/get` - Live price data
- `user_alerts_set/get` - Price alerts management
- `market_status_set/get` - Market open/close status
- `publish_notification` - Real-time notifications
- `get_redis_info` - Server statistics

**Example Usage:**

```python
# Cache stock data
await mcp_client.call_tool("cache_set", {
    "key": "stock:AAPL:price",
    "value": "175.50",
    "ttl_seconds": 60
})

# Set price alert
await mcp_client.call_tool("user_alerts_set", {
    "user_id": "user_123",
    "symbol": "AAPL",
    "alert_type": "above",
    "target_price": 180.0
})
```

### 5. **Graphiti Server** (`mcp-graphiti-server`)

**Port:** Internal only
**Purpose:** Knowledge graph and RAG operations

**Available Tools:**

- `add_financial_news` - News ingestion
- `add_company_filing` - SEC filing processing
- `add_user_interaction` - Behavior tracking
- `search_knowledge` - Hybrid semantic search
- `get_related_entities` - Relationship discovery
- `get_knowledge_groups` - Available data categories
- `health_check` - Service status

**Example Usage:**

```python
# Add financial news
await mcp_client.call_tool("add_financial_news", {
    "title": "Apple Reports Strong Q1 Earnings",
    "content": "Apple Inc. reported...",
    "source": "Reuters",
    "symbols": ["AAPL"],
    "published_at": "2025-05-29T15:30:00Z"
})

# Search knowledge graph
await mcp_client.call_tool("search_knowledge", {
    "query": "Apple earnings impact on stock price",
    "group_id": "financial_news",
    "limit": 10
})
```

### 6. **Qdrant Server** (`mcp-qdrant-server`)

**Port:** Internal only
**Purpose:** Vector database operations

**Available Tools:**

- `create_collection` - Vector collection management
- `insert_vectors` - Document embedding storage
- `search_similar` - Semantic similarity search
- `delete_vectors` - Vector cleanup
- `get_collection_info` - Collection statistics

### 7. **Registry Service** (`mcp-registry`)

**Port:** 8001
**Purpose:** Service discovery and health monitoring

**API Endpoints:**

- `GET /servers` - List all registered MCP servers
- `GET /tools` - List all available tools across servers
- `GET /health` - Overall system health
- `GET /metrics` - Performance metrics

## 🔧 **Development Workflow**

### Running Individual Servers

```bash
# Run specific MCP server for development
cd auth-server
python server.py

# Run with debug logging
DEBUG=1 python server.py
```

### Testing MCP Tools

```python
import asyncio
from mcp import Client

async def test_mcp_tool():
    # Connect to MCP server
    async with Client("stockpulse-postgres") as client:
        # List available tools
        tools = await client.list_tools()
        print("Available tools:", [tool.name for tool in tools])

        # Call a tool
        result = await client.call_tool("get_user_portfolios", {
            "user_id": "test_user"
        })
        print("Result:", result)

# Run test
asyncio.run(test_mcp_tool())
```

### Adding New Tools

1. **Define the tool** in the appropriate MCP server's `@server.list_tools()` function
2. **Implement the tool handler** in `@server.call_tool()`
3. **Create the tool implementation function**
4. **Update documentation** and tests

Example:

```python
# In server.py
Tool(
    name="new_financial_tool",
    description="Description of what this tool does",
    inputSchema={
        "type": "object",
        "properties": {
            "param1": {"type": "string", "description": "Parameter description"}
        },
        "required": ["param1"]
    }
)

# Tool implementation
async def new_financial_tool(args: Dict[str, Any]) -> List[types.TextContent]:
    param1 = args["param1"]
    # Implementation logic here
    return [types.TextContent(type="text", text=f"Result: {result}")]
```

## 🏗️ **Docker Configuration**

Each MCP server has its own Dockerfile:

```dockerfile
# Example Dockerfile structure
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "server.py"]
```

### Building Individual Images

```bash
# Build specific server
docker build -t stockpulse-mcp-auth ./auth-server

# Build all servers
docker-compose -f docker-compose.mcp.yml build
```

## 📊 **Monitoring and Logs**

### View MCP Server Logs

```bash
# All servers
docker-compose -f docker-compose.mcp.yml logs -f

# Specific server
docker-compose -f docker-compose.mcp.yml logs -f mcp-auth-server

# Registry service
docker-compose -f docker-compose.mcp.yml logs -f mcp-registry
```

### Health Checks

```bash
# Check all server health via registry
curl http://localhost:8001/health

# Individual server health (if available)
curl http://localhost:8001/servers/stockpulse-postgres/health
```

## 🔒 **Security Considerations**

1. **Network Isolation:** MCP servers run in isolated Docker network
2. **No Direct Database Access:** All database operations go through MCP layer
3. **Input Validation:** All tool inputs are validated via JSON schema
4. **Audit Logging:** All tool calls are logged for security auditing
5. **Rate Limiting:** Built-in rate limiting for tool calls
6. **Authentication:** Integration with StockPulse authentication system

## 🚨 **Troubleshooting**

### Common Issues

1. **Server Won't Start**

   ```bash
   # Check logs
   docker-compose -f docker-compose.mcp.yml logs mcp-auth-server

   # Check network connectivity
   docker network ls | grep stockpulse
   ```

2. **Database Connection Errors**

   ```bash
   # Verify main databases are running
   docker-compose ps

   # Check database URLs in environment
   docker-compose -f docker-compose.mcp.yml exec mcp-postgres-server env | grep DATABASE_URL
   ```

3. **Tool Call Failures**

   ```bash
   # Check registry for available tools
   curl http://localhost:8001/tools

   # Verify tool schema
   curl http://localhost:8001/servers/stockpulse-postgres/tools
   ```

### Performance Optimization

1. **Connection Pooling:** Each MCP server maintains database connection pools
2. **Caching:** Frequently accessed data cached in Redis
3. **Async Operations:** All database operations are asynchronous
4. **Batching:** Support for batch operations where applicable

## 📈 **Scaling MCP Servers**

### Horizontal Scaling

```bash
# Scale specific MCP server
docker-compose -f docker-compose.mcp.yml up -d --scale mcp-postgres-server=3

# Load balancing handled by registry service
```

### Performance Monitoring

- **Metrics:** Exported to Prometheus via registry service
- **Tracing:** Distributed tracing support for complex operations
- **Alerting:** Integration with monitoring stack

## 🔗 **Integration with AI Agents**

MCP servers are designed to be consumed by AI agents:

```python
# Example AI agent using MCP tools
class TradingAgent:
    def __init__(self, mcp_client):
        self.mcp = mcp_client

    async def analyze_portfolio(self, user_id: str):
        # Get portfolio data via MCP
        portfolios = await self.mcp.call_tool("get_user_portfolios", {
            "user_id": user_id
        })

        # Get market data via MCP
        for portfolio in portfolios:
            prices = await self.mcp.call_tool("get_real_time_prices", {
                "symbols": portfolio["symbols"]
            })

        # Perform analysis using knowledge graph
        insights = await self.mcp.call_tool("search_knowledge", {
            "query": f"market analysis for {portfolio['symbols']}",
            "group_id": "market_analysis"
        })

        return analysis_result
```

## 📚 **Additional Resources**

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Graphiti Documentation](https://github.com/getzep/graphiti)
- [StockPulse Infrastructure Design](../docs/infrastructure_design.md)
- [FastAPI Backend Documentation](../services/backend/README.md)

---

**Ready to build AI-powered financial intelligence with standardized database access! 🚀**
