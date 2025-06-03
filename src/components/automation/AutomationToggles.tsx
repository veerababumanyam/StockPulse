import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Settings,
  RefreshCw,
  Power,
  Activity,
  Server,
  Zap,
  Shield,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../../hooks/useToast";
import { Switch } from "../ui/switch";
import { Progress } from "../ui/progress";

// Form schema for automation toggles
const automationTogglesSchema = z.object({
  enableMarketDataMcp: z.boolean(),
  enableTradingApiMcp: z.boolean(),
  enableNewsAnalysisMcp: z.boolean(),
  enablePortfolioOptimizer: z.boolean(),
  enableRiskManagement: z.boolean(),
  enableAuditLogging: z.boolean(),
  enableEmergencyStop: z.boolean(),
  enableNotifications: z.boolean(),
});

type AutomationTogglesValues = z.infer<typeof automationTogglesSchema>;

const AutomationToggles: React.FC = () => {
  const [activeTab, setActiveTab] = useState("mcp");
  const { toast } = useToast();

  const form = useForm<AutomationTogglesValues>({
    resolver: zodResolver(automationTogglesSchema),
    defaultValues: {
      enableMarketDataMcp: true,
      enableTradingApiMcp: true,
      enableNewsAnalysisMcp: false,
      enablePortfolioOptimizer: false,
      enableRiskManagement: true,
      enableAuditLogging: true,
      enableEmergencyStop: true,
      enableNotifications: true,
    },
  });

  const handleSaveSettings = (values: AutomationTogglesValues) => {
    console.log("Automation toggles saved:", values);

    toast({
      title: "Settings Saved",
      description: "Your automation settings have been updated.",
      variant: "success",
    });
  };

  const handleEmergencyStop = () => {
    toast({
      title: "Emergency Stop Activated",
      description:
        "All automated trading has been halted. Please review your positions.",
      variant: "destructive",
    });
  };

  const getMcpServerStatus = (isEnabled: boolean) => {
    return isEnabled ? (
      <Badge variant="success" className="gap-1">
        <Activity size={12} />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="gap-1">
        <Power size={12} />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Automation Controls
          </h2>
          <p className="text-muted-foreground mt-1">
            Enable or disable automation components and MCP integrations
          </p>
        </div>
        <Button
          variant="destructive"
          className="gap-2"
          onClick={handleEmergencyStop}
        >
          <Shield size={16} />
          Emergency Stop
        </Button>
      </div>

      <Tabs defaultValue="mcp" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="mcp">MCP Servers</TabsTrigger>
          <TabsTrigger value="safety">Safety Controls</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveSettings)}>
            <TabsContent value="mcp" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server size={18} />
                    MCP Server Controls
                  </CardTitle>
                  <CardDescription>
                    Enable or disable MCP server integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="enableMarketDataMcp"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-base font-semibold">
                                StockData MCP Server
                              </FormLabel>
                              {getMcpServerStatus(field.value)}
                            </div>
                            <FormDescription>
                              Financial data and market analysis tools
                            </FormDescription>
                            {field.value && (
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Response Time:</span>
                                  <span className="text-green-600">120ms</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Requests Today:</span>
                                  <span>1,243</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enableTradingApiMcp"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-base font-semibold">
                                Trading API MCP Server
                              </FormLabel>
                              {getMcpServerStatus(field.value)}
                            </div>
                            <FormDescription>
                              Trading execution and order management
                            </FormDescription>
                            {field.value && (
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Response Time:</span>
                                  <span className="text-yellow-600">350ms</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Orders Today:</span>
                                  <span>76</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enableNewsAnalysisMcp"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-base font-semibold">
                                News Analysis MCP Client
                              </FormLabel>
                              {getMcpServerStatus(field.value)}
                            </div>
                            <FormDescription>
                              External news analysis service
                            </FormDescription>
                            {field.value && (
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Response Time:</span>
                                  <span className="text-green-600">180ms</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Requests Today:</span>
                                  <span>542</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enablePortfolioOptimizer"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-base font-semibold">
                                Portfolio Optimizer MCP Client
                              </FormLabel>
                              {getMcpServerStatus(field.value)}
                            </div>
                            <FormDescription>
                              Portfolio optimization and rebalancing
                            </FormDescription>
                            {field.value && (
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Response Time:</span>
                                  <span className="text-red-600">Offline</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Last Connected:</span>
                                  <span>7 days ago</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>MCP Integration Notice</AlertTitle>
                    <AlertDescription>
                      Enabling MCP servers grants them access to execute
                      operations within StockPulse. Review security settings
                      regularly.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                  <div className="text-sm text-muted-foreground">
                    <Server className="inline-block mr-1 h-4 w-4" />
                    MCP servers enhance StockPulse with additional capabilities
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/agents/ai-agents">
                      <Settings size={14} className="mr-1" />
                      Manage MCP Servers
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="safety" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield size={18} />
                    Safety Controls
                  </CardTitle>
                  <CardDescription>
                    Configure safety mechanisms for automated trading
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="enableRiskManagement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-base font-semibold">
                                Risk Management Framework
                              </FormLabel>
                              <Badge
                                variant={
                                  field.value ? "success" : "destructive"
                                }
                              >
                                {field.value ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <FormDescription>
                              Enforces position sizing, drawdown limits, and
                              other risk controls
                            </FormDescription>
                            {field.value && (
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Current Risk Profile:</span>
                                  <Badge variant="outline">Moderate</Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Portfolio Protection:</span>
                                  <span className="text-green-600">Active</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enableAuditLogging"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-base font-semibold">
                                Comprehensive Audit Logging
                              </FormLabel>
                              <Badge
                                variant={
                                  field.value ? "success" : "destructive"
                                }
                              >
                                {field.value ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <FormDescription>
                              Records all trading activities, MCP operations,
                              and system events
                            </FormDescription>
                            {field.value && (
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Log Storage:</span>
                                  <span>30 days</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Events Today:</span>
                                  <span>2,847</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enableEmergencyStop"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-base font-semibold">
                                Automatic Emergency Stop
                              </FormLabel>
                              <Badge
                                variant={
                                  field.value ? "success" : "destructive"
                                }
                              >
                                {field.value ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <FormDescription>
                              Automatically halts all trading when risk
                              thresholds are exceeded
                            </FormDescription>
                            {field.value && (
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Trigger Conditions:</span>
                                  <Badge variant="outline">Multiple</Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Last Triggered:</span>
                                  <span>Never</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Safety Recommendation</AlertTitle>
                    <AlertDescription>
                      We strongly recommend keeping all safety controls enabled
                      for automated trading operations.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                  <div className="text-sm text-muted-foreground">
                    <Shield className="inline-block mr-1 h-4 w-4" />
                    Safety controls help protect your portfolio from unexpected
                    events
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/agents/risk-management">
                      <Settings size={14} className="mr-1" />
                      Configure Risk Settings
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap size={18} />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Configure alerts and notifications for automation events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="enableNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-base font-semibold">
                              Automation Notifications
                            </FormLabel>
                            <Badge
                              variant={field.value ? "success" : "destructive"}
                            >
                              {field.value ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <FormDescription>
                            Receive notifications for important automation
                            events
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("enableNotifications") && (
                    <div className="space-y-4 mt-4">
                      <h3 className="text-sm font-semibold">
                        Notification Channels
                      </h3>
                      <div className="border rounded-lg divide-y">
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Switch checked={true} />
                            <span>In-App Notifications</span>
                          </div>
                          <Badge variant="outline">All Events</Badge>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Switch checked={true} />
                            <span>Email Alerts</span>
                          </div>
                          <Badge variant="outline">High Priority</Badge>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Switch checked={false} />
                            <span>SMS Alerts</span>
                          </div>
                          <Badge variant="outline">Critical Only</Badge>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Switch checked={false} />
                            <span>Mobile Push Notifications</span>
                          </div>
                          <Badge variant="outline">All Events</Badge>
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold mt-6">
                        Event Types
                      </h3>
                      <div className="border rounded-lg divide-y">
                        <div className="p-4 flex justify-between items-center">
                          <span>Trade Execution</span>
                          <Badge variant="success">Enabled</Badge>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <span>Risk Threshold Alerts</span>
                          <Badge variant="success">Enabled</Badge>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <span>MCP Server Status Changes</span>
                          <Badge variant="success">Enabled</Badge>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <span>Performance Reports</span>
                          <Badge variant="success">Enabled</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                  <div className="text-sm text-muted-foreground">
                    <Zap className="inline-block mr-1 h-4 w-4" />
                    Stay informed about your automated trading activities
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings size={14} className="mr-1" />
                    Test Notifications
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <div className="flex justify-end mt-6">
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        </Form>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
          <CardDescription>
            Current status of automation systems and MCP integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">System Health</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Healthy</span>
                </div>
              </div>
              <Progress value={98} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                All systems operating normally
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">
                  MCP Server Availability
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Partial</span>
                </div>
              </div>
              <Progress
                value={75}
                className="h-2"
                indicatorClassName="bg-yellow-500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                3/4 MCP servers online and responding
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Active Automations</span>
                <span className="text-sm">3 active</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                3 out of 4 automations currently running
              </p>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-2">Recent Events</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">11:15 AM</span>
                  <span>Market Open Scanner completed successfully</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">10:30 AM</span>
                  <span>Trading API MCP Server response time degraded</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">09:45 AM</span>
                  <span>Portfolio Optimizer MCP Client connection failed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">09:30 AM</span>
                  <span>All automations started for market open</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationToggles;
