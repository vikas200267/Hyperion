'use client';

import { useState, useEffect } from 'react';
import { Bell, User, Power, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const [time, setTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<'online' | 'warning' | 'offline'>('online');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const statuses: ('online' | 'warning' | 'offline')[] = ['online', 'online', 'online', 'warning'];
      setSystemStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 border-b border-cyan-500/20 bg-slate-950/30 backdrop-blur-xl relative z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              MISSION CONTROL
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {time.toLocaleTimeString()} UTC
            </p>
          </div>

          <div className="h-8 w-px bg-cyan-500/20" />

          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full animate-pulse',
              systemStatus === 'online' && 'bg-emerald-400 shadow-lg shadow-emerald-400/50',
              systemStatus === 'warning' && 'bg-amber-400 shadow-lg shadow-amber-400/50',
              systemStatus === 'offline' && 'bg-rose-400 shadow-lg shadow-rose-400/50'
            )} />
            <span className={cn(
              'text-sm font-medium',
              systemStatus === 'online' && 'text-emerald-400',
              systemStatus === 'warning' && 'text-amber-400',
              systemStatus === 'offline' && 'text-rose-400'
            )}>
              {systemStatus.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 flex items-center gap-2 group">
            <Wifi className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
            <span className="text-sm text-slate-300 font-medium">98.5%</span>
          </button>

          <button className="h-10 w-10 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 flex items-center justify-center group relative">
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          </button>

          <div className="h-8 w-px bg-cyan-500/20" />

          <button className="h-10 px-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-600/10 hover:from-cyan-500/20 hover:to-blue-600/20 border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-slate-300 font-medium">Commander</span>
          </button>

          <button className="h-10 w-10 rounded-lg bg-slate-800/50 hover:bg-rose-500/20 border border-cyan-500/20 hover:border-rose-500/40 transition-all duration-300 flex items-center justify-center group">
            <Power className="w-5 h-5 text-slate-400 group-hover:text-rose-400 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}
