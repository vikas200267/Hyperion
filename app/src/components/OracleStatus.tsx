/**
 * Phase 3 Oracle Status Component
 * Displays real-time oracle health and monitoring status
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle, XCircle, AlertCircle, Zap, Eye } from 'lucide-react';
import { 
  checkOracleHealth, 
  getMonitoringStatus,
  formatOracleStatus,
  getOracleFeatureStatus,
  type OracleStatus,
  type MonitoringStatus
} from '@/lib/oracle';
import { config } from '@/lib/config';
import { cn } from '@/lib/utils';

interface OracleStatusWidgetProps {
  className?: string;
  compact?: boolean;
}

export function OracleStatusWidget({ className, compact = false }: OracleStatusWidgetProps) {
  const [oracleStatus, setOracleStatus] = useState<OracleStatus | null>(null);
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Don't fetch if oracle is disabled
    if (!config.enablePhase3Oracle) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      const [oracle, monitoring] = await Promise.all([
        checkOracleHealth(),
        getMonitoringStatus()
      ]);
      
      setOracleStatus(oracle);
      setMonitoringStatus(monitoring);
      setLoading(false);
      setLastUpdate(new Date());
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  if (!config.enablePhase3Oracle) {
    return null; // Don't render if oracle is disabled
  }

  if (loading) {
    return (
      <div className={cn("border rounded-lg p-4 bg-gray-900/50", className)}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 animate-pulse text-blue-400" />
          <span className="text-sm text-gray-400">Loading oracle status...</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (!oracleStatus) return <XCircle className="w-5 h-5 text-red-400" />;
    
    switch (oracleStatus.status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    if (!oracleStatus) return 'text-red-400';
    
    switch (oracleStatus.status) {
      case 'operational':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {getStatusIcon()}
        <span className={cn("text-sm font-medium", getStatusColor())}>
          {formatOracleStatus(oracleStatus)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("border border-gray-800 rounded-lg p-4 bg-gray-900/50", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Phase 3 Oracle</h3>
        </div>
        {getStatusIcon()}
      </div>

      {oracleStatus ? (
        <>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Status:</span>
              <span className={cn("font-medium", getStatusColor())}>
                {formatOracleStatus(oracleStatus)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Initialized:</span>
              <span className={cn(
                "font-medium",
                oracleStatus.oracle_initialized ? "text-green-400" : "text-red-400"
              )}>
                {oracleStatus.oracle_initialized ? 'Yes' : 'No'}
              </span>
            </div>

            {monitoringStatus && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Active Monitors:</span>
                <span className="font-medium text-blue-400">
                  {monitoringStatus.active_count}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 pt-3 space-y-1">
            <div className="text-xs text-gray-500 mb-2">Features:</div>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Ed25519 Signing:</span>
                <span>{getOracleFeatureStatus(oracleStatus.features.ed25519_signing)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Real-time Monitor:</span>
                <span>{getOracleFeatureStatus(oracleStatus.features.realtime_monitoring)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">PyCardano:</span>
                <span>{getOracleFeatureStatus(oracleStatus.features.pycardano_integration)}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Oracle service unavailable</p>
          <p className="text-xs text-gray-500 mt-1">
            Make sure the backend is running at {config.apiUrl}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Oracle Badge for header/navbar
 */
export function OracleBadge() {
  return <OracleStatusWidget compact className="px-3 py-1.5 border border-gray-800 rounded-full bg-gray-900/50" />;
}
