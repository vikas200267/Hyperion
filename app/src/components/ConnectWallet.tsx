/**
 * Placeholder component for wallet connection button
 * Will be implemented with @meshsdk/react
 */

'use client';

import { Wallet } from 'lucide-react';

interface ConnectWalletProps {
  onConnect?: () => void;
}

export default function ConnectWallet({ onConnect }: ConnectWalletProps) {
  return (
    <button
      onClick={onConnect}
      className="flex items-center gap-2 px-4 py-2 bg-hyperion-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      <Wallet className="h-5 w-5" />
      <span>Connect Wallet</span>
    </button>
  );
}
