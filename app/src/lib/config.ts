/**
 * Environment configuration for Hyperion Frontend
 * Access these values throughout the app
 */

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // Cardano Network
  cardanoNetwork: process.env.NEXT_PUBLIC_CARDANO_NETWORK || 'preprod',
  blockfrostApiKey: process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || '',
  
  // Wallet Configuration
  defaultWallet: process.env.NEXT_PUBLIC_DEFAULT_WALLET || 'nami',
  
  // Feature Flags
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableTestnetFaucet: process.env.NEXT_PUBLIC_ENABLE_TESTNET_FAUCET === 'true',
} as const;

export type Config = typeof config;
