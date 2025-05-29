#!/bin/bash

# StockPulse Staging Stop Script
# ===============================

set -e  # Exit on any error

echo "🛑 Stopping StockPulse Staging Environment..."

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

# Main stop function
stop_staging() {
    log_info "Stopping staging services..."
    
    if [ -f "$STAGING_COMPOSE_FILE" ]; then
        # Stop and remove containers
        docker-compose -f "$STAGING_COMPOSE_FILE" -p "$PROJECT_NAME" down --remove-orphans
        log_success "Staging services stopped"
    else
        log_error "Staging compose file not found: $STAGING_COMPOSE_FILE"
        exit 1
    fi
}

# Cleanup function
cleanup_resources() {
    log_info "Cleaning up resources..."
    
    # Remove stopped containers
    docker container prune -f &> /dev/null || true
    
    # Remove unused networks
    docker network prune -f &> /dev/null || true
    
    log_success "Cleanup completed"
}

# Show final status
show_status() {
    echo ""
    log_success "Staging environment stopped"
    echo ""
    echo "📊 To check remaining containers:"
    echo "   docker ps -a | grep stockpulse"
    echo ""
    echo "🗄️  Database volumes preserved:"
    echo "   stockpulse-postgres-staging-data"
    echo "   stockpulse-redis-staging-data"
    echo ""
    echo "🚀 To restart:"
    echo "   ./scripts/deploy-staging.sh"
    echo ""
}

# Handle script arguments
case "${1:-stop}" in
    "stop")
        stop_staging
        cleanup_resources
        show_status
        ;;
    "full")
        log_warning "Performing full cleanup (including volumes)..."
        stop_staging
        
        # Remove volumes
        docker volume rm stockpulse-postgres-staging-data 2>/dev/null || true
        docker volume rm stockpulse-redis-staging-data 2>/dev/null || true
        
        cleanup_resources
        log_success "Full cleanup completed (including database volumes)"
        ;;
    *)
        echo "Usage: $0 [stop|full]"
        echo ""
        echo "Commands:"
        echo "  stop (default) - Stop services but preserve data volumes"
        echo "  full          - Stop services and remove all data volumes"
        exit 1
        ;;
esac 