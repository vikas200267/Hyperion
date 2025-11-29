/**
 * React Hook for Blockchain Integration
 * Provides easy access to Blockfrost blockchain data in React components
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchAddressBalance,
  fetchAddressAssets,
  fetchUserPolicies,
  fetchProtocolStats,
  fetchTreasuryTVL,
} from '@/lib/blockchain';
import { config } from '@/lib/config';

/**
 * Hook to fetch and manage wallet balance
 */
export function useWalletBalance(address: string | null) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!address || !config.enableBlockchainIntegration) {
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const lovelace = await fetchAddressBalance(address);
      setBalance(lovelace / 1_000_000); // Convert to ADA
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch balance'));
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { balance, loading, error, refetch };
}

/**
 * Hook to fetch and manage wallet assets (tokens/NFTs)
 */
export function useWalletAssets(address: string | null) {
  const [assets, setAssets] = useState<Array<{ unit: string; quantity: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!address || !config.enableBlockchainIntegration) {
      setAssets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedAssets = await fetchAddressAssets(address);
      setAssets(fetchedAssets);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch assets'));
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { assets, loading, error, refetch };
}

/**
 * Hook to fetch user's insurance policy NFTs
 */
export function useUserPolicies(address: string | null) {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!address || !config.enableBlockchainIntegration) {
      setPolicies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedPolicies = await fetchUserPolicies(address);
      setPolicies(fetchedPolicies);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch policies'));
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { policies, loading, error, refetch };
}

/**
 * Hook to fetch protocol statistics from blockchain
 */
export function useProtocolStats(refreshInterval: number = 30000) {
  const [stats, setStats] = useState({
    totalValueLocked: 0,
    policyReserves: 0,
    availableLiquidity: 0,
    collateralizationRatio: 0,
    lastUpdated: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!config.enableBlockchainIntegration) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedStats = await fetchProtocolStats();
      setStats(fetchedStats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch protocol stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();

    // Set up periodic refresh
    if (refreshInterval > 0) {
      const interval = setInterval(refetch, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refetch, refreshInterval]);

  return { stats, loading, error, refetch };
}

/**
 * Hook to fetch treasury TVL
 */
export function useTreasuryTVL(refreshInterval: number = 60000) {
  const [tvl, setTvl] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!config.enableBlockchainIntegration) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedTvl = await fetchTreasuryTVL();
      setTvl(fetchedTvl);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch treasury TVL'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();

    // Set up periodic refresh
    if (refreshInterval > 0) {
      const interval = setInterval(refetch, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refetch, refreshInterval]);

  return { tvl, loading, error, refetch };
}
