/**
 * Phase 3 Oracle Integration
 * Real-time oracle monitoring and status display for Hyperion frontend
 */

import { config } from './config';

export interface OracleStatus {
  service: string;
  status: 'operational' | 'degraded' | 'down';
  oracle_initialized: boolean;
  active_monitors: number;
  features: {
    ed25519_signing: boolean;
    realtime_monitoring: boolean;
    pycardano_integration: boolean;
  };
}

export interface MonitoringStatus {
  active_count: number;
  monitors: Array<{
    monitor_id: string;
    status: 'running' | 'completed';
    done: boolean;
    cancelled: boolean;
  }>;
  oracle_initialized: boolean;
}

export interface OracleTriggerData {
  wind_speed: number;
  measurement_time: number;
  signature: string;
  policy_id: string;
  location_id: string;
}

/**
 * Check Oracle health status
 */
export async function checkOracleHealth(): Promise<OracleStatus | null> {
  try {
    const response = await fetch(`${config.apiUrl}/api/v1/oracle/health`);
    if (!response.ok) {
      console.warn('Oracle service not available');
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to check oracle health:', error);
    return null;
  }
}

/**
 * Get current monitoring status
 */
export async function getMonitoringStatus(): Promise<MonitoringStatus | null> {
  try {
    const response = await fetch(`${config.apiUrl}/api/v1/oracle/monitor/status`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to get monitoring status:', error);
    return null;
  }
}

/**
 * Start real-time monitoring for a policy
 */
export async function startMonitoring(
  oracleUtxoRef: string,
  policyId: string,
  locationId: string,
  pollInterval: number = 30
): Promise<{ status: string; message: string; monitor_id: string } | null> {
  try {
    const response = await fetch(`${config.apiUrl}/api/v1/oracle/monitor/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oracle_utxo_ref: oracleUtxoRef,
        policy_id: policyId,
        location_id: locationId,
        poll_interval: pollInterval,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to start monitoring:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to start monitoring:', error);
    return null;
  }
}

/**
 * Stop monitoring for a specific monitor ID
 */
export async function stopMonitoring(monitorId: string): Promise<boolean> {
  try {
    const response = await fetch(`${config.apiUrl}/api/v1/oracle/monitor/stop/${monitorId}`, {
      method: 'POST',
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to stop monitoring:', error);
    return false;
  }
}

/**
 * Manually trigger oracle (for testing)
 */
export async function triggerOracle(data: {
  oracle_utxo_ref: string;
  policy_id: string;
  location_id: string;
  wind_speed: number;
  measurement_time?: number;
}): Promise<OracleTriggerData | null> {
  try {
    const response = await fetch(`${config.apiUrl}/api/v1/oracle/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to trigger oracle:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to trigger oracle:', error);
    return null;
  }
}

/**
 * Format oracle status for display
 */
export function formatOracleStatus(status: OracleStatus | null): string {
  if (!status) return 'Offline';
  
  switch (status.status) {
    case 'operational':
      return '✅ Operational';
    case 'degraded':
      return '⚠️ Degraded';
    case 'down':
      return '❌ Down';
    default:
      return 'Unknown';
  }
}

/**
 * Get oracle feature status emoji
 */
export function getOracleFeatureStatus(enabled: boolean): string {
  return enabled ? '✅' : '❌';
}

/**
 * Build payout transaction data with oracle trigger
 * Integrates Phase 3 Oracle with Phase 2 Treasury
 * 
 * @param policyId - Insurance policy ID
 * @param oracleUtxoRef - Oracle UTxO reference (txHash#outputIndex)
 * @param triggerData - Oracle trigger data
 * @returns Transaction payload for treasury payout
 */
export async function buildOraclePayoutData(
  policyId: string,
  oracleUtxoRef: string,
  triggerData: OracleTriggerData
): Promise<{
  policyId: string;
  oracleUtxoRef: string;
  windSpeed: number;
  signature: string;
  measurementTime: number;
} | null> {
  try {
    // Validate oracle trigger
    if (!triggerData.signature || !triggerData.wind_speed) {
      throw new Error('Invalid oracle trigger data');
    }

    return {
      policyId: policyId,
      oracleUtxoRef: oracleUtxoRef,
      windSpeed: triggerData.wind_speed,
      signature: triggerData.signature,
      measurementTime: triggerData.measurement_time
    };
  } catch (error) {
    console.error('Failed to build oracle payout data:', error);
    return null;
  }
}

