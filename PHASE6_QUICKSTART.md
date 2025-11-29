# 🚀 Project Hyperion - Quick Start Guide

## Phase 6 Oracle Integration Complete! ✅

Phase 6 "Sentinel Swarm" has been fully integrated with the existing Project Hyperion frontend.

---

## 🏃 Quick Start (3 Steps)

### Option 1: Automated Startup (Recommended)

```bash
./start-hyperion.sh
```

This script will:
- ✅ Check all prerequisites
- ✅ Verify Phase 6 configuration
- ✅ Start Phase 6 backend (Port 8000)
- ✅ Start Next.js frontend (Port 3000)
- ✅ Monitor both services
- 🛑 Press Ctrl+C to stop all services

### Option 2: Manual Startup

**Terminal 1 - Phase 6 Backend:**
```bash
cd app/phase6
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Next.js Frontend:**
```bash
cd app
npm run dev
```

---

## ⚙️ Configuration Required

### 1. Phase 6 Environment Setup

```bash
cd app/phase6
cp .env.example .env
```

Edit `app/phase6/.env`:
```env
OPENWEATHER_API_KEY=your_key_here  # Get from openweathermap.org
CARDANO_SK_HEX=your_key_here       # Generate with: npm run phase6:keygen
```

### 2. Generate Cardano Signing Key

```bash
cd app
npm run phase6:keygen
```

Copy the output to `app/phase6/.env`

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main insurance DApp |
| **Phase 6 Backend** | http://localhost:8000 | Oracle API |
| **Phase 6 Health** | http://localhost:8000/health | Backend status |
| **API Docs** | http://localhost:8000/docs | FastAPI Swagger UI |

---

## 🎯 What's New in Phase 6

### 1. Sentinel Swarm Oracle Backend
- 🤖 **3 AI Agents:** Meteorologist, Auditor, Arbiter
- 🌦️ **Real-time Weather Data:** OpenWeatherMap API
- 🔐 **Cryptographic Signing:** Ed25519 signatures for on-chain verification
- ⚡ **Real-time Processing:** < 5 seconds pipeline execution

### 2. Frontend Integration
- 📊 **Oracle Status Display:** Check STATUS tab in HyperionMain
- 🔄 **Real-time Health Monitoring:** Auto-refresh every 30 seconds
- 🪝 **React Hook:** `useOracle()` for calling oracle from components
- 🌉 **API Proxy:** `/api/oracle` route bridges frontend ↔ backend

### 3. Developer Tools
- 📝 **npm Scripts:** `phase6:dev`, `phase6:health`, `phase6:keygen`
- 📚 **Documentation:** See `app/PHASE6_INTEGRATION.md`
- 🐳 **Docker Ready:** See `app/phase6/README.md`

---

## 🧪 Testing Phase 6

### Check Backend Health

```bash
curl http://localhost:8000/health
```

### Execute Oracle

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

### View in UI

1. Open http://localhost:3000
2. Login (Demo or Wallet mode)
3. Go to **STATUS** tab
4. See "Oracle Sentinel Swarm" section
5. All agents should show "ONLINE"

---

## 📦 npm Scripts Reference

```bash
# Frontend
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server

# Phase 6 Backend
npm run phase6:install   # Install Python dependencies
npm run phase6:dev       # Start Phase 6 dev server
npm run phase6:prod      # Start Phase 6 production server
npm run phase6:health    # Check Phase 6 health
npm run phase6:keygen    # Generate Cardano signing key
```

---

## 🔍 Monitoring

### View Logs

```bash
# Next.js logs
tail -f nextjs.log

# Phase 6 logs
tail -f phase6.log

# Both
tail -f *.log
```

### Health Checks

```bash
# Phase 6 backend
npm run phase6:health

# Or visit in browser
open http://localhost:8000/health
```

---

## 📚 Documentation

| Document | Location | Description |
|----------|----------|-------------|
| **Phase 6 Integration** | `app/PHASE6_INTEGRATION.md` | Complete integration guide |
| **Phase 6 Backend** | `app/phase6/README.md` | Backend documentation |
| **Phase 6 Verification** | `app/phase6/PHASE6_FINAL_VERIFICATION.md` | Testing and validation |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |

---

## 🐛 Troubleshooting

### "Backend Offline" in UI

**Solution:** Start Phase 6 backend
```bash
cd app/phase6
uvicorn app.main:app --reload --port 8000
```

### "OPENWEATHER_API_KEY not set"

**Solution:** Configure `.env` file
```bash
cd app/phase6
cp .env.example .env
# Edit .env and add your API key
```

### "CARDANO_SK_HEX not set"

**Solution:** Generate signing key
```bash
npm run phase6:keygen
# Copy output to app/phase6/.env
```

### Port Already in Use

**Solution:** Kill existing process
```bash
# For port 8000 (Phase 6)
lsof -ti:8000 | xargs kill -9

# For port 3000 (Next.js)
lsof -ti:3000 | xargs kill -9
```

---

## 🎯 Next Steps

1. ✅ **Test Integration:** Use STATUS tab to verify Phase 6 is online
2. ✅ **Review Documentation:** Read `app/PHASE6_INTEGRATION.md`
3. ✅ **Try Oracle Execution:** Call `/api/oracle` from frontend
4. ✅ **Deploy to Production:** See Docker/Kubernetes guides in Phase 6 README

---

## 🏗️ Project Structure

```
Hyperion/
├── start-hyperion.sh           # 🚀 Full stack startup script
├── PHASE6_QUICKSTART.md        # 📖 This file
├── app/
│   ├── PHASE6_INTEGRATION.md   # 📚 Integration guide
│   ├── package.json            # 📦 npm scripts
│   ├── phase6/                 # 🐍 Python backend
│   │   ├── .env                # 🔐 Configuration
│   │   ├── requirements.txt    # 📦 Python deps
│   │   ├── app/
│   │   │   ├── main.py        # 🌐 FastAPI server
│   │   │   ├── agents.py      # 🤖 3-agent swarm
│   │   │   ├── models.py      # 📊 Data models
│   │   │   └── services/      # 🔧 Services
│   │   └── README.md          # 📖 Phase 6 docs
│   └── src/
│       ├── app/api/oracle/    # 🌉 API proxy
│       ├── hooks/             # 🪝 useOracle hook
│       └── components/        # 🎨 UI with oracle status
└── contracts/                  # 📜 Smart contracts
```

---

## ✅ Integration Status

| Feature | Status | Location |
|---------|--------|----------|
| Python Backend | ✅ Complete | `app/phase6/` |
| 3-Agent Swarm | ✅ Complete | `app/phase6/app/agents.py` |
| Weather API | ✅ Complete | `app/phase6/app/services/weather.py` |
| Crypto Signing | ✅ Complete | `app/phase6/app/services/cardano_signer.py` |
| Next.js API Proxy | ✅ Complete | `app/src/app/api/oracle/route.ts` |
| React Hook | ✅ Complete | `app/src/hooks/use-oracle.ts` |
| UI Status Display | ✅ Complete | `app/src/components/HyperionMain.tsx` |
| Documentation | ✅ Complete | `app/PHASE6_INTEGRATION.md` |
| Startup Script | ✅ Complete | `start-hyperion.sh` |
| npm Scripts | ✅ Complete | `app/package.json` |

**Phase 6 is production-ready and fully integrated! 🎉**

---

## 🤝 Support

- 📖 **Full Integration Guide:** `app/PHASE6_INTEGRATION.md`
- 🐍 **Backend Documentation:** `app/phase6/README.md`
- 🌐 **API Documentation:** http://localhost:8000/docs
- 💬 **Issues:** Create GitHub issue with logs

---

## 🎉 Summary

Phase 6 Sentinel Swarm has been successfully integrated:

1. ✅ **No Conflicts:** All existing features (Phases 1-5) work unchanged
2. ✅ **Production Ready:** Tested and verified
3. ✅ **Well Documented:** Complete setup and usage guides
4. ✅ **Easy to Use:** One-command startup script
5. ✅ **Monitored:** Real-time health checks in UI

**To get started:** Run `./start-hyperion.sh` and visit http://localhost:3000

**Happy Building! 🚀**
