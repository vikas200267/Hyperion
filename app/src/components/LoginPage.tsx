'use client';

import { useState } from 'react';
import { usePhase5Wallet } from '@/context/WalletProvider';
import { 
  Wallet, 
  Zap, 
  Shield, 
  ArrowRight, 
  Sparkles,
  Globe,
  Lock,
  CheckCircle2,
  User
} from 'lucide-react';

interface LoginPageProps {
  onDemoLogin: () => void;
}

export function LoginPage({ onDemoLogin }: LoginPageProps) {
  const [selectedMode, setSelectedMode] = useState<'demo' | 'wallet' | null>(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  
  const { 
    connected, 
    connecting, 
    availableWallets,
    connectWallet,
    error 
  } = usePhase5Wallet();

  if (connected) {
    // Wallet connected successfully, parent will handle navigation
    return null;
  }

  const handleDemoClick = () => {
    setSelectedMode('demo');
    setTimeout(() => {
      onDemoLogin();
    }, 600);
  };

  const handleWalletClick = () => {
    setSelectedMode('wallet');
    setShowWalletOptions(true);
  };

  const installedWallets = availableWallets.filter(w => w.isInstalled);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Creamy White Background with Bright Colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50" />
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, rgba(255,100,100,0.1) 2px, transparent 2px)', backgroundSize: '40px 40px'}} />
      
      {/* Floating color circles */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}} />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Shield className="h-20 w-20 text-orange-600 animate-bounce" />
            <h1 className="text-7xl font-black text-black uppercase" style={{fontFamily: 'monospace', letterSpacing: '4px'}}>
              PROJECT HYPERION
            </h1>
          </div>
          <p className="text-3xl text-black mb-3 font-black uppercase">⚡ AI-Powered Parametric Insurance ⚡</p>
          <p className="text-lg text-black font-black uppercase tracking-widest">🔒 Decentralized • 🤖 Automated • 💎 Trustless</p>
        </div>

        {/* Login Options */}
        {!showWalletOptions ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Demo Mode Card */}
            <div
              onClick={handleDemoClick}
              className={`group relative p-8 border-4 cursor-pointer transition-all duration-300 ${
                selectedMode === 'demo'
                  ? 'border-purple-600 bg-purple-500 scale-105'
                  : 'border-purple-500 bg-white hover:border-purple-600 hover:shadow-xl'
              }`}
            >
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-pink-500 border-3 border-white shadow-lg">
                    <Sparkles className={`h-10 w-10 ${selectedMode === 'demo' ? 'text-white' : 'text-white'}`} />
                  </div>
                  <span className="px-4 py-2 bg-purple-600 text-white text-xs font-black border-3 border-white uppercase tracking-wider shadow-md">
                    🎮 DEMO
                  </span>
                </div>

                <h3 className={`text-3xl font-black mb-3 uppercase ${selectedMode === 'demo' ? 'text-white' : 'text-black'}`}>Demo Mode</h3>
                <p className={`mb-6 font-bold ${selectedMode === 'demo' ? 'text-purple-100' : 'text-gray-700'}`}>
                  Explore with <span className="text-yellow-500 font-black">test money</span> 💰 and simulated data. Perfect for learning! 🎓
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <div className={`font-black ${selectedMode === 'demo' ? 'text-white' : 'text-gray-800'}`}>2,500 ADA Test Balance</div>
                      <div className={`text-xs ${selectedMode === 'demo' ? 'text-purple-200' : 'text-gray-600'}`}>Simulated funds only 🪙</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <div className={`font-black ${selectedMode === 'demo' ? 'text-white' : 'text-gray-800'}`}>Instant Access</div>
                      <div className={`text-xs ${selectedMode === 'demo' ? 'text-purple-200' : 'text-gray-600'}`}>No wallet needed ⚡</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <div className={`font-black ${selectedMode === 'demo' ? 'text-white' : 'text-gray-800'}`}>Full Feature Testing</div>
                      <div className={`text-xs ${selectedMode === 'demo' ? 'text-purple-200' : 'text-gray-600'}`}>Create & test policies 🎯</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <div className={`font-black ${selectedMode === 'demo' ? 'text-white' : 'text-gray-800'}`}>Zero Risk</div>
                      <div className={`text-xs ${selectedMode === 'demo' ? 'text-purple-200' : 'text-gray-600'}`}>All transactions simulated</div>
                    </div>
                  </li>
                </ul>

                <button
                  className={`w-full py-3 px-4 font-black flex items-center justify-center gap-2 transition-all duration-300 shadow-lg border-2 ${
                    selectedMode === 'demo'
                      ? 'bg-white text-purple-600 border-white'
                      : 'bg-purple-500 text-white border-purple-600 hover:bg-purple-600'
                  }`}
                >
                  <User className="h-5 w-5" />
                  Start Demo
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Real Wallet Card */}
            <div
              onClick={handleWalletClick}
              className={`group relative p-8 border-4 cursor-pointer transition-all duration-300 ${
                selectedMode === 'wallet'
                  ? 'border-blue-600 bg-blue-500 scale-105'
                  : 'border-blue-500 bg-white hover:border-blue-600 hover:shadow-xl'
              }`}
            >
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-blue-500 border-3 border-white shadow-lg">
                    <Wallet className="h-10 w-10 text-white" />
                  </div>
                  <span className="px-4 py-2 bg-blue-600 text-white text-xs font-black border-3 border-white uppercase tracking-wider shadow-md">
                    🔐 LIVE
                  </span>
                </div>

                <h3 className={`text-3xl font-black mb-3 uppercase ${selectedMode === 'wallet' ? 'text-white' : 'text-black'}`}>Connect Wallet</h3>
                <p className={`mb-6 font-bold ${selectedMode === 'wallet' ? 'text-blue-100' : 'text-gray-700'}`}>
                  Use your <span className="text-orange-500 font-black">real Cardano wallet</span> 🔐 for actual blockchain transactions and coverage.
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <div className={`font-black ${selectedMode === 'wallet' ? 'text-white' : 'text-gray-800'}`}>Real ADA Balance</div>
                      <div className={`text-xs ${selectedMode === 'wallet' ? 'text-blue-200' : 'text-gray-600'}`}>Your actual wallet funds 💰</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <div className={`font-black ${selectedMode === 'wallet' ? 'text-white' : 'text-gray-800'}`}>Live Blockchain</div>
                      <div className={`text-xs ${selectedMode === 'wallet' ? 'text-blue-200' : 'text-gray-600'}`}>Cardano Preprod network ⛓️</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <div className={`font-black ${selectedMode === 'wallet' ? 'text-white' : 'text-gray-800'}`}>Actual Coverage</div>
                      <div className={`text-xs ${selectedMode === 'wallet' ? 'text-blue-200' : 'text-gray-600'}`}>Real insurance policies 🛡️</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <div className={`font-black ${selectedMode === 'wallet' ? 'text-white' : 'text-gray-800'}`}>Smart Contracts</div>
                      <div className={`text-xs ${selectedMode === 'wallet' ? 'text-blue-200' : 'text-gray-600'}`}>Automated on-chain payouts 🤖</div>
                    </div>
                  </li>
                </ul>

                <button
                  className={`w-full py-3 px-4 font-black flex items-center justify-center gap-2 transition-all duration-300 shadow-lg border-2 ${
                    selectedMode === 'wallet'
                      ? 'bg-white text-blue-600 border-white'
                      : 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
                  }`}
                >
                  <Lock className="h-5 w-5" />
                  Connect Wallet
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Wallet Selection Screen
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => {
                setShowWalletOptions(false);
                setSelectedMode(null);
              }}
              className="mb-6 text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2 font-bold"
            >
              ← Back to options
            </button>

            <div className="p-8 border-4 border-blue-500 bg-white shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-blue-500 border-3 border-white shadow-lg mb-4">
                  <Wallet className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-black text-black mb-2 uppercase">Select Your Wallet</h2>
                <p className="text-black font-bold">Choose a Cardano wallet to connect 🔗</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-100 border-3 border-red-500 shadow-md">
                  <p className="text-red-600 text-sm font-black">Connection Error</p>
                  <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {installedWallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => connectWallet(wallet.name as any)}
                    disabled={connecting}
                    className="w-full p-4 bg-white border-3 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{wallet.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-black text-gray-800 group-hover:text-blue-600 transition-colors">
                          {wallet.displayName}
                        </div>
                        <div className="text-xs text-gray-600 font-bold">
                          {wallet.apiVersion !== 'unknown' ? `API v${wallet.apiVersion}` : 'Installed'}
                        </div>
                      </div>
                      {connecting ? (
                        <div className="text-blue-600 text-sm font-black">Connecting...</div>
                      ) : (
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {installedWallets.length === 0 && (
                <div className="text-center py-8">
                  <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-black mb-2">No Wallets Detected</h3>
                  <p className="text-black text-sm mb-6 font-bold">
                    Install a Cardano wallet extension to continue 📥
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="https://namiwallet.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white hover:bg-purple-50 border-3 border-gray-300 hover:border-purple-500 transition-all group shadow-md"
                    >
                      <div className="text-2xl mb-1">🦎</div>
                      <div className="text-sm font-black text-gray-700 group-hover:text-purple-600">Nami</div>
                    </a>
                    <a
                      href="https://eternl.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white hover:bg-blue-50 border-3 border-gray-300 hover:border-blue-500 transition-all group shadow-md"
                    >
                      <div className="text-2xl mb-1">♾️</div>
                      <div className="text-sm font-black text-gray-700 group-hover:text-blue-600">Eternl</div>
                    </a>
                    <a
                      href="https://www.lace.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white hover:bg-pink-50 border-3 border-gray-300 hover:border-pink-500 transition-all group shadow-md"
                    >
                      <div className="text-2xl mb-1">🎀</div>
                      <div className="text-sm font-black text-gray-700 group-hover:text-pink-600">Lace</div>
                    </a>
                    <a
                      href="https://flint-wallet.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white hover:bg-orange-50 border-3 border-gray-300 hover:border-orange-500 transition-all group shadow-md"
                    >
                      <div className="text-2xl mb-1">🔥</div>
                      <div className="text-sm font-black text-gray-700 group-hover:text-orange-600">Flint</div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" /> Secure
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4" /> Instant
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" /> Decentralized
            </span>
          </div>
          <p>Powered by Cardano Blockchain • Built with Aiken Smart Contracts</p>
        </div>
      </div>
    </div>
  );
}
