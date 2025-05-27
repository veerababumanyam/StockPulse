import React, { useState } from 'react';
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
  Brain, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Settings, 
  Star, 
  Zap, 
  RefreshCw,
  ArrowRight,
  Sparkles,
  Thermometer
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../../hooks/useToast';
import { Slider } from '../../components/ui/slider';
import { Switch } from '../../components/ui/switch';

// Mock data for LLM providers
const llmProviders = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    description: 'GPT models with strong general capabilities',
    website: 'https://platform.openai.com',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, costPer1kTokens: 0.005 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, costPer1kTokens: 0.01 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextWindow: 16000, costPer1kTokens: 0.0015 }
    ]
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    description: 'Claude models with strong reasoning and safety',
    website: 'https://console.anthropic.com',
    models: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', contextWindow: 200000, costPer1kTokens: 0.015 },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', contextWindow: 180000, costPer1kTokens: 0.003 },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', contextWindow: 150000, costPer1kTokens: 0.00025 }
    ]
  },
  { 
    id: 'google', 
    name: 'Google AI', 
    description: 'Gemini models with strong multimodal capabilities',
    website: 'https://ai.google.dev',
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', contextWindow: 32000, costPer1kTokens: 0.0025 },
      { id: 'gemini-ultra', name: 'Gemini Ultra', contextWindow: 128000, costPer1kTokens: 0.008 }
    ]
  },
  { 
    id: 'grok', 
    name: 'Grok', 
    description: 'Grok models with real-time knowledge',
    website: 'https://grok.x.ai',
    models: [
      { id: 'grok-1', name: 'Grok-1', contextWindow: 8000, costPer1kTokens: 0.002 },
      { id: 'grok-2', name: 'Grok-2', contextWindow: 32000, costPer1kTokens: 0.006 }
    ]
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    description: 'Models with strong search and citation capabilities',
    website: 'https://perplexity.ai',
    models: [
      { id: 'perplexity-online', name: 'Perplexity Online', contextWindow: 16000, costPer1kTokens: 0.004 },
      { id: 'perplexity-pro', name: 'Perplexity Pro', contextWindow: 32000, costPer1kTokens: 0.008 }
    ]
  },
  { 
    id: 'deepseek', 
    name: 'Deepseek', 
    description: 'Models specialized in code generation',
    website: 'https://deepseek.ai',
    models: [
      { id: 'deepseek-coder', name: 'Deepseek Coder', contextWindow: 32000, costPer1kTokens: 0.002 },
      { id: 'deepseek-chat', name: 'Deepseek Chat', contextWindow: 16000, costPer1kTokens: 0.001 }
    ]
  },
  { 
    id: 'ollama', 
    name: 'Ollama', 
    description: 'Local open-source models',
    website: 'https://ollama.ai',
    models: [
      { id: 'llama3', name: 'Llama 3', contextWindow: 8000, costPer1kTokens: 0 },
      { id: 'mistral', name: 'Mistral', contextWindow: 8000, costPer1kTokens: 0 }
    ]
  },
  { 
    id: 'llmstudio', 
    name: 'LLM Studio', 
    description: 'Custom fine-tuned models',
    website: 'https://llmstudio.ai',
    models: [
      { id: 'custom-finance', name: 'Finance Specialist', contextWindow: 16000, costPer1kTokens: 0.005 }
    ]
  }
];

// Mock data for configured models
const initialConfiguredModels = [
  {
    id: '1',
    providerId: 'openai',
    modelId: 'gpt-4o',
    name: 'GPT-4o (Default)',
    isDefault: true,
    temperature: 0.7,
    maxTokens: 4000,
    isActive: true,
    createdAt: '2025-04-10T10:30:00Z',
    lastUsed: '2025-05-26T15:22:10Z',
    usageCount: 2543,
    costToDate: 127.15,
    fallbackModels: ['2', '3']
  },
  {
    id: '2',
    providerId: 'anthropic',
    modelId: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    isDefault: false,
    temperature: 0.5,
    maxTokens: 8000,
    isActive: true,
    createdAt: '2025-04-10T10:35:00Z',
    lastUsed: '2025-05-26T14:10:05Z',
    usageCount: 1876,
    costToDate: 56.28,
    fallbackModels: ['3']
  },
  {
    id: '3',
    providerId: 'google',
    modelId: 'gemini-pro',
    name: 'Gemini Pro (Fallback)',
    isDefault: false,
    temperature: 0.3,
    maxTokens: 2000,
    isActive: true,
    createdAt: '2025-04-10T10:40:00Z',
    lastUsed: '2025-05-25T09:15:30Z',
    usageCount: 342,
    costToDate: 8.55,
    fallbackModels: []
  }
];

// Form schema for adding/editing LLM models
const llmModelFormSchema = z.object({
  providerId: z.string().min(1, { message: 'Please select a provider' }),
  modelId: z.string().min(1, { message: 'Please select a model' }),
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(100).max(200000),
  isDefault: z.boolean().optional(),
  fallbackModels: z.array(z.string()).optional(),
});

type LlmModelFormValues = z.infer<typeof llmModelFormSchema>;

const LlmManagement: React.FC = () => {
  const [configuredModels, setConfiguredModels] = useState(initialConfiguredModels);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [isEditingModel, setIsEditingModel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('');
  const { toast } = useToast();

  const form = useForm<LlmModelFormValues>({
    resolver: zodResolver(llmModelFormSchema),
    defaultValues: {
      providerId: '',
      modelId: '',
      name: '',
      temperature: 0.7,
      maxTokens: 2000,
      isDefault: false,
      fallbackModels: [],
    },
  });

  const handleAddModel = (values: LlmModelFormValues) => {
    const provider = llmProviders.find(p => p.id === values.providerId);
    const model = provider?.models.find(m => m.id === values.modelId);
    
    if (!provider || !model) return;
    
    const newModel = {
      id: Date.now().toString(),
      providerId: values.providerId,
      modelId: values.modelId,
      name: values.name,
      isDefault: values.isDefault || false,
      temperature: values.temperature,
      maxTokens: values.maxTokens,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0,
      costToDate: 0,
      fallbackModels: values.fallbackModels || []
    };
    
    // If this model is set as default, update other models
    let updatedModels = [...configuredModels];
    if (newModel.isDefault) {
      updatedModels = updatedModels.map(model => ({
        ...model,
        isDefault: false
      }));
    }
    
    setConfiguredModels([...updatedModels, newModel]);
    setIsAddingModel(false);
    form.reset();
    
    toast({
      title: "Model Added",
      description: `${values.name} has been successfully added.`,
      variant: "success",
    });
  };

  const handleEditModel = (modelId: string) => {
    const model = configuredModels.find(m => m.id === modelId);
    if (!model) return;
    
    form.reset({
      providerId: model.providerId,
      modelId: model.modelId,
      name: model.name,
      temperature: model.temperature,
      maxTokens: model.maxTokens,
      isDefault: model.isDefault,
      fallbackModels: model.fallbackModels,
    });
    
    setIsEditingModel(modelId);
  };

  const handleUpdateModel = (values: LlmModelFormValues) => {
    if (!isEditingModel) return;
    
    // If this model is set as default, update other models
    let updatedModels = configuredModels.map(model => {
      if (model.id === isEditingModel) {
        return {
          ...model,
          providerId: values.providerId,
          modelId: values.modelId,
          name: values.name,
          isDefault: values.isDefault || false,
          temperature: values.temperature,
          maxTokens: values.maxTokens,
          fallbackModels: values.fallbackModels || []
        };
      }
      
      // If current model is set as default, update other models
      if (values.isDefault) {
        return {
          ...model,
          isDefault: false
        };
      }
      
      return model;
    });
    
    setConfiguredModels(updatedModels);
    setIsEditingModel(null);
    form.reset();
    
    toast({
      title: "Model Updated",
      description: `${values.name} has been successfully updated.`,
      variant: "success",
    });
  };

  const handleDeleteModel = (modelId: string) => {
    setConfiguredModels(prev => prev.filter(model => model.id !== modelId));
    
    toast({
      title: "Model Deleted",
      description: "The model configuration has been removed.",
      variant: "default",
    });
  };

  const handleSetDefault = (modelId: string) => {
    const updatedModels = configuredModels.map(model => ({
      ...model,
      isDefault: model.id === modelId
    }));
    
    setConfiguredModels(updatedModels);
    
    toast({
      title: "Default Model Updated",
      description: "The default model has been updated.",
      variant: "success",
    });
  };

  const filteredModels = activeTab === 'all' 
    ? configuredModels 
    : configuredModels.filter(model => model.providerId === activeTab);

  const getProviderName = (providerId: string) => {
    const provider = llmProviders.find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  const getModelName = (providerId: string, modelId: string) => {
    const provider = llmProviders.find(p => p.id === providerId);
    const model = provider?.models.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  const getFallbackModelNames = (fallbackIds: string[]) => {
    return fallbackIds.map(id => {
      const model = configuredModels.find(m => m.id === id);
      return model ? model.name : id;
    }).join(', ');
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LLM Management</h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage multiple language models for your AI agents
          </p>
        </div>
        
        <Dialog open={isAddingModel} onOpenChange={setIsAddingModel}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New LLM Configuration</DialogTitle>
              <DialogDescription>
                Configure a new language model for use in StockPulse.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddModel)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LLM Provider</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedProvider(e.target.value);
                            form.setValue('modelId', '');
                          }}
                        >
                          <option value="">Select a provider</option>
                          {llmProviders.map(provider => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>
                        {field.value && llmProviders.find(p => p.id === field.value)?.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="modelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          disabled={!selectedProvider}
                        >
                          <option value="">Select a model</option>
                          {selectedProvider && llmProviders
                            .find(p => p.id === selectedProvider)
                            ?.models.map(model => (
                              <option key={model.id} value={model.id}>
                                {model.name} ({model.contextWindow.toLocaleString()} tokens)
                              </option>
                            ))}
                        </select>
                      </FormControl>
                      <FormDescription>
                        {selectedProvider && field.value && (
                          <div className="flex items-center gap-2 mt-1">
                            <span>Cost: ${llmProviders
                              .find(p => p.id === selectedProvider)
                              ?.models.find(m => m.id === field.value)
                              ?.costPer1kTokens.toFixed(5)} per 1K tokens</span>
                          </div>
                        )}
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
                      <FormLabel>Configuration Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., GPT-4 for Trading Analysis" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this model configuration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Thermometer size={16} />
                          Temperature <span className="ml-auto">{field.value.toFixed(2)}</span>
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Lower values are more deterministic, higher values more creative
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxTokens"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Output Tokens</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={100} 
                            max={200000} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of tokens in model responses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Star size={16} className="text-yellow-500" />
                          Set as Default Model
                        </FormLabel>
                        <FormDescription>
                          This model will be used as the primary model for all AI operations
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
                
                <FormField
                  control={form.control}
                  name="fallbackModels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fallback Models</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          multiple
                          value={field.value}
                          onChange={(e) => {
                            const options = Array.from(e.target.selectedOptions, option => option.value);
                            field.onChange(options);
                          }}
                        >
                          {configuredModels.map(model => (
                            <option 
                              key={model.id} 
                              value={model.id}
                              disabled={isEditingModel === model.id}
                            >
                              {model.name} ({getProviderName(model.providerId)})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>
                        Models to use if this model fails or is unavailable (hold Ctrl/Cmd to select multiple)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingModel(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditingModel ? 'Update Model' : 'Add Model'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={!!isEditingModel} onOpenChange={(open) => !open && setIsEditingModel(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit LLM Configuration</DialogTitle>
              <DialogDescription>
                Update the configuration for this language model.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateModel)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LLM Provider</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedProvider(e.target.value);
                            form.setValue('modelId', '');
                          }}
                          disabled={true} // Can't change provider when editing
                        >
                          <option value="">Select a provider</option>
                          {llmProviders.map(provider => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>
                        {field.value && llmProviders.find(p => p.id === field.value)?.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="modelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          disabled={true} // Can't change model when editing
                        >
                          <option value="">Select a model</option>
                          {form.watch('providerId') && llmProviders
                            .find(p => p.id === form.watch('providerId'))
                            ?.models.map(model => (
                              <option key={model.id} value={model.id}>
                                {model.name} ({model.contextWindow.toLocaleString()} tokens)
                              </option>
                            ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Configuration Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., GPT-4 for Trading Analysis" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this model configuration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Thermometer size={16} />
                          Temperature <span className="ml-auto">{field.value.toFixed(2)}</span>
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Lower values are more deterministic, higher values more creative
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxTokens"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Output Tokens</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={100} 
                            max={200000} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of tokens in model responses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Star size={16} className="text-yellow-500" />
                          Set as Default Model
                        </FormLabel>
                        <FormDescription>
                          This model will be used as the primary model for all AI operations
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
                
                <FormField
                  control={form.control}
                  name="fallbackModels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fallback Models</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          multiple
                          value={field.value}
                          onChange={(e) => {
                            const options = Array.from(e.target.selectedOptions, option => option.value);
                            field.onChange(options);
                          }}
                        >
                          {configuredModels.map(model => (
                            <option 
                              key={model.id} 
                              value={model.id}
                              disabled={isEditingModel === model.id}
                            >
                              {model.name} ({getProviderName(model.providerId)})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>
                        Models to use if this model fails or is unavailable (hold Ctrl/Cmd to select multiple)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingModel(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Model</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Models ({configuredModels.length})</TabsTrigger>
          {llmProviders.map(provider => (
            <TabsTrigger key={provider.id} value={provider.id}>
              {provider.name} ({configuredModels.filter(m => m.providerId === provider.id).length})
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configured Models</CardTitle>
              <CardDescription>
                Manage your language model configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider / Model</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead>Fallback Chain</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No models configured. Add your first model to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredModels.map(model => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {model.isDefault && <Star size={16} className="text-yellow-500" />}
                          {model.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{getProviderName(model.providerId)}</span>
                            <span className="text-sm text-muted-foreground">
                              {getModelName(model.providerId, model.modelId)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1">
                              <Thermometer size={14} />
                              Temp: {model.temperature.toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Zap size={14} />
                              Max: {model.maxTokens.toLocaleString()} tokens
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {model.fallbackModels.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <ArrowRight size={14} />
                              <span className="text-sm">{getFallbackModelNames(model.fallbackModels)}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">None configured</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{model.usageCount.toLocaleString()} requests</span>
                            <span className="text-sm text-muted-foreground">
                              ${model.costToDate.toFixed(2)} total cost
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={model.isActive ? 'success' : 'destructive'}>
                            {model.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!model.isDefault && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSetDefault(model.id)}
                              >
                                <Star size={14} className="mr-1" />
                                Set Default
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditModel(model.id)}
                            >
                              <Settings size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteModel(model.id)}
                              disabled={model.isDefault}
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
                <Brain className="inline-block mr-1 h-4 w-4" />
                Configure models with different parameters for specific use cases
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAddingModel(true)}>
                <Plus size={14} className="mr-1" />
                Add Model
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>LLM Provider Catalog</CardTitle>
          <CardDescription>
            Browse available LLM providers for integration with StockPulse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {llmProviders.map(provider => (
              <Card key={provider.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {provider.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">{provider.description}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Available models:</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.models.map(model => (
                        <Badge key={model.id} variant="outline" className="text-xs">
                          {model.name}
                        </Badge>
                      ))}
                    </div>
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
                      setIsAddingModel(true);
                      form.setValue('providerId', provider.id);
                      setSelectedProvider(provider.id);
                    }}
                  >
                    Configure
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>LLM Best Practices</CardTitle>
          <CardDescription>
            Recommendations for effective LLM configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="mt-0.5 text-green-600">
                <CheckCircle size={16} />
              </div>
              <span className="text-sm">
                <strong>Temperature settings:</strong> Use lower temperatures (0.1-0.3) for factual tasks and higher temperatures (0.7-0.9) for creative tasks.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 text-green-600">
                <CheckCircle size={16} />
              </div>
              <span className="text-sm">
                <strong>Fallback chains:</strong> Configure fallback models to ensure reliability during provider outages or rate limiting.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 text-green-600">
                <CheckCircle size={16} />
              </div>
              <span className="text-sm">
                <strong>Cost optimization:</strong> Use more capable models for complex tasks and more efficient models for simpler tasks.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 text-green-600">
                <CheckCircle size={16} />
              </div>
              <span className="text-sm">
                <strong>Context windows:</strong> Match model context windows to your use case requirements to optimize performance and cost.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default LlmManagement;
