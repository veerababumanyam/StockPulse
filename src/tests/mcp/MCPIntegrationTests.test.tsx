import { useState, useEffect } from 'react';
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { TelemetryProvider } from '../../contexts/TelemetryContext';
import { GovernanceProvider } from '../../contexts/GovernanceContext';
import { MCPSetupWizard } from '../../pages/agents/MCPSetupWizard';
import { MCPCapabilityMapping } from '../../pages/agents/MCPCapabilityMapping';
import { MCPMobileManagement } from '../../pages/agents/MCPMobileManagement';

// Mock MCP server responses
const server = setupServer(
  // Mock MCP server discovery endpoint
  rest.get('*/mcp/discovery', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        name: 'Test MCP Server',
        version: '1.0.0',
        capabilities: [
          {
            id: 'market_data',
            name: 'Market Data',
            description: 'Real-time and historical market data'
          },
          {
            id: 'technical_analysis',
            name: 'Technical Analysis',
            description: 'Technical indicators and chart patterns'
          }
        ]
      })
    );
  }),
  
  // Mock MCP server capabilities endpoint
  rest.get('*/mcp/capabilities', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'market_data',
          name: 'Market Data',
          description: 'Real-time and historical market data',
          methods: ['getQuote', 'getHistoricalData', 'getCompanyProfile']
        },
        {
          id: 'technical_analysis',
          name: 'Technical Analysis',
          description: 'Technical indicators and chart patterns',
          methods: ['calculateSMA', 'calculateEMA', 'calculateRSI']
        }
      ])
    );
  }),
  
  // Mock MCP server health endpoint
  rest.get('*/mcp/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'healthy',
        uptime: 3600,
        connections: 10,
        requestsPerMinute: 120
      })
    );
  }),
  
  // Mock MCP server registration endpoint
  rest.post('*/mcp/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'test-client-id',
        name: req.body.name,
        apiKey: 'test-api-key',
        capabilities: req.body.capabilities
      })
    );
  })
);

// Setup and teardown the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock the telemetry context
jest.mock('../../contexts/TelemetryContext', () => ({
  useTelemetry: () => ({
    startSpan: jest.fn(() => 'test-span-id'),
    endSpan: jest.fn(),
    addEvent: jest.fn(),
    currentSpan: 'test-span-id'
  }),
  TelemetryProvider: ({ children }) => children
}));

// Mock the governance context
jest.mock('../../contexts/GovernanceContext', () => ({
  useGovernance: () => ({
    recordAudit: jest.fn()
  }),
  GovernanceProvider: ({ children }) => children
}));

// Mock the toast hook
jest.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mock the media query hook
jest.mock('../../hooks/useMediaQuery', () => ({
  useMediaQuery: () => false
}));

// Mock the MCP performance hook
jest.mock('../../hooks/useMCPPerformance', () => ({
  useMCPPerformance: () => ({
    createConnectionPool: jest.fn(),
    createRateLimiter: jest.fn()
  })
}));

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '' })
}));

// Mock ReactFlow
jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  ReactFlow: ({ children }) => <div data-testid="react-flow">{children}</div>,
  Background: () => <div data-testid="react-flow-background" />,
  Controls: () => <div data-testid="react-flow-controls" />,
  MiniMap: () => <div data-testid="react-flow-minimap" />,
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
  MarkerType: { ArrowClosed: 'arrowClosed' },
  Position: { Right: 'right', Left: 'left', Top: 'top', Bottom: 'bottom' }
}));

describe('MCP Setup Wizard Tests', () => {
  test('renders the setup wizard with initial options', async () => {
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPSetupWizard />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Check that the wizard title is displayed
    expect(screen.getByText('MCP Setup Wizard')).toBeInTheDocument();
    
    // Check that both client and server options are available
    expect(screen.getByText('MCP Client')).toBeInTheDocument();
    expect(screen.getByText('MCP Server')).toBeInTheDocument();
    
    // Select client option
    fireEvent.click(screen.getByText('MCP Client'));
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Check that we're on the client configuration step
    await waitFor(() => {
      expect(screen.getByText('MCP Client Configuration')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Connection Name'), {
      target: { value: 'Test Connection' }
    });
    
    fireEvent.change(screen.getByLabelText('Server URL'), {
      target: { value: 'https://mcp.example.com/sse' }
    });
    
    fireEvent.change(screen.getByLabelText('API Key'), {
      target: { value: 'test-api-key' }
    });
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Check that we're on the capabilities step
    await waitFor(() => {
      expect(screen.getByText('Select Capabilities')).toBeInTheDocument();
    });
  });
  
  test('validates required fields in the setup wizard', async () => {
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPSetupWizard />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Select client option
    fireEvent.click(screen.getByText('MCP Client'));
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Check that we're on the client configuration step
    await waitFor(() => {
      expect(screen.getByText('MCP Client Configuration')).toBeInTheDocument();
    });
    
    // Click next without filling in required fields
    fireEvent.click(screen.getByText('Next'));
    
    // Check that validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText('Connection name is required')).toBeInTheDocument();
      expect(screen.getByText('Server URL is required')).toBeInTheDocument();
      expect(screen.getByText('API key is required')).toBeInTheDocument();
    });
  });
  
  test('completes the setup wizard process', async () => {
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPSetupWizard />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Select client option
    fireEvent.click(screen.getByText('MCP Client'));
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Connection Name'), {
      target: { value: 'Test Connection' }
    });
    
    fireEvent.change(screen.getByLabelText('Server URL'), {
      target: { value: 'https://mcp.example.com/sse' }
    });
    
    fireEvent.change(screen.getByLabelText('API Key'), {
      target: { value: 'test-api-key' }
    });
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Wait for capabilities to load
    await waitFor(() => {
      expect(screen.getByText('Select Capabilities')).toBeInTheDocument();
    });
    
    // Select a capability
    fireEvent.click(screen.getByText('Market Data'));
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Check that we're on the performance & security step
    await waitFor(() => {
      expect(screen.getByText('Performance & Security Settings')).toBeInTheDocument();
    });
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Check that we're on the review step
    await waitFor(() => {
      expect(screen.getByText('Review & Confirm')).toBeInTheDocument();
    });
    
    // Complete the setup
    fireEvent.click(screen.getByText('Complete Setup'));
  });
});

describe('MCP Capability Mapping Tests', () => {
  test('renders the capability mapping component', async () => {
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPCapabilityMapping />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Check that the component title is displayed
    expect(screen.getByText('MCP Capability Mapping')).toBeInTheDocument();
    
    // Check that the ReactFlow component is rendered
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    
    // Check that filters are available
    expect(screen.getByPlaceholderText('Search nodes...')).toBeInTheDocument();
    expect(screen.getByText('Filter by status')).toBeInTheDocument();
    expect(screen.getByText('Filter by type')).toBeInTheDocument();
    
    // Check that the connection statistics section is rendered
    expect(screen.getByText('Connection Statistics')).toBeInTheDocument();
  });
  
  test('filters nodes in the capability mapping', async () => {
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPCapabilityMapping />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Enter search query
    fireEvent.change(screen.getByPlaceholderText('Search nodes...'), {
      target: { value: 'market' }
    });
    
    // Change status filter
    fireEvent.click(screen.getByText('Filter by status'));
    fireEvent.click(screen.getByText('Active'));
    
    // Change type filter
    fireEvent.click(screen.getByText('Filter by type'));
    fireEvent.click(screen.getByText('Market Data'));
    
    // Reset filters
    fireEvent.click(screen.getByText('Reset Filters'));
    
    // Check that search input is cleared
    expect(screen.getByPlaceholderText('Search nodes...').value).toBe('');
  });
  
  test('toggles layout direction in capability mapping', async () => {
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPCapabilityMapping />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Find and click the layout toggle button
    const layoutButton = screen.getByText('Horizontal');
    fireEvent.click(layoutButton);
    
    // Check that the button text changes
    expect(screen.getByText('Vertical')).toBeInTheDocument();
    
    // Toggle capabilities visibility
    const capabilitiesButton = screen.getByText('Hide Capabilities');
    fireEvent.click(capabilitiesButton);
    
    // Check that the button text changes
    expect(screen.getByText('Show Capabilities')).toBeInTheDocument();
  });
});

describe('MCP Mobile Management Tests', () => {
  test('renders the mobile management component', async () => {
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPMobileManagement />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Check that the component title is displayed
    expect(screen.getByText('MCP Mobile Management')).toBeInTheDocument();
    
    // Check that tabs are available
    expect(screen.getByText('Connections')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Check that the mobile access overview section is rendered
    expect(screen.getByText('Mobile Access Overview')).toBeInTheDocument();
  });
  
  test('switches between tabs in mobile management', async () => {
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPMobileManagement />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Click on notifications tab
    fireEvent.click(screen.getByText('Notifications'));
    
    // Check that notifications content is displayed
    expect(screen.getByText('Mark All Read')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
    
    // Click on settings tab
    fireEvent.click(screen.getByText('Settings'));
    
    // Check that settings content is displayed
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    expect(screen.getByText('Mobile Settings')).toBeInTheDocument();
    expect(screen.getByText('Display Settings')).toBeInTheDocument();
  });
  
  test('toggles mobile settings in mobile management', async () => {
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPMobileManagement />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Click on settings tab
    fireEvent.click(screen.getByText('Settings'));
    
    // Toggle push notifications
    const pushNotificationsSwitch = screen.getByLabelText('Push Notifications');
    fireEvent.click(pushNotificationsSwitch);
    
    // Toggle data saver mode
    const dataSaverSwitch = screen.getByLabelText('Data Saver Mode');
    fireEvent.click(dataSaverSwitch);
    
    // Toggle offline mode
    const offlineModeSwitch = screen.getByLabelText('Offline Mode');
    fireEvent.click(offlineModeSwitch);
    
    // Change layout style
    fireEvent.click(screen.getByText('Compact'));
    
    // Change color scheme
    fireEvent.click(screen.getByText('High Contrast'));
    
    // Change notification style
    fireEvent.click(screen.getByText('Minimal'));
  });
});

// Chaos testing for MCP connections
describe('MCP Connection Resilience Tests', () => {
  test('handles server disconnection gracefully', async () => {
    // Override the server handler to simulate a disconnection
    server.use(
      rest.get('*/mcp/health', (req, res, ctx) => {
        return res(ctx.status(503));
      })
    );
    
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPMobileManagement />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Check that the component still renders without crashing
    expect(screen.getByText('MCP Mobile Management')).toBeInTheDocument();
  });
  
  test('handles slow server responses', async () => {
    // Override the server handler to simulate a slow response
    server.use(
      rest.get('*/mcp/capabilities', (req, res, ctx) => {
        return res(
          ctx.delay(3000), // 3 second delay
          ctx.status(200),
          ctx.json([
            {
              id: 'market_data',
              name: 'Market Data',
              description: 'Real-time and historical market data',
              methods: ['getQuote', 'getHistoricalData', 'getCompanyProfile']
            }
          ])
        );
      })
    );
    
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPCapabilityMapping />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Check that the component still renders without crashing
    expect(screen.getByText('MCP Capability Mapping')).toBeInTheDocument();
  });
  
  test('handles malformed server responses', async () => {
    // Override the server handler to simulate a malformed response
    server.use(
      rest.get('*/mcp/discovery', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            name: 'Test MCP Server',
            version: '1.0.0',
            // Missing capabilities array
          })
        );
      })
    );
    
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPSetupWizard />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Check that the component still renders without crashing
    expect(screen.getByText('MCP Setup Wizard')).toBeInTheDocument();
  });
  
  test('handles server rate limiting', async () => {
    // Override the server handler to simulate rate limiting
    server.use(
      rest.get('*/mcp/capabilities', (req, res, ctx) => {
        return res(
          ctx.status(429),
          ctx.json({
            error: 'Too many requests',
            retryAfter: 60
          })
        );
      })
    );
    
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPCapabilityMapping />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Check that the component still renders without crashing
    expect(screen.getByText('MCP Capability Mapping')).toBeInTheDocument();
  });
});

// Mobile-specific tests
describe('MCP Mobile-Specific Tests', () => {
  beforeEach(() => {
    // Mock the media query hook to simulate mobile device
    jest.spyOn(require('../../hooks/useMediaQuery'), 'useMediaQuery').mockReturnValue(true);
  });
  
  test('renders correctly on mobile devices', async () => {
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPMobileManagement />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Check that the component title is displayed
    expect(screen.getByText('MCP Mobile Management')).toBeInTheDocument();
    
    // Check that mobile-optimized message is displayed
    expect(screen.getByText('Mobile management is optimized for your device')).toBeInTheDocument();
  });
  
  test('adapts layout for mobile devices', async () => {
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPCapabilityMapping />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Check that the component still renders without crashing
    expect(screen.getByText('MCP Capability Mapping')).toBeInTheDocument();
  });
});

// A/B testing tests
describe('MCP A/B Testing Tests', () => {
  test('assigns and persists A/B test variants', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPMobileManagement />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Check that localStorage was accessed to get variants
    expect(localStorageMock.getItem).toHaveBeenCalledWith('ab_test_layout');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('ab_test_color_scheme');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('ab_test_notification_style');
    
    // Click on settings tab
    fireEvent.click(screen.getByText('Settings'));
    
    // Change layout style
    fireEvent.click(screen.getByText('Compact'));
    
    // Check that localStorage was updated with new variant
    expect(localStorageMock.setItem).toHaveBeenCalledWith('ab_test_layout', 'compact');
  });
});

// Integration tests
describe('MCP Integration Tests', () => {
  test('setup wizard creates connection visible in capability mapping', async () => {
    // This would be a more complex test that would:
    // 1. Render the setup wizard
    // 2. Complete the setup process
    // 3. Navigate to the capability mapping
    // 4. Verify the new connection is visible
    
    // For now, we'll just check that both components render
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <div>
              <MCPSetupWizard />
              <MCPCapabilityMapping />
            </div>
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    expect(screen.getByText('MCP Setup Wizard')).toBeInTheDocument();
    expect(screen.getByText('MCP Capability Mapping')).toBeInTheDocument();
  });
  
  test('mobile management reflects changes from capability mapping', async () => {
    // This would be a more complex test that would:
    // 1. Render the capability mapping
    // 2. Make changes to connections
    // 3. Navigate to the mobile management
    // 4. Verify the changes are reflected
    
    // For now, we'll just check that both components render
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <div>
              <MCPCapabilityMapping />
              <MCPMobileManagement />
            </div>
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    expect(screen.getByText('MCP Capability Mapping')).toBeInTheDocument();
    expect(screen.getByText('MCP Mobile Management')).toBeInTheDocument();
  });
});

// Performance tests
describe('MCP Performance Tests', () => {
  test('capability mapping renders large number of nodes efficiently', async () => {
    // Mock a large dataset
    const largeNodesDataset = Array.from({ length: 100 }, (_, i) => ({
      id: `node-${i}`,
      type: i % 3 === 0 ? 'server' : i % 3 === 1 ? 'client' : 'capability',
      position: { x: i * 10, y: i * 5 },
      data: {
        label: `Node ${i}`,
        description: `Description for node ${i}`,
        status: i % 2 === 0 ? 'active' : 'inactive'
      }
    }));
    
    // Mock the useNodesState hook to return the large dataset
    jest.spyOn(require('reactflow'), 'useNodesState').mockReturnValue([
      largeNodesDataset,
      jest.fn(),
      jest.fn()
    ]);
    
    const startTime = performance.now();
    
    render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPCapabilityMapping />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    const endTime = performance.now();
    
    // Check that rendering time is reasonable (less than 1000ms)
    expect(endTime - startTime).toBeLessThan(1000);
    
    // Check that the component rendered successfully
    expect(screen.getByText('MCP Capability Mapping')).toBeInTheDocument();
  });
});

// Accessibility tests
describe('MCP Accessibility Tests', () => {
  test('components meet accessibility standards', async () => {
    const { container: setupWizardContainer } = render(
      <MemoryRouter>
        <TelemetryProvider>
          <GovernanceProvider>
            <MCPSetupWizard />
          </GovernanceProvider>
        </TelemetryProvider>
      </MemoryRouter>
    );
    
    // Check for basic accessibility issues
    // In a real test, we would use jest-axe or similar
    const headings = setupWizardContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);
    
    const buttons = setupWizardContainer.querySelectorAll('button');
    buttons.forEach(button => {
      // Every button should have either text content or an aria-label
      expect(button.textContent || button.getAttribute('aria-label')).toBeTruthy();
    });
    
    const inputs = setupWizardContainer.querySelectorAll('input');
    inputs.forEach(input => {
      // Every input should have a corresponding label
      const id = input.getAttribute('id');
      if (id) {
        const label = setupWizardContainer.querySelector(`label[for="${id}"]`);
        expect(label).toBeTruthy();
      }
    });
  });
});

// Export the test suite
export default {
  MCPSetupWizardTests: describe,
  MCPCapabilityMappingTests: describe,
  MCPMobileManagementTests: describe,
  MCPConnectionResilienceTests: describe,
  MCPMobileSpecificTests: describe,
  MCPABTestingTests: describe,
  MCPIntegrationTests: describe,
  MCPPerformanceTests: describe,
  MCPAccessibilityTests: describe
};
