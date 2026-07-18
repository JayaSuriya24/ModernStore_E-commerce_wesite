'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

let cartIconRef: HTMLDivElement | null = null;

export function setCartIconRef(el: HTMLDivElement | null) {
  cartIconRef = el;
}

interface FlyToCartProps {
  children: React.ReactNode;
  onFlyComplete?: () => void;
}

export function FlyToCart({ children, onFlyComplete }: FlyToCartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useSpring(1, { stiffness: 300, damping: 20 });
  const [flying, setFlying] = useState(false);

  const fly = useCallback(() => {
    if (!ref.current || !cartIconRef) {
      onFlyComplete?.();
      return;
    }

    const sourceRect = ref.current.getBoundingClientRect();
    const targetRect = cartIconRef.getBoundingClientRect();

    x.set(sourceRect.left);
    y.set(sourceRect.top);
    scale.set(1);
    setFlying(true);

    requestAnimationFrame(() => {
      x.set(targetRect.left + targetRect.width / 2 - 20);
      y.set(targetRect.top + targetRect.height / 2 - 20);
      scale.set(0.2);
    });

    setTimeout(() => {
      setFlying(false);
      scale.set(1);
      onFlyComplete?.();
    }, 600);
  }, [x, y, scale, onFlyComplete]);

  return (
    <>
      <div ref={ref} onClick={fly} className="inline-flex">
        {children}
      </div>

      <AnimatePresence>
        {flying && (
          <motion.div
            className="pointer-events-none fixed z-[9999] flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg"
            style={{ x, y, scale }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
