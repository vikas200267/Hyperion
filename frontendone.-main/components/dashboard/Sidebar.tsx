'use client';

import { Activity, Shield, Zap, Database, Radio, Terminal, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

const menuItems = [
  { id: 'risk-lab', icon: Shield, label: 'Risk Lab', color: 'cyan' },
  { id: 'system-status', icon: Activity, label: 'System Status', color: 'emerald' },
  { id: 'analytics', icon: Zap, label: 'Analytics', color: 'amber' },
  { id: 'database', icon: Database, label: 'Database', color: 'purple' },
  { id: 'signals', icon: Radio, label: 'Signals', color: 'rose' },
  { id: 'terminal', icon: Terminal, label: 'Terminal', color: 'blue' },
];

export function Sidebar({ activePanel, onPanelChange }: SidebarProps) {
  return (
    <aside className="w-20 border-r border-cyan-500/20 bg-slate-950/50 backdrop-blur-xl relative z-20 flex flex-col">
      <div className="h-20 flex items-center justify-center border-b border-cyan-500/20">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
          <Shield className="w-6 h-6 text-white" />
        </div>
      </div>

      <nav className="flex-1 py-8 space-y-2 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPanelChange(item.id)}
              className={cn(
                'w-full h-14 rounded-xl flex items-center justify-center relative group transition-all duration-300',
                isActive
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 shadow-lg shadow-cyan-500/25'
                  : 'hover:bg-slate-800/50'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-all duration-300',
                  isActive
                    ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                    : 'text-slate-400 group-hover:text-slate-300'
                )}
              />

              {isActive && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-lg shadow-cyan-500/50" />
              )}

              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap">
                <span className="text-sm text-cyan-300 font-medium">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-cyan-500/20">
        <button className="w-full h-14 rounded-xl flex items-center justify-center hover:bg-slate-800/50 transition-all duration-300 group">
          <Settings className="w-6 h-6 text-slate-400 group-hover:text-slate-300 group-hover:rotate-90 transition-all duration-300" />
        </button>
      </div>
    </aside>
  );
}
