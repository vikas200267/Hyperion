# Phase 6 Oracle Integration Guide

## 📋 Overview

Phase 6 "Sentinel Swarm" has been successfully integrated into Project Hyperion without affecting existing features. This document explains how the Python-based AI oracle backend works with the Next.js frontend.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT HYPERION                          │
│                  Full Stack Architecture                     │
└─────────────────────────────────────────────────────────────┘

Frontend (Port 3000)                  Backend (Port 8000)
┌──────────────────────┐             ┌──────────────────────┐
│   Next.js 14 App     │             │   Python FastAPI     │
│   React TypeScript   │◄────────────┤   Phase 6 Oracle     │
│                      │   HTTP API  │                      │
│  Components:         │             │  Agents:             │
│  - HyperionMain      │             │  - Meteorologist     │
│  - LoginPage         │             │  - Auditor           │
│  - WalletConnect     │             │  - Arbiter           │
│                      │             │                      │
│  Hooks:              │             │  Services:           │
│  - useOracle()       │────────────►│  - Weather API       │
│  - usePhase5Wallet() │             │  - Cardano Signer    │
│                      │             │  - Data Validator    │
└──────────────────────┘             └──────────────────────┘
         │                                     │
         │                                     │
         ▼                                     ▼
┌──────────────────────┐             ┌──────────────────────┐
│   Phase 5 Wallet     │             │   External APIs      │
│   Cardano CIP-30     │             │   - OpenWeatherMap   │
│   (Nami, Eternl...)  │             │   - NOAA (optional)  │
└──────────────────────┘             └──────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│              Cardano Blockchain (Preprod)                │
│              Phase 3 Oracle Validator                    │
└──────────────────────────────────────────────────────────┘
```

---

## 🔗 Integration Points

### 1. API Proxy Layer

**File:** `/app/src/app/api/oracle/route.ts`

- Next.js API route that forwards requests to Python backend
- Handles CORS and error responses
- Validates request parameters
- Endpoints:
  - `GET /api/oracle` - Health check
  - `POST /api/oracle` - Execute oracle pipeline

### 2. React Hook

**File:** `/app/src/hooks/use-oracle.ts`

React hook for oracle operations:

```typescript
const { 
  executeOracle,      // Execute 3-agent pipeline
  checkHealth,        // Check backend status
  isExecuting,        // Loading state
  healthStatus,       // Backend health info
  lastResult          // Last oracle result
} = useOracle();
```

### 3. UI Components

**File:** `/app/src/components/HyperionMain.tsx`

Oracle status displayed in STATUS tab:
- Overall backend health (healthy/degraded/offline)
- Individual agent status (Meteorologist, Auditor, Arbiter)
- Real-time health monitoring
- Refresh button for manual checks

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js & npm** (for frontend)
2. **Python 3.11+** (for backend)
3. **OpenWeatherMap API Key** (required)
4. **Cardano Signing Key** (required)

### Installation Steps

#### 1. Install Python Dependencies

```bash
cd phase6
pip install -r requirements.txt
```

#### 2. Configure Environment

```bash
cd phase6
cp .env.example .env
```

Edit `.env` and add:
```env
OPENWEATHER_API_KEY=your_api_key_here
CARDANO_SK_HEX=your_signing_key_hex
SECONDARY_API_KEY=optional_noaa_key
```

**Generate Cardano Signing Key:**
```bash
cd phase6
python -m app.services.cardano_signer
# Copy the output to .env
```

#### 3. Start Backend (Terminal 1)

```bash
cd phase6
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: **http://localhost:8000**

#### 4. Start Frontend (Terminal 2)

```bash
cd /workspaces/Hyperion/app
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🔧 Usage

### Health Check

**Via Browser:**
```
http://localhost:8000/health
http://localhost:3000/api/oracle
```

**Via curl:**
```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "phase": 6,
  "agents": {
    "meteorologist": "online",
    "auditor": "online",
    "arbiter": "online"
  },
  "services": {
    "weather_service": true,
    "cardano_signer": true
  }
}
```

### Execute Oracle

**From React Component:**
```typescript
import { useOracle } from '@/hooks/use-oracle';

function MyComponent() {
  const { executeOracle, isExecuting, lastResult } = useOracle();

  const handleCheckWeather = async () => {
    const result = await executeOracle({
      policy_id: 'abc123...', // 56 hex chars
      location_id: 'miami_fl',
      latitude: 25.7617,
      longitude: -80.1918,
      threshold_wind_speed: 2500, // 25.0 m/s
    });

    if (result?.trigger) {
      console.log('Threshold exceeded!');
      console.log('Wind speed:', result.wind_speed / 100, 'm/s');
      console.log('Signature:', result.signature);
      // Submit to Cardano blockchain...
    }
  };

  return (
    <button onClick={handleCheckWeather} disabled={isExecuting}>
      {isExecuting ? 'Checking...' : 'Check Weather'}
    </button>
  );
}
```

**Direct API Call:**
```bash
curl -X POST http://localhost:8000/oracle/run \
  -H "Content-Type: application/json" \
  -d '{
    "policy_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "location_id": "miami_fl",
    "latitude": 25.7617,
    "longitude": -80.1918,
    "threshold_wind_speed": 2500
  }'
```

**Response:**
```json
{
  "policy_id": "a1b2c3...",
  "location_id": "miami_fl",
  "wind_speed": 2750,
  "measurement_time": 1730000000000,
  "nonce": 42,
  "signature": "abcd1234...",
  "trigger": true,
  "confidence": 0.95,
  "sources": {
    "primary": "OpenWeatherMap",
    "secondary": "NOAA"
  }
}
```

---

## 🎯 Real-World Claim Flow

### Complete End-to-End Example

```typescript
import { useOracle } from '@/hooks/use-oracle';
import { usePhase5Wallet } from '@/context/WalletProvider';

function ClaimProcessor() {
  const { executeOracle } = useOracle();
  const { lucid, walletAddress } = usePhase5Wallet();

  const processClaim = async (policy: Policy) => {
    // Step 1: Call Phase 6 oracle
    console.log('Calling Sentinel Swarm...');
    const oracleResult = await executeOracle({
      policy_id: policy.cardano_policy_id,
      location_id: policy.location,
      latitude: policy.coordinates.lat,
      longitude: policy.coordinates.lng,
      threshold_wind_speed: policy.trigger_threshold,
    });

    if (!oracleResult) {
      alert('Oracle execution failed');
      return;
    }

    console.log('Oracle result:', oracleResult);

    // Step 2: Check if threshold exceeded
    if (!oracleResult.trigger) {
      alert(`Claim denied: Wind speed (${oracleResult.wind_speed / 100} m/s) below threshold`);
      return;
    }

    // Step 3: Submit to Cardano blockchain
    console.log('Submitting claim to blockchain...');
    try {
      const tx = await lucid!.newTx()
        .collectFrom([oracleUtxo], {
          // OracleRedeemer structure (matches Phase 3 validator)
          wind_speed: oracleResult.wind_speed,
          measurement_time: oracleResult.measurement_time,
          nonce: oracleResult.nonce,
          policy_id: oracleResult.policy_id,
          location_id: oracleResult.location_id,
          signature: oracleResult.signature,
        })
        .payToAddress(walletAddress!, { 
          lovelace: policy.coverage_amount * 1_000_000 
        })
        .complete();

      const signed = await tx.sign().complete();
      const txHash = await signed.submit();

      alert(`✅ Claim approved! Tx: ${txHash}`);
      console.log('Transaction submitted:', txHash);

    } catch (error) {
      console.error('Blockchain submission failed:', error);
      alert('Failed to submit claim transaction');
    }
  };

  return (
    <button onClick={() => processClaim(selectedPolicy)}>
      Process Claim
    </button>
  );
}
```

---

## 📊 Monitoring

### Frontend Status Display

Check the **STATUS** tab in HyperionMain to see:
- ✅ Backend health (healthy/degraded/offline)
- 🤖 Individual agent status
- 🔄 Real-time updates every 30 seconds
- 🔄 Manual refresh button

### Backend Logs

Watch Phase 6 backend logs:
```bash
# In terminal running Phase 6
tail -f phase6.log
```

Logs show:
- Agent execution times
- API call results
- Signature generation
- Errors and warnings

### API Documentation

Visit FastAPI auto-generated docs:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🧪 Testing

### Test Oracle Health

```bash
# Should return healthy status
curl http://localhost:8000/health
```

### Test Oracle Execution (Low Wind)

```bash
curl -X POST http://localhost:8000/oracle/run \
  -H "Content-Type: application/json" \
  -d '{
    "policy_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "location_id": "test_location",
    "latitude": 0.0,
    "longitude": 0.0,
    "threshold_wind_speed": 10000
  }'
```

Expected: `"trigger": false` (wind unlikely to be 100 m/s)

### Test Frontend Integration

1. Open http://localhost:3000
2. Login (Demo or Wallet mode)
3. Go to **STATUS** tab
4. Check "Oracle Sentinel Swarm" section
5. Click "Refresh Status" button
6. Verify all agents show "ONLINE"

---

## 🔐 Security Considerations

### API Keys

- Store in `.env` file (never commit)
- Use environment variables in production
- Rotate keys regularly

### Signing Keys

- Generate unique key per environment
- Keep private key secure (never log or expose)
- Public key goes in Phase 3 OracleDatum (on-chain)

### CORS

Update CORS settings for production in `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-production-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error:** `OPENWEATHER_API_KEY not set`
- **Solution:** Copy `.env.example` to `.env` and add API key

**Error:** `CARDANO_SK_HEX not set`
- **Solution:** Run `python -m app.services.cardano_signer` to generate key

**Error:** `Port 8000 already in use`
- **Solution:** Change port: `uvicorn app.main:app --port 8001`

### Frontend Shows "Backend Offline"

**Cause:** Phase 6 backend not running
- **Solution:** Start backend in separate terminal

**Cause:** CORS error
- **Solution:** Check browser console, update CORS in `app/main.py`

**Cause:** Wrong URL
- **Solution:** Check `PHASE6_BACKEND_URL` in Next.js `.env.local`

### Oracle Execution Fails

**Error:** `Invalid policy_id format`
- **Solution:** Policy ID must be 56 hexadecimal characters

**Error:** `Invalid coordinates`
- **Solution:** Latitude [-90, 90], Longitude [-180, 180]

**Error:** `Weather API request failed`
- **Solution:** Check OpenWeatherMap API key validity and quota

### Signature Verification Fails On-Chain

**Cause:** Public key mismatch
- **Solution:** Ensure Phase 3 OracleDatum has correct verify_key

**Cause:** Message format mismatch
- **Solution:** Verify Phase6CanonicalMessage matches Phase 3 Aiken validator

---

## 📝 Environment Variables Reference

### Phase 6 Backend (.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OPENWEATHER_API_KEY` | ✅ Yes | OpenWeatherMap API key | `abc123def456...` |
| `CARDANO_SK_HEX` | ✅ Yes | Ed25519 signing key (64 hex chars) | `0123456789abcdef...` |
| `SECONDARY_API_KEY` | ❌ No | NOAA/FlightAware key | `xyz789uvw456...` |
| `PHASE6_LOG_LEVEL` | ❌ No | Logging level | `INFO` |
| `PHASE6_HOST` | ❌ No | Server host | `0.0.0.0` |
| `PHASE6_PORT` | ❌ No | Server port | `8000` |

### Next.js Frontend (.env.local)

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PHASE6_BACKEND_URL` | ❌ No | Phase 6 backend URL | `http://localhost:8000` |
| `NEXT_PUBLIC_NETWORK` | ❌ No | Cardano network | `Preprod` |

---

## 🚀 Production Deployment

### Docker Deployment

**Dockerfile for Phase 6:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY phase6/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY phase6/app ./app

ENV PHASE6_HOST=0.0.0.0
ENV PHASE6_PORT=8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and Run:**
```bash
docker build -t hyperion-phase6 .
docker run -p 8000:8000 --env-file phase6/.env hyperion-phase6
```

### Kubernetes Deployment

See `phase6/README.md` for full Kubernetes manifests.

---

## 📖 Additional Resources

- **Phase 6 README:** `/phase6/README.md`
- **Phase 6 Verification:** `/phase6/PHASE6_FINAL_VERIFICATION.md`
- **FastAPI Docs:** http://localhost:8000/docs
- **OpenWeatherMap API:** https://openweathermap.org/api
- **Cardano Docs:** https://docs.cardano.org

---

## ✅ Integration Checklist

- [x] Phase 6 Python backend code in `/phase6` folder
- [x] FastAPI server with health and oracle endpoints
- [x] 3-agent swarm (Meteorologist, Auditor, Arbiter)
- [x] OpenWeatherMap integration
- [x] Ed25519 signing with Cardano keys
- [x] Next.js API proxy (`/api/oracle/route.ts`)
- [x] React hook (`useOracle()`)
- [x] UI status display in STATUS tab
- [x] Real-time health monitoring
- [x] Complete documentation
- [x] No conflicts with existing features (Phases 1-5)

---

## 🎉 Summary

Phase 6 Sentinel Swarm is **fully integrated** and **production-ready**:

1. ✅ **Backend:** Python FastAPI running on port 8000
2. ✅ **Frontend:** React hooks and UI components added
3. ✅ **Integration:** API proxy layer connects both systems
4. ✅ **Monitoring:** Real-time health checks in STATUS tab
5. ✅ **No Conflicts:** All existing features work unchanged
6. ✅ **Documentation:** Complete setup and usage guides

**To use Phase 6:**
1. Start Python backend (port 8000)
2. Start Next.js frontend (port 3000)
3. Check STATUS tab for oracle health
4. Use `useOracle()` hook to execute oracle pipeline
5. Submit signed results to Cardano blockchain

**Happy Building! 🚀**
