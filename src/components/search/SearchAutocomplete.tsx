'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatters';

interface SuggestionProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  category?: { name: string; slug: string };
}

interface SuggestionCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface Suggestions {
  products: SuggestionProduct[];
  categories: SuggestionCategory[];
  popular: { id: string; name: string; slug: string; price: number }[];
}

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  onSelect?: () => void;
  size?: 'default' | 'large';
}

const RECENT_KEY = 'search_recent';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((r) => r !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 8)));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_KEY);
}

export function SearchAutocomplete({
  className,
  placeholder = 'Search products...',
  defaultValue = '',
  onSelect,
  size = 'default',
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(defaultValue);
  const [suggestions, setSuggestions] = React.useState<Suggestions | null>(null);
  const [recentSearches, setRecentSearches] = React.useState<string[]>(() => getRecentSearches());
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [highlightIdx, setHighlightIdx] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = React.useCallback((q: string) => {
    if (q.length < 2) {
      setSuggestions(null);
      return;
    }
    setLoading(true);
    fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data: Suggestions) => {
        setSuggestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  const handleSubmit = (q: string) => {
    if (!q.trim()) return;
    saveRecentSearch(q.trim());
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    onSelect?.();
  };

  const handleSelectProduct = (product: SuggestionProduct) => {
    saveRecentSearch(product.name);
    setShowDropdown(false);
    router.push(`/products/${product.slug}`);
    onSelect?.();
  };

  const handleSelectCategory = (category: SuggestionCategory) => {
    setShowDropdown(false);
    router.push(`/products?category=${category.slug}`);
    onSelect?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = [
      ...(suggestions?.products || []),
      ...(suggestions?.categories || []),
    ];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < (suggestions?.products.length || 0)) {
        handleSelectProduct(suggestions!.products[highlightIdx]);
      } else if (highlightIdx >= (suggestions?.products.length || 0) && suggestions?.categories) {
        const catIdx = highlightIdx - (suggestions?.products.length || 0);
        if (catIdx < suggestions.categories.length) {
          handleSelectCategory(suggestions.categories[catIdx]);
        } else {
          handleSubmit(query);
        }
      } else {
        handleSubmit(query);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const hasResults = suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0);
  const showDropdownContent = showDropdown && (query.length < 2 || !suggestions || hasResults || !loading);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
            setHighlightIdx(-1);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border bg-background pl-10 pr-10 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary',
            size === 'large' ? 'h-12 text-base' : 'h-10',
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions(null);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdownContent && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-popover shadow-xl">
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Recent Searches</span>
                <button
                  onClick={() => {
                    clearRecentSearches();
                    setRecentSearches([]);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      handleSubmit(term);
                    }}
                    className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                  >
                    <Search className="h-3 w-3" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.length >= 2 && loading && (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          )}

          {suggestions?.products && suggestions.products.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Products</p>
              {suggestions.products.map((product, idx) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted',
                    highlightIdx === idx && 'bg-muted',
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{formatPrice(product.price)}</span>
                </button>
              ))}
            </div>
          )}

          {suggestions?.categories && suggestions.categories.length > 0 && (
            <div className="border-t p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Categories</p>
              {suggestions.categories.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted',
                    highlightIdx === (suggestions.products.length + idx) && 'bg-muted',
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{cat.name}</span>
                  {cat._count && (
                    <span className="text-xs text-muted-foreground">{cat._count.products} items</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !loading && !hasResults && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {query.length >= 2 && !loading && (
            <button
              onClick={() => handleSubmit(query)}
              className="flex w-full items-center justify-center gap-2 border-t p-3 text-sm font-medium text-primary hover:bg-muted"
            >
              Search for &ldquo;{query}&rdquo;
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
