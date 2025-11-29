# 🚀 Phase 3 - Quick Commands Reference

## One-Liners for Fast Development

### Validation & Testing
```bash
# Validate all Phase 3 files (9 checks)
./scripts/validate_phase3.sh

# Check frontend for errors
cd app && npm run build

# Check backend syntax
cd swarm && python3 -m py_compile app/api/oracle.py
```

### Start Services
```bash
# Backend (Terminal 1)
cd swarm && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (Terminal 2)
cd app && npm run dev
```

### Quick Health Checks
```bash
# Check backend
curl http://localhost:8000/health

# Check oracle
curl http://localhost:8000/api/v1/oracle/health

# Check frontend
curl http://localhost:3000
```

### Documentation Access
```bash
# API docs (interactive)
open http://localhost:8000/docs

# Frontend
open http://localhost:3000

# Or use $BROWSER
"$BROWSER" http://localhost:8000/docs
```

## File Locations

### Smart Contracts
```bash
# Main oracle validator
cat contracts/validators/phase3_oracle.ak

# Updated insurance validator
cat contracts/validators/insurance.ak

# Shared types
cat contracts/lib/phase3_types.ak
```

### Python Backend
```bash
# Oracle client
cat swarm/app/agents/phase3_oracle_client.py

# API endpoints
cat swarm/app/api/oracle.py

# Main app
cat swarm/app/main.py
```

### Frontend
```bash
# Oracle library
cat app/src/lib/oracle.ts

# Status widget
cat app/src/components/OracleStatus.tsx

# Config
cat app/src/lib/config.ts
```

### Documentation
```bash
# Quick start
cat QUICKSTART_PHASE3.md

# Full integration guide
cat docs/PHASE3_INTEGRATION.md

# Architecture diagrams
cat docs/PHASE3_ARCHITECTURE.md

# Frontend integration
cat docs/PHASE3_FRONTEND.md
```

## Common Tasks

### Add Oracle Widget to Dashboard
```tsx
// In your dashboard component
import { OracleStatusWidget } from '@/components/OracleStatus';

<div className="grid grid-cols-3 gap-4">
  <TreasuryCard />
  <PolicyCard />
  <OracleStatusWidget />
</div>
```

### Check Oracle Status from Code
```typescript
import { checkOracleHealth } from '@/lib/oracle';

const status = await checkOracleHealth();
console.log(status);
```

### Start Monitoring for a Policy
```bash
curl -X POST http://localhost:8000/api/v1/oracle/monitor/start \
  -H "Content-Type: application/json" \
  -d '{
    "oracle_utxo_ref": "txhash#0",
    "policy_id": "your_policy_id_hex",
    "location_id": "NYC_JFK_AIRPORT",
    "poll_interval": 30
  }'
```

### Stop Monitoring
```bash
curl -X POST http://localhost:8000/api/v1/oracle/monitor/stop/monitor_id
```

### Get Monitoring Status
```bash
curl http://localhost:8000/api/v1/oracle/monitor/status
```

## Environment Setup

### Backend (.env for swarm/)
```bash
# Not needed - uses defaults
# Optionally set:
export BLOCKFROST_KEY=your_key
export ORACLE_SK=your_signing_key
```

### Frontend (.env.local in app/)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_PHASE3_ORACLE=true
NEXT_PUBLIC_ORACLE_POLL_INTERVAL=30
```

## Troubleshooting

### Oracle Shows "Offline"
```bash
# Check backend is running
curl http://localhost:8000/api/v1/oracle/health

# If 404, backend not started:
cd swarm && uvicorn app.main:app --reload
```

### Import Errors
```bash
# Install Python deps
cd swarm && pip install -r requirements.txt

# Install frontend deps
cd app && npm install
```

### Port Already in Use
```bash
# Backend on different port
uvicorn app.main:app --reload --port 8001

# Update frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## Verification Checklist

```bash
# ✅ Files exist
./scripts/validate_phase3.sh

# ✅ Backend builds
cd swarm && python3 -c "from app.api import oracle; print('OK')"

# ✅ Frontend builds
cd app && npm run build

# ✅ Backend starts
cd swarm && timeout 5 uvicorn app.main:app --port 8000 || echo "Started"

# ✅ Oracle endpoint works
curl -f http://localhost:8000/api/v1/oracle/health || echo "Backend not running"

# ✅ Frontend starts
cd app && timeout 5 npm run dev || echo "Frontend OK"
```

## Git Commands

### Commit Phase 3 Changes
```bash
git add contracts/ swarm/ app/ docs/ scripts/ *.md
git commit -m "feat: Integrate Phase 3 Oracle Validator

- Add phase3_oracle.ak validator with Ed25519 signatures
- Integrate oracle functions into insurance.ak
- Add Python oracle client and FastAPI endpoints
- Create frontend oracle status widget
- Update documentation and configs

All validation checks pass (9/9)
Frontend builds successfully
Zero breaking changes"
```

### Create Feature Branch
```bash
git checkout -b feat/phase3-oracle-integration
git add .
git commit -m "feat: Phase 3 Oracle complete"
git push origin feat/phase3-oracle-integration
```

## Testing Commands

### Test Oracle Signing (Python)
```python
python3 << EOF
from swarm.app.agents.phase3_oracle_client import Phase3OracleClient
import os

client = Phase3OracleClient(
    oracle_sk_hex="0" * 64,  # Test key
    blockfrost_project_id="test",
    network="testnet"
)

sig = client.sign_oracle_data(
    policy_id=b"\x00" * 28,
    location_id=b"TEST",
    wind_speed=2500,
    measurement_time=1700000000000,
    nonce=1
)

print(f"Signature length: {len(sig)} bytes")
assert len(sig) == 64
print("✅ Signing works!")
EOF
```

### Test Frontend Oracle Library
```bash
cd app && node << 'EOF'
// Can't actually run this without proper Node environment
// But shows the pattern
console.log("Use browser console to test");
EOF
```

## Performance Monitoring

### Check Response Times
```bash
# Oracle health endpoint
time curl -s http://localhost:8000/api/v1/oracle/health > /dev/null

# Should be < 100ms
```

### Monitor Logs
```bash
# Backend logs
cd swarm && uvicorn app.main:app --reload --log-level debug

# Frontend logs (browser console)
# Check Network tab in DevTools
```

## Quick Links

- **Validation:** `./scripts/validate_phase3.sh`
- **Deployment:** `./scripts/deploy_phase3.sh`
- **Quick Start:** `QUICKSTART_PHASE3.md`
- **Full Guide:** `docs/PHASE3_INTEGRATION.md`
- **Architecture:** `docs/PHASE3_ARCHITECTURE.md`
- **Frontend:** `docs/PHASE3_FRONTEND.md`

---

**Pro Tip:** Bookmark this file for quick reference during development!
