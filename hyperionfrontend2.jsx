import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { 
    Shield, Wind, Activity, Terminal, AlertTriangle, Database, Cpu, Zap, Lock, RefreshCw, FileJson, 
    Plane, CloudRain, HeartPulse, Car, Home, Coins, Users, Server,
    Wallet, Code, Check, ShoppingCart, LayoutDashboard, PlayCircle, Star, Award, TrendingUp, Clock, 
    FileText, UploadCloud, XCircle, Globe, Landmark, Vote, Gavel, Skull, Sparkles, ClipboardList,
    Bell, ChevronRight, Info, Flame, ShieldCheck, Siren, LockOpen, ZapOff, Receipt, Download, MessageSquare, Briefcase, ArrowRightLeft, ArrowUpRight, Send, Link, RotateCw, AlertCircle, Layers, Radio, Menu, X
} from 'lucide-react';

// --- Constants & Config ---
const VARIANCE_LIMIT = 15; 
const INITIAL_LIQUIDITY = 500000; 
const STORAGE_KEY = 'hyperion_v4_state';
const ADA_PRICE = 0.45; 

const LOYALTY_TIERS = {
    SILVER: { min: 0, discount: 0, color: 'text-slate-400', border: 'border-slate-700', bg: 'bg-slate-900', label: 'SILVER', voteWeight: 1 },
    GOLD: { min: 1000, discount: 0.05, color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-950/30', label: 'GOLD', voteWeight: 5 },
    PLATINUM: { min: 5000, discount: 0.10, color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-950/30', label: 'PLATINUM', voteWeight: 20 }
};

const POLICY_TYPES = {
    HURRICANE: { id: 'hurricane', name: 'Hurricane Guard', category: 'NAT-CAT', unit: 'mph', threshold: 100, condition: '>', icon: Wind, color: '#3b82f6', severityTiers: [{ limit: 100, payout: 0 }, { limit: 110, payout: 0.5 }, { limit: 130, payout: 1.0 }], sliderMax: 160, sliderLabel: ['CALM', 'GALE', 'STORM', 'CAT 5'], requiredProof: 'Property Deed & Geo-Tag', agentRoles: ['NOAA Scout', 'Sat Verifier', 'News Bot'] },
    FLIGHT: { id: 'flight', name: 'Flight Delay', category: 'TRAVEL', unit: 'min', threshold: 120, condition: '>', icon: Plane, color: '#a855f7', severityTiers: [{ limit: 120, payout: 0 }, { limit: 180, payout: 0.5 }, { limit: 240, payout: 1.0 }], sliderMax: 240, sliderLabel: ['ON TIME', 'DELAYED', 'SEVERE', 'CANCEL'], requiredProof: 'Boarding Pass Hash', agentRoles: ['FlightAware', 'ATC Net', 'IATA Bot'] },
    CROP: { id: 'crop', name: 'Agri-Drought', category: 'AGRI', unit: 'mm', threshold: 30, condition: '<', icon: CloudRain, color: '#10b981', severityTiers: [{ limit: 30, payout: 0 }, { limit: 15, payout: 0.5 }, { limit: 5, payout: 1.0 }], sliderMax: 100, sliderLabel: ['ARID', 'DRY', 'NORMAL', 'WET'], requiredProof: 'Soil IoT Logs', agentRoles: ['Soil Sens', 'Sat Image', 'Met Office'] },
    HEALTH: { id: 'health', name: 'Vital Monitor', category: 'HEALTH', unit: 'bpm', threshold: 160, condition: '>', icon: HeartPulse, color: '#ef4444', severityTiers: [{limit:160, payout:0}, {limit:180, payout:1}], sliderMax: 200, sliderLabel: ['NORMAL', 'ELEV', 'CRIT', 'DEAD'], requiredProof: 'Medical Report', agentRoles: ['Wearable', 'Hospital DB'] },
    GOLD: { id: 'gold', name: 'Collateral Peg', category: 'DEFI', unit: 'USD', threshold: 2000, condition: '<', icon: Coins, color: '#eab308', severityTiers: [{limit:2000, payout:0}, {limit:1800, payout:1}], sliderMax: 2500, sliderLabel: ['DUMP', 'PEG', 'PUMP', 'MOON'], requiredProof: 'Custody Sig', agentRoles: ['Chainlink', 'Binance'] }
};

const apiKey = ""; 

// --- Styles ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
    :root { --bg-dark: #030712; --glass-bg: rgba(17, 24, 39, 0.7); --glass-border: rgba(255, 255, 255, 0.08); --primary: #3b82f6; }
    body { background-color: var(--bg-dark); color: #e2e8f0; font-family: 'Inter', sans-serif; overflow: hidden; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .bg-mesh { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.08), transparent 25%); z-index: -1; animation: pulseMesh 10s ease-in-out infinite alternate; }
    @keyframes pulseMesh { 0% { opacity: 0.5; transform: scale(1); } 100% { opacity: 1; transform: scale(1.05); } }
    .glass-panel { background: var(--glass-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--glass-border); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }
    .glass-card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .glass-card-hover:hover { background: rgba(30, 41, 59, 0.6); border-color: rgba(59, 130, 246, 0.3); transform: translateY(-2px); box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.2); }
    ::-webkit-scrollbar { width: 5px; height: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; } ::-webkit-scrollbar-thumb:hover { background: #475569; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-enter { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes blink { 50% { opacity: 0; } } .animate-blink { animation: blink 1s step-end infinite; }
    input[type=range] { -webkit-appearance: none; background: transparent; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%; background: #fff; cursor: pointer; margin-top: -7px; box-shadow: 0 0 15px rgba(255,255,255,0.5); transition: transform 0.1s; }
    input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
    input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: #334155; border-radius: 2px; }
    .staking-gradient { background: linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(15,23,42,0) 100%); }
    .ticker-wrap { width: 100%; overflow: hidden; white-space: nowrap; }
    .ticker { display: inline-block; animation: ticker 45s linear infinite; }
    .ticker-wrap:hover .ticker { animation-play-state: paused; }
    @keyframes ticker { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(-100%, 0, 0); } }
    .cursor-blink { animation: blink 1s step-end infinite; }
  `}</style>
);

// --- Helper Components ---
const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map(toast => (
            <div key={toast.id} className={`pointer-events-auto transform transition-all duration-300 ease-in-out translate-x-0 opacity-100 flex items-center gap-3 p-4 rounded-lg shadow-xl border border-slate-700/50 backdrop-blur-md ${toast.type === 'success' ? 'bg-green-900/80 text-green-100' : toast.type === 'error' ? 'bg-red-900/80 text-red-100' : 'bg-slate-800/90 text-slate-200'}`}>
                {toast.type === 'success' ? <Check size={18} /> : toast.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
                <div className="text-xs font-medium flex-1">{toast.message}</div>
                <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100"><XCircle size={14} /></button>
            </div>
        ))}
    </div>
);

const Typewriter = ({ text }) => {
    const [display, setDisplay] = useState('');
    useEffect(() => {
        let i = 0;
        setDisplay('');
        if (!text) return;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplay(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 20); 
        return () => clearInterval(interval);
    }, [text]);
    return <span className="font-mono">{display}<span className="cursor-blink">_</span></span>;
};

const LoyaltyBadge = ({ xp }) => {
    let tier = LOYALTY_TIERS.SILVER;
    if (xp >= LOYALTY_TIERS.PLATINUM.min) tier = LOYALTY_TIERS.PLATINUM;
    else if (xp >= LOYALTY_TIERS.GOLD.min) tier = LOYALTY_TIERS.GOLD;
    return (
        <div className={`flex items-center gap-3 px-3 py-1.5 rounded-full border bg-slate-900/50 backdrop-blur-sm ${tier.border} ${tier.color} shadow-sm transition-all hover:scale-105`}>
            <Award size={16} />
            <div className="flex flex-col leading-none">
                <span className="text-[10px] uppercase font-bold tracking-wider">{tier.label} Member</span>
                <span className="text-[9px] opacity-70 font-mono">{xp.toLocaleString()} XP • {tier.voteWeight}x Power</span>
            </div>
        </div>
    );
};

const GlobalTicker = ({ events }) => (
    <div className="w-full bg-slate-900 border-b border-slate-800 h-10 flex items-center overflow-hidden relative z-50 shadow-md">
        <div className="px-4 bg-gradient-to-r from-blue-700 to-blue-600 h-full flex items-center text-[10px] font-black tracking-widest text-white z-20 shrink-0 shadow-[4px_0_15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2">
                <div className="relative"><div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute opacity-75"></div><div className="w-2 h-2 bg-green-500 rounded-full relative"></div></div>
                <Globe size={14} className="text-blue-100" />
                <span>HYPERION NET</span>
            </div>
        </div>
        <div className="absolute left-[130px] top-0 bottom-0 w-12 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
        <div className="ticker-wrap w-full hover:pause-animation cursor-default">
            <div className="ticker pl-4 flex items-center">
                {events.map((e, i) => (
                    <div key={i} className="inline-flex items-center mr-16 text-xs font-mono text-slate-400 select-none group">
                        <div className={`p-1.5 rounded-full mr-2.5 shadow-sm border border-white/5 ${e.type === 'buy' ? 'bg-green-500/10 text-green-400' : e.type === 'claim' ? 'bg-red-500/10 text-red-400' : e.type === 'stake' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {e.type === 'buy' ? <ShoppingCart size={10} /> : e.type === 'claim' ? <Zap size={10} /> : e.type === 'stake' ? <Landmark size={10} /> : <Activity size={10} />}
                        </div>
                        <div className="flex flex-col leading-tight">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-200 font-bold group-hover:text-blue-300 transition-colors">{e.user}</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider opacity-40 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{e.time}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">{e.msg}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const AgentCard = ({ agent, policyType }) => {
    const config = POLICY_TYPES[policyType];
    const isMalicious = agent.status === 'malicious';
    const isReporting = agent.currentVote !== null;
    const isAlarm = agent.currentVote !== null && (config.condition === '>' ? agent.currentVote > config.threshold : agent.currentVote < config.threshold);

    return (
        <div className={`glass-panel p-3 rounded-lg relative overflow-hidden transition-all duration-300 group ${isMalicious ? 'border-red-500/50 bg-red-900/10' : 'border-slate-700 hover:border-blue-500/30'}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isReporting ? 'bg-green-400 shadow-[0_0_5px_#4ade80] animate-pulse' : 'bg-slate-600'}`}></div>
                    <span className="text-xs font-bold text-slate-300 truncate max-w-[100px]">{agent.role}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">ID:{agent.id.slice(-4)}</span>
            </div>
            <div className="flex justify-between items-end">
                <div><div className="text-[9px] text-slate-500 uppercase tracking-wider">Reputation</div><div className="text-xs font-mono text-blue-400">{agent.reputation}%</div></div>
                <div className="text-right">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Data Feed</div>
                    <div className={`text-sm font-bold font-mono ${isAlarm ? 'text-red-400' : 'text-slate-200'}`}>
                        {agent.currentVote !== null ? `${agent.currentVote.toFixed(1)}` : '--'} <span className="text-[9px] text-slate-500">{config.unit}</span>
                    </div>
                </div>
            </div>
            <div className="mt-2 h-0.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className={`h-full transition-all duration-500 ${isMalicious ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${isReporting ? 100 : 0}%` }}></div></div>
        </div>
    );
};

const TerminalLog = ({ logs, aiAnalysis }) => {
    const endRef = useRef(null);
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs, aiAnalysis]);
    return (
        <div className="glass-panel rounded-xl p-4 h-72 flex flex-col font-mono text-xs border-l-2 border-l-blue-500 relative overflow-hidden bg-slate-950/50">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold"><Terminal size={12} /> Kodosumi Node v4.1</div>
                <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-slate-700"></div><div className="w-2 h-2 rounded-full bg-slate-700"></div></div>
            </div>
            <div className="flex-1 overflow-y-auto terminal-scroll space-y-1.5 relative z-10 pr-2">
                {aiAnalysis && (
                    <div className="mb-4 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-indigo-200 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-1.5 text-indigo-400 font-bold uppercase text-[9px] tracking-wider"><Sparkles size={10} /> Gemini Intelligence</div>
                        <div className="leading-relaxed opacity-90 font-mono text-[11px]"><Typewriter text={aiAnalysis} /></div>
                    </div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className={`flex gap-3 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : log.type === 'chain' ? 'text-amber-400' : 'text-slate-400'}`}>
                        <span className="opacity-30 shrink-0 text-[10px]">{log.time}</span><span className="break-words">{log.msg}</span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};

const StakingView = () => {
    const [liquidityPool, setLiquidityPool] = useState(INITIAL_LIQUIDITY);
    const [apy, setApy] = useState(4.5);
    return (
        <div className="animate-enter grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                 <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                 <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                     <Landmark className="text-blue-400" /> Liquidity Pool
                 </h2>
                 <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                     <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-md">
                         <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">TVL</div>
                         <div className="text-3xl font-mono text-white font-bold tracking-tighter">{INITIAL_LIQUIDITY.toLocaleString()} <span className="text-sm text-slate-500 font-sans">ADA</span></div>
                     </div>
                     <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-md">
                         <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">APY</div>
                         <div className="text-3xl font-mono text-green-400 font-bold tracking-tighter">{apy}%</div>
                     </div>
                 </div>
            </div>
            <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                    <div className="w-40 h-40 rounded-full border-8 border-slate-800 flex items-center justify-center relative z-10 bg-slate-900">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white">72%</div>
                            <div className="text-[10px] text-slate-500 uppercase">Health</div>
                        </div>
                    </div>
                    <svg className="absolute top-0 left-0 w-40 h-40 -rotate-90 pointer-events-none">
                        <circle cx="80" cy="80" r="76" stroke="#3b82f6" strokeWidth="8" fill="none" strokeDasharray="477" strokeDashoffset="133" strokeLinecap="round" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Pool Health: Optimal</h3>
            </div>
        </div>
    );
};

const StatusFooter = () => (
    <div className="h-8 bg-slate-950 border-t border-slate-800 flex items-center px-6 justify-between text-[10px] font-mono text-slate-500 select-none">
        <div className="flex gap-6">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> MAINNET: EPOCH 482</span>
            <span className="hidden md:inline">TPS: 1,204</span>
            <span className="hidden md:inline">GAS: 0.17 ADA</span>
        </div>
        <div className="flex gap-4">
            <span>HYPERION ORACLE V4.0.2</span>
            <span className="text-blue-400">CONNECTED</span>
        </div>
    </div>
);

const DashboardHome = ({ wallet, policies = [] }) => (
    <div className="space-y-6 animate-enter">
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 glass-panel p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={120} /></div>
                <h2 className="text-2xl font-bold text-white mb-1">Welcome back, Operator</h2>
                <p className="text-sm text-slate-400 mb-6">System integrity is optimal. 3 active oracle nodes.</p>
                <div className="flex gap-4">
                    <StatBox label="Active Policies" value={policies.length} unit="CONTRACTS" />
                    <StatBox label="Total Coverage" value={policies.reduce((acc, p) => acc + (p.coverage || 0), 0).toLocaleString()} unit="ADA" color="text-blue-400" />
                    <StatBox label="Risk Index" value="LOW" unit="LEVEL 1" color="text-green-400" />
                </div>
            </div>
            <div className="w-full md:w-80 glass-panel p-6 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Recent Network Activity</h3>
                <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="flex items-center gap-3 text-sm"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-slate-300">Block #{482920 + i} Finalized</span><span className="ml-auto text-slate-600 text-xs font-mono">2s ago</span></div>)}</div>
            </div>
        </div>
    </div>
);

const Marketplace = ({ wallet, setWallet, setPolicies, addToast }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-enter">
        {Object.entries(POLICY_TYPES).map(([key, p]) => (
            <div key={key} className="glass-panel p-6 rounded-2xl glass-card-hover relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-slate-900/50 rounded-xl text-white border border-slate-700 group-hover:border-blue-500/50 transition-colors"><p.icon size={24} /></div>
                    <div className="text-right"><div className="text-[10px] font-bold text-slate-500 uppercase">Premium</div><div className="text-xl font-mono font-bold text-white">{p.basePremium} ₳</div></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 relative z-10">{p.name}</h3>
                <button onClick={() => { if(wallet.balance < p.basePremium) return addToast('Insufficient Funds', 'error'); setWallet(prev => ({...prev, balance: prev.balance - p.basePremium})); setPolicies(prev => [...prev, { instanceId: Date.now(), type: key, status: 'Active', purchaseDate: new Date(), expiryDate: new Date(Date.now() + 86400000 * 30) }]); addToast(`Purchased ${p.name}`, 'success'); }} className="w-full py-3 bg-white/5 hover:bg-blue-600 hover:text-white text-slate-300 font-bold text-xs rounded-xl border border-white/10 transition-all relative z-10 mt-6">PURCHASE COVERAGE</button>
            </div>
        ))}
    </div>
);

const WalletHub = ({ wallet, policies }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-enter">
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet size={100} /></div>
            <h2 className="text-xl font-bold text-white mb-6">Asset Overview</h2>
            <div className="text-5xl font-mono font-bold text-white mb-2">{wallet.balance.toLocaleString()} <span className="text-lg text-slate-500">ADA</span></div>
            <div className="text-sm text-slate-400 mb-8">≈ ${(wallet.balance * ADA_PRICE).toLocaleString()} USD</div>
            <div className="flex gap-4"><button className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"><ArrowUpRight size={16} /> SEND</button><button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"><ArrowRightLeft size={16} /> SWAP</button></div>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Active Coverage</h2>
            {policies.length === 0 ? <div className="text-center py-12 text-slate-600 text-sm">No active policies</div> : <div className="space-y-3">{policies.map(p => <div key={p.instanceId} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800"><div className="flex items-center gap-3"><div className="p-2 bg-slate-800 rounded-lg"><ShieldCheck size={16} className="text-blue-400" /></div><div><div className="font-bold text-white text-xs">{POLICY_TYPES[p.type].name}</div><div className="text-[10px] text-slate-500 font-mono">ID: {p.instanceId}</div></div></div><span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">ACTIVE</span></div>)}</div>}
        </div>
    </div>
);

const StatBox = ({ label, value, unit, color = 'text-white' }) => (
    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/50"><div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">{label}</div><div className={`text-lg font-mono font-bold ${color}`}>{value} <span className="text-[10px] text-slate-600 font-normal">{unit}</span></div></div>
);

const RiskLab = ({ labPolicyType, setLabPolicyType, simValue, setSimValue, consensus, chartData, addToast, activePolicyId, isSimulator, myPolicies, setView, agents, setAgents }) => {
    const getActiveConfig = () => (isSimulator && activePolicyId) ? POLICY_TYPES[myPolicies.find(p => p.instanceId === activePolicyId)?.type] : POLICY_TYPES[labPolicyType];
    const ActiveConfig = getActiveConfig();
    const riskLevel = simValue / ActiveConfig.sliderMax;
    const riskColor = riskLevel > 0.8 ? 'red' : riskLevel > 0.5 ? 'amber' : 'blue';
    const riskBorderClass = riskColor === 'red' ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : riskColor === 'amber' ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]';
    const [policyStatus, setPolicyStatus] = useState('Active');
    const [pendingPayout, setPendingPayout] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef(null);

    const analyzeWithGemini = () => { setIsAnalyzing(true); setTimeout(() => { setAiAnalysis(`ANALYSIS COMPLETE\n>> EVENT: ${consensus.val.toFixed(1)}\n>> VAR: ${consensus.var.toFixed(2)}\n>> REC: ${riskLevel > 0.8 ? 'PAYOUT' : 'HOLD'}`); setIsAnalyzing(false); }, 2000); };
    const handleFileUpload = (e) => { if (e.target.files?.[0]) { setIsVerifying(true); setTimeout(() => { setUploadedFile('Verified'); setTimeout(() => { setPolicyStatus('Settled'); addToast('Claim Approved', 'success'); setIsVerifying(false); }, 1500); }, 1500); }};
    const toggleHack = (id) => { setAgents(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'normal' ? 'malicious' : 'normal' } : a)); };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-enter">
            <div className="lg:col-span-4 space-y-6">
                {isSimulator && <button onClick={() => setView('PORTFOLIO')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition-colors group"><div className="bg-slate-800 p-1 rounded-full group-hover:bg-slate-700"><ChevronRight size={12} className="rotate-180" /></div> Back to Portfolio</button>}
                <div className={`glass-panel p-6 rounded-2xl border-t-4 ${riskBorderClass} transition-all duration-500`}>
                    <div className="flex justify-between items-center mb-6"><h2 className="font-bold text-white flex items-center gap-2"><Zap size={16} className={`text-${riskColor}-500`} /> SIMULATOR</h2><span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-${riskColor}-500/10 text-${riskColor}-400 border border-${riskColor}-500/20`}>{riskLevel > 0.8 ? 'CRITICAL' : 'LIVE'}</span></div>
                    {!isSimulator && <div className="mb-8"><div className="relative group"><select value={labPolicyType} onChange={(e) => setLabPolicyType(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl p-3 pl-10 appearance-none outline-none hover:border-slate-500 transition-colors">{Object.entries(POLICY_TYPES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select><ActiveConfig.icon size={16} className="absolute left-3 top-3.5 text-slate-400" /><ChevronRight size={16} className="absolute right-3 top-3.5 text-slate-600 rotate-90" /></div></div>}
                    <div className="mb-8"><div className="flex justify-between items-end mb-3"><span className="text-xs font-mono text-slate-400">INTENSITY</span><span className={`text-3xl font-mono font-bold text-${riskColor}-400`}>{simValue.toFixed(1)} <span className="text-sm text-slate-500">{ActiveConfig.unit}</span></span></div><input type="range" min="0" max={ActiveConfig.sliderMax} value={simValue} onChange={(e) => setSimValue(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" /><div className="flex justify-between mt-2">{ActiveConfig.sliderLabel.map((l, i) => <span key={i} className="text-[9px] font-bold text-slate-600">{l}</span>)}</div></div>
                    <div className="space-y-2"><div className="text-[10px] font-bold text-slate-500 uppercase">Triggers</div>{ActiveConfig.severityTiers.map((tier, i) => { const isActive = ActiveConfig.condition === '>' ? simValue >= tier.limit : simValue <= tier.limit; return <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isActive ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/30 border-slate-800'}`}><div className="flex items-center gap-3">{isActive ? <LockOpen size={14} className="text-blue-400" /> : <Lock size={14} className="text-slate-600" />}<span className={`text-xs font-mono ${isActive ? 'text-white' : 'text-slate-500'}`}>{ActiveConfig.condition} {tier.limit} {ActiveConfig.unit}</span></div><span className={`text-[10px] font-bold ${isActive ? 'text-blue-300' : 'text-slate-700'}`}>{(tier.payout * 100)}% PAYOUT</span></div> })}</div>
                </div>
                {isSimulator && <div className="p-5 bg-amber-950/30 border border-amber-500/20 rounded-2xl animate-in slide-in-from-bottom-2"><div className="flex items-center gap-2 text-amber-400 mb-3 font-bold text-xs"><AlertCircle size={14} /> ORACLE CHALLENGE</div><div className="p-3 bg-black/30 rounded border border-amber-500/10 mb-4 font-mono text-[10px] text-amber-200/70">REQ: {ActiveConfig.requiredProof}</div>{!uploadedFile ? <><input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" /><button onClick={() => fileInputRef.current?.click()} disabled={isVerifying} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded flex items-center justify-center gap-2 transition-all">{isVerifying ? <RefreshCw className="animate-spin" size={14} /> : <UploadCloud size={14} />} {isVerifying ? 'VERIFYING...' : 'UPLOAD EVIDENCE'}</button></> : <div className="w-full py-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold text-xs rounded flex items-center justify-center gap-2"><Check size={14} /> VERIFIED</div>}</div>}
            </div>
            <div className="lg:col-span-8 space-y-6">
                <div className="glass-panel p-6 rounded-2xl min-h-[400px] flex flex-col"><div className="grid grid-cols-2 gap-4 mb-6"><div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center"><div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Consensus</div><div className="text-3xl font-mono font-bold text-white">{consensus.val.toFixed(2)}</div></div><div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-center"><div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Variance</div><div className={`text-3xl font-mono font-bold ${consensus.var > 5 ? 'text-red-400' : 'text-emerald-400'}`}>{consensus.var.toFixed(2)}</div></div></div><div className="flex-1 relative mb-6 rounded-xl overflow-hidden bg-slate-900/30 border border-slate-800/50"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={ActiveConfig.color} stopOpacity={0.3}/><stop offset="95%" stopColor={ActiveConfig.color} stopOpacity={0}/></linearGradient></defs><Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#1e293b', color: '#fff', fontSize:'12px'}} itemStyle={{color:'#fff'}} /><Area type="monotone" dataKey="val" stroke={ActiveConfig.color} fill="url(#colorVal)" strokeWidth={2} isAnimationActive={false} /><ReferenceLine y={ActiveConfig.threshold} stroke="red" strokeDasharray="3 3" opacity={0.5} /></AreaChart></ResponsiveContainer></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{agents.map(agent => <AgentCard key={agent.id} agent={agent} policyType={isSimulator ? myPolicies.find(p=>p.instanceId===activePolicyId)?.type : labPolicyType} onHack={() => toggleHack(agent.id)} />)}</div></div>
                <TerminalLog logs={[]} aiAnalysis={aiAnalysis} />
            </div>
        </div>
    );
};

const TransactionView = ({ transactions, formatCurrency, getPrice }) => (
    <div className="glass-panel p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Receipt className="text-blue-400" /> Transaction History
        </h2>
        {transactions.length === 0 ? (
            <div className="text-center py-12 opacity-50">
                <Receipt size={48} className="mx-auto mb-4 text-slate-600" />
                <p>No transactions found.</p>
            </div>
        ) : (
            <div className="space-y-3">
                {transactions.map(tx => (
                    <div key={tx.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${
                                tx.type === 'BUY' ? 'bg-red-500/10 text-red-400' : 
                                tx.type === 'CLAIM' ? 'bg-green-500/10 text-green-400' : 
                                tx.type === 'STAKE' ? 'bg-blue-500/10 text-blue-400' : 
                                'bg-amber-500/10 text-amber-400'
                            }`}>
                                {tx.type === 'BUY' ? <ArrowUpRight size={18} /> : 
                                 tx.type === 'CLAIM' ? <ArrowRightLeft size={18} /> : 
                                 tx.type === 'BRIDGE' ? <Globe size={18} /> : 
                                 <Landmark size={18} />}
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm">{tx.desc}</div>
                                <div className="text-xs text-slate-500 font-mono">{tx.date}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`font-mono font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-slate-200'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.currency === 'USDM' ? `$${Math.abs(tx.amount).toFixed(2)}` : `${Math.abs(tx.amount)} ADA`}
                            </div>
                            <button className="text-[10px] flex items-center gap-1 text-blue-400 hover:text-blue-300 ml-auto mt-1">
                                <Download size={10} /> Receipt
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const SupportChat = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Welcome to Hyperion Support. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const endRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        setTimeout(() => {
            const botMsg = { 
                id: Date.now() + 1, 
                sender: 'bot', 
                text: "I'm a simulated agent. For claim disputes, please ensure you've uploaded a valid Proof of Loss (PDF/JPG) in the Simulator tab." 
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1500);
    };

    return (
        <div className="glass-panel p-0 rounded-2xl h-[500px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white"><Briefcase size={20} /></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                </div>
                <div>
                    <h3 className="font-bold text-white">Agent Smith</h3>
                    <p className="text-xs text-green-400">Online • Typically replies in 2m</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            msg.sender === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <button onClick={handleSend} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

const BridgeAssets = ({ addLog, recordTransaction, setWallet }) => {
    const [amount, setAmount] = useState('');
    const [chain, setChain] = useState('ETH');
    const [status, setStatus] = useState('IDLE');

    const handleBridge = () => {
        if (!amount || isNaN(amount) || amount <= 0) return;
        setStatus('BRIDGING');
        addLog(`Initiating Bridge from ${chain} Network...`, 'chain');
        
        setTimeout(() => {
            addLog(`Locking assets on ${chain} smart contract...`, 'chain');
            setTimeout(() => {
                addLog(`Minting wrapped assets on Cardano...`, 'success');
                setWallet(prev => ({ ...prev, balance: prev.balance + Number(amount) }));
                recordTransaction('BRIDGE', `Bridged from ${chain}`, Number(amount));
                setStatus('SUCCESS');
                setTimeout(() => {
                    setStatus('IDLE');
                    setAmount('');
                }, 2000);
            }, 2000);
        }, 2000);
    };

    return (
        <div className="glass-panel p-8 rounded-2xl max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ArrowRightLeft className="text-indigo-400" /> Bridge Assets</h2>
            
            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">From Network</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['ETH', 'SOL', 'BTC'].map(c => (
                            <button 
                                key={c}
                                onClick={() => setChain(c)}
                                className={`py-3 rounded-xl text-sm font-bold border transition-all ${chain === c ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Amount to Bridge</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-indigo-500 outline-none"
                            placeholder="0.00"
                        />
                        <span className="absolute right-4 top-3.5 text-slate-500 font-bold text-sm">ADA</span>
                    </div>
                </div>

                {status === 'BRIDGING' ? (
                    <div className="bg-slate-800 rounded-xl p-4 flex flex-col items-center justify-center h-14">
                        <div className="flex items-center gap-3 text-indigo-400 text-sm font-bold animate-pulse">
                            <RotateCw className="animate-spin" size={18} /> Bridging Assets...
                        </div>
                    </div>
                ) : status === 'SUCCESS' ? (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center justify-center gap-2 text-green-400 font-bold">
                        <Check size={18} /> Transfer Complete
                    </div>
                ) : (
                    <button 
                        onClick={handleBridge}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                        <Link size={18} /> Bridge Funds
                    </button>
                )}
            </div>
        </div>
    );
};

export default function HyperionDashboard() {
    const [view, setView] = useState('RISK_LAB');
    const [wallet, setWallet] = useState({ connected: false, address: null, balance: 2500, xp: 0, staked: 0 });
    const [myPolicies, setMyPolicies] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [globalRiskIndex, setGlobalRiskIndex] = useState(1.0);
    const [currency, setCurrency] = useState('ADA');
    const [globalEvents, setGlobalEvents] = useState([{ user: 'addr1...9x2a', type: 'buy', msg: 'purchased Flight Delay Protect', time: '1m ago' }]);
    const [labPolicyType, setLabPolicyType] = useState('HURRICANE');
    const [simValue, setSimValue] = useState(45);
    const [chartData, setChartData] = useState([]);
    const [consensus, setConsensus] = useState({ val: 0, var: 0 });
    const [activePolicyId, setActivePolicyId] = useState(null);
    const [agents, setAgents] = useState([]);
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) { try { const parsed = JSON.parse(saved); if (parsed.wallet) setWallet(parsed.wallet); if (parsed.transactions) setTransactions(parsed.transactions); if (parsed.myPolicies) setMyPolicies(parsed.myPolicies); } catch (e) {} }
    }, []);

    useEffect(() => { if (wallet.connected) localStorage.setItem(STORAGE_KEY, JSON.stringify({ wallet, myPolicies, transactions })); }, [wallet, myPolicies, transactions]);

    const addToast = (message, type) => { const id = Date.now(); setToasts(prev => [...prev, { id, message, type }]); setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000); };
    const addLog = (msg, type='info') => console.log(msg); // Simplified log handler for now
    const recordTransaction = (type, desc, amount) => setTransactions(prev => [{ id: Date.now(), date: new Date().toLocaleString(), type, desc, amount, currency }, ...prev]);
    const getPrice = (amount) => currency === 'ADA' ? amount : amount * ADA_PRICE;
    const formatCurrency = (val) => currency === 'ADA' ? `${val.toLocaleString()} ADA` : `$${val.toLocaleString(undefined, {minimumFractionDigits: 2})} USDM`;
    const connectWallet = () => { setWallet(prev => ({ ...prev, connected: true, address: 'addr1...9z' })); addToast('Wallet Connected', 'success'); };
    
    const initAgents = (typeKey) => {
        const config = POLICY_TYPES[typeKey];
        setSimValue(config.condition === '>' ? config.threshold * 0.5 : config.threshold * 1.5);
        setAgents(config.agentRoles.map((role, i) => ({ id: `ag_${Date.now()}_${i}`, role, reputation: 90, currentVote: null, status: 'normal' })));
    };

    useEffect(() => { if ((view === 'RISK_LAB' || view === 'SIMULATOR') && agents.length === 0) initAgents(view === 'SIMULATOR' && activePolicyId ? myPolicies.find(p=>p.instanceId === activePolicyId).type : labPolicyType); }, [view, labPolicyType, activePolicyId]);

    return (
        <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-200 overflow-hidden relative">
            <GlobalStyles />
            <div className="bg-mesh" />
            <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
            <GlobalTicker events={globalEvents} />
            <div className="p-4 md:px-8 md:py-6 flex-1 overflow-y-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 gap-4 border-b border-slate-800/50">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20"><Database size={20} className="text-white" /></div><div><h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">HYPERION <span className="text-xs font-mono font-normal text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/20">V4.0</span></h1></div></div>
                    <div className="flex items-center gap-4"><div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 flex shadow-sm">{['RISK_LAB', 'MARKET', 'PORTFOLIO', 'STAKING', 'BRIDGE'].map(tab => <button key={tab} onClick={() => setView(tab)} className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all duration-300 ${view === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{tab.replace('_', ' ')}</button>)}</div>{!wallet.connected ? <button onClick={connectWallet} className="glass-button px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold text-white bg-indigo-600/80 hover:bg-indigo-500/80 shadow-lg shadow-indigo-500/20"><Wallet size={14} /> CONNECT WALLET</button> : <div className="flex items-center gap-4"><div className="relative group"><button onClick={() => setIsWalletOpen(!isWalletOpen)} className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 text-right hover:bg-slate-800 transition-colors flex items-center gap-3"><div><div className="text-[9px] text-slate-500 uppercase tracking-wider">Balance</div><div className="text-sm font-mono font-bold text-white">{wallet.balance.toLocaleString()} <span className="text-slate-500 text-xs">{currency}</span></div></div><ArrowRightLeft size={14} className="text-slate-500" /></button>{isWalletOpen && <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95"><div className="p-2 border-b border-slate-800"><button onClick={() => setCurrency('ADA')} className="w-full text-left px-2 py-1.5 rounded text-xs font-bold flex justify-between text-slate-300 hover:bg-slate-800">ADA {currency === 'ADA' && <Check size={12} />}</button><button onClick={() => setCurrency('USDM')} className="w-full text-left px-2 py-1.5 rounded text-xs font-bold flex justify-between text-slate-300 hover:bg-slate-800">USDM {currency === 'USDM' && <Check size={12} />}</button></div><div className="p-2"><button onClick={() => {setView('TRANSACTIONS'); setIsWalletOpen(false);}} className="w-full text-left px-2 py-1.5 rounded text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2"><Receipt size={12} /> Transactions</button><button onClick={() => {setView('SUPPORT'); setIsWalletOpen(false);}} className="w-full text-left px-2 py-1.5 rounded text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2"><MessageSquare size={12} /> Support</button><button onClick={() => {setView('BRIDGE'); setIsWalletOpen(false);}} className="w-full text-left px-2 py-1.5 rounded text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2"><ArrowUpRight size={12} /> Bridge Assets</button></div></div>}</div><LoyaltyBadge xp={wallet.xp} /></div>}</div>
                </header>
                {view === 'RISK_LAB' && <RiskLab labPolicyType={labPolicyType} setLabPolicyType={setLabPolicyType} simValue={simValue} setSimValue={setSimValue} consensus={consensus} chartData={chartData} addToast={addToast} activePolicyId={null} isSimulator={false} agents={agents} setAgents={setAgents} />}
                {view === 'SIMULATOR' && <RiskLab labPolicyType={labPolicyType} setLabPolicyType={setLabPolicyType} simValue={simValue} setSimValue={setSimValue} consensus={consensus} chartData={chartData} addToast={addToast} activePolicyId={activePolicyId} isSimulator={true} myPolicies={myPolicies} setView={setView} agents={agents} setAgents={setAgents} />}
                {view === 'MARKET' && <Marketplace wallet={wallet} setWallet={setWallet} setPolicies={setMyPolicies} addToast={addToast} />}
                {view === 'PORTFOLIO' && <WalletHub wallet={wallet} policies={myPolicies} />}
                {view === 'STAKING' && <StakingView />}
                {view === 'BRIDGE' && <BridgeAssets addLog={addLog} recordTransaction={recordTransaction} setWallet={setWallet} />}
                {view === 'TRANSACTIONS' && <TransactionView transactions={transactions} formatCurrency={formatCurrency} getPrice={getPrice} />}
                {view === 'SUPPORT' && <SupportChat />}
            </div>
            <StatusFooter />
        </div>
    );
}