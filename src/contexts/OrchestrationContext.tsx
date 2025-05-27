import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useTelemetry, SpanContext } from './TelemetryContext';

// Define the types of models that can be orchestrated
export type ModelType = 'text' | 'image' | 'audio' | 'multimodal';

// Define the model provider interface
export interface ModelProvider {
  id: string;
  name: string;
  models: Model[];
  status: 'available' | 'unavailable' | 'limited';
  priority: number;
}

// Define the model interface
export interface Model {
  id: string;
  name: string;
  provider: string;
  type: ModelType;
  capabilities: string[];
  contextWindow: number;
  maxTokens: number;
  status: 'available' | 'unavailable' | 'limited';
  latency: number;
  costPerToken: number;
  reliability: number;
  priority: number;
}

// Define the orchestration context interface
interface OrchestrationContextType {
  providers: ModelProvider[];
  models: Model[];
  activeModels: Record<string, Model>;
  fallbackChains: Record<string, string[]>;
  setProviders: (providers: ModelProvider[]) => void;
  setModels: (models: Model[]) => void;
  setActiveModel: (capability: string, modelId: string) => void;
  setFallbackChain: (capability: string, modelIds: string[]) => void;
  getModelForCapability: (capability: string) => Model | null;
  getFallbackModelsForCapability: (capability: string) => Model[];
  executeWithFallback: <T>(
    capability: string,
    operation: (model: Model) => Promise<T>,
    context?: any
  ) => Promise<T>;
  isOrchestrationEnabled: boolean;
  setOrchestrationEnabled: (enabled: boolean) => void;
}

// Create the context with default values
const OrchestrationContext = createContext<OrchestrationContextType>({
  providers: [],
  models: [],
  activeModels: {},
  fallbackChains: {},
  setProviders: () => {},
  setModels: () => {},
  setActiveModel: () => {},
  setFallbackChain: () => {},
  getModelForCapability: () => null,
  getFallbackModelsForCapability: () => [],
  executeWithFallback: async () => {
    throw new Error('Orchestration not initialized');
  },
  isOrchestrationEnabled: false,
  setOrchestrationEnabled: () => {},
});

// Provider component
export const OrchestrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [activeModels, setActiveModels] = useState<Record<string, Model>>({});
  const [fallbackChains, setFallbackChains] = useState<Record<string, string[]>>({});
  const [isOrchestrationEnabled, setOrchestrationEnabled] = useState<boolean>(true);
  const telemetry = useTelemetry();

  // Set the active model for a capability
  const setActiveModel = (capability: string, modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) {
      console.warn(`Model with ID ${modelId} not found`);
      return;
    }

    setActiveModels(prev => ({
      ...prev,
      [capability]: model,
    }));

    console.log(`Set active model for ${capability}: ${model.name} (${model.id})`);
  };

  // Set the fallback chain for a capability
  const setFallbackChain = (capability: string, modelIds: string[]) => {
    // Validate that all models exist
    const validModelIds = modelIds.filter(id => models.some(m => m.id === id));
    if (validModelIds.length !== modelIds.length) {
      console.warn(`Some models in fallback chain for ${capability} not found`);
    }

    setFallbackChains(prev => ({
      ...prev,
      [capability]: validModelIds,
    }));

    console.log(`Set fallback chain for ${capability}: ${validModelIds.join(', ')}`);
  };

  // Get the active model for a capability
  const getModelForCapability = (capability: string): Model | null => {
    // If we have a specific model for this capability, use it
    if (activeModels[capability]) {
      return activeModels[capability];
    }

    // Otherwise, find models that support this capability and sort by priority
    const capableModels = models
      .filter(model => 
        model.status === 'available' && 
        model.capabilities.includes(capability)
      )
      .sort((a, b) => b.priority - a.priority);

    return capableModels.length > 0 ? capableModels[0] : null;
  };

  // Get fallback models for a capability
  const getFallbackModelsForCapability = (capability: string): Model[] => {
    // If we have a fallback chain for this capability, use it
    if (fallbackChains[capability]) {
      return fallbackChains[capability]
        .map(id => models.find(m => m.id === id))
        .filter((model): model is Model => !!model && model.status === 'available');
    }

    // Otherwise, find models that support this capability and sort by priority
    return models
      .filter(model => 
        model.status === 'available' && 
        model.capabilities.includes(capability) &&
        (!activeModels[capability] || model.id !== activeModels[capability].id)
      )
      .sort((a, b) => b.priority - a.priority);
  };

  // Execute an operation with fallback
  const executeWithFallback = async <T,>(
    capability: string,
    operation: (model: Model) => Promise<T>,
    context?: any
  ): Promise<T> => {
    if (!isOrchestrationEnabled) {
      throw new Error('Model orchestration is disabled');
    }

    // Start a span for the orchestration
    const span = telemetry.startSpan('model.orchestration', {
      'model.orchestration.capability': capability,
      'model.orchestration.context': context ? JSON.stringify(context) : undefined,
    });

    // Get the primary model for this capability
    const primaryModel = getModelForCapability(capability);
    if (!primaryModel) {
      telemetry.addEvent(span, 'model.orchestration.no_model_found', {
        'model.orchestration.capability': capability,
      });
      telemetry.endSpan(span);
      throw new Error(`No model available for capability: ${capability}`);
    }

    // Get fallback models
    const fallbackModels = getFallbackModelsForCapability(capability);

    // Try the primary model first
    try {
      telemetry.addEvent(span, 'model.orchestration.attempt', {
        'model.orchestration.model.id': primaryModel.id,
        'model.orchestration.model.name': primaryModel.name,
        'model.orchestration.model.provider': primaryModel.provider,
        'model.orchestration.attempt': 1,
      });

      const startTime = Date.now();
      const result = await operation(primaryModel);
      const duration = Date.now() - startTime;

      telemetry.addEvent(span, 'model.orchestration.success', {
        'model.orchestration.model.id': primaryModel.id,
        'model.orchestration.model.name': primaryModel.name,
        'model.orchestration.duration': duration,
      });

      telemetry.endSpan(span);
      return result;
    } catch (error) {
      telemetry.addEvent(span, 'model.orchestration.failure', {
        'model.orchestration.model.id': primaryModel.id,
        'model.orchestration.model.name': primaryModel.name,
        'model.orchestration.error': (error as Error).message,
      });

      // Try fallback models in order
      for (let i = 0; i < fallbackModels.length; i++) {
        const fallbackModel = fallbackModels[i];
        try {
          telemetry.addEvent(span, 'model.orchestration.fallback_attempt', {
            'model.orchestration.model.id': fallbackModel.id,
            'model.orchestration.model.name': fallbackModel.name,
            'model.orchestration.model.provider': fallbackModel.provider,
            'model.orchestration.attempt': i + 2,
          });

          const startTime = Date.now();
          const result = await operation(fallbackModel);
          const duration = Date.now() - startTime;

          telemetry.addEvent(span, 'model.orchestration.fallback_success', {
            'model.orchestration.model.id': fallbackModel.id,
            'model.orchestration.model.name': fallbackModel.name,
            'model.orchestration.duration': duration,
          });

          // Update the active model for this capability if fallback was successful
          setActiveModel(capability, fallbackModel.id);

          telemetry.endSpan(span);
          return result;
        } catch (fallbackError) {
          telemetry.addEvent(span, 'model.orchestration.fallback_failure', {
            'model.orchestration.model.id': fallbackModel.id,
            'model.orchestration.model.name': fallbackModel.name,
            'model.orchestration.error': (fallbackError as Error).message,
          });
        }
      }

      // If we get here, all models failed
      telemetry.addEvent(span, 'model.orchestration.all_models_failed', {
        'model.orchestration.capability': capability,
        'model.orchestration.models_tried': [primaryModel, ...fallbackModels]
          .map(m => m.id)
          .join(','),
      });

      telemetry.endSpan(span);
      throw new Error(`All models failed for capability: ${capability}`);
    }
  };

  return (
    <OrchestrationContext.Provider
      value={{
        providers,
        models,
        activeModels,
        fallbackChains,
        setProviders,
        setModels,
        setActiveModel,
        setFallbackChain,
        getModelForCapability,
        getFallbackModelsForCapability,
        executeWithFallback,
        isOrchestrationEnabled,
        setOrchestrationEnabled,
      }}
    >
      {children}
    </OrchestrationContext.Provider>
  );
};

// Custom hook to use the orchestration context
export const useOrchestration = () => useContext(OrchestrationContext);

// Higher-order component to wrap a component with orchestration
export const withOrchestration = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WithOrchestration: React.FC<P> = (props) => {
    return (
      <OrchestrationProvider>
        <Component {...props} />
      </OrchestrationProvider>
    );
  };

  return WithOrchestration;
};
