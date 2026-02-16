#!/bin/bash

# Quick Start Script for Creative Writing Portfolio
# This script helps you get up and running in seconds!

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║   Creative Writing Portfolio - Quick Start   ║"
echo "╔═══════════════════════════════════════════════╗"
echo -e "${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo ""
    echo "Please install Docker Desktop from:"
    echo "https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo ""
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed and running${NC}"
echo ""

# Check if docker-compose exists
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Note: Using 'docker compose' instead of 'docker-compose'${NC}"
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Stop any existing containers
echo -e "${YELLOW}Stopping any existing containers...${NC}"
$COMPOSE_CMD down 2>/dev/null || true
echo ""

# Build and start containers
echo -e "${YELLOW}Building and starting containers...${NC}"
echo "This may take a minute on first run..."
echo ""

$COMPOSE_CMD up -d --build

# Wait for backend to be ready
echo ""
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 5

# Check if backend is responding
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 1
done

echo ""
echo ""

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Backend did not start properly${NC}"
    echo ""
    echo "Check the logs with:"
    echo "  docker-compose logs backend"
    exit 1
fi

# Success!
echo -e "${GREEN}✓ Everything is running!${NC}"
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║             🎉 Ready to Use! 🎉              ║${NC}"
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${GREEN}📝 Your writing portfolio:${NC}"
echo "   http://localhost:3000/writing-portfolio.html"
echo ""
echo -e "${GREEN}🔐 Admin panel login:${NC}"
echo "   Click 'admin' link in the corner"
echo "   Username: admin"
echo "   Password: writing123"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "   Stop:     docker-compose down"
echo "   Restart:  docker-compose restart"
echo "   Logs:     docker-compose logs -f"
echo ""
echo -e "${BLUE}Opening browser in 3 seconds...${NC}"
sleep 3

# Try to open browser
if command -v open &> /dev/null; then
    # macOS
    open http://localhost:3000/writing-portfolio.html
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:3000/writing-portfolio.html
elif command -v start &> /dev/null; then
    # Windows
    start http://localhost:3000/writing-portfolio.html
else
    echo ""
    echo "Please open this URL in your browser:"
    echo "http://localhost:3000/writing-portfolio.html"
fi

echo ""
echo -e "${GREEN}Enjoy writing! ✍️${NC}"
echo ""
