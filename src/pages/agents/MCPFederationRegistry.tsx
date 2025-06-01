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
  ExternalLink,
  Search,
  Globe,
  Network,
  QrCode,
  Wifi,
  Database
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../../hooks/useToast';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';

// Mock data for MCP federation registry
const initialServers = [
  {
    id: '1',
    name: 'StockData MCP Server',
    description: 'Financial data and market analysis tools',
    url: 'https://mcp.stockdata.example.com/sse',
    capabilities: ['market_data', 'technical_analysis', 'sentiment_analysis'],
    version: '1.0.0',
    authType: 'oauth2',
    status: 'active',
    category: 'finance',
    owner: 'StockData Inc.',
    created: '2025-04-10T10:30:00Z',
    updated: '2025-05-15T14:20:00Z',
    trustScore: 95,
    responseTime: 120,
    usageCount: 1243
  },
  {
    id: '2',
    name: 'Trading API MCP Server',
    description: 'Trading execution and order management',
    url: 'https://mcp.tradingapi.example.com/sse',
    capabilities: ['order_execution', 'portfolio_management', 'risk_analysis'],
    version: '1.2.1',
    authType: 'oauth2',
    status: 'active',
    category: 'finance',
    owner: 'TradingAPI Corp',
    created: '2025-03-22T08:15:00Z',
    updated: '2025-05-20T11:45:00Z',
    trustScore: 92,
    responseTime: 350,
    usageCount: 876
  },
  {
    id: '3',
    name: 'News Analysis MCP Server',
    description: 'Financial news and social media analysis',
    url: 'https://mcp.newsanalysis.example.com/sse',
    capabilities: ['news_analysis', 'social_sentiment', 'trend_detection'],
    version: '0.9.5',
    authType: 'oauth2',
    status: 'active',
    category: 'news',
    owner: 'NewsAnalysis Ltd',
    created: '2025-05-01T16:30:00Z',
    updated: '2025-05-18T09:10:00Z',
    trustScore: 88,
    responseTime: 180,
    usageCount: 542
  },
  {
    id: '4',
    name: 'Portfolio Optimizer MCP Server',
    description: 'Portfolio optimization and rebalancing',
    url: 'https://mcp.portfolioopt.example.com/sse',
    capabilities: ['portfolio_optimization', 'asset_allocation', 'rebalancing'],
    version: '1.1.0',
    authType: 'oauth2',
    status: 'maintenance',
    category: 'finance',
    owner: 'PortfolioOpt Inc.',
    created: '2025-02-15T13:45:00Z',
    updated: '2025-05-10T17:30:00Z',
    trustScore: 90,
    responseTime: 450,
    usageCount: 328
  },
  {
    id: '5',
    name: 'Crypto Data MCP Server',
    description: 'Cryptocurrency market data and analysis',
    url: 'https://mcp.cryptodata.example.com/sse',
    capabilities: ['crypto_prices', 'blockchain_analysis', 'token_metrics'],
    version: '1.3.2',
    authType: 'apikey',
    status: 'active',
    category: 'crypto',
    owner: 'CryptoData Solutions',
    created: '2025-01-20T09:00:00Z',
    updated: '2025-05-22T10:15:00Z',
    trustScore: 85,
    responseTime: 200,
    usageCount: 967
  }
];

// Mock data for connected servers
const initialConnectedServers = [
  {
    id: '1',
    name: 'StockData MCP Server',
    status: 'connected',
    lastUsed: '2025-05-27T11:30:00Z',
    responseTime: 120,
    requestsToday: 42
  },
  {
    id: '2',
    name: 'Trading API MCP Server',
    status: 'connected',
    lastUsed: '2025-05-27T10:15:00Z',
    responseTime: 350,
    requestsToday: 18
  }
];

// Mock data for discovery history
const initialDiscoveryHistory = [
  {
    id: '1',
    timestamp: '2025-05-27T11:30:00Z',
    method: 'registry',
    query: 'market_data',
    resultsCount: 3,
    selectedServer: 'StockData MCP Server'
  },
  {
    id: '2',
    timestamp: '2025-05-27T10:15:00Z',
    method: 'registry',
    query: 'order_execution',
    resultsCount: 1,
    selectedServer: 'Trading API MCP Server'
  },
  {
    id: '3',
    timestamp: '2025-05-26T15:45:00Z',
    method: 'url',
    query: 'https://mcp.newsanalysis.example.com/sse',
    resultsCount: 1,
    selectedServer: 'News Analysis MCP Server'
  },
  {
    id: '4',
    timestamp: '2025-05-25T09:20:00Z',
    method: 'network',
    query: 'local-network-scan',
    resultsCount: 0,
    selectedServer: null
  }
];

// Form schema for adding/editing MCP server
const serverFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  url: z.string().url({ message: 'Must be a valid URL' }),
  capabilities: z.array(z.string()).min(1, { message: 'At least one capability is required' }),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, { message: 'Version must be in format x.y.z' }),
  authType: z.enum(['oauth2', 'apikey', 'none']),
  category: z.string().min(1, { message: 'Category is required' }),
  owner: z.string().min(1, { message: 'Owner is required' }),
});

type ServerFormValues = z.infer<typeof serverFormSchema>;

// Form schema for discovery
const discoveryFormSchema = z.object({
  method: z.enum(['registry', 'network', 'url', 'qrcode']),
  query: z.string().min(1, { message: 'Query is required' }),
  capabilities: z.array(z.string()).optional(),
  category: z.string().optional(),
  trustScoreMin: z.number().min(0).max(100).optional(),
});

type DiscoveryFormValues = z.infer<typeof discoveryFormSchema>;

const MCPFederationRegistry: React.FC = () => {
  const [servers, setServers] = useState(initialServers);
  const [connectedServers, setConnectedServers] = useState(initialConnectedServers);
  const [discoveryHistory, setDiscoveryHistory] = useState(initialDiscoveryHistory);
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [isEditingServer, setIsEditingServer] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('registry');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const serverForm = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: '',
      description: '',
      url: '',
      capabilities: [],
      version: '1.0.0',
      authType: 'oauth2',
      category: '',
      owner: '',
    },
  });

  const discoveryForm = useForm<DiscoveryFormValues>({
    resolver: zodResolver(discoveryFormSchema),
    defaultValues: {
      method: 'registry',
      query: '',
      capabilities: [],
      category: '',
      trustScoreMin: 80,
    },
  });

  const handleAddServer = (values: ServerFormValues) => {
    const newServer = {
      id: Date.now().toString(),
      name: values.name,
      description: values.description,
      url: values.url,
      capabilities: values.capabilities,
      version: values.version,
      authType: values.authType,
      status: 'active',
      category: values.category,
      owner: values.owner,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      trustScore: 85,
      responseTime: 200,
      usageCount: 0
    };
    
    setServers(prev => [...prev, newServer]);
    setIsAddingServer(false);
    serverForm.reset();
    
    toast({
      title: 'Server Added',
      description: `${values.name} has been successfully added to the registry.`,
      variant: 'success',
    });
  };

  const handleEditServer = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;
    
    serverForm.reset({
      name: server.name,
      description: server.description,
      url: server.url,
      capabilities: server.capabilities,
      version: server.version,
      authType: server.authType as any,
      category: server.category,
      owner: server.owner,
    });
    
    setIsEditingServer(serverId);
  };

  const handleUpdateServer = (values: ServerFormValues) => {
    if (!isEditingServer) return;
    
    const updatedServers = servers.map(server => {
      if (server.id === isEditingServer) {
        return {
          ...server,
          name: values.name,
          description: values.description,
          url: values.url,
          capabilities: values.capabilities,
          version: values.version,
          authType: values.authType,
          category: values.category,
          owner: values.owner,
          updated: new Date().toISOString(),
        };
      }
      return server;
    });
    
    setServers(updatedServers);
    setIsEditingServer(null);
    serverForm.reset();
    
    toast({
      title: 'Server Updated',
      description: `${values.name} has been successfully updated.`,
      variant: 'success',
    });
  };

  const handleDeleteServer = (serverId: string) => {
    setServers(prev => prev.filter(server => server.id !== serverId));
    
    toast({
      title: 'Server Deleted',
      description: 'The server has been removed from the registry.',
      variant: 'default',
    });
  };

  const handleDiscoverServers = (values: DiscoveryFormValues) => {
    // Simulate discovery process
    setIsDiscovering(true);
    
    setTimeout(() => {
      let results: any[] = [];
      
      switch (values.method) {
        case 'registry':
          // Filter servers based on query and capabilities
          results = servers.filter(server => 
            (server.name.toLowerCase().includes(values.query.toLowerCase()) ||
             server.description.toLowerCase().includes(values.query.toLowerCase()) ||
             server.capabilities.some(cap => cap.includes(values.query.toLowerCase()))) &&
            (values.capabilities && values.capabilities.length > 0 
              ? values.capabilities.some(cap => server.capabilities.includes(cap))
              : true) &&
            (values.category 
              ? server.category === values.category
              : true) &&
            (values.trustScoreMin 
              ? server.trustScore >= values.trustScoreMin
              : true)
          );
          break;
        case 'network':
          // Simulate network discovery (only returns local servers)
          results = servers.filter(server => 
            server.url.includes('local') || 
            Math.random() > 0.7 // Randomly include some servers to simulate discovery
          ).slice(0, 2);
          break;
        case 'url':
          // Direct URL lookup
          const server = servers.find(s => s.url === values.query);
          if (server) results = [server];
          break;
        case 'qrcode':
          // Simulate QR code scan (just returns a random server)
          const randomServer = servers[Math.floor(Math.random() * servers.length)];
          results = [randomServer];
          break;
      }
      
      setDiscoveryResults(results);
      setIsDiscovering(false);
      
      // Add to discovery history
      const newHistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        method: values.method,
        query: values.query,
        resultsCount: results.length,
        selectedServer: null
      };
      
      setDiscoveryHistory(prev => [newHistoryEntry, ...prev]);
      
      toast({
        title: 'Discovery Complete',
        description: `Found ${results.length} MCP servers matching your criteria.`,
        variant: results.length > 0 ? 'success' : 'default',
      });
    }, 1500);
  };

  const handleConnectToServer = (server: any) => {
    // Check if already connected
    if (connectedServers.some(s => s.id === server.id)) {
      toast({
        title: 'Already Connected',
        description: `You are already connected to ${server.name}.`,
        variant: 'default',
      });
      return;
    }
    
    // Simulate connection process
    toast({
      title: 'Connecting...',
      description: `Establishing connection to ${server.name}.`,
      variant: 'default',
    });
    
    setTimeout(() => {
      const newConnection = {
        id: server.id,
        name: server.name,
        status: 'connected',
        lastUsed: new Date().toISOString(),
        responseTime: server.responseTime,
        requestsToday: 0
      };
      
      setConnectedServers(prev => [...prev, newConnection]);
      
      // Update discovery history if this was from a discovery
      if (discoveryResults.includes(server)) {
        setDiscoveryHistory(prev => prev.map(entry => {
          if (entry.id === discoveryHistory[0].id) {
            return {
              ...entry,
              selectedServer: server.name
            };
          }
          return entry;
        }));
      }
      
      toast({
        title: 'Connection Established',
        description: `Successfully connected to ${server.name}.`,
        variant: 'success',
      });
    }, 1000);
  };

  const handleDisconnectServer = (serverId: string) => {
    setConnectedServers(prev => prev.filter(server => server.id !== serverId));
    
    toast({
      title: 'Disconnected',
      description: 'The server connection has been closed.',
      variant: 'default',
    });
  };

  const filteredServers = servers.filter(server => {
    const matchesSearch = searchQuery === '' || 
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || server.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(servers.map(server => server.category)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'maintenance':
        return <Badge variant="warning">Maintenance</Badge>;
      case 'deprecated':
        return <Badge variant="destructive">Deprecated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'registry':
        return <Database size={16} />;
      case 'network':
        return <Wifi size={16} />;
      case 'url':
        return <Globe size={16} />;
      case 'qrcode':
        return <QrCode size={16} />;
      default:
        return <Search size={16} />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP Federation Registry</h1>
          <p className="text-muted-foreground mt-1">
            Discover, register, and connect to MCP servers across the federation
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isDiscovering || discoveryResults.length > 0} onOpenChange={(open) => {
            if (!open) setDiscoveryResults([]);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setIsDiscovering(true)}>
                <Search size={16} />
                Discover Servers
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Discover MCP Servers</DialogTitle>
                <DialogDescription>
                  Find and connect to MCP servers using various discovery methods
                </DialogDescription>
              </DialogHeader>
              
              {isDiscovering ? (
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className="animate-spin mb-4">
                    <RefreshCw size={32} />
                  </div>
                  <p className="text-center">Discovering MCP servers...</p>
                </div>
              ) : discoveryResults.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Discovery Results</h3>
                  <div className="space-y-2">
                    {discoveryResults.map(server => (
                      <div key={server.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{server.name}</h4>
                            <p className="text-sm text-muted-foreground">{server.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {server.capabilities.map((cap: string) => (
                                <Badge key={cap} variant="outline" className="text-xs">
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleConnectToServer(server)}
                            disabled={connectedServers.some(s => s.id === server.id)}
                          >
                            {connectedServers.some(s => s.id === server.id) ? 'Connected' : 'Connect'}
                          </Button>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
                          <span>Trust Score: {server.trustScore}%</span>
                          <span>Response Time: {server.responseTime}ms</span>
                          <span>Version: {server.version}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setDiscoveryResults([]);
                        setIsDiscovering(true);
                      }}
                    >
                      New Discovery
                    </Button>
                    <Button 
                      onClick={() => {
                        setDiscoveryResults([]);
                      }}
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <Form {...discoveryForm}>
                  <form onSubmit={discoveryForm.handleSubmit(handleDiscoverServers)} className="space-y-6">
                    <FormField
                      control={discoveryForm.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discovery Method</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              variant={field.value === 'registry' ? 'default' : 'outline'}
                              className="justify-start gap-2"
                              onClick={() => field.onChange('registry')}
                            >
                              <Database size={16} />
                              Registry
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === 'network' ? 'default' : 'outline'}
                              className="justify-start gap-2"
                              onClick={() => field.onChange('network')}
                            >
                              <Wifi size={16} />
                              Network
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === 'url' ? 'default' : 'outline'}
                              className="justify-start gap-2"
                              onClick={() => field.onChange('url')}
                            >
                              <Globe size={16} />
                              URL
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === 'qrcode' ? 'default' : 'outline'}
                              className="justify-start gap-2"
                              onClick={() => field.onChange('qrcode')}
                            >
                              <QrCode size={16} />
                              QR Code
                            </Button>
                          </div>
                          <FormDescription>
                            Select how you want to discover MCP servers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={discoveryForm.control}
                      name="query"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {field.value === 'registry' ? 'Search Query' : 
                             field.value === 'network' ? 'Network Scope' :
                             field.value === 'url' ? 'Server URL' :
                             'QR Code Data'}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={
                                field.value === 'registry' ? 'e.g., market_data, finance, analysis' : 
                                field.value === 'network' ? 'local, subnet, all' :
                                field.value === 'url' ? 'https://mcp.example.com/sse' :
                                'Scan QR code or enter data manually'
                              } 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value === 'registry' ? 'Search for servers by name, description, or capabilities' : 
                             field.value === 'network' ? 'Specify the network scope for discovery' :
                             field.value === 'url' ? 'Enter the exact URL of the MCP server' :
                             'Scan a QR code or enter the encoded server information'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {discoveryForm.watch('method') === 'registry' && (
                      <>
                        <FormField
                          control={discoveryForm.control}
                          name="capabilities"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Required Capabilities</FormLabel>
                              <div className="flex flex-wrap gap-2">
                                {['market_data', 'technical_analysis', 'sentiment_analysis', 'order_execution', 'portfolio_management', 'risk_analysis', 'news_analysis', 'social_sentiment'].map(capability => (
                                  <Badge 
                                    key={capability}
                                    variant={field.value?.includes(capability) ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => {
                                      const current = field.value || [];
                                      const updated = current.includes(capability)
                                        ? current.filter(cap => cap !== capability)
                                        : [...current, capability];
                                      field.onChange(updated);
                                    }}
                                  >
                                    {capability}
                                  </Badge>
                                ))}
                              </div>
                              <FormDescription>
                                Filter servers by required capabilities (optional)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={discoveryForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <div className="flex flex-wrap gap-2">
                                {categories.map(category => (
                                  <Badge 
                                    key={category}
                                    variant={field.value === category ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => {
                                      field.onChange(field.value === category ? '' : category);
                                    }}
                                  >
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                              <FormDescription>
                                Filter servers by category (optional)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={discoveryForm.control}
                          name="trustScoreMin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Trust Score: {field.value}%</FormLabel>
                              <FormControl>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={field.value}
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormDescription>
                                Only show servers with at least this trust score
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    {discoveryForm.watch('method') === 'qrcode' && (
                      <div className="flex justify-center py-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            // Simulate QR code scanning
                            toast({
                              title: 'QR Code Scanner',
                              description: 'Camera access is required to scan QR codes.',
                              variant: 'default',
                            });
                          }}
                        >
                          <QrCode size={16} />
                          Scan QR Code
                        </Button>
                      </div>
                    )}
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsDiscovering(false);
                          discoveryForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Discover</Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddingServer} onOpenChange={setIsAddingServer}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus size={16} />
                Register Server
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Register New MCP Server</DialogTitle>
                <DialogDescription>
                  Add a new MCP server to the federation registry
                </DialogDescription>
              </DialogHeader>
              
              <Form {...serverForm}>
                <form onSubmit={serverForm.handleSubmit(handleAddServer)} className="space-y-6">
                  <FormField
                    control={serverForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Server Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Financial Data MCP Server" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for this MCP server
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
                          A detailed description of the server's purpose and capabilities
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
                        <FormLabel>Server URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., https://mcp.example.com/sse" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The base URL for connecting to the MCP server
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={serverForm.control}
                    name="capabilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capabilities</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {['market_data', 'technical_analysis', 'sentiment_analysis', 'order_execution', 'portfolio_management', 'risk_analysis', 'news_analysis', 'social_sentiment', 'crypto_prices', 'blockchain_analysis', 'portfolio_optimization', 'asset_allocation'].map(capability => (
                            <Badge 
                              key={capability}
                              variant={field.value?.includes(capability) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => {
                                const current = field.value || [];
                                const updated = current.includes(capability)
                                  ? current.filter(cap => cap !== capability)
                                  : [...current, capability];
                                field.onChange(updated);
                              }}
                            >
                              {capability}
                            </Badge>
                          ))}
                        </div>
                        <FormDescription>
                          Select the capabilities provided by this MCP server
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={serverForm.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1.0.0" {...field} />
                          </FormControl>
                          <FormDescription>
                            Server version in semver format
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
                              <option value="oauth2">OAuth 2.0</option>
                              <option value="apikey">API Key</option>
                              <option value="none">None</option>
                            </select>
                          </FormControl>
                          <FormDescription>
                            Authentication method required by the server
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={serverForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., finance, news, crypto" {...field} />
                          </FormControl>
                          <FormDescription>
                            Primary category for this server
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={serverForm.control}
                      name="owner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Example Corp" {...field} />
                          </FormControl>
                          <FormDescription>
                            Organization or individual responsible for the server
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Server Registration Notice</AlertTitle>
                    <AlertDescription>
                      By registering this server, you confirm that it complies with MCP standards and security requirements.
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
                    <Button type="submit">Register Server</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={!!isEditingServer} onOpenChange={(open) => !open && setIsEditingServer(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit MCP Server</DialogTitle>
                <DialogDescription>
                  Update the information for this MCP server
                </DialogDescription>
              </DialogHeader>
              
              <Form {...serverForm}>
                <form onSubmit={serverForm.handleSubmit(handleUpdateServer)} className="space-y-6">
                  <FormField
                    control={serverForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Server Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Financial Data MCP Server" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for this MCP server
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
                          A detailed description of the server's purpose and capabilities
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
                        <FormLabel>Server URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., https://mcp.example.com/sse" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The base URL for connecting to the MCP server
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={serverForm.control}
                    name="capabilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capabilities</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {['market_data', 'technical_analysis', 'sentiment_analysis', 'order_execution', 'portfolio_management', 'risk_analysis', 'news_analysis', 'social_sentiment', 'crypto_prices', 'blockchain_analysis', 'portfolio_optimization', 'asset_allocation'].map(capability => (
                            <Badge 
                              key={capability}
                              variant={field.value?.includes(capability) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => {
                                const current = field.value || [];
                                const updated = current.includes(capability)
                                  ? current.filter(cap => cap !== capability)
                                  : [...current, capability];
                                field.onChange(updated);
                              }}
                            >
                              {capability}
                            </Badge>
                          ))}
                        </div>
                        <FormDescription>
                          Select the capabilities provided by this MCP server
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={serverForm.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1.0.0" {...field} />
                          </FormControl>
                          <FormDescription>
                            Server version in semver format
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
                              <option value="oauth2">OAuth 2.0</option>
                              <option value="apikey">API Key</option>
                              <option value="none">None</option>
                            </select>
                          </FormControl>
                          <FormDescription>
                            Authentication method required by the server
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={serverForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., finance, news, crypto" {...field} />
                          </FormControl>
                          <FormDescription>
                            Primary category for this server
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={serverForm.control}
                      name="owner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Example Corp" {...field} />
                          </FormControl>
                          <FormDescription>
                            Organization or individual responsible for the server
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
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
                    <Button type="submit">Update Server</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="registry" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="registry" className="gap-2">
            <Database size={16} />
            Registry
          </TabsTrigger>
          <TabsTrigger value="connections" className="gap-2">
            <Network size={16} />
            Connections
          </TabsTrigger>
          <TabsTrigger value="discovery" className="gap-2">
            <Search size={16} />
            Discovery History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="registry" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>MCP Server Registry</CardTitle>
                <CardDescription>
                  Browse and manage registered MCP servers
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search servers..."
                    className="w-[200px] pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server</TableHead>
                    <TableHead>Capabilities</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trust Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No servers found. Add your first server to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServers.map(server => (
                      <TableRow key={server.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{server.name}</span>
                            <span className="text-xs text-muted-foreground">{server.description}</span>
                            <span className="text-xs text-muted-foreground mt-1">{server.url}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {server.capabilities.map(capability => (
                              <Badge key={capability} variant="outline" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{server.version}</TableCell>
                        <TableCell>{getStatusBadge(server.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={server.trustScore} 
                              className="h-2 w-16" 
                              indicatorClassName={
                                server.trustScore > 90 ? 'bg-green-500' :
                                server.trustScore > 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }
                            />
                            <span>{server.trustScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleConnectToServer(server)}
                              disabled={connectedServers.some(s => s.id === server.id)}
                            >
                              {connectedServers.some(s => s.id === server.id) ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle size={14} />
                                  Connected
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <ArrowRight size={14} />
                                  Connect
                                </span>
                              )}
                            </Button>
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
                <Database className="inline-block mr-1 h-4 w-4" />
                {filteredServers.length} servers in registry
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAddingServer(true)}>
                <Plus size={14} className="mr-1" />
                Register Server
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="connections" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected MCP Servers</CardTitle>
              <CardDescription>
                Manage your active MCP server connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Requests Today</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connectedServers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No connected servers. Use the discovery tool to find and connect to MCP servers.
                      </TableCell>
                    </TableRow>
                  ) : (
                    connectedServers.map(server => (
                      <TableRow key={server.id}>
                        <TableCell>
                          <div className="font-medium">{server.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success" className="gap-1">
                            <Activity size={12} />
                            {server.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(server.lastUsed).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={
                              server.responseTime < 200 ? 'text-green-600' :
                              server.responseTime < 500 ? 'text-yellow-600' :
                              'text-red-600'
                            }>
                              {server.responseTime}ms
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{server.requestsToday}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Simulate making a request
                                const updatedServers = connectedServers.map(s => {
                                  if (s.id === server.id) {
                                    return {
                                      ...s,
                                      lastUsed: new Date().toISOString(),
                                      requestsToday: s.requestsToday + 1
                                    };
                                  }
                                  return s;
                                });
                                setConnectedServers(updatedServers);
                                
                                toast({
                                  title: 'Request Sent',
                                  description: `Successfully sent request to ${server.name}.`,
                                  variant: 'success',
                                });
                              }}
                            >
                              <Zap size={14} className="mr-1" />
                              Test
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDisconnectServer(server.id)}
                            >
                              <ArrowLeft size={14} className="mr-1" />
                              Disconnect
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
                <Network className="inline-block mr-1 h-4 w-4" />
                {connectedServers.length} active connections
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsDiscovering(true)}>
                <Search size={14} className="mr-1" />
                Discover Servers
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield size={18} />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="text-base font-semibold flex items-center gap-2">
                      <Lock size={16} />
                      OAuth Token Management
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Automatically rotate OAuth tokens for security
                    </div>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="text-base font-semibold flex items-center gap-2">
                      <Shield size={16} />
                      Server Verification
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Verify server certificates and signatures
                    </div>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="text-base font-semibold flex items-center gap-2">
                      <Eye size={16} />
                      Connection Monitoring
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Monitor and log all MCP server connections
                    </div>
                  </div>
                  <Switch checked={true} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings size={18} />
                  Connection Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="text-base font-semibold flex items-center gap-2">
                      <RefreshCw size={16} />
                      Auto-Reconnect
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Automatically reconnect to servers when available
                    </div>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="text-base font-semibold flex items-center gap-2">
                      <Wifi size={16} />
                      Network Discovery
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Allow discovery of MCP servers on local network
                    </div>
                  </div>
                  <Switch checked={false} />
                </div>
                
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="text-base font-semibold flex items-center gap-2">
                      <Database size={16} />
                      Registry Auto-Update
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Automatically update registry with new servers
                    </div>
                  </div>
                  <Switch checked={true} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="discovery" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discovery History</CardTitle>
              <CardDescription>
                Recent MCP server discovery operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Selected Server</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discoveryHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No discovery history. Use the discovery tool to find MCP servers.
                      </TableCell>
                    </TableRow>
                  ) : (
                    discoveryHistory.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(entry.method)}
                            <span className="capitalize">{entry.method}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs truncate max-w-[200px]">
                            {entry.query}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.resultsCount > 0 ? 'success' : 'outline'}>
                            {entry.resultsCount} {entry.resultsCount === 1 ? 'server' : 'servers'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entry.selectedServer ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle size={14} className="text-green-500" />
                              {entry.selectedServer}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Repeat the discovery
                              discoveryForm.reset({
                                method: entry.method as any,
                                query: entry.query,
                                capabilities: [],
                                category: '',
                                trustScoreMin: 80,
                              });
                              setIsDiscovering(true);
                            }}
                          >
                            <RefreshCw size={14} className="mr-1" />
                            Repeat
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                <Search className="inline-block mr-1 h-4 w-4" />
                {discoveryHistory.length} discovery operations
              </div>
              <Button variant="outline" size="sm" onClick={() => setDiscoveryHistory([])}>
                Clear History
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Discovery Methods</CardTitle>
              <CardDescription>
                Different ways to discover MCP servers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database size={18} />
                    <h3 className="font-semibold">Registry-based Discovery</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Search the federation registry for servers matching specific criteria such as capabilities, categories, or keywords.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      discoveryForm.reset({
                        method: 'registry',
                        query: '',
                        capabilities: [],
                        category: '',
                        trustScoreMin: 80,
                      });
                      setIsDiscovering(true);
                    }}
                  >
                    <Database size={14} className="mr-1" />
                    Search Registry
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi size={18} />
                    <h3 className="font-semibold">Network-based Discovery</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Discover MCP servers on your local network using mDNS/DNS-SD protocols for zero-configuration networking.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      discoveryForm.reset({
                        method: 'network',
                        query: 'local',
                        capabilities: [],
                        category: '',
                        trustScoreMin: 80,
                      });
                      setIsDiscovering(true);
                    }}
                  >
                    <Wifi size={14} className="mr-1" />
                    Scan Network
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={18} />
                    <h3 className="font-semibold">URL-based Discovery</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Connect directly to a known MCP server URL, bypassing discovery and connecting immediately.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      discoveryForm.reset({
                        method: 'url',
                        query: 'https://',
                        capabilities: [],
                        category: '',
                        trustScoreMin: 80,
                      });
                      setIsDiscovering(true);
                    }}
                  >
                    <Globe size={14} className="mr-1" />
                    Enter URL
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode size={18} />
                    <h3 className="font-semibold">QR Code Discovery</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Scan QR codes or follow deep links to quickly connect to MCP servers without manual configuration.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      discoveryForm.reset({
                        method: 'qrcode',
                        query: '',
                        capabilities: [],
                        category: '',
                        trustScoreMin: 80,
                      });
                      setIsDiscovering(true);
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
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Federation Registry Statistics</CardTitle>
          <CardDescription>
            Overview of MCP server registry usage and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="text-2xl font-bold">{servers.length}</div>
              <div className="text-sm text-muted-foreground">Registered Servers</div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-2xl font-bold">{connectedServers.length}</div>
              <div className="text-sm text-muted-foreground">Active Connections</div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-2xl font-bold">{discoveryHistory.length}</div>
              <div className="text-sm text-muted-foreground">Discovery Operations</div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Popular Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['market_data', 'technical_analysis', 'sentiment_analysis', 'order_execution', 'portfolio_management', 'risk_analysis'].map(capability => {
                const count = servers.filter(server => server.capabilities.includes(capability)).length;
                const percentage = Math.round((count / servers.length) * 100);
                
                return (
                  <div key={capability} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{capability}</span>
                        <span className="text-sm font-bold">{count} servers</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPFederationRegistry;
