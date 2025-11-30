/**
 * Phase 2 Treasury Dashboard Component
 * Displays treasury TVL, active deposits, and payout history
 */

'use client';

import { useEffect, useState } from 'react';
import { useTreasury } from '@/hooks/use-treasury';
import { useWallet } from '@/context/WalletProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Shield, ArrowDownUp } from 'lucide-react';

export function TreasuryDashboard() {
  const { lucid } = useWallet();
  const { tvl, operations, fetchTVL, fetchDeposits } = useTreasury();
  const [deposits, setDeposits] = useState<Array<{
    policyId: string;
    payoutAmount: bigint;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lucid) return;

    const loadData = async () => {
      setLoading(true);
      try {
        await fetchTVL(lucid);
        const activeDeposits = await fetchDeposits(lucid);
        setDeposits(activeDeposits);
      } catch (error) {
        console.error('Failed to load treasury data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [lucid, fetchTVL, fetchDeposits]);

  const formatADA = (lovelace: bigint): string => {
    return (Number(lovelace) / 1_000_000).toFixed(2);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Treasury Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatADA(tvl)} ₳</div>
            <p className="text-xs text-muted-foreground">
              Locked in treasury vault
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deposits.length}</div>
            <p className="text-xs text-muted-foreground">
              Premiums deposited
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operations.filter(op => op.type === 'deposit' && op.status === 'success').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful deposits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operations.filter(op => op.type === 'payout' && op.status === 'success').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Claims processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Deposits */}
      <Card>
        <CardHeader>
          <CardTitle>Active Treasury Deposits</CardTitle>
          <CardDescription>
            Premiums locked in the treasury vault awaiting payout conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active deposits found
            </div>
          ) : (
            <div className="space-y-4">
              {deposits.map((deposit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Policy ID</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {deposit.policyId.slice(0, 16)}...{deposit.policyId.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">Coverage Amount</p>
                    <p className="text-lg font-bold">
                      {formatADA(deposit.payoutAmount)} ₳
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Treasury Operations</CardTitle>
          <CardDescription>
            Latest premium deposits and payout requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {operations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No operations yet
            </div>
          ) : (
            <div className="space-y-3">
              {operations.slice(-10).reverse().map((op, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {op.type === 'deposit' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownUp className="h-4 w-4 text-blue-500" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium capitalize">{op.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(op.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold">
                      {formatADA(op.amount)} ₳
                    </p>
                    <Badge
                      variant={
                        op.status === 'success'
                          ? 'default'
                          : op.status === 'error'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {op.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
