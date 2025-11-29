# Phase 3 Oracle Integration Guide

## 🎯 Overview

Phase 3 implements the **"Truth" Validator** - the oracle logic that proves "it rained" on the blockchain. This is the critical component that bridges real-world weather data with on-chain parametric insurance logic.

### Key Principle: Code is Law ⚖️

The parametric trigger threshold (`wind_speed > 25.0 m/s`) is hardcoded in the **on-chain Aiken validator**, not hidden in off-chain Python. This ensures transparent, immutable business logic.

## 📁 File Structure

```
contracts/
├── validators/
│   ├── phase3_oracle.ak          ✅ Main oracle validator
│   └── insurance.ak               ✅ Updated with Phase 3 integration
└── lib/
    ├── phase3_types.ak            ✅ Shared type definitions
    └── types.ak                   (existing)

swarm/
└── app/
    ├── agents/
    │   └── phase3_oracle_client.py ✅ Python oracle client
    └── api/
        └── oracle.py               ✅ FastAPI endpoints
```

## 🔧 Smart Contract Components

### 1. Phase 3 Oracle Validator (`phase3_oracle.ak`)

**Purpose:** Verify cryptographically signed weather data and trigger payouts

**Key Features:**
- ✅ Ed25519 signature verification
- ✅ Replay protection via nonces
- ✅ Data freshness enforcement (max age)
- ✅ Location binding (prevents cross-region attacks)
- ✅ Parametric threshold logic (wind speed)

**Validation Steps:**
1. Verify Ed25519 signature from trusted oracle
2. Check location ID matches policy
3. Verify wind speed >= threshold
4. Ensure data is fresh (not stale)
5. Prevent nonce replay attacks
6. Validate state continuation

### 2. Integration Exports

Other validators can import Phase 3 functions:

```aiken
use hyperion/contracts/validators/phase3_oracle.{
  phase3_oracle_triggered,     // Check if oracle fired
  phase3_get_wind_speed,        // Extract wind data
  phase3_verify_policy,         // Validate policy ID
  Phase3OracleRedeemer          // Type import
}
```

### 3. Insurance Validator Integration

The `insurance.ak` validator now integrates with Phase 3:

```aiken
TriggerPayout { oracle_redeemer } -> {
  // ✅ Verify oracle was triggered
  expect phase3_oracle_triggered(policy.oracle_ref, ctx)
  
  // ✅ Verify policy ID matches
  expect phase3_verify_policy(oracle_redeemer, policy.policy_id)
  
  // ✅ Extract and validate wind speed
  let wind_speed = phase3_get_wind_speed(oracle_redeemer)
  expect wind_speed >= policy.trigger_threshold
  
  // ✅ Authorize payout
  True
}
```

## 🐍 Off-Chain Components

### 1. Phase3OracleClient (`phase3_oracle_client.py`)

**Features:**
- Ed25519 signing matching on-chain format
- Real-time weather monitoring (< 60s response)
- Automatic transaction building with PyCardano
- Nonce management and replay protection

**Key Methods:**

```python
client = Phase3OracleClient(
    oracle_sk_hex="...",
    blockfrost_project_id="...",
    network="testnet"
)

# Sign oracle data
signature = client.sign_oracle_data(
    policy_id=policy_id,
    location_id=location_id,
    wind_speed=2500,  # 25.0 m/s × 100
    measurement_time=timestamp,
    nonce=nonce
)

# Start real-time monitoring
await client.monitor_weather_realtime(
    oracle_utxo_ref="txhash#0",
    policy_id=policy_id,
    location_id=location_id,
    poll_interval=30  # Check every 30 seconds
)
```

### 2. FastAPI Oracle Endpoints (`oracle.py`)

#### Initialize Oracle
```bash
POST /api/v1/oracle/initialize
{
  "oracle_sk": "your_signing_key_hex",
  "blockfrost_key": "your_blockfrost_key",
  "network": "testnet"
}
```

#### Manual Trigger
```bash
POST /api/v1/oracle/trigger
{
  "oracle_utxo_ref": "txhash#0",
  "policy_id": "28_byte_hex",
  "location_id": "NYC_JFK_AIRPORT",
  "wind_speed": 28.5
}
```

#### Start Monitoring
```bash
POST /api/v1/oracle/monitor/start
{
  "oracle_utxo_ref": "txhash#0",
  "policy_id": "28_byte_hex",
  "location_id": "NYC_JFK_AIRPORT",
  "poll_interval": 30
}
```

#### Check Status
```bash
GET /api/v1/oracle/monitor/status
```

## 🚀 Deployment Guide

### Step 1: Install Dependencies

```bash
cd /workspaces/Hyperion/swarm
pip install -r requirements.txt
```

This installs:
- `pycardano>=0.11.0` - Cardano transaction building
- `PyNaCl>=1.5.0` - Ed25519 cryptography

### Step 2: Compile Aiken Contracts

```bash
cd /workspaces/Hyperion/contracts
aiken build
```

This generates `plutus.json` with compiled validators.

### Step 3: Generate Oracle Keys

```python
from nacl.signing import SigningKey

# Generate Ed25519 keypair
sk = SigningKey.generate()
vk = sk.verify_key

print(f"Secret Key: {sk.encode().hex()}")
print(f"Verify Key: {vk.encode().hex()}")

# ⚠️ KEEP SECRET KEY SECURE - Use HSM in production
```

### Step 4: Deploy Oracle Script

```bash
# 1. Get script address
cardano-cli address build \
  --payment-script-file plutus.json \
  --out-file oracle.addr \
  --testnet-magic 1

# 2. Create initial datum
cat > oracle_datum.json <<EOF
{
  "constructor": 0,
  "fields": [
    {"bytes": "YOUR_ORACLE_VK_HEX"},
    {"int": 2500},              # 25.0 m/s threshold
    {"int": 3600000},           # 1 hour max age
    {"int": 0},                 # Initial nonce
    {"bytes": "4e59435f4a464b"} # "NYC_JFK" hex
  ]
}
EOF

# 3. Lock initial UTxO
cardano-cli transaction build \
  --tx-in YOUR_FUNDING_UTXO \
  --tx-out $(cat oracle.addr)+5000000 \
  --tx-out-inline-datum-file oracle_datum.json \
  --change-address YOUR_WALLET_ADDR \
  --out-file tx.raw \
  --testnet-magic 1

cardano-cli transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --out-file tx.signed

cardano-cli transaction submit \
  --tx-file tx.signed \
  --testnet-magic 1
```

### Step 5: Start Backend Services

```bash
cd /workspaces/Hyperion/swarm
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit: `http://localhost:8000/docs` for interactive API documentation

### Step 6: Initialize Oracle Client

```bash
curl -X POST http://localhost:8000/api/v1/oracle/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "oracle_sk": "YOUR_SECRET_KEY_HEX",
    "blockfrost_key": "YOUR_BLOCKFROST_KEY",
    "network": "testnet"
  }'
```

### Step 7: Start Real-Time Monitoring

```bash
curl -X POST http://localhost:8000/api/v1/oracle/monitor/start \
  -H "Content-Type: application/json" \
  -d '{
    "oracle_utxo_ref": "YOUR_ORACLE_TX#0",
    "policy_id": "YOUR_POLICY_ID_28_BYTES_HEX",
    "location_id": "NYC_JFK_AIRPORT",
    "poll_interval": 30
  }'
```

## 🔬 Testing

### Unit Test (Signature Verification)

```python
import asyncio
from swarm.app.agents.phase3_oracle_client import Phase3OracleClient

async def test_signing():
    client = Phase3OracleClient(
        oracle_sk_hex="your_test_key",
        blockfrost_project_id="test",
        network="testnet"
    )
    
    signature = client.sign_oracle_data(
        policy_id=b"\x00" * 28,
        location_id=b"TEST_LOC",
        wind_speed=2500,
        measurement_time=1700000000000,
        nonce=1
    )
    
    assert len(signature) == 64
    print(f"✅ Signature: {signature.hex()}")

asyncio.run(test_signing())
```

### Integration Test (Below Threshold)

```bash
# Should fail - wind speed below threshold
curl -X POST http://localhost:8000/api/v1/oracle/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "wind_speed": 20.0,
    "policy_id": "..."
  }'

# Expected: "Phase 3: Wind speed below threshold - no payout trigger"
```

### Integration Test (Above Threshold)

```bash
# Should succeed - wind speed above threshold
curl -X POST http://localhost:8000/api/v1/oracle/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "wind_speed": 30.0,
    "policy_id": "..."
  }'

# Expected: Transaction hash + confirmation
```

## 🔐 Security Considerations

### 1. Key Management
- ⚠️ **CRITICAL:** Keep oracle signing key in HSM or secure enclave
- Use separate keys for testnet vs mainnet
- Implement key rotation procedures
- Never commit keys to version control

### 2. Oracle Redundancy
- Deploy multiple oracle instances (M-of-N signatures)
- Use multiple data sources (OpenWeatherMap, NOAA, IoT sensors)
- Implement fallback mechanisms

### 3. Data Freshness
- Set `max_age_ms` conservatively (e.g., 1 hour = 3600000 ms)
- Monitor for stale data attacks
- Validate measurement timestamps

### 4. Replay Protection
- Nonce must strictly increase
- Monitor for replay attempts
- Log all signature verifications

### 5. Location Binding
- Verify location_id matches policy coverage area
- Prevent cross-region oracle reuse

## 📊 Performance Metrics

### Target Latency
- **Event Detection:** < 30 seconds (polling interval)
- **Oracle Trigger:** < 20 seconds (Cardano block time)
- **Total Response:** < 60 seconds (end-to-end)

### Throughput
- Ed25519 signature verification: < 100ms
- Transaction building: < 1 second
- Network confirmation: ~20 seconds (Cardano avg)

## 🔄 Integration with Other Phases

### Phase 4: Payout Validator (Future)

```aiken
// Phase 4 will consume Phase 3 oracle triggers
use hyperion/contracts/validators/phase3_oracle.{phase3_oracle_triggered}

validator phase4_payout {
  spend(...) {
    // Verify Phase 3 oracle triggered
    expect phase3_oracle_triggered(oracle_ref, ctx)
    
    // Calculate payout amount
    let payout = calculate_payout(...)
    
    // Authorize transfer
    True
  }
}
```

### Phase 5-12: Risk Scoring, Treasury, etc.

All future phases can import Phase 3 functions via:

```aiken
use hyperion/contracts/validators/phase3_oracle
```

No merge conflicts - namespaced design!

## 🐛 Troubleshooting

### Issue: "Phase 3: Invalid Ed25519 signature"

**Cause:** Message format mismatch between on-chain and off-chain

**Solution:** Verify `build_canonical_message()` in Python exactly matches `phase3_build_message()` in Aiken

### Issue: "Phase 3: Nonce replay detected"

**Cause:** Using old nonce or concurrent submissions

**Solution:** Always increment nonce from current datum's `last_nonce + 1`

### Issue: "Phase 3: Weather data too old"

**Cause:** Measurement timestamp outside freshness window

**Solution:** Reduce polling interval or increase `max_age_ms` in datum

### Issue: "Oracle UTxO not found"

**Cause:** UTxO spent by another transaction or incorrect reference

**Solution:** Query latest oracle UTxO before triggering

## 📚 Additional Resources

- [Aiken Documentation](https://aiken-lang.org/)
- [PyCardano Docs](https://pycardano.readthedocs.io/)
- [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)
- [BlockFrost API](https://blockfrost.io/)

## ✅ Verification Checklist

- [ ] Aiken contracts compile successfully
- [ ] Oracle keys generated and secured
- [ ] Oracle script deployed to testnet
- [ ] Python dependencies installed
- [ ] FastAPI backend running
- [ ] Oracle client initialized
- [ ] Real-time monitoring started
- [ ] Test trigger (below threshold) fails correctly
- [ ] Test trigger (above threshold) succeeds
- [ ] Nonce increments properly
- [ ] Transaction confirms on blockchain

## 🎉 Success Criteria

**Phase 3 is successfully integrated when:**

1. ✅ Oracle validator compiles without errors
2. ✅ Insurance validator imports Phase 3 functions
3. ✅ Python client signs data matching on-chain format
4. ✅ FastAPI endpoints respond correctly
5. ✅ Real-time monitoring detects threshold events
6. ✅ Transactions confirm on Cardano testnet
7. ✅ No conflicts with existing codebase

---

**Next Steps:** Proceed to Phase 4 (Payout Validator) to complete the end-to-end insurance flow.
