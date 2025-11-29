'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { 
    Shield, Wind, Activity, Terminal, AlertTriangle, Wallet, Globe, 
    Plane, CloudRain, HeartPulse, Coins, ShoppingCart, PlayCircle, 
    TrendingUp, Clock, FileText, UploadCloud, Check, Landmark, 
    Bell, ChevronRight, Info, ShieldCheck, Lock, LockOpen, Zap, 
    Receipt, Download, MessageSquare, Briefcase, ArrowRightLeft, 
    ArrowUpRight, Send, AlertCircle, Menu, X, User, Power, Wifi, Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Constants
const VARIANCE_LIMIT = 15; 
const STORAGE_KEY = 'hyperion_v4_state';
const ADA_PRICE = 0.45; 

const POLICY_TYPES = {
    HURRICANE: { 
        id: 'hurricane', name: 'Hurricane Guard', category: 'NAT-CAT', unit: 'mph', threshold: 100, condition: '>', 
        icon: Wind, color: '#3b82f6', 
        severityTiers: [{ limit: 100, payout: 0 }, { limit: 110, payout: 0.5 }, { limit: 130, payout: 1.0 }], 
        sliderMax: 160, sliderLabel: ['CALM', 'GALE', 'STORM', 'CAT 5'], 
        requiredProof: 'Property Deed & Geo-Tag', 
        agentRoles: ['NOAA Scout', 'Sat Verifier', 'News Bot'],
        basePremium: 150,
        description: 'Automated parametric insurance for hurricane damage. AI agents monitor NOAA weather data, satellite imagery, and news feeds. When wind speed exceeds threshold at your location, instant payout is triggered. No claim forms, no adjusters, no delays.',
        coverage: '15,000 ADA',
        duration: '12 months',
        maxPayout: '15,000 ADA'
    },
    FLIGHT: { 
        id: 'flight', name: 'Flight Delay', category: 'TRAVEL', unit: 'min', threshold: 120, condition: '>', 
        icon: Plane, color: '#a855f7', 
        severityTiers: [{ limit: 120, payout: 0 }, { limit: 180, payout: 0.5 }, { limit: 240, payout: 1.0 }], 
        sliderMax: 240, sliderLabel: ['ON TIME', 'DELAYED', 'SEVERE', 'CANCEL'], 
        requiredProof: 'Boarding Pass Hash', 
        agentRoles: ['FlightAware', 'ATC Net', 'IATA Bot'],
        basePremium: 50,
        description: 'Get compensated instantly for flight delays. AI agents track real-time flight data from FlightAware, ATC networks, and IATA databases. Payout triggers automatically when your flight is delayed beyond threshold. Perfect for business travelers.',
        coverage: '5,000 ADA',
        duration: '1 trip',
        maxPayout: '5,000 ADA'
    },
    CROP: { 
        id: 'crop', name: 'Agri-Drought', category: 'AGRI', unit: 'mm', threshold: 30, condition: '<', 
        icon: CloudRain, color: '#10b981', 
        severityTiers: [{ limit: 30, payout: 0 }, { limit: 15, payout: 0.5 }, { limit: 5, payout: 1.0 }], 
        sliderMax: 100, sliderLabel: ['ARID', 'DRY', 'NORMAL', 'WET'], 
        requiredProof: 'Soil IoT Logs', 
        agentRoles: ['Soil Sens', 'Sat Image', 'Met Office'],
        basePremium: 200,
        description: 'Protect your crops against drought conditions. AI agents monitor soil sensors, satellite moisture data, and meteorological offices. When rainfall drops below threshold during growing season, automatic compensation ensures you can sustain operations.',
        coverage: '20,000 ADA',
        duration: '6 months',
        maxPayout: '20,000 ADA'
    },
};

// Helper Components
const ToastContainer = ({ toasts, removeToast }: any) => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((toast: any) => (
            <div key={toast.id} className={`pointer-events-auto transform transition-all duration-300 ease-in-out flex items-center gap-3 p-4 rounded-lg shadow-xl border backdrop-blur-md ${toast.type === 'success' ? 'bg-green-900/80 text-green-100 border-green-700/50' : toast.type === 'error' ? 'bg-red-900/80 text-red-100 border-red-700/50' : 'bg-slate-800/90 text-slate-200 border-slate-700/50'}`}>
                {toast.type === 'success' ? <Check size={18} /> : toast.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
                <div className="text-xs font-medium flex-1">{toast.message}</div>
                <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100"><X size={14} /></button>
            </div>
        ))}
    </div>
);

const AgentCard = ({ agent, policyType }: any) => {
    const config = POLICY_TYPES[policyType as keyof typeof POLICY_TYPES];
    const isReporting = agent.currentVote !== null;
    const isAlarm = agent.currentVote !== null && (config.condition === '>' ? agent.currentVote > config.threshold : agent.currentVote < config.threshold);

    return (
        <div className={`glass-panel p-3 rounded-lg relative overflow-hidden transition-all duration-300 border-slate-700 hover:border-cyan-500/30`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isReporting ? 'bg-green-400 shadow-[0_0_5px_#4ade80] animate-pulse' : 'bg-slate-600'}`}></div>
                    <span className="text-xs font-bold text-slate-300 truncate max-w-[100px]">{agent.role}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">ID:{agent.id.slice(-4)}</span>
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Reputation</div>
                    <div className="text-xs font-mono text-cyan-400">{agent.reputation}%</div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Data Feed</div>
                    <div className={`text-sm font-bold font-mono ${isAlarm ? 'text-red-400' : 'text-slate-200'}`}>
                        {agent.currentVote !== null ? `${agent.currentVote.toFixed(1)}` : '--'} <span className="text-[9px] text-slate-500">{config.unit}</span>
                    </div>
                </div>
            </div>
            <div className="mt-2 h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 bg-cyan-500`} style={{ width: `${isReporting ? 100 : 0}%` }}></div>
            </div>
        </div>
    );
};

export default function HyperionMain() {
    const [view, setView] = useState('POLICIES');
    const [wallet, setWallet] = useState({ connected: false, address: null as string | null, balance: 2500 });
    const [myPolicies, setMyPolicies] = useState<any[]>([]);
    const [toasts, setToasts] = useState<any[]>([]);
    const [labPolicyType, setLabPolicyType] = useState<keyof typeof POLICY_TYPES>('HURRICANE');
    const [simValue, setSimValue] = useState(45);
    const [chartData, setChartData] = useState<any[]>([]);
    const [consensus, setConsensus] = useState({ val: 0, var: 0 });
    const [agents, setAgents] = useState<any[]>([]);
    const [time, setTime] = useState<Date | null>(null);
    const [systemStatus, setSystemStatus] = useState<'online' | 'warning' | 'offline'>('online');
    const [selectedPolicy, setSelectedPolicy] = useState<keyof typeof POLICY_TYPES | null>(null);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.wallet && parsed.wallet.connected) {
                    setWallet(parsed.wallet);
                } else {
                    // Show wallet modal if not connected
                    setIsWalletModalOpen(true);
                }
                if (parsed.myPolicies) setMyPolicies(parsed.myPolicies);
            } catch (e) {
                setIsWalletModalOpen(true);
            }
        } else {
            // No saved data, show wallet modal on first visit
            setIsWalletModalOpen(true);
        }
    }, []);

    useEffect(() => {
        if (wallet.connected) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ wallet, myPolicies }));
        }
    }, [wallet, myPolicies]);

    const addToast = (message: string, type: 'success' | 'error' | 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const connectWallet = async (walletName: string) => {
        try {
            // Simulate wallet connection
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockAddresses = {
                'nami': 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
                'eternl': 'addr1q8s5q9z8j5n6k8r9t7y6h5g4f3d2s1a0z9x8c7v6b5n4m3k2j1h0g9f8e7d6c5b4a3s2d1f0',
                'flint': 'addr1qy9z8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3h2g1f0e9d8c7b6a5s4d3f2g1h0'
            };

            const address = mockAddresses[walletName as keyof typeof mockAddresses] || mockAddresses.nami;
            const displayAddress = `${address.slice(0, 9)}...${address.slice(-4)}`;
            
            setWallet(prev => ({ 
                ...prev, 
                connected: true, 
                address: displayAddress,
                balance: 2500 + Math.floor(Math.random() * 5000)
            }));
            
            setIsWalletModalOpen(false);
            addToast(`${walletName.charAt(0).toUpperCase() + walletName.slice(1)} Wallet Connected`, 'success');
        } catch (error) {
            addToast('Failed to connect wallet', 'error');
        }
    };

    const initAgents = (typeKey: keyof typeof POLICY_TYPES) => {
        const config = POLICY_TYPES[typeKey];
        setSimValue(config.condition === '>' ? config.threshold * 0.5 : config.threshold * 1.5);
        setAgents(config.agentRoles.map((role, i) => ({
            id: `ag_${Date.now()}_${i}`,
            role,
            reputation: 90 + Math.floor(Math.random() * 10),
            currentVote: null,
            status: 'normal'
        })));
    };

    useEffect(() => {
        if (view === 'SIMULATOR' && agents.length === 0) {
            initAgents(labPolicyType);
        }
    }, [view, labPolicyType, agents.length]);

    const ActiveConfig = POLICY_TYPES[labPolicyType];
    const riskLevel = simValue / ActiveConfig.sliderMax;
    const riskColor = riskLevel > 0.8 ? 'red' : riskLevel > 0.5 ? 'amber' : 'cyan';

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            
            <ToastContainer toasts={toasts} removeToast={(id: number) => setToasts(prev => prev.filter(t => t.id !== id))} />
            
            {/* Header */}
            <div className="flex-1 flex flex-col relative z-10">
                <header className="h-20 border-b border-cyan-500/20 bg-slate-950/30 backdrop-blur-xl">
                    <div className="h-full px-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    PROJECT HYPERION
                                </h1>
                                <p className="text-xs text-slate-400 font-mono">
                                    AI-Powered Parametric Insurance • {time ? time.toLocaleTimeString() : '--:--:--'} UTC
                                </p>
                            </div>
                            <div className="h-8 w-px bg-cyan-500/20" />
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    'w-2 h-2 rounded-full animate-pulse',
                                    systemStatus === 'online' && 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                                )} />
                                <span className="text-sm font-medium text-emerald-400">AI SWARM ONLINE</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="h-10 px-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 flex items-center gap-2">
                                <Wifi className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm text-slate-300 font-medium">Hydra L2</span>
                            </button>
                            {!wallet.connected ? (
                                <button onClick={() => setIsWalletModalOpen(true)} className="h-10 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium transition-all flex items-center gap-2">
                                    <Wallet size={16} /> Connect Wallet
                                </button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2">
                                        <div className="text-[9px] text-slate-500 uppercase">Address</div>
                                        <div className="text-xs font-mono text-white">{wallet.address}</div>
                                    </div>
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2">
                                        <div className="text-[9px] text-slate-500 uppercase">Balance</div>
                                        <div className="text-sm font-mono font-bold text-white">{wallet.balance.toLocaleString()} <span className="text-slate-500">ADA</span></div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setWallet({ connected: false, address: null, balance: 2500 });
                                            localStorage.removeItem(STORAGE_KEY);
                                            addToast('Wallet Disconnected', 'info');
                                            setIsWalletModalOpen(true);
                                        }}
                                        className="h-10 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium transition-all flex items-center gap-2"
                                    >
                                        <Power size={16} />
                                        Disconnect
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Navigation */}
                <div className="p-6 border-b border-slate-800/50">
                    <div className="flex gap-2">
                        {['POLICIES', 'MARKETPLACE', 'SIMULATOR', 'TREASURY'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setView(tab)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${view === tab ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6">
                    {view === 'POLICIES' && (
                        <div className="space-y-6 animate-enter">
                            <div>
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                                    <span className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
                                    My Policies
                                </h2>
                                <p className="text-slate-400 ml-7">Your active parametric insurance coverage</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Active Policies', value: myPolicies.length, unit: '' },
                                    { label: 'Total Coverage', value: myPolicies.reduce((acc, p) => acc + (p.coverage || 0), 0).toLocaleString(), unit: ' ADA' },
                                    { label: 'AI Agents', value: 8, unit: ' Active' },
                                    { label: 'Avg Payout', value: 12, unit: ' sec' },
                                ].map((metric, i) => (
                                    <div key={i} className="p-5 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                                        <div className="text-sm text-slate-400 mb-1">{metric.label}</div>
                                        <div className="text-3xl font-bold text-white">{metric.value}<span className="text-xl text-slate-400">{metric.unit}</span></div>
                                    </div>
                                ))}
                            </div>

                            {myPolicies.length === 0 ? (
                                <div className="glass-panel p-12 rounded-2xl text-center">
                                    <Shield size={48} className="mx-auto mb-4 text-slate-600" />
                                    <h3 className="text-xl font-bold text-white mb-2">No Active Policies</h3>
                                    <p className="text-slate-400 mb-6">Purchase parametric insurance coverage to get started</p>
                                    <button onClick={() => setView('MARKETPLACE')} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all">
                                        Browse Marketplace
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myPolicies.map(policy => (
                                        <div key={policy.instanceId} className="glass-panel p-6 rounded-xl hover:border-cyan-500/40 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-slate-900/50 rounded-lg">
                                                    {React.createElement(POLICY_TYPES[policy.type as keyof typeof POLICY_TYPES].icon, { size: 24, className: 'text-cyan-400' })}
                                                </div>
                                                <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">ACTIVE</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1">{POLICY_TYPES[policy.type as keyof typeof POLICY_TYPES].name}</h3>
                                            <p className="text-xs text-slate-400">ID: {policy.instanceId}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'MARKETPLACE' && (
                        <div className="space-y-6 animate-enter">
                            <div>
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                                    <span className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
                                    Insurance Marketplace
                                </h2>
                                <p className="text-slate-400 ml-7">Purchase parametric insurance coverage</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {Object.entries(POLICY_TYPES).map(([key, p]) => (
                                    <div key={key} className="glass-panel p-6 rounded-2xl hover:border-cyan-500/40 transition-all relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700 group-hover:border-cyan-500/50 transition-colors">
                                                {React.createElement(p.icon, { size: 24, className: 'text-white' })}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-slate-500 uppercase">Premium</div>
                                                <div className="text-xl font-mono font-bold text-white">{p.basePremium} ₳</div>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">{p.name}</h3>
                                        <p className="text-xs text-slate-400 mb-2">{p.category} • Trigger: {p.condition} {p.threshold} {p.unit}</p>
                                        <p className="text-xs text-slate-500 mb-6 line-clamp-2">{p.description.substring(0, 100)}...</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedPolicy(key as keyof typeof POLICY_TYPES)}
                                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700"
                                            >
                                                VIEW DETAILS
                                            </button>
                                            <button
                                                onClick={() => setSelectedPolicy(key as keyof typeof POLICY_TYPES)}
                                                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all"
                                            >
                                                BUY NOW
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'SIMULATOR' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-enter">
                            <div className="lg:col-span-4 space-y-6">
                                <div className={`glass-panel p-6 rounded-2xl border-t-4 border-${riskColor}-500`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="font-bold text-white flex items-center gap-2">
                                            <Zap size={16} className="text-cyan-500" /> Risk Simulator
                                        </h2>
                                    </div>
                                    
                                    <div className="mb-8">
                                        <select
                                            value={labPolicyType}
                                            onChange={(e) => {
                                                setLabPolicyType(e.target.value as keyof typeof POLICY_TYPES);
                                                initAgents(e.target.value as keyof typeof POLICY_TYPES);
                                            }}
                                            className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl p-3 outline-none"
                                        >
                                            {Object.entries(POLICY_TYPES).map(([k, v]) => (
                                                <option key={k} value={k}>{v.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex justify-between items-end mb-3">
                                            <span className="text-xs font-mono text-slate-400">INTENSITY</span>
                                            <span className="text-3xl font-mono font-bold text-cyan-400">
                                                {simValue.toFixed(1)} <span className="text-sm text-slate-500">{ActiveConfig.unit}</span>
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={ActiveConfig.sliderMax}
                                            value={simValue}
                                            onChange={(e) => setSimValue(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
                                        />
                                        <div className="flex justify-between mt-2">
                                            {ActiveConfig.sliderLabel.map((l, i) => (
                                                <span key={i} className="text-[9px] font-bold text-slate-600">{l}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Trigger Tiers</div>
                                        {ActiveConfig.severityTiers.map((tier, i) => {
                                            const isActive = ActiveConfig.condition === '>' ? simValue >= tier.limit : simValue <= tier.limit;
                                            return (
                                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isActive ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900/30 border-slate-800'}`}>
                                                    <div className="flex items-center gap-3">
                                                        {isActive ? <LockOpen size={14} className="text-cyan-400" /> : <Lock size={14} className="text-slate-600" />}
                                                        <span className={`text-xs font-mono ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                                            {ActiveConfig.condition} {tier.limit} {ActiveConfig.unit}
                                                        </span>
                                                    </div>
                                                    <span className={`text-[10px] font-bold ${isActive ? 'text-cyan-300' : 'text-slate-700'}`}>
                                                        {(tier.payout * 100)}% PAYOUT
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-8 space-y-6">
                                <div className="glass-panel p-6 rounded-2xl">
                                    <h3 className="text-lg font-bold text-white mb-4">AI Agent Swarm</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        {agents.map(agent => (
                                            <AgentCard key={agent.id} agent={agent} policyType={labPolicyType} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'TREASURY' && (
                        <div className="space-y-6 animate-enter">
                            <div>
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                                    <span className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full" />
                                    Treasury Status
                                </h2>
                                <p className="text-slate-400 ml-7">Smart contract treasury and liquidity management</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: Wallet, label: 'Total Value Locked', value: '1.2M', suffix: 'ADA' },
                                    { icon: Lock, label: 'Policy Reserves', value: '850K', suffix: 'ADA' },
                                    { icon: TrendingUp, label: 'Available Liquidity', value: '350K', suffix: 'ADA' },
                                    { icon: Database, label: 'Active Policies', value: '127', suffix: '' },
                                ].map((item, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-cyan-500/30">
                                                {React.createElement(item.icon, { size: 32, className: 'text-cyan-400' })}
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

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30">
                                <h3 className="text-lg font-bold text-white mb-4">Treasury Health</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Collateralization Ratio</span>
                                        <span className="text-lg font-bold text-emerald-400">142%</span>
                                    </div>
                                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                        <div className="h-full w-[70%] bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xs text-slate-500">Minimum Required: 120%</span>
                                        <span className="text-xs text-emerald-400">✓ Healthy</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <div className="h-8 bg-slate-950 border-t border-slate-800 flex items-center px-6 justify-between text-[10px] font-mono text-slate-500">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            MAINNET: EPOCH 482
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <span>HYPERION ORACLE V4.0.2</span>
                        <span className="text-cyan-400">CONNECTED</span>
                    </div>
                </div>
            </div>

            {/* Wallet Connection Modal */}
            {isWalletModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsWalletModalOpen(false)}>
                    <div className="glass-panel p-8 rounded-2xl max-w-md w-full border-2 border-cyan-500/30 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
                            <button onClick={() => setIsWalletModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-slate-400 mb-6 text-sm">Choose your Cardano wallet to connect</p>
                        <div className="space-y-3">
                            {['Nami', 'Eternl', 'Flint'].map(walletName => (
                                <button
                                    key={walletName}
                                    onClick={() => connectWallet(walletName.toLowerCase())}
                                    className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                            <Wallet size={20} className="text-white" />
                                        </div>
                                        <span className="font-bold text-white">{walletName}</span>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-6 text-center">By connecting, you agree to the Terms of Service</p>
                    </div>
                </div>
            )}

            {/* Policy Detail Modal */}
            {selectedPolicy && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPolicy(null)}>
                    <div className="glass-panel p-8 rounded-2xl max-w-2xl w-full border-2 border-cyan-500/30 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                    {React.createElement(POLICY_TYPES[selectedPolicy].icon, { size: 32, className: 'text-cyan-400' })}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{POLICY_TYPES[selectedPolicy].name}</h2>
                                    <p className="text-sm text-slate-400">{POLICY_TYPES[selectedPolicy].category}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPolicy(null)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Description</h3>
                                <p className="text-slate-300 leading-relaxed">{POLICY_TYPES[selectedPolicy].description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase mb-1">Premium</div>
                                    <div className="text-2xl font-mono font-bold text-white">{POLICY_TYPES[selectedPolicy].basePremium} <span className="text-sm text-slate-500">ADA</span></div>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase mb-1">Max Coverage</div>
                                    <div className="text-2xl font-mono font-bold text-cyan-400">{POLICY_TYPES[selectedPolicy].coverage}</div>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase mb-1">Duration</div>
                                    <div className="text-lg font-bold text-white">{POLICY_TYPES[selectedPolicy].duration}</div>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase mb-1">Max Payout</div>
                                    <div className="text-lg font-bold text-emerald-400">{POLICY_TYPES[selectedPolicy].maxPayout}</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Trigger Conditions</h3>
                                <div className="space-y-2">
                                    {POLICY_TYPES[selectedPolicy].severityTiers.map((tier: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                            <span className="text-sm text-slate-300 font-mono">
                                                {POLICY_TYPES[selectedPolicy].condition} {tier.limit} {POLICY_TYPES[selectedPolicy].unit}
                                            </span>
                                            <span className="text-sm font-bold text-cyan-400">{(tier.payout * 100)}% Payout</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">AI Agents</h3>
                                <div className="flex flex-wrap gap-2">
                                    {POLICY_TYPES[selectedPolicy].agentRoles.map((role: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setSelectedPolicy(null)}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!wallet.connected) {
                                            setSelectedPolicy(null);
                                            setIsWalletModalOpen(true);
                                            addToast('Please connect wallet first', 'error');
                                            return;
                                        }
                                        if (wallet.balance < POLICY_TYPES[selectedPolicy].basePremium) {
                                            addToast('Insufficient Funds', 'error');
                                            return;
                                        }
                                        setWallet(prev => ({ ...prev, balance: prev.balance - POLICY_TYPES[selectedPolicy].basePremium }));
                                        setMyPolicies(prev => [...prev, {
                                            instanceId: Date.now(),
                                            type: selectedPolicy,
                                            status: 'Active',
                                            coverage: POLICY_TYPES[selectedPolicy].basePremium * 100,
                                            purchaseDate: new Date()
                                        }]);
                                        addToast(`Purchased ${POLICY_TYPES[selectedPolicy].name}`, 'success');
                                        setSelectedPolicy(null);
                                        setView('POLICIES');
                                    }}
                                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20"
                                >
                                    Purchase Coverage
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
