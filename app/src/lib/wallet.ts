/**
 * Wallet connection utilities
 * Integrates with @meshsdk/core and Blockfrost
 */

import { fetchAddressBalance, fetchAddressAssets, fetchUserPolicies } from './blockchain';

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number;
  networkId: number;
}

export const initialWalletState: WalletState = {
  connected: false,
  address: null,
  balance: 0,
  networkId: 0,
};

/**
 * Format Lovelace to ADA
 */
export function lovelaceToAda(lovelace: number): string {
  return (lovelace / 1_000_000).toFixed(6);
}

/**
 * Format ADA to Lovelace
 */
export function adaToLovelace(ada: number): number {
  return Math.floor(ada * 1_000_000);
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars: number = 8): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Fetch wallet balance from blockchain
 * Uses Blockfrost API via blockchain provider
 */
export async function getWalletBalance(address: string): Promise<number> {
  try {
    const lovelace = await fetchAddressBalance(address);
    return lovelace / 1_000_000; // Convert to ADA
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

/**
 * Fetch wallet assets (tokens/NFTs) from blockchain
 */
export async function getWalletAssets(address: string) {
  try {
    return await fetchAddressAssets(address);
  } catch (error) {
    console.error('Error fetching wallet assets:', error);
    return [];
  }
}

/**
 * Fetch user's insurance policy NFTs
 */
export async function getWalletPolicies(address: string) {
  try {
    return await fetchUserPolicies(address);
  } catch (error) {
    console.error('Error fetching wallet policies:', error);
    return [];
  }
}

/**
 * Validate Cardano address format
 */
export function isValidCardanoAddress(address: string): boolean {
  // Basic validation - Cardano addresses start with addr1 (mainnet) or addr_test1 (testnet)
  return /^(addr1|addr_test1)[a-z0-9]+$/i.test(address);
}

/**
 * Get network ID from address prefix
 */
export function getNetworkIdFromAddress(address: string): number {
  if (address.startsWith('addr1')) return 1; // Mainnet
  if (address.startsWith('addr_test1')) return 0; // Testnet
  return -1; // Unknown
}
