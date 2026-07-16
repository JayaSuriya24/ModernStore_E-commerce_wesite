import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders default variant', () => {
    const { container } = render(<Badge variant="default">Default</Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders destructive variant', () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders success variant', () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('renders secondary variant', () => {
    render(<Badge variant="secondary">Info</Badge>);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });
});
