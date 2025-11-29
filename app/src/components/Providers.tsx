'use client';

import { ReactNode } from 'react';
import { Phase5WalletProvider } from '@/context/WalletProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Phase5WalletProvider network="Preprod">
      {children}
    </Phase5WalletProvider>
  );
}
