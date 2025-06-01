import React, { useState, useEffect } from 'react';
import mcpFederationService from '../../services/mcpFederationService';
import { useToast } from '../../hooks/useToast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  AlertCircle, 
  Database, 
  Network, 
  Server, 
  Settings, 
  Shield
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

// Use the already instantiated MCP federation service
const federationService = mcpFederationService;

const MCPServerConfiguration: React.FC = () => {
  const { toast } = useToast();
  const [isServerActive, setIsServerActive] = useState(false);
  const [serverConfig, setServerConfig] = useState({
    name: 'StockPulse MCP Server',
    description: 'Financial data and trading capabilities for AI agents',
    capabilities: [
      'market_data', 
      'technical_analysis', 
      'portfolio_management', 
      'order_execution', 
      'risk_analysis'
    ],
    authType: 'oauth2',
    maxConnections: 50,
    rateLimit: 100
  });
  const [serverMetrics, setServerMetrics] = useState({
    uptime: '0',
    activeConnections: 0,
    requestsToday: 0,
    averageResponseTime: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Simulate server activation/deactivation
  const toggleServerStatus = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsServerActive(prev => !prev);
      setIsLoading(false);
      
      toast({
        title: isServerActive ? 'Server Deactivated' : 'Server Activated',
        description: isServerActive 
          ? 'StockPulse MCP Server has been deactivated.' 
          : 'StockPulse MCP Server is now active and accepting connections.',
        variant: isServerActive ? 'default' : 'success',
      });
      
      // Update metrics if server is activated
      if (!isServerActive) {
        startMetricsSimulation();
      } else {
        // Reset metrics when server is deactivated
        setServerMetrics({
          uptime: '0',
          activeConnections: 0,
          requestsToday: 0,
          averageResponseTime: 0
        });
      }
    }, 1500);
  };

  // Simulate metrics updates for active server
  const startMetricsSimulation = () => {
    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      setServerMetrics(prev => ({
        uptime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
        activeConnections: Math.min(prev.activeConnections + (Math.random() > 0.7 ? 1 : 0), serverConfig.maxConnections),
        requestsToday: prev.requestsToday + Math.floor(Math.random() * 3),
        averageResponseTime: Math.floor(100 + Math.random() * 50)
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  };

  // Register server with federation registry
  const registerWithFederation = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: 'Server Registered',
        description: 'StockPulse MCP Server has been registered with the federation registry.',
        variant: 'success',
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP Server Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage StockPulse as an MCP server
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={isServerActive ? 'destructive' : 'default'}
            className="gap-2"
            onClick={toggleServerStatus}
            disabled={isLoading}
          >
            <Server size={16} />
            {isLoading ? 'Processing...' : isServerActive ? 'Deactivate Server' : 'Activate Server'}
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={registerWithFederation}
            disabled={isLoading || !isServerActive}
          >
            <Network size={16} />
            Register with Federation
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={isServerActive ? 'border-green-500' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Server size={18} />
              Server Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isServerActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="font-medium">{isServerActive ? 'Active' : 'Inactive'}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isServerActive 
                ? 'Server is running and accepting connections' 
                : 'Server is currently offline'}
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Uptime: {serverMetrics.uptime}
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network size={18} />
              Active Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{serverMetrics.activeConnections}</div>
            <p className="text-sm text-muted-foreground">
              Max: {serverConfig.maxConnections}
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {serverMetrics.requestsToday} requests today
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings size={18} />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{serverMetrics.averageResponseTime} ms</div>
            <p className="text-sm text-muted-foreground">
              Average response time
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Rate limit: {serverConfig.rateLimit} req/min
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Server Configuration</CardTitle>
          <CardDescription>
            Configure how StockPulse exposes capabilities as an MCP server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Server Name</label>
                <Input 
                  value={serverConfig.name} 
                  onChange={(e) => setServerConfig(prev => ({...prev, name: e.target.value}))}
                  disabled={isServerActive}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Human-readable name for this MCP server
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input 
                  value={serverConfig.description} 
                  onChange={(e) => setServerConfig(prev => ({...prev, description: e.target.value}))}
                  disabled={isServerActive}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Brief description of server capabilities
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Authentication Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={serverConfig.authType}
                  onChange={(e) => setServerConfig(prev => ({...prev, authType: e.target.value}))}
                  disabled={isServerActive}
                >
                  <option value="oauth2">OAuth 2.0</option>
                  <option value="apikey">API Key</option>
                  <option value="none">None</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Authentication method required by clients
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Maximum Connections</label>
                <Input 
                  type="number"
                  value={serverConfig.maxConnections} 
                  onChange={(e) => setServerConfig(prev => ({...prev, maxConnections: parseInt(e.target.value)}))}
                  disabled={isServerActive}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum number of simultaneous client connections
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Rate Limit (req/min)</label>
                <Input 
                  type="number"
                  value={serverConfig.rateLimit} 
                  onChange={(e) => setServerConfig(prev => ({...prev, rateLimit: parseInt(e.target.value)}))}
                  disabled={isServerActive}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum requests per minute per client
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Server URL</label>
                <Input 
                  value={'https://mcp.stockpulse.example.com/sse'}
                  disabled={true}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL for clients to connect to this MCP server
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Exposed Capabilities</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['market_data', 'technical_analysis', 'sentiment_analysis', 'order_execution', 'portfolio_management', 'risk_analysis', 'news_analysis', 'social_sentiment'].map(capability => (
                <Badge 
                  key={capability}
                  variant={serverConfig.capabilities.includes(capability) ? 'default' : 'outline'}
                  className={`cursor-pointer ${isServerActive ? 'opacity-50' : ''}`}
                  onClick={() => {
                    if (isServerActive) return;
                    
                    setServerConfig(prev => {
                      const capabilities = prev.capabilities.includes(capability)
                        ? prev.capabilities.filter(cap => cap !== capability)
                        : [...prev.capabilities, capability];
                      return {...prev, capabilities};
                    });
                  }}
                >
                  {capability}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Capabilities that this MCP server will expose to clients
            </p>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Server Configuration</AlertTitle>
            <AlertDescription>
              Changes to server configuration will only take effect after restarting the server.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button 
            variant="outline"
            disabled={isServerActive}
            onClick={() => {
              setServerConfig({
                name: 'StockPulse MCP Server',
                description: 'Financial data and trading capabilities for AI agents',
                capabilities: [
                  'market_data', 
                  'technical_analysis', 
                  'portfolio_management', 
                  'order_execution', 
                  'risk_analysis'
                ],
                authType: 'oauth2',
                maxConnections: 50,
                rateLimit: 100
              });
              
              toast({
                title: 'Configuration Reset',
                description: 'Server configuration has been reset to defaults.',
                variant: 'default',
              });
            }}
          >
            Reset to Defaults
          </Button>
          
          <Button 
            disabled={isServerActive}
            onClick={() => {
              toast({
                title: 'Configuration Saved',
                description: 'Server configuration has been saved.',
                variant: 'success',
              });
            }}
          >
            Save Configuration
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Configure security settings for the MCP server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} />
                <h3 className="font-semibold">Access Control</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Control which clients can connect to this MCP server
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Require Authentication</label>
                  <input 
                    type="checkbox" 
                    checked={serverConfig.authType !== 'none'}
                    onChange={(e) => setServerConfig(prev => ({
                      ...prev, 
                      authType: e.target.checked ? 'oauth2' : 'none'
                    }))}
                    disabled={isServerActive}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">IP Filtering</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    disabled={isServerActive}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Capability-based Access</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    disabled={isServerActive}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} />
                <h3 className="font-semibold">Data Protection</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Configure data protection settings
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">TLS Encryption</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    disabled={true}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Data Minimization</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    disabled={isServerActive}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Audit Logging</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    disabled={isServerActive}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              Exposing StockPulse as an MCP server makes its capabilities available to external clients. 
              Ensure proper authentication and access controls are configured before activating the server.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPServerConfiguration;
