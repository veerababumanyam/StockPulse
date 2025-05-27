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
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
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
import { useToast } from '../../hooks/useToast';
import { useTelemetry } from '../../contexts/TelemetryContext';
import { useGovernance } from '../../contexts/GovernanceContext';
import { useMCPPerformance } from '../../hooks/useMCPPerformance';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { 
  Activity, 
  AlertCircle, 
  ArrowUpDown, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Database, 
  Download, 
  ExternalLink, 
  Filter, 
  GitCommit, 
  Globe, 
  Info, 
  Link, 
  Lock, 
  Network, 
  Plus, 
  RefreshCw, 
  Search, 
  Server, 
  Settings, 
  Share2, 
  Shield, 
  Zap 
} from 'lucide-react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  MarkerType,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node types
const nodeTypes = {
  server: ServerNode,
  client: ClientNode,
  capability: CapabilityNode,
};

// Server node component
function ServerNode({ data }) {
  return (
    <div className="bg-background border-2 border-primary rounded-lg p-3 shadow-md w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Server className="h-5 w-5 text-primary" />
        <div className="font-medium truncate">{data.label}</div>
      </div>
      <div className="text-xs text-muted-foreground mb-2 truncate">{data.url}</div>
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">
          {data.capabilities} capabilities
        </Badge>
        <Badge variant={data.status === 'active' ? 'success' : 'destructive'} className="text-xs">
          {data.status}
        </Badge>
      </div>
    </div>
  );
}

// Client node component
function ClientNode({ data }) {
  return (
    <div className="bg-background border-2 border-secondary rounded-lg p-3 shadow-md w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-5 w-5 text-secondary" />
        <div className="font-medium truncate">{data.label}</div>
      </div>
      <div className="text-xs text-muted-foreground mb-2 truncate">{data.description}</div>
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">
          {data.connections} connections
        </Badge>
        <Badge variant={data.status === 'active' ? 'success' : 'destructive'} className="text-xs">
          {data.status}
        </Badge>
      </div>
    </div>
  );
}

// Capability node component
function CapabilityNode({ data }) {
  return (
    <div className="bg-background border-2 border-muted rounded-lg p-3 shadow-md w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-5 w-5 text-yellow-500" />
        <div className="font-medium truncate">{data.label}</div>
      </div>
      <div className="text-xs text-muted-foreground mb-2 truncate">{data.description}</div>
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">
          {data.type}
        </Badge>
      </div>
    </div>
  );
}

const MCPCapabilityMapping: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const telemetry = useTelemetry();
  const governance = useGovernance();
  const mcpPerformance = useMCPPerformance();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCapabilities, setShowCapabilities] = useState(true);
  
  // State for layout
  const [layoutDirection, setLayoutDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  
  // State for selected node
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Mock data for servers
  const servers = [
    {
      id: 'server-1',
      name: 'Market Data Server',
      url: 'https://mcp.marketdata.example.com/sse',
      capabilities: 3,
      status: 'active',
      description: 'Primary market data provider',
      capabilityIds: ['cap-1', 'cap-2', 'cap-3']
    },
    {
      id: 'server-2',
      name: 'Technical Analysis Server',
      url: 'https://mcp.technicalanalysis.example.com/sse',
      capabilities: 4,
      status: 'active',
      description: 'Technical indicators and patterns',
      capabilityIds: ['cap-4', 'cap-5', 'cap-6', 'cap-7']
    },
    {
      id: 'server-3',
      name: 'Sentiment Analysis Server',
      url: 'https://mcp.sentiment.example.com/sse',
      capabilities: 2,
      status: 'inactive',
      description: 'News and social media sentiment',
      capabilityIds: ['cap-8', 'cap-9']
    }
  ];
  
  // Mock data for clients
  const clients = [
    {
      id: 'client-1',
      name: 'StockPulse',
      description: 'Main application',
      connections: 3,
      status: 'active',
      serverIds: ['server-1', 'server-2', 'server-3']
    },
    {
      id: 'client-2',
      name: 'Mobile App',
      description: 'iOS/Android client',
      connections: 2,
      status: 'active',
      serverIds: ['server-1', 'server-2']
    },
    {
      id: 'client-3',
      name: 'Trading Bot',
      description: 'Automated trading system',
      connections: 1,
      status: 'active',
      serverIds: ['server-2']
    }
  ];
  
  // Mock data for capabilities
  const capabilities = [
    {
      id: 'cap-1',
      name: 'Real-time Quotes',
      description: 'Live market quotes',
      type: 'market_data',
      serverId: 'server-1'
    },
    {
      id: 'cap-2',
      name: 'Historical Data',
      description: 'Historical price data',
      type: 'market_data',
      serverId: 'server-1'
    },
    {
      id: 'cap-3',
      name: 'Company Fundamentals',
      description: 'Financial statements and metrics',
      type: 'market_data',
      serverId: 'server-1'
    },
    {
      id: 'cap-4',
      name: 'Moving Averages',
      description: 'SMA, EMA calculations',
      type: 'technical_analysis',
      serverId: 'server-2'
    },
    {
      id: 'cap-5',
      name: 'RSI',
      description: 'Relative Strength Index',
      type: 'technical_analysis',
      serverId: 'server-2'
    },
    {
      id: 'cap-6',
      name: 'MACD',
      description: 'Moving Average Convergence Divergence',
      type: 'technical_analysis',
      serverId: 'server-2'
    },
    {
      id: 'cap-7',
      name: 'Bollinger Bands',
      description: 'Volatility bands',
      type: 'technical_analysis',
      serverId: 'server-2'
    },
    {
      id: 'cap-8',
      name: 'News Sentiment',
      description: 'News article sentiment analysis',
      type: 'sentiment_analysis',
      serverId: 'server-3'
    },
    {
      id: 'cap-9',
      name: 'Social Media Sentiment',
      description: 'Social media sentiment analysis',
      type: 'sentiment_analysis',
      serverId: 'server-3'
    }
  ];
  
  // Initialize flow chart
  useEffect(() => {
    generateGraph();
    
    // Record in telemetry
    const span = telemetry.startSpan('mcp.capability_mapping.view', {
      'mcp.capability_mapping.nodes': nodes.length,
      'mcp.capability_mapping.edges': edges.length
    });
    
    return () => {
      telemetry.endSpan(span);
    };
  }, [statusFilter, typeFilter, showCapabilities, layoutDirection]);
  
  // Generate graph based on filters
  const generateGraph = () => {
    const newNodes = [];
    const newEdges = [];
    let xPos = 0;
    let yPos = 0;
    const xGap = layoutDirection === 'horizontal' ? 300 : 250;
    const yGap = layoutDirection === 'horizontal' ? 150 : 200;
    
    // Filter servers
    const filteredServers = servers.filter(server => {
      if (statusFilter !== 'all' && server.status !== statusFilter) return false;
      if (searchQuery && !server.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !server.url.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
    
    // Filter clients
    const filteredClients = clients.filter(client => {
      if (statusFilter !== 'all' && client.status !== statusFilter) return false;
      if (searchQuery && !client.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !client.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
    
    // Filter capabilities
    const filteredCapabilities = capabilities.filter(capability => {
      if (typeFilter !== 'all' && capability.type !== typeFilter) return false;
      if (searchQuery && !capability.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !capability.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
    
    // Add client nodes
    filteredClients.forEach((client, index) => {
      if (layoutDirection === 'horizontal') {
        xPos = 100;
        yPos = 100 + index * yGap;
      } else {
        xPos = 100 + index * xGap;
        yPos = 100;
      }
      
      newNodes.push({
        id: client.id,
        type: 'client',
        position: { x: xPos, y: yPos },
        data: {
          label: client.name,
          description: client.description,
          connections: client.connections,
          status: client.status
        },
        sourcePosition: layoutDirection === 'horizontal' ? Position.Right : Position.Bottom,
        targetPosition: layoutDirection === 'horizontal' ? Position.Left : Position.Top,
      });
    });
    
    // Add server nodes
    filteredServers.forEach((server, index) => {
      if (layoutDirection === 'horizontal') {
        xPos = 500;
        yPos = 100 + index * yGap;
      } else {
        xPos = 100 + index * xGap;
        yPos = 400;
      }
      
      newNodes.push({
        id: server.id,
        type: 'server',
        position: { x: xPos, y: yPos },
        data: {
          label: server.name,
          url: server.url,
          capabilities: server.capabilities,
          status: server.status,
          description: server.description
        },
        sourcePosition: layoutDirection === 'horizontal' ? Position.Right : Position.Bottom,
        targetPosition: layoutDirection === 'horizontal' ? Position.Left : Position.Top,
      });
    });
    
    // Add capability nodes if enabled
    if (showCapabilities) {
      filteredCapabilities.forEach((capability, index) => {
        const server = servers.find(s => s.id === capability.serverId);
        if (!server || !filteredServers.includes(server)) return;
        
        if (layoutDirection === 'horizontal') {
          xPos = 900;
          yPos = 100 + index * (yGap / 1.5);
        } else {
          xPos = 100 + index * (xGap / 1.5);
          yPos = 700;
        }
        
        newNodes.push({
          id: capability.id,
          type: 'capability',
          position: { x: xPos, y: yPos },
          data: {
            label: capability.name,
            description: capability.description,
            type: capability.type
          },
          targetPosition: layoutDirection === 'horizontal' ? Position.Left : Position.Top,
        });
      });
    }
    
    // Add edges between clients and servers
    filteredClients.forEach(client => {
      client.serverIds.forEach(serverId => {
        const server = servers.find(s => s.id === serverId);
        if (!server || !filteredServers.includes(server)) return;
        
        newEdges.push({
          id: `${client.id}-${serverId}`,
          source: client.id,
          target: serverId,
          animated: true,
          style: { stroke: '#64748b' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: '#64748b',
          },
        });
      });
    });
    
    // Add edges between servers and capabilities
    if (showCapabilities) {
      filteredServers.forEach(server => {
        server.capabilityIds.forEach(capId => {
          const capability = capabilities.find(c => c.id === capId);
          if (!capability || !filteredCapabilities.includes(capability)) return;
          
          newEdges.push({
            id: `${server.id}-${capId}`,
            source: server.id,
            target: capId,
            animated: false,
            style: { stroke: '#94a3b8' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: '#94a3b8',
            },
          });
        });
      });
    }
    
    setNodes(newNodes);
    setEdges(newEdges);
  };
  
  // Handle node click
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    
    // Record in telemetry
    telemetry.addEvent(telemetry.currentSpan, 'mcp.capability_mapping.node_selected', {
      'mcp.node.id': node.id,
      'mcp.node.type': node.type
    });
  };
  
  // Handle export
  const handleExport = () => {
    const data = {
      nodes,
      edges,
      servers,
      clients,
      capabilities
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mcp_capability_map.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Map Exported",
      description: "Capability map has been exported as JSON.",
      variant: "success",
    });
    
    // Record in governance
    governance.recordAudit({
      actor: 'user',
      action: 'export_capability_map',
      resource: 'mcp_capability_mapping',
      outcome: 'success',
      details: 'Exported MCP capability map',
      severity: 'info',
      tags: ['mcp', 'capability_mapping', 'export']
    });
  };
  
  // Handle layout change
  const toggleLayout = () => {
    setLayoutDirection(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
    
    toast({
      title: "Layout Changed",
      description: `Layout changed to ${layoutDirection === 'horizontal' ? 'vertical' : 'horizontal'}.`,
      variant: "default",
    });
  };
  
  // Get node details based on selected node
  const getNodeDetails = () => {
    if (!selectedNode) return null;
    
    switch (selectedNode.type) {
      case 'server':
        const server = servers.find(s => s.id === selectedNode.id);
        if (!server) return null;
        
        const serverCapabilities = capabilities.filter(c => server.capabilityIds.includes(c.id));
        const connectedClients = clients.filter(c => c.serverIds.includes(server.id));
        
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                {server.name}
              </h3>
              <p className="text-sm text-muted-foreground">{server.description}</p>
              <div className="text-sm mt-1">{server.url}</div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Capabilities</h4>
              <div className="grid grid-cols-1 gap-2">
                {serverCapabilities.map(cap => (
                  <div key={cap.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <div>
                      <div className="text-sm font-medium">{cap.name}</div>
                      <div className="text-xs text-muted-foreground">{cap.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Connected Clients</h4>
              <div className="grid grid-cols-1 gap-2">
                {connectedClients.map(client => (
                  <div key={client.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <Database className="h-4 w-4 text-secondary" />
                    <div>
                      <div className="text-sm font-medium">{client.name}</div>
                      <div className="text-xs text-muted-foreground">{client.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-1" />
                Test Connection
              </Button>
            </div>
          </div>
        );
      
      case 'client':
        const client = clients.find(c => c.id === selectedNode.id);
        if (!client) return null;
        
        const clientServers = servers.filter(s => client.serverIds.includes(s.id));
        
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <Database className="h-5 w-5 text-secondary" />
                {client.name}
              </h3>
              <p className="text-sm text-muted-foreground">{client.description}</p>
              <div className="text-sm mt-1">Status: <Badge variant={client.status === 'active' ? 'success' : 'destructive'}>{client.status}</Badge></div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Connected Servers</h4>
              <div className="grid grid-cols-1 gap-2">
                {clientServers.map(server => (
                  <div key={server.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <Server className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{server.name}</div>
                      <div className="text-xs text-muted-foreground">{server.url}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                <Link className="h-4 w-4 mr-1" />
                Add Connection
              </Button>
            </div>
          </div>
        );
      
      case 'capability':
        const capability = capabilities.find(c => c.id === selectedNode.id);
        if (!capability) return null;
        
        const capabilityServer = servers.find(s => s.id === capability.serverId);
        
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                {capability.name}
              </h3>
              <p className="text-sm text-muted-foreground">{capability.description}</p>
              <div className="text-sm mt-1">Type: <Badge variant="outline">{capability.type}</Badge></div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Provided By</h4>
              {capabilityServer && (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Server className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">{capabilityServer.name}</div>
                    <div className="text-xs text-muted-foreground">{capabilityServer.url}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Documentation
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                <GitCommit className="h-4 w-4 mr-1" />
                View Usage
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP Capability Mapping</h1>
          <p className="text-muted-foreground mt-1">
            Visualize MCP servers, clients, and capabilities
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => navigate('/agents/mcp-setup-wizard')}
          >
            <Plus size={16} />
            Add Connection
          </Button>
          
          <Button 
            className="gap-2"
            onClick={handleExport}
          >
            <Download size={16} />
            Export Map
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Connection Map</CardTitle>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleLayout}
                  className="gap-1"
                >
                  <ArrowUpDown size={14} />
                  {layoutDirection === 'horizontal' ? 'Vertical' : 'Horizontal'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCapabilities(!showCapabilities)}
                  className="gap-1"
                >
                  <Zap size={14} />
                  {showCapabilities ? 'Hide Capabilities' : 'Show Capabilities'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] border-t">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
              >
                <Controls />
                <MiniMap />
                <Background gap={12} size={1} />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    placeholder="Search nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Status</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Capability Type</span>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="market_data">Market Data</SelectItem>
                    <SelectItem value="technical_analysis">Technical Analysis</SelectItem>
                    <SelectItem value="sentiment_analysis">Sentiment Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setShowCapabilities(true);
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Node Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                getNodeDetails()
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Select a node to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Connection Statistics</CardTitle>
          <CardDescription>
            Overview of MCP connections and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Servers</span>
                <span className="text-2xl font-bold">{servers.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Active</span>
                <span>{servers.filter(s => s.status === 'active').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Inactive</span>
                <span>{servers.filter(s => s.status !== 'active').length}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Clients</span>
                <span className="text-2xl font-bold">{clients.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Active</span>
                <span>{clients.filter(c => c.status === 'active').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Inactive</span>
                <span>{clients.filter(c => c.status !== 'active').length}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Capabilities</span>
                <span className="text-2xl font-bold">{capabilities.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Market Data</span>
                <span>{capabilities.filter(c => c.type === 'market_data').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Technical Analysis</span>
                <span>{capabilities.filter(c => c.type === 'technical_analysis').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Sentiment Analysis</span>
                <span>{capabilities.filter(c => c.type === 'sentiment_analysis').length}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Connections</span>
                <span className="text-2xl font-bold">{edges.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Client-Server</span>
                <span>{edges.filter(e => e.id.startsWith('client-')).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Server-Capability</span>
                <span>{edges.filter(e => e.id.startsWith('server-')).length}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MCPCapabilityMapping;
