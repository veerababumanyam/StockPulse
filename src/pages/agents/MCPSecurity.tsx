import React, { useState, useEffect } from 'react';
import { useMCPPerformance } from '../../hooks/useMCPPerformance';
import { useGovernance } from '../../contexts/GovernanceContext';
import { useTelemetry } from '../../contexts/TelemetryContext';
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Database, 
  Key, 
  Lock, 
  Network, 
  RefreshCw, 
  Server, 
  Settings, 
  Shield, 
  Zap
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useToast } from '../../hooks/useToast';
import { Progress } from '../../components/ui/progress';

const MCPSecurity: React.FC = () => {
  const { toast } = useToast();
  const mcpPerformance = useMCPPerformance();
  const governance = useGovernance();
  const telemetry = useTelemetry();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for TLS configuration
  const [tlsConfig, setTlsConfig] = useState({
    enabled: true,
    minVersion: 'TLS 1.3',
    preferredCipherSuites: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
    certificateRotationDays: 90,
    mutualTlsEnabled: true,
    ocspStaplingEnabled: true
  });
  
  // State for permission models
  const [permissionModels, setPermissionModels] = useState([
    {
      id: 'model-1',
      name: 'Default',
      description: 'Default permission model for MCP operations',
      roles: ['admin', 'user', 'guest'],
      resources: ['market_data', 'technical_analysis', 'sentiment_analysis', 'portfolio_management'],
      permissions: [
        { role: 'admin', resource: '*', actions: ['read', 'write', 'execute'] },
        { role: 'user', resource: 'market_data', actions: ['read'] },
        { role: 'user', resource: 'technical_analysis', actions: ['read', 'execute'] },
        { role: 'user', resource: 'sentiment_analysis', actions: ['read', 'execute'] },
        { role: 'user', resource: 'portfolio_management', actions: ['read', 'write'] },
        { role: 'guest', resource: 'market_data', actions: ['read'] }
      ]
    },
    {
      id: 'model-2',
      name: 'Restricted',
      description: 'Restricted permission model for sensitive operations',
      roles: ['admin', 'analyst', 'viewer'],
      resources: ['market_data', 'technical_analysis', 'sentiment_analysis', 'portfolio_management', 'trading_execution'],
      permissions: [
        { role: 'admin', resource: '*', actions: ['read', 'write', 'execute'] },
        { role: 'analyst', resource: 'market_data', actions: ['read'] },
        { role: 'analyst', resource: 'technical_analysis', actions: ['read', 'execute'] },
        { role: 'analyst', resource: 'sentiment_analysis', actions: ['read', 'execute'] },
        { role: 'analyst', resource: 'portfolio_management', actions: ['read'] },
        { role: 'viewer', resource: 'market_data', actions: ['read'] },
        { role: 'viewer', resource: 'technical_analysis', actions: ['read'] }
      ]
    }
  ]);
  
  // State for security audit results
  const [securityAuditResults, setSecurityAuditResults] = useState({
    lastRun: new Date().toISOString(),
    status: 'passed',
    vulnerabilities: [],
    recommendations: [
      'Rotate TLS certificates every 90 days',
      'Enable mutual TLS for all MCP connections',
      'Implement IP allowlisting for MCP servers'
    ]
  });
  
  // State for rate limiters
  const [rateLimiters, setRateLimiters] = useState([
    {
      id: 'limiter-1',
      serverUrl: 'https://mcp.stockdata.example.com/sse',
      maxRequestsPerMinute: 100,
      currentRequests: 42,
      isThrottled: false
    },
    {
      id: 'limiter-2',
      serverUrl: 'https://mcp.trading.example.com/sse',
      maxRequestsPerMinute: 60,
      currentRequests: 28,
      isThrottled: false
    }
  ]);
  
  // State for connection pools
  const [connectionPools, setConnectionPools] = useState([
    {
      id: 'pool-1',
      serverUrl: 'https://mcp.stockdata.example.com/sse',
      maxConnections: 10,
      activeConnections: 3,
      idleConnections: 2,
      status: 'active'
    },
    {
      id: 'pool-2',
      serverUrl: 'https://mcp.trading.example.com/sse',
      maxConnections: 5,
      activeConnections: 1,
      idleConnections: 2,
      status: 'active'
    }
  ]);
  
  // Run security audit
  const runSecurityAudit = () => {
    setIsLoading(true);
    
    const span = telemetry.startSpan('mcp.security.audit', {
      'mcp.security.audit.type': 'full'
    });
    
    // Simulate audit process
    setTimeout(() => {
      setSecurityAuditResults({
        lastRun: new Date().toISOString(),
        status: 'passed',
        vulnerabilities: [],
        recommendations: [
          'Rotate TLS certificates every 90 days',
          'Enable mutual TLS for all MCP connections',
          'Implement IP allowlisting for MCP servers'
        ]
      });
      
      telemetry.addEvent(span, 'mcp.security.audit_complete', {
        'mcp.security.audit.status': 'passed',
        'mcp.security.audit.vulnerabilities': 0
      });
      
      telemetry.endSpan(span);
      
      setIsLoading(false);
      
      toast({
        title: "Security Audit Complete",
        description: "No vulnerabilities found. See recommendations for improvements.",
        variant: "success",
      });
      
      // Record in governance
      governance.recordAudit({
        actor: 'system',
        action: 'security_audit',
        resource: 'mcp_security',
        outcome: 'success',
        details: 'Completed security audit with no vulnerabilities found',
        severity: 'info',
        tags: ['security', 'audit', 'mcp']
      });
    }, 2000);
  };
  
  // Toggle mutual TLS
  const toggleMutualTLS = () => {
    setTlsConfig(prev => ({
      ...prev,
      mutualTlsEnabled: !prev.mutualTlsEnabled
    }));
    
    toast({
      title: tlsConfig.mutualTlsEnabled ? "Mutual TLS Disabled" : "Mutual TLS Enabled",
      description: tlsConfig.mutualTlsEnabled 
        ? "Client certificate verification has been disabled." 
        : "Client certificate verification has been enabled.",
      variant: tlsConfig.mutualTlsEnabled ? "destructive" : "success",
    });
    
    // Record in governance
    governance.recordAudit({
      actor: 'admin',
      action: 'update_tls_config',
      resource: 'mcp_security',
      outcome: 'success',
      details: `Mutual TLS ${tlsConfig.mutualTlsEnabled ? 'disabled' : 'enabled'}`,
      severity: 'warning',
      tags: ['security', 'tls', 'mcp']
    });
  };
  
  // Create a new permission model
  const createPermissionModel = () => {
    const newModel = {
      id: `model-${permissionModels.length + 1}`,
      name: 'New Model',
      description: 'New permission model',
      roles: ['admin', 'user'],
      resources: ['market_data', 'technical_analysis'],
      permissions: [
        { role: 'admin', resource: '*', actions: ['read', 'write', 'execute'] },
        { role: 'user', resource: 'market_data', actions: ['read'] },
        { role: 'user', resource: 'technical_analysis', actions: ['read'] }
      ]
    };
    
    setPermissionModels(prev => [...prev, newModel]);
    
    toast({
      title: "Permission Model Created",
      description: "New permission model has been created.",
      variant: "success",
    });
    
    // Record in governance
    governance.recordAudit({
      actor: 'admin',
      action: 'create_permission_model',
      resource: 'mcp_security',
      outcome: 'success',
      details: `Created new permission model: ${newModel.name}`,
      severity: 'info',
      tags: ['security', 'permissions', 'mcp']
    });
  };
  
  // Create a new rate limiter
  const createRateLimiter = () => {
    const newLimiter = {
      id: `limiter-${rateLimiters.length + 1}`,
      serverUrl: 'https://mcp.newserver.example.com/sse',
      maxRequestsPerMinute: 50,
      currentRequests: 0,
      isThrottled: false
    };
    
    setRateLimiters(prev => [...prev, newLimiter]);
    
    toast({
      title: "Rate Limiter Created",
      description: "New rate limiter has been created.",
      variant: "success",
    });
    
    // Record in governance
    governance.recordAudit({
      actor: 'admin',
      action: 'create_rate_limiter',
      resource: 'mcp_security',
      outcome: 'success',
      details: `Created new rate limiter for ${newLimiter.serverUrl}`,
      severity: 'info',
      tags: ['security', 'rate_limiting', 'mcp']
    });
  };
  
  // Create a new connection pool
  const createConnectionPool = () => {
    const newPool = {
      id: `pool-${connectionPools.length + 1}`,
      serverUrl: 'https://mcp.newserver.example.com/sse',
      maxConnections: 5,
      activeConnections: 0,
      idleConnections: 0,
      status: 'active'
    };
    
    setConnectionPools(prev => [...prev, newPool]);
    
    toast({
      title: "Connection Pool Created",
      description: "New connection pool has been created.",
      variant: "success",
    });
    
    // Record in governance
    governance.recordAudit({
      actor: 'admin',
      action: 'create_connection_pool',
      resource: 'mcp_security',
      outcome: 'success',
      details: `Created new connection pool for ${newPool.serverUrl}`,
      severity: 'info',
      tags: ['security', 'connection_pool', 'mcp']
    });
  };
  
  // Get performance metrics
  const getPerformanceMetrics = () => {
    return mcpPerformance.getPerformanceMetrics();
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP Security & Performance</h1>
          <p className="text-muted-foreground mt-1">
            Manage security settings and performance optimizations
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={runSecurityAudit}
            disabled={isLoading}
          >
            <Shield size={16} className={isLoading ? "animate-pulse" : ""} />
            {isLoading ? "Running Audit..." : "Run Security Audit"}
          </Button>
          
          <Button className="gap-2">
            <Settings size={16} />
            Security Settings
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock size={18} />
              TLS Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${tlsConfig.enabled ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="font-medium">{tlsConfig.enabled ? "Enabled" : "Disabled"}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {tlsConfig.minVersion} with mutual TLS {tlsConfig.mutualTlsEnabled ? "enabled" : "disabled"}
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Certificate rotation: {tlsConfig.certificateRotationDays} days
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Key size={18} />
              Permission Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{permissionModels.length}</div>
            <p className="text-sm text-muted-foreground">
              Active permission models
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {permissionModels.reduce((acc, model) => acc + model.permissions.length, 0)} total permissions
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity size={18} />
              Rate Limiting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rateLimiters.length}</div>
            <p className="text-sm text-muted-foreground">
              Active rate limiters
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {rateLimiters.filter(limiter => limiter.isThrottled).length} currently throttled
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tls">TLS Security</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="rate-limiting">Rate Limiting</TabsTrigger>
          <TabsTrigger value="connection-pooling">Connection Pooling</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
              <CardDescription>
                Current security status and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`h-4 w-4 rounded-full ${securityAuditResults.status === 'passed' ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="font-medium text-lg">
                      {securityAuditResults.status === 'passed' ? "Security Audit Passed" : "Security Audit Failed"}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">TLS Security</h3>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={tlsConfig.mutualTlsEnabled ? 100 : 75} 
                          className="h-2" 
                          indicatorClassName={tlsConfig.mutualTlsEnabled ? "bg-green-500" : "bg-yellow-500"}
                        />
                        <span className="text-sm">{tlsConfig.mutualTlsEnabled ? "Strong" : "Good"}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Permission Model</h3>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={90} 
                          className="h-2" 
                          indicatorClassName="bg-green-500"
                        />
                        <span className="text-sm">Strong</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Rate Limiting</h3>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={100} 
                          className="h-2" 
                          indicatorClassName="bg-green-500"
                        />
                        <span className="text-sm">Strong</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Connection Security</h3>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={85} 
                          className="h-2" 
                          indicatorClassName="bg-green-500"
                        />
                        <span className="text-sm">Strong</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Security Recommendations</h3>
                  <div className="space-y-2">
                    {securityAuditResults.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-yellow-500 mt-0.5" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                  
                  {securityAuditResults.vulnerabilities.length > 0 ? (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2 text-red-500">Vulnerabilities</h3>
                      <div className="space-y-2">
                        {securityAuditResults.vulnerabilities.map((vulnerability, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-500 mt-0.5" />
                            <span className="text-sm">{vulnerability}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="font-medium">No vulnerabilities detected</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Last security audit: {new Date(securityAuditResults.lastRun).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={runSecurityAudit}
                disabled={isLoading}
              >
                <Shield size={16} className="mr-2" />
                Run Security Audit
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Current performance metrics and optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database size={18} />
                    <h3 className="font-semibold">Connection Pooling</h3>
                  </div>
                  <div className="text-3xl font-bold mb-2">{connectionPools.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active connection pools
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Active Connections</span>
                      <span>{connectionPools.reduce((acc, pool) => acc + pool.activeConnections, 0)}</span>
                    </div>
                    <Progress 
                      value={connectionPools.reduce((acc, pool) => acc + pool.activeConnections, 0) / 
                             connectionPools.reduce((acc, pool) => acc + pool.maxConnections, 0) * 100} 
                      className="h-1 mb-2" 
                    />
                    
                    <div className="flex justify-between text-xs mb-1">
                      <span>Idle Connections</span>
                      <span>{connectionPools.reduce((acc, pool) => acc + pool.idleConnections, 0)}</span>
                    </div>
                    <Progress 
                      value={connectionPools.reduce((acc, pool) => acc + pool.idleConnections, 0) / 
                             connectionPools.reduce((acc, pool) => acc + pool.maxConnections, 0) * 100} 
                      className="h-1 mb-2" 
                    />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={18} />
                    <h3 className="font-semibold">Rate Limiting</h3>
                  </div>
                  <div className="text-3xl font-bold mb-2">{rateLimiters.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active rate limiters
                  </p>
                  <div className="mt-4">
                    {rateLimiters.map((limiter, index) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="truncate max-w-[150px]">{limiter.serverUrl.replace('https://', '')}</span>
                          <span>{limiter.currentRequests}/{limiter.maxRequestsPerMinute}</span>
                        </div>
                        <Progress 
                          value={(limiter.currentRequests / limiter.maxRequestsPerMinute) * 100} 
                          className="h-1" 
                          indicatorClassName={
                            (limiter.currentRequests / limiter.maxRequestsPerMinute) > 0.8 
                              ? "bg-yellow-500" 
                              : "bg-green-500"
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={18} />
                    <h3 className="font-semibold">Cache Performance</h3>
                  </div>
                  <div className="text-3xl font-bold mb-2">92.5%</div>
                  <p className="text-xs text-muted-foreground">
                    Cache hit rate
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Cache Hits</span>
                      <span>1,850</span>
                    </div>
                    <Progress value={92.5} className="h-1 mb-2" />
                    
                    <div className="flex justify-between text-xs mb-1">
                      <span>Cache Misses</span>
                      <span>150</span>
                    </div>
                    <Progress value={7.5} className="h-1 mb-2" />
                    
                    <div className="flex justify-between text-xs mb-1">
                      <span>Avg. Response Time</span>
                      <span>12ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tls" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>TLS Security Configuration</CardTitle>
              <CardDescription>
                Configure TLS settings for MCP connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">TLS Status</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">Enable TLS for all connections</span>
                      <input 
                        type="checkbox" 
                        checked={tlsConfig.enabled}
                        onChange={() => setTlsConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                        className="h-4 w-4"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All MCP connections must use TLS encryption
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Minimum TLS Version</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      value={tlsConfig.minVersion}
                      onChange={(e) => setTlsConfig(prev => ({ ...prev, minVersion: e.target.value }))}
                    >
                      <option value="TLS 1.3">TLS 1.3 (Recommended)</option>
                      <option value="TLS 1.2">TLS 1.2</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum TLS version required for connections
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Certificate Rotation</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      value={tlsConfig.certificateRotationDays}
                      onChange={(e) => setTlsConfig(prev => ({ ...prev, certificateRotationDays: parseInt(e.target.value) }))}
                    >
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">365 days</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      How often TLS certificates should be rotated
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Mutual TLS</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">Require client certificates</span>
                      <input 
                        type="checkbox" 
                        checked={tlsConfig.mutualTlsEnabled}
                        onChange={toggleMutualTLS}
                        className="h-4 w-4"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Require clients to present valid certificates for authentication
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">OCSP Stapling</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">Enable OCSP stapling</span>
                      <input 
                        type="checkbox" 
                        checked={tlsConfig.ocspStaplingEnabled}
                        onChange={() => setTlsConfig(prev => ({ ...prev, ocspStaplingEnabled: !prev.ocspStaplingEnabled }))}
                        className="h-4 w-4"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Improve performance by including certificate validation status
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Preferred Cipher Suites</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant={tlsConfig.preferredCipherSuites.includes('TLS_AES_256_GCM_SHA384') ? "default" : "outline"}>
                        TLS_AES_256_GCM_SHA384
                      </Badge>
                      <Badge variant={tlsConfig.preferredCipherSuites.includes('TLS_CHACHA20_POLY1305_SHA256') ? "default" : "outline"}>
                        TLS_CHACHA20_POLY1305_SHA256
                      </Badge>
                      <Badge variant={tlsConfig.preferredCipherSuites.includes('TLS_AES_128_GCM_SHA256') ? "default" : "outline"}>
                        TLS_AES_128_GCM_SHA256
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Preferred cipher suites for TLS connections
                    </p>
                  </div>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Recommendation</AlertTitle>
                <AlertDescription>
                  For maximum security, enable mutual TLS and use TLS 1.3 with strong cipher suites.
                  Rotate certificates every 90 days or less.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button 
                variant="outline"
                onClick={() => {
                  setTlsConfig({
                    enabled: true,
                    minVersion: 'TLS 1.3',
                    preferredCipherSuites: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
                    certificateRotationDays: 90,
                    mutualTlsEnabled: true,
                    ocspStaplingEnabled: true
                  });
                  
                  toast({
                    title: "TLS Settings Reset",
                    description: "TLS settings have been reset to defaults.",
                    variant: "default",
                  });
                }}
              >
                Reset to Defaults
              </Button>
              
              <Button 
                onClick={() => {
                  toast({
                    title: "TLS Settings Saved",
                    description: "TLS settings have been saved.",
                    variant: "success",
                  });
                  
                  // Record in governance
                  governance.recordAudit({
                    actor: 'admin',
                    action: 'update_tls_config',
                    resource: 'mcp_security',
                    outcome: 'success',
                    details: 'Updated TLS security configuration',
                    severity: 'info',
                    tags: ['security', 'tls', 'mcp']
                  });
                }}
              >
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Permission Models</CardTitle>
                <CardDescription>
                  Configure granular permission models for MCP tools
                </CardDescription>
              </div>
              <Button onClick={createPermissionModel}>
                <Key size={16} className="mr-2" />
                New Model
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {permissionModels.map((model, index) => (
                  <div key={model.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{model.name}</h3>
                        <p className="text-sm text-muted-foreground">{model.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit Model
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Roles</h4>
                        <div className="flex flex-wrap gap-2">
                          {model.roles.map(role => (
                            <Badge key={role} variant="outline">{role}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Resources</h4>
                        <div className="flex flex-wrap gap-2">
                          {model.resources.map(resource => (
                            <Badge key={resource} variant="outline">{resource}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Permissions</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Role</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {model.permissions.map((permission, pIndex) => (
                            <TableRow key={pIndex}>
                              <TableCell>{permission.role}</TableCell>
                              <TableCell>{permission.resource}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {permission.actions.map(action => (
                                    <Badge key={action} variant="outline" className="text-xs">
                                      {action}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rate-limiting" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Rate Limiting</CardTitle>
                <CardDescription>
                  Configure rate limiting and throttling for MCP operations
                </CardDescription>
              </div>
              <Button onClick={createRateLimiter}>
                <Activity size={16} className="mr-2" />
                New Rate Limiter
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server</TableHead>
                    <TableHead>Max Requests/min</TableHead>
                    <TableHead>Current Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateLimiters.map((limiter, index) => (
                    <TableRow key={limiter.id}>
                      <TableCell>
                        <div className="font-medium">{limiter.serverUrl.replace('https://', '')}</div>
                        <div className="text-xs text-muted-foreground">{limiter.serverUrl}</div>
                      </TableCell>
                      <TableCell>{limiter.maxRequestsPerMinute}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(limiter.currentRequests / limiter.maxRequestsPerMinute) * 100} 
                            className="h-2 w-24" 
                            indicatorClassName={
                              (limiter.currentRequests / limiter.maxRequestsPerMinute) > 0.8 
                                ? "bg-yellow-500" 
                                : "bg-green-500"
                            }
                          />
                          <span className="text-sm">{limiter.currentRequests}/{limiter.maxRequestsPerMinute}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {limiter.isThrottled ? (
                          <Badge variant="destructive">Throttled</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setRateLimiters(prev => prev.map(l => 
                                l.id === limiter.id 
                                  ? { ...l, maxRequestsPerMinute: l.maxRequestsPerMinute + 10 } 
                                  : l
                              ));
                              
                              toast({
                                title: "Rate Limit Increased",
                                description: `Rate limit for ${limiter.serverUrl.replace('https://', '')} increased to ${limiter.maxRequestsPerMinute + 10} req/min.`,
                                variant: "success",
                              });
                            }}
                          >
                            Increase Limit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setRateLimiters(prev => prev.map(l => 
                                l.id === limiter.id 
                                  ? { ...l, currentRequests: 0, isThrottled: false } 
                                  : l
                              ));
                              
                              toast({
                                title: "Rate Limiter Reset",
                                description: `Rate limiter for ${limiter.serverUrl.replace('https://', '')} has been reset.`,
                                variant: "success",
                              });
                            }}
                          >
                            Reset
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                <Activity className="inline-block mr-1 h-4 w-4" />
                {rateLimiters.length} rate limiters configured
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setRateLimiters(prev => prev.map(l => ({
                    ...l,
                    currentRequests: 0,
                    isThrottled: false
                  })));
                  
                  toast({
                    title: "All Rate Limiters Reset",
                    description: "All rate limiters have been reset.",
                    variant: "success",
                  });
                }}
              >
                Reset All Limiters
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="connection-pooling" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Connection Pooling</CardTitle>
                <CardDescription>
                  Configure connection pools for MCP servers
                </CardDescription>
              </div>
              <Button onClick={createConnectionPool}>
                <Server size={16} className="mr-2" />
                New Connection Pool
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server</TableHead>
                    <TableHead>Max Connections</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Idle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connectionPools.map((pool, index) => (
                    <TableRow key={pool.id}>
                      <TableCell>
                        <div className="font-medium">{pool.serverUrl.replace('https://', '')}</div>
                        <div className="text-xs text-muted-foreground">{pool.serverUrl}</div>
                      </TableCell>
                      <TableCell>{pool.maxConnections}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(pool.activeConnections / pool.maxConnections) * 100} 
                            className="h-2 w-24" 
                          />
                          <span className="text-sm">{pool.activeConnections}</span>
                        </div>
                      </TableCell>
                      <TableCell>{pool.idleConnections}</TableCell>
                      <TableCell>
                        {pool.status === 'active' ? (
                          <Badge variant="success">Active</Badge>
                        ) : pool.status === 'draining' ? (
                          <Badge variant="warning">Draining</Badge>
                        ) : (
                          <Badge variant="destructive">Closed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setConnectionPools(prev => prev.map(p => 
                                p.id === pool.id 
                                  ? { ...p, maxConnections: p.maxConnections + 5 } 
                                  : p
                              ));
                              
                              toast({
                                title: "Pool Size Increased",
                                description: `Connection pool size for ${pool.serverUrl.replace('https://', '')} increased to ${pool.maxConnections + 5}.`,
                                variant: "success",
                              });
                            }}
                          >
                            Increase Size
                          </Button>
                          <Button 
                            variant={pool.status === 'active' ? "destructive" : "outline"} 
                            size="sm"
                            onClick={() => {
                              if (pool.status === 'active') {
                                setConnectionPools(prev => prev.map(p => 
                                  p.id === pool.id 
                                    ? { ...p, status: 'draining' } 
                                    : p
                                ));
                                
                                toast({
                                  title: "Pool Draining",
                                  description: `Connection pool for ${pool.serverUrl.replace('https://', '')} is now draining.`,
                                  variant: "warning",
                                });
                              } else {
                                setConnectionPools(prev => prev.map(p => 
                                  p.id === pool.id 
                                    ? { ...p, status: 'active' } 
                                    : p
                                ));
                                
                                toast({
                                  title: "Pool Activated",
                                  description: `Connection pool for ${pool.serverUrl.replace('https://', '')} is now active.`,
                                  variant: "success",
                                });
                              }
                            }}
                          >
                            {pool.status === 'active' ? 'Drain' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                <Server className="inline-block mr-1 h-4 w-4" />
                {connectionPools.length} connection pools configured
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast({
                    title: "Connection Pools Optimized",
                    description: "Connection pools have been optimized for current load.",
                    variant: "success",
                  });
                }}
              >
                Optimize Pools
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Security & Performance Settings</CardTitle>
          <CardDescription>
            Configure global security and performance settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} />
                <h3 className="font-semibold">Security Settings</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Configure global security settings for MCP operations
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">IP Allowlisting</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">JWT Authentication</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Request Signing</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Audit Logging</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} />
                <h3 className="font-semibold">Performance Settings</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Configure global performance settings for MCP operations
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Connection Pooling</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Response Caching</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Compression</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Keep-Alive Connections</label>
                  <input 
                    type="checkbox" 
                    checked={true}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              Changes to security settings may require restarting MCP connections.
              Ensure all changes are properly tested before applying to production.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button 
            variant="outline"
            onClick={() => {
              toast({
                title: "Settings Reset",
                description: "Security and performance settings have been reset to defaults.",
                variant: "default",
              });
            }}
          >
            Reset to Defaults
          </Button>
          
          <Button 
            onClick={() => {
              toast({
                title: "Settings Saved",
                description: "Security and performance settings have been saved.",
                variant: "success",
              });
              
              // Record in governance
              governance.recordAudit({
                actor: 'admin',
                action: 'update_security_settings',
                resource: 'mcp_security',
                outcome: 'success',
                details: 'Updated global security and performance settings',
                severity: 'info',
                tags: ['security', 'performance', 'mcp']
              });
            }}
          >
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MCPSecurity;
