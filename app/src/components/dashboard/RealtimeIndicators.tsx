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
      id: 'scout',
      label: 'Scout Agents',
      value: 5,
      unit: 'active',
      icon: Shield,
      color: 'cyan',
      status: 'good',
    },
    {
      id: 'analyst',
      label: 'Analyst Agent',
      value: 1,
      unit: 'validating',
      icon: Activity,
      color: 'emerald',
      status: 'good',
    },
    {
      id: 'arbiter',
      label: 'Arbiter Agent',
      value: 1,
      unit: 'monitoring',
      icon: Zap,
      color: 'amber',
      status: 'good',
    },
    {
      id: 'consensus',
      label: 'Consensus Rate',
      value: 98.5,
      unit: '%',
      icon: Radio,
      color: 'purple',
      status: 'good',
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndicators((prev) =>
        prev.map((ind) => {
          // Keep agent counts stable, only vary consensus slightly
          if (ind.id === 'scout' || ind.id === 'analyst' || ind.id === 'arbiter') {
            return ind;
          }
          
          const variance = (Math.random() - 0.5) * 2;
          let newValue = ind.value + variance;
          newValue = Math.max(95, Math.min(100, newValue));

          let status: 'good' | 'warning' | 'critical' = 'good';
          if (newValue < 98) status = 'warning';
          if (newValue < 95) status = 'critical';

          return { ...ind, value: newValue, status };
        })
      );
    }, 3000);

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
          <h3 className="text-lg font-bold text-white">AI Swarm Status</h3>
          <p className="text-xs text-slate-400">Multi-agent consensus system</p>
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
                    {indicator.id === 'consensus' ? indicator.value.toFixed(1) : indicator.value.toFixed(0)}
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
                    width: `${indicator.id === 'consensus' ? indicator.value : 100}%`,
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
          <span className="text-xs font-medium text-cyan-300">Swarm Health</span>
        </div>
        <div className="text-2xl font-bold text-white">Operational</div>
        <div className="text-xs text-slate-400 mt-1">All agents responding</div>
      </div>
    </div>
  );
}
