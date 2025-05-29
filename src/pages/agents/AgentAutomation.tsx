import React, { useState } from "react";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Settings,
  Server,
  Laptop,
  Shield,
  Zap,
  BarChart4,
  Sliders,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../../hooks/useToast";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";

// Type definitions
interface AutomationConfig {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  schedule: string;
  lastRun: string | null;
  nextRun: string | null;
  successRate: number;
  riskLevel: "low" | "medium" | "high";
  mcpEnabled: boolean;
  mcpServers: string[];
  createdAt: string;
}

interface MCPServer {
  id: string;
  name: string;
  description: string;
  type: "server" | "client";
  status: "active" | "inactive";
  capabilities: string[];
}

// Mock data for automation configurations
const initialAutomations: AutomationConfig[] = [
  {
    id: "1",
    name: "Market Open Scanner",
    description: "Scans for trading opportunities at market open",
    status: "active",
    schedule: "09:30 AM ET (Market Open)",
    lastRun: "2025-05-27T09:30:00Z",
    nextRun: "2025-05-28T09:30:00Z",
    successRate: 98.5,
    riskLevel: "medium",
    mcpEnabled: true,
    mcpServers: ["1", "2"],
    createdAt: "2025-04-10T10:30:00Z",
  },
  {
    id: "2",
    name: "Daily Portfolio Rebalancer",
    description:
      "Automatically rebalances portfolio based on target allocations",
    status: "active",
    schedule: "04:00 PM ET (Market Close)",
    lastRun: "2025-05-26T16:00:00Z",
    nextRun: "2025-05-27T16:00:00Z",
    successRate: 100,
    riskLevel: "low",
    mcpEnabled: true,
    mcpServers: ["2"],
    createdAt: "2025-04-12T14:15:00Z",
  },
  {
    id: "3",
    name: "Earnings Announcement Trader",
    description: "Executes trades based on earnings announcements",
    status: "inactive",
    schedule: "Event-based",
    lastRun: "2025-05-20T15:45:00Z",
    nextRun: null,
    successRate: 76.2,
    riskLevel: "high",
    mcpEnabled: false,
    mcpServers: [],
    createdAt: "2025-04-15T09:20:00Z",
  },
  {
    id: "4",
    name: "Technical Breakout Scanner",
    description: "Identifies stocks breaking out of technical patterns",
    status: "active",
    schedule: "Every 30 minutes (Market Hours)",
    lastRun: "2025-05-27T11:00:00Z",
    nextRun: "2025-05-27T11:30:00Z",
    successRate: 82.7,
    riskLevel: "medium",
    mcpEnabled: true,
    mcpServers: ["1"],
    createdAt: "2025-04-18T11:45:00Z",
  },
];

// Mock data for MCP servers (simplified from AIAgents.tsx)
const mcpServers: MCPServer[] = [
  {
    id: "1",
    name: "StockData MCP Server",
    description: "Financial data and market analysis tools",
    type: "server",
    status: "active",
    capabilities: ["market_data", "technical_analysis", "sentiment_analysis"],
  },
  {
    id: "2",
    name: "Trading API MCP Server",
    description: "Trading execution and order management",
    type: "server",
    status: "active",
    capabilities: ["order_execution", "portfolio_management", "risk_analysis"],
  },
  {
    id: "3",
    name: "News Analysis MCP Client",
    description: "External news analysis service",
    type: "client",
    status: "active",
    capabilities: [],
  },
];

// Form schema for adding/editing automation
const automationFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters" }),
  schedule: z.string().min(1, { message: "Schedule is required" }),
  riskLevel: z.enum(["low", "medium", "high"]),
  mcpEnabled: z.boolean(),
  mcpServers: z.array(z.string()).optional(),
});

type AutomationFormValues = z.infer<typeof automationFormSchema>;

const AgentAutomation: React.FC = () => {
  const [automations, setAutomations] =
    useState<AutomationConfig[]>(initialAutomations);
  const [isAddingAutomation, setIsAddingAutomation] = useState(false);
  const [isEditingAutomation, setIsEditingAutomation] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const form = useForm<AutomationFormValues>({
    resolver: zodResolver(automationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      schedule: "",
      riskLevel: "medium",
      mcpEnabled: false,
      mcpServers: [],
    },
  });

  const handleAddAutomation = (values: AutomationFormValues) => {
    const newAutomation: AutomationConfig = {
      id: Date.now().toString(),
      name: values.name,
      description: values.description,
      status: "inactive",
      schedule: values.schedule,
      lastRun: null,
      nextRun: null,
      successRate: 0,
      riskLevel: values.riskLevel,
      mcpEnabled: values.mcpEnabled,
      mcpServers: values.mcpServers || [],
      createdAt: new Date().toISOString(),
    };

    setAutomations((prev) => [...prev, newAutomation]);
    setIsAddingAutomation(false);
    form.reset();

    toast({
      title: "Automation Added",
      description: `${values.name} has been successfully added.`,
      variant: "success",
    });
  };

  const handleEditAutomation = (automationId: string) => {
    const automation = automations.find((a) => a.id === automationId);
    if (!automation) return;

    form.reset({
      name: automation.name,
      description: automation.description,
      schedule: automation.schedule,
      riskLevel: automation.riskLevel,
      mcpEnabled: automation.mcpEnabled,
      mcpServers: automation.mcpServers,
    });

    setIsEditingAutomation(automationId);
  };

  const handleUpdateAutomation = (values: AutomationFormValues) => {
    if (!isEditingAutomation) return;

    const updatedAutomations = automations.map(
      (automation): AutomationConfig => {
        if (automation.id === isEditingAutomation) {
          return {
            ...automation,
            name: values.name,
            description: values.description,
            schedule: values.schedule,
            riskLevel: values.riskLevel,
            mcpEnabled: values.mcpEnabled,
            mcpServers: values.mcpServers || [],
          };
        }
        return automation;
      },
    );

    setAutomations(updatedAutomations);
    setIsEditingAutomation(null);
    form.reset();

    toast({
      title: "Automation Updated",
      description: `${values.name} has been successfully updated.`,
      variant: "success",
    });
  };

  const handleDeleteAutomation = (automationId: string) => {
    setAutomations((prev) =>
      prev.filter((automation) => automation.id !== automationId),
    );

    toast({
      title: "Automation Deleted",
      description: "The automation has been removed.",
      variant: "default",
    });
  };

  const handleToggleStatus = (automationId: string) => {
    const updatedAutomations = automations.map(
      (automation): AutomationConfig => {
        if (automation.id === automationId) {
          const newStatus: "active" | "inactive" =
            automation.status === "active" ? "inactive" : "active";
          return {
            ...automation,
            status: newStatus,
            nextRun:
              newStatus === "active"
                ? new Date(Date.now() + 3600000).toISOString()
                : null,
          };
        }
        return automation;
      },
    );

    setAutomations(updatedAutomations);

    const automation = updatedAutomations.find((a) => a.id === automationId);

    toast({
      title: `Automation ${automation?.status === "active" ? "Activated" : "Deactivated"}`,
      description: `${automation?.name} is now ${automation?.status}.`,
      variant: automation?.status === "active" ? "success" : "default",
    });
  };

  const handleRunNow = (automationId: string) => {
    // Simulate running the automation
    setTimeout(() => {
      const updatedAutomations = automations.map(
        (automation): AutomationConfig => {
          if (automation.id === automationId) {
            return {
              ...automation,
              lastRun: new Date().toISOString(),
              nextRun: new Date(Date.now() + 3600000).toISOString(),
            };
          }
          return automation;
        },
      );

      setAutomations(updatedAutomations);

      const automation = updatedAutomations.find((a) => a.id === automationId);

      toast({
        title: "Automation Executed",
        description: `${automation?.name} was executed successfully.`,
        variant: "success",
      });
    }, 1500);
  };

  const filteredAutomations =
    activeTab === "all"
      ? automations
      : automations.filter((automation) => {
          if (activeTab === "active") return automation.status === "active";
          if (activeTab === "inactive") return automation.status === "inactive";
          if (activeTab === "mcp") return automation.mcpEnabled;
          return true;
        });

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMcpServerNames = (serverIds: string[]) => {
    return serverIds
      .map((id) => {
        const server = mcpServers.find((s) => s.id === id);
        return server ? server.name : id;
      })
      .join(", ");
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Agent Automation
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage automated trading agents with MCP integration
          </p>
        </div>

        <Dialog open={isAddingAutomation} onOpenChange={setIsAddingAutomation}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Automation</DialogTitle>
              <DialogDescription>
                Configure a new automated trading agent.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddAutomation)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Market Open Scanner"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this automation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Scans for trading opportunities at market open"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description of what this automation does
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 09:30 AM ET (Market Open)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        When this automation should run (time, frequency, or
                        event)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Level</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="low">Low Risk</option>
                          <option value="medium">Medium Risk</option>
                          <option value="high">High Risk</option>
                        </select>
                      </FormControl>
                      <FormDescription>
                        The risk level associated with this automation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mcpEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Server size={16} />
                          Enable MCP Integration
                        </FormLabel>
                        <FormDescription>
                          Allow this automation to use MCP servers for enhanced
                          capabilities
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

                {form.watch("mcpEnabled") && (
                  <FormField
                    control={form.control}
                    name="mcpServers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MCP Servers</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {mcpServers.map((server) => (
                              <Badge
                                key={server.id}
                                variant={
                                  field.value?.includes(server.id)
                                    ? "default"
                                    : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = field.value || [];
                                  const updated = current.includes(server.id)
                                    ? current.filter(
                                        (id: string) => id !== server.id,
                                      )
                                    : [...current, server.id];
                                  field.onChange(updated);
                                }}
                              >
                                {server.name}
                              </Badge>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Select the MCP servers this automation should use
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Alert variant="warning" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Automation Notice</AlertTitle>
                  <AlertDescription>
                    Automated trading carries risks. Ensure you have proper risk
                    management in place and monitor all automations regularly.
                  </AlertDescription>
                </Alert>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingAutomation(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Automation</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!isEditingAutomation}
          onOpenChange={(open: boolean) =>
            !open && setIsEditingAutomation(null)
          }
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Automation</DialogTitle>
              <DialogDescription>
                Update the configuration for this automation.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleUpdateAutomation)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Market Open Scanner"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this automation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Scans for trading opportunities at market open"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description of what this automation does
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 09:30 AM ET (Market Open)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        When this automation should run (time, frequency, or
                        event)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Level</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="low">Low Risk</option>
                          <option value="medium">Medium Risk</option>
                          <option value="high">High Risk</option>
                        </select>
                      </FormControl>
                      <FormDescription>
                        The risk level associated with this automation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mcpEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Server size={16} />
                          Enable MCP Integration
                        </FormLabel>
                        <FormDescription>
                          Allow this automation to use MCP servers for enhanced
                          capabilities
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

                {form.watch("mcpEnabled") && (
                  <FormField
                    control={form.control}
                    name="mcpServers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MCP Servers</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {mcpServers.map((server) => (
                              <Badge
                                key={server.id}
                                variant={
                                  field.value?.includes(server.id)
                                    ? "default"
                                    : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = field.value || [];
                                  const updated = current.includes(server.id)
                                    ? current.filter(
                                        (id: string) => id !== server.id,
                                      )
                                    : [...current, server.id];
                                  field.onChange(updated);
                                }}
                              >
                                {server.name}
                              </Badge>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Select the MCP servers this automation should use
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
                      setIsEditingAutomation(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Automation</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All Automations ({automations.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({automations.filter((a) => a.status === "active").length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive (
            {automations.filter((a) => a.status === "inactive").length})
          </TabsTrigger>
          <TabsTrigger value="mcp">
            MCP Enabled ({automations.filter((a) => a.mcpEnabled).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated Trading Agents</CardTitle>
              <CardDescription>
                Manage your automated trading strategies with MCP integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Last/Next Run</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>MCP Integration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAutomations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No automations found. Add your first automation to get
                        started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAutomations.map((automation) => (
                      <TableRow key={automation.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{automation.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {automation.description}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{automation.schedule}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span>
                              Last:{" "}
                              {automation.lastRun
                                ? new Date(automation.lastRun).toLocaleString()
                                : "Never"}
                            </span>
                            <span>
                              Next:{" "}
                              {automation.nextRun
                                ? new Date(automation.nextRun).toLocaleString()
                                : "Not scheduled"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={automation.successRate}
                                className="h-2"
                                variant={
                                  automation.successRate > 90
                                    ? "success"
                                    : automation.successRate > 70
                                      ? "warning"
                                      : "destructive"
                                }
                              />
                              <span className="text-xs">
                                {automation.successRate}%
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              Success rate
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${getRiskLevelColor(automation.riskLevel)}`}
                            ></div>
                            <span className="capitalize">
                              {automation.riskLevel}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {automation.mcpEnabled ? (
                            <div className="flex flex-col">
                              <Badge variant="default" className="mb-1">
                                <Server size={12} className="mr-1" />
                                Enabled
                              </Badge>
                              {automation.mcpServers.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {getMcpServerNames(automation.mcpServers)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              automation.status === "active"
                                ? "success"
                                : "destructive"
                            }
                          >
                            {automation.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRunNow(automation.id)}
                              disabled={automation.status !== "active"}
                            >
                              <Zap size={14} className="mr-1" />
                              Run Now
                            </Button>
                            <Button
                              variant={
                                automation.status === "active"
                                  ? "destructive"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => handleToggleStatus(automation.id)}
                            >
                              {automation.status === "active" ? (
                                <span className="flex items-center gap-1">
                                  <Trash2 size={14} />
                                  Stop
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Zap size={14} />
                                  Start
                                </span>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEditAutomation(automation.id)
                              }
                            >
                              <Settings size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteAutomation(automation.id)
                              }
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
                Automations are secured with risk management frameworks
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingAutomation(true)}
              >
                <Plus size={14} className="mr-1" />
                Add Automation
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart4 size={18} />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    Overall Success Rate
                  </span>
                  <span className="text-sm font-bold">
                    {(
                      automations.reduce((sum, a) => sum + a.successRate, 0) /
                      automations.length
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    automations.reduce((sum, a) => sum + a.successRate, 0) /
                    automations.length
                  }
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    Active Automations
                  </span>
                  <span className="text-sm font-bold">
                    {automations.filter((a) => a.status === "active").length} /{" "}
                    {automations.length}
                  </span>
                </div>
                <Progress
                  value={
                    (automations.filter((a) => a.status === "active").length /
                      automations.length) *
                    100
                  }
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">MCP Integration</span>
                  <span className="text-sm font-bold">
                    {automations.filter((a) => a.mcpEnabled).length} /{" "}
                    {automations.length}
                  </span>
                </div>
                <Progress
                  value={
                    (automations.filter((a) => a.mcpEnabled).length /
                      automations.length) *
                    100
                  }
                  className="h-2"
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">
                  Risk Distribution
                </h4>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-md p-2 text-center">
                    <div className="flex justify-center mb-1">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-lg font-bold">
                      {automations.filter((a) => a.riskLevel === "low").length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Low Risk
                    </div>
                  </div>
                  <div className="flex-1 bg-muted rounded-md p-2 text-center">
                    <div className="flex justify-center mb-1">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    </div>
                    <div className="text-lg font-bold">
                      {
                        automations.filter((a) => a.riskLevel === "medium")
                          .length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Medium Risk
                    </div>
                  </div>
                  <div className="flex-1 bg-muted rounded-md p-2 text-center">
                    <div className="flex justify-center mb-1">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    </div>
                    <div className="text-lg font-bold">
                      {automations.filter((a) => a.riskLevel === "high").length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      High Risk
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sliders size={18} />
              Risk Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Max Drawdown Limit
                  </span>
                  <Badge variant="outline">5%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Loss Limit</span>
                  <Badge variant="outline">2%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Position Size Limit
                  </span>
                  <Badge variant="outline">10%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Auto-Shutdown Threshold
                  </span>
                  <Badge variant="outline">3 consecutive losses</Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Risk Controls</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Emergency Stop</span>
                    <Button variant="destructive" size="sm">
                      Stop All
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Level Override</span>
                    <select className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="normal">Normal</option>
                      <option value="conservative">Conservative</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>
              </div>

              <Alert variant="warning" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Risk Warning</AlertTitle>
                <AlertDescription className="text-xs">
                  Automated trading carries inherent risks. Past performance is
                  not indicative of future results.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server size={18} />
              MCP Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Connected MCP Servers
                </h4>
                <div className="space-y-2">
                  {mcpServers.map((server) => (
                    <div
                      key={server.id}
                      className="flex items-center justify-between bg-muted p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        {server.type === "server" ? (
                          <Server size={14} />
                        ) : (
                          <Laptop size={14} />
                        )}
                        <span className="text-sm font-medium">
                          {server.name}
                        </span>
                      </div>
                      <Badge
                        variant={
                          server.status === "active" ? "success" : "destructive"
                        }
                        className="text-xs"
                      >
                        {server.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">MCP Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "market_data",
                    "technical_analysis",
                    "sentiment_analysis",
                    "order_execution",
                    "portfolio_management",
                    "risk_analysis",
                  ].map((capability) => (
                    <Badge key={capability} variant="outline">
                      {capability.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">MCP Security</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="text-sm">OAuth 2.0 Authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="text-sm">End-to-end Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="text-sm">Tool Access Control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="text-sm">Audit Logging</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/agents/ai-agents">
                    <Server size={14} className="mr-1" />
                    Manage MCP Connections
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automation Templates</CardTitle>
          <CardDescription>
            Pre-configured automation templates to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Market Open Scanner</CardTitle>
                <CardDescription>
                  Scans for trading opportunities at market open
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Schedule
                    </span>
                    <span className="text-sm">09:30 AM ET (Market Open)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Risk Level
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Medium</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      MCP Integration
                    </span>
                    <Badge variant="default" className="text-xs">
                      <Server size={10} className="mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsAddingAutomation(true);
                    form.reset({
                      name: "Market Open Scanner",
                      description:
                        "Scans for trading opportunities at market open",
                      schedule: "09:30 AM ET (Market Open)",
                      riskLevel: "medium",
                      mcpEnabled: true,
                      mcpServers: ["1", "2"],
                    });
                  }}
                >
                  <Plus size={14} className="mr-1" />
                  Use Template
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Daily Portfolio Rebalancer
                </CardTitle>
                <CardDescription>
                  Automatically rebalances portfolio based on target allocations
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Schedule
                    </span>
                    <span className="text-sm">04:00 PM ET (Market Close)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Risk Level
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Low</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      MCP Integration
                    </span>
                    <Badge variant="default" className="text-xs">
                      <Server size={10} className="mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsAddingAutomation(true);
                    form.reset({
                      name: "Daily Portfolio Rebalancer",
                      description:
                        "Automatically rebalances portfolio based on target allocations",
                      schedule: "04:00 PM ET (Market Close)",
                      riskLevel: "low",
                      mcpEnabled: true,
                      mcpServers: ["2"],
                    });
                  }}
                >
                  <Plus size={14} className="mr-1" />
                  Use Template
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Technical Breakout Scanner
                </CardTitle>
                <CardDescription>
                  Identifies stocks breaking out of technical patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Schedule
                    </span>
                    <span className="text-sm">
                      Every 30 minutes (Market Hours)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Risk Level
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Medium</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      MCP Integration
                    </span>
                    <Badge variant="default" className="text-xs">
                      <Server size={10} className="mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsAddingAutomation(true);
                    form.reset({
                      name: "Technical Breakout Scanner",
                      description:
                        "Identifies stocks breaking out of technical patterns",
                      schedule: "Every 30 minutes (Market Hours)",
                      riskLevel: "medium",
                      mcpEnabled: true,
                      mcpServers: ["1"],
                    });
                  }}
                >
                  <Plus size={14} className="mr-1" />
                  Use Template
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Earnings Announcement Trader
                </CardTitle>
                <CardDescription>
                  Executes trades based on earnings announcements
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Schedule
                    </span>
                    <span className="text-sm">Event-based</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Risk Level
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="text-sm">High</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      MCP Integration
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Disabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsAddingAutomation(true);
                    form.reset({
                      name: "Earnings Announcement Trader",
                      description:
                        "Executes trades based on earnings announcements",
                      schedule: "Event-based",
                      riskLevel: "high",
                      mcpEnabled: false,
                      mcpServers: [],
                    });
                  }}
                >
                  <Plus size={14} className="mr-1" />
                  Use Template
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Sentiment Analysis Trader
                </CardTitle>
                <CardDescription>
                  Trades based on news and social media sentiment
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Schedule
                    </span>
                    <span className="text-sm">Hourly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Risk Level
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Medium</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      MCP Integration
                    </span>
                    <Badge variant="default" className="text-xs">
                      <Server size={10} className="mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsAddingAutomation(true);
                    form.reset({
                      name: "Sentiment Analysis Trader",
                      description:
                        "Trades based on news and social media sentiment",
                      schedule: "Hourly",
                      riskLevel: "medium",
                      mcpEnabled: true,
                      mcpServers: ["1", "3"],
                    });
                  }}
                >
                  <Plus size={14} className="mr-1" />
                  Use Template
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Volatility Arbitrage</CardTitle>
                <CardDescription>
                  Exploits differences between implied and realized volatility
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Schedule
                    </span>
                    <span className="text-sm">Daily (10:00 AM ET)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Risk Level
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="text-sm">High</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      MCP Integration
                    </span>
                    <Badge variant="default" className="text-xs">
                      <Server size={10} className="mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsAddingAutomation(true);
                    form.reset({
                      name: "Volatility Arbitrage",
                      description:
                        "Exploits differences between implied and realized volatility",
                      schedule: "Daily (10:00 AM ET)",
                      riskLevel: "high",
                      mcpEnabled: true,
                      mcpServers: ["1", "2"],
                    });
                  }}
                >
                  <Plus size={14} className="mr-1" />
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automation Best Practices</CardTitle>
          <CardDescription>
            Recommendations for effective automated trading with MCP integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Users size={16} />
                General Best Practices
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-green-600">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-sm">
                    <strong>Start small:</strong> Begin with low-risk
                    automations and gradually increase complexity.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-green-600">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-sm">
                    <strong>Backtest thoroughly:</strong> Test all strategies
                    against historical data before deploying.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-green-600">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-sm">
                    <strong>Monitor regularly:</strong> Check automation
                    performance daily and adjust as needed.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-green-600">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-sm">
                    <strong>Implement circuit breakers:</strong> Set up
                    automatic shutdown triggers for unexpected market
                    conditions.
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Server size={16} />
                MCP Integration Best Practices
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-green-600">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-sm">
                    <strong>Validate MCP tools:</strong> Test all MCP tools
                    thoroughly before integrating with automations.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-green-600">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-sm">
                    <strong>Implement fallbacks:</strong> Create fallback
                    mechanisms for when MCP servers are unavailable.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-green-600">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-sm">
                    <strong>Monitor latency:</strong> Keep track of MCP response
                    times and optimize for performance.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-green-600">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-sm">
                    <strong>Secure connections:</strong> Use OAuth and API keys
                    with proper access controls for all MCP connections.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentAutomation;
