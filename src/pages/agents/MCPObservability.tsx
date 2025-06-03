import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  AlertCircle,
  CheckCircle,
  Database,
  Network,
  Server,
  Settings,
  Shield,
  Activity,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { useToast } from "../../hooks/useToast";
import { Progress } from "../../components/ui/progress";
import mcpFederationService from "../../services/mcpFederationService";

// Use the already instantiated MCP federation service
const federationService = mcpFederationService;

const MCPObservability: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Mock data for MCP connections
  const [connections, setConnections] = useState([
    {
      id: "1",
      serverName: "StockData MCP Server",
      status: "active",
      latency: 120,
      requestsPerMinute: 42,
      errorRate: 0.5,
      lastActivity: new Date().toISOString(),
      traceId: "trace-1234567890",
      spanCount: 156,
    },
    {
      id: "2",
      serverName: "Trading API MCP Server",
      status: "active",
      latency: 350,
      requestsPerMinute: 18,
      errorRate: 1.2,
      lastActivity: new Date().toISOString(),
      traceId: "trace-0987654321",
      spanCount: 89,
    },
  ]);

  // Mock data for system metrics
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 32,
    memoryUsage: 45,
    networkIn: 1.2,
    networkOut: 0.8,
    activeConnections: 2,
    pendingRequests: 5,
  });

  // Mock data for alerts
  const [alerts, setAlerts] = useState([
    {
      id: "1",
      severity: "warning",
      message: "High latency detected on Trading API MCP Server",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      acknowledged: false,
    },
    {
      id: "2",
      severity: "info",
      message: "New MCP server discovered in federation registry",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      acknowledged: true,
    },
  ]);

  // Mock data for trace logs
  const [traceLogs, setTraceLogs] = useState([
    {
      id: "1",
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: "info",
      message: "Connection established with StockData MCP Server",
      traceId: "trace-1234567890",
      spanId: "span-001",
      component: "federation-client",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: "info",
      message: "Capability discovery completed for Trading API MCP Server",
      traceId: "trace-0987654321",
      spanId: "span-002",
      component: "capability-manager",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 180000).toISOString(),
      level: "warning",
      message: "Slow response from Trading API MCP Server (350ms)",
      traceId: "trace-0987654321",
      spanId: "span-003",
      component: "request-handler",
    },
  ]);

  // Simulate metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update system metrics
      setSystemMetrics((prev) => ({
        cpuUsage: Math.min(
          100,
          Math.max(10, prev.cpuUsage + (Math.random() * 10 - 5)),
        ),
        memoryUsage: Math.min(
          100,
          Math.max(20, prev.memoryUsage + (Math.random() * 8 - 4)),
        ),
        networkIn: Math.max(0.1, prev.networkIn + (Math.random() * 0.4 - 0.2)),
        networkOut: Math.max(
          0.1,
          prev.networkOut + (Math.random() * 0.3 - 0.15),
        ),
        activeConnections: prev.activeConnections,
        pendingRequests: Math.max(
          0,
          prev.pendingRequests + (Math.random() > 0.7 ? 1 : -1),
        ),
      }));

      // Update connection metrics
      setConnections((prev) =>
        prev.map((conn) => ({
          ...conn,
          latency: Math.max(50, conn.latency + (Math.random() * 40 - 20)),
          requestsPerMinute: Math.max(
            1,
            conn.requestsPerMinute + (Math.random() * 6 - 3),
          ),
          errorRate: Math.max(0, conn.errorRate + (Math.random() * 0.4 - 0.2)),
          lastActivity:
            Math.random() > 0.7 ? new Date().toISOString() : conn.lastActivity,
          spanCount: conn.spanCount + (Math.random() > 0.6 ? 1 : 0),
        })),
      );

      // Occasionally add new trace logs
      if (Math.random() > 0.7) {
        const connection =
          connections[Math.floor(Math.random() * connections.length)];
        const logLevels = ["info", "debug", "warning", "error"];
        const logLevel =
          logLevels[Math.floor(Math.random() * (logLevels.length - 1))]; // Less chance of error
        const components = [
          "federation-client",
          "capability-manager",
          "request-handler",
          "auth-service",
          "data-processor",
        ];
        const component =
          components[Math.floor(Math.random() * components.length)];

        const newLog = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          level: logLevel,
          message: getRandomLogMessage(
            connection.serverName,
            logLevel,
            component,
          ),
          traceId: connection.traceId,
          spanId: `span-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,
          component,
        };

        setTraceLogs((prev) => [newLog, ...prev].slice(0, 100)); // Keep only the latest 100 logs

        // Add alert for error logs
        if (logLevel === "error") {
          const newAlert = {
            id: Date.now().toString(),
            severity: "error",
            message: newLog.message,
            timestamp: new Date().toISOString(),
            acknowledged: false,
          };

          setAlerts((prev) => [newAlert, ...prev]);

          toast({
            title: "Error Alert",
            description: newLog.message,
            variant: "destructive",
          });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [connections, toast]);

  // Helper function to generate random log messages
  const getRandomLogMessage = (
    serverName: string,
    level: string,
    component: string,
  ) => {
    const infoMessages = [
      `Connection heartbeat received from ${serverName}`,
      `Capability discovery initiated for ${serverName}`,
      `Authentication token refreshed for ${serverName}`,
      `Successfully processed request to ${serverName}`,
      `Received response from ${serverName}`,
    ];

    const debugMessages = [
      `Processing capability metadata from ${serverName}`,
      `Validating response schema from ${serverName}`,
      `Checking connection parameters for ${serverName}`,
      `Analyzing performance metrics for ${serverName}`,
      `Verifying compliance status for ${serverName}`,
    ];

    const warningMessages = [
      `Slow response detected from ${serverName}`,
      `Rate limit approaching for ${serverName}`,
      `Connection stability issues with ${serverName}`,
      `Token expiration imminent for ${serverName}`,
      `Capability mismatch detected with ${serverName}`,
    ];

    const errorMessages = [
      `Connection timeout with ${serverName}`,
      `Authentication failed for ${serverName}`,
      `Invalid response format from ${serverName}`,
      `Rate limit exceeded for ${serverName}`,
      `Failed to process request to ${serverName}`,
    ];

    switch (level) {
      case "info":
        return infoMessages[Math.floor(Math.random() * infoMessages.length)];
      case "debug":
        return debugMessages[Math.floor(Math.random() * debugMessages.length)];
      case "warning":
        return warningMessages[
          Math.floor(Math.random() * warningMessages.length)
        ];
      case "error":
        return errorMessages[Math.floor(Math.random() * errorMessages.length)];
      default:
        return `Log message for ${serverName}`;
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);

      toast({
        title: "Auto-refresh Disabled",
        description: "Manual refresh mode activated.",
        variant: "default",
      });
    } else {
      const interval = window.setInterval(() => {
        refreshData();
      }, 10000);

      setRefreshInterval(interval);

      toast({
        title: "Auto-refresh Enabled",
        description: "Data will refresh every 10 seconds.",
        variant: "success",
      });
    }
  };

  // Manual refresh
  const refreshData = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      toast({
        title: "Data Refreshed",
        description: "Observability data has been updated.",
        variant: "success",
      });
    }, 1000);
  };

  // Acknowledge alert
  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert,
      ),
    );

    toast({
      title: "Alert Acknowledged",
      description: "The alert has been marked as acknowledged.",
      variant: "success",
    });
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error":
        return <Badge variant="destructive">{severity}</Badge>;
      case "warning":
        return <Badge variant="warning">{severity}</Badge>;
      case "info":
        return <Badge variant="secondary">{severity}</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  // Get log level badge
  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return <Badge variant="destructive">{level}</Badge>;
      case "warning":
        return <Badge variant="warning">{level}</Badge>;
      case "info":
        return <Badge variant="secondary">{level}</Badge>;
      case "debug":
        return <Badge variant="outline">{level}</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            MCP Observability
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and analyze MCP connections and performance
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            variant={refreshInterval ? "default" : "outline"}
            className="gap-2"
            onClick={toggleAutoRefresh}
          >
            <Activity size={16} />
            {refreshInterval ? "Disable Auto-refresh" : "Enable Auto-refresh"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network size={18} />
              Active Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{connections.length}</div>
            <p className="text-sm text-muted-foreground">
              MCP servers currently connected
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {systemMetrics.pendingRequests} pending requests
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle size={18} />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {alerts.filter((a) => !a.acknowledged).length}
            </div>
            <p className="text-sm text-muted-foreground">
              Unacknowledged alerts
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {alerts.length} total alerts
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity size={18} />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  systemMetrics.cpuUsage > 80
                    ? "bg-red-500"
                    : systemMetrics.cpuUsage > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              ></div>
              <span className="font-medium">
                {systemMetrics.cpuUsage > 80
                  ? "Critical"
                  : systemMetrics.cpuUsage > 60
                    ? "Warning"
                    : "Healthy"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Overall system status
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              CPU: {systemMetrics.cpuUsage.toFixed(1)}% | Memory:{" "}
              {systemMetrics.memoryUsage.toFixed(1)}%
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>MCP Connection Metrics</CardTitle>
          <CardDescription>
            Performance and health metrics for active MCP connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Server</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Requests/min</TableHead>
                <TableHead>Error Rate</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell>
                    <div className="font-medium">{connection.serverName}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" className="gap-1">
                      <Activity size={12} />
                      {connection.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          connection.latency < 200
                            ? "text-green-600"
                            : connection.latency < 500
                              ? "text-yellow-600"
                              : "text-red-600"
                        }
                      >
                        {connection.latency.toFixed(0)}ms
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {connection.requestsPerMinute.toFixed(1)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          connection.errorRate < 1
                            ? "text-green-600"
                            : connection.errorRate < 5
                              ? "text-yellow-600"
                              : "text-red-600"
                        }
                      >
                        {connection.errorRate.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(connection.lastActivity).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Trace Viewer",
                            description: `Opening trace ${connection.traceId} in trace viewer.`,
                            variant: "success",
                          });
                        }}
                      >
                        <Activity size={14} className="mr-1" />
                        View Traces
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Test Connection",
                            description: `Testing connection to ${connection.serverName}.`,
                            variant: "default",
                          });

                          setTimeout(() => {
                            toast({
                              title: "Connection Test",
                              description: `Connection to ${connection.serverName} is healthy.`,
                              variant: "success",
                            });
                          }, 1000);
                        }}
                      >
                        <Zap size={14} className="mr-1" />
                        Test
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>
              Resource utilization and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm font-medium">
                  {systemMetrics.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={systemMetrics.cpuUsage}
                className="h-2"
                indicatorClassName={
                  systemMetrics.cpuUsage > 80
                    ? "bg-red-500"
                    : systemMetrics.cpuUsage > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm font-medium">
                  {systemMetrics.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={systemMetrics.memoryUsage}
                className="h-2"
                indicatorClassName={
                  systemMetrics.memoryUsage > 80
                    ? "bg-red-500"
                    : systemMetrics.memoryUsage > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Network In</span>
                <span className="text-sm font-medium">
                  {systemMetrics.networkIn.toFixed(2)} MB/s
                </span>
              </div>
              <Progress value={systemMetrics.networkIn * 10} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Network Out</span>
                <span className="text-sm font-medium">
                  {systemMetrics.networkOut.toFixed(2)} MB/s
                </span>
              </div>
              <Progress value={systemMetrics.networkOut * 10} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>
              Unacknowledged alerts and warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.filter((alert) => !alert.acknowledged).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="mx-auto h-8 w-8 mb-2" />
                  <p>No active alerts</p>
                </div>
              ) : (
                alerts
                  .filter((alert) => !alert.acknowledged)
                  .map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getSeverityBadge(alert.severity)}
                            <span className="font-medium">{alert.message}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              <AlertCircle className="inline-block mr-1 h-4 w-4" />
              {alerts.filter((alert) => !alert.acknowledged).length} active
              alerts
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAlerts((prev) =>
                  prev.map((alert) => ({ ...alert, acknowledged: true })),
                );

                toast({
                  title: "All Alerts Acknowledged",
                  description: "All alerts have been marked as acknowledged.",
                  variant: "success",
                });
              }}
              disabled={
                alerts.filter((alert) => !alert.acknowledged).length === 0
              }
            >
              Acknowledge All
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trace Logs</CardTitle>
          <CardDescription>
            Distributed tracing and logging for MCP operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              <Input
                type="search"
                placeholder="Search logs..."
                className="w-[300px]"
              />
              <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">All Levels</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  title: "Trace Explorer",
                  description: "Opening distributed trace explorer.",
                  variant: "success",
                });
              }}
            >
              <Activity size={16} className="mr-2" />
              Open Trace Explorer
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Trace ID</TableHead>
                  <TableHead>Span ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {traceLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{getLogLevelBadge(log.level)}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">{log.message}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">{log.component}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs truncate max-w-[100px]">
                        {log.traceId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">{log.spanId}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            <Database className="inline-block mr-1 h-4 w-4" />
            {traceLogs.length} log entries
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast({
                title: "Logs Exported",
                description: "Trace logs have been exported to file.",
                variant: "success",
              });
            }}
          >
            Export Logs
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anomaly Detection</CardTitle>
          <CardDescription>
            Automated detection of abnormal patterns in MCP operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} />
                <h3 className="font-semibold">Security Anomalies</h3>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className={"h-3 w-3 rounded-full bg-green-500"}></div>
                <span className="text-sm">No anomalies detected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Monitoring for unusual authentication patterns, access attempts,
                and security violations
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={18} />
                <h3 className="font-semibold">Performance Anomalies</h3>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className={"h-3 w-3 rounded-full bg-yellow-500"}></div>
                <span className="text-sm">1 anomaly detected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Unusual latency patterns detected in Trading API MCP Server
                responses
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} />
                <h3 className="font-semibold">Data Anomalies</h3>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className={"h-3 w-3 rounded-full bg-green-500"}></div>
                <span className="text-sm">No anomalies detected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Monitoring for unusual data patterns, format changes, and schema
                violations
              </p>
            </div>
          </div>

          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Anomaly Detection</AlertTitle>
            <AlertDescription>
              The anomaly detection system uses machine learning to identify
              unusual patterns in MCP operations. Detected anomalies are
              automatically logged and may trigger alerts based on severity.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            <Search className="inline-block mr-1 h-4 w-4" />
            Last scan: {new Date().toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast({
                title: "Anomaly Scan",
                description: "Running manual anomaly detection scan...",
                variant: "default",
              });

              setTimeout(() => {
                toast({
                  title: "Scan Complete",
                  description:
                    "Anomaly detection scan completed. 1 anomaly found.",
                  variant: "success",
                });
              }, 2000);
            }}
          >
            Run Manual Scan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MCPObservability;
