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
import { WalletConnect } from './WalletConnect';
import { WalletDebug } from './WalletDebug';
import { LoginPage } from './LoginPage';
import { NFTGallery } from './NFTGallery';
import { usePhase5Wallet } from '@/context/WalletProvider';

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
    EARTHQUAKE: {
        id: 'earthquake', name: 'Earthquake Shield', category: 'NAT-CAT', unit: 'magnitude', threshold: 5.5, condition: '>',
        icon: Activity, color: '#ef4444',
        severityTiers: [{ limit: 5.5, payout: 0 }, { limit: 6.5, payout: 0.5 }, { limit: 7.5, payout: 1.0 }],
        sliderMax: 9, sliderLabel: ['MINOR', 'MODERATE', 'STRONG', 'MAJOR'],
        requiredProof: 'Property Ownership & Location Proof',
        agentRoles: ['USGS Monitor', 'Seismic Net', 'Geo Scanner'],
        basePremium: 180,
        description: 'Instant coverage for earthquake damage. AI agents monitor USGS seismic data and geological networks. Automatic payout when earthquake magnitude exceeds threshold in your region.',
        coverage: '18,000 ADA',
        duration: '12 months',
        maxPayout: '18,000 ADA'
    },
    HEALTH: {
        id: 'health', name: 'Health Emergency', category: 'HEALTH', unit: 'days', threshold: 3, condition: '>',
        icon: HeartPulse, color: '#ec4899',
        severityTiers: [{ limit: 3, payout: 0 }, { limit: 7, payout: 0.5 }, { limit: 14, payout: 1.0 }],
        sliderMax: 30, sliderLabel: ['MINOR', 'MODERATE', 'SEVERE', 'CRITICAL'],
        requiredProof: 'Medical Records & ID Verification',
        agentRoles: ['Med Record AI', 'Hospital API', 'Insurance Bot'],
        basePremium: 120,
        description: 'Emergency hospitalization coverage. AI agents verify hospital admission records. Instant payout for extended hospital stays beyond threshold days.',
        coverage: '10,000 ADA',
        duration: '12 months',
        maxPayout: '10,000 ADA'
    },
    CYBER: {
        id: 'cyber', name: 'Cyber Attack', category: 'BUSINESS', unit: 'severity', threshold: 7, condition: '>',
        icon: ShieldCheck, color: '#8b5cf6',
        severityTiers: [{ limit: 7, payout: 0 }, { limit: 8.5, payout: 0.5 }, { limit: 9.5, payout: 1.0 }],
        sliderMax: 10, sliderLabel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        requiredProof: 'Business Registration & Security Audit',
        agentRoles: ['Threat Intel', 'SIEM Monitor', 'Dark Web Bot'],
        basePremium: 250,
        description: 'Protection against cyber attacks and data breaches. AI agents monitor threat intelligence feeds and security systems. Instant compensation when security breach severity exceeds threshold.',
        coverage: '25,000 ADA',
        duration: '12 months',
        maxPayout: '25,000 ADA'
    },
    FLOOD: {
        id: 'flood', name: 'Flood Protection', category: 'NAT-CAT', unit: 'cm', threshold: 50, condition: '>',
        icon: CloudRain, color: '#0ea5e9',
        severityTiers: [{ limit: 50, payout: 0 }, { limit: 100, payout: 0.5 }, { limit: 200, payout: 1.0 }],
        sliderMax: 300, sliderLabel: ['NORMAL', 'WARNING', 'ALERT', 'CRITICAL'],
        requiredProof: 'Property Deed & Elevation Certificate',
        agentRoles: ['River Monitor', 'Weather Sat', 'Hydro Sensor'],
        basePremium: 175,
        description: 'Comprehensive flood damage coverage. AI agents track river levels, rainfall data, and flood forecasts. Automatic payout when water levels exceed threshold.',
        coverage: '17,500 ADA',
        duration: '12 months',
        maxPayout: '17,500 ADA'
    },
    LIVESTOCK: {
        id: 'livestock', name: 'Livestock Loss', category: 'AGRI', unit: 'temp', threshold: 40, condition: '>',
        icon: Activity, color: '#f59e0b',
        severityTiers: [{ limit: 40, payout: 0 }, { limit: 43, payout: 0.5 }, { limit: 45, payout: 1.0 }],
        sliderMax: 50, sliderLabel: ['NORMAL', 'WARM', 'HOT', 'EXTREME'],
        requiredProof: 'Farm License & Livestock Registry',
        agentRoles: ['Weather API', 'Temp Sensor', 'Vet Network'],
        basePremium: 160,
        description: 'Protection for livestock during extreme heat. AI agents monitor temperature sensors and weather conditions. Automatic payout when temperatures exceed safe thresholds.',
        coverage: '16,000 ADA',
        duration: '6 months',
        maxPayout: '16,000 ADA'
    },
};

// Helper Components
const ToastContainer = ({ toasts, removeToast }: any) => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((toast: any) => (
            <div key={toast.id} className={`pointer-events-auto transform transition-all duration-300 ease-in-out flex items-center gap-3 p-4 rounded-lg shadow-xl border ${toast.type === 'success' ? 'bg-green-900 text-green-100 border-green-700' : toast.type === 'error' ? 'bg-red-900 text-red-100 border-red-700' : 'bg-slate-800 text-slate-200 border-slate-700'}`}>
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
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginMode, setLoginMode] = useState<'demo' | 'wallet'>('demo');
    const [view, setView] = useState('POLICIES');
    const [wallet, setWallet] = useState({ connected: false, address: null as string | null, balance: 2500, name: '' });
    
    // Get real wallet state from Phase5 provider
    const phase5Wallet = usePhase5Wallet();
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
    const [uploadedDocs, setUploadedDocs] = useState<any>({});
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [walletName, setWalletName] = useState('');
    const [selectedPolicyForClaim, setSelectedPolicyForClaim] = useState<any>(null);
    const [claimReport, setClaimReport] = useState<File[]>([]);
    const [agentMonitoring, setAgentMonitoring] = useState<any>({});
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [username, setUsername] = useState('Anonymous');
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [tempUsername, setTempUsername] = useState('');

    // Handle login
    const handleLogin = (mode: 'demo' | 'wallet', address?: string) => {
        setLoginMode(mode);
        setIsLoggedIn(true);
        
        if (mode === 'wallet' && address) {
            setWallet({ connected: true, address, balance: 0, name: 'Cardano Wallet' });
            addToast('Wallet connected successfully!', 'success');
        } else {
            setWallet({ connected: true, address: 'demo_addr1_hyperion', balance: 2500, name: 'Demo Account' });
            addToast('Demo mode activated!', 'success');
        }

        // Save login state
        localStorage.setItem('hyperion_logged_in', 'true');
        localStorage.setItem('hyperion_login_mode', mode);
        
        // Load username from localStorage
        const savedUsername = localStorage.getItem('hyperion_username');
        if (savedUsername) {
            setUsername(savedUsername);
        }
    };
    
    // Save username
    const saveUsername = () => {
        if (tempUsername.trim()) {
            setUsername(tempUsername.trim());
            localStorage.setItem('hyperion_username', tempUsername.trim());
            addToast('Username updated!', 'success');
        }
        setIsEditingUsername(false);
        setTempUsername('');
    };
    
    // Get user initials for avatar
    const getUserInitials = () => {
        return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Check for existing session
    useEffect(() => {
        const loggedIn = localStorage.getItem('hyperion_logged_in');
        const mode = localStorage.getItem('hyperion_login_mode') as 'demo' | 'wallet';
        const savedUsername = localStorage.getItem('hyperion_username');
        
        if (savedUsername) {
            setUsername(savedUsername);
        }
        
        if (loggedIn === 'true' && mode) {
            setLoginMode(mode);
            setIsLoggedIn(true);
            
            if (mode === 'demo') {
                setWallet({ connected: true, address: 'demo_addr1_hyperion', balance: 2500, name: 'Demo Account' });
            }
        }
    }, []);

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

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showProfileMenu && !target.closest('.profile-dropdown')) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfileMenu]);

    const addToast = (message: string, type: 'success' | 'error' | 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    // AI-based claim validation function
    const validateClaimReport = (policy: any, reportFiles: File[]) => {
        const policyConfig = POLICY_TYPES[policy.type as keyof typeof POLICY_TYPES];
        const reasons = [];
        
        // Check if report is uploaded
        if (reportFiles.length === 0) {
            reasons.push('No incident report uploaded');
        }
        
        // Simulate AI analysis of the report
        const agentData = agentMonitoring[policy.type] || [];
        const avgValue = agentData.reduce((acc: number, a: any) => acc + a.currentValue, 0) / agentData.length;
        
        // Check if conditions match policy trigger
        if (policyConfig.condition === '>') {
            if (avgValue <= policyConfig.threshold) {
                reasons.push(`Measured value (${avgValue.toFixed(1)} ${policyConfig.unit}) below threshold (${policyConfig.threshold} ${policyConfig.unit})`);
            }
        } else {
            if (avgValue >= policyConfig.threshold) {
                reasons.push(`Measured value (${avgValue.toFixed(1)} ${policyConfig.unit}) above threshold (${policyConfig.threshold} ${policyConfig.unit})`);
            }
        }
        
        // Check agent consensus
        const variance = Math.max(...agentData.map((a: any) => a.currentValue)) - Math.min(...agentData.map((a: any) => a.currentValue));
        if (variance > VARIANCE_LIMIT) {
            reasons.push(`Agent consensus variance too high (${variance.toFixed(1)} > ${VARIANCE_LIMIT})`);
        }
        
        // Random additional checks
        if (Math.random() > 0.85) {
            reasons.push('Incident location not matching policy coverage area');
        }
        if (Math.random() > 0.9) {
            reasons.push('Timing of incident outside policy coverage period');
        }
        
        // Calculate payout based on severity
        let payoutPercentage = 0;
        if (reasons.length === 0) {
            const tier = policyConfig.severityTiers.reduce((prev: any, curr: any) => {
                if (policyConfig.condition === '>') {
                    return avgValue >= curr.limit ? curr : prev;
                } else {
                    return avgValue <= curr.limit ? curr : prev;
                }
            });
            payoutPercentage = tier.payout;
        }
        
        return {
            approved: reasons.length === 0,
            reasons,
            status: reasons.length === 0 ? 'APPROVED' : 'REJECTED',
            payoutPercentage,
            measuredValue: avgValue,
            timestamp: new Date().toISOString()
        };
    };

    // AI-based policy validation function
    const validatePolicyApplication = (policyType: keyof typeof POLICY_TYPES, docs: any) => {
        // Simulate AI validation
        const policy = POLICY_TYPES[policyType];
        const reasons = [];
        
        // Check document upload
        if (!docs[policyType] || docs[policyType].length === 0) {
            reasons.push('Missing required proof documents');
        }
        
        // Check wallet balance
        if (wallet.balance < policy.basePremium) {
            reasons.push('Insufficient wallet balance');
        }
        
        // Check terms acceptance
        if (!termsAccepted) {
            reasons.push('Terms and conditions not accepted');
        }
        
        // Simulate AI risk assessment
        const riskScore = Math.random();
        if (riskScore > 0.85) {
            reasons.push('High risk profile detected by AI analysis');
        }
        
        // Random validation checks
        if (Math.random() > 0.9) {
            reasons.push('Additional verification required for location');
        }
        
        return {
            approved: reasons.length === 0,
            reasons: reasons,
            status: reasons.length === 0 ? 'APPROVED' : 'REJECTED',
            timestamp: new Date().toISOString()
        };
    };

    const connectWallet = async (walletProvider: string, userName: string) => {
        try {
            if (!userName.trim()) {
                addToast('Please enter your name', 'error');
                return;
            }
            
            // Use real Phase5 wallet connection
            await phase5Wallet.connectWallet(walletProvider.toLowerCase() as any);
            
            // Get balance from real wallet
            const balance = await phase5Wallet.getBalance();
            const adaBalance = Number(balance) / 1_000_000;
            
            setWallet({ 
                connected: true, 
                address: phase5Wallet.walletAddress || '',
                balance: adaBalance,
                name: userName
            });
            
            setIsWalletModalOpen(false);
            setWalletName('');
            addToast(`Welcome ${userName}! Wallet Connected`, 'success');
        } catch (error) {
            console.error('Wallet connection error:', error);
            addToast('Failed to connect wallet. Please try again.', 'error');
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

    // Auto-generate AI agent monitoring for all policy types
    useEffect(() => {
        const interval = setInterval(() => {
            const monitoring: any = {};
            Object.keys(POLICY_TYPES).forEach(key => {
                const policy = POLICY_TYPES[key as keyof typeof POLICY_TYPES];
                monitoring[key] = policy.agentRoles.map((role, i) => ({
                    id: `agent_${key}_${i}`,
                    role,
                    reputation: 88 + Math.floor(Math.random() * 12),
                    currentValue: policy.condition === '>' 
                        ? policy.threshold * (0.7 + Math.random() * 0.5)
                        : policy.threshold * (0.5 + Math.random() * 1.0),
                    status: Math.random() > 0.9 ? 'alert' : 'normal',
                    lastUpdate: new Date().toISOString()
                }));
            });
            setAgentMonitoring(monitoring);
        }, 5000); // Update every 5 seconds
        
        return () => clearInterval(interval);
    }, []);

    const ActiveConfig = POLICY_TYPES[labPolicyType];
    const riskLevel = simValue / ActiveConfig.sliderMax;
    const riskColor = riskLevel > 0.8 ? 'red' : riskLevel > 0.5 ? 'amber' : 'cyan';

    // Show login page if not logged in
    if (!isLoggedIn) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute inset-0 bg-[url('/grid.svg')]" style={{opacity: 0.2}} />
            
            <ToastContainer toasts={toasts} removeToast={(id: number) => setToasts(prev => prev.filter(t => t.id !== id))} />
            
            {/* Wallet Debug Panel */}
            <WalletDebug />
            
            {/* Header */}
            <div className="flex-1 flex flex-col relative z-10">
                <header className="h-20 border-b border-cyan-500 bg-slate-950">
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
                            {/* Mode Badge */}
                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                loginMode === 'demo' 
                                    ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400' 
                                    : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                            }`}>
                                {loginMode === 'demo' ? '🎮 DEMO MODE' : '🔐 LIVE WALLET'}
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
                            {/* Phase 5 Wallet Integration */}
                            <WalletConnect />
                            
                            {/* Original wallet functionality (kept for backward compatibility) */}
                            {!wallet.connected ? (
                                <button 
                                    onClick={() => setIsWalletModalOpen(true)} 
                                    className="h-10 px-6 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-slate-400 font-medium transition-all flex items-center gap-2 border border-slate-700"
                                >
                                    <Wallet size={16} /> 
                                    Demo Mode
                                </button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg">
                                        <Coins size={16} className="text-cyan-400" />
                                        <div>
                                            <div className="text-[9px] text-slate-500 uppercase">Balance</div>
                                            <div className="text-sm font-mono font-bold text-white">{wallet.balance.toLocaleString()} <span className="text-slate-500">ADA</span></div>
                                        </div>
                                    </div>
                                    
                                    {/* Profile Dropdown */}
                                    <div className="relative profile-dropdown">
                                        <button
                                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                                            className="h-10 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 transition-all flex items-center gap-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
                                                    {getUserInitials()}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs font-bold text-white">{username}</div>
                                                    <div className="text-[9px] text-slate-500 font-mono">{wallet.address?.slice(0, 12)}...</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={`text-slate-600 transition-transform ${showProfileMenu ? 'rotate-90' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showProfileMenu && (
                                            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                                <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xl">
                                                            {getUserInitials()}
                                                        </div>
                                                        <div className="flex-1">
                                                            {!isEditingUsername ? (
                                                                <>
                                                                    <div className="text-sm font-bold text-white">{username}</div>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setIsEditingUsername(true);
                                                                            setTempUsername(username);
                                                                        }}
                                                                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                                                    >
                                                                        <User size={10} /> Edit Username
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <div className="flex flex-col gap-1">
                                                                    <input
                                                                        type="text"
                                                                        value={tempUsername}
                                                                        onChange={(e) => setTempUsername(e.target.value)}
                                                                        onKeyPress={(e) => e.key === 'Enter' && saveUsername()}
                                                                        className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-500"
                                                                        autoFocus
                                                                        placeholder="Enter username"
                                                                    />
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            onClick={saveUsername}
                                                                            className="px-2 py-0.5 text-xs bg-cyan-500 hover:bg-cyan-600 text-white rounded"
                                                                        >
                                                                            Save
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setIsEditingUsername(false);
                                                                                setTempUsername('');
                                                                            }}
                                                                            className="px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-slate-400 mt-1">Policy Holder • {loginMode === 'demo' ? 'Demo' : 'Live'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg">
                                                        <Wallet size={14} className="text-cyan-400" />
                                                        <div className="text-xs font-mono text-slate-300 flex-1 truncate">{wallet.address}</div>
                                                    </div>
                                                </div>

                                                <div className="p-2">
                                                    <div className="px-3 py-2 text-xs text-slate-500 uppercase font-bold">Account</div>
                                                    <button className="w-full px-3 py-2 text-sm text-left text-slate-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-3">
                                                        <Coins size={16} className="text-cyan-400" />
                                                        <div className="flex-1">
                                                            <div className="font-medium">Balance</div>
                                                            <div className="text-xs text-slate-500">{wallet.balance.toLocaleString()} ADA</div>
                                                        </div>
                                                    </button>
                                                    <button className="w-full px-3 py-2 text-sm text-left text-slate-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-3">
                                                        <Shield size={16} className="text-blue-400" />
                                                        <div>
                                                            <div className="font-medium">My Policies</div>
                                                            <div className="text-xs text-slate-500">{myPolicies.length} Active</div>
                                                        </div>
                                                    </button>
                                                </div>

                                                <div className="p-2 border-t border-slate-800">
                                                    <button
                                                        onClick={() => {
                                                            // Logout and return to login page
                                                            setIsLoggedIn(false);
                                                            setWallet({ connected: false, address: null, balance: 2500, name: '' });
                                                            localStorage.removeItem('hyperion_logged_in');
                                                            localStorage.removeItem('hyperion_login_mode');
                                                            localStorage.removeItem(STORAGE_KEY);
                                                            setShowProfileMenu(false);
                                                            addToast('Logged out successfully', 'info');
                                                        }}
                                                        className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-red-900/50 rounded-lg transition-colors flex items-center gap-3"
                                                    >
                                                        <Power size={16} />
                                                        <span className="font-medium">Logout</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Navigation */}
                <div className="p-6 border-b border-slate-800/50">
                    <div className="flex gap-2">
                        {['POLICIES', 'MARKETPLACE', 'SIMULATOR', 'TREASURY', 'NFTs'].map(tab => (
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
                                    <div key={i} className="p-5 rounded-xl bg-slate-900 border border-cyan-500 hover:border-cyan-400 transition-all">
                                        <div className="text-sm text-slate-400 mb-1">{metric.label}</div>
                                        <div className="text-3xl font-bold text-white">{metric.value}<span className="text-xl text-slate-400">{metric.unit}</span></div>
                                    </div>
                                ))}
                            </div>

                            {myPolicies.length === 0 ? (
                                <div className="glass-panel p-12 rounded-2xl text-center">
                                    <Shield size={48} className="mx-auto mb-4 text-slate-600" />
                                    <h3 className="text-xl font-bold text-white mb-2">No Policies Yet</h3>
                                    <p className="text-slate-400 mb-6">Purchase parametric insurance coverage to get started</p>
                                    <button onClick={() => setView('MARKETPLACE')} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all">
                                        Browse Marketplace
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myPolicies.map(policy => {
                                        const policyConfig = POLICY_TYPES[policy.type as keyof typeof POLICY_TYPES];
                                        const isRejected = policy.status === 'REJECTED';
                                        
                                        return (
                                            <div key={policy.instanceId} className={`glass-panel p-6 rounded-xl hover:border-cyan-500/40 transition-all ${isRejected ? 'border-red-500/30' : ''}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-3 bg-slate-900 rounded-lg">
                                                        {React.createElement(policyConfig.icon, { size: 24, className: isRejected ? 'text-red-400' : 'text-cyan-400' })}
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                                        isRejected 
                                                            ? 'bg-red-900 text-red-400 border-red-500' 
                                                            : 'bg-green-900 text-green-400 border-green-500'
                                                    }`}>
                                                        {policy.status}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-white mb-1">{policyConfig.name}</h3>
                                                <p className="text-xs text-slate-400 mb-3">
                                                    Applicant: {policy.applicantName || 'Unknown'}<br />
                                                    ID: {policy.instanceId}<br />
                                                    Date: {new Date(policy.purchaseDate).toLocaleDateString()}
                                                </p>
                                                
                                                {isRejected ? (
                                                    <div className="mt-4 p-3 bg-red-900 border border-red-500 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <AlertCircle size={16} className="text-red-400" />
                                                            <span className="text-sm font-bold text-red-400">Application Rejected</span>
                                                        </div>
                                                        <ul className="space-y-1 text-xs text-red-300">
                                                            {policy.rejectionReasons?.map((reason: string, i: number) => (
                                                                <li key={i}>• {reason}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-800">
                                                            <div>
                                                                <div className="text-[10px] text-slate-500 uppercase">Coverage</div>
                                                                <div className="text-sm font-bold text-cyan-400">{policy.coverage?.toLocaleString()} ADA</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[10px] text-slate-500 uppercase">Premium</div>
                                                                <div className="text-sm font-bold text-white">{policy.premium} ADA</div>
                                                            </div>
                                                        </div>

                                                        {policy.claimStatus ? (
                                                            <div className={`p-3 rounded-lg border ${
                                                                policy.claimStatus === 'APPROVED' 
                                                                    ? 'bg-green-900 border-green-500' 
                                                                    : 'bg-red-900 border-red-500'
                                                            }`}>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {policy.claimStatus === 'APPROVED' ? <Check size={16} className="text-green-400" /> : <AlertCircle size={16} className="text-red-400" />}
                                                                    <span className={`text-sm font-bold ${
                                                                        policy.claimStatus === 'APPROVED' ? 'text-green-400' : 'text-red-400'
                                                                    }`}>
                                                                        Claim {policy.claimStatus}
                                                                    </span>
                                                                </div>
                                                                {policy.claimStatus === 'APPROVED' ? (
                                                                    <div className="text-xs text-green-300">
                                                                        Payout: {(policy.coverage * (policy.claimPayoutPercentage || 0)).toLocaleString()} ADA ({(policy.claimPayoutPercentage * 100).toFixed(0)}%)
                                                                    </div>
                                                                ) : (
                                                                    <ul className="space-y-1 text-xs text-red-300">
                                                                        {policy.claimRejectionReasons?.map((reason: string, i: number) => (
                                                                            <li key={i}>• {reason}</li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setSelectedPolicyForClaim(policy)}
                                                                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <FileText size={16} />
                                                                File Claim
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
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
                                    <div key={key} className="glass-panel p-6 rounded-2xl hover:border-cyan-400 transition-all relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 group-hover:border-cyan-500 transition-colors">
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
                        <div className="space-y-6 animate-enter">
                            <div>
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                                    <span className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
                                    AI Agent Monitoring
                                </h2>
                                <p className="text-slate-400 ml-7">Real-time oracle data from decentralized AI agents</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {Object.entries(POLICY_TYPES).map(([key, policy]) => {
                                    const agents = agentMonitoring[key] || [];
                                    const avgValue = agents.length > 0 
                                        ? agents.reduce((acc: number, a: any) => acc + a.currentValue, 0) / agents.length 
                                        : 0;
                                    const isTriggered = policy.condition === '>' 
                                        ? avgValue > policy.threshold 
                                        : avgValue < policy.threshold;
                                    
                                    return (
                                        <div key={key} className={`glass-panel p-6 rounded-2xl border-2 transition-all ${
                                            isTriggered ? 'border-red-500 bg-red-900' : 'border-slate-700'
                                        }`}>
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-slate-900 rounded-xl">
                                                        {React.createElement(policy.icon, { 
                                                            size: 32, 
                                                            className: isTriggered ? 'text-red-400' : 'text-cyan-400' 
                                                        })}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white">{policy.name}</h3>
                                                        <p className="text-sm text-slate-400">{policy.category}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-slate-500 uppercase mb-1">Current Reading</div>
                                                    <div className={`text-3xl font-mono font-bold ${
                                                        isTriggered ? 'text-red-400' : 'text-white'
                                                    }`}>
                                                        {avgValue.toFixed(1)} <span className="text-lg text-slate-500">{policy.unit}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        Threshold: {policy.condition} {policy.threshold} {policy.unit}
                                                    </div>
                                                </div>
                                            </div>

                                            {isTriggered && (
                                                <div className="mb-4 p-3 bg-red-900 border border-red-500 rounded-lg flex items-center gap-3">
                                                    <AlertTriangle size={20} className="text-red-400" />
                                                    <span className="text-sm font-bold text-red-400">TRIGGER CONDITION MET - Payout Eligible</span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-3 gap-3">
                                                {agents.map((agent: any) => (
                                                    <div key={agent.id} className="glass-panel p-4 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                agent.status === 'alert' ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                                                            }`} />
                                                            <span className="text-xs font-bold text-slate-300">{agent.role}</span>
                                                        </div>
                                                        <div className="text-lg font-mono font-bold text-white mb-1">
                                                            {agent.currentValue.toFixed(1)} <span className="text-xs text-slate-500">{policy.unit}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px]">
                                                            <span className="text-slate-500">Rep: {agent.reputation}%</span>
                                                            <span className="text-slate-600">{new Date(agent.lastUpdate).toLocaleTimeString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {view === 'OLD_SIMULATOR' && (
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
                                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl p-3 outline-none"
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
                                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isActive ? 'bg-cyan-900 border-cyan-500' : 'bg-slate-900 border-slate-800'}`}>
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
                                    <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-cyan-500 hover:border-cyan-400 transition-all">
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

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900 to-blue-900 border border-cyan-500">
                                <h3 className="text-lg font-bold text-white mb-4">Treasury Health</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Collateralization Ratio</span>
                                        <span className="text-lg font-bold text-emerald-400">142%</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
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

                    {view === 'NFTs' && (
                        <div className="space-y-6 animate-enter">
                            <NFTGallery 
                                walletAddress={wallet.connected ? wallet.address : null} 
                            />
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
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4" onClick={() => wallet.connected && setIsWalletModalOpen(false)}>
                    <div className="glass-panel p-8 rounded-2xl max-w-md w-full border-2 border-cyan-500/30 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
                                <p className="text-xs text-slate-400 mt-1">Secure connection to Cardano network</p>
                            </div>
                            {wallet.connected && (
                                <button onClick={() => setIsWalletModalOpen(false)} className="text-slate-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Your Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={walletName}
                                onChange={(e) => setWalletName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                            />
                        </div>
                        
                        <p className="text-slate-400 mb-4 text-sm font-medium">Choose your Cardano wallet:</p>
                        
                        {/* Show wallet detection status */}
                        {phase5Wallet.availableWallets.filter(w => w.isInstalled).length === 0 && (
                            <div className="mb-4 p-4 bg-amber-900/20 border border-amber-500/50 rounded-lg">
                                <p className="text-sm text-amber-400 mb-2">⚠️ No Cardano wallets detected</p>
                                <p className="text-xs text-slate-400 mb-3">Please install a wallet extension first:</p>
                                <div className="flex flex-wrap gap-2">
                                    <a href="https://namiwallet.io" target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-cyan-400">
                                        Nami →
                                    </a>
                                    <a href="https://www.lace.io" target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-cyan-400">
                                        Lace →
                                    </a>
                                    <a href="https://yoroi-wallet.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-cyan-400">
                                        Yoroi →
                                    </a>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-3">
                            {['Nami', 'Lace', 'Yoroi'].map(provider => {
                                const walletInfo = phase5Wallet.availableWallets.find(w => w.displayName === provider);
                                const isInstalled = walletInfo?.isInstalled;
                                
                                return (
                                    <button
                                        key={provider}
                                        onClick={() => isInstalled && connectWallet(provider.toLowerCase(), walletName)}
                                        disabled={!isInstalled || !walletName.trim()}
                                        className={`w-full p-4 bg-slate-800/50 border rounded-xl transition-all flex items-center justify-between group ${
                                            isInstalled && walletName.trim()
                                                ? 'hover:bg-slate-800 border-slate-700 hover:border-cyan-500/50 cursor-pointer' 
                                                : 'border-slate-800 opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                isInstalled ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-slate-700'
                                            }`}>
                                                <Wallet size={20} className="text-white" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-white">{provider}</div>
                                                {!isInstalled && (
                                                    <div className="text-xs text-slate-500">Not installed</div>
                                                )}
                                            </div>
                                        </div>
                                        {isInstalled && (
                                            <ChevronRight size={20} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-800">
                            <p className="text-xs text-slate-500 text-center">
                                By connecting, you agree to our{' '}
                                <button onClick={() => setShowTermsModal(true)} className="text-cyan-400 hover:text-cyan-300 underline">
                                    Terms & Conditions
                                </button>
                            </p>
                        </div>
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

                            <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500"
                                />
                                <label className="text-sm text-slate-400">
                                    I accept the{' '}
                                    <button
                                        onClick={() => setShowTermsModal(true)}
                                        className="text-cyan-400 hover:text-cyan-300 underline"
                                    >
                                        Terms & Conditions
                                    </button>
                                    {' '}and understand that coverage begins immediately upon approval
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setSelectedPolicy(null);
                                        setTermsAccepted(false);
                                    }}
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

                                        if (!termsAccepted) {
                                            addToast('Please accept terms and conditions', 'error');
                                            return;
                                        }

                                        if (wallet.balance < POLICY_TYPES[selectedPolicy].basePremium) {
                                            addToast('Insufficient wallet balance', 'error');
                                            return;
                                        }

                                        // Approve policy (documents required only for claims)
                                        setWallet(prev => ({ ...prev, balance: prev.balance - POLICY_TYPES[selectedPolicy].basePremium }));
                                        const policy = {
                                            instanceId: Date.now(),
                                            type: selectedPolicy,
                                            status: 'APPROVED',
                                            coverage: POLICY_TYPES[selectedPolicy].basePremium * 100,
                                            purchaseDate: new Date(),
                                            premium: POLICY_TYPES[selectedPolicy].basePremium,
                                            applicantName: wallet.name
                                        };
                                        setMyPolicies(prev => [...prev, policy]);
                                        addToast(`Policy Approved! ${POLICY_TYPES[selectedPolicy].name} is now active`, 'success');
                                        setSelectedPolicy(null);
                                        setTermsAccepted(false);
                                        setView('POLICIES');
                                    }}
                                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                                >
                                    <ShieldCheck size={20} />
                                    Purchase Policy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Claim Submission Modal */}
            {selectedPolicyForClaim && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPolicyForClaim(null)}>
                    <div className="glass-panel p-8 rounded-2xl max-w-2xl w-full border-2 border-cyan-500/30 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">File Insurance Claim</h2>
                                <p className="text-sm text-slate-400 mt-1">Submit incident report for AI validation</p>
                            </div>
                            <button onClick={() => {
                                setSelectedPolicyForClaim(null);
                                setClaimReport([]);
                            }} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                <div className="flex items-center gap-3 mb-2">
                                    {React.createElement(POLICY_TYPES[selectedPolicyForClaim.type as keyof typeof POLICY_TYPES].icon, { size: 24, className: 'text-cyan-400' })}
                                    <div>
                                        <h3 className="font-bold text-white">{POLICY_TYPES[selectedPolicyForClaim.type as keyof typeof POLICY_TYPES].name}</h3>
                                        <p className="text-xs text-slate-400">Policy ID: {selectedPolicyForClaim.instanceId}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">
                                    Upload Incident Report <span className="text-red-400">*</span>
                                </h3>
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FileText size={20} className="text-cyan-400" />
                                        <span className="text-sm text-slate-300">
                                            Required: {POLICY_TYPES[selectedPolicyForClaim.type as keyof typeof POLICY_TYPES].requiredProof}
                                        </span>
                                    </div>
                                    <label className="block w-full cursor-pointer">
                                        <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-lg p-6 text-center transition-colors">
                                            <UploadCloud size={40} className="mx-auto text-slate-600 mb-3" />
                                            <p className="text-sm text-slate-400 mb-2">
                                                {claimReport.length > 0 
                                                    ? `${claimReport.length} file(s) uploaded` 
                                                    : 'Click to upload incident report & supporting documents'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                PDF, Images, or other proof documents
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                setClaimReport(files);
                                                addToast(`${files.length} file(s) uploaded`, 'success');
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Info size={20} className="text-blue-400 mt-0.5" />
                                    <div className="text-xs text-blue-300">
                                        <p className="font-bold mb-1">AI Validation Process:</p>
                                        <ul className="space-y-1 ml-4 list-disc">
                                            <li>Your report will be analyzed by {POLICY_TYPES[selectedPolicyForClaim.type as keyof typeof POLICY_TYPES].agentRoles.length} AI agents</li>
                                            <li>Agents verify conditions match policy triggers</li>
                                            <li>Consensus required for payout approval</li>
                                            <li>Results typically available in 30-60 seconds</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedPolicyForClaim(null);
                                        setClaimReport([]);
                                    }}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (claimReport.length === 0) {
                                            addToast('Please upload incident report', 'error');
                                            return;
                                        }

                                        // AI Claim Validation
                                        const validation = validateClaimReport(selectedPolicyForClaim, claimReport);
                                        
                                        // Update policy with claim status
                                        setMyPolicies(prev => prev.map(p => 
                                            p.instanceId === selectedPolicyForClaim.instanceId
                                                ? {
                                                    ...p,
                                                    claimStatus: validation.status,
                                                    claimPayoutPercentage: validation.payoutPercentage,
                                                    claimRejectionReasons: validation.reasons,
                                                    claimDate: new Date(),
                                                    claimReportFiles: claimReport
                                                }
                                                : p
                                        ));

                                        if (validation.approved) {
                                            const payout = selectedPolicyForClaim.coverage * validation.payoutPercentage;
                                            setWallet(prev => ({ ...prev, balance: prev.balance + payout }));
                                            addToast(`Claim Approved! ${payout.toLocaleString()} ADA credited to wallet`, 'success');
                                        } else {
                                            addToast(`Claim Rejected: ${validation.reasons[0]}`, 'error');
                                        }

                                        setSelectedPolicyForClaim(null);
                                        setClaimReport([]);
                                    }}
                                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                                >
                                    <Send size={20} />
                                    Submit for AI Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Terms & Conditions Modal */}
            {/* Claim Submission Modal */}            {/* Terms & Conditions Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTermsModal(false)}>
                    <div className="glass-panel p-8 rounded-2xl max-w-3xl w-full border-2 border-cyan-500/30 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Terms & Conditions</h2>
                            <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6 text-slate-300">
                            <div>
                                <h3 className="text-lg font-bold text-cyan-400 mb-3">1. Acceptance of Terms</h3>
                                <p className="text-sm leading-relaxed">
                                    By connecting your wallet and purchasing any insurance policy on Project Hyperion, you agree to be bound by these terms and conditions. 
                                    These terms constitute a legal agreement between you and the Hyperion decentralized insurance protocol.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-cyan-400 mb-3">2. AI-Powered Validation</h3>
                                <p className="text-sm leading-relaxed mb-2">
                                    All policy applications are subject to automated AI validation. Our multi-agent system evaluates:
                                </p>
                                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                                    <li>Document authenticity and completeness</li>
                                    <li>Risk profile assessment</li>
                                    <li>Geographic and temporal factors</li>
                                    <li>Historical data patterns</li>
                                    <li>Wallet balance and transaction history</li>
                                </ul>
                                <p className="text-sm leading-relaxed mt-2">
                                    The AI validation decision is final. Rejected applications will receive detailed reasoning for transparency.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-cyan-400 mb-3">3. Parametric Insurance Model</h3>
                                <p className="text-sm leading-relaxed">
                                    Hyperion operates on a parametric insurance model. Payouts are triggered automatically when predefined conditions are met, 
                                    as verified by our decentralized AI agent network. No traditional claims process is required. Parameters are measured by 
                                    trusted oracle networks (NOAA, USGS, weather APIs, IoT sensors, etc.).
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-cyan-400 mb-3">4. Premium Payment & Coverage</h3>
                                <p className="text-sm leading-relaxed">
                                    Premiums are paid in ADA and are non-refundable once the policy is approved. Coverage begins immediately upon approval. 
                                    Policy terms, duration, and payout conditions are immutable once activated and stored on-chain.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-cyan-400 mb-3">5. Payout Execution</h3>
                                <p className="text-sm leading-relaxed">
                                    When trigger conditions are met, AI agents reach consensus through multi-signature validation. Payouts are executed 
                                    automatically via smart contracts within 24 hours of consensus. The variance between agent reports must be within 15% 
                                    for consensus to be valid.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-cyan-400 mb-3">6. Data Privacy & Security</h3>
                                <p className="text-sm leading-relaxed">
                                    Uploaded documents are encrypted and stored on IPFS. Personal information is hashed on-chain. We do not share or sell 
                                    your data. AI agents operate in a privacy-preserving manner using zero-knowledge proofs where applicable.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-cyan-400 mb-3">7. Liability Limitations</h3>
                                <p className="text-sm leading-relaxed">
                                    Hyperion is a decentralized protocol. While we strive for accuracy, we are not liable for oracle failures, 
                                    network congestion, smart contract bugs, or force majeure events. Maximum liability is limited to the premium paid.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-cyan-400 mb-3">8. Regulatory Compliance</h3>
                                <p className="text-sm leading-relaxed">
                                    Users are responsible for ensuring their participation complies with local regulations. Hyperion may restrict access 
                                    in jurisdictions where parametric insurance is prohibited.
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-800">
                                <p className="text-xs text-slate-500">
                                    Last Updated: November 29, 2025<br />
                                    Version: 4.0.2<br />
                                    Smart Contract: 0xHYPERION...protocol<br />
                                    Audit: Certik Verified
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setTermsAccepted(true);
                                setShowTermsModal(false);
                                addToast('Terms accepted', 'success');
                            }}
                            className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all"
                        >
                            I Accept Terms & Conditions
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
