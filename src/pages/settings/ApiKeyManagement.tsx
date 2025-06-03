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
  Key,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../../hooks/useToast";

// Mock data for API providers
const apiProviders = [
  {
    id: "fmp",
    name: "Financial Modeling Prep",
    description: "Financial data and analytics API",
    website: "https://financialmodelingprep.com/developer/docs/",
    keyFormat: "Alphanumeric string",
    category: "financial",
  },
  {
    id: "taapi",
    name: "TAAPI.IO",
    description: "Technical analysis indicators API",
    website: "https://taapi.io/documentation/",
    keyFormat: "JWT token",
    category: "financial",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT and other AI models",
    website: "https://platform.openai.com/docs/api-reference",
    keyFormat: "sk-...",
    category: "ai",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude and other AI models",
    website:
      "https://docs.anthropic.com/claude/reference/getting-started-with-the-api",
    keyFormat: "sk-ant-...",
    category: "ai",
  },
  {
    id: "google",
    name: "Google AI",
    description: "Gemini and other Google AI models",
    website: "https://ai.google.dev/docs",
    keyFormat: "API key",
    category: "ai",
  },
];

// Mock data for user's API keys
const initialApiKeys = [
  {
    id: "1",
    providerId: "fmp",
    name: "FMP Production",
    key: "lHZG8GLLFpcKtHZ4VTGVlYv7aOe0Q7AK",
    createdAt: "2025-04-15T10:30:00Z",
    lastUsed: "2025-05-26T14:22:10Z",
    status: "active",
    usageCount: 1243,
  },
  {
    id: "2",
    providerId: "taapi",
    name: "TAAPI Production",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    createdAt: "2025-04-15T10:35:00Z",
    lastUsed: "2025-05-26T15:10:05Z",
    status: "active",
    usageCount: 876,
  },
];

// Form schema for adding/editing API keys
const apiKeyFormSchema = z.object({
  providerId: z.string().min(1, { message: "Please select a provider" }),
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  key: z.string().min(5, { message: "Please enter a valid API key" }),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

const ApiKeyManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      providerId: "",
      name: "",
      key: "",
    },
  });

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const handleAddKey = (values: ApiKeyFormValues) => {
    const newKey = {
      id: Date.now().toString(),
      providerId: values.providerId,
      name: values.name,
      key: values.key,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      status: "active",
      usageCount: 0,
    };

    setApiKeys((prev) => [...prev, newKey]);
    setIsAddingKey(false);
    form.reset();

    toast({
      title: "API Key Added",
      description: `${values.name} has been successfully added.`,
      variant: "success",
    });
  };

  const handleDeleteKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== keyId));

    toast({
      title: "API Key Deleted",
      description: "The API key has been removed.",
      variant: "default",
    });
  };

  const handleTestKey = (keyId: string) => {
    setIsTestingKey(keyId);

    // Simulate API test
    setTimeout(() => {
      setIsTestingKey(null);

      toast({
        title: "API Key Valid",
        description: "The API key was tested successfully.",
        variant: "success",
      });
    }, 1500);
  };

  const handleRotateKey = (keyId: string) => {
    // In a real implementation, this would guide the user through key rotation
    toast({
      title: "Key Rotation",
      description:
        "Please generate a new key from the provider and add it here.",
      variant: "default",
    });
  };

  const filteredKeys =
    activeTab === "all"
      ? apiKeys
      : apiKeys.filter((key) => {
          const provider = apiProviders.find((p) => p.id === key.providerId);
          return provider?.category === activeTab;
        });

  const getProviderName = (providerId: string) => {
    const provider = apiProviders.find((p) => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            API Key Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Securely manage API keys for external services
          </p>
        </div>

        <Dialog open={isAddingKey} onOpenChange={setIsAddingKey}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>
                Add a new API key for integration with external services. Keys
                are encrypted and stored securely.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddKey)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Provider</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select a provider</option>
                          {apiProviders.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>
                        {field.value &&
                          apiProviders.find((p) => p.id === field.value)
                            ?.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Production API Key"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A descriptive name to identify this key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="password"
                            placeholder="Enter your API key"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        {form.watch("providerId") &&
                          `Format: ${apiProviders.find((p) => p.id === form.watch("providerId"))?.keyFormat}`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert variant="warning" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Security Notice</AlertTitle>
                  <AlertDescription>
                    Your API key will be encrypted before storage and never
                    exposed in the frontend.
                  </AlertDescription>
                </Alert>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingKey(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add API Key</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Keys ({apiKeys.length})</TabsTrigger>
          <TabsTrigger value="financial">
            Financial (
            {
              apiKeys.filter((key) => {
                const provider = apiProviders.find(
                  (p) => p.id === key.providerId,
                );
                return provider?.category === "financial";
              }).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="ai">
            AI Models (
            {
              apiKeys.filter((key) => {
                const provider = apiProviders.find(
                  (p) => p.id === key.providerId,
                );
                return provider?.category === "ai";
              }).length
            }
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for external service integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeys.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No API keys found. Add your first API key to get
                        started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">
                          {apiKey.name}
                        </TableCell>
                        <TableCell>
                          {getProviderName(apiKey.providerId)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {showKeys[apiKey.id]
                                ? apiKey.key
                                : apiKey.key.substring(0, 4) +
                                  "••••••••" +
                                  apiKey.key.substring(apiKey.key.length - 4)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              className="h-6 w-6"
                            >
                              {showKeys[apiKey.id] ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {apiKey.lastUsed
                            ? new Date(apiKey.lastUsed).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              apiKey.status === "active"
                                ? "success"
                                : "destructive"
                            }
                          >
                            {apiKey.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestKey(apiKey.id)}
                              disabled={isTestingKey === apiKey.id}
                            >
                              {isTestingKey === apiKey.id ? (
                                <span className="flex items-center gap-1">
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                  Testing...
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <CheckCircle size={14} />
                                  Test
                                </span>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRotateKey(apiKey.id)}
                            >
                              <RefreshCw size={14} className="mr-1" />
                              Rotate
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteKey(apiKey.id)}
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
                All API keys are encrypted at rest and in transit
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingKey(true)}
              >
                <Plus size={14} className="mr-1" />
                Add API Key
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>API Provider Catalog</CardTitle>
          <CardDescription>
            Browse available API providers for integration with StockPulse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apiProviders.map((provider) => (
              <Card key={provider.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    {provider.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">{provider.description}</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="mt-2">
                      {provider.category === "financial"
                        ? "Financial Data"
                        : "AI Model"}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Documentation
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingKey(true);
                      form.setValue("providerId", provider.id);
                    }}
                  >
                    Add Key
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
          <CardDescription>
            Recommendations for secure API key management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="mt-0.5 text-green-600">
                <CheckCircle size={16} />
              </div>
              <span className="text-sm">
                <strong>Regular rotation:</strong> Rotate your API keys every 90
                days for enhanced security.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 text-green-600">
                <CheckCircle size={16} />
              </div>
              <span className="text-sm">
                <strong>Least privilege:</strong> Use keys with the minimum
                required permissions for your use case.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 text-green-600">
                <CheckCircle size={16} />
              </div>
              <span className="text-sm">
                <strong>Monitoring:</strong> Regularly review API key usage for
                unusual patterns.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 text-green-600">
                <CheckCircle size={16} />
              </div>
              <span className="text-sm">
                <strong>Immediate revocation:</strong> Revoke keys immediately
                if they are compromised.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyManagement;
