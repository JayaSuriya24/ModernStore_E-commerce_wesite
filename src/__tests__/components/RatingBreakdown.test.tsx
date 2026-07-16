import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingBreakdown } from '@/components/reviews/RatingBreakdown';

describe('RatingBreakdown', () => {
  const reviews = [
    { rating: 5 },
    { rating: 5 },
    { rating: 4 },
    { rating: 4 },
    { rating: 3 },
    { rating: 1 },
  ];

  it('renders the average rating', () => {
    render(<RatingBreakdown reviews={reviews} />);
    expect(screen.getByText('3.7')).toBeInTheDocument();
  });

  it('renders the review count', () => {
    render(<RatingBreakdown reviews={reviews} />);
    expect(screen.getByText('6 reviews')).toBeInTheDocument();
  });

  it('renders singular for one review', () => {
    render(<RatingBreakdown reviews={[{ rating: 5 }]} />);
    expect(screen.getByText('1 review')).toBeInTheDocument();
  });

  it('renders rating bars for each star level', () => {
    const { container } = render(<RatingBreakdown reviews={reviews} />);
    const starLabels = container.querySelectorAll('.text-xs.text-muted-foreground');
    const texts = Array.from(starLabels).map((el) => el.textContent);
    expect(texts).toContain('5');
    expect(texts).toContain('4');
    expect(texts).toContain('3');
    expect(texts).toContain('2');
    expect(texts).toContain('1');
  });

  it('renders nothing when no reviews', () => {
    const { container } = render(<RatingBreakdown reviews={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
