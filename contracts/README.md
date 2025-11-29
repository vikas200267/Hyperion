# 📜 Hyperion Smart Contracts

Aiken smart contracts for the AI-Powered Parametric Insurance Protocol on Cardano.

## Overview

This module contains the on-chain logic for:
- Policy creation and management
- Parametric trigger verification
- Automated claim payouts
- Oracle data validation

## Structure

```
contracts/
├── validators/           # Main contract validators
│   └── insurance.ak      # Parametric insurance logic
├── lib/                  # Shared libraries
│   └── types.ak          # Common type definitions
├── aiken.toml            # Aiken project configuration
└── .env.example          # Environment template
```

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

### PolicyState (Datum)
```
PolicyState {
  owner: ByteArray        -- Policy holder's public key hash
  premium_paid: Int       -- Premium amount in Lovelace
  coverage_amount: Int    -- Maximum payout amount
  trigger_threshold: Int  -- Parametric trigger value
  expiry_slot: Int        -- Policy expiration slot
  is_active: Bool         -- Policy active status
}
```

### PolicyAction (Redeemer)
- `CreatePolicy` - Create a new insurance policy
- `TriggerPayout` - Trigger payout based on oracle data
- `CancelPolicy` - Cancel policy and return funds
- `ExpirePolicy` - Mark expired policy

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

- Oracle signatures are verified on-chain
- Time-locked policies prevent early withdrawal
- Protocol fees are configurable by admin
- Multi-sig support for high-value policies

---

*Part of Project Hyperion - AI-Powered Parametric Insurance Protocol*
