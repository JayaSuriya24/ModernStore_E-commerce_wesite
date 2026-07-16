'use client';

import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, getInitials } from '@/utils/formatters';
import type { Review } from '@/types';

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">No reviews yet. Be the first to review!</p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {review.user?.avatar ? (
                  <img src={review.user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  getInitials(review.user?.name || 'U')
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{review.user?.name}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                </div>
                <div className="mt-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3.5 w-3.5',
                        i <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-muted text-muted',
                      )}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
