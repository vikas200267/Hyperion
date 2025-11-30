# 🚀 Phase 2 Treasury - Quick Reference

## 📦 Installation & Setup

```bash
# Frontend dependencies already installed
cd /workspaces/Hyperion/app
npm install  # lucid-cardano included

# Configure environment
cp .env.example .env.local
# Add: NEXT_PUBLIC_TREASURY_ADDRESS=<your_treasury_address>
```

## 💼 Import Treasury Functions

```typescript
// Core library
import {
  depositPremium,
  requestPayout,
  getTreasuryTVL,
  findTreasuryUTxO
} from '@/lib/treasury';

// React hook
import { useTreasury } from '@/hooks/use-treasury';

// Dashboard component
import { TreasuryDashboard } from '@/components/TreasuryDashboard';
```

## 🔑 Quick Code Snippets

### 1. Deposit Premium

```typescript
const { deposit } = useTreasury();

await deposit(
  lucid,                    // Lucid instance
  "policy_id_hex",          // Policy NFT ID
  50_000_000n,              // 50 ADA premium
  500_000_000n,             // 500 ADA coverage
  "admin_pubkey_hash"       // Treasury owner
);
```

### 2. Request Payout

```typescript
const { payout } = useTreasury();

await payout(
  lucid,                    // Lucid instance
  "policy_id_hex",          // Policy NFT ID
  "txHash#outputIndex",     // Oracle UTxO ref
  "addr1_beneficiary"       // Payout address
);
```

### 3. Check Treasury Balance

```typescript
const { fetchTVL } = useTreasury();

const tvl = await fetchTVL(lucid);
console.log(`TVL: ${Number(tvl) / 1_000_000} ADA`);
```

### 4. List Active Deposits

```typescript
const { fetchDeposits } = useTreasury();

const deposits = await fetchDeposits(lucid);
deposits.forEach(d => {
  console.log(`Policy: ${d.policyId}`);
  console.log(`Amount: ${d.payoutAmount}`);
});
```

## 🎨 UI Components

### Treasury Dashboard

```typescript
import { TreasuryDashboard } from '@/components/TreasuryDashboard';

function Page() {
  return (
    <div>
      <h1>Treasury</h1>
      <TreasuryDashboard />
    </div>
  );
}
```

### Custom Status Badge

```typescript
import { Badge } from '@/components/ui/badge';
import { useTreasury } from '@/hooks/use-treasury';

function StatusBadge({ policyId }) {
  const { hasFunds } = useTreasury();
  const [funded, setFunded] = useState(false);

  useEffect(() => {
    hasFunds(lucid, policyId).then(setFunded);
  }, [policyId]);

  return (
    <Badge variant={funded ? 'default' : 'secondary'}>
      {funded ? 'Funded' : 'Pending'}
    </Badge>
  );
}
```

## 📊 Data Types

```typescript
// Treasury Datum (matches on-chain)
interface TreasuryDatum {
  policyId: string;           // 28-byte hex
  payoutAsset: AssetClass;    // {policyId, assetName}
  payoutAmount: bigint;       // Lovelaces
  treasuryOwner: string;      // Pubkey hash
}

// Treasury Redeemer
interface TreasuryRedeemer {
  action: "PAYOUT" | "REFUND" | "UPDATE";
}

// Asset Class (ADA = {policyId: "", assetName: ""})
interface AssetClass {
  policyId: string;
  assetName: string;
}
```

## 🔧 Configuration

```typescript
// app/src/lib/config.ts
export const config = {
  treasuryAddress: process.env.NEXT_PUBLIC_TREASURY_ADDRESS,
  insuranceAddress: process.env.NEXT_PUBLIC_INSURANCE_ADDRESS,
  oracleScriptHash: process.env.NEXT_PUBLIC_ORACLE_SCRIPT_HASH,
  enablePhase2Treasury: true,
  enablePhase3Oracle: true,
};
```

## 🧪 Testing Helpers

```typescript
// Mock treasury deposit for testing
async function mockDeposit() {
  const mockLucid = await Lucid.new(
    new Blockfrost('https://cardano-preprod.blockfrost.io/api/v0', 'YOUR_KEY'),
    'Preprod'
  );
  
  await mockLucid.selectWalletFromSeed('your seed phrase');
  
  return depositPremium(
    mockLucid,
    "test_policy_id",
    10_000_000n,
    100_000_000n,
    "test_admin"
  );
}
```

## 🐛 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Treasury UTxO not found" | Policy not funded | Check `findTreasuryUTxO(lucid, policyId)` |
| "Invalid datum structure" | Type mismatch | Verify `TreasuryDatum` matches contract |
| "Oracle UTxO not found" | Wrong reference | Format: `"txHash#outputIndex"` |
| "Insufficient funds" | UTxO too small | Ensure `premium + 2 ADA` minimum |

## 📱 Toast Notifications

```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success
toast({
  title: "✅ Transaction Submitted",
  description: `Tx: ${txHash.slice(0, 16)}...`,
  duration: 5000,
});

// Error
toast({
  title: "❌ Transaction Failed",
  description: error.message,
  variant: "destructive",
  duration: 5000,
});
```

## 🔗 Useful Links

- **Smart Contracts**: `/workspaces/Hyperion/contracts/validators/`
- **Type Definitions**: `/workspaces/Hyperion/contracts/lib/treasury_types.ak`
- **Frontend Docs**: `/workspaces/Hyperion/PHASE2_FRONTEND_INTEGRATION.md`
- **Integration Report**: `/workspaces/Hyperion/PHASE2_TREASURY_INTEGRATION_REPORT.md`

## 💡 Pro Tips

1. **Always check wallet connection** before calling treasury functions
2. **Use BigInt for amounts** (1 ADA = 1_000_000 lovelaces)
3. **Include MIN_UTXO_ADA** (2 ADA) in deposits for protocol requirements
4. **Validate oracle trigger** before requesting payout
5. **Monitor operation history** for debugging failed transactions

---

**Need help?** Check the full documentation in `PHASE2_FRONTEND_INTEGRATION.md`
