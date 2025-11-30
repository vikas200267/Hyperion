# 🔑 PROJECT HYPERION - REQUIRED API KEYS

This document lists all API keys needed for **Project Hyperion** to run in **real-time production mode**.

---

## 🚀 Quick Setup

Run the automated configuration wizard:

```bash
./setup-api-keys.sh
```

This wizard will:
- ✅ Prompt you for each API key
- ✅ Securely store them in `.env` files
- ✅ Add files to `.gitignore` automatically
- ✅ Create a backup in `.api-keys.secure`

---

## 📋 Required APIs (4)

### 1️⃣ **Cardano Blockchain API** (Blockfrost)

- **Purpose**: Connect to Cardano blockchain (read NFTs, submit transactions)
- **Provider**: [Blockfrost.io](https://blockfrost.io)
- **Network**: Preprod (Testnet) or Mainnet
- **Cost**: **FREE** tier (50,000 requests/day)
- **Registration**: 
  1. Visit https://blockfrost.io
  2. Create account
  3. Create new project → Select "Preprod" network
  4. Copy API key (starts with `preprod...`)

**Environment Variable:**
```bash
NEXT_PUBLIC_BLOCKFROST_API_KEY=preprodYourKeyHere...
```

**Used in:**
- Frontend: Wallet connection, NFT reading
- Backend: Transaction submission

---

### 2️⃣ **Weather Data API** (OpenWeatherMap)

- **Purpose**: Fetch real-time weather data for oracle validation
- **Provider**: [OpenWeatherMap](https://openweathermap.org/api)
- **Plan**: One Call API 3.0 (historical + current weather)
- **Cost**: **FREE** tier (1,000 calls/day)
- **Registration**:
  1. Visit https://openweathermap.org/api
  2. Sign up for account
  3. Navigate to API Keys section
  4. Generate API key
  5. Subscribe to "One Call API 3.0" (free tier)

**Environment Variable:**
```bash
OPENWEATHER_API_KEY=your_openweather_api_key
```

**Used in:**
- Backend Phase 6: Meteorologist agent
- Real-time hurricane wind speed monitoring

---

### 3️⃣ **AI Reporting API** (Google Gemini)

- **Purpose**: Generate AI-powered forensic reports (Phase 7)
- **Provider**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Model**: Gemini 1.5 Flash (fast streaming)
- **Cost**: **FREE** tier (60 requests/minute)
- **Registration**:
  1. Visit https://makersuite.google.com/app/apikey
  2. Sign in with Google account
  3. Click "Create API Key"
  4. Copy the generated key

**Environment Variable:**
```bash
GEMINI_API_KEY=your_gemini_api_key
```

**Used in:**
- Backend Phase 7: Forensic report generation
- AI-powered claim explanations

---

### 4️⃣ **Cardano Signing Key** (Ed25519)

- **Purpose**: Sign oracle messages for on-chain verification
- **Provider**: Self-generated
- **Cost**: **FREE**
- **Generation**: 

**Option A - Auto-generate (Recommended):**
The setup wizard will generate a secure key automatically.

**Option B - Manual generation:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Environment Variable:**
```bash
CARDANO_SK_HEX=your_64_character_hex_key
```

**Used in:**
- Backend Phase 6: Oracle message signing
- Cryptographic verification on-chain

---

## 🔧 Optional APIs (1)

### 5️⃣ **Secondary Validation API** (Optional)

- **Purpose**: Cross-validate weather data with secondary sources
- **Options**: 
  - [NewsAPI](https://newsapi.org) - News articles about storms
  - [FlightAware](https://flightaware.com/commercial/flightxml/) - Flight cancellations
  - [NOAA](https://www.ncdc.noaa.gov/cdo-web/webservices/v2) - Official weather data
- **Cost**: Varies by provider (most have free tiers)
- **Status**: Optional - uses mock data if not provided

**Environment Variable:**
```bash
SECONDARY_API_KEY=your_secondary_api_key
```

**Used in:**
- Backend Phase 6: Auditor agent
- Enhanced validation accuracy

---

## 📂 File Locations

After running `./setup-api-keys.sh`, API keys are stored in:

### Backend Configuration
```
/workspaces/Hyperion/app/phase6/.env
```

Contains:
- `OPENWEATHER_API_KEY`
- `CARDANO_SK_HEX`
- `GEMINI_API_KEY`
- `SECONDARY_API_KEY` (optional)

### Frontend Configuration
```
/workspaces/Hyperion/app/.env.local
```

Contains:
- `NEXT_PUBLIC_BLOCKFROST_API_KEY`
- `NEXT_PUBLIC_BACKEND_URL`
- Feature flags

### Secure Backup
```
/workspaces/Hyperion/.api-keys.secure
```

**⚠️ WARNING:** This file contains all API keys in plain text. Keep it private!

---

## 🔒 Security Best Practices

### ✅ What the Setup Does Automatically

1. **Git Ignore**: Adds `.env` files to `.gitignore`
2. **File Permissions**: Sets `.api-keys.secure` to read-only (chmod 600)
3. **Backup**: Creates secure backup for recovery

### ⚠️ Your Responsibilities

- ❌ **NEVER** commit `.env` files to git
- ❌ **NEVER** share API keys publicly
- ❌ **NEVER** push `.api-keys.secure` to GitHub
- ✅ **ALWAYS** use environment variables
- ✅ **ALWAYS** keep backup in secure location
- ✅ **ROTATE** keys regularly (every 90 days)

### 🔍 Verify Security

Check that sensitive files are ignored:
```bash
git status --ignored
```

Should show:
```
Ignored files:
  app/phase6/.env
  app/.env.local
  .api-keys.secure
```

---

## 🧪 Testing API Keys

After configuration, test each API:

### Test Backend Health
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "phase": 6,
  "agents": {
    "meteorologist": "online",
    "auditor": "online",
    "arbiter": "online"
  }
}
```

### Test Phase 7 Forensics
```bash
curl http://localhost:8000/api/v1/forensics/health
```

Expected response (if Gemini key is valid):
```json
{
  "status": "healthy",
  "service": "Gemini Forensic Reporter",
  "api_connected": true
}
```

### Test Frontend
```bash
curl http://localhost:3000
```

Should return HTML (no errors).

---

## 🆘 Troubleshooting

### "API key not found" error

**Solution:** Re-run setup wizard
```bash
./setup-api-keys.sh
```

### "Invalid API key" error

**Solutions:**
1. Verify key is correct (check for typos)
2. Check API provider dashboard for key status
3. Ensure free tier limits not exceeded
4. Try regenerating the key

### Backend won't start

**Solution:** Check logs
```bash
tail -f /workspaces/Hyperion/phase6.log
```

Look for API-related errors and verify keys.

### Frontend can't connect to backend

**Solution:** Verify CORS settings
```bash
# Check backend is running
curl http://localhost:8000/health

# Check frontend env
cat /workspaces/Hyperion/app/.env.local | grep BACKEND_URL
```

---

## 💰 Cost Breakdown (Free Tier Limits)

| API | Free Tier | Cost After Limit |
|-----|-----------|------------------|
| **Blockfrost** | 50,000 requests/day | $0.001/request |
| **OpenWeather** | 1,000 calls/day | $0.0015/call |
| **Gemini** | 60 requests/minute | Free (current) |
| **Cardano Key** | Self-generated | FREE |
| **Secondary** | Varies | Varies |

**Estimated Monthly Usage (Active Project):**
- Blockfrost: ~5,000 requests/day (well within free tier)
- OpenWeather: ~100 calls/day (well within free tier)
- Gemini: ~50 requests/day (well within free tier)

**Total Monthly Cost: $0** (if within free tiers)

---

## 🔄 Updating API Keys

To update keys later:

### Option 1: Re-run Setup Wizard
```bash
./setup-api-keys.sh
```

### Option 2: Manual Edit
```bash
# Backend
nano /workspaces/Hyperion/app/phase6/.env

# Frontend
nano /workspaces/Hyperion/app/.env.local
```

After updating, restart services:
```bash
./start-hyperion.sh
```

---

## 📞 Support

If you encounter issues:

1. Check this documentation first
2. Review logs: `tail -f /workspaces/Hyperion/*.log`
3. Verify API keys in provider dashboards
4. Test each API independently
5. Check `.gitignore` is working: `git status --ignored`

---

## ✅ Checklist

Before starting the project, ensure:

- [ ] Blockfrost API key obtained (preprod)
- [ ] OpenWeatherMap API key obtained
- [ ] Google Gemini API key obtained
- [ ] Cardano signing key generated
- [ ] Ran `./setup-api-keys.sh` successfully
- [ ] All keys in `.env` files
- [ ] Files added to `.gitignore`
- [ ] Tested backend health endpoint
- [ ] Tested forensics health endpoint
- [ ] Frontend loads without errors

---

**Last Updated:** November 30, 2025  
**Project:** Hyperion - AI-Powered Parametric Insurance  
**Phase:** 7 of 12 (Phase 7: Gemini Forensic Reporting integrated)
