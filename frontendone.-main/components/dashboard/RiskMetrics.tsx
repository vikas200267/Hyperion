'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  suffix: string;
}

export function RiskMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: 'Total Threats', value: 1247, change: 2.5, trend: 'down', suffix: '' },
    { label: 'Active Monitors', value: 42, change: 0, trend: 'stable', suffix: '' },
    { label: 'Response Time', value: 0.8, change: -15.2, trend: 'down', suffix: 's' },
    { label: 'Risk Score', value: 23, change: -8.4, trend: 'down', suffix: '%' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * (metric.value * 0.02),
          change: (Math.random() - 0.5) * 20,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className="p-5 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group shadow-xl"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm text-slate-400">{metric.label}</span>
            <div className="flex items-center gap-1">
              {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-rose-400" />}
              {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-emerald-400" />}
              {metric.trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-white tabular-nums">
                {metric.value.toFixed(metric.suffix === 's' ? 1 : 0)}
                <span className="text-xl text-slate-400">{metric.suffix}</span>
              </div>
              <div className={cn(
                'text-xs font-medium mt-1',
                metric.change > 0 ? 'text-rose-400' : metric.change < 0 ? 'text-emerald-400' : 'text-slate-400'
              )}>
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}% from last hour
              </div>
            </div>

            <div className="w-16 h-10 relative">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'absolute bottom-0 w-2 rounded-t transition-all duration-500',
                    metric.trend === 'down' ? 'bg-gradient-to-t from-emerald-500 to-emerald-400' :
                    metric.trend === 'up' ? 'bg-gradient-to-t from-rose-500 to-rose-400' :
                    'bg-gradient-to-t from-slate-500 to-slate-400'
                  )}
                  style={{
                    left: `${i * 11}px`,
                    height: `${30 + Math.random() * 70}%`,
                    opacity: 0.4 + Math.random() * 0.6,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000',
                metric.trend === 'down' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                metric.trend === 'up' ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
                'bg-gradient-to-r from-slate-500 to-slate-400',
                'shadow-lg'
              )}
              style={{
                width: `${Math.min(100, Math.abs(metric.change) * 5)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
