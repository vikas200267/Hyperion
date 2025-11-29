# Cardano Blockchain Integration

## Overview

This integration uses **Blockfrost API** via **MeshJS** to rapidly query the Cardano blockchain without running a local full node. It provides real-time access to:

- ✅ Asset balances (ADA and native tokens)
- ✅ Transaction history
- ✅ Smart contract data
- ✅ Policy NFT ownership
- ✅ Treasury statistics

---

## 🚀 Quick Start

### 1. Installation

The `@meshsdk/core` package is already installed in the project:

```json
"@meshsdk/core": "^1.6.0"
```

### 2. Configuration

Update your `.env.local` file (copy from `.env.example`):

```bash
# Blockfrost API Configuration
NEXT_PUBLIC_BLOCKFROST_KEY=preprodbcpV680ZAfVbVXQn2fvz5kLeJJQOOhK9
NEXT_PUBLIC_CARDANO_NETWORK=preprod

# Smart Contract Addresses (Update after deployment)
NEXT_PUBLIC_TREASURY_ADDRESS=addr_test1...
NEXT_PUBLIC_POLICY_ID_HURRICANE=1234abcd...
NEXT_PUBLIC_POLICY_ID_FLIGHT=5678efgh...
NEXT_PUBLIC_POLICY_ID_CROP=9012ijkl...

# Feature Flags
NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true
```

### 3. Get Your Blockfrost API Key

1. Visit [https://blockfrost.io/](https://blockfrost.io/)
2. Sign up for a free account
3. Create a new project for **Preprod** (testnet)
4. Copy your API key and add it to `.env.local`

---

## 📁 File Structure

```
app/src/
├── lib/
│   ├── blockchain.ts       # Core blockchain integration
│   ├── config.ts          # Configuration management
│   └── wallet.ts          # Wallet utilities
└── hooks/
    └── use-blockchain.ts  # React hooks for blockchain data
```

---

## 🔧 Core Functions

### `blockchain.ts`

Main blockchain interaction layer:

```typescript
import { 
  blockchainProvider, 
  fetchAddressBalance,
  fetchAddressAssets,
  fetchUserPolicies,
  fetchProtocolStats,
  fetchTreasuryTVL 
} from '@/lib/blockchain';

// Fetch wallet balance (in Lovelace)
const balance = await fetchAddressBalance('addr1...');

// Fetch all assets/NFTs
const assets = await fetchAddressAssets('addr1...');

// Fetch user's policy NFTs
const policies = await fetchUserPolicies('addr1...');

// Fetch protocol statistics
const stats = await fetchProtocolStats();

// Fetch treasury TVL
const tvl = await fetchTreasuryTVL();
```

### `wallet.ts`

Wallet utility functions:

```typescript
import { 
  getWalletBalance,
  getWalletAssets,
  getWalletPolicies,
  lovelaceToAda,
  adaToLovelace,
  truncateAddress 
} from '@/lib/wallet';

// Get wallet balance in ADA
const ada = await getWalletBalance('addr1...');

// Convert between ADA and Lovelace
const lovelace = adaToLovelace(100); // 100 ADA -> 100,000,000 Lovelace
const ada = lovelaceToAda(100000000); // 100,000,000 Lovelace -> "100.000000" ADA

// Truncate address for display
const short = truncateAddress('addr1vpu...xyz', 8); // "addr1vpu...xyz"
```

---

## ⚛️ React Hooks

### `use-blockchain.ts`

Easy-to-use React hooks for components:

#### 1. Wallet Balance Hook

```typescript
import { useWalletBalance } from '@/hooks/use-blockchain';

function MyComponent() {
  const { balance, loading, error, refetch } = useWalletBalance(walletAddress);
  
  if (loading) return <div>Loading balance...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Balance: {balance} ADA</div>;
}
```

#### 2. Wallet Assets Hook

```typescript
import { useWalletAssets } from '@/hooks/use-blockchain';

function MyComponent() {
  const { assets, loading, error, refetch } = useWalletAssets(walletAddress);
  
  return (
    <div>
      {assets.map(asset => (
        <div key={asset.unit}>
          {asset.unit}: {asset.quantity}
        </div>
      ))}
    </div>
  );
}
```

#### 3. User Policies Hook

```typescript
import { useUserPolicies } from '@/hooks/use-blockchain';

function MyComponent() {
  const { policies, loading, error, refetch } = useUserPolicies(walletAddress);
  
  return (
    <div>
      <h3>My Insurance Policies</h3>
      {policies.map(policy => (
        <div key={policy.unit}>
          Policy: {policy.policyId}
        </div>
      ))}
    </div>
  );
}
```

#### 4. Protocol Stats Hook

```typescript
import { useProtocolStats } from '@/hooks/use-blockchain';

function TreasuryDashboard() {
  // Auto-refresh every 30 seconds
  const { stats, loading, error, refetch } = useProtocolStats(30000);
  
  return (
    <div>
      <div>TVL: {stats.totalValueLocked} ADA</div>
      <div>Reserves: {stats.policyReserves} ADA</div>
      <div>Liquidity: {stats.availableLiquidity} ADA</div>
      <div>Collateralization: {stats.collateralizationRatio}%</div>
    </div>
  );
}
```

#### 5. Treasury TVL Hook

```typescript
import { useTreasuryTVL } from '@/hooks/use-blockchain';

function TreasuryWidget() {
  // Auto-refresh every 60 seconds
  const { tvl, loading, error, refetch } = useTreasuryTVL(60000);
  
  return <div>Treasury TVL: {tvl.toLocaleString()} ADA</div>;
}
```

---

## 🎯 Usage Examples

### Example 1: Display User Balance

```typescript
'use client';

import { useWalletBalance } from '@/hooks/use-blockchain';

export default function WalletCard({ address }: { address: string }) {
  const { balance, loading, error } = useWalletBalance(address);
  
  return (
    <div className="card">
      <h3>Wallet Balance</h3>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {!loading && !error && (
        <p className="text-2xl">{balance.toFixed(2)} ADA</p>
      )}
    </div>
  );
}
```

### Example 2: Check Policy NFT Ownership

```typescript
import { hasPolicyNFT } from '@/lib/blockchain';

async function checkPolicyOwnership(userAddress: string) {
  const ownsHurricanePolicy = await hasPolicyNFT(
    userAddress, 
    process.env.NEXT_PUBLIC_POLICY_ID_HURRICANE!
  );
  
  if (ownsHurricanePolicy) {
    console.log('User owns a Hurricane insurance policy!');
  }
}
```

### Example 3: Display Treasury Health

```typescript
'use client';

import { useProtocolStats } from '@/hooks/use-blockchain';

export default function TreasuryHealth() {
  const { stats, loading } = useProtocolStats(30000); // Refresh every 30s
  
  if (loading) return <div>Loading treasury data...</div>;
  
  return (
    <div className="treasury-panel">
      <h2>Treasury Health</h2>
      <div className="stats-grid">
        <div>
          <label>Total Value Locked</label>
          <p>{stats.totalValueLocked.toLocaleString()} ADA</p>
        </div>
        <div>
          <label>Policy Reserves</label>
          <p>{stats.policyReserves.toLocaleString()} ADA</p>
        </div>
        <div>
          <label>Available Liquidity</label>
          <p>{stats.availableLiquidity.toLocaleString()} ADA</p>
        </div>
        <div>
          <label>Collateralization Ratio</label>
          <p className={stats.collateralizationRatio >= 120 ? 'text-green' : 'text-red'}>
            {stats.collateralizationRatio}%
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔐 Security Notes

1. **Never commit API keys**: Always use environment variables
2. **Rate Limits**: Free Blockfrost tier has rate limits (10 requests/second)
3. **Error Handling**: All functions include try-catch with fallback values
4. **Network Validation**: Functions validate address formats before queries

---

## 🧪 Testing

### Test on Preprod Testnet

Use these test addresses to verify integration:

```typescript
// Example preprod testnet address
const testAddress = 'addr_test1qz...';

// Fetch balance
const balance = await fetchAddressBalance(testAddress);
console.log(`Balance: ${balance / 1_000_000} ADA`);

// Fetch assets
const assets = await fetchAddressAssets(testAddress);
console.log(`Assets: ${assets.length}`);
```

### Get Testnet ADA

Visit the [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/) to get free testnet ADA.

---

## 📊 API Endpoints Used

The integration uses these Blockfrost endpoints:

- `GET /addresses/{address}/utxos` - Fetch UTxOs and balance
- `GET /addresses/{address}/transactions` - Transaction history
- `GET /addresses/{address}` - Address information
- `GET /assets/{asset}` - Asset metadata

---

## 🚀 Next Steps

1. **Deploy Smart Contracts**: Update `TREASURY_SCRIPT_ADDRESS` and policy IDs
2. **Connect Wallets**: Integrate wallet connectors (Nami, Eternl, etc.)
3. **Transaction Building**: Use MeshJS transaction builder for on-chain interactions
4. **Oracle Integration**: Connect parametric triggers to blockchain data

---

## 📚 Resources

- [MeshJS Documentation](https://meshjs.dev/)
- [Blockfrost Documentation](https://docs.blockfrost.io/)
- [Cardano Developer Portal](https://developers.cardano.org/)

---

## 🐛 Troubleshooting

### Issue: "Invalid API Key"
- Ensure you're using the correct network key (preprod vs mainnet)
- Check that `NEXT_PUBLIC_BLOCKFROST_KEY` is set in `.env.local`

### Issue: "Failed to fetch balance"
- Verify the address format (should start with `addr1` or `addr_test1`)
- Check network connectivity
- Verify Blockfrost API is accessible

### Issue: "TypeScript errors"
- Run `npm run typecheck` to identify issues
- Ensure all imports are correct
- Check that `@meshsdk/core` is installed

---

**Integration Status**: ✅ Complete and Ready for Phase 2 Smart Contracts
