// ═══════════════════════════════════════════════════════════════════════════
// HYPERION MEME COIN (HYP) - Official Token
// ═══════════════════════════════════════════════════════════════════════════
// The First AI-Powered Insurance Protocol Meme Token on Cardano
// "Insure Your Bags, Protect Your Dreams" 🚀💎
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import React, { useState, useEffect } from 'react';
import { 
    Rocket, Shield, TrendingUp, Users, Zap, Flame, Star, 
    Lock, Unlock, Gift, Trophy, Target, Wallet, Copy, 
    Twitter, Send, Globe, FileText, DollarSign, PieChart,
    ArrowUpRight, ArrowDownRight, Sparkles, Crown, Heart,
    MessageCircle, Share2, Check, AlertCircle, ChevronDown,
    ChevronUp, ExternalLink, Coffee, Moon, ShoppingCart, X
} from 'lucide-react';

interface TokenomicsBreakdown {
    category: string;
    percentage: number;
    amount: string;
    color: string;
    icon: any;
    description: string;
    lockPeriod?: string;
}

interface RoadmapPhase {
    phase: string;
    title: string;
    status: 'completed' | 'in-progress' | 'upcoming';
    items: string[];
    quarter: string;
}

interface TeamMember {
    name: string;
    role: string;
    avatar: string;
    description: string;
}

const TOKENOMICS: TokenomicsBreakdown[] = [
    {
        category: 'Community Rewards',
        percentage: 40,
        amount: '400B HYP',
        color: 'from-purple-500 to-pink-500',
        icon: Gift,
        description: 'Airdrops, staking rewards, and community incentives',
        lockPeriod: 'Vested over 24 months'
    },
    {
        category: 'Liquidity Pool',
        percentage: 25,
        amount: '250B HYP',
        color: 'from-cyan-500 to-blue-500',
        icon: Lock,
        description: 'DEX liquidity for SundaeSwap, Minswap, and WingRiders',
        lockPeriod: 'Locked 12 months'
    },
    {
        category: 'Team & Advisors',
        percentage: 15,
        amount: '150B HYP',
        color: 'from-orange-500 to-red-500',
        icon: Users,
        description: 'Core team allocation with vesting schedule',
        lockPeriod: 'Vested over 36 months'
    },
    {
        category: 'Marketing & Partnerships',
        percentage: 12,
        amount: '120B HYP',
        color: 'from-yellow-500 to-orange-500',
        icon: Rocket,
        description: 'Marketing campaigns, influencer partnerships, CEX listings',
        lockPeriod: 'Unlocked quarterly'
    },
    {
        category: 'Insurance Treasury',
        percentage: 5,
        amount: '50B HYP',
        color: 'from-emerald-500 to-green-500',
        icon: Shield,
        description: 'Protocol insurance fund for claim payouts',
        lockPeriod: 'Locked indefinitely'
    },
    {
        category: 'Early Supporters',
        percentage: 3,
        amount: '30B HYP',
        color: 'from-pink-500 to-purple-500',
        icon: Star,
        description: 'Private sale and seed investors',
        lockPeriod: 'Vested over 18 months'
    }
];

const ROADMAP: RoadmapPhase[] = [
    {
        phase: 'Phase 1',
        title: 'Launch & Foundation',
        status: 'completed',
        quarter: 'Q4 2024',
        items: [
            '✅ Smart contract development',
            '✅ Token minting on Cardano',
            '✅ Website & whitepaper launch',
            '✅ Community building (Twitter, Discord, Telegram)',
            '✅ Initial DEX offering (IDO) on SundaeSwap'
        ]
    },
    {
        phase: 'Phase 2',
        title: 'Ecosystem Expansion',
        status: 'in-progress',
        quarter: 'Q1 2025',
        items: [
            '🔄 Listings on Minswap & WingRiders',
            '🔄 Staking platform launch',
            '🔄 First community airdrop (50B HYP)',
            '🔄 Partnership with top Cardano projects',
            '⏳ NFT collection launch (HyperionPunks)'
        ]
    },
    {
        phase: 'Phase 3',
        title: 'DeFi Integration',
        status: 'upcoming',
        quarter: 'Q2 2025',
        items: [
            '⏳ Yield farming pools',
            '⏳ Integration with Liqwid Finance',
            '⏳ Cross-chain bridge (Cardano ↔ Ethereum)',
            '⏳ Mobile wallet app',
            '⏳ Governance token upgrade'
        ]
    },
    {
        phase: 'Phase 4',
        title: 'Global Domination',
        status: 'upcoming',
        quarter: 'Q3 2025',
        items: [
            '⏳ Major CEX listings (Binance, Coinbase)',
            '⏳ HyperionDAO launch',
            '⏳ Insurance protocol integration',
            '⏳ Metaverse presence',
            '⏳ To the moon! 🚀🌙'
        ]
    }
];

const TEAM: TeamMember[] = [
    {
        name: 'Charles Hoskinmeme',
        role: 'Chief Meme Officer',
        avatar: '🦁',
        description: 'Visionary leader with 10+ years in meme creation'
    },
    {
        name: 'Vitalik Butermeme',
        role: 'Head of Tokenomics',
        avatar: '🐍',
        description: 'Economics PhD with expertise in meme markets'
    },
    {
        name: 'Satoshi Nakameme',
        role: 'Blockchain Architect',
        avatar: '🚀',
        description: 'Built the unbreakable smart contract foundation'
    },
    {
        name: 'Moon Lambo',
        role: 'Community Manager',
        avatar: '🌙',
        description: 'Connecting with diamond hands worldwide'
    }
];

export function HyperionMeme() {
    const [activeTab, setActiveTab] = useState<'overview' | 'tokenomics' | 'roadmap' | 'team'>('overview');
    const [copied, setCopied] = useState(false);
    const [price, setPrice] = useState(0.00000042);
    const [priceChange, setPriceChange] = useState(0);
    const [holders, setHolders] = useState(12847);
    const [volume24h, setVolume24h] = useState(450000);
    const [showWhitepaper, setShowWhitepaper] = useState(false);
    const [expandedTokenomics, setExpandedTokenomics] = useState<number | null>(null);

    // Contract address (example)
    const CONTRACT_ADDRESS = 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgslmz3mx';
    const POLICY_ID = 'e16c2dc8ae937e8d3790c7fd7168d7b994621ba14ca11415f39fed72485950';

    useEffect(() => {
        // Simulate live price updates
        const interval = setInterval(() => {
            const change = (Math.random() - 0.48) * 0.00000005;
            setPrice(prev => Math.max(0.00000001, prev + change));
            setPriceChange((Math.random() - 0.5) * 20);
            setHolders(prev => prev + Math.floor(Math.random() * 3));
            setVolume24h(prev => prev + Math.floor(Math.random() * 10000 - 5000));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const copyAddress = () => {
        navigator.clipboard.writeText(CONTRACT_ADDRESS);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatPrice = (p: number) => {
        if (p < 0.000001) return p.toExponential(2);
        return p.toFixed(8);
    };

    const marketCap = price * 1000000000000; // 1 Trillion supply

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            {/* Hero Section */}
            <div className="relative z-10 p-8 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center text-4xl animate-bounce">
                                🚀
                            </div>
                            <div>
                                <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-1">
                                    HYPERION COIN
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm text-purple-400 font-bold">
                                        $HYP
                                    </span>
                                    <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-sm text-cyan-400 font-bold flex items-center gap-1">
                                        <Shield size={14} /> Cardano Native
                                    </span>
                                    <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 rounded-full text-sm text-orange-400 font-bold flex items-center gap-1">
                                        <Flame size={14} /> HOT 🔥
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all">
                                <Twitter className="text-cyan-400" size={20} />
                            </button>
                            <button className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all">
                                <Send className="text-blue-400" size={20} />
                            </button>
                            <button className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all">
                                <Globe className="text-emerald-400" size={20} />
                            </button>
                        </div>
                    </div>

                    <p className="text-xl text-slate-300 mb-6 max-w-3xl">
                        🛡️ <strong className="text-purple-400">Insure Your Bags</strong>, <strong className="text-pink-400">Protect Your Dreams</strong> 🚀<br/>
                        The first AI-powered insurance protocol meme token on Cardano. Diamond hands guaranteed! 💎🙌
                    </p>

                    {/* Live Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                            <div className="text-sm text-slate-400 mb-1">Price</div>
                            <div className="text-2xl font-bold text-white">${formatPrice(price)}</div>
                            <div className={`text-sm font-bold flex items-center gap-1 ${priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {priceChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(priceChange).toFixed(2)}% (24h)
                            </div>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                            <div className="text-sm text-slate-400 mb-1">Market Cap</div>
                            <div className="text-2xl font-bold text-white">${(marketCap / 1000000).toFixed(2)}M</div>
                            <div className="text-sm text-slate-500">1T Total Supply</div>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                            <div className="text-sm text-slate-400 mb-1">24h Volume</div>
                            <div className="text-2xl font-bold text-white">${(volume24h / 1000).toFixed(1)}K</div>
                            <div className="text-sm text-emerald-400">↑ All-time high!</div>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                            <div className="text-sm text-slate-400 mb-1">Holders</div>
                            <div className="text-2xl font-bold text-white">{holders.toLocaleString()}</div>
                            <div className="text-sm text-cyan-400 flex items-center gap-1">
                                <Users size={12} /> Growing fast!
                            </div>
                        </div>
                    </div>

                    {/* Contract Address */}
                    <div className="mt-4 p-4 bg-slate-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="text-xs text-slate-500 mb-1">Policy ID</div>
                                <code className="text-sm font-mono text-purple-400">{POLICY_ID}</code>
                            </div>
                            <button
                                onClick={copyAddress}
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="relative z-10 border-b border-slate-800 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex gap-2">
                        {[
                            { id: 'overview', label: 'Overview', icon: Rocket },
                            { id: 'tokenomics', label: 'Tokenomics', icon: PieChart },
                            { id: 'roadmap', label: 'Roadmap', icon: Target },
                            { id: 'team', label: 'Team', icon: Users }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-4 font-bold transition-all flex items-center gap-2 border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-purple-500 text-purple-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {React.createElement(tab.icon, { size: 18 })}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 overflow-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-enter">
                            {/* Why HYP? */}
                            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-2xl p-6">
                                <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                                    <Sparkles className="text-yellow-400" />
                                    Why HYPERION Coin?
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        {
                                            icon: Shield,
                                            title: 'Insurance-Backed',
                                            desc: 'First meme coin backed by real insurance protocol revenue'
                                        },
                                        {
                                            icon: Zap,
                                            title: 'Lightning Fast',
                                            desc: 'Built on Cardano for instant, low-fee transactions'
                                        },
                                        {
                                            icon: Users,
                                            title: 'Community First',
                                            desc: '40% of supply dedicated to community rewards and airdrops'
                                        },
                                        {
                                            icon: Lock,
                                            title: 'Locked Liquidity',
                                            desc: 'LP tokens locked for 12 months, rug-pull impossible'
                                        }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {React.createElement(item.icon, { size: 20, className: 'text-white' })}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                                                    <p className="text-sm text-slate-400">{item.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* How to Buy */}
                            <div className="bg-slate-900/50 border border-cyan-500/50 rounded-2xl p-6">
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <Wallet className="text-cyan-400" />
                                    How to Buy $HYP
                                </h2>
                                <div className="grid md:grid-cols-4 gap-4">
                                    {[
                                        { step: '1', title: 'Get ADA', desc: 'Buy Cardano (ADA) on any exchange' },
                                        { step: '2', title: 'Setup Wallet', desc: 'Install Nami, Eternl, or Lace wallet' },
                                        { step: '3', title: 'Go to DEX', desc: 'Visit SundaeSwap or Minswap' },
                                        { step: '4', title: 'Swap', desc: 'Exchange ADA for $HYP tokens' }
                                    ].map((item, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {item.step}
                                            </div>
                                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 pt-6">
                                                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                                <p className="text-sm text-slate-400">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Whitepaper */}
                            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/50 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                            <FileText className="text-orange-400" />
                                            Read Our Whitepaper
                                        </h2>
                                        <p className="text-slate-400">Learn everything about HYPERION Coin's vision, tokenomics, and future plans</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowWhitepaper(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                                    >
                                        <FileText size={20} />
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tokenomics Tab */}
                    {activeTab === 'tokenomics' && (
                        <div className="space-y-6 animate-enter">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl font-bold text-white mb-2">Token Distribution</h2>
                                <p className="text-xl text-slate-400">Total Supply: <span className="text-purple-400 font-bold">1,000,000,000,000 HYP</span></p>
                            </div>

                            {/* Pie Chart Visualization */}
                            <div className="bg-slate-900/50 border border-purple-500/50 rounded-2xl p-8">
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    {/* Chart */}
                                    <div className="relative w-80 h-80 mx-auto">
                                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                            {(() => {
                                                let cumulative = 0;
                                                return TOKENOMICS.map((item, i) => {
                                                    const start = cumulative;
                                                    cumulative += item.percentage;
                                                    const largeArc = item.percentage > 50 ? 1 : 0;
                                                    const x1 = 50 + 45 * Math.cos(2 * Math.PI * start / 100);
                                                    const y1 = 50 + 45 * Math.sin(2 * Math.PI * start / 100);
                                                    const x2 = 50 + 45 * Math.cos(2 * Math.PI * cumulative / 100);
                                                    const y2 = 50 + 45 * Math.sin(2 * Math.PI * cumulative / 100);
                                                    
                                                    return (
                                                        <path
                                                            key={i}
                                                            d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                            className={`fill-gradient-to-br ${item.color} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                                                            fill={`url(#gradient-${i})`}
                                                        />
                                                    );
                                                });
                                            })()}
                                        </svg>
                                        <defs>
                                            {TOKENOMICS.map((item, i) => (
                                                <linearGradient key={i} id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor={item.color.split(' ')[0].replace('from-', '')} />
                                                    <stop offset="100%" stopColor={item.color.split(' ')[2].replace('to-', '')} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">💎</div>
                                                <div className="text-2xl font-bold text-white">1T HYP</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="space-y-3">
                                        {TOKENOMICS.map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setExpandedTokenomics(expandedTokenomics === i ? null : i)}
                                                className="w-full text-left"
                                            >
                                                <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-purple-500 transition-all ${expandedTokenomics === i ? 'border-purple-500' : ''}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${item.color}`} />
                                                            <span className="font-bold text-white">{item.category}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl font-bold text-purple-400">{item.percentage}%</span>
                                                            {expandedTokenomics === i ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                                        </div>
                                                    </div>
                                                    {expandedTokenomics === i && (
                                                        <div className="mt-3 pt-3 border-t border-slate-700 animate-enter">
                                                            <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-slate-500">Amount: <strong className="text-white">{item.amount}</strong></span>
                                                                {item.lockPeriod && (
                                                                    <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400">
                                                                        🔒 {item.lockPeriod}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Roadmap Tab */}
                    {activeTab === 'roadmap' && (
                        <div className="space-y-6 animate-enter">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl font-bold text-white mb-2">Project Roadmap</h2>
                                <p className="text-xl text-slate-400">Our journey to the moon 🚀🌙</p>
                            </div>

                            <div className="space-y-6">
                                {ROADMAP.map((phase, i) => (
                                    <div
                                        key={i}
                                        className={`relative border-l-4 pl-8 pb-8 ${
                                            phase.status === 'completed' ? 'border-emerald-500' :
                                            phase.status === 'in-progress' ? 'border-cyan-500' :
                                            'border-slate-700'
                                        }`}
                                    >
                                        <div className={`absolute -left-4 w-8 h-8 rounded-full flex items-center justify-center ${
                                            phase.status === 'completed' ? 'bg-emerald-500' :
                                            phase.status === 'in-progress' ? 'bg-cyan-500 animate-pulse' :
                                            'bg-slate-700'
                                        }`}>
                                            {phase.status === 'completed' ? <Check size={16} className="text-white" /> :
                                             phase.status === 'in-progress' ? <Zap size={16} className="text-white" /> :
                                             <Moon size={16} className="text-slate-400" />}
                                        </div>

                                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="text-sm text-slate-500 mb-1">{phase.quarter}</div>
                                                    <h3 className="text-2xl font-bold text-white mb-1">{phase.phase}</h3>
                                                    <p className="text-lg text-purple-400">{phase.title}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    phase.status === 'completed' ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' :
                                                    phase.status === 'in-progress' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' :
                                                    'bg-slate-700/50 border border-slate-600 text-slate-400'
                                                }`}>
                                                    {phase.status === 'completed' ? '✅ DONE' :
                                                     phase.status === 'in-progress' ? '🔄 IN PROGRESS' :
                                                     '⏳ UPCOMING'}
                                                </span>
                                            </div>

                                            <ul className="space-y-2">
                                                {phase.items.map((item, j) => (
                                                    <li key={j} className="text-slate-300 flex items-start gap-2">
                                                        <span className="text-lg">{item.split(' ')[0]}</span>
                                                        <span>{item.substring(item.indexOf(' ') + 1)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team Tab */}
                    {activeTab === 'team' && (
                        <div className="space-y-6 animate-enter">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl font-bold text-white mb-2">Meet the Team</h2>
                                <p className="text-xl text-slate-400">The legends building the future 🚀</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {TEAM.map((member, i) => (
                                    <div
                                        key={i}
                                        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500 transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
                                                {member.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                                                <p className="text-purple-400 font-medium mb-2">{member.role}</p>
                                                <p className="text-sm text-slate-400">{member.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Community Stats */}
                            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-2xl p-8 mt-8">
                                <h3 className="text-2xl font-bold text-white mb-6 text-center">Join Our Community</h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {[
                                        { platform: 'Twitter', count: '15.2K', icon: Twitter, color: 'cyan' },
                                        { platform: 'Telegram', count: '8.7K', icon: Send, color: 'blue' },
                                        { platform: 'Discord', count: '12.4K', icon: MessageCircle, color: 'purple' }
                                    ].map((social, i) => (
                                        <button
                                            key={i}
                                            className="bg-slate-900/50 border border-slate-700 hover:border-purple-500 rounded-xl p-6 transition-all group"
                                        >
                                            <div className="flex items-center justify-center mb-3">
                                                {React.createElement(social.icon, {
                                                    size: 32,
                                                    className: `text-${social.color}-400 group-hover:scale-110 transition-transform`
                                                })}
                                            </div>
                                            <div className="text-sm text-slate-400 mb-1">{social.platform}</div>
                                            <div className="text-2xl font-bold text-white">{social.count} Members</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
                <button className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-lg shadow-purple-500/50 flex items-center justify-center text-white transition-all hover:scale-110">
                    <ShoppingCart size={24} />
                </button>
                <button className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-full shadow-lg shadow-cyan-500/50 flex items-center justify-center text-white transition-all hover:scale-110">
                    <Heart size={24} />
                </button>
            </div>

            {/* Whitepaper Modal */}
            {showWhitepaper && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowWhitepaper(false)}>
                    <div className="bg-slate-900 border border-purple-500 rounded-2xl max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white">HYPERION Whitepaper</h3>
                            <button onClick={() => setShowWhitepaper(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4 text-slate-300">
                            <p>📄 <strong>Version 1.0</strong> - November 2024</p>
                            <p>The complete technical documentation, tokenomics breakdown, and project roadmap.</p>
                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 my-4">
                                <p className="text-sm text-yellow-400">
                                    ⚠️ This is a demo feature. The actual whitepaper would be available as a downloadable PDF.
                                </p>
                            </div>
                            <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                                <FileText size={20} />
                                Download Whitepaper (Demo)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
