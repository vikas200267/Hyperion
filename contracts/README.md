# 📜 Hyperion Smart Contracts

Aiken smart contracts for the AI-Powered Parametric Insurance Protocol on Cardano.

## Overview

This module contains the on-chain logic for:
- ✅ **Phase 3: Oracle Validator** - Cryptographic weather data verification
- Policy creation and management
- Parametric trigger verification
- Automated claim payouts
- Oracle data validation

## Structure

```
contracts/
├── validators/              # Main contract validators
│   ├── phase3_oracle.ak     # ✅ Phase 3: Oracle validator (Ed25519 signatures)
│   └── insurance.ak         # ✅ Parametric insurance logic (Phase 3 integrated)
├── lib/                     # Shared libraries
│   ├── phase3_types.ak      # ✅ Phase 3 type definitions
│   └── types.ak             # Common type definitions
├── aiken.toml               # Aiken project configuration
└── .env.example             # Environment template
```

## 🚀 Phase 3 Integration (NEW)

**Phase 3: The "Truth" Validator** - Oracle logic that proves real-world events on-chain.

### Key Features
- ✅ Ed25519 cryptographic signature verification
- ✅ Parametric threshold logic (wind speed > 25 m/s)
- ✅ Replay protection via nonces
- ✅ Data freshness enforcement
- ✅ Location binding (prevents cross-region attacks)
- ✅ Real-time monitoring (< 60s response time)

### Quick Start

```bash
# 1. Compile contracts
aiken build

# 2. Deploy oracle (see docs/PHASE3_INTEGRATION.md)

# 3. Start Python backend
cd ../swarm
pip install -r requirements.txt
uvicorn app.main:app --reload

# 4. Initialize oracle
curl -X POST http://localhost:8000/api/v1/oracle/initialize \
  -H "Content-Type: application/json" \
  -d '{"oracle_sk": "...", "blockfrost_key": "...", "network": "testnet"}'
```

📖 **Full Documentation:** See [`/docs/PHASE3_INTEGRATION.md`](../docs/PHASE3_INTEGRATION.md)

## Prerequisites

- [Aiken](https://aiken-lang.org/) >= 1.0.0
- Cardano Node (for deployment)
- Blockfrost API key (optional, for testing)

## Building

```bash
# Install dependencies
aiken deps

# Build contracts
aiken build

# Run tests
aiken check
```

## Contract Architecture

### Phase 3: Oracle Datum & Redeemer

**Phase3OracleDatum:**
```aiken
{
  oracle_vk: ByteArray,           // Ed25519 public key (32 bytes)
  threshold_wind_speed: Int,       // Threshold in m/s × 100 (e.g., 2500 = 25.0 m/s)
  max_age_ms: Int,                 // Maximum data age (milliseconds)
  last_nonce: Int,                 // Replay protection counter
  location_id: ByteArray,          // Geographic binding
}
```

**Phase3OracleRedeemer:**
```aiken
{
  wind_speed: Int,                 // Measured wind speed (m/s × 100)
  measurement_time: Int,           // POSIX timestamp (milliseconds)
  nonce: Int,                      // Unique nonce (must exceed last_nonce)
  policy_id: ByteArray,            // Insurance policy identifier (28 bytes)
  location_id: ByteArray,          // Must match datum location_id
  signature: ByteArray,            // Ed25519 signature (64 bytes)
}
```

### PolicyState (Datum)
```
PolicyState {
  owner: ByteArray           -- Policy holder's public key hash
  premium_paid: Int          -- Premium amount in Lovelace
  coverage_amount: Int       -- Maximum payout amount
  trigger_threshold: Int     -- Wind speed threshold (m/s × 100)
  expiry_slot: Int           -- Policy expiration slot
  is_active: Bool            -- Policy active status
  oracle_ref: OutputReference -- ✅ Phase 3 oracle UTxO reference
  policy_id: ByteArray       -- ✅ 28-byte policy identifier
}
```

### PolicyAction (Redeemer)
- `CreatePolicy` - Create a new insurance policy
- `TriggerPayout { oracle_redeemer }` - ✅ Trigger payout using Phase 3 oracle data
- `CancelPolicy` - Cancel policy and return funds
- `ExpirePolicy` - Mark expired policy

### Phase 3 Integration Functions

Other validators can import Phase 3 oracle functions:

```aiken
use hyperion/contracts/validators/phase3_oracle.{
  phase3_oracle_triggered,     // Check if oracle was triggered
  phase3_get_wind_speed,        // Extract wind speed from redeemer
  phase3_verify_policy,         // Verify policy ID matches
  Phase3OracleRedeemer          // Type import
}
```

## Deployment

Deployment scripts will be added in the `/scripts` directory.

## Testing

```bash
# Run all contract tests
aiken check

# Run specific test
aiken check -m test_policy_creation
```

## Security Considerations

### Phase 3 Oracle Security
- ✅ **Ed25519 Signatures:** Cryptographically secure oracle data verification
- ✅ **Replay Protection:** Monotonic nonces prevent signature reuse
- ✅ **Data Freshness:** Max age enforcement prevents stale data attacks
- ✅ **Location Binding:** Geographic constraints prevent cross-region exploits
- ✅ **Key Management:** Oracle signing keys must be stored in HSM/secure enclave

### General Security
- Oracle signatures are verified on-chain
- Time-locked policies prevent early withdrawal
- Protocol fees are configurable by admin
- Multi-sig support for high-value policies

---

*Part of Project Hyperion - AI-Powered Parametric Insurance Protocol*
