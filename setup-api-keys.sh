#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# PROJECT HYPERION - API KEY CONFIGURATION WIZARD
# ═══════════════════════════════════════════════════════════════════════════
# Securely configure all API keys needed for real-time operation
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_ROOT="/workspaces/Hyperion"
PHASE6_ENV="$PROJECT_ROOT/app/phase6/.env"
FRONTEND_ENV="$PROJECT_ROOT/app/.env.local"
SECURE_KEYS="$PROJECT_ROOT/.api-keys.secure"

echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}          PROJECT HYPERION - API KEY CONFIGURATION WIZARD${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}This wizard will help you configure all API keys needed for real-time operation.${NC}"
echo -e "${YELLOW}All keys will be stored securely in .gitignore files.${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# REQUIRED APIs
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}API 1 of 5: CARDANO BLOCKCHAIN API (Blockfrost)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📋 Purpose:${NC}"
echo -e "   Connect to Cardano blockchain (read NFTs, submit transactions)"
echo ""
echo -e "${CYAN}🔗 How to get this API key:${NC}"
echo -e "   1. Visit: ${YELLOW}https://blockfrost.io${NC}"
echo -e "   2. Create a free account"
echo -e "   3. Create new project → Select ${YELLOW}'Preprod'${NC} network"
echo -e "   4. Copy the API key (starts with 'preprod...')"
echo ""
echo -e "${CYAN}💰 Cost:${NC} ${GREEN}FREE${NC} tier (50,000 requests/day)"
echo -e "${CYAN}📊 Usage:${NC} Frontend wallet connection, NFT reading"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════════════════${NC}"
read -p "Paste your Blockfrost API key here: " BLOCKFROST_KEY
echo ""

if [ -z "$BLOCKFROST_KEY" ]; then
    echo -e "${RED}❌ Error: Blockfrost API key is required!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Blockfrost API key saved${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}API 2 of 5: WEATHER DATA API (OpenWeatherMap)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📋 Purpose:${NC}"
echo -e "   Fetch real-time weather data for hurricane oracle validation"
echo ""
echo -e "${CYAN}🔗 How to get this API key:${NC}"
echo -e "   1. Visit: ${YELLOW}https://openweathermap.org/api${NC}"
echo -e "   2. Sign up for free account"
echo -e "   3. Navigate to 'API Keys' in your account"
echo -e "   4. Copy your default API key OR generate new one"
echo -e "   5. Subscribe to ${YELLOW}'One Call API 3.0'${NC} (free tier)"
echo ""
echo -e "${CYAN}💰 Cost:${NC} ${GREEN}FREE${NC} tier (1,000 calls/day)"
echo -e "${CYAN}📊 Usage:${NC} Phase 6 Meteorologist agent, wind speed monitoring"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════════════════${NC}"
read -p "Paste your OpenWeatherMap API key here: " OPENWEATHER_KEY
echo ""

if [ -z "$OPENWEATHER_KEY" ]; then
    echo -e "${RED}❌ Error: OpenWeatherMap API key is required!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ OpenWeatherMap API key saved${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}API 3 of 5: AI REPORTING API (Google Gemini)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📋 Purpose:${NC}"
echo -e "   Generate AI-powered forensic reports explaining insurance claims"
echo ""
echo -e "${CYAN}🔗 How to get this API key:${NC}"
echo -e "   1. Visit: ${YELLOW}https://makersuite.google.com/app/apikey${NC}"
echo -e "   2. Sign in with your Google account"
echo -e "   3. Click ${YELLOW}'Create API Key'${NC} button"
echo -e "   4. Copy the generated key"
echo ""
echo -e "${CYAN}💰 Cost:${NC} ${GREEN}FREE${NC} tier (60 requests/minute)"
echo -e "${CYAN}📊 Usage:${NC} Phase 7 Forensic Reporting, AI claim explanations"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════════════════${NC}"
read -p "Paste your Google Gemini API key here: " GEMINI_KEY
echo ""

if [ -z "$GEMINI_KEY" ]; then
    echo -e "${RED}❌ Error: Gemini API key is required!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Gemini API key saved${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}API 4 of 5: CARDANO SIGNING KEY (Ed25519)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📋 Purpose:${NC}"
echo -e "   Sign oracle messages for cryptographic verification on-chain"
echo ""
echo -e "${CYAN}🔑 Choose an option:${NC}"
echo -e "   ${GREEN}1)${NC} Generate new secure key ${YELLOW}(RECOMMENDED)${NC}"
echo -e "   ${GREEN}2)${NC} Provide your existing key"
echo ""
read -p "Enter your choice [1 or 2]: " CARDANO_CHOICE
echo ""

if [ "$CARDANO_CHOICE" = "1" ]; then
    echo -e "${YELLOW}🔐 Generating new Ed25519 signing key...${NC}"
    CARDANO_SK_HEX=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    echo -e "${GREEN}✅ Generated secure key: ${CARDANO_SK_HEX:0:16}...${CARDANO_SK_HEX: -8}${NC}"
    echo -e "${YELLOW}⚠️  Save this key! It will be stored in .env file.${NC}"
else
    echo -e "${CYAN}Enter your Ed25519 private key (64 hexadecimal characters):${NC}"
    read -p "Key: " CARDANO_SK_HEX
    
    if [ ${#CARDANO_SK_HEX} -ne 64 ]; then
        echo -e "${RED}❌ Error: Key must be exactly 64 hex characters!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Cardano signing key saved${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}API 5 of 8: NEWS API (NewsAPI.org) - Optional${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📋 Purpose:${NC}"
echo -e "   Validate hurricane events through news articles and media reports"
echo ""
echo -e "${CYAN}🔗 How to get this API key:${NC}"
echo -e "   1. Visit: ${YELLOW}https://newsapi.org${NC}"
echo -e "   2. Click ${YELLOW}'Get API Key'${NC} → Sign up for free"
echo -e "   3. Verify your email"
echo -e "   4. Copy your API key from dashboard"
echo ""
echo -e "${CYAN}💰 Cost:${NC} ${GREEN}FREE${NC} tier (100 requests/day)"
echo -e "${CYAN}📊 Usage:${NC} Phase 6 Auditor agent - Cross-reference weather events"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════════════════${NC}"
read -p "Paste NewsAPI key (or press Enter to skip): " NEWSAPI_KEY
echo ""

if [ -z "$NEWSAPI_KEY" ]; then
    echo -e "${YELLOW}⚠️  Skipped - Will use mock news validation${NC}"
    NEWSAPI_KEY=""
else
    echo -e "${GREEN}✅ NewsAPI key saved${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}API 6 of 8: FLIGHT DATA API (FlightAware) - Optional${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📋 Purpose:${NC}"
echo -e "   Validate severe weather through flight cancellations and diversions"
echo ""
echo -e "${CYAN}🔗 How to get this API key:${NC}"
echo -e "   1. Visit: ${YELLOW}https://flightaware.com/commercial/flightxml/${NC}"
echo -e "   2. Create account and request FlightXML access"
echo -e "   3. Choose a plan (or request trial)"
echo -e "   4. Get your API key from account settings"
echo ""
echo -e "${CYAN}💰 Cost:${NC} ${YELLOW}Paid${NC} (Trial available, ~\$90/month)"
echo -e "${CYAN}📊 Usage:${NC} Phase 6 Auditor agent - Verify storm severity via flights"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════════════════${NC}"
read -p "Paste FlightAware API key (or press Enter to skip): " FLIGHTAWARE_KEY
echo ""

if [ -z "$FLIGHTAWARE_KEY" ]; then
    echo -e "${YELLOW}⚠️  Skipped - Will use mock flight validation${NC}"
    FLIGHTAWARE_KEY=""
else
    echo -e "${GREEN}✅ FlightAware API key saved${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}API 7 of 8: NOAA WEATHER API (NOAA/NCDC) - Optional${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📋 Purpose:${NC}"
echo -e "   Official US government weather data for authoritative validation"
echo ""
echo -e "${CYAN}🔗 How to get this API key:${NC}"
echo -e "   1. Visit: ${YELLOW}https://www.ncdc.noaa.gov/cdo-web/token${NC}"
echo -e "   2. Enter your email address"
echo -e "   3. Check email for API token"
echo -e "   4. Token will be sent within minutes"
echo ""
echo -e "${CYAN}💰 Cost:${NC} ${GREEN}FREE${NC} (1,000 requests/day)"
echo -e "${CYAN}📊 Usage:${NC} Phase 6 Auditor agent - Government-verified weather data"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════════════════${NC}"
read -p "Paste NOAA API token (or press Enter to skip): " NOAA_KEY
echo ""

if [ -z "$NOAA_KEY" ]; then
    echo -e "${YELLOW}⚠️  Skipped - Will use mock NOAA validation${NC}"
    NOAA_KEY=""
else
    echo -e "${GREEN}✅ NOAA API key saved${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}API 8 of 8: BACKUP WEATHER API (Optional)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📋 Purpose:${NC}"
echo -e "   Backup weather data source for redundancy"
echo ""
echo -e "${CYAN}🔗 Options:${NC}"
echo -e "   • ${YELLOW}WeatherAPI.com${NC} (https://weatherapi.com)"
echo -e "   • ${YELLOW}Weatherbit${NC} (https://weatherbit.io)"
echo -e "   • ${YELLOW}Tomorrow.io${NC} (https://tomorrow.io)"
echo ""
echo -e "${CYAN}💰 Cost:${NC} ${GREEN}FREE${NC} tiers available"
echo -e "${CYAN}📊 Usage:${NC} Fallback if primary weather API fails"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════════════════${NC}"
read -p "Paste backup weather API key (or press Enter to skip): " BACKUP_WEATHER_KEY
echo ""

if [ -z "$BACKUP_WEATHER_KEY" ]; then
    echo -e "${YELLOW}⚠️  Skipped - Will rely on primary weather API only${NC}"
    BACKUP_WEATHER_KEY=""
else
    echo -e "${GREEN}✅ Backup weather API key saved${NC}"
fi

# ═══════════════════════════════════════════════════════════════════════════
# SAVE CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Saving Configuration...${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"

# Update Phase 6 Backend .env
cat > "$PHASE6_ENV" << ENVEOF
# ═══════════════════════════════════════════════════════════════════════════
# PROJECT HYPERION - PHASE 6: ENVIRONMENT VARIABLES (PRODUCTION)
# Generated: $(date)
# ═══════════════════════════════════════════════════════════════════════════

# REQUIRED: Weather API (OpenWeatherMap)
OPENWEATHER_API_KEY=$OPENWEATHER_KEY

# REQUIRED: Cardano Signing Key (Ed25519)
CARDANO_SK_HEX=$CARDANO_SK_HEX

# OPTIONAL: Secondary Validation APIs
NEWSAPI_KEY=$NEWSAPI_KEY
FLIGHTAWARE_API_KEY=$FLIGHTAWARE_KEY
NOAA_API_KEY=$NOAA_KEY
BACKUP_WEATHER_API_KEY=$BACKUP_WEATHER_KEY

# Legacy field for backward compatibility
SECONDARY_API_KEY=$NEWSAPI_KEY

# PHASE 7: Google Gemini AI (Forensic Reporting)
GEMINI_API_KEY=$GEMINI_KEY
GEMINI_RATE_LIMIT=60

# Server Configuration
PHASE6_LOG_LEVEL=INFO
PHASE6_HOST=0.0.0.0
PHASE6_PORT=8000
PHASE6_WORKERS=1
ENVEOF

echo -e "${GREEN}✅ Updated: $PHASE6_ENV${NC}"

# Update Frontend .env.local
cat > "$FRONTEND_ENV" << ENVEOF
# ═══════════════════════════════════════════════════════════════════════════
# PROJECT HYPERION - FRONTEND: ENVIRONMENT VARIABLES
# Generated: $(date)
# ═══════════════════════════════════════════════════════════════════════════

# Cardano Blockchain API (Blockfrost)
NEXT_PUBLIC_BLOCKFROST_API_KEY=$BLOCKFROST_KEY
NEXT_PUBLIC_CARDANO_NETWORK=preprod

# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000

# Phase 6 Oracle
NEXT_PUBLIC_ORACLE_PUBKEY_HASH=auto_generated_from_backend

# Feature Flags
NEXT_PUBLIC_ENABLE_PHASE7_FORENSICS=true
NEXT_PUBLIC_ENABLE_WALLET_CONNECT=true
ENVEOF

echo -e "${GREEN}✅ Updated: $FRONTEND_ENV${NC}"

# Save to secure backup (for reference only)
cat > "$SECURE_KEYS" << SECUREEOF
# ═══════════════════════════════════════════════════════════════════════════
# PROJECT HYPERION - API KEYS BACKUP (SECURE)
# Generated: $(date)
# WARNING: This file contains sensitive credentials
# ═══════════════════════════════════════════════════════════════════════════

# REQUIRED APIs
BLOCKFROST_API_KEY=$BLOCKFROST_KEY
OPENWEATHER_API_KEY=$OPENWEATHER_KEY
GEMINI_API_KEY=$GEMINI_KEY
CARDANO_SK_HEX=$CARDANO_SK_HEX

# OPTIONAL SECONDARY VALIDATION APIs
NEWSAPI_KEY=$NEWSAPI_KEY
FLIGHTAWARE_API_KEY=$FLIGHTAWARE_KEY
NOAA_API_KEY=$NOAA_KEY
BACKUP_WEATHER_API_KEY=$BACKUP_WEATHER_KEY

# Verification Key (derived from signing key)
# Run: python3 -c "from app.phase6.app.services.cardano_signer import CardanoSigner; print(CardanoSigner('$CARDANO_SK_HEX').verification_key_hex)"
SECUREEOF

chmod 600 "$SECURE_KEYS"
echo -e "${GREEN}✅ Created secure backup: $SECURE_KEYS${NC}"

# ═══════════════════════════════════════════════════════════════════════════
# UPDATE .gitignore
# ═══════════════════════════════════════════════════════════════════════════

GITIGNORE="$PROJECT_ROOT/.gitignore"

if ! grep -q ".api-keys.secure" "$GITIGNORE" 2>/dev/null; then
    cat >> "$GITIGNORE" << GITEOF

# ═══════════════════════════════════════════════════════════════════════════
# API Keys & Sensitive Configuration (DO NOT COMMIT)
# ═══════════════════════════════════════════════════════════════════════════
.env
.env.local
.env.*.local
*.env
.api-keys.secure
app/phase6/.env
app/.env.local
swarm/.env

# Python cache
__pycache__/
*.pyc
.pytest_cache/

# Node modules
node_modules/
.next/

# Logs
*.log
phase6.log
nextjs.log

# IDEs
.vscode/
.idea/
GITEOF
    echo -e "${GREEN}✅ Updated: .gitignore${NC}"
else
    echo -e "${YELLOW}ℹ️  .gitignore already configured${NC}"
fi

# ═══════════════════════════════════════════════════════════════════════════
# VERIFICATION
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Configuration Summary${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ Blockfrost API:${NC} ${BLOCKFROST_KEY:0:15}...${BLOCKFROST_KEY: -5}"
echo -e "${GREEN}✅ OpenWeather API:${NC} ${OPENWEATHER_KEY:0:10}...${OPENWEATHER_KEY: -3}"
echo -e "${GREEN}✅ Gemini API:${NC} ${GEMINI_KEY:0:10}...${GEMINI_KEY: -3}"
echo -e "${GREEN}✅ Cardano Signing Key:${NC} ${CARDANO_SK_HEX:0:16}...${CARDANO_SK_HEX: -8}"

echo ""
echo -e "${YELLOW}Optional Secondary APIs:${NC}"
if [ -n "$NEWSAPI_KEY" ]; then
    echo -e "${GREEN}✅ NewsAPI:${NC} ${NEWSAPI_KEY:0:10}...${NEWSAPI_KEY: -3}"
else
    echo -e "${YELLOW}⚠️  NewsAPI:${NC} Not configured (using mock data)"
fi

if [ -n "$FLIGHTAWARE_KEY" ]; then
    echo -e "${GREEN}✅ FlightAware API:${NC} ${FLIGHTAWARE_KEY:0:10}...${FLIGHTAWARE_KEY: -3}"
else
    echo -e "${YELLOW}⚠️  FlightAware API:${NC} Not configured (using mock data)"
fi

if [ -n "$NOAA_KEY" ]; then
    echo -e "${GREEN}✅ NOAA API:${NC} ${NOAA_KEY:0:10}...${NOAA_KEY: -3}"
else
    echo -e "${YELLOW}⚠️  NOAA API:${NC} Not configured (using mock data)"
fi

if [ -n "$BACKUP_WEATHER_KEY" ]; then
    echo -e "${GREEN}✅ Backup Weather API:${NC} ${BACKUP_WEATHER_KEY:0:10}...${BACKUP_WEATHER_KEY: -3}"
else
    echo -e "${YELLOW}⚠️  Backup Weather API:${NC} Not configured (single source)"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Security Status${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ API keys stored in environment files${NC}"
echo -e "${GREEN}✅ Files added to .gitignore${NC}"
echo -e "${GREEN}✅ Secure backup created: .api-keys.secure${NC}"
echo -e "${YELLOW}⚠️  NEVER commit .env files to git${NC}"
echo -e "${YELLOW}⚠️  Keep .api-keys.secure file private${NC}"

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Next Steps${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "1. ${GREEN}Start the project:${NC}"
echo -e "   ${YELLOW}./start-hyperion.sh${NC}"
echo ""
echo -e "2. ${GREEN}Test API connections:${NC}"
echo -e "   ${YELLOW}curl http://localhost:8000/health${NC}"
echo -e "   ${YELLOW}curl http://localhost:8000/api/v1/forensics/health${NC}"
echo ""
echo -e "3. ${GREEN}Visit frontend:${NC}"
echo -e "   ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}✅ Configuration complete!${NC}"
echo ""

