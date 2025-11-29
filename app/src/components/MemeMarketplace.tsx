// ═══════════════════════════════════════════════════════════════════════════
// PROJECT HYPERION - MEME COIN MARKETPLACE
// ═══════════════════════════════════════════════════════════════════════════
// Cardano-based Meme Token Trading & Staking
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Flame, Sparkles, Rocket, Star, ShoppingCart, Wallet, ArrowUpRight, ArrowDownRight, Zap, Crown, Gift, ExternalLink } from 'lucide-react';
import { HyperionMeme } from './HyperionMeme';

interface MemeCoin {
    id: string;
    name: string;
    symbol: string;
    icon: string;
    price: number;
    priceChange24h: number;
    marketCap: number;
    volume24h: number;
    holders: number;
    policyId: string;
    description: string;
    trending: boolean;
    featured: boolean;
}

const CARDANO_MEME_COINS: MemeCoin[] = [
    {
        id: 'snek',
        name: 'Snek',
        symbol: 'SNEK',
        icon: '🐍',
        price: 0.00095,
        priceChange24h: 15.3,
        marketCap: 42500000,
        volume24h: 3200000,
        holders: 58420,
        policyId: '279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f',
        description: 'The most popular snek on Cardano. Community-driven meme token.',
        trending: true,
        featured: true
    },
    {
        id: 'hosky',
        name: 'Hosky',
        symbol: 'HOSKY',
        icon: '🐕',
        price: 0.000000045,
        priceChange24h: -3.2,
        marketCap: 18900000,
        volume24h: 890000,
        holders: 42150,
        policyId: 'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
        description: 'Hosky Token - The memecoin that started it all on Cardano!',
        trending: true,
        featured: false
    },
    {
        id: 'sundae',
        name: 'SundaeSwap',
        symbol: 'SUNDAE',
        icon: '🍦',
        price: 0.0142,
        priceChange24h: 8.7,
        marketCap: 28400000,
        volume24h: 1450000,
        holders: 35680,
        policyId: '9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77',
        description: 'Governance token for SundaeSwap DEX with meme energy!',
        trending: false,
        featured: true
    },
    {
        id: 'addy',
        name: 'ADDYcoin',
        symbol: 'ADDY',
        icon: '🦁',
        price: 0.0038,
        priceChange24h: 22.5,
        marketCap: 15200000,
        volume24h: 620000,
        holders: 12840,
        policyId: 'c04f4200502a998e9eebafac0291a1f38008de3fe146d136946d8f4b',
        description: 'The Cardano mascot token. ROAR with the community!',
        trending: true,
        featured: false
    },
    {
        id: 'clay',
        name: 'Clay Nation',
        symbol: 'CLAY',
        icon: '🎨',
        price: 0.156,
        priceChange24h: -1.8,
        marketCap: 8950000,
        volume24h: 340000,
        holders: 8420,
        policyId: '40fa2aa67258b4ce7b5782f74831d46a84c59a0ff0c28262fab21728',
        description: 'Clay Nation NFT ecosystem token with meme potential.',
        trending: false,
        featured: false
    },
    {
        id: 'wmt',
        name: 'World Mobile Token',
        symbol: 'WMT',
        icon: '🌍',
        price: 0.089,
        priceChange24h: 5.4,
        marketCap: 45600000,
        volume24h: 2100000,
        holders: 28340,
        policyId: '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e',
        description: 'Connecting the unconnected with blockchain technology!',
        trending: false,
        featured: true
    },
    {
        id: 'copi',
        name: 'Cornucopias',
        symbol: 'COPI',
        icon: '🎮',
        price: 0.0234,
        priceChange24h: 12.8,
        marketCap: 22300000,
        volume24h: 980000,
        holders: 15670,
        policyId: '5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc928434894350',
        description: 'Gaming metaverse token on Cardano. Play to earn!',
        trending: true,
        featured: false
    },
    {
        id: 'meld',
        name: 'MELD',
        symbol: 'MELD',
        icon: '🏦',
        price: 0.0018,
        priceChange24h: -5.6,
        marketCap: 12800000,
        volume24h: 450000,
        holders: 22180,
        policyId: '6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d104d454c44',
        description: 'DeFi banking protocol on Cardano blockchain.',
        trending: false,
        featured: false
    }
];

export function MemeMarketplace() {
    const [selectedCoin, setSelectedCoin] = useState<MemeCoin | null>(null);
    const [sortBy, setSortBy] = useState<'trending' | 'price' | 'volume' | 'holders'>('trending');
    const [filterFeatured, setFilterFeatured] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [portfolio, setPortfolio] = useState<{[key: string]: number}>({});
    const [buyAmount, setBuyAmount] = useState('');
    const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'hyperion'>('market');

    const sortedCoins = [...CARDANO_MEME_COINS].sort((a, b) => {
        if (sortBy === 'trending') return b.volume24h - a.volume24h;
        if (sortBy === 'price') return b.price - a.price;
        if (sortBy === 'volume') return b.volume24h - a.volume24h;
        if (sortBy === 'holders') return b.holders - a.holders;
        return 0;
    }).filter(coin => {
        const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = !filterFeatured || coin.featured;
        return matchesSearch && matchesFilter;
    });

    const handleBuy = (coin: MemeCoin) => {
        const amount = parseFloat(buyAmount);
        if (!isNaN(amount) && amount > 0) {
            setPortfolio(prev => ({
                ...prev,
                [coin.id]: (prev[coin.id] || 0) + amount
            }));
            setBuyAmount('');
            setSelectedCoin(null);
        }
    };

    const portfolioValue = Object.entries(portfolio).reduce((total, [coinId, amount]) => {
        const coin = CARDANO_MEME_COINS.find(c => c.id === coinId);
        return total + (coin ? coin.price * amount : 0);
    }, 0);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    const formatPrice = (price: number) => {
        if (price < 0.000001) return `$${price.toExponential(2)}`;
        if (price < 0.01) return `$${price.toFixed(6)}`;
        return `$${price.toFixed(4)}`;
    };

    return (
        <div className="h-full flex flex-col bg-slate-950">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Rocket className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Meme Marketplace</h2>
                            <p className="text-sm text-slate-400">Cardano's Hottest Meme Tokens 🚀</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('hyperion')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                activeTab === 'hyperion'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-purple-500/30'
                            }`}
                        >
                            <Rocket size={16} />
                            🚀 $HYP Token
                            <Sparkles size={14} className="text-yellow-400" />
                        </button>
                        <button
                            onClick={() => setActiveTab('market')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                activeTab === 'market'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            Market
                        </button>
                        <button
                            onClick={() => setActiveTab('portfolio')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                activeTab === 'portfolio'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            <Wallet size={16} />
                            Portfolio {portfolioValue > 0 && `(${formatNumber(portfolioValue)})`}
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Flame className="text-orange-400" size={16} />
                            <span className="text-xs text-slate-400">Total Market Cap</span>
                        </div>
                        <div className="text-lg font-bold text-white">
                            ${(CARDANO_MEME_COINS.reduce((sum, c) => sum + c.marketCap, 0) / 1000000).toFixed(2)}M
                        </div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="text-cyan-400" size={16} />
                            <span className="text-xs text-slate-400">24h Volume</span>
                        </div>
                        <div className="text-lg font-bold text-white">
                            ${(CARDANO_MEME_COINS.reduce((sum, c) => sum + c.volume24h, 0) / 1000000).toFixed(2)}M
                        </div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Star className="text-yellow-400" size={16} />
                            <span className="text-xs text-slate-400">Trending Coins</span>
                        </div>
                        <div className="text-lg font-bold text-white">
                            {CARDANO_MEME_COINS.filter(c => c.trending).length}
                        </div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Crown className="text-purple-400" size={16} />
                            <span className="text-xs text-slate-400">Your Holdings</span>
                        </div>
                        <div className="text-lg font-bold text-white">
                            {Object.keys(portfolio).length} Coins
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/30">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search meme coins..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="trending">🔥 Trending</option>
                        <option value="price">💰 Price</option>
                        <option value="volume">📊 Volume</option>
                        <option value="holders">👥 Holders</option>
                    </select>
                    <button
                        onClick={() => setFilterFeatured(!filterFeatured)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                            filterFeatured
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        <Star size={16} />
                        Featured
                    </button>
                </div>
            </div>

            {/* Market Tab */}
            {activeTab === 'market' && (
                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {sortedCoins.map((coin) => (
                            <div
                                key={coin.id}
                                className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4 hover:border-purple-500 transition-all cursor-pointer group"
                                onClick={() => setSelectedCoin(coin)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-4xl">{coin.icon}</div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-white">{coin.name}</h3>
                                                {coin.trending && (
                                                    <span className="px-2 py-0.5 bg-orange-500/20 border border-orange-500/50 rounded text-xs text-orange-400 flex items-center gap-1">
                                                        <Flame size={10} /> HOT
                                                    </span>
                                                )}
                                                {coin.featured && (
                                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400">{coin.symbol}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-bold ${
                                        coin.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                        {coin.priceChange24h >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {Math.abs(coin.priceChange24h).toFixed(1)}%
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{coin.description}</p>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-slate-800/50 rounded-lg p-2">
                                        <div className="text-xs text-slate-500">Price</div>
                                        <div className="text-sm font-bold text-white">{formatPrice(coin.price)}</div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-2">
                                        <div className="text-xs text-slate-500">Market Cap</div>
                                        <div className="text-sm font-bold text-white">{formatNumber(coin.marketCap)}</div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-2">
                                        <div className="text-xs text-slate-500">24h Volume</div>
                                        <div className="text-sm font-bold text-white">{formatNumber(coin.volume24h)}</div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-2">
                                        <div className="text-xs text-slate-500">Holders</div>
                                        <div className="text-sm font-bold text-white">{coin.holders.toLocaleString()}</div>
                                    </div>
                                </div>

                                <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105">
                                    <ShoppingCart size={16} />
                                    Buy {coin.symbol}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
                <div className="flex-1 overflow-auto p-4">
                    {Object.keys(portfolio).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <Gift size={64} className="text-slate-600 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Holdings Yet</h3>
                            <p className="text-slate-400 mb-4">Start buying meme coins to build your portfolio!</p>
                            <button
                                onClick={() => setActiveTab('market')}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg"
                            >
                                Explore Market
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-xl p-4 mb-4">
                                <h3 className="text-sm text-slate-400 mb-1">Total Portfolio Value</h3>
                                <div className="text-3xl font-bold text-white">{formatNumber(portfolioValue)}</div>
                            </div>

                            {Object.entries(portfolio).map(([coinId, amount]) => {
                                const coin = CARDANO_MEME_COINS.find(c => c.id === coinId);
                                if (!coin) return null;
                                const value = coin.price * amount;
                                return (
                                    <div key={coinId} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="text-3xl">{coin.icon}</div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-white">{coin.name}</h4>
                                                    <p className="text-sm text-slate-400">{amount.toLocaleString()} {coin.symbol}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-white">{formatNumber(value)}</div>
                                                <div className={`text-sm font-medium ${
                                                    coin.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                    {coin.priceChange24h >= 0 ? '+' : ''}{coin.priceChange24h.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Hyperion Coin Tab */}
            {activeTab === 'hyperion' && (
                <HyperionMeme />
            )}

            {/* Buy Modal */}
            {selectedCoin && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-5xl">{selectedCoin.icon}</div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-white">{selectedCoin.name}</h3>
                                <p className="text-slate-400">{selectedCoin.symbol}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCoin(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Current Price</span>
                                <span className="text-lg font-bold text-white">{formatPrice(selectedCoin.price)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">24h Change</span>
                                <span className={`text-sm font-bold ${
                                    selectedCoin.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                    {selectedCoin.priceChange24h >= 0 ? '+' : ''}{selectedCoin.priceChange24h.toFixed(2)}%
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-slate-400 mb-2">Amount to Buy</label>
                            <input
                                type="number"
                                value={buyAmount}
                                onChange={(e) => setBuyAmount(e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg focus:outline-none focus:border-purple-500"
                            />
                            {buyAmount && (
                                <p className="text-sm text-slate-500 mt-2">
                                    Total: {formatNumber(parseFloat(buyAmount) * selectedCoin.price)}
                                </p>
                            )}
                        </div>

                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 mb-4">
                            <p className="text-xs text-yellow-400">
                                ⚠️ This is a demo feature. No real transactions will be made.
                            </p>
                        </div>

                        <button
                            onClick={() => handleBuy(selectedCoin)}
                            disabled={!buyAmount || parseFloat(buyAmount) <= 0}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={18} />
                            Buy {selectedCoin.symbol}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
