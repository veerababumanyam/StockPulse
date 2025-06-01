import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricCard, MetricItem } from '../MetricCard';

// Mock Lucide icon component
const MockIcon = {
  $$typeof: Symbol.for('react.forward_ref'),
  render: (props: any, ref: any) => <svg data-testid="mock-icon" ref={ref} {...props} />,
  displayName: 'MockIcon',
} as any;

// Mock ResizeObserver
if (!window.ResizeObserver) {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserver;
}

// Clean up after each test
afterEach(() => {
  cleanup();
});

describe('MetricCard', () => {
  it('renders children correctly', () => {
    render(
      <MetricCard>
        <div data-testid="test-child">Test Content</div>
      </MetricCard>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(
      <MetricCard data-testid="metric-card">Test</MetricCard>
    );
    
    const card = screen.getByTestId('metric-card');
    expect(card).toHaveClass('bg-surface-subtle');
    expect(card).toHaveClass('border-border-subtle');
  });

  it('applies warning variant styles', () => {
    render(
      <MetricCard variant="warning" data-testid="warning-card">Test</MetricCard>
    );
    
    const card = screen.getByTestId('warning-card');
    expect(card).toHaveClass('bg-warning-muted/30');
    expect(card).toHaveClass('border-warning-subtle');
  });

  it('applies custom className', () => {
    const { container } = render(
      <MetricCard className="custom-class">Test</MetricCard>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    
    render(
      <MetricCard onClick={handleClick} data-testid="metric-card">
        Test
      </MetricCard>
    );
    
    const card = screen.getByTestId('metric-card');
    await userEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(card).toHaveClass('cursor-pointer');
  });
});

describe('MetricItem', () => {
  const defaultProps = {
    value: '$10,000.50',
    label: 'Total Value',
    icon: MockIcon,
    'data-testid': 'metric-item',
  };

  it('renders value and label correctly', () => {
    render(<MetricItem {...defaultProps} />);
    
    // Check that the main elements are rendered
    expect(screen.getByText('$10,000.50')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    
    // Check for the icon
    const icon = screen.getByTestId('mock-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders with positive change', () => {
    render(
      <MetricItem
        {...defaultProps}
        change="+$100.50 (1.25%)"
        isPositive={true}
      />
    );
    
    // Check that the main elements are rendered
    const valueElement = screen.getByText('$10,000.50');
    const changeElement = screen.getByText('+$100.50 (1.25%)');
    
    expect(valueElement).toBeInTheDocument();
    expect(changeElement).toBeInTheDocument();
    
    // Check for success color class in the value element
    expect(valueElement).toHaveClass('text-success-fg');
  });

  it('renders with negative change', () => {
    render(
      <MetricItem
        {...defaultProps}
        change="-$100.50 (1.25%)"
        isPositive={false}
      />
    );
    
    // Check that the main elements are rendered
    const valueElement = screen.getByText('$10,000.50');
    const changeElement = screen.getByText('-$100.50 (1.25%)');
    
    expect(valueElement).toBeInTheDocument();
    expect(changeElement).toBeInTheDocument();
    
    // Check for danger color class in the value element
    expect(valueElement).toHaveClass('text-danger-fg');
  });

  it('applies warning variant', () => {
    render(
      <MetricCard variant="warning" data-testid="metric-card">
        <MetricItem {...defaultProps} />
      </MetricCard>
    );
    
    const card = screen.getByTestId('metric-card');
    expect(card).toHaveClass('bg-warning-muted/30');
    expect(card).toHaveClass('border-warning-subtle');
  });

  it('applies custom className', () => {
    const { container } = render(
      <MetricItem
        {...defaultProps}
        className="custom-class"
      />
    );
    
    // The className should be applied to the root element
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
