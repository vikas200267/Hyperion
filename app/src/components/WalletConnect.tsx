'use client';

import { usePhase5Wallet } from '@/context/WalletProvider';
import { Wallet, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

export function WalletConnect() {
  const { 
    connected, 
    connecting, 
    walletAddress, 
    walletName,
    availableWallets,
    connectWallet, 
    disconnectWallet,
    getBalance,
    error 
  } = usePhase5Wallet();

  const [balance, setBalance] = useState<bigint | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [manualRefresh, setManualRefresh] = useState(0);

  // Fetch balance when connected
  useEffect(() => {
    if (connected && walletAddress) {
      const fetchBalance = async () => {
        try {
          setLoadingBalance(true);
          console.log('[WalletConnect] Fetching balance...');
          const bal = await getBalance();
          console.log('[WalletConnect] Balance fetched:', bal.toString());
          setBalance(bal);
        } catch (err) {
          console.error('[WalletConnect] Failed to fetch balance:', err);
        } finally {
          setLoadingBalance(false);
        }
      };

      fetchBalance();
      
      // Refresh balance every 10 seconds
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [connected, walletAddress, getBalance]);

  const formatBalance = (lovelace: bigint) => {
    const ada = Number(lovelace) / 1_000_000;
    return ada.toFixed(2);
  };

  const handleConnect = async (name: string) => {
    try {
      console.log('[WalletConnect] User clicked connect for:', name);
      await connectWallet(name as any);
    } catch (err) {
      console.error('[WalletConnect] Connection error:', err);
    }
  };

  if (connected && walletAddress) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-lg">
        <Wallet className="h-5 w-5 text-green-400" />
        <div className="flex flex-col">
          <span className="text-xs text-green-400 font-medium">
            {walletName?.toUpperCase()} Connected
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {walletAddress.slice(0, 12)}...{walletAddress.slice(-8)}
          </span>
        </div>
        {balance !== null && (
          <div className="ml-2 px-2 py-1 bg-slate-900/50 rounded border border-slate-700">
            <div className="flex items-center gap-1">
              {loadingBalance && <RefreshCw className="h-3 w-3 text-cyan-400 animate-spin" />}
              <span className="text-xs text-cyan-400 font-mono font-bold">
                {formatBalance(balance)} ADA
              </span>
            </div>
          </div>
        )}
        <button
          onClick={disconnectWallet}
          className="ml-2 px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const installedWallets = availableWallets.filter(w => w.isInstalled);
  
  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="px-4 py-3 bg-red-900/20 border border-red-500/50 rounded-lg text-xs text-red-400 max-w-md">
          <div className="font-bold mb-2 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            Connection Error
          </div>
          <div className="whitespace-pre-line leading-relaxed">
            {error}
          </div>
          {error.toLowerCase().includes('eternl') && (
            <div className="mt-3 pt-3 border-t border-red-500/30">
              <div className="text-yellow-400 font-semibold mb-1">Quick Fix:</div>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Download full Eternl app from <a href="https://eternl.io" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">eternl.io</a></li>
                <li>Create or restore a wallet in the app</li>
                <li>Go to Settings → dApp Connector → Enable it</li>
                <li>Refresh this page and connect again</li>
              </ol>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-3 w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-xs text-red-300 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 items-center">
        {installedWallets.map((wallet) => (
          <button
            key={wallet.name}
            onClick={() => handleConnect(wallet.name)}
            disabled={connecting}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">{wallet.icon}</span>
            <span className="text-sm text-cyan-400 font-medium">
              {connecting ? 'Connecting...' : wallet.displayName}
            </span>
          </button>
        ))}
        
        {installedWallets.length === 0 && (
          <div className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
            <div className="text-sm text-slate-300 font-medium mb-1">
              No Cardano Wallets Detected
            </div>
            <div className="text-xs text-slate-400 mb-2">
              Install a browser extension, then refresh this page:
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <a 
                href="https://namiwallet.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded text-xs text-cyan-400 transition-colors"
              >
                Nami →
              </a>
              <a 
                href="https://www.lace.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded text-xs text-cyan-400 transition-colors"
              >
                Lace →
              </a>
              <a 
                href="https://yoroi-wallet.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded text-xs text-cyan-400 transition-colors"
              >
                Yoroi →
              </a>
            </div>
            <button
              onClick={() => {
                console.log('[WalletConnect] Manual refresh triggered');
                setManualRefresh(prev => prev + 1);
                window.location.reload();
              }}
              className="w-full px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-xs text-cyan-400 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh Page After Installing Wallet
            </button>
          </div>
        )}

        {installedWallets.length > 0 && (
          <div className="text-xs text-slate-500">
            {installedWallets.length} wallet{installedWallets.length !== 1 ? 's' : ''} detected
          </div>
        )}
      </div>
    </div>
  );
}
