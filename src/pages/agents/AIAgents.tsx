import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Settings, 
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Server,
  Laptop,
  Shield,
  Activity,
  Lock,
  Key,
  Eye,
  EyeOff,
  Code,
  FileJson,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../../hooks/useToast';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';

// Mock data for MCP servers
const initialMcpServers = [
  {
    id: '1',
    name: 'StockData MCP Server',
    description: 'Financial data and market analysis tools',
    url: 'https://stockdata-mcp.stockpulse.com/sse',
    type: 'server',
    status: 'active',
    authType: 'oauth',
    capabilities: ['market_data', 'technical_analysis', 'sentiment_analysis'],
    lastConnected: '2025-05-26T14:22:10Z',
    connectionCount: 1243,
    healthStatus: 'healthy',
    responseTime: 120,
    isPublic: true
  },
  {
    id: '2',
    name: 'Trading API MCP Server',
    description: 'Trading execution and order management',
    url: 'https://trading-mcp.stockpulse.com/sse',
    type: 'server',
    status: 'active',
    authType: 'api_key',
    capabilities: ['order_execution', 'portfolio_management', 'risk_analysis'],
    lastConnected: '2025-05-26T15:10:05Z',
    connectionCount: 876,
    healthStatus: 'degraded',
    responseTime: 350,
    isPublic: false
  },
  {
    id: '3',
    name: 'News Analysis MCP Client',
    description: 'External news analysis service',
    url: 'https://news-analysis.example.com/mcp',
    type: 'client',
    status: 'active',
    authType: 'oauth',
    capabilities: [],
    lastConnected: '2025-05-26T12:05:30Z',
    connectionCount: 542,
    healthStatus: 'healthy',
    responseTime: 180,
    isPublic: true
  },
  {
    id: '4',
    name: 'Portfolio Optimizer MCP Client',
    description: 'Portfolio optimization and rebalancing',
    url: 'https://portfolio-optimizer.example.com/mcp',
    type: 'client',
    status: 'inactive',
    authType: 'api_key',
    capabilities: [],
    lastConnected: '2025-05-20T09:15:30Z',
    connectionCount: 124,
    healthStatus: 'offline',
    responseTime: null,
    isPublic: true
  }
];

// Mock data for MCP tools
const mcpTools = [
  {
    id: '1',
    serverId: '1',
    name: 'get_stock_price',
    description: 'Get real-time or historical stock prices',
    parameters: {
      symbol: { type: 'string', description: 'Stock ticker symbol' },
      timeframe: { type: 'string', description: 'Time period (1d, 5d, 1mo, etc.)' }
    },
    returnType: 'object',
    usageCount: 2543,
    avgResponseTime: 85,
    status: 'active'
  },
  {
    id: '2',
    serverId: '1',
    name: 'get_technical_indicators',
    description: 'Calculate technical indicators for a stock',
    parameters: {
      symbol: { type: 'string', description: 'Stock ticker symbol' },
      indicators: { type: 'array', description: 'List of indicators to calculate' },
      period: { type: 'number', description: 'Period for calculations' }
    },
    returnType: 'object',
    usageCount: 1876,
    avgResponseTime: 150,
    status: 'active'
  },
  {
    id: '3',
    serverId: '2',
    name: 'place_order',
    description: 'Place a trading order',
    parameters: {
      symbol: { type: 'string', description: 'Stock ticker symbol' },
      orderType: { type: 'string', description: 'Market, limit, stop, etc.' },
      quantity: { type: 'number', description: 'Number of shares' },
      price: { type: 'number', description: 'Price for limit orders' }
    },
    returnType: 'object',
    usageCount: 342,
    avgResponseTime: 220,
    status: 'active'
  },
  {
    id: '4',
    serverId: '2',
    name: 'get_portfolio',
    description: 'Get current portfolio holdings',
    parameters: {
      accountId: { type: 'string', description: 'Account identifier' }
    },
    returnType: 'object',
    usageCount: 1243,
    avgResponseTime: 180,
    status: 'active'
  }
];

// Form schema for adding/editing MCP servers
const mcpServerFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  url: z.string().url({ message: 'Please enter a valid URL' }),
  type: z.enum(['server', 'client']),
  authType: z.enum(['oauth', 'api_key', 'none']),
  isPublic: z.boolean().optional(),
  capabilities: z.array(z.string()).optional(),
});

type McpServerFormValues = z.infer<typeof mcpServerFormSchema>;

// Form schema for adding/editing MCP tools
const mcpToolFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  parameters: z.string().min(2, { message: 'Parameters must be valid JSON' }),
  returnType: z.string().min(1, { message: 'Return type is required' }),
  status: z.enum(['active', 'inactive']),
});

type McpToolFormValues = z.infer<typeof mcpToolFormSchema>;

const AIAgents: React.FC = () => {
  const [mcpServers, setMcpServers] = useState(initialMcpServers);
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [isEditingServer, setIsEditingServer] = useState<string | null>(null);
  const [isAddingTool, setIsAddingTool] = useState(false);
  const [isEditingTool, setIsEditingTool] = useState<string | null>(null);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);
  const { toast } = useToast();

  const serverForm = useForm<McpServerFormValues>({
    resolver: zodResolver(mcpServerFormSchema),
    defaultValues: {
      name: '',
      description: '',
      url: '',
      type: 'server',
      authType: 'oauth',
      isPublic: false,
      capabilities: [],
    },
  });

  const toolForm = useForm<McpToolFormValues>({
    resolver: zodResolver(mcpToolFormSchema),
    defaultValues: {
      name: '',
      description: '',
      parameters: '{}',
      returnType: 'object',
      status: 'active',
    },
  });

  const toggleCredentialsVisibility = (serverId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [serverId]: !prev[serverId]
    }));
  };

  const handleAddServer = (values: McpServerFormValues) => {
    const newServer = {
      id: Date.now().toString(),
      name: values.name,
      description: values.description,
      url: values.url,
      type: values.type,
      status: 'inactive',
      authType: values.authType,
      capabilities: values.capabilities || [],
      lastConnected: null,
      connectionCount: 0,
      healthStatus: 'unknown',
      responseTime: null,
      isPublic: values.isPublic || false
    };
    
    setMcpServers(prev => [...prev, newServer]);
    setIsAddingServer(false);
    serverForm.reset();
    
    toast({
      title: "MCP Server Added",
      description: `${values.name} has been successfully added.`,
      variant: "success",
    });
  };

  const handleEditServer = (serverId: string) => {
    const server = mcpServers.find(s => s.id === serverId);
    if (!server) return;
    
    serverForm.reset({
      name: server.name,
      description: server.description,
      url: server.url,
      type: server.type,
      authType: server.authType,
      isPublic: server.isPublic,
      capabilities: server.capabilities,
    });
    
    setIsEditingServer(serverId);
  };

  const handleUpdateServer = (values: McpServerFormValues) => {
    if (!isEditingServer) return;
    
    const updatedServers = mcpServers.map(server => {
      if (server.id === isEditingServer) {
        return {
          ...server,
          name: values.name,
          description: values.description,
          url: values.url,
          type: values.type,
          authType: values.authType,
          isPublic: values.isPublic || false,
          capabilities: values.capabilities || [],
        };
      }
      return server;
    });
    
    setMcpServers(updatedServers);
    setIsEditingServer(null);
    serverForm.reset();
    
    toast({
      title: "MCP Server Updated",
      description: `${values.name} has been successfully updated.`,
      variant: "success",
    });
  };

  const handleDeleteServer = (serverId: string) => {
    setMcpServers(prev => prev.filter(server => server.id !== serverId));
    
    toast({
      title: "MCP Server Deleted",
      description: "The MCP server has been removed.",
      variant: "default",
    });
  };

  const handleTestConnection = (serverId: string) => {
    setIsTestingConnection(serverId);
    
    // Simulate connection test
    setTimeout(() => {
      setIsTestingConnection(null);
      
      // Update server status
      const updatedServers = mcpServers.map(server => {
        if (server.id === serverId) {
          return {
            ...server,
            status: 'active',
            healthStatus: 'healthy',
            lastConnected: new Date().toISOString(),
            responseTime: Math.floor(Math.random() * 200) + 50,
          };
        }
        return server;
      });
      
      setMcpServers(updatedServers);
      
      toast({
        title: "Connection Successful",
        description: "The MCP server connection was tested successfully.",
        variant: "success",
      });
    }, 1500);
  };

  const handleAddTool = (values: McpToolFormValues) => {
    if (!selectedServerId) return;
    
    try {
      // Validate JSON
      JSON.parse(values.parameters);
      
      const newTool = {
        id: Date.now().toString(),
        serverId: selectedServerId,
        name: values.name,
        description: values.description,
        parameters: JSON.parse(values.parameters),
        returnType: values.returnType,
        usageCount: 0,
        avgResponseTime: 0,
        status: values.status
      };
      
      // In a real implementation, we would add the tool to the server
      
      setIsAddingTool(false);
      toolForm.reset();
      
      toast({
        title: "MCP Tool Added",
        description: `${values.name} has been successfully added.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Invalid Parameters",
        description: "The parameters must be valid JSON.",
        variant: "destructive",
      });
    }
  };

  const filteredServers = activeTab === 'all' 
    ? mcpServers 
    : mcpServers.filter(server => server.type === activeTab);

  const getServerTools = (serverId: string) => {
    return mcpTools.filter(tool => tool.serverId === serverId);
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage Model Context Protocol (MCP) servers and clients
          </p>
        </div>
        
        <Dialog open={isAddingServer} onOpenChange={setIsAddingServer}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add MCP Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New MCP Connection</DialogTitle>
              <DialogDescription>
                Configure a new MCP server or client connection.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...serverForm}>
              <form onSubmit={serverForm.handleSubmit(handleAddServer)} className="space-y-6">
                <FormField
                  control={serverForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection Type</FormLabel>
                      <div className="flex gap-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="radio"
                              checked={field.value === 'server'}
                              onChange={() => field.onChange('server')}
                              className="h-4 w-4 text-primary"
                            />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center gap-1">
                            <Server size={16} />
                            MCP Server
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="radio"
                              checked={field.value === 'client'}
                              onChange={() => field.onChange('client')}
                              className="h-4 w-4 text-primary"
                            />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center gap-1">
                            <Laptop size={16} />
                            MCP Client
                          </FormLabel>
                        </FormItem>
                      </div>
                      <FormDescription>
                        {field.value === 'server' 
                          ? 'Expose StockPulse capabilities as MCP tools to external clients' 
                          : 'Connect to external MCP servers to consume their tools'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serverForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Financial Data MCP Server" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this MCP connection
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serverForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Provides financial data and market analysis tools" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description of the MCP connection's purpose
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serverForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., https://example.com/mcp/sse" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {serverForm.watch('type') === 'server' 
                          ? 'The URL where this MCP server will be exposed' 
                          : 'The URL of the external MCP server'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serverForm.control}
                  name="authType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="oauth">OAuth 2.0</option>
                          <option value="api_key">API Key</option>
                          <option value="none">None (Public)</option>
                        </select>
                      </FormControl>
                      <FormDescription>
                        {field.value === 'oauth' 
                          ? 'OAuth 2.0 authentication with authorization code flow' 
                          : field.value === 'api_key' 
                            ? 'Simple API key authentication' 
                            : 'No authentication (public access)'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {serverForm.watch('type') === 'server' && (
                  <FormField
                    control={serverForm.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Globe size={16} />
                            Public Server
                          </FormLabel>
                          <FormDescription>
                            Make this MCP server publicly accessible (with authentication)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                
                {serverForm.watch('type') === 'server' && (
                  <FormField
                    control={serverForm.control}
                    name="capabilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capabilities</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {['market_data', 'technical_analysis', 'sentiment_analysis', 'order_execution', 'portfolio_management', 'risk_analysis'].map(capability => (
                              <Badge 
                                key={capability}
                                variant={field.value?.includes(capability) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = field.value || [];
                                  const updated = current.includes(capability)
                                    ? current.filter(c => c !== capability)
                                    : [...current, capability];
                                  field.onChange(updated);
                                }}
                              >
                                {capability.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Select the capabilities this MCP server will provide
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <Alert variant="warning" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Security Notice</AlertTitle>
                  <AlertDescription>
                    {serverForm.watch('type') === 'server' 
                      ? 'Exposing MCP servers requires proper security configuration and user consent management.' 
                      : 'Connecting to external MCP servers grants them access to execute operations within StockPulse.'}
                  </AlertDescription>
                </Alert>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingServer(false);
                      serverForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Connection</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={!!isEditingServer} onOpenChange={(open) => !open && setIsEditingServer(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit MCP Connection</DialogTitle>
              <DialogDescription>
                Update the configuration for this MCP connection.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...serverForm}>
              <form onSubmit={serverForm.handleSubmit(handleUpdateServer)} className="space-y-6">
                <FormField
                  control={serverForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection Type</FormLabel>
                      <div className="flex gap-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="radio"
                              checked={field.value === 'server'}
                              onChange={() => field.onChange('server')}
                              className="h-4 w-4 text-primary"
                              disabled={true} // Can't change type when editing
                            />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center gap-1">
                            <Server size={16} />
                            MCP Server
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="radio"
                              checked={field.value === 'client'}
                              onChange={() => field.onChange('client')}
                              className="h-4 w-4 text-primary"
                              disabled={true} // Can't change type when editing
                            />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center gap-1">
                            <Laptop size={16} />
                            MCP Client
                          </FormLabel>
                        </FormItem>
                      </div>
                      <FormDescription>
                        {field.value === 'server' 
                          ? 'Expose StockPulse capabilities as MCP tools to external clients' 
                          : 'Connect to external MCP servers to consume their tools'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serverForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Financial Data MCP Server" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this MCP connection
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serverForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Provides financial data and market analysis tools" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description of the MCP connection's purpose
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serverForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., https://example.com/mcp/sse" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {serverForm.watch('type') === 'server' 
                          ? 'The URL where this MCP server will be exposed' 
                          : 'The URL of the external MCP server'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={serverForm.control}
                  name="authType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="oauth">OAuth 2.0</option>
                          <option value="api_key">API Key</option>
                          <option value="none">None (Public)</option>
                        </select>
                      </FormControl>
                      <FormDescription>
                        {field.value === 'oauth' 
                          ? 'OAuth 2.0 authentication with authorization code flow' 
                          : field.value === 'api_key' 
                            ? 'Simple API key authentication' 
                            : 'No authentication (public access)'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {serverForm.watch('type') === 'server' && (
                  <FormField
                    control={serverForm.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Globe size={16} />
                            Public Server
                          </FormLabel>
                          <FormDescription>
                            Make this MCP server publicly accessible (with authentication)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                
                {serverForm.watch('type') === 'server' && (
                  <FormField
                    control={serverForm.control}
                    name="capabilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capabilities</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {['market_data', 'technical_analysis', 'sentiment_analysis', 'order_execution', 'portfolio_management', 'risk_analysis'].map(capability => (
                              <Badge 
                                key={capability}
                                variant={field.value?.includes(capability) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = field.value || [];
                                  const updated = current.includes(capability)
                                    ? current.filter(c => c !== capability)
                                    : [...current, capability];
                                  field.onChange(updated);
                                }}
                              >
                                {capability.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Select the capabilities this MCP server will provide
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingServer(null);
                      serverForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Connection</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isAddingTool} onOpenChange={setIsAddingTool}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New MCP Tool</DialogTitle>
              <DialogDescription>
                Configure a new tool for the selected MCP server.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...toolForm}>
              <form onSubmit={toolForm.handleSubmit(handleAddTool)} className="space-y-6">
                <FormField
                  control={toolForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tool Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., get_stock_price" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this tool (use snake_case)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={toolForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Get real-time or historical stock prices" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description of what this tool does
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={toolForm.control}
                  name="parameters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parameters (JSON)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={`{\n  "symbol": { "type": "string", "description": "Stock ticker symbol" },\n  "timeframe": { "type": "string", "description": "Time period (1d, 5d, 1mo, etc.)" }\n}`}
                          {...field} 
                          className="font-mono text-sm"
                          rows={8}
                        />
                      </FormControl>
                      <FormDescription>
                        JSON schema for the tool parameters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={toolForm.control}
                  name="returnType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="object">Object</option>
                          <option value="array">Array</option>
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                        </select>
                      </FormControl>
                      <FormDescription>
                        The type of data returned by this tool
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={toolForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Enable this tool for use by MCP clients
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 'active'}
                          onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingTool(false);
                      toolForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Tool</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Connections ({mcpServers.length})</TabsTrigger>
          <TabsTrigger value="server">MCP Servers ({mcpServers.filter(s => s.type === 'server').length})</TabsTrigger>
          <TabsTrigger value="client">MCP Clients ({mcpServers.filter(s => s.type === 'client').length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>MCP Connections</CardTitle>
              <CardDescription>
                Manage your Model Context Protocol servers and clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Authentication</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No MCP connections found. Add your first connection to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServers.map(server => (
                      <TableRow key={server.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{server.name}</span>
                            <span className="text-xs text-muted-foreground">{server.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={server.type === 'server' ? 'default' : 'secondary'}>
                            {server.type === 'server' ? (
                              <div className="flex items-center gap-1">
                                <Server size={12} />
                                Server
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Laptop size={12} />
                                Client
                              </div>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            <code className="bg-muted px-1 py-0.5 rounded">{server.url}</code>
                            <a 
                              href={server.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {server.authType === 'oauth' ? (
                              <div className="flex items-center gap-1">
                                <Lock size={12} />
                                OAuth
                              </div>
                            ) : server.authType === 'api_key' ? (
                              <div className="flex items-center gap-1">
                                <Key size={12} />
                                API Key
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Globe size={12} />
                                Public
                              </div>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${getHealthStatusColor(server.healthStatus)}`}></div>
                            <span className="capitalize">{server.healthStatus}</span>
                            {server.responseTime && (
                              <span className="text-xs text-muted-foreground">
                                {server.responseTime}ms
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={server.status === 'active' ? 'success' : 'destructive'}>
                            {server.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleTestConnection(server.id)}
                              disabled={isTestingConnection === server.id}
                            >
                              {isTestingConnection === server.id ? (
                                <span className="flex items-center gap-1">
                                  <RefreshCw size={14} className="animate-spin" />
                                  Testing...
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Activity size={14} />
                                  Test
                                </span>
                              )}
                            </Button>
                            {server.type === 'server' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedServerId(server.id);
                                  setIsAddingTool(true);
                                }}
                              >
                                <Code size={14} className="mr-1" />
                                Add Tool
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditServer(server.id)}
                            >
                              <Settings size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteServer(server.id)}
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                <Shield className="inline-block mr-1 h-4 w-4" />
                MCP connections are secured with OAuth or API keys
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAddingServer(true)}>
                <Plus size={14} className="mr-1" />
                Add Connection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {filteredServers.filter(server => server.type === 'server').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>MCP Tools</CardTitle>
            <CardDescription>
              Tools exposed by your MCP servers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={filteredServers.find(s => s.type === 'server')?.id || ''}>
              <TabsList className="mb-4">
                {filteredServers
                  .filter(server => server.type === 'server')
                  .map(server => (
                    <TabsTrigger key={server.id} value={server.id}>
                      {server.name}
                    </TabsTrigger>
                  ))}
              </TabsList>
              
              {filteredServers
                .filter(server => server.type === 'server')
                .map(server => (
                  <TabsContent key={server.id} value={server.id}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">{server.name} Tools</h3>
                          <p className="text-sm text-muted-foreground">
                            Tools exposed by this MCP server
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedServerId(server.id);
                            setIsAddingTool(true);
                          }}
                        >
                          <Plus size={14} className="mr-1" />
                          Add Tool
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getServerTools(server.id).map(tool => (
                          <Card key={tool.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Code size={16} />
                                {tool.name}
                              </CardTitle>
                              <CardDescription>
                                {tool.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="space-y-2">
                                <div>
                                  <h4 className="text-sm font-semibold">Parameters</h4>
                                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mt-1">
                                    {JSON.stringify(tool.parameters, null, 2)}
                                  </pre>
                                </div>
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="text-sm font-semibold">Return Type</h4>
                                    <Badge variant="outline" className="mt-1">
                                      {tool.returnType}
                                    </Badge>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold">Status</h4>
                                    <Badge 
                                      variant={tool.status === 'active' ? 'success' : 'destructive'}
                                      className="mt-1"
                                    >
                                      {tool.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold">Usage</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Progress value={(tool.usageCount / 3000) * 100} className="h-2" />
                                    <span className="text-xs text-muted-foreground">
                                      {tool.usageCount} calls
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between pt-2 border-t">
                              <div className="text-xs text-muted-foreground">
                                Avg. response time: {tool.avgResponseTime}ms
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <FileJson size={14} className="mr-1" />
                                  Schema
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Settings size={14} className="mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                        
                        {getServerTools(server.id).length === 0 && (
                          <div className="col-span-2 text-center py-8 text-muted-foreground border rounded-lg">
                            <div className="flex flex-col items-center gap-2">
                              <Code size={24} />
                              <h3 className="font-semibold">No tools configured</h3>
                              <p className="text-sm max-w-md mx-auto">
                                This MCP server doesn't have any tools configured yet. Add your first tool to make this server useful.
                              </p>
                              <Button 
                                className="mt-2"
                                onClick={() => {
                                  setSelectedServerId(server.id);
                                  setIsAddingTool(true);
                                }}
                              >
                                <Plus size={14} className="mr-1" />
                                Add Tool
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>MCP Observability</CardTitle>
          <CardDescription>
            Monitor the health and performance of your MCP connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mcpServers.filter(s => s.status === 'active').length}
                  <span className="text-muted-foreground text-sm font-normal ml-1">/ {mcpServers.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mcpServers.filter(s => s.type === 'server' && s.status === 'active').length} servers, 
                  {' '}{mcpServers.filter(s => s.type === 'client' && s.status === 'active').length} clients
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mcpServers.reduce((sum, server) => sum + (server.connectionCount || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    mcpServers
                      .filter(s => s.responseTime)
                      .reduce((sum, server) => sum + (server.responseTime || 0), 0) / 
                    mcpServers.filter(s => s.responseTime).length
                  )}ms
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all active connections
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Health Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">{mcpServers.filter(s => s.healthStatus === 'healthy').length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">{mcpServers.filter(s => s.healthStatus === 'degraded').length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">{mcpServers.filter(s => s.healthStatus === 'offline').length}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Healthy / Degraded / Offline
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Connection</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs">2025-05-27 11:10:05</TableCell>
                    <TableCell>Trading API MCP Server</TableCell>
                    <TableCell>Tool Execution</TableCell>
                    <TableCell>
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">place_order</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">Success</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">2025-05-27 11:08:32</TableCell>
                    <TableCell>StockData MCP Server</TableCell>
                    <TableCell>Tool Execution</TableCell>
                    <TableCell>
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">get_technical_indicators</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">Success</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">2025-05-27 11:05:17</TableCell>
                    <TableCell>News Analysis MCP Client</TableCell>
                    <TableCell>Connection</TableCell>
                    <TableCell>Client connected</TableCell>
                    <TableCell>
                      <Badge variant="success">Success</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">2025-05-27 11:02:45</TableCell>
                    <TableCell>StockData MCP Server</TableCell>
                    <TableCell>Tool Execution</TableCell>
                    <TableCell>
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">get_stock_price</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">Success</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs">2025-05-27 10:58:12</TableCell>
                    <TableCell>Portfolio Optimizer MCP Client</TableCell>
                    <TableCell>Connection</TableCell>
                    <TableCell>Connection failed</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Error</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm">
                View Full Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>MCP Security</CardTitle>
          <CardDescription>
            Security settings and best practices for MCP connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield size={16} className="text-green-600" />
                    OAuth Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Client ID</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {showCredentials['oauth'] 
                            ? 'stockpulse-mcp-12345' 
                            : '••••••••••••••••••'}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleCredentialsVisibility('oauth')}
                          className="h-6 w-6"
                        >
                          {showCredentials['oauth'] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Client Secret</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {showCredentials['oauth'] 
                            ? 'sk_live_mcp_67890abcdef' 
                            : '••••••••••••••••••'}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleCredentialsVisibility('oauth')}
                          className="h-6 w-6"
                        >
                          {showCredentials['oauth'] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Redirect URI</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        https://stockpulse.com/mcp/oauth/callback
                      </code>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <RefreshCw size={14} className="mr-1" />
                    Rotate Credentials
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Key size={16} className="text-green-600" />
                    API Key Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Key</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {showCredentials['apikey'] 
                            ? 'mcp_key_12345abcdef67890' 
                            : '••••••••••••••••••'}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleCredentialsVisibility('apikey')}
                          className="h-6 w-6"
                        >
                          {showCredentials['apikey'] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Created</span>
                      <span className="text-xs text-muted-foreground">
                        2025-04-15
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Used</span>
                      <span className="text-xs text-muted-foreground">
                        2025-05-26
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <RefreshCw size={14} className="mr-1" />
                    Generate New Key
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Security Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 text-green-600">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-sm">
                      <strong>User Consent:</strong> Always obtain explicit user consent before sharing data with MCP servers or executing tools from MCP clients.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 text-green-600">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-sm">
                      <strong>Credential Rotation:</strong> Rotate OAuth credentials and API keys regularly (every 90 days recommended).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 text-green-600">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-sm">
                      <strong>Tool Validation:</strong> Validate all tool inputs and outputs to prevent injection attacks and data leakage.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 text-green-600">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-sm">
                      <strong>Access Control:</strong> Implement fine-grained access control for MCP tools based on user roles and permissions.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 text-green-600">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-sm">
                      <strong>Monitoring:</strong> Regularly review MCP connection logs for suspicious activity and set up alerts for unusual patterns.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgents;

// Missing component for demo purposes
const Globe = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
};
