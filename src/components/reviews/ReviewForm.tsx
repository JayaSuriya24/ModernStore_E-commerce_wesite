'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = React.useState(0);
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: { productId: string; rating: number; comment: string }) =>
      fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (res: { error?: string; message?: string }) => {
      if (res.error) return toast(res.message || 'Error', 'error');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setRating(0);
      setComment('');
      toast('Review submitted', 'success');
      onSuccess?.();
    },
  });

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="mb-4 font-semibold text-foreground">Write a Review</h3>
      <div className="mb-4">
        <p className="mb-2 text-sm text-muted-foreground">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(value)}
              className="p-0.5"
            >
              <Star
                className={cn(
                  'h-6 w-6 transition-colors',
                  (hoveredRating || rating) >= value
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-muted text-muted',
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <Textarea
        label="Review"
        placeholder="Share your experience with this product..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
      />
      <Button
        className="mt-4"
        onClick={() => mutation.mutate({ productId, rating, comment })}
        isLoading={mutation.isPending}
        disabled={rating === 0 || !comment.trim()}
      >
        Submit Review
      </Button>
    </div>
  );
}
