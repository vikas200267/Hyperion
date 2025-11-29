'use client';

import { useState } from 'react';
import { usePhase5Wallet } from '@/context/WalletProvider';
import { 
  Wallet, 
  Zap, 
  Shield, 
  ChevronRight, 
  Lock,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (mode: 'demo' | 'wallet', address?: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedMode, setSelectedMode] = useState<'demo' | 'wallet' | null>(null);
  const { 
    connected, 
    connecting, 
    walletAddress,
    availableWallets,
    connectWallet,
    error 
  } = usePhase5Wallet();

  // Auto-login when wallet connects
  if (connected && walletAddress && selectedMode === 'wallet') {
    setTimeout(() => onLogin('wallet', walletAddress), 500);
  }

  const handleDemoLogin = () => {
    setSelectedMode('demo');
    setTimeout(() => onLogin('demo'), 300);
  };

  const handleWalletConnect = async (walletName: string) => {
    setSelectedMode('wallet');
    try {
      await connectWallet(walletName as any);
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  };

  const installedWallets = availableWallets.filter(w => w.isInstalled);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')]" style={{ opacity: 0.1 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-blue-500/5" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              PROJECT HYPERION
            </h1>
          </div>
          <p className="text-xl text-slate-400 mb-2">AI-Powered Parametric Insurance Protocol</p>
          <p className="text-sm text-slate-500">Decentralized • Automated • Trustless</p>
        </div>

        {/* Login Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Demo Account Card */}
          <div 
            className={`group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-2 rounded-2xl p-8 backdrop-blur-xl transition-all duration-500 cursor-pointer ${
              selectedMode === 'demo' 
                ? 'border-purple-500 shadow-2xl shadow-purple-500/25 scale-105' 
                : 'border-slate-700 hover:border-purple-500/50 hover:scale-102'
            }`}
            onClick={handleDemoLogin}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400">INSTANT ACCESS</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-3">Demo Account</h2>
              
              {/* Description */}
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Explore all features instantly with a simulated account. Perfect for testing the platform without connecting a wallet.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  2,500 ADA Virtual Balance
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  All Features Unlocked
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  No Wallet Required
                </div>
              </div>

              {/* Button */}
              <button
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-purple-500/50"
              >
                Start Demo Mode
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Wallet Connection Card */}
          <div 
            className={`group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-2 rounded-2xl p-8 backdrop-blur-xl transition-all duration-500 ${
              selectedMode === 'wallet' 
                ? 'border-cyan-500 shadow-2xl shadow-cyan-500/25 scale-105' 
                : 'border-slate-700 hover:border-cyan-500/50 hover:scale-102'
            }`}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-8 h-8 text-white" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full mb-4">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400">BLOCKCHAIN SECURED</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-3">Connect Wallet</h2>
              
              {/* Description */}
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Connect your Cardano wallet for real transactions, live blockchain data, and actual ADA balance.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  Real ADA Balance
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  Live Blockchain Data
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  Secure & Decentralized
                </div>
              </div>

              {/* Wallet Buttons */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-xs text-red-400">
                  {error}
                </div>
              )}

              {installedWallets.length > 0 ? (
                <div className="space-y-2">
                  {installedWallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => handleWalletConnect(wallet.name)}
                      disabled={connecting}
                      className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 font-medium rounded-xl transition-all duration-300 flex items-center justify-between px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{wallet.icon}</span>
                        <span>{wallet.displayName}</span>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
                    <p className="text-sm text-slate-400 mb-3">No wallets detected. Install one:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Nami', 'Eternl', 'Lace', 'Flint'].map((name) => (
                        <a
                          key={name}
                          href={`https://${name.toLowerCase()}${name === 'Nami' ? 'wallet' : ''}.io`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-cyan-400 transition-colors"
                        >
                          {name} →
                        </a>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-medium rounded-xl transition-all duration-300"
                  >
                    Refresh After Installing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-2xl font-bold text-white">$2.4M</div>
              <div className="text-xs text-slate-500">Total Value Locked</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-2xl font-bold text-white">8</div>
              <div className="text-xs text-slate-500">AI Agents Active</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">1,247</div>
              <div className="text-xs text-slate-500">Policies Issued</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
