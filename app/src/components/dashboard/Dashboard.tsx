'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RiskLab } from './RiskLab';
import { SystemStatus } from './SystemStatus';

export function Dashboard() {
  const [activePanel, setActivePanel] = useState('policies');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

      <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} />

      <div className="flex-1 flex flex-col relative z-10">
        <Header />

        <main className="flex-1 overflow-auto p-6 space-y-6">
          {activePanel === 'policies' && <RiskLab />}
          {activePanel === 'treasury' && <SystemStatus />}
          {activePanel === 'purchase' && <div className="text-cyan-400 text-center py-20">Purchase Panel - Coming Soon</div>}
          {activePanel === 'ai-swarm' && <div className="text-cyan-400 text-center py-20">AI Swarm Panel - Coming Soon</div>}
          {activePanel === 'analytics' && <div className="text-cyan-400 text-center py-20">Analytics Panel - Coming Soon</div>}
          {activePanel === 'claims' && <div className="text-cyan-400 text-center py-20">Claims History - Coming Soon</div>}
        </main>
      </div>
    </div>
  );
}
