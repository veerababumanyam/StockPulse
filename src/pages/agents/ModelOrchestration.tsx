import React, { useState, useEffect } from "react";
import { useOrchestration, Model } from "../../contexts/OrchestrationContext";
import { useTelemetry } from "../../contexts/TelemetryContext";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  AlertCircle,
  ArrowRight,
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
  BarChart,
  Layers,
  GitMerge,
  Cpu,
  Shuffle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { useToast } from "../../hooks/useToast";
import { Progress } from "../../components/ui/progress";

const ModelOrchestration: React.FC = () => {
  const { toast } = useToast();
  const orchestration = useOrchestration();
  const telemetry = useTelemetry();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<string | null>(
    null,
  );
  const [editingFallbackChain, setEditingFallbackChain] = useState<string[]>(
    [],
  );
  const [showFallbackDialog, setShowFallbackDialog] = useState(false);

  // Mock data for capabilities
  const [capabilities, setCapabilities] = useState([
    {
      id: "market_analysis",
      name: "Market Analysis",
      description: "Analyze market trends and patterns",
      activeModel: null as string | null,
      fallbackChain: [] as string[],
    },
    {
      id: "sentiment_analysis",
      name: "Sentiment Analysis",
      description: "Analyze sentiment from news and social media",
      activeModel: null as string | null,
      fallbackChain: [] as string[],
    },
    {
      id: "portfolio_optimization",
      name: "Portfolio Optimization",
      description: "Optimize portfolio allocation",
      activeModel: null as string | null,
      fallbackChain: [] as string[],
    },
    {
      id: "risk_assessment",
      name: "Risk Assessment",
      description: "Assess investment risks",
      activeModel: null as string | null,
      fallbackChain: [] as string[],
    },
    {
      id: "trading_signals",
      name: "Trading Signals",
      description: "Generate trading signals",
      activeModel: null as string | null,
      fallbackChain: [] as string[],
    },
  ]);

  // Mock data for models
  const [availableModels, setAvailableModels] = useState<Model[]>([
    {
      id: "claude-3-opus",
      name: "Claude 3 Opus",
      provider: "anthropic",
      type: "text",
      capabilities: [
        "market_analysis",
        "sentiment_analysis",
        "portfolio_optimization",
        "risk_assessment",
        "trading_signals",
      ],
      contextWindow: 200000,
      maxTokens: 4096,
      status: "available",
      latency: 1200,
      costPerToken: 0.015,
      reliability: 0.99,
      priority: 90,
    },
    {
      id: "claude-3-sonnet",
      name: "Claude 3 Sonnet",
      provider: "anthropic",
      type: "text",
      capabilities: [
        "market_analysis",
        "sentiment_analysis",
        "portfolio_optimization",
        "risk_assessment",
        "trading_signals",
      ],
      contextWindow: 100000,
      maxTokens: 4096,
      status: "available",
      latency: 800,
      costPerToken: 0.008,
      reliability: 0.98,
      priority: 80,
    },
    {
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "openai",
      type: "multimodal",
      capabilities: [
        "market_analysis",
        "sentiment_analysis",
        "portfolio_optimization",
        "risk_assessment",
        "trading_signals",
      ],
      contextWindow: 128000,
      maxTokens: 4096,
      status: "available",
      latency: 1000,
      costPerToken: 0.01,
      reliability: 0.97,
      priority: 85,
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      provider: "google",
      type: "multimodal",
      capabilities: [
        "market_analysis",
        "sentiment_analysis",
        "portfolio_optimization",
        "risk_assessment",
      ],
      contextWindow: 32000,
      maxTokens: 2048,
      status: "available",
      latency: 700,
      costPerToken: 0.005,
      reliability: 0.96,
      priority: 75,
    },
    {
      id: "llama-3-70b",
      name: "Llama 3 70B",
      provider: "meta",
      type: "text",
      capabilities: [
        "market_analysis",
        "sentiment_analysis",
        "portfolio_optimization",
      ],
      contextWindow: 8000,
      maxTokens: 2048,
      status: "available",
      latency: 500,
      costPerToken: 0.001,
      reliability: 0.94,
      priority: 70,
    },
    {
      id: "local-finance-model",
      name: "Local Finance Model",
      provider: "stockpulse",
      type: "text",
      capabilities: ["market_analysis", "trading_signals"],
      contextWindow: 4000,
      maxTokens: 1024,
      status: "available",
      latency: 300,
      costPerToken: 0.0001,
      reliability: 0.92,
      priority: 60,
    },
  ]);

  // Initialize orchestration with mock data
  useEffect(() => {
    orchestration.setModels(availableModels);

    // Set default active models for each capability
    capabilities.forEach((capability) => {
      const bestModel = availableModels
        .filter((model) => model.capabilities.includes(capability.id))
        .sort((a, b) => b.priority - a.priority)[0];

      if (bestModel) {
        orchestration.setActiveModel(capability.id, bestModel.id);
        setCapabilities((prev) =>
          prev.map((cap) =>
            cap.id === capability.id
              ? { ...cap, activeModel: bestModel.id }
              : cap,
          ),
        );
      }
    });

    // Set default fallback chains
    capabilities.forEach((capability) => {
      const fallbackModels = availableModels
        .filter(
          (model) =>
            model.capabilities.includes(capability.id) &&
            model.id !== capability.activeModel,
        )
        .sort((a, b) => b.priority - a.priority)
        .map((model) => model.id);

      orchestration.setFallbackChain(capability.id, fallbackModels);
      setCapabilities((prev) =>
        prev.map((cap) =>
          cap.id === capability.id
            ? { ...cap, fallbackChain: fallbackModels }
            : cap,
        ),
      );
    });
  }, []);

  // Get model by ID
  const getModelById = (modelId: string): Model | undefined => {
    return availableModels.find((model) => model.id === modelId);
  };

  // Set active model for capability
  const setActiveModelForCapability = (
    capabilityId: string,
    modelId: string,
  ) => {
    orchestration.setActiveModel(capabilityId, modelId);

    setCapabilities((prev) =>
      prev.map((cap) =>
        cap.id === capabilityId ? { ...cap, activeModel: modelId } : cap,
      ),
    );

    toast({
      title: "Active Model Updated",
      description: `Primary model for ${capabilities.find((c) => c.id === capabilityId)?.name} has been updated.`,
      variant: "success",
    });
  };

  // Update fallback chain for capability
  const updateFallbackChain = (capabilityId: string, modelIds: string[]) => {
    orchestration.setFallbackChain(capabilityId, modelIds);

    setCapabilities((prev) =>
      prev.map((cap) =>
        cap.id === capabilityId ? { ...cap, fallbackChain: modelIds } : cap,
      ),
    );

    toast({
      title: "Fallback Chain Updated",
      description: `Fallback chain for ${capabilities.find((c) => c.id === capabilityId)?.name} has been updated.`,
      variant: "success",
    });

    setShowFallbackDialog(false);
  };

  // Open fallback chain dialog
  const openFallbackDialog = (capabilityId: string) => {
    const capability = capabilities.find((c) => c.id === capabilityId);
    if (!capability) return;

    setSelectedCapability(capabilityId);
    setEditingFallbackChain([...capability.fallbackChain]);
    setShowFallbackDialog(true);
  };

  // Move model up in fallback chain
  const moveModelUp = (modelId: string) => {
    const index = editingFallbackChain.indexOf(modelId);
    if (index <= 0) return;

    const newChain = [...editingFallbackChain];
    [newChain[index - 1], newChain[index]] = [
      newChain[index],
      newChain[index - 1],
    ];
    setEditingFallbackChain(newChain);
  };

  // Move model down in fallback chain
  const moveModelDown = (modelId: string) => {
    const index = editingFallbackChain.indexOf(modelId);
    if (index === -1 || index === editingFallbackChain.length - 1) return;

    const newChain = [...editingFallbackChain];
    [newChain[index], newChain[index + 1]] = [
      newChain[index + 1],
      newChain[index],
    ];
    setEditingFallbackChain(newChain);
  };

  // Remove model from fallback chain
  const removeFromFallbackChain = (modelId: string) => {
    setEditingFallbackChain((prev) => prev.filter((id) => id !== modelId));
  };

  // Add model to fallback chain
  const addToFallbackChain = (modelId: string) => {
    if (editingFallbackChain.includes(modelId)) return;
    setEditingFallbackChain((prev) => [...prev, modelId]);
  };

  // Get available models for fallback chain
  const getAvailableModelsForFallback = (capabilityId: string): Model[] => {
    const capability = capabilities.find((c) => c.id === capabilityId);
    if (!capability) return [];

    return availableModels.filter(
      (model) =>
        model.capabilities.includes(capabilityId) &&
        model.id !== capability.activeModel &&
        !editingFallbackChain.includes(model.id),
    );
  };

  // Test orchestration with fallback
  const testOrchestration = async (capabilityId: string) => {
    const capability = capabilities.find((c) => c.id === capabilityId);
    if (!capability) return;

    setIsLoading(true);

    try {
      // Simulate a span for telemetry
      const span = telemetry.startSpan("test.orchestration", {
        "test.orchestration.capability": capabilityId,
      });

      // Simulate an operation with the orchestration system
      const result = await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Randomly succeed or fail to test fallback
          const shouldFail = Math.random() > 0.7;

          if (shouldFail) {
            reject(new Error("Simulated primary model failure"));
          } else {
            resolve({
              modelId: capability.activeModel,
              result: "Successful operation with primary model",
            });
          }
        }, 1500);
      }).catch(async (error) => {
        // Simulate fallback to secondary model
        telemetry.addEvent(span, "test.orchestration.fallback", {
          "test.orchestration.error": error.message,
        });

        return await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Fallback model has higher success rate
            const shouldFail = Math.random() > 0.9;

            if (shouldFail && capability.fallbackChain.length > 1) {
              reject(new Error("Simulated secondary model failure"));
            } else {
              resolve({
                modelId: capability.fallbackChain[0],
                result: "Successful operation with fallback model",
              });
            }
          }, 1000);
        }).catch(async (error) => {
          // Simulate fallback to tertiary model if available
          if (capability.fallbackChain.length > 1) {
            telemetry.addEvent(span, "test.orchestration.second_fallback", {
              "test.orchestration.error": error.message,
            });

            return await new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  modelId: capability.fallbackChain[1],
                  result: "Successful operation with second fallback model",
                });
              }, 800);
            });
          } else {
            throw error;
          }
        });
      });

      telemetry.endSpan(span);

      // Show success message
      const model = getModelById((result as any).modelId);
      toast({
        title: "Orchestration Test Successful",
        description: `Operation completed using ${model?.name} (${model?.provider}).`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Orchestration Test Failed",
        description: `All models in the fallback chain failed: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get provider badge
  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case "anthropic":
        return <Badge className="bg-purple-500">Anthropic</Badge>;
      case "openai":
        return <Badge className="bg-green-500">OpenAI</Badge>;
      case "google":
        return <Badge className="bg-blue-500">Google</Badge>;
      case "meta":
        return <Badge className="bg-blue-600">Meta</Badge>;
      case "stockpulse":
        return <Badge className="bg-orange-500">StockPulse</Badge>;
      default:
        return <Badge>{provider}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Model Orchestration
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage AI model coordination and fallback chains
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              orchestration.setOrchestrationEnabled(
                !orchestration.isOrchestrationEnabled,
              );

              toast({
                title: orchestration.isOrchestrationEnabled
                  ? "Orchestration Disabled"
                  : "Orchestration Enabled",
                description: orchestration.isOrchestrationEnabled
                  ? "Model orchestration has been disabled."
                  : "Model orchestration has been enabled.",
                variant: "default",
              });
            }}
          >
            <Cpu size={16} />
            {orchestration.isOrchestrationEnabled
              ? "Disable Orchestration"
              : "Enable Orchestration"}
          </Button>

          <Button className="gap-2">
            <Settings size={16} />
            Orchestration Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers size={18} />
              Active Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{availableModels.length}</div>
            <p className="text-sm text-muted-foreground">
              AI models available for orchestration
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {availableModels.filter((m) => m.status === "available").length}{" "}
              models ready
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <GitMerge size={18} />
              Fallback Chains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{capabilities.length}</div>
            <p className="text-sm text-muted-foreground">
              Configured capability chains
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {orchestration.isOrchestrationEnabled ? (
                <Badge variant="success" className="text-xs">
                  Orchestration Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Orchestration Disabled
                </Badge>
              )}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart size={18} />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98.5%</div>
            <p className="text-sm text-muted-foreground">
              Overall success rate
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              1.5% fallback rate
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capability Orchestration</CardTitle>
          <CardDescription>
            Configure primary models and fallback chains for each capability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Primary Model</TableHead>
                <TableHead>Fallback Chain</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capabilities.map((capability) => {
                const activeModel = getModelById(capability.activeModel || "");
                return (
                  <TableRow key={capability.id}>
                    <TableCell>
                      <div className="font-medium">{capability.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {capability.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activeModel ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {activeModel.name}
                            </span>
                            {getProviderBadge(activeModel.provider)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Latency: {activeModel.latency}ms | Reliability:{" "}
                            {(activeModel.reliability * 100).toFixed(1)}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          None selected
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {capability.fallbackChain.slice(0, 2).map((modelId) => {
                          const model = getModelById(modelId);
                          return model ? (
                            <Badge
                              key={modelId}
                              variant="outline"
                              className="text-xs"
                            >
                              {model.name}
                            </Badge>
                          ) : null;
                        })}
                        {capability.fallbackChain.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{capability.fallbackChain.length - 2} more
                          </Badge>
                        )}
                        {capability.fallbackChain.length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            No fallbacks configured
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={95 + Math.random() * 5}
                          className="h-2 w-20"
                        />
                        <span className="text-sm">
                          {(95 + Math.random() * 5).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFallbackDialog(capability.id)}
                        >
                          <GitMerge size={14} className="mr-1" />
                          Fallback Chain
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testOrchestration(capability.id)}
                          disabled={isLoading}
                        >
                          <Zap size={14} className="mr-1" />
                          Test
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Models</CardTitle>
          <CardDescription>
            AI models available for orchestration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableModels.map((model) => (
              <div key={model.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{model.name}</h3>
                      {getProviderBadge(model.provider)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Type: {model.type} | Context:{" "}
                      {model.contextWindow.toLocaleString()} tokens | Max
                      Output: {model.maxTokens.toLocaleString()} tokens
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {model.capabilities.map((cap) => {
                        const capability = capabilities.find(
                          (c) => c.id === cap,
                        );
                        return capability ? (
                          <Badge
                            key={cap}
                            variant="outline"
                            className="text-xs"
                          >
                            {capability.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <div className="font-medium">Latency</div>
                        <div>{model.latency}ms</div>
                      </div>
                      <div>
                        <div className="font-medium">Cost</div>
                        <div>${model.costPerToken.toFixed(4)}/token</div>
                      </div>
                      <div>
                        <div className="font-medium">Reliability</div>
                        <div>{(model.reliability * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Find capabilities this model can support
                        const supportedCapabilities = capabilities.filter(
                          (cap) => model.capabilities.includes(cap.id),
                        );

                        if (supportedCapabilities.length > 0) {
                          // Set as primary for the first capability
                          setActiveModelForCapability(
                            supportedCapabilities[0].id,
                            model.id,
                          );
                        }
                      }}
                    >
                      Set as Primary
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orchestration Metrics</CardTitle>
          <CardDescription>
            Performance metrics for model orchestration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={18} />
                <h3 className="font-semibold">Success Rate</h3>
              </div>
              <div className="text-3xl font-bold mb-2">98.5%</div>
              <p className="text-xs text-muted-foreground">
                Overall success rate across all capabilities
              </p>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Primary Model Success</span>
                  <span>97.0%</span>
                </div>
                <Progress value={97} className="h-1 mb-2" />

                <div className="flex justify-between text-xs mb-1">
                  <span>Fallback Success</span>
                  <span>1.5%</span>
                </div>
                <Progress value={1.5} className="h-1 mb-2" />

                <div className="flex justify-between text-xs mb-1">
                  <span>Total Failure</span>
                  <span>1.5%</span>
                </div>
                <Progress
                  value={1.5}
                  className="h-1 bg-gray-200"
                  indicatorClassName="bg-red-500"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} />
                <h3 className="font-semibold">Performance</h3>
              </div>
              <div className="text-3xl font-bold mb-2">842ms</div>
              <p className="text-xs text-muted-foreground">
                Average response time across all models
              </p>
              <div className="mt-4 space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Claude 3 Opus</span>
                    <span>1200ms</span>
                  </div>
                  <Progress value={60} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>GPT-4o</span>
                    <span>1000ms</span>
                  </div>
                  <Progress value={50} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Claude 3 Sonnet</span>
                    <span>800ms</span>
                  </div>
                  <Progress value={40} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Local Finance Model</span>
                    <span>300ms</span>
                  </div>
                  <Progress value={15} className="h-1" />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shuffle size={18} />
                <h3 className="font-semibold">Fallback Distribution</h3>
              </div>
              <div className="text-3xl font-bold mb-2">1.5%</div>
              <p className="text-xs text-muted-foreground">
                Percentage of requests using fallback models
              </p>
              <div className="mt-4 space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Market Analysis</span>
                    <span>2.1%</span>
                  </div>
                  <Progress value={2.1} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Sentiment Analysis</span>
                    <span>1.8%</span>
                  </div>
                  <Progress value={1.8} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Portfolio Optimization</span>
                    <span>1.2%</span>
                  </div>
                  <Progress value={1.2} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Risk Assessment</span>
                    <span>0.9%</span>
                  </div>
                  <Progress value={0.9} className="h-1" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fallback Chain Dialog */}
      <Dialog open={showFallbackDialog} onOpenChange={setShowFallbackDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Fallback Chain</DialogTitle>
            <DialogDescription>
              {selectedCapability &&
                `Set up the fallback chain for ${capabilities.find((c) => c.id === selectedCapability)?.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Current Fallback Chain</h3>
              {editingFallbackChain.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No fallback models configured
                </p>
              ) : (
                <div className="space-y-2">
                  {editingFallbackChain.map((modelId, index) => {
                    const model = getModelById(modelId);
                    return model ? (
                      <div
                        key={modelId}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {index + 1}.
                          </span>
                          <span className="font-medium">{model.name}</span>
                          {getProviderBadge(model.provider)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveModelUp(modelId)}
                            disabled={index === 0}
                          >
                            <ArrowRight className="rotate-90 h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveModelDown(modelId)}
                            disabled={index === editingFallbackChain.length - 1}
                          >
                            <ArrowRight className="-rotate-90 h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromFallbackChain(modelId)}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {selectedCapability && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Available Models</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getAvailableModelsForFallback(selectedCapability).map(
                    (model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between border p-2 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          {getProviderBadge(model.provider)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToFallbackChain(model.id)}
                        >
                          Add
                        </Button>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFallbackDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedCapability &&
                updateFallbackChain(selectedCapability, editingFallbackChain)
              }
            >
              Save Fallback Chain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelOrchestration;
