import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  AlertCircle,
  Shield,
  Sliders,
  BarChart4,
  Lock,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../../hooks/useToast';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Form schema for risk management settings
const riskManagementSchema = z.object({
  maxDrawdownPercent: z.number().min(1).max(50),
  dailyLossLimitPercent: z.number().min(0.1).max(20),
  positionSizeLimitPercent: z.number().min(1).max(100),
  consecutiveLossesThreshold: z.number().min(1).max(20),
  volatilityMultiplier: z.number().min(0.1).max(5),
  enableEmergencyShutdown: z.boolean(),
  enableMcpRiskMonitoring: z.boolean(),
  enableAuditLogging: z.boolean(),
  riskLevel: z.enum(['conservative', 'moderate', 'aggressive']),
});

type RiskManagementValues = z.infer<typeof riskManagementSchema>;

const RiskManagementFramework: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();

  const form = useForm<RiskManagementValues>({
    resolver: zodResolver(riskManagementSchema),
    defaultValues: {
      maxDrawdownPercent: 5,
      dailyLossLimitPercent: 2,
      positionSizeLimitPercent: 10,
      consecutiveLossesThreshold: 3,
      volatilityMultiplier: 1.5,
      enableEmergencyShutdown: true,
      enableMcpRiskMonitoring: true,
      enableAuditLogging: true,
      riskLevel: 'moderate',
    },
  });

  const handleSaveSettings = (values: RiskManagementValues) => {
    console.log('Risk management settings saved:', values);

    toast({
      title: 'Risk Settings Saved',
      description: 'Your risk management settings have been updated.',
      variant: 'success',
    });
  };

  const handleResetToDefaults = () => {
    form.reset({
      maxDrawdownPercent: 5,
      dailyLossLimitPercent: 2,
      positionSizeLimitPercent: 10,
      consecutiveLossesThreshold: 3,
      volatilityMultiplier: 1.5,
      enableEmergencyShutdown: true,
      enableMcpRiskMonitoring: true,
      enableAuditLogging: true,
      riskLevel: 'moderate',
    });

    toast({
      title: 'Settings Reset',
      description: 'Risk management settings have been reset to defaults.',
      variant: 'default',
    });
  };

  const handleEmergencyStop = () => {
    toast({
      title: 'Emergency Stop Activated',
      description:
        'All automated trading has been halted. Please review your positions.',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Risk Management Framework
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure risk parameters for automated trading with MCP integration
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

      <Tabs
        defaultValue="general"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="mcp">MCP Risk Controls</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveSettings)}>
            <TabsContent value="general" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sliders size={18} />
                    General Risk Parameters
                  </CardTitle>
                  <CardDescription>
                    Configure basic risk management settings for all automations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="maxDrawdownPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Drawdown (%)</FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Slider
                                min={1}
                                max={50}
                                step={0.5}
                                value={[field.value]}
                                onValueChange={(value) =>
                                  field.onChange(value[0])
                                }
                                className="flex-1"
                              />
                            </FormControl>
                            <Input
                              type="number"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              className="w-16"
                            />
                          </div>
                          <FormDescription>
                            Maximum allowed portfolio drawdown before halting
                            all automations
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dailyLossLimitPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Loss Limit (%)</FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Slider
                                min={0.1}
                                max={20}
                                step={0.1}
                                value={[field.value]}
                                onValueChange={(value) =>
                                  field.onChange(value[0])
                                }
                                className="flex-1"
                              />
                            </FormControl>
                            <Input
                              type="number"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              className="w-16"
                            />
                          </div>
                          <FormDescription>
                            Maximum allowed daily loss as percentage of
                            portfolio value
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="positionSizeLimitPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position Size Limit (%)</FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Slider
                                min={1}
                                max={100}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) =>
                                  field.onChange(value[0])
                                }
                                className="flex-1"
                              />
                            </FormControl>
                            <Input
                              type="number"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              className="w-16"
                            />
                          </div>
                          <FormDescription>
                            Maximum position size as percentage of portfolio
                            value
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consecutiveLossesThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consecutive Losses Threshold</FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Slider
                                min={1}
                                max={20}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) =>
                                  field.onChange(value[0])
                                }
                                className="flex-1"
                              />
                            </FormControl>
                            <Input
                              type="number"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                              className="w-16"
                            />
                          </div>
                          <FormDescription>
                            Number of consecutive losing trades before pausing
                            an automation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="riskLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overall Risk Profile</FormLabel>
                        <div className="flex gap-4">
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input
                                type="radio"
                                checked={field.value === 'conservative'}
                                onChange={() => field.onChange('conservative')}
                                className="h-4 w-4 text-primary"
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Conservative
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input
                                type="radio"
                                checked={field.value === 'moderate'}
                                onChange={() => field.onChange('moderate')}
                                className="h-4 w-4 text-primary"
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Moderate
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <input
                                type="radio"
                                checked={field.value === 'aggressive'}
                                onChange={() => field.onChange('aggressive')}
                                className="h-4 w-4 text-primary"
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Aggressive
                            </FormLabel>
                          </FormItem>
                        </div>
                        <FormDescription>
                          This setting affects multiple risk parameters
                          simultaneously
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableEmergencyShutdown"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Emergency Shutdown
                          </FormLabel>
                          <FormDescription>
                            Automatically halt all trading when risk thresholds
                            are exceeded
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mcp" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield size={18} />
                    MCP Risk Controls
                  </CardTitle>
                  <CardDescription>
                    Configure risk management for Model Context Protocol
                    integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="enableMcpRiskMonitoring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            MCP Risk Monitoring
                          </FormLabel>
                          <FormDescription>
                            Enable real-time monitoring of MCP server operations
                            and risk metrics
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

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">
                      MCP Tool Access Controls
                    </h3>
                    <div className="border rounded-lg divide-y">
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Market Data Tools</h4>
                          <p className="text-sm text-muted-foreground">
                            Read-only access to market data
                          </p>
                        </div>
                        <Badge variant="outline">Low Risk</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Analysis Tools</h4>
                          <p className="text-sm text-muted-foreground">
                            Technical and fundamental analysis
                          </p>
                        </div>
                        <Badge variant="outline">Low Risk</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Portfolio Management</h4>
                          <p className="text-sm text-muted-foreground">
                            View and manage portfolio allocations
                          </p>
                        </div>
                        <Badge variant="outline">Medium Risk</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Order Execution</h4>
                          <p className="text-sm text-muted-foreground">
                            Place and manage trading orders
                          </p>
                        </div>
                        <Badge variant="destructive">High Risk</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">
                      MCP Server Risk Limits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium">StockData MCP Server</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Max Requests/Min:</span>
                            <span>100</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Data Freshness:</span>
                            <span>15 min delay</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Access Level:</span>
                            <Badge variant="outline">Read Only</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium">Trading API MCP Server</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Max Order Size:</span>
                            <span>$10,000</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Daily Trade Limit:</span>
                            <span>25 trades</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Access Level:</span>
                            <Badge variant="outline">Restricted</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>MCP Security Notice</AlertTitle>
                    <AlertDescription>
                      MCP servers have access to execute operations within
                      StockPulse. Always verify server authenticity and maintain
                      strict access controls.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart4 size={18} />
                    Advanced Risk Settings
                  </CardTitle>
                  <CardDescription>
                    Configure advanced risk parameters for experienced users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="volatilityMultiplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volatility Multiplier</FormLabel>
                        <div className="flex items-center gap-4">
                          <FormControl>
                            <Slider
                              min={0.1}
                              max={5}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(value) =>
                                field.onChange(value[0])
                              }
                              className="flex-1"
                            />
                          </FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className="w-16"
                          />
                        </div>
                        <FormDescription>
                          Adjusts position sizing based on market volatility
                          (higher = smaller positions in volatile markets)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableAuditLogging"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Lock size={16} />
                            Comprehensive Audit Logging
                          </FormLabel>
                          <FormDescription>
                            Enable detailed logging of all trading activities
                            and risk events
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

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">
                      Market Condition Overrides
                    </h3>
                    <div className="border rounded-lg divide-y">
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">
                            High Volatility Markets
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            When VIX &gt; 30
                          </p>
                        </div>
                        <Badge>Reduce Position Size by 50%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Earnings Season</h4>
                          <p className="text-sm text-muted-foreground">
                            During major earnings weeks
                          </p>
                        </div>
                        <Badge>Increase Stop Loss Buffers</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Fed Announcement Days</h4>
                          <p className="text-sm text-muted-foreground">
                            FOMC meeting days
                          </p>
                        </div>
                        <Badge variant="destructive">Pause All Trading</Badge>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Advanced Settings Warning</AlertTitle>
                    <AlertDescription>
                      These settings are intended for experienced traders only.
                      Improper configuration may significantly impact trading
                      performance.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetToDefaults}
                className="gap-2"
              >
                <RefreshCw size={16} />
                Reset to Defaults
              </Button>
              <Button type="submit" className="gap-2">
                <Save size={16} />
                Save Settings
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default RiskManagementFramework;
