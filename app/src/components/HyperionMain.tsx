'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { 
    Shield, Wind, Activity, Terminal, AlertTriangle, Wallet, Globe, 
    Plane, CloudRain, HeartPulse, Coins, ShoppingCart, PlayCircle, 
    TrendingUp, Clock, FileText, UploadCloud, Check, Landmark, 
    Bell, ChevronRight, Info, ShieldCheck, Lock, LockOpen, Zap, 
    Receipt, Download, MessageSquare, Briefcase, ArrowRightLeft, 
    ArrowUpRight, Send, AlertCircle, Menu, X, User, Power, Wifi, Database,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WalletConnect } from './WalletConnect';
import { WalletDebug } from './WalletDebug';
import { LoginPage } from './LoginPage';
import { ThemeToggle } from './ThemeToggle';
import { usePhase5Wallet } from '@/context/WalletProvider';
import { useOracle } from '@/hooks/use-oracle';

// Constants
const VARIANCE_LIMIT = 15; 
const STORAGE_KEY = 'hyperion_v4_state';
const ADA_PRICE = 0.45; 

const HYPERION_TOKEN = {
    name: 'HYPERION',
    symbol: 'HYPR',
    icon: '🛡️',
    description: 'The official governance and rewards token of Project Hyperion. Earn HYPR by purchasing insurance policies and participate in protocol decisions.',
    rewardTier: [
        { policies: 1, reward: 100, label: 'Bronze Shield' },
        { policies: 5, reward: 500, label: 'Silver Shield' },
        { policies: 10, reward: 2000, label: 'Gold Shield' },
        { policies: 20, reward: 10000, label: 'Diamond Shield' },
        { policies: 50, reward: 30000, label: 'Legendary Shield' }
    ],
    benefits: [
        '🗳️ Governance voting rights on protocol upgrades',
        '💰 Reduced premiums (5% per 1000 HYPR held)',
        '⚡ Priority claim processing',
        '🎁 Exclusive airdrops and bonuses',
        '💎 Staking rewards up to 15% APY'
    ]
};

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
        coverage: 450,
        duration: '12 months',
        maxPayout: 450
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
        coverage: 150,
        duration: '1 trip',
        maxPayout: 150
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
        coverage: 600,
        duration: '6 months',
        maxPayout: 600
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
        coverage: 540,
        duration: '12 months',
        maxPayout: 540
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
        coverage: 360,
        duration: '12 months',
        maxPayout: 360
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
        coverage: 750,
        duration: '12 months',
        maxPayout: 750
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
        coverage: 525,
        duration: '12 months',
        maxPayout: 525
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
        coverage: 480,
        duration: '6 months',
        maxPayout: 480
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
    const { connected: walletConnected, walletAddress, walletName: connectedWalletName, getBalance } = usePhase5Wallet();
    const { healthStatus, checkHealth, isCheckingHealth } = useOracle();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginMode, setLoginMode] = useState<'demo' | 'wallet' | null>(null);
    const [view, setView] = useState('POLICIES');
    
    // Separate wallet states for demo and live
    const [demoWallet, setDemoWallet] = useState({ 
        connected: false, 
        address: 'demo_addr1qx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu7', 
        balance: 2500, 
        name: 'Demo Account' 
    });
    const [liveWallet, setLiveWallet] = useState({ 
        connected: false, 
        address: null as string | null, 
        balance: 0, 
        name: '' 
    });
    
    // Active wallet based on login mode
    const wallet = loginMode === 'demo' ? demoWallet : liveWallet;
    const setWallet = loginMode === 'demo' ? setDemoWallet : setLiveWallet;
    
    // Separate policies for demo and live accounts
    const [demoPolicies, setDemoPolicies] = useState<any[]>([]);
    const [livePolicies, setLivePolicies] = useState<any[]>([]);
    const myPolicies = loginMode === 'demo' ? demoPolicies : livePolicies;
    const setMyPolicies = loginMode === 'demo' ? setDemoPolicies : setLivePolicies;
    
    // Separate HYPERION token balances for demo and live accounts
    const [demoHyperionTokens, setDemoHyperionTokens] = useState(0);
    const [liveHyperionTokens, setLiveHyperionTokens] = useState(0);
    const hyperionTokens = loginMode === 'demo' ? demoHyperionTokens : liveHyperionTokens;
    const setHyperionTokens = loginMode === 'demo' ? setDemoHyperionTokens : setLiveHyperionTokens;
    
    // Separate policy purchase totals for demo and live accounts
    const [demoTotalPoliciesBought, setDemoTotalPoliciesBought] = useState(0);
    const [liveTotalPoliciesBought, setLiveTotalPoliciesBought] = useState(0);
    const totalPoliciesBought = loginMode === 'demo' ? demoTotalPoliciesBought : liveTotalPoliciesBought;
    const setTotalPoliciesBought = loginMode === 'demo' ? setDemoTotalPoliciesBought : setLiveTotalPoliciesBought;
    
    const [showRewardsModal, setShowRewardsModal] = useState(false);
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

    // Handle wallet connection for auto-login
    useEffect(() => {
        if (walletConnected && !isLoggedIn) {
            setIsLoggedIn(true);
            setLoginMode('wallet');
        }
    }, [walletConnected, isLoggedIn]);
    
    // Sync live wallet with Phase5 wallet connection
    useEffect(() => {
        if (walletConnected && walletAddress && loginMode === 'wallet') {
            // Fetch real balance
            const fetchBalance = async () => {
                try {
                    const balance = await getBalance();
                    const adaBalance = Number(balance) / 1_000_000;
                    setLiveWallet({
                        connected: true,
                        address: walletAddress,
                        balance: Math.round(adaBalance * 100) / 100,
                        name: connectedWalletName || 'Connected Wallet'
                    });
                } catch (err) {
                    console.error('Failed to fetch balance:', err);
                }
            };
            fetchBalance();
            
            // Refresh balance every 30 seconds
            const interval = setInterval(fetchBalance, 30000);
            return () => clearInterval(interval);
        }
    }, [walletConnected, walletAddress, loginMode, connectedWalletName, getBalance]);

    // Handle demo login
    const handleDemoLogin = () => {
        setIsLoggedIn(true);
        setLoginMode('demo');
        // Initialize demo wallet with test balance
        setDemoWallet({
            connected: true,
            address: 'demo_addr1qx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu7',
            balance: 2500,
            name: 'Demo Account'
        });
    };

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Phase 6: Check oracle health on mount and periodically
    useEffect(() => {
        if (isLoggedIn) {
            checkHealth();
            const healthCheckInterval = setInterval(() => {
                checkHealth();
            }, 30000); // Check every 30 seconds
            return () => clearInterval(healthCheckInterval);
        }
    }, [isLoggedIn, checkHealth]);

    useEffect(() => {
        // Load demo session if exists
        const savedDemo = localStorage.getItem('hyperion_demo_session');
        if (savedDemo) {
            try {
                const parsed = JSON.parse(savedDemo);
                if (parsed.wallet) setDemoWallet(parsed.wallet);
                if (parsed.policies) {
                    // Load demo policies separately
                }
            } catch (e) {
                console.error('Failed to load demo session:', e);
            }
        }
        
        // Load live session if exists
        const savedLive = localStorage.getItem('hyperion_live_session');
        if (savedLive) {
            try {
                const parsed = JSON.parse(savedLive);
                if (parsed.wallet) setLiveWallet(parsed.wallet);
                if (parsed.policies) {
                    // Load live policies separately
                }
            } catch (e) {
                console.error('Failed to load live session:', e);
            }
        }
    }, []);

    // Save sessions separately
    useEffect(() => {
        if (loginMode === 'demo' && demoWallet.connected) {
            localStorage.setItem('hyperion_demo_session', JSON.stringify({ 
                wallet: demoWallet, 
                policies: myPolicies.filter(p => p.sessionType === 'demo')
            }));
        }
    }, [demoWallet, myPolicies, loginMode]);
    
    useEffect(() => {
        if (loginMode === 'wallet' && liveWallet.connected) {
            localStorage.setItem('hyperion_live_session', JSON.stringify({ 
                wallet: liveWallet,
                policies: myPolicies.filter(p => p.sessionType === 'wallet')
            }));
        }
    }, [liveWallet, myPolicies, loginMode]);

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
            
            // Simulate wallet connection
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockAddresses = {
                'nami': 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
                'eternl': 'addr1q8s5q9z8j5n6k8r9t7y6h5g4f3d2s1a0z9x8c7v6b5n4m3k2j1h0g9f8e7d6c5b4a3s2d1f0',
                'flint': 'addr1qy9z8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3h2g1f0e9d8c7b6a5s4d3f2g1h0'
            };

            const address = mockAddresses[walletProvider as keyof typeof mockAddresses] || mockAddresses.nami;
            const displayAddress = `${address.slice(0, 9)}...${address.slice(-4)}`;
            
            setWallet({ 
                connected: true, 
                address: displayAddress,
                balance: 2500 + Math.floor(Math.random() * 5000),
                name: userName
            });
            
            setIsWalletModalOpen(false);
            setWalletName('');
            addToast(`Welcome ${userName}! Wallet Connected`, 'success');
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
        return <LoginPage onDemoLogin={handleDemoLogin} />;
    }

    return (
        <div className="flex h-screen w-full overflow-hidden relative">
            {/* Creamy White Background with Bright Colors */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50" />
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, rgba(255,150,50,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px'}} />
            
            <ToastContainer toasts={toasts} removeToast={(id: number) => setToasts(prev => prev.filter(t => t.id !== id))} />
            
            {/* Wallet Debug Panel */}
            <WalletDebug />
            
            {/* Header */}
            <div className="flex-1 flex flex-col relative z-10">
                <header className="h-20 border-b-4 border-orange-500 bg-white shadow-lg">
                    <div className="h-full px-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-2xl font-black text-black uppercase">
                                    PROJECT HYPERION
                                </h1>
                                <p className="text-xs text-gray-700 font-bold">
                                    AI-Powered Parametric Insurance • {time ? time.toLocaleTimeString() : '--:--:--'} UTC
                                </p>
                            </div>
                            <div className="h-8 w-px bg-gray-300" />
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    'w-2 h-2 rounded-full animate-pulse',
                                    systemStatus === 'online' && 'bg-green-500 shadow-lg shadow-green-500/50'
                                )} />
                                <span className="text-sm font-black text-green-600">AI SWARM ONLINE</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            <ThemeToggle />
                            
                            {/* Session Mode Indicator */}
                            {loginMode && (
                                <div className={cn(
                                    'px-4 py-2 border-4 flex items-center gap-2 font-black text-xs uppercase tracking-wider shadow-lg',
                                    loginMode === 'demo' 
                                        ? 'bg-purple-500 border-purple-700 text-white'
                                        : 'bg-blue-500 border-blue-700 text-white'
                                )}>
                                    <div className={cn(
                                        'w-3 h-3 rounded-full animate-pulse',
                                        loginMode === 'demo' ? 'bg-yellow-300' : 'bg-green-300'
                                    )} />
                                    <span>{loginMode === 'demo' ? '🎮 Demo Mode' : '⚡ Live Account'}</span>
                                </div>
                            )}
                            
                            {/* Phase 5 Wallet Integration - Only show for Live mode */}
                            {loginMode === 'wallet' && <WalletConnect />}
                            
                            {/* Wallet Info Display */}
                            {wallet.connected && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white border-3 border-gray-300 shadow-md">
                                        <Coins size={16} className="text-orange-500" />
                                        <div>
                                            <div className="text-[9px] text-gray-600 uppercase font-bold">Balance</div>
                                            <div className="text-sm font-mono font-black text-black">
                                                {wallet.balance.toLocaleString()} <span className="text-gray-700">ADA</span>
                                                {loginMode === 'demo' && (
                                                    <span className="ml-2 text-[9px] text-purple-400">(Test)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* HYPERION Token Balance */}
                                    <button
                                        onClick={() => setShowRewardsModal(true)}
                                        className="relative px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 border-3 border-purple-700 shadow-lg hover:shadow-xl transition-all group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{HYPERION_TOKEN.icon}</span>
                                            <div className="text-left">
                                                <div className="text-[9px] text-purple-100 uppercase font-bold">HYPR Tokens</div>
                                                <div className="text-sm font-mono font-black text-white">
                                                    {hyperionTokens.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        {totalPoliciesBought >= 20 && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center">
                                                <span className="text-xs">💎</span>
                                            </div>
                                        )}
                                    </button>
                                    
                                    {/* Profile Dropdown */}
                                    <div className="relative profile-dropdown">
                                        <button
                                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                                            className="h-10 px-4 bg-white hover:bg-gray-100 border-3 border-gray-300 hover:border-blue-500 transition-all flex items-center gap-3 shadow-md"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <User size={16} className="text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs font-black text-black">{wallet.name}</div>
                                                    <div className="text-[9px] text-gray-700 font-bold">{wallet.address}</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={`text-gray-600 transition-transform ${showProfileMenu ? 'rotate-90' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showProfileMenu && (
                                            <div className="absolute right-0 mt-2 w-64 bg-white border-3 border-gray-300 rounded-xl shadow-2xl overflow-hidden z-50">
                                                <div className="p-4 border-b-3 border-gray-300 bg-gray-50">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                            <User size={20} className="text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-black text-black">{wallet.name}</div>
                                                            <div className="text-xs text-gray-700 font-bold">Policy Holder</div>
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
                                                            <div className="text-xs text-slate-500">
                                                                {wallet.balance.toLocaleString()} ADA
                                                                {loginMode === 'demo' && (
                                                                    <span className="ml-2 text-purple-400">(Demo)</span>
                                                                )}
                                                                {loginMode === 'wallet' && (
                                                                    <span className="ml-2 text-green-400">(Real)</span>
                                                                )}
                                                            </div>
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
                                                    {loginMode === 'wallet' && (
                                                        <button
                                                            onClick={() => {
                                                                setShowProfileMenu(false);
                                                                setIsWalletModalOpen(true);
                                                            }}
                                                            className="w-full px-3 py-2 mb-2 text-sm text-left text-cyan-400 hover:bg-cyan-900/30 rounded-lg transition-colors flex items-center gap-3"
                                                        >
                                                            <ArrowRightLeft size={16} />
                                                            <span className="font-medium">Change Wallet</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            // Logout and return to login page
                                                            setIsLoggedIn(false);
                                                            setLoginMode(null);
                                                            if (loginMode === 'wallet') {
                                                                localStorage.removeItem('hyperion_live_session');
                                                                localStorage.removeItem('phase5_last_wallet');
                                                            } else if (loginMode === 'demo') {
                                                                localStorage.removeItem('hyperion_demo_session');
                                                            }
                                                            setShowProfileMenu(false);
                                                            addToast('Logged out successfully', 'info');
                                                        }}
                                                        className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-red-900 rounded-lg transition-colors flex items-center gap-3"
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
                <div className="p-6 border-b-4 border-orange-400 bg-white/80 backdrop-blur-sm shadow-md">
                    <div className="flex gap-3 flex-wrap">
                        {[
                            {name: 'POLICIES', icon: '🛡️', color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600'},
                            {name: 'MARKETPLACE', icon: '🏪', color: 'bg-pink-500', hoverColor: 'hover:bg-pink-600'},
                            {name: 'REWARDS', icon: '💎', color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600'},
                            {name: 'STATUS', icon: '📊', color: 'bg-green-500', hoverColor: 'hover:bg-green-600'},
                            {name: 'TREASURY', icon: '🏛️', color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600'}
                        ].map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => setView(tab.name)}
                                className={`px-6 py-3 text-sm font-black uppercase tracking-wider border-4 transition-all shadow-lg ${
                                    view === tab.name 
                                        ? `${tab.color} text-black border-gray-800` 
                                        : `bg-white text-black border-gray-300 ${tab.hoverColor}`
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6 relative bg-gradient-to-b from-white to-orange-50">
                    {view === 'POLICIES' && (
                        <div className="space-y-6 animate-enter">
                            <div>
                                <h2 className="text-3xl font-black text-black flex items-center gap-3 mb-2">
                                    <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full" />
                                    My Policies
                                </h2>
                                <p className="text-gray-700 ml-7 font-bold">Your active parametric insurance coverage</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Active Policies', value: myPolicies.length, unit: '', color: 'bg-blue-500', icon: '🛡️' },
                                    { label: 'Total Coverage', value: myPolicies.reduce((acc, p) => acc + (p.coverage || 0), 0).toLocaleString(), unit: ' ADA', color: 'bg-green-500', icon: '💰' },
                                    { label: 'AI Agents', value: 8, unit: ' Active', color: 'bg-purple-500', icon: '🤖' },
                                    { label: 'Avg Payout', value: 12, unit: ' sec', color: 'bg-orange-500', icon: '⚡' },
                                ].map((metric, i) => (
                                    <div key={i} className={`p-6 border-4 border-gray-800 ${metric.color} relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow`}>
                                        <div className="absolute top-2 right-2 text-6xl opacity-20">{metric.icon}</div>
                                        <div className="text-sm text-black font-black uppercase mb-2">{metric.label}</div>
                                        <div className="text-4xl font-black text-black">{metric.value}<span className="text-2xl text-black/90">{metric.unit}</span></div>
                                    </div>
                                ))}
                            </div>

                            {myPolicies.length === 0 ? (
                                <div className="glass-panel p-12 rounded-2xl text-center">
                                    <Shield size={48} className="mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-black text-black mb-2">No Policies Yet</h3>
                                    <p className="text-gray-700 mb-6 font-bold">Purchase parametric insurance coverage to get started</p>
                                    <button onClick={() => setView('MARKETPLACE')} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white border-3 border-orange-700 shadow-lg font-black transition-all">
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
                                <h2 className="text-3xl font-black text-black flex items-center gap-3 mb-2">
                                    <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full" />
                                    Insurance Marketplace
                                </h2>
                                <p className="text-gray-700 ml-7 font-bold">Purchase parametric insurance coverage</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {Object.entries(POLICY_TYPES).map(([key, p]) => (
                                    <div key={key} className="glass-panel p-6 rounded-2xl hover:border-cyan-400 transition-all relative overflow-hidden group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-white border-3 border-gray-300 group-hover:border-orange-500 transition-colors shadow-md">
                                                {React.createElement(p.icon, { size: 24, className: 'text-orange-500' })}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-gray-700 uppercase">Premium</div>
                                                <div className="text-xl font-mono font-black text-black">{p.basePremium} ₳</div>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-black mb-2">{p.name}</h3>
                                        <p className="text-xs text-gray-700 mb-2 font-bold">{p.category} • Trigger: {p.condition} {p.threshold} {p.unit}</p>
                                        <p className="text-xs text-gray-600 mb-6 line-clamp-2 font-bold">{p.description.substring(0, 100)}...</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedPolicy(key as keyof typeof POLICY_TYPES)}
                                                className="flex-1 py-3 bg-white hover:bg-gray-100 text-black font-black text-xs border-3 border-gray-300 hover:border-orange-500 transition-all shadow-md"
                                            >
                                                VIEW DETAILS
                                            </button>
                                            <button
                                                onClick={() => setSelectedPolicy(key as keyof typeof POLICY_TYPES)}
                                                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs border-3 border-orange-700 transition-all shadow-lg"
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

                    {view === 'REWARDS' && (
                        <div className="space-y-6 animate-enter">
                            <div>
                                <h2 className="text-3xl font-black text-black flex items-center gap-3 mb-2">
                                    <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                                    HYPERION Rewards Program
                                </h2>
                                <p className="text-gray-700 ml-7 font-bold">Earn HYPR tokens by purchasing insurance policies</p>
                            </div>

                            {/* Token Balance Card */}
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-purple-700 rounded-2xl p-8 shadow-2xl">
                                <div className="text-center mb-6">
                                    <div className="text-6xl mb-4">{HYPERION_TOKEN.icon}</div>
                                    <div className="text-sm font-bold text-purple-100 uppercase mb-2">Your Balance</div>
                                    <div className="text-6xl font-black text-white mb-2">{hyperionTokens.toLocaleString()}</div>
                                    <div className="text-2xl font-bold text-purple-100">HYPR TOKENS</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-black/20 rounded-xl p-4 text-center">
                                        <div className="text-sm font-bold text-purple-200 mb-1">Policies Bought</div>
                                        <div className="text-3xl font-black text-white">{totalPoliciesBought}</div>
                                    </div>
                                    <div className="bg-black/20 rounded-xl p-4 text-center">
                                        <div className="text-sm font-bold text-purple-200 mb-1">Next Milestone</div>
                                        <div className="text-3xl font-black text-white">
                                            {HYPERION_TOKEN.rewardTier.find(t => t.policies > totalPoliciesBought)?.policies || 50}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reward Tiers */}
                            <div className="bg-white border-4 border-gray-300 rounded-2xl p-6 shadow-lg">
                                <h3 className="text-2xl font-black text-black mb-6 text-center">🏆 REWARD TIERS</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {HYPERION_TOKEN.rewardTier.map((tier, index) => {
                                        const isUnlocked = totalPoliciesBought >= tier.policies;
                                        const isNext = !isUnlocked && totalPoliciesBought < tier.policies && 
                                                      (index === 0 || totalPoliciesBought >= HYPERION_TOKEN.rewardTier[index - 1].policies);
                                        
                                        return (
                                            <div 
                                                key={tier.label}
                                                className={`p-6 rounded-xl border-4 transition-all ${
                                                    isUnlocked 
                                                        ? 'bg-gradient-to-br from-yellow-300 to-orange-300 border-yellow-500 shadow-xl' 
                                                        : isNext
                                                        ? 'bg-purple-100 border-purple-500 animate-pulse shadow-lg'
                                                        : 'bg-gray-100 border-gray-400 opacity-60'
                                                }`}
                                            >
                                                <div className="text-center mb-3">
                                                    <div className="text-4xl mb-2">
                                                        {isUnlocked ? '✓' : isNext ? '→' : '🔒'}
                                                    </div>
                                                    <div className="font-black text-black text-lg mb-2">{tier.label}</div>
                                                    <div className="text-sm text-gray-800 font-bold mb-3">
                                                        {tier.policies} {tier.policies === 1 ? 'Policy' : 'Policies'}
                                                    </div>
                                                    <div className="text-3xl font-black text-purple-600">
                                                        +{tier.reward.toLocaleString()}
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-700">HYPR</div>
                                                </div>
                                                {isUnlocked && (
                                                    <div className="text-center text-xs font-black text-green-600">UNLOCKED!</div>
                                                )}
                                                {isNext && (
                                                    <div className="text-center text-xs font-black text-purple-600">NEXT REWARD</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Benefits Section */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-blue-300 rounded-2xl p-6 shadow-lg">
                                <h3 className="text-2xl font-black text-black mb-6 text-center">💎 TOKEN BENEFITS</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {HYPERION_TOKEN.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-start gap-3 bg-white border-3 border-gray-300 rounded-xl p-4 shadow-md">
                                            <span className="text-2xl">✓</span>
                                            <span className="text-sm text-black font-bold">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Call to Action */}
                            <div className="bg-gradient-to-r from-orange-400 to-pink-400 border-4 border-orange-600 rounded-2xl p-8 text-center shadow-2xl">
                                <h3 className="text-3xl font-black text-black mb-4">🚀 START EARNING TODAY!</h3>
                                <p className="text-lg font-bold text-black mb-6">
                                    Purchase insurance policies to earn HYPR tokens. Reach 20 policies to unlock the Diamond Shield tier with 10,000+ HYPR!
                                </p>
                                <button
                                    onClick={() => setView('MARKETPLACE')}
                                    className="px-8 py-4 bg-black hover:bg-gray-800 text-white font-black text-xl rounded-xl transition-all shadow-lg border-4 border-gray-900 uppercase"
                                >
                                    🛒 Visit Marketplace
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'STATUS' && (
                        <div className="space-y-6 animate-enter">
                            <div>
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                                    <span className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
                                    Policy & Claim Status
                                </h2>
                                <p className="text-slate-400 ml-7">Track your policy applications and claim decisions</p>
                            </div>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { 
                                        label: 'Total Policies', 
                                        value: myPolicies.length, 
                                        icon: Shield,
                                        color: 'cyan'
                                    },
                                    { 
                                        label: 'Approved', 
                                        value: myPolicies.filter(p => p.status === 'APPROVED').length, 
                                        icon: Check,
                                        color: 'green'
                                    },
                                    { 
                                        label: 'Claims Filed', 
                                        value: myPolicies.filter(p => p.claimStatus).length, 
                                        icon: FileText,
                                        color: 'blue'
                                    },
                                    { 
                                        label: 'Claims Approved', 
                                        value: myPolicies.filter(p => p.claimStatus === 'APPROVED').length, 
                                        icon: CheckCircle2,
                                        color: 'emerald'
                                    },
                                ].map((metric, i) => (
                                    <div key={i} className={`p-5 rounded-xl bg-slate-900 border border-${metric.color}-500 hover:border-${metric.color}-400 transition-all`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            {React.createElement(metric.icon, { size: 20, className: `text-${metric.color}-400` })}
                                            <div className="text-sm text-slate-400">{metric.label}</div>
                                        </div>
                                        <div className="text-3xl font-bold text-white">{metric.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Phase 6: Oracle Sentinel Swarm Status */}
                            <div className="glass-panel p-6 rounded-2xl border-2 border-cyan-500/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Database size={20} className="text-cyan-400" />
                                        Oracle Sentinel Swarm (Phase 6)
                                    </h3>
                                    <button
                                        onClick={() => checkHealth()}
                                        disabled={isCheckingHealth}
                                        className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-lg text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isCheckingHealth ? (
                                            <>
                                                <Wifi size={14} className="animate-pulse" />
                                                Checking...
                                            </>
                                        ) : (
                                            <>
                                                <Wifi size={14} />
                                                Refresh Status
                                            </>
                                        )}
                                    </button>
                                </div>

                                {healthStatus ? (
                                    <>
                                        {/* Overall Status */}
                                        <div className={`p-4 rounded-lg mb-4 border-2 ${
                                            healthStatus.status === 'healthy' 
                                                ? 'bg-green-900/20 border-green-500/50' 
                                                : healthStatus.status === 'degraded'
                                                ? 'bg-yellow-900/20 border-yellow-500/50'
                                                : healthStatus.status === 'offline'
                                                ? 'bg-slate-900/20 border-slate-500/50'
                                                : 'bg-red-900/20 border-red-500/50'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        healthStatus.status === 'healthy' 
                                                            ? 'bg-green-400 animate-pulse' 
                                                            : healthStatus.status === 'degraded'
                                                            ? 'bg-yellow-400 animate-pulse'
                                                            : healthStatus.status === 'offline'
                                                            ? 'bg-slate-400'
                                                            : 'bg-red-400'
                                                    }`} />
                                                    <span className={`text-lg font-bold ${
                                                        healthStatus.status === 'healthy' ? 'text-green-400' :
                                                        healthStatus.status === 'degraded' ? 'text-yellow-400' :
                                                        healthStatus.status === 'offline' ? 'text-slate-400' :
                                                        'text-red-400'
                                                    }`}>
                                                        {healthStatus.status === 'offline' 
                                                            ? 'Backend Offline' 
                                                            : `Status: ${healthStatus.status.toUpperCase()}`
                                                        }
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    Last checked: {new Date(healthStatus.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Agent Status Cards */}
                                        {healthStatus.agents && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                {[
                                                    { name: 'Meteorologist', status: healthStatus.agents.meteorologist, icon: CloudRain, role: 'Primary Weather Data' },
                                                    { name: 'Auditor', status: healthStatus.agents.auditor, icon: ShieldCheck, role: 'Data Validation' },
                                                    { name: 'Arbiter', status: healthStatus.agents.arbiter, icon: CheckCircle2, role: 'Final Decision & Signing' }
                                                ].map((agent, i) => (
                                                    <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            {React.createElement(agent.icon, { 
                                                                size: 18, 
                                                                className: agent.status === 'online' ? 'text-green-400' : 'text-red-400' 
                                                            })}
                                                            <span className="font-bold text-white text-sm">{agent.name}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-400 mb-2">{agent.role}</div>
                                                        <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                                            agent.status === 'online' 
                                                                ? 'bg-green-900/50 text-green-400' 
                                                                : 'bg-red-900/50 text-red-400'
                                                        }`}>
                                                            {agent.status?.toUpperCase() || 'UNKNOWN'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Integration Info */}
                                        <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <Info size={16} className="text-cyan-400 mt-0.5" />
                                                <div className="text-xs text-cyan-300">
                                                    <p className="font-bold mb-1">Real-time Oracle Integration</p>
                                                    <p className="text-cyan-400/80">
                                                        The Sentinel Swarm fetches live weather data from OpenWeatherMap, validates it with secondary sources,
                                                        and generates cryptographically signed oracle messages for on-chain claim verification.
                                                        All agents must be online for real-time claims processing.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <Wifi size={48} className="mx-auto mb-4 text-slate-600 animate-pulse" />
                                        <h4 className="text-lg font-bold text-white mb-2">Checking Oracle Status...</h4>
                                        <p className="text-slate-400 text-sm">Please wait while we verify the backend connection</p>
                                    </div>
                                )}
                            </div>

                            {/* Policy Status List */}
                            <div className="glass-panel p-6 rounded-2xl">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Activity size={20} className="text-cyan-400" />
                                    Policy Status History
                                </h3>
                                
                                {myPolicies.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Shield size={48} className="mx-auto mb-4 text-slate-600" />
                                        <h4 className="text-lg font-bold text-white mb-2">No Policies Yet</h4>
                                        <p className="text-slate-400">Purchase a policy to see status updates</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {myPolicies.map(policy => {
                                            const policyConfig = POLICY_TYPES[policy.type as keyof typeof POLICY_TYPES];
                                            const hasRejection = policy.status === 'REJECTED';
                                            const hasClaim = policy.claimStatus;
                                            
                                            return (
                                                <div key={policy.instanceId} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-all">
                                                    <div className="flex items-start gap-4">
                                                        {/* Policy Icon */}
                                                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                                            {React.createElement(policyConfig.icon, { 
                                                                size: 24, 
                                                                className: hasRejection ? 'text-red-400' : 'text-cyan-400' 
                                                            })}
                                                        </div>
                                                        
                                                        {/* Policy Details */}
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h4 className="text-lg font-bold text-white">{policyConfig.name}</h4>
                                                                    <p className="text-xs text-slate-400">
                                                                        Policy ID: {policy.instanceId} • {new Date(policy.purchaseDate).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                                    hasRejection 
                                                                        ? 'bg-red-900/50 text-red-400 border-red-500' 
                                                                        : 'bg-green-900/50 text-green-400 border-green-500'
                                                                }`}>
                                                                    {policy.status}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Policy Application Status */}
                                                            {hasRejection ? (
                                                                <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
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
                                                                <div className="mt-3 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <Check size={16} className="text-green-400" />
                                                                            <span className="text-sm font-bold text-green-400">Policy Approved & Active</span>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-xs text-slate-400">Coverage</div>
                                                                            <div className="text-sm font-bold text-white">{policy.coverage?.toLocaleString()} ADA</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Claim Status */}
                                                            {hasClaim && (
                                                                <div className={`mt-3 p-4 border rounded-lg ${
                                                                    policy.claimStatus === 'APPROVED'
                                                                        ? 'bg-emerald-900/30 border-emerald-500/50'
                                                                        : policy.claimStatus === 'REJECTED'
                                                                        ? 'bg-red-900/30 border-red-500/50'
                                                                        : 'bg-yellow-900/30 border-yellow-500/50'
                                                                }`}>
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            {policy.claimStatus === 'APPROVED' ? (
                                                                                <CheckCircle2 size={16} className="text-emerald-400" />
                                                                            ) : policy.claimStatus === 'REJECTED' ? (
                                                                                <AlertCircle size={16} className="text-red-400" />
                                                                            ) : (
                                                                                <Clock size={16} className="text-yellow-400" />
                                                                            )}
                                                                            <span className={`text-sm font-bold ${
                                                                                policy.claimStatus === 'APPROVED' ? 'text-emerald-400' :
                                                                                policy.claimStatus === 'REJECTED' ? 'text-red-400' :
                                                                                'text-yellow-400'
                                                                            }`}>
                                                                                Claim {policy.claimStatus}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {policy.claimStatus === 'APPROVED' && policy.payoutAmount && !policy.payoutProcessed && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    // Process payout
                                                                                    const payout = policy.payoutAmount;
                                                                                    if (loginMode === 'demo') {
                                                                                        setDemoWallet(prev => ({ ...prev, balance: prev.balance + payout }));
                                                                                    } else {
                                                                                        setLiveWallet(prev => ({ ...prev, balance: prev.balance + payout }));
                                                                                    }
                                                                                    
                                                                                    // Mark payout as processed
                                                                                    setMyPolicies(prev => prev.map(p => 
                                                                                        p.instanceId === policy.instanceId
                                                                                            ? { ...p, payoutProcessed: true, payoutDate: new Date() }
                                                                                            : p
                                                                                    ));
                                                                                    
                                                                                    addToast(`Payout of ${payout.toLocaleString()} ADA processed successfully!`, 'success');
                                                                                }}
                                                                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
                                                                            >
                                                                                <Download size={14} />
                                                                                Claim Payout
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {policy.claimStatus === 'APPROVED' && policy.payoutAmount && (
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center justify-between text-sm">
                                                                                <span className="text-emerald-300">Payout Amount:</span>
                                                                                <span className="font-bold text-white">{policy.payoutAmount.toLocaleString()} ADA</span>
                                                                            </div>
                                                                            {policy.payoutProcessed && (
                                                                                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-900/30 p-2 rounded-lg">
                                                                                    <Check size={14} />
                                                                                    <span>Payout processed on {new Date(policy.payoutDate).toLocaleDateString()}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {policy.claimStatus === 'REJECTED' && (
                                                                        <div className="space-y-2">
                                                                            <div className="text-xs font-bold text-red-300 uppercase mb-2">Rejection Reasons:</div>
                                                                            <ul className="space-y-1.5">
                                                                                {(policy.claimRejectionReasons || policy.rejectionReasons || []).map((reason: string, i: number) => (
                                                                                    <li key={i} className="flex items-start gap-2 text-xs text-red-300">
                                                                                        <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                                                                                        <span>{reason}</span>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
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

            {/* Wallet Connection Modal - Only for live account */}
            {isWalletModalOpen && loginMode === 'wallet' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsWalletModalOpen(false)}>
                    <div className="glass-panel p-8 rounded-2xl max-w-md w-full border-2 border-cyan-500/30 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <ArrowRightLeft className="h-6 w-6 text-cyan-400" />
                                    Change Wallet
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">Connect to a different Cardano wallet</p>
                            </div>
                            <button onClick={() => setIsWalletModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Current Connection Info */}
                        {liveWallet.connected && (
                            <div className="mb-6 p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                                <div className="text-xs text-slate-500 uppercase mb-2">Currently Connected</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                        <Wallet size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-white">{liveWallet.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">{liveWallet.address}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Real Wallet Connection Component */}
                        <div className="space-y-4">
                            <p className="text-slate-400 text-sm font-medium">Select a new wallet:</p>
                            <WalletConnect />
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-800">
                            <p className="text-xs text-slate-500 text-center">
                                Your balance and policies are tied to your wallet address.
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
                                        if (loginMode === 'demo') {
                                            setDemoWallet(prev => ({ ...prev, balance: prev.balance - POLICY_TYPES[selectedPolicy].basePremium }));
                                        } else {
                                            setLiveWallet(prev => ({ ...prev, balance: prev.balance - POLICY_TYPES[selectedPolicy].basePremium }));
                                        }
                                        const policy = {
                                            instanceId: Date.now(),
                                            type: selectedPolicy,
                                            status: 'APPROVED',
                                            coverage: POLICY_TYPES[selectedPolicy].coverage,
                                            purchaseDate: new Date(),
                                            premium: POLICY_TYPES[selectedPolicy].basePremium,
                                            applicantName: wallet.name
                                        };
                                        setMyPolicies(prev => [...prev, policy]);
                                        
                                        // Update total policies bought and check for rewards
                                        const newTotal = totalPoliciesBought + 1;
                                        setTotalPoliciesBought(newTotal);
                                        
                                        // Calculate HYPERION token rewards
                                        let tokensEarned = 50; // Base reward for each policy
                                        const milestoneReached = HYPERION_TOKEN.rewardTier.find(tier => tier.policies === newTotal);
                                        
                                        if (milestoneReached) {
                                            tokensEarned = milestoneReached.reward;
                                            setHyperionTokens(prev => prev + tokensEarned);
                                            setShowRewardsModal(true);
                                            addToast(`🎉 ${milestoneReached.label} Unlocked! +${tokensEarned.toLocaleString()} HYPR Tokens!`, 'success');
                                        } else {
                                            setHyperionTokens(prev => prev + tokensEarned);
                                            addToast(`+${tokensEarned} HYPR tokens earned!`, 'success');
                                        }
                                        
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
                                        const payout = selectedPolicyForClaim.coverage * validation.payoutPercentage;
                                        
                                        // Update policy with claim status (don't auto-process payout)
                                        setMyPolicies(prev => prev.map(p => 
                                            p.instanceId === selectedPolicyForClaim.instanceId
                                                ? {
                                                    ...p,
                                                    claimStatus: validation.status,
                                                    claimPayoutPercentage: validation.payoutPercentage,
                                                    claimRejectionReasons: validation.reasons,
                                                    payoutAmount: validation.approved ? payout : 0,
                                                    payoutProcessed: false,
                                                    claimDate: new Date(),
                                                    claimReportFiles: claimReport
                                                }
                                                : p
                                        ));

                                        if (validation.approved) {
                                            addToast(`Claim Approved! Go to STATUS tab to claim your ${payout.toLocaleString()} ADA payout`, 'success');
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

            {/* HYPERION Rewards Modal */}
            {showRewardsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRewardsModal(false)}>
                    <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 p-8 rounded-2xl max-w-3xl w-full border-4 border-purple-500 shadow-2xl animate-in fade-in zoom-in-95 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Animated background */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400 via-purple-500 to-pink-500 animate-pulse" />
                        </div>
                        
                        <div className="relative z-10">
                            <button 
                                onClick={() => setShowRewardsModal(false)} 
                                className="absolute top-0 right-0 text-white hover:text-purple-200 transition-colors"
                            >
                                <X size={28} />
                            </button>

                            <div className="text-center mb-8">
                                <div className="text-6xl mb-4 animate-bounce">{HYPERION_TOKEN.icon}</div>
                                <h2 className="text-4xl font-black text-white uppercase mb-2">HYPERION TOKEN</h2>
                                <p className="text-xl font-bold text-purple-200">{HYPERION_TOKEN.symbol}</p>
                            </div>

                            {/* Current Balance */}
                            <div className="bg-black/30 border-3 border-purple-400 rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-bold text-purple-300 uppercase mb-2">Your Balance</div>
                                    <div className="text-5xl font-black text-white mb-2">{hyperionTokens.toLocaleString()}</div>
                                    <div className="text-lg font-bold text-purple-200">HYPR Tokens</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-black/20 border-2 border-purple-400/50 rounded-xl p-6 mb-6">
                                <p className="text-white text-sm leading-relaxed font-bold text-center">
                                    {HYPERION_TOKEN.description}
                                </p>
                            </div>

                            {/* Reward Tiers */}
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-white uppercase mb-4 text-center">🏆 Reward Tiers</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {HYPERION_TOKEN.rewardTier.map((tier, index) => {
                                        const isUnlocked = totalPoliciesBought >= tier.policies;
                                        const isNext = !isUnlocked && totalPoliciesBought < tier.policies && 
                                                      (index === 0 || totalPoliciesBought >= HYPERION_TOKEN.rewardTier[index - 1].policies);
                                        
                                        return (
                                            <div 
                                                key={tier.label}
                                                className={`p-4 rounded-lg border-3 transition-all ${
                                                    isUnlocked 
                                                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400' 
                                                        : isNext
                                                        ? 'bg-purple-500/20 border-purple-400 animate-pulse'
                                                        : 'bg-black/20 border-gray-600'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-black text-white text-sm">{tier.label}</div>
                                                    {isUnlocked && <span className="text-xl">✓</span>}
                                                    {isNext && <span className="text-xl">→</span>}
                                                </div>
                                                <div className="text-xs text-purple-200 font-bold mb-1">
                                                    {tier.policies} {tier.policies === 1 ? 'Policy' : 'Policies'} Required
                                                </div>
                                                <div className="text-lg font-black text-white">
                                                    +{tier.reward.toLocaleString()} HYPR
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 text-center">
                                    <div className="inline-block bg-purple-500/30 border-2 border-purple-400 rounded-lg px-4 py-2">
                                        <span className="text-sm font-bold text-white">
                                            Progress: {totalPoliciesBought} / 50 Policies Purchased
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-white uppercase mb-4 text-center">💎 Token Benefits</h3>
                                <div className="space-y-2">
                                    {HYPERION_TOKEN.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-start gap-3 bg-black/20 border border-purple-400/30 rounded-lg p-3">
                                            <span className="text-lg">✓</span>
                                            <span className="text-sm text-white font-bold">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Call to Action */}
                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        setShowRewardsModal(false);
                                        setView('MARKETPLACE');
                                    }}
                                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-lg rounded-xl transition-all shadow-lg border-3 border-yellow-600 uppercase"
                                >
                                    🛒 Buy More Policies & Earn Rewards
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
