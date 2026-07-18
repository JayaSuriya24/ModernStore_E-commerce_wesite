'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/layout/ThemeProvider';
import { useCartStore } from '@/store/cart';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';

const navLinks = [
  { href: '/products', label: 'Shop' },
  { href: '/products?category=electronics', label: 'Electronics' },
  { href: '/products?category=clothing', label: 'Clothing' },
  { href: '/products?category=home', label: 'Home & Living' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const prevPathname = React.useRef(pathname);
  const cartItemCount = useCartStore((s) => s.getItemCount());

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (prevPathname.current !== pathname) {
      setMobileOpen(false);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled ? 'glass-strong shadow-sm' : 'bg-background/80 backdrop-blur-sm',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold gradient-text">ModernStore</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    pathname === link.href ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <SearchAutocomplete
              className="hidden w-64 lg:block"
              placeholder="Search..."
            />
            <ThemeToggle />
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" aria-label="Wishlist" className="hidden sm:flex">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
                <ShoppingBag className="h-5 w-5" />
                <span
                  suppressHydrationWarning
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground transition-transform duration-200"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="icon" aria-label="Account" className="hidden sm:flex">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <nav className="relative z-50 glass-strong h-full overflow-y-auto p-6 animate-slide-down">
            <div className="flex flex-col gap-4">
              <SearchAutocomplete
                placeholder="Search products..."
                onSelect={() => setMobileOpen(false)}
              />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-lg font-medium transition-colors hover:text-primary py-2',
                    pathname === link.href ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border" />
              <Link
                href="/login"
                className="flex items-center gap-3 text-lg font-medium text-foreground py-2"
              >
                <User className="h-5 w-5" /> Account
              </Link>
              <Link
                href="/cart"
                className="flex items-center gap-3 text-lg font-medium text-foreground py-2"
              >
                <ShoppingBag className="h-5 w-5" /> Cart
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
