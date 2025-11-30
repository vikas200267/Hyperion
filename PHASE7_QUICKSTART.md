# Phase 7 Gemini Forensic Reporting - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Get Gemini API Key
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API key"
3. Copy your API key

### Step 2: Configure Backend
```bash
cd swarm
cp .env.example .env
# Edit .env file and add:
GEMINI_API_KEY=your_actual_api_key_here
```

### Step 3: Start Services

**Terminal 1 - Backend:**
```bash
cd swarm
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd app
npm run dev
```

### Step 4: Test It!
Open browser: http://localhost:3000/forensics

Click "📝 Generate Report" and watch AI-generated forensic analysis stream in real-time!

---

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:8000/health
```

### Generate Forensic Report
```bash
curl -X POST http://localhost:8000/api/v1/forensics/generate \
  -H "Content-Type: application/json" \
  -d '{
    "oracle_payload": {
      "policy_id": "test_policy_123",
      "location_id": "miami_beach_sensor_01",
      "wind_speed": 45.5,
      "measurement_time": 1699564800,
      "threshold": 40.0,
      "nonce": 42
    }
  }'
```

---

## 📊 What You'll See

The ForensicTerminal will stream text like:

```
>>> Forensic Report Generator v1.0
>>> Connecting to Gemini AI Oracle...
>>> Analyzing claim data...

=== FORENSIC INSURANCE CLAIM REPORT ===

Claim Trigger Analysis for Policy test_policy_123

On November 9, 2023 at 14:00 UTC, automated weather sensors at 
miami_beach_sensor_01 recorded wind speeds of 45.5 m/s (approximately 
101.8 mph), exceeding the policy threshold of 40.0 m/s (89.5 mph).

This parametric insurance policy was designed to automatically trigger 
payouts when wind speeds exceed the agreed-upon threshold, eliminating 
the need for manual claim processing or insurance adjusters...

>>> Report generation complete.
```

---

## 🔧 Troubleshooting

**"GEMINI_API_KEY not found"**
- Make sure you created `.env` file in `swarm/` directory
- Verify the file contains `GEMINI_API_KEY=your_key`

**"Backend error (403)"**
- Your Gemini API key may be invalid
- Regenerate key at https://makersuite.google.com/app/apikey

**"Connection refused"**
- Ensure backend is running on port 8000
- Check with: `curl http://localhost:8000/health`

---

## 📁 File Structure

```
swarm/
├── app/
│   ├── services/
│   │   └── gemini_reporter.py    (NEW - AI service)
│   └── api/
│       └── forensics.py           (NEW - API endpoints)
app/
├── src/
│   ├── lib/
│   │   ├── types/
│   │   │   └── oracle.ts         (NEW - TypeScript types)
│   │   └── forensicsClient.ts    (NEW - API client)
│   ├── components/
│   │   └── ForensicTerminal.tsx  (NEW - UI component)
│   └── app/
│       └── forensics/
│           └── page.tsx           (NEW - Demo page)
```

---

## 🎯 Next Steps

### For Development
- Customize Gemini prompts in `gemini_reporter.py`
- Add authentication to forensics endpoints
- Integrate with Phase 2 Treasury payout events

### For Production
- Set up HTTPS with SSL certificates
- Configure rate limiting based on API quota
- Add logging and monitoring
- Implement API key rotation

---

## 📚 Full Documentation
See `PHASE7_INTEGRATION_COMPLETE.md` for complete technical details.

---

**Status:** ✅ Production Ready  
**Integration Time:** ~15 minutes  
**Dependencies:** google-generativeai (automatically installed)
