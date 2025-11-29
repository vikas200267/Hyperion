/**
 * Placeholder for wallet connection utilities
 * Will integrate with @meshsdk/core
 */

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
