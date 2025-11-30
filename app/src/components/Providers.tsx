'use client';

import { ReactNode } from 'react';
import { Phase5WalletProvider } from '@/context/WalletProvider';
import { ThemeProvider } from '@/context/ThemeProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <Phase5WalletProvider network="Preprod">
        {children}
      </Phase5WalletProvider>
    </ThemeProvider>
  );
}
