#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# PROJECT HYPERION - FULL STACK STARTUP SCRIPT
# ═══════════════════════════════════════════════════════════════════════════
# Starts both Next.js frontend (Port 3000) and Phase 6 backend (Port 8000)
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$PROJECT_ROOT/app"
PHASE6_DIR="$PROJECT_ROOT/app/phase6"

echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                   PROJECT HYPERION - FULL STACK STARTUP${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    if check_port $port; then
        echo -e "${YELLOW}⚠️  Port $port is in use. Killing existing process...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to check if Phase 6 backend is healthy
check_phase6_health() {
    curl -s http://localhost:8000/health >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo -e "${CYAN}Step 1: Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python $(python3 --version)${NC}"

echo ""

# Step 2: Check Phase 6 environment
echo -e "${CYAN}Step 2: Checking Phase 6 configuration...${NC}"

if [ ! -f "$PHASE6_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Phase 6 .env file not found${NC}"
    echo -e "${YELLOW}   Creating from .env.example...${NC}"
    cp "$PHASE6_DIR/.env.example" "$PHASE6_DIR/.env"
    echo -e "${RED}❌ Please edit $PHASE6_DIR/.env with your API keys${NC}"
    echo -e "${RED}   Required: OPENWEATHER_API_KEY, CARDANO_SK_HEX${NC}"
    echo -e "${YELLOW}   Run: npm run phase6:keygen to generate Cardano keys${NC}"
    exit 1
fi

# Step 2.5: Check and prompt for Blockfrost API Key
echo -e "${CYAN}Step 2.5: Checking Blockfrost API configuration...${NC}"

if [ ! -f "$APP_DIR/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Frontend .env.local not found${NC}"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  🔑 BLOCKFROST API KEY REQUIRED${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}To connect wallets to the Cardano blockchain, you need a Blockfrost API key.${NC}"
    echo -e "${YELLOW}Get a FREE key at: ${GREEN}https://blockfrost.io${NC}"
    echo ""
    echo -e "${CYAN}Quick Steps:${NC}"
    echo -e "  1. Go to https://blockfrost.io"
    echo -e "  2. Sign up for free account"
    echo -e "  3. Create a new project"
    echo -e "  4. Copy your project ID (API key)"
    echo ""
    echo -e "${CYAN}For Testnet (Preprod):${NC} Your key will start with '${GREEN}preprod${NC}...'"
    echo -e "${CYAN}For Mainnet:${NC} Your key will start with '${GREEN}mainnet${NC}...'"
    echo ""
    echo -e "${YELLOW}⚠️  Important: The demo key will NOT work for wallet connections!${NC}"
    echo -e "${YELLOW}You can still use Demo Mode to explore the app without a wallet.${NC}"
    echo ""
    echo -e "${CYAN}Press Enter to skip (Demo Mode only - no wallet connection)${NC}"
    echo -e "${CYAN}Or paste your Blockfrost API key:${NC}"
    read -p "Blockfrost API Key: " BLOCKFROST_KEY
    echo ""
    
    if [ -z "$BLOCKFROST_KEY" ]; then
        BLOCKFROST_KEY="demo_mode_preprod_testnet"
        echo -e "${YELLOW}⚠️  Using demo mode - Wallet connection will be disabled${NC}"
        echo -e "${YELLOW}   To enable wallet connection, get a real API key from blockfrost.io${NC}"
        echo -e "${YELLOW}   and restart with: ./start-hyperion.sh${NC}"
    else
        echo -e "${GREEN}✅ Blockfrost API key configured${NC}"
        echo -e "${GREEN}   You can now connect your Cardano wallet!${NC}"
    fi
    
    # Create .env.local file
    cat > "$APP_DIR/.env.local" <<EOF
# Hyperion Frontend Configuration
# Generated: $(date)

# Blockfrost API Configuration
NEXT_PUBLIC_BLOCKFROST_API_KEY=$BLOCKFROST_KEY
NEXT_PUBLIC_CARDANO_NETWORK=preprod

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true
NEXT_PUBLIC_ENABLE_PHASE3_ORACLE=true
EOF
    echo -e "${GREEN}✅ Created $APP_DIR/.env.local${NC}"
else
    echo -e "${GREEN}✅ Frontend configuration found${NC}"
    # Check if using demo key
    if grep -q "demo_mode_preprod_testnet" "$APP_DIR/.env.local"; then
        echo -e "${YELLOW}⚠️  Currently using demo mode (wallet connection disabled)${NC}"
        echo -e "${YELLOW}   Get a real API key from https://blockfrost.io to enable wallet connection${NC}"
    fi
fi

# Check if required keys are set
if ! grep -q "^OPENWEATHER_API_KEY=.\+" "$PHASE6_DIR/.env"; then
    echo -e "${RED}❌ OPENWEATHER_API_KEY not set in $PHASE6_DIR/.env${NC}"
    exit 1
fi
echo -e "${GREEN}✅ OPENWEATHER_API_KEY configured${NC}"

if ! grep -q "^CARDANO_SK_HEX=.\+" "$PHASE6_DIR/.env"; then
    echo -e "${RED}❌ CARDANO_SK_HEX not set in $PHASE6_DIR/.env${NC}"
    echo -e "${YELLOW}   Run: npm run phase6:keygen to generate keys${NC}"
    exit 1
fi
echo -e "${GREEN}✅ CARDANO_SK_HEX configured${NC}"

echo ""

# Step 3: Kill existing processes
echo -e "${CYAN}Step 3: Cleaning up existing processes...${NC}"
kill_port 3000
kill_port 8000
echo -e "${GREEN}✅ Ports cleared${NC}"
echo ""

# Step 4: Start Phase 6 backend
echo -e "${CYAN}Step 4: Starting Phase 6 Oracle Backend (Port 8000)...${NC}"
cd "$PHASE6_DIR"

# Start Phase 6 in background
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$PROJECT_ROOT/phase6.log" 2>&1 &
PHASE6_PID=$!
echo -e "${GREEN}✅ Phase 6 started (PID: $PHASE6_PID)${NC}"

# Wait for Phase 6 to be healthy
echo -e "${YELLOW}⏳ Waiting for Phase 6 to be ready...${NC}"
for i in {1..30}; do
    if check_phase6_health; then
        echo -e "${GREEN}✅ Phase 6 backend is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Phase 6 failed to start. Check logs: tail -f $PROJECT_ROOT/phase6.log${NC}"
        kill $PHASE6_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

echo ""

# Step 5: Start Next.js frontend
echo -e "${CYAN}Step 5: Starting Next.js Frontend (Port 3000)...${NC}"
cd "$APP_DIR"

# Start Next.js in background
nohup npm run dev > "$PROJECT_ROOT/nextjs.log" 2>&1 &
NEXTJS_PID=$!
echo -e "${GREEN}✅ Next.js started (PID: $NEXTJS_PID)${NC}"

# Wait for Next.js to be ready
echo -e "${YELLOW}⏳ Waiting for Next.js to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Next.js frontend is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Next.js failed to start. Check logs: tail -f $PROJECT_ROOT/nextjs.log${NC}"
        kill $PHASE6_PID 2>/dev/null || true
        kill $NEXTJS_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

echo ""

# Step 6: Summary
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                    🚀 PROJECT HYPERION IS RUNNING! 🚀${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Frontend (Next.js):${NC}"
echo -e "  URL: ${GREEN}http://localhost:3000${NC}"
echo -e "  PID: ${GREEN}$NEXTJS_PID${NC}"
echo -e "  Logs: ${YELLOW}tail -f $PROJECT_ROOT/nextjs.log${NC}"
echo ""
echo -e "${CYAN}Backend (Phase 6 Oracle):${NC}"
echo -e "  URL: ${GREEN}http://localhost:8000${NC}"
echo -e "  PID: ${GREEN}$PHASE6_PID${NC}"
echo -e "  Logs: ${YELLOW}tail -f $PROJECT_ROOT/phase6.log${NC}"
echo -e "  Health: ${GREEN}http://localhost:8000/health${NC}"
echo -e "  Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${CYAN}Quick Commands:${NC}"
echo -e "  Check Phase 6 health: ${YELLOW}npm run phase6:health${NC}"
echo -e "  Stop all: ${YELLOW}kill $NEXTJS_PID $PHASE6_PID${NC}"
echo -e "  View logs: ${YELLOW}tail -f $PROJECT_ROOT/*.log${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services and exit${NC}"
echo ""

# Save PIDs to file for easy cleanup
echo "$NEXTJS_PID" > "$PROJECT_ROOT/.nextjs.pid"
echo "$PHASE6_PID" > "$PROJECT_ROOT/.phase6.pid"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    
    if [ -f "$PROJECT_ROOT/.nextjs.pid" ]; then
        NEXTJS_PID=$(cat "$PROJECT_ROOT/.nextjs.pid")
        echo -e "${YELLOW}Stopping Next.js (PID: $NEXTJS_PID)...${NC}"
        kill $NEXTJS_PID 2>/dev/null || true
        rm "$PROJECT_ROOT/.nextjs.pid"
    fi
    
    if [ -f "$PROJECT_ROOT/.phase6.pid" ]; then
        PHASE6_PID=$(cat "$PROJECT_ROOT/.phase6.pid")
        echo -e "${YELLOW}Stopping Phase 6 (PID: $PHASE6_PID)...${NC}"
        kill $PHASE6_PID 2>/dev/null || true
        rm "$PROJECT_ROOT/.phase6.pid"
    fi
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup INT TERM

# Wait indefinitely (services run in background)
while true; do
    # Check if processes are still running
    if ! kill -0 $NEXTJS_PID 2>/dev/null; then
        echo -e "${RED}❌ Next.js crashed! Check logs: tail -f $PROJECT_ROOT/nextjs.log${NC}"
        cleanup
    fi
    
    if ! kill -0 $PHASE6_PID 2>/dev/null; then
        echo -e "${RED}❌ Phase 6 crashed! Check logs: tail -f $PROJECT_ROOT/phase6.log${NC}"
        cleanup
    fi
    
    sleep 5
done
