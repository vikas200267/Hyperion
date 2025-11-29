'use client';

import { useEffect, useState } from 'react';

export function WalletDebug() {
  const [cardanoObj, setCardanoObj] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkWallets = () => {
      if (typeof window !== 'undefined') {
        setCardanoObj((window as any).cardano);
      }
    };

    checkWallets();
    const interval = setInterval(checkWallets, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-400 transition-colors z-50"
      >
        Debug Wallets
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 max-h-96 overflow-auto bg-slate-900 border border-slate-700 rounded-lg p-4 text-xs font-mono z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-cyan-400 font-bold">Wallet Detection Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <div className="text-slate-500">window.cardano exists:</div>
          <div className="text-white">{cardanoObj ? 'YES ✓' : 'NO ✗'}</div>
        </div>
        
        {cardanoObj && (
          <>
            <div>
              <div className="text-slate-500">Detected wallets:</div>
              <div className="text-white">
                {Object.keys(cardanoObj).map(key => (
                  <div key={key} className="ml-2">
                    • {key} {cardanoObj[key]?.name ? `(${cardanoObj[key].name})` : ''}
                    {cardanoObj[key]?.apiVersion && ` - v${cardanoObj[key].apiVersion}`}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        <div>
          <div className="text-slate-500">Checking for:</div>
          <div className="text-white space-y-1">
            {['nami', 'eternl', 'lace', 'flint', 'typhon', 'yoroi'].map(wallet => (
              <div key={wallet} className="ml-2">
                • {wallet}: {cardanoObj?.[wallet] ? '✓ Found' : '✗ Not found'}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700">
          <div className="text-slate-500 mb-1">Raw cardano object:</div>
          <pre className="text-[10px] text-slate-400 overflow-auto max-h-32 bg-slate-950 p-2 rounded">
            {cardanoObj ? JSON.stringify(
              Object.keys(cardanoObj).reduce((acc, key) => {
                acc[key] = {
                  name: cardanoObj[key]?.name,
                  apiVersion: cardanoObj[key]?.apiVersion,
                  icon: cardanoObj[key]?.icon ? 'present' : 'missing'
                };
                return acc;
              }, {} as any),
              null,
              2
            ) : 'null'}
          </pre>
        </div>
      </div>
    </div>
  );
}
