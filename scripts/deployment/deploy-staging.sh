#!/bin/bash

# StockPulse Staging Deployment Script
# =====================================

set -e  # Exit on any error

echo "🚀 Starting StockPulse Staging Deployment..."

# Configuration
STAGING_COMPOSE_FILE="docker-compose.staging.yml"
PROJECT_NAME="stockpulse-staging"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi

    if [ ! -f "$STAGING_COMPOSE_FILE" ]; then
        log_error "Staging compose file not found: $STAGING_COMPOSE_FILE"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Cleanup previous deployment
cleanup_previous() {
    log_info "Cleaning up previous staging deployment..."

    # Stop and remove containers
    docker-compose -f "$STAGING_COMPOSE_FILE" -p "$PROJECT_NAME" down --remove-orphans || true

    # Remove unused images and volumes (optional)
    # docker system prune -f

    log_success "Cleanup completed"
}

# Build and deploy
deploy() {
    log_info "Building and deploying staging environment..."

    # Build images
    log_info "Building application images..."
    docker-compose -f "$STAGING_COMPOSE_FILE" -p "$PROJECT_NAME" build --no-cache

    # Start services
    log_info "Starting services..."
    docker-compose -f "$STAGING_COMPOSE_FILE" -p "$PROJECT_NAME" up -d

    # Wait for services to be healthy
    log_info "Waiting for services to become healthy..."
    sleep 30

    log_success "Deployment completed"
}

# Health checks
run_health_checks() {
    log_info "Running health checks..."

    # Check MCP Auth Server
    if curl -f http://localhost:8002/health &> /dev/null; then
        log_success "MCP Auth Server is healthy"
    else
        log_error "MCP Auth Server health check failed"
        return 1
    fi

    # Check MCP Registry
    if curl -f http://localhost:8001/health &> /dev/null; then
        log_success "MCP Registry is healthy"
    else
        log_warning "MCP Registry health check failed (may be expected)"
    fi

    # Check Database
    if docker exec stockpulse-postgres-staging pg_isready -U stockpulse_user -d stockpulse &> /dev/null; then
        log_success "Database is healthy"
    else
        log_error "Database health check failed"
        return 1
    fi

    # Check Redis
    if docker exec stockpulse-redis-staging redis-cli -a stockpulse_redis_password ping &> /dev/null; then
        log_success "Redis is healthy"
    else
        log_error "Redis health check failed"
        return 1
    fi

    log_success "All health checks passed"
}

# Display deployment info
show_deployment_info() {
    log_success "Staging deployment is ready!"
    echo ""
    echo "📋 Service URLs:"
    echo "   Frontend:       http://localhost:3000"
    echo "   Backend API:    http://localhost:8000"
    echo "   MCP Auth:       http://localhost:8002"
    echo "   MCP Registry:   http://localhost:8001"
    echo "   Traefik Dashboard: http://localhost:8080"
    echo ""
    echo "🗄️  Database Connections:"
    echo "   PostgreSQL:     localhost:5432"
    echo "   Redis:          localhost:6379"
    echo ""
    echo "📊 Monitoring:"
    echo "   Logs:          docker-compose -f $STAGING_COMPOSE_FILE logs -f"
    echo "   Status:        docker-compose -f $STAGING_COMPOSE_FILE ps"
    echo ""
    echo "🧪 Test Users:"
    echo "   Email: testuser@example.com"
    echo "   Password: Password123!"
    echo ""
    echo "🛑 To stop:"
    echo "   ./scripts/stop-staging.sh"
    echo ""
}

# Create test data
setup_test_data() {
    log_info "Setting up test data..."

    # Wait a bit more for services to fully initialize
    sleep 10

    # Test authentication endpoint
    if curl -X POST http://localhost:8002/tools/call \
        -H "Content-Type: application/json" \
        -d '{
            "tool": "authenticate_user",
            "parameters": {
                "email": "testuser@example.com",
                "password": "Password123!"
            }
        }' &> /dev/null; then
        log_success "Test authentication successful"
    else
        log_warning "Test authentication failed (may need manual verification)"
    fi
}

# Main execution
main() {
    echo ""
    echo "🏗️  StockPulse Staging Deployment"
    echo "=================================="
    echo ""

    check_prerequisites
    cleanup_previous
    deploy
    run_health_checks
    setup_test_data
    show_deployment_info
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "health")
        run_health_checks
        ;;
    "info")
        show_deployment_info
        ;;
    "logs")
        docker-compose -f "$STAGING_COMPOSE_FILE" -p "$PROJECT_NAME" logs -f
        ;;
    "status")
        docker-compose -f "$STAGING_COMPOSE_FILE" -p "$PROJECT_NAME" ps
        ;;
    *)
        echo "Usage: $0 [deploy|health|info|logs|status]"
        echo ""
        echo "Commands:"
        echo "  deploy (default) - Full staging deployment"
        echo "  health          - Run health checks only"
        echo "  info           - Show deployment information"
        echo "  logs           - Follow deployment logs"
        echo "  status         - Show service status"
        exit 1
        ;;
esac
