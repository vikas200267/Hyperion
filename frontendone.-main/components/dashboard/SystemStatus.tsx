'use client';

import { Cpu, HardDrive, Wifi, Zap } from 'lucide-react';

export function SystemStatus() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full" />
          System Status
        </h2>
        <p className="text-slate-400 mt-1 ml-7">Infrastructure health and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: Cpu, label: 'CPU Usage', value: 45, color: 'cyan' },
          { icon: HardDrive, label: 'Storage', value: 67, color: 'emerald' },
          { icon: Wifi, label: 'Network', value: 92, color: 'purple' },
          { icon: Zap, label: 'Power', value: 88, color: 'amber' },
        ].map((item) => (
          <div
            key={item.label}
            className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-cyan-500/30">
                <item.icon className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">{item.label}</div>
                <div className="text-3xl font-bold text-white">{item.value}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
