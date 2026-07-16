'use client';

import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RatingBreakdownProps {
  reviews: { rating: number }[];
}

export function RatingBreakdown({ reviews }: RatingBreakdownProps) {
  const total = reviews.length;
  if (total === 0) return null;

  const counts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{average.toFixed(1)}</p>
          <div className="mt-1 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  'h-3.5 w-3.5',
                  i <= Math.round(average)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-muted text-muted',
                )}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{total} review{total !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex-1 space-y-1.5">
          {counts.map(({ stars, count }) => (
            <div key={stars} className="flex items-center gap-2">
              <span className="w-3 text-xs text-muted-foreground">{stars}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
