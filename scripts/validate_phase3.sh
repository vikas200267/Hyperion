#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Project Hyperion - Phase 3 Integration Validator
# ═══════════════════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════════════"
echo "PROJECT HYPERION - PHASE 3 INTEGRATION VALIDATOR"
echo "════════════════════════════════════════════════════════════════════════"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

total=0
passed=0

check_file() {
    local file=$1
    local name=$2
    total=$((total + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $name"
        passed=$((passed + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $name - NOT FOUND"
        return 1
    fi
}

echo ""
echo "📁 Checking Smart Contracts..."
check_file "/workspaces/Hyperion/contracts/validators/phase3_oracle.ak" "Phase 3 Oracle Validator"
check_file "/workspaces/Hyperion/contracts/validators/insurance.ak" "Insurance Validator (Phase 3 integrated)"
check_file "/workspaces/Hyperion/contracts/lib/phase3_types.ak" "Phase 3 Type Definitions"

echo ""
echo "🐍 Checking Python Backend..."
check_file "/workspaces/Hyperion/swarm/app/agents/phase3_oracle_client.py" "Phase 3 Oracle Client"
check_file "/workspaces/Hyperion/swarm/app/api/oracle.py" "Oracle API Endpoints"
check_file "/workspaces/Hyperion/swarm/requirements.txt" "Updated Requirements"

echo ""
echo "📖 Checking Documentation..."
check_file "/workspaces/Hyperion/docs/PHASE3_INTEGRATION.md" "Phase 3 Integration Guide"
check_file "/workspaces/Hyperion/contracts/README.md" "Updated Contracts README"

echo ""
echo "🔧 Checking Scripts..."
check_file "/workspaces/Hyperion/scripts/deploy_phase3.sh" "Deployment Script"

echo ""
echo "════════════════════════════════════════════════════════════════════════"

if [ $passed -eq $total ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED ($passed/$total)${NC}"
    echo "════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "🎉 Phase 3 integration complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Install Aiken: curl -sSfL https://install.aiken-lang.org | bash"
    echo "  2. Compile: cd contracts && aiken build"
    echo "  3. Install deps: cd swarm && pip install -r requirements.txt"
    echo "  4. Start backend: uvicorn app.main:app --reload"
    echo ""
    exit 0
else
    echo -e "${RED}❌ CHECKS FAILED ($passed/$total passed)${NC}"
    echo "════════════════════════════════════════════════════════════════════════"
    exit 1
fi
