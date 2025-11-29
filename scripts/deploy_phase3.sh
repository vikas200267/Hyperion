#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Project Hyperion - Phase 3 Deployment Script
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "PROJECT HYPERION - PHASE 3 ORACLE DEPLOYMENT"
echo "════════════════════════════════════════════════════════════════════════"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check dependencies
echo ""
echo "🔍 Checking dependencies..."

if ! command -v aiken &> /dev/null; then
    echo -e "${RED}❌ Aiken not found. Install from: https://aiken-lang.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Aiken installed${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python3 installed${NC}"

# Step 1: Compile Aiken contracts
echo ""
echo "📦 Step 1: Compiling Aiken contracts..."
cd /workspaces/Hyperion/contracts

if aiken build; then
    echo -e "${GREEN}✅ Contracts compiled successfully${NC}"
else
    echo -e "${RED}❌ Compilation failed${NC}"
    exit 1
fi

# Step 2: Install Python dependencies
echo ""
echo "🐍 Step 2: Installing Python dependencies..."
cd /workspaces/Hyperion/swarm

if pip install -q -r requirements.txt; then
    echo -e "${GREEN}✅ Python dependencies installed${NC}"
else
    echo -e "${RED}❌ Python installation failed${NC}"
    exit 1
fi

# Step 3: Generate oracle keys (if not exists)
echo ""
echo "🔑 Step 3: Oracle key generation..."

KEYS_FILE="/workspaces/Hyperion/.oracle_keys.json"

if [ ! -f "$KEYS_FILE" ]; then
    echo "Generating new Ed25519 keypair..."
    python3 << EOF
from nacl.signing import SigningKey
import json

sk = SigningKey.generate()
vk = sk.verify_key

keys = {
    "secret_key": sk.encode().hex(),
    "verify_key": vk.encode().hex()
}

with open("$KEYS_FILE", "w") as f:
    json.dump(keys, f, indent=2)

print(f"✅ Keys generated and saved to: $KEYS_FILE")
print(f"⚠️  KEEP SECRET KEY SECURE - DO NOT COMMIT TO GIT")
EOF
    echo -e "${GREEN}✅ Oracle keys generated${NC}"
    echo -e "${YELLOW}⚠️  Keys saved to: $KEYS_FILE${NC}"
    echo -e "${YELLOW}⚠️  Add to .gitignore!${NC}"
else
    echo -e "${GREEN}✅ Oracle keys already exist${NC}"
fi

# Step 4: Validate integration
echo ""
echo "🔬 Step 4: Validating Phase 3 integration..."

# Check file structure
echo "Checking file structure..."
FILES=(
    "/workspaces/Hyperion/contracts/validators/phase3_oracle.ak"
    "/workspaces/Hyperion/contracts/validators/insurance.ak"
    "/workspaces/Hyperion/contracts/lib/phase3_types.ak"
    "/workspaces/Hyperion/swarm/app/agents/phase3_oracle_client.py"
    "/workspaces/Hyperion/swarm/app/api/oracle.py"
    "/workspaces/Hyperion/docs/PHASE3_INTEGRATION.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅${NC} $(basename $file)"
    else
        echo -e "  ${RED}❌${NC} $(basename $file) - NOT FOUND"
        exit 1
    fi
done

# Step 5: Test Python imports
echo ""
echo "Testing Python imports..."
python3 << EOF
try:
    from app.agents.phase3_oracle_client import Phase3OracleClient
    from app.api import oracle
    print("✅ Python modules import successfully")
except Exception as e:
    print(f"❌ Import failed: {e}")
    exit(1)
EOF

# Summary
echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ PHASE 3 DEPLOYMENT COMPLETE${NC}"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "📁 Compiled contracts: /workspaces/Hyperion/contracts/plutus.json"
echo "🔑 Oracle keys: $KEYS_FILE"
echo "📖 Documentation: /workspaces/Hyperion/docs/PHASE3_INTEGRATION.md"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start backend: cd swarm && uvicorn app.main:app --reload"
echo "  2. Deploy oracle script to Cardano testnet"
echo "  3. Initialize oracle: POST /api/v1/oracle/initialize"
echo "  4. Start monitoring: POST /api/v1/oracle/monitor/start"
echo ""
echo "📚 Full guide: docs/PHASE3_INTEGRATION.md"
echo "════════════════════════════════════════════════════════════════════════"
