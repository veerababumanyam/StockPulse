import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { useToast } from '../../hooks/useToast';
import { useTelemetry } from '../../contexts/TelemetryContext';
import { useGovernance } from '../../contexts/GovernanceContext';
import { useMCPPerformance } from '../../hooks/useMCPPerformance';
import { 
  ArrowRight, 
  Check, 
  ChevronRight, 
  HelpCircle, 
  Info, 
  Lock, 
  Server, 
  Settings, 
  Shield, 
  Zap 
} from 'lucide-react';

const MCPSetupWizard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const telemetry = useTelemetry();
  const governance = useGovernance();
  const mcpPerformance = useMCPPerformance();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardType, setWizardType] = useState<'client' | 'server' | null>(null);
  const totalSteps = 5;
  
  // Form state
  const [connectionName, setConnectionName] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connectionType, setConnectionType] = useState('standard');
  const [securityLevel, setSecurityLevel] = useState('high');
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [maxConnections, setMaxConnections] = useState(10);
  const [maxRequestsPerMinute, setMaxRequestsPerMinute] = useState(100);
  const [enableCaching, setEnableCaching] = useState(true);
  const [cacheTtl, setCacheTtl] = useState(60);
  const [mutualTls, setMutualTls] = useState(true);
  const [serverPort, setServerPort] = useState('8080');
  const [serverPath, setServerPath] = useState('/mcp/sse');
  const [serverDescription, setServerDescription] = useState('');
  const [serverCapabilities, setServerCapabilities] = useState<string[]>([
    'market_data',
    'technical_analysis',
    'sentiment_analysis',
    'portfolio_management'
  ]);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Mock available capabilities
  const availableCapabilities = [
    { id: 'market_data', name: 'Market Data', description: 'Real-time and historical market data' },
    { id: 'technical_analysis', name: 'Technical Analysis', description: 'Technical indicators and chart patterns' },
    { id: 'sentiment_analysis', name: 'Sentiment Analysis', description: 'News and social media sentiment analysis' },
    { id: 'portfolio_management', name: 'Portfolio Management', description: 'Portfolio tracking and optimization' },
    { id: 'trading_execution', name: 'Trading Execution', description: 'Order execution and management' },
    { id: 'risk_analysis', name: 'Risk Analysis', description: 'Risk assessment and management' },
    { id: 'options_analysis', name: 'Options Analysis', description: 'Options pricing and strategy analysis' },
    { id: 'crypto_data', name: 'Crypto Data', description: 'Cryptocurrency market data and analysis' }
  ];
  
  // Initialize telemetry span
  useEffect(() => {
    const span = telemetry.startSpan('mcp.setup_wizard.view', {
      'mcp.wizard.step': currentStep,
      'mcp.wizard.type': wizardType || 'not_selected'
    });
    
    return () => {
      telemetry.endSpan(span);
    };
  }, [currentStep, wizardType]);
  
  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1:
        if (!wizardType) {
          newErrors.wizardType = 'Please select a connection type';
        }
        break;
      case 2:
        if (!connectionName.trim()) {
          newErrors.connectionName = 'Connection name is required';
        }
        if (wizardType === 'client') {
          if (!serverUrl.trim()) {
            newErrors.serverUrl = 'Server URL is required';
          } else if (!/^https?:\/\//.test(serverUrl)) {
            newErrors.serverUrl = 'Server URL must start with http:// or https://';
          }
          if (!apiKey.trim()) {
            newErrors.apiKey = 'API key is required';
          }
        } else {
          if (!serverPort.trim()) {
            newErrors.serverPort = 'Server port is required';
          } else if (isNaN(Number(serverPort)) || Number(serverPort) < 1 || Number(serverPort) > 65535) {
            newErrors.serverPort = 'Server port must be a number between 1 and 65535';
          }
          if (!serverPath.trim()) {
            newErrors.serverPath = 'Server path is required';
          } else if (!serverPath.startsWith('/')) {
            newErrors.serverPath = 'Server path must start with /';
          }
        }
        break;
      case 3:
        if (wizardType === 'client') {
          if (selectedCapabilities.length === 0) {
            newErrors.capabilities = 'Please select at least one capability';
          }
        } else {
          if (serverCapabilities.length === 0) {
            newErrors.serverCapabilities = 'Please select at least one capability';
          }
        }
        break;
      case 4:
        if (wizardType === 'client') {
          if (maxConnections < 1) {
            newErrors.maxConnections = 'Max connections must be at least 1';
          }
          if (maxRequestsPerMinute < 1) {
            newErrors.maxRequestsPerMinute = 'Max requests per minute must be at least 1';
          }
          if (enableCaching && cacheTtl < 1) {
            newErrors.cacheTtl = 'Cache TTL must be at least 1 second';
          }
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      if (currentStep === 1 && wizardType === 'client') {
        // Simulate fetching capabilities from server
        setTimeout(() => {
          setCapabilities(availableCapabilities.map(cap => cap.id));
          setCurrentStep(currentStep + 1);
        }, 1000);
      } else {
        setCurrentStep(currentStep + 1);
      }
      
      // Record in telemetry
      telemetry.addEvent(telemetry.currentSpan, 'mcp.wizard.next_step', {
        'mcp.wizard.from_step': currentStep,
        'mcp.wizard.to_step': currentStep + 1
      });
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    
    // Record in telemetry
    telemetry.addEvent(telemetry.currentSpan, 'mcp.wizard.prev_step', {
      'mcp.wizard.from_step': currentStep,
      'mcp.wizard.to_step': currentStep - 1
    });
  };
  
  // Handle wizard completion
  const handleComplete = () => {
    if (validateStep()) {
      // Record in telemetry
      telemetry.addEvent(telemetry.currentSpan, 'mcp.wizard.complete', {
        'mcp.wizard.type': wizardType,
        'mcp.wizard.connection_name': connectionName
      });
      
      // Record in governance
      governance.recordAudit({
        actor: 'user',
        action: wizardType === 'client' ? 'create_mcp_client' : 'create_mcp_server',
        resource: wizardType === 'client' ? serverUrl : `localhost:${serverPort}${serverPath}`,
        outcome: 'success',
        details: `Created MCP ${wizardType} connection: ${connectionName}`,
        severity: 'info',
        tags: ['mcp', 'setup', wizardType || '']
      });
      
      // Create performance optimizations if client
      if (wizardType === 'client') {
        // Create connection pool
        mcpPerformance.createConnectionPool(serverUrl, {
          maxConnections,
          connectionTimeout: 30000,
          idleTimeout: 60000
        });
        
        // Create rate limiter
        mcpPerformance.createRateLimiter(serverUrl, maxRequestsPerMinute);
      }
      
      // Show success toast
      toast({
        title: "Setup Complete",
        description: `Your MCP ${wizardType} connection has been successfully configured.`,
        variant: "success",
      });
      
      // Navigate to appropriate page
      if (wizardType === 'client') {
        navigate('/agents/mcp-federation-registry');
      } else {
        navigate('/agents/mcp-observability');
      }
    }
  };
  
  // Toggle capability selection
  const toggleCapability = (capabilityId: string) => {
    if (selectedCapabilities.includes(capabilityId)) {
      setSelectedCapabilities(selectedCapabilities.filter(id => id !== capabilityId));
    } else {
      setSelectedCapabilities([...selectedCapabilities, capabilityId]);
    }
  };
  
  // Toggle server capability
  const toggleServerCapability = (capabilityId: string) => {
    if (serverCapabilities.includes(capabilityId)) {
      setServerCapabilities(serverCapabilities.filter(id => id !== capabilityId));
    } else {
      setServerCapabilities([...serverCapabilities, capabilityId]);
    }
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Welcome to the MCP Setup Wizard</h2>
              <p className="text-muted-foreground mt-2">
                This wizard will guide you through setting up a new MCP connection.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className={`cursor-pointer transition-all ${wizardType === 'client' ? 'ring-2 ring-primary' : 'hover:border-primary'}`}
                onClick={() => setWizardType('client')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server size={20} />
                    MCP Client
                  </CardTitle>
                  <CardDescription>
                    Connect to an existing MCP server
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Set up StockPulse as a client to connect to an external MCP server.
                    This allows you to use capabilities provided by the server.
                  </p>
                </CardContent>
                <CardFooter>
                  {wizardType === 'client' && (
                    <div className="w-full flex justify-end">
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${wizardType === 'server' ? 'ring-2 ring-primary' : 'hover:border-primary'}`}
                onClick={() => setWizardType('server')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap size={20} />
                    MCP Server
                  </CardTitle>
                  <CardDescription>
                    Expose StockPulse capabilities as an MCP server
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Set up StockPulse as an MCP server to expose its capabilities to other clients.
                    This allows other applications to use StockPulse features.
                  </p>
                </CardContent>
                <CardFooter>
                  {wizardType === 'server' && (
                    <div className="w-full flex justify-end">
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
            
            {errors.wizardType && (
              <div className="text-destructive text-sm">{errors.wizardType}</div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">
                {wizardType === 'client' ? 'MCP Client Configuration' : 'MCP Server Configuration'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {wizardType === 'client' 
                  ? 'Configure the connection to an MCP server' 
                  : 'Configure your MCP server settings'}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connectionName">Connection Name</Label>
                <Input
                  id="connectionName"
                  placeholder="Enter a name for this connection"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                />
                {errors.connectionName && (
                  <div className="text-destructive text-sm">{errors.connectionName}</div>
                )}
              </div>
              
              {wizardType === 'client' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="serverUrl">Server URL</Label>
                    <Input
                      id="serverUrl"
                      placeholder="https://mcp.example.com/sse"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                    />
                    {errors.serverUrl && (
                      <div className="text-destructive text-sm">{errors.serverUrl}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    {errors.apiKey && (
                      <div className="text-destructive text-sm">{errors.apiKey}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="connectionType">Connection Type</Label>
                    <Select value={connectionType} onValueChange={setConnectionType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select connection type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                        <SelectItem value="dedicated">Dedicated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="serverDescription">Server Description</Label>
                    <Input
                      id="serverDescription"
                      placeholder="Enter a description for your MCP server"
                      value={serverDescription}
                      onChange={(e) => setServerDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serverPort">Server Port</Label>
                      <Input
                        id="serverPort"
                        placeholder="8080"
                        value={serverPort}
                        onChange={(e) => setServerPort(e.target.value)}
                      />
                      {errors.serverPort && (
                        <div className="text-destructive text-sm">{errors.serverPort}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="serverPath">Server Path</Label>
                      <Input
                        id="serverPath"
                        placeholder="/mcp/sse"
                        value={serverPath}
                        onChange={(e) => setServerPath(e.target.value)}
                      />
                      {errors.serverPath && (
                        <div className="text-destructive text-sm">{errors.serverPath}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="securityLevel">Security Level</Label>
                    <Select value={securityLevel} onValueChange={setSecurityLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select security level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (Mutual TLS + JWT)</SelectItem>
                        <SelectItem value="medium">Medium (TLS + API Key)</SelectItem>
                        <SelectItem value="low">Low (API Key Only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">
                {wizardType === 'client' ? 'Select Capabilities' : 'Configure Server Capabilities'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {wizardType === 'client' 
                  ? 'Select which capabilities you want to use from this MCP server' 
                  : 'Configure which capabilities your MCP server will expose'}
              </p>
            </div>
            
            {wizardType === 'client' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableCapabilities.map(capability => (
                    <Card 
                      key={capability.id}
                      className={`cursor-pointer transition-all ${
                        selectedCapabilities.includes(capability.id) 
                          ? 'ring-2 ring-primary' 
                          : 'hover:border-primary'
                      }`}
                      onClick={() => toggleCapability(capability.id)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          {capability.name}
                          {selectedCapabilities.includes(capability.id) && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {capability.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {errors.capabilities && (
                  <div className="text-destructive text-sm">{errors.capabilities}</div>
                )}
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Selected Capabilities</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCapabilities.length === 0 
                          ? 'No capabilities selected' 
                          : `You've selected ${selectedCapabilities.length} capabilities`}
                      </p>
                      {selectedCapabilities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCapabilities.map(capId => {
                            const cap = availableCapabilities.find(c => c.id === capId);
                            return (
                              <div key={capId} className="bg-background text-xs px-2 py-1 rounded-full">
                                {cap?.name || capId}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableCapabilities.map(capability => (
                    <Card 
                      key={capability.id}
                      className={`cursor-pointer transition-all ${
                        serverCapabilities.includes(capability.id) 
                          ? 'ring-2 ring-primary' 
                          : 'hover:border-primary'
                      }`}
                      onClick={() => toggleServerCapability(capability.id)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          {capability.name}
                          {serverCapabilities.includes(capability.id) && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {capability.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {errors.serverCapabilities && (
                  <div className="text-destructive text-sm">{errors.serverCapabilities}</div>
                )}
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Exposed Capabilities</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {serverCapabilities.length === 0 
                          ? 'No capabilities exposed' 
                          : `You'll expose ${serverCapabilities.length} capabilities`}
                      </p>
                      {serverCapabilities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {serverCapabilities.map(capId => {
                            const cap = availableCapabilities.find(c => c.id === capId);
                            return (
                              <div key={capId} className="bg-background text-xs px-2 py-1 rounded-full">
                                {cap?.name || capId}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">
                {wizardType === 'client' ? 'Performance & Security Settings' : 'Server Security Settings'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {wizardType === 'client' 
                  ? 'Configure performance and security settings for this connection' 
                  : 'Configure security settings for your MCP server'}
              </p>
            </div>
            
            {wizardType === 'client' ? (
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-4">
                    <Zap size={18} />
                    Performance Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxConnections">Max Connections</Label>
                        <Input
                          id="maxConnections"
                          type="number"
                          min="1"
                          value={maxConnections}
                          onChange={(e) => setMaxConnections(parseInt(e.target.value))}
                        />
                        {errors.maxConnections && (
                          <div className="text-destructive text-sm">{errors.maxConnections}</div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="maxRequestsPerMinute">Max Requests/min</Label>
                        <Input
                          id="maxRequestsPerMinute"
                          type="number"
                          min="1"
                          value={maxRequestsPerMinute}
                          onChange={(e) => setMaxRequestsPerMinute(parseInt(e.target.value))}
                        />
                        {errors.maxRequestsPerMinute && (
                          <div className="text-destructive text-sm">{errors.maxRequestsPerMinute}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableCaching" className="cursor-pointer">Enable Response Caching</Label>
                        <input 
                          id="enableCaching"
                          type="checkbox" 
                          checked={enableCaching}
                          onChange={() => setEnableCaching(!enableCaching)}
                          className="h-4 w-4"
                        />
                      </div>
                      
                      {enableCaching && (
                        <div className="space-y-2 mt-2">
                          <Label htmlFor="cacheTtl">Cache TTL (seconds)</Label>
                          <Input
                            id="cacheTtl"
                            type="number"
                            min="1"
                            value={cacheTtl}
                            onChange={(e) => setCacheTtl(parseInt(e.target.value))}
                          />
                          {errors.cacheTtl && (
                            <div className="text-destructive text-sm">{errors.cacheTtl}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-4">
                    <Shield size={18} />
                    Security Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="mutualTls" className="cursor-pointer">Enable Mutual TLS</Label>
                        <input 
                          id="mutualTls"
                          type="checkbox" 
                          checked={mutualTls}
                          onChange={() => setMutualTls(!mutualTls)}
                          className="h-4 w-4"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Mutual TLS provides additional security by verifying both client and server certificates
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="securityLevel">Security Level</Label>
                      <Select value={securityLevel} onValueChange={setSecurityLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select security level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High (Mutual TLS + JWT)</SelectItem>
                          <SelectItem value="medium">Medium (TLS + API Key)</SelectItem>
                          <SelectItem value="low">Low (API Key Only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-4">
                    <Shield size={18} />
                    Authentication Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="securityLevel">Authentication Method</Label>
                      <Select value={securityLevel} onValueChange={setSecurityLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select authentication method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Mutual TLS + JWT</SelectItem>
                          <SelectItem value="medium">TLS + API Key</SelectItem>
                          <SelectItem value="low">API Key Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="mutualTls" className="cursor-pointer">Enable Mutual TLS</Label>
                        <input 
                          id="mutualTls"
                          type="checkbox" 
                          checked={mutualTls}
                          onChange={() => setMutualTls(!mutualTls)}
                          className="h-4 w-4"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Mutual TLS provides additional security by verifying both client and server certificates
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-4">
                    <Lock size={18} />
                    Access Control
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>IP Allowlisting</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Enter IP address or CIDR range"
                        />
                        <Button variant="outline" size="sm">Add</Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Leave empty to allow all IP addresses
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Rate Limiting</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="number"
                            min="1"
                            value={maxRequestsPerMinute}
                            onChange={(e) => setMaxRequestsPerMinute(parseInt(e.target.value))}
                            placeholder="Requests per minute"
                          />
                        </div>
                        <div>
                          <Select defaultValue="ip">
                            <SelectTrigger>
                              <SelectValue placeholder="Limit by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ip">IP Address</SelectItem>
                              <SelectItem value="api_key">API Key</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Review & Confirm</h2>
              <p className="text-muted-foreground mt-2">
                Review your configuration before finalizing
              </p>
            </div>
            
            <div className="border rounded-lg divide-y">
              <div className="p-4">
                <h3 className="font-medium mb-2">Connection Details</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Connection Type:</div>
                  <div>{wizardType === 'client' ? 'MCP Client' : 'MCP Server'}</div>
                  
                  <div className="text-muted-foreground">Name:</div>
                  <div>{connectionName}</div>
                  
                  {wizardType === 'client' ? (
                    <>
                      <div className="text-muted-foreground">Server URL:</div>
                      <div>{serverUrl}</div>
                      
                      <div className="text-muted-foreground">Connection Type:</div>
                      <div className="capitalize">{connectionType}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-muted-foreground">Server Address:</div>
                      <div>localhost:{serverPort}{serverPath}</div>
                      
                      <div className="text-muted-foreground">Description:</div>
                      <div>{serverDescription || 'N/A'}</div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium mb-2">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {wizardType === 'client' 
                    ? selectedCapabilities.map(capId => {
                        const cap = availableCapabilities.find(c => c.id === capId);
                        return (
                          <div key={capId} className="bg-muted text-xs px-2 py-1 rounded-full">
                            {cap?.name || capId}
                          </div>
                        );
                      })
                    : serverCapabilities.map(capId => {
                        const cap = availableCapabilities.find(c => c.id === capId);
                        return (
                          <div key={capId} className="bg-muted text-xs px-2 py-1 rounded-full">
                            {cap?.name || capId}
                          </div>
                        );
                      })
                  }
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium mb-2">
                  {wizardType === 'client' ? 'Performance & Security' : 'Security Settings'}
                </h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  {wizardType === 'client' && (
                    <>
                      <div className="text-muted-foreground">Max Connections:</div>
                      <div>{maxConnections}</div>
                      
                      <div className="text-muted-foreground">Max Requests/min:</div>
                      <div>{maxRequestsPerMinute}</div>
                      
                      <div className="text-muted-foreground">Caching:</div>
                      <div>{enableCaching ? `Enabled (${cacheTtl}s TTL)` : 'Disabled'}</div>
                    </>
                  )}
                  
                  <div className="text-muted-foreground">Security Level:</div>
                  <div>
                    {securityLevel === 'high' ? 'High (Mutual TLS + JWT)' : 
                     securityLevel === 'medium' ? 'Medium (TLS + API Key)' : 
                     'Low (API Key Only)'}
                  </div>
                  
                  <div className="text-muted-foreground">Mutual TLS:</div>
                  <div>{mutualTls ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle>MCP Setup Wizard</CardTitle>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
          <div className="w-full bg-muted h-2 rounded-full mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </CardHeader>
        
        <CardContent>
          {renderStepContent()}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          
          {currentStep < totalSteps ? (
            <Button onClick={handleNextStep}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              Complete Setup
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="max-w-4xl mx-auto mt-6 flex justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="link" className="text-muted-foreground">
                <HelpCircle className="mr-1 h-4 w-4" />
                Need help?
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                For detailed instructions on setting up MCP connections, 
                please refer to the documentation or contact support.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MCPSetupWizard;
