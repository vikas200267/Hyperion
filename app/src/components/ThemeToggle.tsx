'use client';

import { useTheme } from '@/context/ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg border-2 border-border hover:border-primary transition-all duration-300"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun className={`h-5 w-5 transition-all duration-300 ${
        theme === 'dark' 
          ? 'rotate-0 scale-100 text-yellow-400' 
          : 'rotate-90 scale-0 text-transparent'
      }`} />
      <Moon className={`absolute h-5 w-5 transition-all duration-300 ${
        theme === 'dark' 
          ? 'rotate-90 scale-0 text-transparent' 
          : 'rotate-0 scale-100 text-blue-600'
      }`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
