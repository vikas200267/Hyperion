'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, Shield, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Indicator {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: any;
  color: string;
  status: 'good' | 'warning' | 'critical';
}

export function RealtimeIndicators() {
  const [indicators, setIndicators] = useState<Indicator[]>([
    {
      id: 'threat',
      label: 'Threat Level',
      value: 23,
      unit: '%',
      icon: Shield,
      color: 'cyan',
      status: 'good',
    },
    {
      id: 'activity',
      label: 'Network Activity',
      value: 847,
      unit: 'ops/s',
      icon: Activity,
      color: 'emerald',
      status: 'good',
    },
    {
      id: 'power',
      label: 'System Power',
      value: 92,
      unit: '%',
      icon: Zap,
      color: 'amber',
      status: 'good',
    },
    {
      id: 'signal',
      label: 'Signal Strength',
      value: 98.5,
      unit: 'dB',
      icon: Radio,
      color: 'purple',
      status: 'good',
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndicators((prev) =>
        prev.map((ind) => {
          const variance = (Math.random() - 0.5) * 10;
          let newValue = ind.value + variance;

          if (ind.id === 'activity') {
            newValue = Math.max(500, Math.min(1200, newValue));
          } else if (ind.id === 'signal') {
            newValue = Math.max(90, Math.min(100, newValue));
          } else {
            newValue = Math.max(0, Math.min(100, newValue));
          }

          let status: 'good' | 'warning' | 'critical' = 'good';
          if (ind.id === 'threat' && newValue > 60) status = 'warning';
          if (ind.id === 'threat' && newValue > 80) status = 'critical';
          if (ind.id === 'power' && newValue < 50) status = 'warning';
          if (ind.id === 'power' && newValue < 30) status = 'critical';

          return { ...ind, value: newValue, status };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'critical') return 'from-rose-500 to-red-600';
    if (status === 'warning') return 'from-amber-500 to-orange-600';
    return 'from-emerald-500 to-green-600';
  };

  return (
    <div className="h-full p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-500/30">
          <Activity className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Live Metrics</h3>
          <p className="text-xs text-slate-400">Real-time system telemetry</p>
        </div>
      </div>

      <div className="space-y-4">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;

          return (
            <div
              key={indicator.id}
              className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    indicator.color === 'cyan' && 'bg-cyan-500/20',
                    indicator.color === 'emerald' && 'bg-emerald-500/20',
                    indicator.color === 'amber' && 'bg-amber-500/20',
                    indicator.color === 'purple' && 'bg-purple-500/20'
                  )}>
                    <Icon className={cn(
                      'w-4 h-4',
                      indicator.color === 'cyan' && 'text-cyan-400',
                      indicator.color === 'emerald' && 'text-emerald-400',
                      indicator.color === 'amber' && 'text-amber-400',
                      indicator.color === 'purple' && 'text-purple-400'
                    )} />
                  </div>
                  <span className="text-sm text-slate-300 font-medium">
                    {indicator.label}
                  </span>
                </div>

                <div className={cn(
                  'w-2 h-2 rounded-full animate-pulse',
                  indicator.status === 'good' && 'bg-emerald-400 shadow-lg shadow-emerald-400/50',
                  indicator.status === 'warning' && 'bg-amber-400 shadow-lg shadow-amber-400/50',
                  indicator.status === 'critical' && 'bg-rose-400 shadow-lg shadow-rose-400/50'
                )} />
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-white tabular-nums">
                    {indicator.value.toFixed(indicator.id === 'activity' ? 0 : 1)}
                  </div>
                  <div className="text-xs text-slate-400">{indicator.unit}</div>
                </div>

                <div className="w-16 h-12 relative">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'absolute bottom-0 w-1.5 rounded-t transition-all duration-300',
                        `bg-gradient-to-t ${getStatusColor(indicator.status)}`
                      )}
                      style={{
                        left: `${i * 8}px`,
                        height: `${Math.random() * 100}%`,
                        opacity: 0.3 + Math.random() * 0.7,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000',
                    `bg-gradient-to-r ${getStatusColor(indicator.status)}`,
                    'shadow-lg'
                  )}
                  style={{
                    width: `${indicator.id === 'activity' ? (indicator.value / 1200) * 100 : indicator.value}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" />
          <span className="text-xs font-medium text-cyan-300">System Health</span>
        </div>
        <div className="text-2xl font-bold text-white">Optimal</div>
        <div className="text-xs text-slate-400 mt-1">All systems operational</div>
      </div>
    </div>
  );
}
