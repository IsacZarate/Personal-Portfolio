import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import QualitySequence from './QualitySequence';

describe('QualitySequence', () => {
  it('changes the visible explanation when a stage is activated', () => {
    render(<QualitySequence />);
    fireEvent.click(screen.getByRole('tab', { name: /exercise/i }));

    expect(screen.getByRole('tab', { name: /exercise/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent(/browser journeys/i);
  });

  it('supports arrow-key tab movement', () => {
    render(<QualitySequence />);
    const firstTab = screen.getByRole('tab', { name: /specify/i });
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });

    expect(screen.getByRole('tab', { name: /build/i })).toHaveFocus();
    expect(screen.getByRole('tab', { name: /build/i })).toHaveAttribute('aria-selected', 'true');
  });
});
