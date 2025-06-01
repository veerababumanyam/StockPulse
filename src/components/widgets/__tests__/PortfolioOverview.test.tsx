import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PortfolioOverview } from '../PortfolioOverview';
import { apiClient } from '../../../services/api';

// Mock the API client
jest.mock('../../../services/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('PortfolioOverview', () => {
  const mockData = {
    portfolioValue: 125000.75,
    dayChange: 1250.5,
    dayChangePercent: 1.01,
    overallGain: 25000.25,
    overallGainPercent: 25.0,
    assetCount: 8,
    alertsCount: 2,
    lastUpdated: '2023-06-01T12:00:00Z',
  };

  const defaultProps = {
    widgetId: 'portfolio-overview-1',
    config: {
      title: 'My Portfolio',
      refreshInterval: 60000,
    },
    isEditMode: false,
    onConfigChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (apiClient.get as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves to test loading state
    );

    render(<PortfolioOverview {...defaultProps} />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state when API call fails', async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<PortfolioOverview {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('renders portfolio data when loaded', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    render(<PortfolioOverview {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('$125,000.75')).toBeInTheDocument();
      expect(screen.getByText(/\+\$1,250.50 \(1.01%\)/)).toBeInTheDocument();
      expect(screen.getByText(/\+\$25,000.25 \(25.00%\)/)).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    render(<PortfolioOverview {...defaultProps} />);
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    userEvent.click(refreshButton);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  it('shows edit badge when in edit mode', () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });
    
    render(<PortfolioOverview {...defaultProps} isEditMode={true} />);
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('displays alerts section when there are alerts', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    render(<PortfolioOverview {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    });
  });

  it('does not display alerts section when there are no alerts', async () => {
    const noAlertsData = { ...mockData, alertsCount: 0 };
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: noAlertsData });

    render(<PortfolioOverview {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Active Alerts')).not.toBeInTheDocument();
    });
  });
});
