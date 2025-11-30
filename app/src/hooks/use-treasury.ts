/**
 * React Hook for Phase 2 Treasury Operations
 * Provides premium deposit and payout request functionality
 */

import { useState, useCallback } from 'react';
import { Lucid } from 'lucid-cardano';
import {
  depositPremium,
  requestPayout,
  getTreasuryTVL,
  getActiveTreasuryDeposits,
  findTreasuryUTxO,
  TreasuryDatum
} from '@/lib/treasury';
import { useToast } from './use-toast';

export interface TreasuryOperation {
  type: 'deposit' | 'payout';
  policyId: string;
  amount: bigint;
  txHash?: string;
  status: 'pending' | 'success' | 'error';
  timestamp: number;
}

export function useTreasury() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [operations, setOperations] = useState<TreasuryOperation[]>([]);
  const [tvl, setTvl] = useState<bigint>(0n);

  /**
   * Deposit premium to treasury
   */
  const deposit = useCallback(async (
    lucid: Lucid,
    policyId: string,
    premiumAmount: bigint,
    coverageAmount: bigint,
    treasuryOwner: string
  ) => {
    setLoading(true);
    
    const operation: TreasuryOperation = {
      type: 'deposit',
      policyId,
      amount: premiumAmount,
      status: 'pending',
      timestamp: Date.now()
    };
    
    setOperations(prev => [...prev, operation]);

    try {
      const txHash = await depositPremium(
        lucid,
        policyId,
        premiumAmount,
        coverageAmount,
        treasuryOwner
      );

      operation.txHash = txHash;
      operation.status = 'success';
      setOperations(prev => prev.map(op => 
        op.timestamp === operation.timestamp ? operation : op
      ));

      toast({
        title: "✅ Premium Deposited",
        description: `Premium locked in treasury. Tx: ${txHash.slice(0, 16)}...`,
        duration: 5000,
      });

      return txHash;
    } catch (error: any) {
      operation.status = 'error';
      setOperations(prev => prev.map(op => 
        op.timestamp === operation.timestamp ? operation : op
      ));

      toast({
        title: "❌ Deposit Failed",
        description: error.message || 'Failed to deposit premium to treasury',
        variant: "destructive",
        duration: 5000,
      });

      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Request payout from treasury
   */
  const payout = useCallback(async (
    lucid: Lucid,
    policyId: string,
    oracleUtxoRef: string,
    beneficiaryAddress: string
  ) => {
    setLoading(true);

    const operation: TreasuryOperation = {
      type: 'payout',
      policyId,
      amount: 0n, // Will be determined by treasury datum
      status: 'pending',
      timestamp: Date.now()
    };
    
    setOperations(prev => [...prev, operation]);

    try {
      // Find treasury UTxO to get payout amount
      const treasuryUtxo = await findTreasuryUTxO(lucid, policyId);
      if (treasuryUtxo && treasuryUtxo.datum) {
        // Parse to get payout amount (simplified)
        operation.amount = treasuryUtxo.assets.lovelace || 0n;
      }

      const txHash = await requestPayout(
        lucid,
        policyId,
        oracleUtxoRef,
        beneficiaryAddress
      );

      operation.txHash = txHash;
      operation.status = 'success';
      setOperations(prev => prev.map(op => 
        op.timestamp === operation.timestamp ? operation : op
      ));

      toast({
        title: "✅ Payout Requested",
        description: `Payout transaction submitted. Tx: ${txHash.slice(0, 16)}...`,
        duration: 5000,
      });

      return txHash;
    } catch (error: any) {
      operation.status = 'error';
      setOperations(prev => prev.map(op => 
        op.timestamp === operation.timestamp ? operation : op
      ));

      toast({
        title: "❌ Payout Failed",
        description: error.message || 'Failed to request payout from treasury',
        variant: "destructive",
        duration: 5000,
      });

      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Fetch treasury total value locked
   */
  const fetchTVL = useCallback(async (lucid: Lucid) => {
    try {
      const totalLocked = await getTreasuryTVL(lucid);
      setTvl(totalLocked);
      return totalLocked;
    } catch (error) {
      console.error('Failed to fetch treasury TVL:', error);
      return 0n;
    }
  }, []);

  /**
   * Fetch all active deposits
   */
  const fetchDeposits = useCallback(async (lucid: Lucid) => {
    try {
      const deposits = await getActiveTreasuryDeposits(lucid);
      return deposits;
    } catch (error) {
      console.error('Failed to fetch treasury deposits:', error);
      return [];
    }
  }, []);

  /**
   * Check if treasury has funds for a specific policy
   */
  const hasFunds = useCallback(async (lucid: Lucid, policyId: string): Promise<boolean> => {
    try {
      const utxo = await findTreasuryUTxO(lucid, policyId);
      return utxo !== null;
    } catch (error) {
      console.error('Failed to check treasury funds:', error);
      return false;
    }
  }, []);

  return {
    loading,
    operations,
    tvl,
    deposit,
    payout,
    fetchTVL,
    fetchDeposits,
    hasFunds
  };
}
