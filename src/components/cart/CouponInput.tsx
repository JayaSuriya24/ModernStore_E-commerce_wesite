'use client';

import * as React from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CouponInputProps {
  onApply: (code: string) => void;
  onRemove: () => void;
  appliedCode: string | null;
  isLoading?: boolean;
  error?: string | null;
}

export function CouponInput({ onApply, onRemove, appliedCode, isLoading, error }: CouponInputProps) {
  const [code, setCode] = React.useState('');

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            {appliedCode} applied
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-green-600 hover:text-green-800"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          placeholder="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={() => {
            if (code.trim()) {
              onApply(code.trim());
              setCode('');
            }
          }}
          disabled={!code.trim() || isLoading}
          isLoading={isLoading}
        >
          Apply
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
