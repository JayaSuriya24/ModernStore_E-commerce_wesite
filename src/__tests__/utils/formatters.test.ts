import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatDate,
  formatDateTime,
  slugify,
  truncate,
  getInitials,
  calculateDiscount,
} from '@/utils/formatters';

describe('formatPrice', () => {
  it('formats cents to dollars', () => {
    expect(formatPrice(1999)).toBe('$19.99');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('formats large amounts', () => {
    expect(formatPrice(123456)).toBe('$1,234.56');
  });

  it('formats single digit cents', () => {
    expect(formatPrice(5)).toBe('$0.05');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate(new Date(2024, 0, 15));
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date(2024, 5, 20));
    expect(result).toContain('June');
    expect(result).toContain('20');
  });
});

describe('formatDateTime', () => {
  it('formats date and time', () => {
    const result = formatDateTime('2024-01-15T14:30:00');
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
  });
});

describe('slugify', () => {
  it('converts text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('handles special characters', () => {
    expect(slugify('Product! @#$ Name')).toBe('product-name');
  });

  it('handles multiple spaces', () => {
    expect(slugify('  Hello   World  ')).toBe('hello-world');
  });

  it('lowercases', () => {
    expect(slugify('UPPERCASE')).toBe('uppercase');
  });
});

describe('truncate', () => {
  it('truncates long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('returns short text unchanged', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('returns exact length text', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('getInitials', () => {
  it('gets two initials', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('handles single name', () => {
    expect(getInitials('Alice')).toBe('A');
  });

  it('handles multiple names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  it('uppercase output', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

describe('calculateDiscount', () => {
  it('calculates percentage discount', () => {
    expect(calculateDiscount(50, 100)).toBe(50);
  });

  it('returns 0 when no compare price', () => {
    expect(calculateDiscount(50, 0)).toBe(0);
  });

  it('returns 0 when compare is less than price', () => {
    expect(calculateDiscount(100, 50)).toBe(0);
  });

  it('returns 0 when prices are equal', () => {
    expect(calculateDiscount(50, 50)).toBe(0);
  });

  it('rounds to integer', () => {
    expect(calculateDiscount(33, 100)).toBe(67);
  });
});
