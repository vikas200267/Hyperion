'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreatEvent {
  id: string;
  timestamp: Date;
  type: 'resolved' | 'detected' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
}

export function ThreatTimeline() {
  const [events, setEvents] = useState<ThreatEvent[]>([]);

  useEffect(() => {
    const generateEvent = (): ThreatEvent => {
      const types: ('resolved' | 'detected' | 'critical')[] = ['resolved', 'detected', 'critical'];
      const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
      const titles = [
        'Anomalous Network Activity',
        'Unauthorized Access Attempt',
        'System Resource Spike',
        'Security Protocol Breach',
        'Data Transfer Anomaly',
        'Authentication Failure',
      ];
      const locations = ['Sector A-7', 'Node B-12', 'Gateway C-3', 'Zone D-9', 'Hub E-5'];

      return {
        id: Math.random().toString(36),
        timestamp: new Date(),
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        title: titles[Math.floor(Math.random() * titles.length)],
        description: 'Real-time threat detection and analysis in progress',
        location: locations[Math.floor(Math.random() * locations.length)],
      };
    };

    const initialEvents = Array.from({ length: 5 }, generateEvent).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    setEvents(initialEvents);

    const interval = setInterval(() => {
      setEvents((prev) => {
        const newEvent = generateEvent();
        return [newEvent, ...prev].slice(0, 8);
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: string) => {
    if (type === 'resolved') return CheckCircle;
    if (type === 'critical') return XCircle;
    return AlertTriangle;
  };

  const getEventColor = (severity: string) => {
    if (severity === 'critical') return 'rose';
    if (severity === 'high') return 'orange';
    if (severity === 'medium') return 'amber';
    return 'emerald';
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Threat Timeline</h3>
            <p className="text-xs text-slate-400">Recent security events and alerts</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-cyan-500/20 text-xs text-slate-300 transition-all duration-300">
            All Events
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-cyan-500/20 text-xs text-slate-300 transition-all duration-300">
            Critical Only
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => {
          const Icon = getEventIcon(event.type);
          const color = getEventColor(event.severity);

          return (
            <div
              key={event.id}
              className={cn(
                'p-4 rounded-xl border transition-all duration-500 hover:scale-[1.02] cursor-pointer group',
                'bg-slate-800/30 border-slate-700/50 hover:border-cyan-500/30'
              )}
              style={{
                animation: index === 0 ? 'slideIn 0.5s ease-out' : 'none',
              }}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  color === 'rose' && 'bg-rose-500/20 border border-rose-500/30',
                  color === 'orange' && 'bg-orange-500/20 border border-orange-500/30',
                  color === 'amber' && 'bg-amber-500/20 border border-amber-500/30',
                  color === 'emerald' && 'bg-emerald-500/20 border border-emerald-500/30'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    color === 'rose' && 'text-rose-400',
                    color === 'orange' && 'text-orange-400',
                    color === 'amber' && 'text-amber-400',
                    color === 'emerald' && 'text-emerald-400'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                    </div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">
                      {event.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        color === 'rose' && 'bg-rose-500/20 text-rose-400',
                        color === 'orange' && 'bg-orange-500/20 text-orange-400',
                        color === 'amber' && 'bg-amber-500/20 text-amber-400',
                        color === 'emerald' && 'bg-emerald-500/20 text-emerald-400'
                      )}>
                        {event.severity.toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-500">{event.location}</span>
                    </div>

                    <div className="ml-auto flex gap-2">
                      <button className="px-3 py-1 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-xs text-slate-300 transition-all duration-300">
                        View
                      </button>
                      <button className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-xs text-cyan-300 transition-all duration-300">
                        Analyze
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
