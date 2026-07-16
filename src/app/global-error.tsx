'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-6xl">😵</p>
      <h2 className="mb-2 text-2xl font-bold text-foreground">Something went wrong</h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
