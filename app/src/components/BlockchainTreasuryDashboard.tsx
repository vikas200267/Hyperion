/**
 * Example Component: Treasury Dashboard with Real Blockchain Data
 * 
 * This component demonstrates how to use the blockchain integration
 * to display real-time treasury data from the Cardano blockchain.
 * 
 * Usage: Import this component in your page or dashboard
 */

'use client';

import React from 'react';
import { useProtocolStats, useTreasuryTVL } from '@/hooks/use-blockchain';
import { Database, TrendingUp, Lock, Wallet, RefreshCw } from 'lucide-react';

export default function BlockchainTreasuryDashboard() {
  // Fetch protocol stats with auto-refresh every 30 seconds
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useProtocolStats(30000);
  
  // Fetch treasury TVL with auto-refresh every 60 seconds
  const { tvl, loading: tvlLoading, error: tvlError, refetch: refetchTvl } = useTreasuryTVL(60000);

  const isLoading = statsLoading || tvlLoading;
  const hasError = statsError || tvlError;

  return (
    <div className="space-y-6 p-6 bg-slate-900 rounded-2xl border border-cyan-500/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full" />
            Live Treasury Data
          </h2>
          <p className="text-slate-400 ml-7 mt-1">
            Real-time blockchain data via Blockfrost API
          </p>
        </div>
        <button
          onClick={() => {
            refetchStats();
            refetchTvl();
          }}
          className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
          disabled={isLoading}
        >
          <RefreshCw 
            size={20} 
            className={`text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>

      {/* Error State */}
      {hasError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">
            Error loading blockchain data: {statsError?.message || tvlError?.message}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 bg-slate-800/50 rounded-xl animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Data Display */}
      {!isLoading && !hasError && (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Wallet, 
                label: 'Total Value Locked', 
                value: tvl > 0 ? tvl : stats.totalValueLocked,
                suffix: 'ADA',
                color: 'cyan'
              },
              { 
                icon: Lock, 
                label: 'Policy Reserves', 
                value: stats.policyReserves,
                suffix: 'ADA',
                color: 'blue'
              },
              { 
                icon: TrendingUp, 
                label: 'Available Liquidity', 
                value: stats.availableLiquidity,
                suffix: 'ADA',
                color: 'green'
              },
              { 
                icon: Database, 
                label: 'Collateralization', 
                value: stats.collateralizationRatio,
                suffix: '%',
                color: stats.collateralizationRatio >= 120 ? 'emerald' : 'red'
              },
            ].map((item, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${item.color}-500/20 to-${item.color}-600/20 flex items-center justify-center border border-${item.color}-500/30`}>
                    <item.icon size={24} className={`text-${item.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                    <div className="text-2xl font-bold text-white">
                      {typeof item.value === 'number' && item.value > 0 
                        ? item.value.toLocaleString() 
                        : '0'}
                      <span className="text-sm text-slate-400 ml-1">{item.suffix}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Health Indicator */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30">
            <h3 className="text-lg font-bold text-white mb-4">Treasury Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Collateralization Ratio</span>
                <span className={`text-lg font-bold ${stats.collateralizationRatio >= 120 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.collateralizationRatio}%
                </span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stats.collateralizationRatio >= 120 ? 'from-emerald-500 to-green-400' : 'from-red-500 to-orange-400'} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min((stats.collateralizationRatio / 200) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500">Minimum Required: 120%</span>
                <span className={`text-xs ${stats.collateralizationRatio >= 120 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.collateralizationRatio >= 120 ? '✓ Healthy' : '⚠ Low'}
                </span>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()} 
              <span className="ml-2">• Auto-refreshing</span>
            </p>
          </div>
        </>
      )}

      {/* Integration Status */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span>Connected to Cardano {process.env.NEXT_PUBLIC_CARDANO_NETWORK || 'preprod'} via Blockfrost</span>
      </div>
    </div>
  );
}
