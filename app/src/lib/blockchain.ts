/**
 * Cardano Blockchain Integration
 * Uses Blockfrost API via MeshJS to rapidly query the Cardano network
 * 
 * Purpose:
 * - Fetch real-time asset balances
 * - Query transaction history
 * - Read smart contract data
 * - Offload the need to run a local full node
 */

import { BlockfrostProvider } from '@meshsdk/core';
import { config } from './config';

// Initialize the Blockfrost Provider with API Key from environment
// For preprod testnet, use: preprodbcpV680ZAfVbVXQn2fvz5kLeJJQOOhK9
// For mainnet, replace with your mainnet API key
const blockfrostApiKey = config.blockfrostApiKey || process.env.NEXT_PUBLIC_BLOCKFROST_KEY || 'preprodbcpV680ZAfVbVXQn2fvz5kLeJJQOOhK9';

export const blockchainProvider = new BlockfrostProvider(blockfrostApiKey);

// Smart Contract Addresses (To be updated after contract deployment - Phase 2)
export const TREASURY_SCRIPT_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "addr_test1...";
export const POLICY_ID_HURRICANE = process.env.NEXT_PUBLIC_POLICY_ID_HURRICANE || "1234abcd...";
export const POLICY_ID_FLIGHT = process.env.NEXT_PUBLIC_POLICY_ID_FLIGHT || "5678efgh...";
export const POLICY_ID_CROP = process.env.NEXT_PUBLIC_POLICY_ID_CROP || "9012ijkl...";

/**
 * Fetch the balance of a Cardano address
 * @param address - Cardano address (e.g., addr1...)
 * @returns Balance in Lovelace (1 ADA = 1,000,000 Lovelace)
 */
export async function fetchAddressBalance(address: string): Promise<number> {
  try {
    const utxos = await blockchainProvider.fetchAddressUTxOs(address);
    const totalLovelace = utxos.reduce((sum, utxo) => {
      const lovelaceAmount = utxo.output.amount.find(asset => asset.unit === 'lovelace');
      return sum + (lovelaceAmount ? parseInt(lovelaceAmount.quantity) : 0);
    }, 0);
    return totalLovelace;
  } catch (error) {
    console.error('Error fetching address balance:', error);
    return 0;
  }
}

/**
 * Fetch all assets (tokens/NFTs) owned by an address
 * @param address - Cardano address
 * @returns Array of assets with policy ID and asset name
 */
export async function fetchAddressAssets(address: string): Promise<Array<{ unit: string; quantity: string }>> {
  try {
    const utxos = await blockchainProvider.fetchAddressUTxOs(address);
    const assets: Array<{ unit: string; quantity: string }> = [];
    
    utxos.forEach(utxo => {
      utxo.output.amount.forEach(asset => {
        if (asset.unit !== 'lovelace') {
          // Find if asset already exists in array
          const existingAsset = assets.find(a => a.unit === asset.unit);
          if (existingAsset) {
            existingAsset.quantity = (BigInt(existingAsset.quantity) + BigInt(asset.quantity)).toString();
          } else {
            assets.push({ unit: asset.unit, quantity: asset.quantity });
          }
        }
      });
    });
    
    return assets;
  } catch (error) {
    console.error('Error fetching address assets:', error);
    return [];
  }
}

/**
 * Fetch transaction history for an address
 * @param address - Cardano address
 * @returns Array of transaction hashes
 */
export async function fetchAddressTransactions(address: string): Promise<string[]> {
  try {
    const txs = await blockchainProvider.fetchAddressTransactions(address);
    return txs.map(tx => tx.hash);
  } catch (error) {
    console.error('Error fetching address transactions:', error);
    return [];
  }
}

/**
 * Fetch UTxOs at a specific script address (for treasury monitoring)
 * @param scriptAddress - Plutus script address
 * @returns Array of UTxOs locked at the script
 */
export async function fetchTreasuryUTxOs(scriptAddress: string = TREASURY_SCRIPT_ADDRESS) {
  try {
    const utxos = await blockchainProvider.fetchAddressUTxOs(scriptAddress);
    return utxos;
  } catch (error) {
    console.error('Error fetching treasury UTxOs:', error);
    return [];
  }
}

/**
 * Calculate total value locked in treasury
 * @returns Total ADA locked in treasury script
 */
export async function fetchTreasuryTVL(): Promise<number> {
  try {
    const balance = await fetchAddressBalance(TREASURY_SCRIPT_ADDRESS);
    return balance / 1_000_000; // Convert to ADA
  } catch (error) {
    console.error('Error fetching treasury TVL:', error);
    return 0;
  }
}

/**
 * Fetch protocol statistics from blockchain
 * @returns Object with protocol metrics
 */
export async function fetchProtocolStats() {
  try {
    const tvl = await fetchTreasuryTVL();
    
    return {
      totalValueLocked: tvl,
      policyReserves: tvl * 0.7, // Estimate: 70% in reserves
      availableLiquidity: tvl * 0.3, // Estimate: 30% liquid
      collateralizationRatio: 142, // This would come from contract state
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching protocol stats:', error);
    return {
      totalValueLocked: 0,
      policyReserves: 0,
      availableLiquidity: 0,
      collateralizationRatio: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Check if a policy NFT exists for a specific policy type
 * @param address - User's Cardano address
 * @param policyId - Policy ID to check for
 * @returns Boolean indicating if user owns the policy NFT
 */
export async function hasPolicyNFT(address: string, policyId: string): Promise<boolean> {
  try {
    const assets = await fetchAddressAssets(address);
    return assets.some(asset => asset.unit.startsWith(policyId));
  } catch (error) {
    console.error('Error checking policy NFT:', error);
    return false;
  }
}

/**
 * Fetch all policy NFTs owned by an address
 * @param address - User's Cardano address
 * @returns Array of policy NFTs with metadata
 */
export async function fetchUserPolicies(address: string) {
  try {
    const assets = await fetchAddressAssets(address);
    
    // Filter for known policy IDs
    const policyNFTs = assets.filter(asset => 
      asset.unit.startsWith(POLICY_ID_HURRICANE) ||
      asset.unit.startsWith(POLICY_ID_FLIGHT) ||
      asset.unit.startsWith(POLICY_ID_CROP)
    );
    
    return policyNFTs.map(nft => ({
      policyId: nft.unit.slice(0, 56), // First 56 chars = policy ID
      assetName: nft.unit.slice(56), // Remaining = asset name
      quantity: nft.quantity,
      unit: nft.unit,
    }));
  } catch (error) {
    console.error('Error fetching user policies:', error);
    return [];
  }
}

/**
 * Export provider for direct use in components
 */
export { blockfrostApiKey };
