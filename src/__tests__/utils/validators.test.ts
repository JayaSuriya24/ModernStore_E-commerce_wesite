import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  addressSchema,
  productSchema,
  reviewSchema,
  couponSchema,
} from '@/lib/validators';

describe('loginSchema', () => {
  it('validates correct login data', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'pass' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: 'pass' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Strong1Pass',
    confirmPassword: 'Strong1Pass',
  };

  it('validates correct registration data', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects short name', () => {
    const result = registerSchema.safeParse({ ...validData, name: 'J' });
    expect(result.success).toBe(false);
  });

  it('rejects weak password', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'weak', confirmPassword: 'weak' });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: 'Different1Pass' });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'nouppercase1', confirmPassword: 'nouppercase1' });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'NoNumberHere', confirmPassword: 'NoNumberHere' });
    expect(result.success).toBe(false);
  });
});

describe('addressSchema', () => {
  const validAddress = {
    name: 'Home',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
    phone: '555-1234',
  };

  it('validates correct address', () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it('rejects missing fields', () => {
    const result = addressSchema.safeParse({ name: 'Home' });
    expect(result.success).toBe(false);
  });
});

describe('reviewSchema', () => {
  it('validates correct review', () => {
    const result = reviewSchema.safeParse({
      rating: 5,
      comment: 'This is a great product! Very happy with it.',
      productId: 'abc123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects rating below 1', () => {
    const result = reviewSchema.safeParse({ rating: 0, comment: 'Great product!', productId: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rejects rating above 5', () => {
    const result = reviewSchema.safeParse({ rating: 6, comment: 'Great product!', productId: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rejects short comment', () => {
    const result = reviewSchema.safeParse({ rating: 4, comment: 'Short', productId: 'abc' });
    expect(result.success).toBe(false);
  });
});

describe('couponSchema', () => {
  it('validates percent coupon', () => {
    const result = couponSchema.safeParse({
      code: 'SAVE10',
      discount: 10,
      type: 'PERCENT',
    });
    expect(result.success).toBe(true);
  });

  it('validates fixed coupon', () => {
    const result = couponSchema.safeParse({
      code: 'FLAT500',
      discount: 500,
      type: 'FIXED',
    });
    expect(result.success).toBe(true);
  });

  it('rejects percent over 100', () => {
    const result = couponSchema.safeParse({
      code: 'BAD',
      discount: 150,
      type: 'PERCENT',
    });
    expect(result.success).toBe(false);
  });

  it('uppercases code', () => {
    const result = couponSchema.safeParse({
      code: 'lowercase',
      discount: 10,
      type: 'PERCENT',
    });
    if (result.success) {
      expect(result.data.code).toBe('LOWERCASE');
    }
  });
});

describe('productSchema', () => {
  const validProduct = {
    name: 'Test Product',
    description: 'A detailed product description here.',
    price: 2999,
    categoryId: 'cat123',
    images: ['/image.jpg'],
    sku: 'TEST-001',
    stock: 10,
    isActive: true,
  };

  it('validates correct product', () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = productSchema.safeParse({ ...validProduct, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects short description', () => {
    const result = productSchema.safeParse({ ...validProduct, description: 'Short' });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = productSchema.safeParse({ ...validProduct, price: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects empty images', () => {
    const result = productSchema.safeParse({ ...validProduct, images: [] });
    expect(result.success).toBe(false);
  });
});
