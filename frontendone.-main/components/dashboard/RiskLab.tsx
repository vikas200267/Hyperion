'use client';

import { RiskMap } from './RiskMap';
import { RealtimeIndicators } from './RealtimeIndicators';
import { ThreatTimeline } from './ThreatTimeline';
import { RiskMetrics } from './RiskMetrics';

export function RiskLab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
            Risk Lab
          </h2>
          <p className="text-slate-400 mt-1 ml-7">Real-time threat assessment and monitoring</p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-cyan-500/20 hover:border-cyan-500/40 text-sm text-slate-300 font-medium transition-all duration-300">
            Export Data
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-sm text-white font-medium transition-all duration-300 shadow-lg shadow-cyan-500/25">
            Run Analysis
          </button>
        </div>
      </div>

      <RiskMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiskMap />
        </div>
        <div>
          <RealtimeIndicators />
        </div>
      </div>

      <ThreatTimeline />
    </div>
  );
}
