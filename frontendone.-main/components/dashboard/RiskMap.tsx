'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeatMapCell {
  x: number;
  y: number;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

export function RiskMap() {
  const [heatMapData, setHeatMapData] = useState<HeatMapCell[]>([]);

  useEffect(() => {
    const generateData = () => {
      const data: HeatMapCell[] = [];
      for (let x = 0; x < 12; x++) {
        for (let y = 0; y < 8; y++) {
          data.push({
            x,
            y,
            value: Math.random(),
            trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
          });
        }
      }
      setHeatMapData(data);
    };

    generateData();
    const interval = setInterval(generateData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (value: number) => {
    if (value > 0.7) return 'bg-rose-500/80 shadow-rose-500/50';
    if (value > 0.4) return 'bg-amber-500/80 shadow-amber-500/50';
    return 'bg-emerald-500/80 shadow-emerald-500/50';
  };

  const getRiskLabel = (value: number) => {
    if (value > 0.7) return 'CRITICAL';
    if (value > 0.4) return 'ELEVATED';
    return 'NORMAL';
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-amber-500/20 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Risk Heat Map</h3>
            <p className="text-xs text-slate-400">Sector-wide threat analysis</p>
          </div>
        </div>

        <div className="flex gap-4">
          {['NORMAL', 'ELEVATED', 'CRITICAL'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={cn(
                'w-3 h-3 rounded-sm',
                i === 0 && 'bg-emerald-500',
                i === 1 && 'bg-amber-500',
                i === 2 && 'bg-rose-500'
              )} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-12 gap-1">
          {heatMapData.map((cell, i) => (
            <div
              key={i}
              className={cn(
                'aspect-square rounded-sm transition-all duration-500 relative group cursor-pointer',
                getRiskColor(cell.value),
                'hover:scale-110 hover:z-10'
              )}
              style={{
                opacity: 0.3 + cell.value * 0.7,
                boxShadow: `0 0 ${cell.value * 20}px ${cell.value * 10}px currentColor`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {cell.trend === 'up' && <TrendingUp className="w-3 h-3 text-white" />}
                {cell.trend === 'down' && <TrendingDown className="w-3 h-3 text-white" />}
              </div>

              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50">
                <div className="text-xs text-cyan-300 font-medium">
                  Sector {cell.x}-{cell.y}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Risk: {getRiskLabel(cell.value)}
                </div>
                <div className="text-xs text-slate-400">
                  Level: {(cell.value * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-slate-800/50 border border-emerald-500/20">
          <div className="text-2xl font-bold text-emerald-400">67</div>
          <div className="text-xs text-slate-400 mt-1">Safe Zones</div>
        </div>
        <div className="p-4 rounded-lg bg-slate-800/50 border border-amber-500/20">
          <div className="text-2xl font-bold text-amber-400">21</div>
          <div className="text-xs text-slate-400 mt-1">Watch Zones</div>
        </div>
        <div className="p-4 rounded-lg bg-slate-800/50 border border-rose-500/20">
          <div className="text-2xl font-bold text-rose-400">8</div>
          <div className="text-xs text-slate-400 mt-1">Critical Zones</div>
        </div>
      </div>
    </div>
  );
}
