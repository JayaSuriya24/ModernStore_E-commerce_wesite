import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewList } from '@/components/reviews/ReviewList';
import type { Review } from '@/types';

const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    productId: 'prod1',
    rating: 5,
    comment: 'Excellent product! Very happy with my purchase.',
    createdAt: new Date('2024-06-15'),
    user: { id: 'user1', name: 'John Doe', email: 'john@test.com', role: 'USER', avatar: null, emailVerified: null, createdAt: new Date() },
  },
  {
    id: '2',
    userId: 'user2',
    productId: 'prod1',
    rating: 3,
    comment: 'Decent quality but shipping was slow.',
    createdAt: new Date('2024-06-10'),
    user: { id: 'user2', name: 'Jane Smith', email: 'jane@test.com', role: 'USER', avatar: null, emailVerified: null, createdAt: new Date() },
  },
];

describe('ReviewList', () => {
  it('renders all reviews', () => {
    render(<ReviewList reviews={mockReviews} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders review comments', () => {
    render(<ReviewList reviews={mockReviews} />);
    expect(screen.getByText('Excellent product! Very happy with my purchase.')).toBeInTheDocument();
    expect(screen.getByText('Decent quality but shipping was slow.')).toBeInTheDocument();
  });

  it('renders empty message when no reviews', () => {
    render(<ReviewList reviews={[]} />);
    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });

  it('renders star ratings', () => {
    const { container } = render(<ReviewList reviews={mockReviews} />);
    const stars = container.querySelectorAll('.fill-yellow-400');
    expect(stars.length).toBeGreaterThan(0);
  });
});
