'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}

function useIsClient() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function ThemeToggleInner() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsClient();

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-9 w-9" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function ThemeToggle() {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ThemeToggleInner />
    </NextThemesProvider>
  );
}
