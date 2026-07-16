import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  it('renders when open', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    if (backdrop) {
      await userEvent.click(backdrop);
    }
    expect(onClose).toHaveBeenCalled();
  });

  it('renders description', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Title" description="This is a description">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });
});
