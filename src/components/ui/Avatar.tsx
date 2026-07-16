import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/formatters';

const avatarVariants = cva(
  'relative inline-flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-14 w-14 text-lg',
        xl: 'h-20 w-20 text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  name: string;
  className?: string;
}

export function Avatar({ src, alt, name, size, className }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt || name}
        width={80}
        height={80}
        className={cn(avatarVariants({ size }), 'object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        avatarVariants({ size }),
        'bg-primary text-primary-foreground font-medium flex items-center justify-center',
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
