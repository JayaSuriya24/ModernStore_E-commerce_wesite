'use client';

import { useSession } from '@/hooks/useAuth';
import { useToggleWishlist, useWishlist } from '@/hooks/useWishlist';
import { Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

interface WishlistButtonProps {
  productId: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function WishlistButton({ productId, size = 'icon' }: WishlistButtonProps) {
  const { data: session } = useSession();
  const { data: wishlistData } = useWishlist();
  const toggleMutation = useToggleWishlist();

  const isInWishlist = wishlistData?.data?.some((item) => item.productId === productId) || false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.data) return;
    toggleMutation.mutate(productId);
  };

  if (!session?.data) return null;

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      className="gap-1"
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          isInWishlist ? 'fill-red-500 text-red-500' : '',
        )}
      />
    </Button>
  );
}
