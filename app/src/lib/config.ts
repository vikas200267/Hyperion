/**
 * Environment configuration for Hyperion Frontend
 * Access these values throughout the app
 */

// Get Blockfrost API key from localStorage or environment
function getBlockfrostApiKey(): string {
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem('hyperion-blockfrost-key');
    if (storedKey) {
      return storedKey;
    }
  }
  return process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || 
         process.env.NEXT_PUBLIC_BLOCKFROST_KEY || 
         '';
}

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // Cardano Network
  cardanoNetwork: process.env.NEXT_PUBLIC_CARDANO_NETWORK || 'preprod',
  blockfrostApiKey: getBlockfrostApiKey(),
  
  // Wallet Configuration
  defaultWallet: process.env.NEXT_PUBLIC_DEFAULT_WALLET || 'nami',
  
  // Smart Contract Addresses (Updated after deployment)
  treasuryAddress: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '',
  insuranceAddress: process.env.NEXT_PUBLIC_INSURANCE_ADDRESS || '',
  oracleScriptHash: process.env.NEXT_PUBLIC_ORACLE_SCRIPT_HASH || '',
  policyIdHurricane: process.env.NEXT_PUBLIC_POLICY_ID_HURRICANE || '',
  policyIdFlight: process.env.NEXT_PUBLIC_POLICY_ID_FLIGHT || '',
  policyIdCrop: process.env.NEXT_PUBLIC_POLICY_ID_CROP || '',
  
  // Phase 3 Oracle Configuration
  oracleUtxoRef: process.env.NEXT_PUBLIC_ORACLE_UTXO_REF || '',
  oracleEnabled: process.env.NEXT_PUBLIC_ENABLE_ORACLE === 'true',
  oraclePollInterval: parseInt(process.env.NEXT_PUBLIC_ORACLE_POLL_INTERVAL || '30'),
  
  // Feature Flags
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableTestnetFaucet: process.env.NEXT_PUBLIC_ENABLE_TESTNET_FAUCET === 'true',
  enableBlockchainIntegration: process.env.NEXT_PUBLIC_ENABLE_BLOCKCHAIN === 'true',
  enablePhase2Treasury: process.env.NEXT_PUBLIC_ENABLE_PHASE2_TREASURY === 'true',
  enablePhase3Oracle: process.env.NEXT_PUBLIC_ENABLE_PHASE3_ORACLE === 'true',
} as const;

export type Config = typeof config;
