# StockPulse Docker Infrastructure

## Overview

StockPulse uses a comprehensive Docker infrastructure with consolidated development services for backend systems while keeping the frontend running locally for optimal development experience.

## Docker Infrastructure Architecture

### Service Organization

- **Frontend**: Runs locally (Vite dev server on port 3000/5173)
- **Backend Services**: Containerized with docker-compose.dev.yml
- **Databases**: Containerized with persistent volumes
- **MCP Servers**: Individual containers for each service
- **A2A Agents**: Individual containers for each agent
- **Management Tools**: Web interfaces for database management

### Port Allocation Strategy

```
Frontend (Local):
  3000/5173   - React/Vite Development Server

Backend Services:
  8000        - FastAPI Backend
  8001-8007   - MCP Servers
  9000-9002   - A2A Agents

Databases:
  5432        - PostgreSQL
  5433        - TimescaleDB
  6379        - Redis
  7474/7687   - Neo4j (HTTP/Bolt)
  6333        - Qdrant Vector DB

Management:
  8081        - Adminer (Database Web UI)
  8082        - Redis Commander (Redis Web UI)
```

## Docker Compose Configuration

### Primary Development Configuration: docker-compose.dev.yml

```yaml
version: "3.8"

services:
  # Database Services
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: stockpulse
      POSTGRES_USER: stockpulse_user
      POSTGRES_PASSWORD: stockpulse_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U stockpulse_user -d stockpulse"]
      interval: 30s
      timeout: 10s
      retries: 3

  timescaledb:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_DB: stockpulse_timeseries
      POSTGRES_USER: timescale_user
      POSTGRES_PASSWORD: timescale_password
    ports:
      - "5433:5432"
    volumes:
      - timescale_data:/var/lib/postgresql/data
    healthcheck:
      test:
        ["CMD-SHELL", "pg_isready -U timescale_user -d stockpulse_timeseries"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  neo4j:
    image: neo4j:5.11
    environment:
      NEO4J_AUTH: neo4j/stockpulse_neo4j
      NEO4J_PLUGINS: '["apoc"]'
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - neo4j_data:/data
    healthcheck:
      test:
        [
          "CMD",
          "cypher-shell",
          "-u",
          "neo4j",
          "-p",
          "stockpulse_neo4j",
          "RETURN 1",
        ]
      interval: 30s
      timeout: 10s
      retries: 3

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend Service
  backend:
    build:
      context: ./services/backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://stockpulse_user:stockpulse_password@postgres:5432/stockpulse
      - TIMESCALE_URL=postgresql://timescale_user:timescale_password@timescaledb:5432/stockpulse_timeseries
      - REDIS_URL=redis://redis:6379
      - NEO4J_URL=bolt://neo4j:7687
      - NEO4J_AUTH=neo4j/stockpulse_neo4j
      - QDRANT_URL=http://qdrant:6333
    depends_on:
      postgres:
        condition: service_healthy
      timescaledb:
        condition: service_healthy
      redis:
        condition: service_healthy
      neo4j:
        condition: service_healthy
      qdrant:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # MCP Servers
  mcp-registry:
    build:
      context: ./mcp-servers/registry
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mcp-auth:
    build:
      context: ./mcp-servers/auth-server
      dockerfile: Dockerfile
    ports:
      - "8002:8002"
    environment:
      - DATABASE_URL=postgresql://stockpulse_user:stockpulse_password@postgres:5432/stockpulse
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mcp-postgres:
    build:
      context: ./mcp-servers/postgres-server
      dockerfile: Dockerfile
    ports:
      - "8003:8003"
    environment:
      - DATABASE_URL=postgresql://stockpulse_user:stockpulse_password@postgres:5432/stockpulse
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8003/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mcp-timescale:
    build:
      context: ./mcp-servers/timescale-server
      dockerfile: Dockerfile
    ports:
      - "8004:8004"
    environment:
      - TIMESCALE_URL=postgresql://timescale_user:timescale_password@timescaledb:5432/stockpulse_timeseries
    depends_on:
      timescaledb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8004/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mcp-redis:
    build:
      context: ./mcp-servers/redis-server
      dockerfile: Dockerfile
    ports:
      - "8005:8005"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8005/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mcp-graphiti:
    build:
      context: ./mcp-servers/graphiti-server
      dockerfile: Dockerfile
    ports:
      - "8006:8006"
    environment:
      - NEO4J_URL=bolt://neo4j:7687
      - NEO4J_AUTH=neo4j/stockpulse_neo4j
    depends_on:
      neo4j:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8006/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mcp-qdrant:
    build:
      context: ./mcp-servers/qdrant-server
      dockerfile: Dockerfile
    ports:
      - "8007:8007"
    environment:
      - QDRANT_URL=http://qdrant:6333
    depends_on:
      qdrant:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8007/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # A2A Agents
  a2a-registry:
    build:
      context: ./a2a-agents/registry
      dockerfile: Dockerfile
    ports:
      - "9000:9000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  a2a-user-assistant:
    build:
      context: ./a2a-agents/user-assistant
      dockerfile: Dockerfile
    ports:
      - "9001:9001"
    environment:
      - REDIS_URL=redis://redis:6379
      - MCP_AUTH_URL=http://mcp-auth:8002
      - MCP_POSTGRES_URL=http://mcp-postgres:8003
      - MCP_REDIS_URL=http://mcp-redis:8005
      - MCP_GRAPHITI_URL=http://mcp-graphiti:8006
    depends_on:
      redis:
        condition: service_healthy
      mcp-auth:
        condition: service_healthy
      mcp-redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  a2a-portfolio-manager:
    build:
      context: ./a2a-agents/portfolio-manager
      dockerfile: Dockerfile
    ports:
      - "9002:9002"
    environment:
      - MCP_POSTGRES_URL=http://mcp-postgres:8003
      - MCP_TIMESCALE_URL=http://mcp-timescale:8004
      - MCP_REDIS_URL=http://mcp-redis:8005
      - MCP_AUTH_URL=http://mcp-auth:8002
      - MCP_GRAPHITI_URL=http://mcp-graphiti:8006
    depends_on:
      mcp-postgres:
        condition: service_healthy
      mcp-timescale:
        condition: service_healthy
      mcp-redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Management Tools
  adminer:
    image: adminer:4.8.1
    ports:
      - "8081:8080"
    depends_on:
      - postgres
      - timescaledb

  redis-commander:
    image: rediscommander/redis-commander:latest
    environment:
      - REDIS_HOSTS=local:redis:6379
    ports:
      - "8082:8081"
    depends_on:
      - redis

volumes:
  postgres_data:
  timescale_data:
  redis_data:
  neo4j_data:
  qdrant_data:
```

## Service Dockerfiles

### Backend Service Dockerfile (services/backend/Dockerfile)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Set Python path
ENV PYTHONPATH=/app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### MCP Server Dockerfile Template

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set up shared modules access
ENV PYTHONPATH=/app:/app/shared

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "main.py"]
```

### A2A Agent Dockerfile Template

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared modules first
COPY ../shared/ ./shared/

# Copy agent code
COPY . .

# Set up Python path for shared modules
ENV PYTHONPATH=/app:/app/shared

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

CMD ["python", "main.py"]
```

## Development Workflow

### Starting the Environment

```bash
# Start all backend services (excludes frontend)
docker-compose -f docker-compose.dev.yml up -d

# Start frontend separately (in project root)
npm run dev
```

### Checking Service Health

```bash
# Check all service status
docker-compose -f docker-compose.dev.yml ps

# Check specific service logs
docker-compose -f docker-compose.dev.yml logs [service-name]

# Check health of all services
for port in 8000 8001 8002 8003 8004 8005 8006 8007 9000 9001 9002; do
  echo "Port $port: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health)"
done
```

### Service Management Commands

```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Rebuild specific service
docker-compose -f docker-compose.dev.yml build [service-name]
docker-compose -f docker-compose.dev.yml up -d [service-name]

# View logs with follow
docker-compose -f docker-compose.dev.yml logs -f [service-name]

# Access database directly
docker-compose -f docker-compose.dev.yml exec postgres psql -U stockpulse_user -d stockpulse
docker-compose -f docker-compose.dev.yml exec redis redis-cli
```

## Port Management

### Port Conflict Resolution Protocol

1. **Check what's using a port**: `netstat -tulpn | grep :PORT`
2. **Identify the process**: `ps aux | grep PROCESS_NAME`
3. **Determine legitimacy**: Check if it's a legitimate service or leftover process
4. **Kill conflicting process**: `kill -9 PID` if appropriate
5. **Start service**: Only after clearing conflicts

### Standard Port Assignments

```bash
# Frontend Development (Local)
3000/5173   - Vite Dev Server (npm run dev)

# Backend Services (Docker)
8000        - FastAPI Backend
8001        - MCP Registry
8002        - MCP Auth Server
8003        - MCP PostgreSQL Server
8004        - MCP TimescaleDB Server
8005        - MCP Redis Server
8006        - MCP Graphiti Server
8007        - MCP Qdrant Server

# A2A Agents (Docker)
9000        - A2A Registry Agent
9001        - A2A User Assistant Agent
9002        - A2A Portfolio Manager Agent

# Databases (Docker)
5432        - PostgreSQL
5433        - TimescaleDB
6379        - Redis
7474/7687   - Neo4j (HTTP/Bolt)
6333        - Qdrant Vector DB

# Management Tools (Docker)
8081        - Adminer (Database Web UI)
8082        - Redis Commander
```

## Volume Management

### Persistent Data Volumes

```bash
# List all volumes
docker volume ls

# Inspect volume details
docker volume inspect stockpulse_postgres_data

# Backup database volume
docker run --rm -v stockpulse_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup.tar.gz /data

# Restore database volume
docker run --rm -v stockpulse_postgres_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/postgres_backup.tar.gz -C /

# Clean up unused volumes
docker volume prune
```

### Data Persistence Strategy

- **PostgreSQL**: `/var/lib/postgresql/data` → `postgres_data` volume
- **TimescaleDB**: `/var/lib/postgresql/data` → `timescale_data` volume
- **Redis**: `/data` → `redis_data` volume
- **Neo4j**: `/data` → `neo4j_data` volume
- **Qdrant**: `/qdrant/storage` → `qdrant_data` volume

## Debugging and Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use

```bash
# Problem: Port conflict error
# Solution: Check and kill conflicting process
netstat -tulpn | grep :8000
kill -9 $(lsof -t -i:8000)
```

#### 2. Service Won't Start

```bash
# Check service dependencies
docker-compose -f docker-compose.dev.yml ps

# Check specific service logs
docker-compose -f docker-compose.dev.yml logs service-name

# Rebuild service if code changed
docker-compose -f docker-compose.dev.yml build service-name
docker-compose -f docker-compose.dev.yml up -d service-name
```

#### 3. Database Connection Issues

```bash
# Check database health
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U stockpulse_user

# Access database directly
docker-compose -f docker-compose.dev.yml exec postgres psql -U stockpulse_user -d stockpulse

# Check connection from service
docker-compose -f docker-compose.dev.yml exec backend python -c "
import asyncpg
import asyncio
async def test():
    conn = await asyncpg.connect('postgresql://stockpulse_user:stockpulse_password@postgres:5432/stockpulse')
    await conn.close()
    print('Connection successful')
asyncio.run(test())
"
```

#### 4. MCP/A2A Integration Issues

```bash
# Test MCP server connectivity
curl http://localhost:8003/health

# Test A2A agent health
curl http://localhost:9002/health

# Check A2A agent capabilities
curl http://localhost:9002/.well-known/agent.json

# Test MCP integration in A2A agent
curl http://localhost:9002/mcp/capabilities
```

### Logging and Monitoring

```bash
# View all service logs
docker-compose -f docker-compose.dev.yml logs

# Follow logs for specific service
docker-compose -f docker-compose.dev.yml logs -f a2a-portfolio-manager

# Check resource usage
docker stats

# Monitor health endpoints
while true; do
  for port in 8000 8001 8002 8003 8004 8005 8006 8007 9000 9001 9002; do
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health)
    echo "$(date): Port $port - $status"
  done
  sleep 30
done
```

## Production Deployment

### Production Configuration

```bash
# Use production compose file
docker-compose -f docker-compose.yml up -d

# Environment-specific overrides
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

### Security Considerations

- All services use non-root users in production
- Secrets managed via Docker secrets or external secret management
- Network isolation between service tiers
- TLS/SSL certificates for HTTPS endpoints
- Database credentials rotation strategy

### Scaling Strategy

```bash
# Scale specific services
docker-compose -f docker-compose.yml up -d --scale mcp-postgres=3

# Load balancing for stateless services
# (MCP servers, some A2A agents)

# Vertical scaling for stateful services
# (Databases, specific A2A agents)
```

## Maintenance Procedures

### Regular Maintenance Tasks

```bash
# Update all images
docker-compose -f docker-compose.dev.yml pull
docker-compose -f docker-compose.dev.yml up -d

# Clean up unused resources
docker system prune -a --volumes

# Backup all volumes
for volume in postgres_data timescale_data redis_data neo4j_data qdrant_data; do
  docker run --rm -v stockpulse_$volume:/data -v $(pwd)/backups:/backup ubuntu \
    tar czf /backup/${volume}_$(date +%Y%m%d).tar.gz /data
done

# Check disk usage
docker system df
```

### Health Monitoring Setup

```bash
# Create monitoring script
cat > health_monitor.sh << 'EOF'
#!/bin/bash
SERVICES=(8000 8001 8002 8003 8004 8005 8006 8007 9000 9001 9002)
for port in "${SERVICES[@]}"; do
  if ! curl -sf http://localhost:$port/health > /dev/null; then
    echo "Service on port $port is unhealthy" | logger
    # Add alerting logic here
  fi
done
EOF

# Add to crontab for regular health checks
echo "*/5 * * * * /path/to/health_monitor.sh" | crontab -
```

## Integration with Development Tools

### IDE Integration (Cursor/VS Code)

- Docker extension for container management
- Remote container development
- Integrated terminal for docker commands
- Service debugging through container attach

### Testing Integration

```bash
# Run tests against Docker services
export DATABASE_URL="postgresql://stockpulse_user:stockpulse_password@localhost:5432/stockpulse"
export REDIS_URL="redis://localhost:6379"
pytest tests/

# Integration tests with real services
pytest tests/story-1.2/integration/
```

This Docker infrastructure provides a robust, scalable development environment that closely mirrors production while maintaining development efficiency. The hybrid approach of containerized backend services with local frontend development offers the best of both worlds - consistency and performance.

🚀
