'use client';

import { Wallet, Lock, TrendingUp, Users } from 'lucide-react';

export function SystemStatus() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full" />
          Treasury Status
        </h2>
        <p className="text-slate-400 mt-1 ml-7">Smart contract treasury and liquidity management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: Wallet, label: 'Total Value Locked', value: '1.2M', suffix: 'USDM', color: 'cyan' },
          { icon: Lock, label: 'Policy Reserves', value: '850K', suffix: 'USDM', color: 'emerald' },
          { icon: TrendingUp, label: 'Available Liquidity', value: '350K', suffix: 'USDM', color: 'purple' },
          { icon: Users, label: 'Active Policies', value: '127', suffix: '', color: 'amber' },
        ].map((item) => (
          <div
            key={item.label}
            className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 shadow-2xl hover:border-cyan-500/40 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-cyan-500/30">
                <item.icon className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400 mb-1">{item.label}</div>
                <div className="text-3xl font-bold text-white">
                  {item.value}
                  <span className="text-lg text-slate-400 ml-1">{item.suffix}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">Treasury Health</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Collateralization Ratio</span>
            <span className="text-lg font-bold text-emerald-400">142%</span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div className="h-full w-[142%] max-w-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full shadow-lg" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-500">Minimum Required: 120%</span>
            <span className="text-xs text-emerald-400">✓ Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
