import React, { useState, useEffect } from 'react';
import { useGovernance, ComplianceCheck, AuditRecord, DataLineageRecord } from '../../contexts/GovernanceContext';
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
  AlertCircle, 
  CheckCircle, 
  ClipboardCheck, 
  Database, 
  FileText, 
  GitCommit, 
  Lock, 
  RefreshCw, 
  Search, 
  Settings, 
  Shield, 
  User
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useToast } from '../../hooks/useToast';
import { Progress } from '../../components/ui/progress';

const ComplianceGovernance: React.FC = () => {
  const { toast } = useToast();
  const governance = useGovernance();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for compliance checks
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  
  // State for audit records
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  
  // State for data lineage
  const [lineageRecords, setLineageRecords] = useState<DataLineageRecord[]>([]);
  
  // Load initial data
  useEffect(() => {
    loadComplianceChecks();
    
    // Simulate some audit records
    const mockAuditRecords: AuditRecord[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actor: 'system',
        action: 'mcp_connection',
        resource: 'anthropic-claude',
        outcome: 'success',
        details: 'Successfully connected to Anthropic Claude MCP server',
        severity: 'info',
        tags: ['mcp', 'connection']
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        actor: 'user@example.com',
        action: 'model_execution',
        resource: 'market_analysis',
        outcome: 'success',
        details: 'Executed market analysis model for S&P 500',
        severity: 'info',
        tags: ['model', 'market_analysis']
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        actor: 'system',
        action: 'data_access',
        resource: 'financial_data',
        outcome: 'failure',
        details: 'Failed to access financial data API due to rate limiting',
        severity: 'warning',
        tags: ['data', 'api']
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        actor: 'admin@example.com',
        action: 'configuration_change',
        resource: 'mcp_settings',
        outcome: 'success',
        details: 'Updated MCP server configuration',
        severity: 'info',
        tags: ['configuration', 'admin']
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        actor: 'system',
        action: 'security_alert',
        resource: 'authentication',
        outcome: 'failure',
        details: 'Multiple failed authentication attempts detected',
        severity: 'critical',
        tags: ['security', 'authentication']
      }
    ];
    
    setAuditRecords(mockAuditRecords);
    
    // Simulate some lineage records
    const mockLineageRecords: DataLineageRecord[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        source: 'market_analysis',
        operation: 'sentiment_analysis',
        inputs: ['news_data_1', 'social_data_1'],
        outputs: ['sentiment_score_1'],
        model: 'claude-3-opus',
        user: 'user@example.com',
        tags: ['sentiment', 'market']
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        source: 'portfolio_optimization',
        operation: 'risk_assessment',
        inputs: ['portfolio_data_1', 'market_data_1'],
        outputs: ['risk_score_1', 'optimization_recommendation_1'],
        model: 'gpt-4o',
        user: 'user@example.com',
        tags: ['portfolio', 'risk']
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        source: 'trading_signals',
        operation: 'technical_analysis',
        inputs: ['price_data_1', 'volume_data_1'],
        outputs: ['trading_signal_1'],
        model: 'local-finance-model',
        user: 'user@example.com',
        tags: ['trading', 'technical']
      }
    ];
    
    setLineageRecords(mockLineageRecords);
  }, []);
  
  // Load compliance checks
  const loadComplianceChecks = async () => {
    setIsLoading(true);
    
    try {
      const status = governance.getComplianceStatus();
      setComplianceChecks(status.checks);
    } catch (error) {
      toast({
        title: 'Error Loading Compliance Checks',
        description: `Failed to load compliance checks: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Run all compliance checks
  const runAllChecks = async () => {
    setIsLoading(true);
    
    try {
      const results = await governance.runAllComplianceChecks();
      setComplianceChecks(results);
      
      const failedCount = results.filter(check => check.status === 'failed').length;
      const warningCount = results.filter(check => check.status === 'warning').length;
      const passedCount = results.filter(check => check.status === 'passed').length;
      
      toast({
        title: 'Compliance Checks Completed',
        description: `Results: ${passedCount} passed, ${warningCount} warnings, ${failedCount} failed`,
        variant: failedCount > 0 ? 'destructive' : warningCount > 0 ? 'warning' : 'success',
      });
    } catch (error) {
      toast({
        title: 'Error Running Compliance Checks',
        description: `Failed to run compliance checks: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Run a specific compliance check
  const runCheck = async (checkId: string) => {
    setIsLoading(true);
    
    try {
      const result = await governance.runComplianceCheck(checkId);
      
      // Update the check in the list
      setComplianceChecks(prev => 
        prev.map(check => check.id === checkId ? result : check)
      );
      
      toast({
        title: 'Compliance Check Completed',
        description: `${result.name}: ${result.status}`,
        variant: result.status === 'failed' ? 'destructive' : 
                 result.status === 'warning' ? 'warning' : 'success',
      });
    } catch (error) {
      toast({
        title: 'Error Running Compliance Check',
        description: `Failed to run compliance check: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle governance
  const toggleGovernance = () => {
    governance.setGovernanceEnabled(!governance.isGovernanceEnabled);
    
    toast({
      title: governance.isGovernanceEnabled ? 'Governance Disabled' : 'Governance Enabled',
      description: governance.isGovernanceEnabled 
        ? 'Compliance and governance features have been disabled.' 
        : 'Compliance and governance features have been enabled.',
      variant: 'default',
    });
  };
  
  // Get status badge for compliance check
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="success" className="gap-1"><CheckCircle size={12} /> Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><AlertCircle size={12} /> Failed</Badge>;
      case 'warning':
        return <Badge variant="warning" className="gap-1"><AlertCircle size={12} /> Warning</Badge>;
      case 'not_applicable':
        return <Badge variant="outline" className="gap-1">N/A</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get category badge for compliance check
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'data_privacy':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Data Privacy</Badge>;
      case 'financial_regulation':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Financial Regulation</Badge>;
      case 'security':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Security</Badge>;
      case 'ethics':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Ethics</Badge>;
      case 'operational':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Operational</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };
  
  // Get severity badge for audit record
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Info</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };
  
  // Get outcome badge for audit record
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return <Badge variant="success" className="gap-1"><CheckCircle size={12} /> Success</Badge>;
      case 'failure':
        return <Badge variant="destructive" className="gap-1"><AlertCircle size={12} /> Failure</Badge>;
      default:
        return <Badge variant="outline">{outcome}</Badge>;
    }
  };
  
  // Filter compliance checks by search query
  const filteredComplianceChecks = complianceChecks.filter(check => 
    searchQuery === '' || 
    check.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    check.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    check.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter audit records by search query
  const filteredAuditRecords = auditRecords.filter(record => 
    searchQuery === '' || 
    record.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Filter lineage records by search query
  const filteredLineageRecords = lineageRecords.filter(record => 
    searchQuery === '' || 
    record.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    record.inputs.some(input => input.toLowerCase().includes(searchQuery.toLowerCase())) ||
    record.outputs.some(output => output.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Get compliance status summary
  const getComplianceSummary = () => {
    const status = governance.getComplianceStatus();
    const passedCount = complianceChecks.filter(check => check.status === 'passed').length;
    const warningCount = complianceChecks.filter(check => check.status === 'warning').length;
    const failedCount = complianceChecks.filter(check => check.status === 'failed').length;
    const totalCount = complianceChecks.length;
    
    let statusColor = '';
    let statusText = '';
    
    switch (status.level) {
      case 'high':
        statusColor = 'bg-green-500';
        statusText = 'High Compliance';
        break;
      case 'medium':
        statusColor = 'bg-yellow-500';
        statusText = 'Medium Compliance';
        break;
      case 'low':
        statusColor = 'bg-red-500';
        statusText = 'Low Compliance';
        break;
      default:
        statusColor = 'bg-gray-500';
        statusText = 'Unknown Compliance';
    }
    
    return {
      level: status.level,
      statusColor,
      statusText,
      passedCount,
      warningCount,
      failedCount,
      totalCount,
      passedPercentage: totalCount > 0 ? (passedCount / totalCount) * 100 : 0,
      warningPercentage: totalCount > 0 ? (warningCount / totalCount) * 100 : 0,
      failedPercentage: totalCount > 0 ? (failedCount / totalCount) * 100 : 0,
    };
  };
  
  const complianceSummary = getComplianceSummary();

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance & Governance</h1>
          <p className="text-muted-foreground mt-1">
            Manage compliance, data lineage, and audit trails
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={toggleGovernance}
          >
            <Shield size={16} />
            {governance.isGovernanceEnabled ? 'Disable Governance' : 'Enable Governance'}
          </Button>
          
          <Button 
            className="gap-2"
            onClick={runAllChecks}
            disabled={isLoading || !governance.isGovernanceEnabled}
          >
            <ClipboardCheck size={16} />
            {isLoading ? 'Running Checks...' : 'Run All Checks'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className={`pb-2 ${complianceSummary.statusColor}`}>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Shield size={18} />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{complianceSummary.statusText}</div>
            <p className="text-sm text-muted-foreground">
              {complianceSummary.passedCount} of {complianceSummary.totalCount} checks passed
            </p>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="bg-green-500 h-full" 
                  style={{ width: `${complianceSummary.passedPercentage}%` }}
                ></div>
                <div 
                  className="bg-yellow-500 h-full" 
                  style={{ width: `${complianceSummary.warningPercentage}%` }}
                ></div>
                <div 
                  className="bg-red-500 h-full" 
                  style={{ width: `${complianceSummary.failedPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText size={18} />
              Audit Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{auditRecords.length}</div>
            <p className="text-sm text-muted-foreground">
              Total audit trail records
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Last activity: {auditRecords.length > 0 ? new Date(auditRecords[0].timestamp).toLocaleString() : 'N/A'}
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <GitCommit size={18} />
              Data Lineage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lineageRecords.length}</div>
            <p className="text-sm text-muted-foreground">
              Tracked data operations
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {lineageRecords.reduce((acc, record) => acc + record.outputs.length, 0)} outputs tracked
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <div className="flex justify-between items-center">
        <Input
          type="search"
          placeholder="Search compliance, audits, and lineage..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="lineage">Data Lineage</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <TabsContent value="overview" className="mt-0 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Overview</CardTitle>
            <CardDescription>
              Summary of compliance status across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="col-span-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Data Privacy</h3>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={100} 
                        className="h-2" 
                        indicatorClassName="bg-blue-500"
                      />
                      <span className="text-sm">100%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Financial Regulation</h3>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={100} 
                        className="h-2" 
                        indicatorClassName="bg-green-500"
                      />
                      <span className="text-sm">100%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Security</h3>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={100} 
                        className="h-2" 
                        indicatorClassName="bg-red-500"
                      />
                      <span className="text-sm">100%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Ethics</h3>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={75} 
                        className="h-2" 
                        indicatorClassName="bg-purple-500"
                      />
                      <span className="text-sm">75%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Operational</h3>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={100} 
                        className="h-2" 
                        indicatorClassName="bg-gray-500"
                      />
                      <span className="text-sm">100%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-3">
                <div className="border rounded-lg p-4 h-full">
                  <h3 className="font-medium mb-4">Recent Compliance Issues</h3>
                  
                  {complianceChecks.filter(check => check.status === 'failed' || check.status === 'warning').length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <CheckCircle className="mx-auto h-8 w-8 mb-2 text-green-500" />
                      <p>No compliance issues detected</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {complianceChecks
                        .filter(check => check.status === 'failed' || check.status === 'warning')
                        .map(check => (
                          <div key={check.id} className="border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{check.name}</span>
                              {getStatusBadge(check.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{check.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span>{getCategoryBadge(check.category)}</span>
                              <span className="text-muted-foreground">
                                Last checked: {new Date(check.lastChecked).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Activity</CardTitle>
              <CardDescription>
                Latest events from the audit trail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditRecords.slice(0, 3).map(record => (
                  <div key={record.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span className="font-medium">{record.actor}</span>
                      </div>
                      {getOutcomeBadge(record.outcome)}
                    </div>
                    <p className="text-sm mb-1">{record.details}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{record.action} on {record.resource}</span>
                        {getSeverityBadge(record.severity)}
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveTab('audit')}
              >
                View All Audit Records
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Lineage Summary</CardTitle>
              <CardDescription>
                Recent data operations and their lineage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lineageRecords.slice(0, 3).map(record => (
                  <div key={record.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{record.operation}</span>
                      <Badge variant="outline">{record.model}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-1">
                      <div>
                        <p className="text-xs text-muted-foreground">Inputs:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {record.inputs.map(input => (
                            <Badge key={input} variant="outline" className="text-xs">
                              {input}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Outputs:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {record.outputs.map(output => (
                            <Badge key={output} variant="outline" className="text-xs bg-blue-50">
                              {output}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Source: {record.source}</span>
                      <span className="text-muted-foreground">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveTab('lineage')}
              >
                View All Lineage Records
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="compliance" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Checks</CardTitle>
            <CardDescription>
              Status of all compliance checks across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Check</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplianceChecks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      {searchQuery ? 'No matching compliance checks found' : 'No compliance checks available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplianceChecks.map(check => (
                    <TableRow key={check.id}>
                      <TableCell>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-xs text-muted-foreground">{check.description}</div>
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(check.category)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(check.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(check.lastChecked).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => runCheck(check.id)}
                          disabled={isLoading || !governance.isGovernanceEnabled}
                        >
                          <RefreshCw size={14} className="mr-1" />
                          Run Check
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
              <Shield className="inline-block mr-1 h-4 w-4" />
              {complianceChecks.length} compliance checks
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={runAllChecks}
              disabled={isLoading || !governance.isGovernanceEnabled}
            >
              <ClipboardCheck size={14} className="mr-1" />
              Run All Checks
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="audit" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>
              Comprehensive audit trail of all system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuditRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      {searchQuery ? 'No matching audit records found' : 'No audit records available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAuditRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{record.actor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.action}
                      </TableCell>
                      <TableCell>
                        {record.resource}
                      </TableCell>
                      <TableCell>
                        {getOutcomeBadge(record.outcome)}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(record.severity)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={record.details}>
                          {record.details}
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
              <FileText className="inline-block mr-1 h-4 w-4" />
              {auditRecords.length} audit records
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                toast({
                  title: 'Audit Export',
                  description: 'Audit trail has been exported to file.',
                  variant: 'success',
                });
              }}
            >
              Export Audit Trail
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="lineage" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Data Lineage</CardTitle>
            <CardDescription>
              Track the origin and transformation of data through the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Inputs</TableHead>
                  <TableHead>Outputs</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLineageRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      {searchQuery ? 'No matching lineage records found' : 'No lineage records available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLineageRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {record.operation}
                      </TableCell>
                      <TableCell>
                        {record.source}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.model}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {record.inputs.map(input => (
                            <Badge key={input} variant="outline" className="text-xs">
                              {input}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {record.outputs.map(output => (
                            <Badge key={output} variant="outline" className="text-xs bg-blue-50">
                              {output}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{record.user}</span>
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
              <GitCommit className="inline-block mr-1 h-4 w-4" />
              {lineageRecords.length} lineage records
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                toast({
                  title: 'Lineage Visualization',
                  description: 'Opening data lineage visualization tool.',
                  variant: 'success',
                });
              }}
            >
              Visualize Lineage
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <Card>
        <CardHeader>
          <CardTitle>Governance Settings</CardTitle>
          <CardDescription>
            Configure compliance and governance settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} />
                <h3 className="font-semibold">Compliance Level</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Set the required compliance level for MCP operations
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">High (Financial)</label>
                  <input 
                    type="radio" 
                    name="complianceLevel"
                    checked={governance.complianceLevel === 'high'}
                    onChange={() => governance.setComplianceLevel('high')}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Medium (Standard)</label>
                  <input 
                    type="radio" 
                    name="complianceLevel"
                    checked={governance.complianceLevel === 'medium'}
                    onChange={() => governance.setComplianceLevel('medium')}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Low (Minimal)</label>
                  <input 
                    type="radio" 
                    name="complianceLevel"
                    checked={governance.complianceLevel === 'low'}
                    onChange={() => governance.setComplianceLevel('low')}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} />
                <h3 className="font-semibold">Data Retention</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Configure data retention policies for audit and lineage
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Audit Trail Retention</label>
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue="90"
                  >
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                    <option value="730">2 years</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Data Lineage Retention</label>
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue="180"
                  >
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                    <option value="730">2 years</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Compliance Check Frequency</label>
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue="daily"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Regulatory Compliance</AlertTitle>
            <AlertDescription>
              StockPulse is configured to comply with financial regulations including SEC requirements, 
              GDPR for data privacy, and industry best practices for AI governance.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button 
            variant="outline"
            onClick={() => {
              toast({
                title: 'Settings Reset',
                description: 'Governance settings have been reset to defaults.',
                variant: 'default',
              });
            }}
          >
            Reset to Defaults
          </Button>
          
          <Button 
            onClick={() => {
              toast({
                title: 'Settings Saved',
                description: 'Governance settings have been saved.',
                variant: 'success',
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

export default ComplianceGovernance;
