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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  AlertCircle, 
  ArrowRight, 
  Database, 
  Globe, 
  Network, 
  QrCode, 
  Search, 
  Server, 
  Settings, 
  Wifi 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useToast } from '../../hooks/useToast';

// Import the Federation Registry component
import MCPFederationRegistry from './MCPFederationRegistry';

const AIAgents: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAgents, setConnectedAgents] = useState<string[]>([]);

  // Mock data for MCP servers
  const mcpServers = [
    {
      id: 'anthropic-claude',
      name: 'Anthropic Claude',
      description: 'Advanced reasoning and analysis capabilities',
      capabilities: ['text_generation', 'code_analysis', 'reasoning'],
      status: 'available'
    },
    {
      id: 'openai-gpt4',
      name: 'OpenAI GPT-4',
      description: 'Powerful language model with broad capabilities',
      capabilities: ['text_generation', 'image_understanding', 'code_generation'],
      status: 'available'
    },
    {
      id: 'google-gemini',
      name: 'Google Gemini',
      description: 'Multimodal AI with strong reasoning abilities',
      capabilities: ['text_generation', 'image_understanding', 'multimodal_reasoning'],
      status: 'available'
    },
    {
      id: 'local-llama',
      name: 'Local Llama 3',
      description: 'Self-hosted language model for privacy-sensitive tasks',
      capabilities: ['text_generation', 'code_generation'],
      status: 'offline'
    }
  ];

  // Mock data for agent configurations
  const agentConfigurations = [
    {
      id: 'market-analyst',
      name: 'Market Analyst',
      description: 'Analyzes market trends and provides trading insights',
      model: 'anthropic-claude',
      capabilities: ['market_analysis', 'trend_detection', 'sentiment_analysis'],
      active: true
    },
    {
      id: 'portfolio-manager',
      name: 'Portfolio Manager',
      description: 'Manages portfolio allocation and rebalancing',
      model: 'openai-gpt4',
      capabilities: ['portfolio_optimization', 'risk_assessment', 'rebalancing'],
      active: true
    },
    {
      id: 'news-analyzer',
      name: 'News Analyzer',
      description: 'Monitors news and social media for market-moving events',
      model: 'google-gemini',
      capabilities: ['news_analysis', 'social_sentiment', 'event_detection'],
      active: false
    }
  ];

  const handleConnectToMCP = (serverId: string) => {
    if (connectedAgents.includes(serverId)) {
      toast({
        title: "Already Connected",
        description: `You are already connected to this MCP server.`,
        variant: "default",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setConnectedAgents(prev => [...prev, serverId]);
      setIsConnecting(false);
      
      toast({
        title: "Connection Established",
        description: `Successfully connected to MCP server.`,
        variant: "success",
      });
    }, 1500);
  };

  const handleDisconnectFromMCP = (serverId: string) => {
    setConnectedAgents(prev => prev.filter(id => id !== serverId));
    
    toast({
      title: "Disconnected",
      description: `Successfully disconnected from MCP server.`,
      variant: "default",
    });
  };

  const handleNavigateToFederation = () => {
    navigate('/agents/federation');
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground mt-1">
            Manage AI agents and MCP connections
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleNavigateToFederation}
          >
            <Network size={16} />
            MCP Federation
          </Button>
          <Button className="gap-2">
            <Settings size={16} />
            Configure Agents
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mcp-servers">MCP Servers</TabsTrigger>
          <TabsTrigger value="agent-configs">Agent Configurations</TabsTrigger>
          <TabsTrigger value="federation">Federation Registry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Connected MCP Servers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{connectedAgents.length}</div>
                <p className="text-sm text-muted-foreground">Active connections</p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm gap-1"
                  onClick={() => setActiveTab('mcp-servers')}
                >
                  <Server size={14} />
                  View Servers
                  <ArrowRight size={14} className="ml-auto" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Agent Configurations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{agentConfigurations.length}</div>
                <p className="text-sm text-muted-foreground">Configured agents</p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm gap-1"
                  onClick={() => setActiveTab('agent-configs')}
                >
                  <Settings size={14} />
                  Manage Configurations
                  <ArrowRight size={14} className="ml-auto" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Federation Registry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">Global</div>
                <p className="text-sm text-muted-foreground">MCP server discovery</p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm gap-1"
                  onClick={() => setActiveTab('federation')}
                >
                  <Network size={14} />
                  Access Registry
                  <ArrowRight size={14} className="ml-auto" />
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>MCP Integration</CardTitle>
              <CardDescription>
                Connect StockPulse to AI models and tools using the Model Context Protocol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>What is MCP?</AlertTitle>
                <AlertDescription>
                  The Model Context Protocol (MCP) is an open standard for connecting AI models with external data sources and tools. 
                  StockPulse can function as both an MCP client and server, allowing seamless integration with AI capabilities.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Server size={18} />
                    StockPulse as MCP Client
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect to external MCP servers to enhance StockPulse with additional AI capabilities, data sources, and tools.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('mcp-servers')}
                    >
                      View Servers
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setActiveTab('federation')}
                    >
                      Discover Servers
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Database size={18} />
                    StockPulse as MCP Server
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Expose StockPulse capabilities as an MCP server, allowing other applications to access financial data and trading tools.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/settings/mcp-server')}
                    >
                      Server Settings
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "MCP Server Status",
                          description: "StockPulse MCP Server is currently active and accessible.",
                          variant: "success",
                        });
                      }}
                    >
                      Check Status
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Discovery Methods</CardTitle>
              <CardDescription>
                Different ways to discover and connect to MCP servers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database size={18} />
                    <h3 className="font-semibold">Registry</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Search the federation registry for MCP servers.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('federation')}
                  >
                    <Database size={14} className="mr-1" />
                    Open Registry
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi size={18} />
                    <h3 className="font-semibold">Network</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover MCP servers on your local network.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Network Scan",
                        description: "Scanning local network for MCP servers...",
                        variant: "default",
                      });
                      
                      setTimeout(() => {
                        toast({
                          title: "Scan Complete",
                          description: "Found 1 MCP server on your local network.",
                          variant: "success",
                        });
                      }, 2000);
                    }}
                  >
                    <Wifi size={14} className="mr-1" />
                    Scan Network
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={18} />
                    <h3 className="font-semibold">Direct URL</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect directly to a known MCP server URL.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      const input = prompt("Enter MCP server URL:");
                      if (input) {
                        toast({
                          title: "Connecting...",
                          description: `Attempting to connect to ${input}`,
                          variant: "default",
                        });
                      }
                    }}
                  >
                    <Globe size={14} className="mr-1" />
                    Enter URL
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode size={18} />
                    <h3 className="font-semibold">QR Code</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Scan a QR code to connect to an MCP server.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "QR Code Scanner",
                        description: "Camera access is required to scan QR codes.",
                        variant: "default",
                      });
                    }}
                  >
                    <QrCode size={14} className="mr-1" />
                    Scan QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mcp-servers" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>MCP Servers</CardTitle>
                <CardDescription>
                  Connect to AI models and tools using the Model Context Protocol
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Input
                  type="search"
                  placeholder="Search servers..."
                  className="w-[200px]"
                />
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('federation')}
                >
                  <Search size={16} className="mr-2" />
                  Discover Servers
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mcpServers.map(server => (
                  <div key={server.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{server.name}</h3>
                        <p className="text-sm text-muted-foreground">{server.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {server.capabilities.map(cap => (
                            <Badge key={cap} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        {server.status === 'available' ? (
                          connectedAgents.includes(server.id) ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDisconnectFromMCP(server.id)}
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              disabled={isConnecting}
                              onClick={() => handleConnectToMCP(server.id)}
                            >
                              {isConnecting ? 'Connecting...' : 'Connect'}
                            </Button>
                          )
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled
                          >
                            Offline
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
                      <span>Status: {server.status === 'available' ? 'Available' : 'Offline'}</span>
                      <span>
                        {connectedAgents.includes(server.id) ? (
                          <Badge variant="success" className="text-xs">Connected</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Not Connected</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                <Server className="inline-block mr-1 h-4 w-4" />
                {mcpServers.length} MCP servers available
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('federation')}
              >
                <Network size={14} className="mr-1" />
                Federation Registry
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="agent-configs" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Agent Configurations</CardTitle>
                <CardDescription>
                  Manage AI agent configurations and capabilities
                </CardDescription>
              </div>
              <Button>
                <Settings size={16} className="mr-2" />
                New Configuration
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentConfigurations.map(agent => (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{agent.name}</h3>
                        <p className="text-sm text-muted-foreground">{agent.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agent.capabilities.map(cap => (
                            <Badge key={cap} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Button 
                          variant={agent.active ? "outline" : "default"} 
                          size="sm"
                        >
                          {agent.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
                      <span>Model: {agent.model}</span>
                      <span>
                        {agent.active ? (
                          <Badge variant="success" className="text-xs">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Inactive</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                <Settings className="inline-block mr-1 h-4 w-4" />
                {agentConfigurations.length} agent configurations
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/agents/automation')}
              >
                Advanced Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="federation" className="mt-6">
          <MCPFederationRegistry />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAgents;
