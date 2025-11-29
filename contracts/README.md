# Hyperion Smart Contracts

Aiken smart contracts for Cardano AI Parametric Insurance.

## Tech Stack

- **Language**: Aiken
- **Target**: Plutus V2

## Getting Started

```bash
# Install Aiken CLI: https://aiken-lang.org/installation-instructions
aiken build
aiken check
```

## Structure

```
contracts/
├── validators/   # Plutus validators
├── lib/          # Reusable contract libraries
└── aiken.toml    # Project configuration
```

## Validators

- **Insurance Policy**: Parametric insurance policy validator
- **Claims**: Automated claim processing validator
- **Treasury**: Insurance pool treasury management
