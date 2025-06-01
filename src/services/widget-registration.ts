/**
 * StockPulse Widget Registration - Enterprise-Grade
 * Handles widget registration, initialization, and lifecycle management
 * Follows Story 2.2 requirements and enterprise architecture patterns
 */

import { widgetRegistry, WidgetRegistryEntry } from './widget-registry';
import {
  WidgetType,
  WidgetMetadata,
  WidgetCategory,
  WidgetComponentProps,
} from '../types/dashboard';
import { ComponentType } from 'react';

// ===============================================
// Registration Events
// ===============================================

export type RegistrationEvent = 
  | { type: 'WIDGET_REGISTERED'; payload: { widgetType: WidgetType } }
  | { type: 'WIDGET_UNREGISTERED'; payload: { widgetType: WidgetType } }
  | { type: 'WIDGET_ENABLED'; payload: { widgetType: WidgetType; enabled: boolean } }
  | { type: 'REGISTRY_INITIALIZED'; payload: { totalWidgets: number } };

export type RegistrationEventHandler = (event: RegistrationEvent) => void;

// ===============================================
// Registration Configuration
// ===============================================

export interface RegistrationConfig {
  autoRegister: boolean;
  enabledByDefault: boolean;
  validateComponents: boolean;
  logRegistrations: boolean;
  permissions?: string[];
}

const DEFAULT_REGISTRATION_CONFIG: RegistrationConfig = {
  autoRegister: true,
  enabledByDefault: true,
  validateComponents: true,
  logRegistrations: true,
};

// ===============================================
// Widget Registration Service
// ===============================================

class WidgetRegistrationService {
  private eventHandlers: RegistrationEventHandler[] = [];
  private config: RegistrationConfig;
  private initialized = false;

  constructor(config: Partial<RegistrationConfig> = {}) {
    this.config = { ...DEFAULT_REGISTRATION_CONFIG, ...config };
  }

  /**
   * Initialize the registration service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.config.logRegistrations) {
      console.log('[WidgetRegistration] Initializing widget registration service...');
    }

    // Auto-register all widgets if enabled
    if (this.config.autoRegister) {
      await this.autoRegisterWidgets();
    }

    this.initialized = true;

    // Emit initialization event
    this.emitEvent({
      type: 'REGISTRY_INITIALIZED',
      payload: { totalWidgets: widgetRegistry.getAllWidgets().length },
    });

    if (this.config.logRegistrations) {
      console.log('[WidgetRegistration] Widget registration service initialized');
    }
  }

  /**
   * Register a single widget
   */
  async registerWidget(
    type: WidgetType,
    metadata: WidgetMetadata,
    component: ComponentType<WidgetComponentProps>,
    options: {
      previewComponent?: ComponentType<any>;
      permissions?: string[];
      enabled?: boolean;
      version?: string;
    } = {}
  ): Promise<boolean> {
    try {
      // Validate component if enabled
      if (this.config.validateComponents) {
        const isValid = await this.validateComponent(component);
        if (!isValid) {
          console.error(`[WidgetRegistration] Component validation failed for ${type}`);
          return false;
        }
      }

      // Create registry entry
      const entry: WidgetRegistryEntry = {
        type,
        metadata,
        component,
        previewComponent: options.previewComponent,
        isEnabled: options.enabled ?? this.config.enabledByDefault,
        permissions: options.permissions || this.config.permissions,
        version: options.version || '1.0.0',
        lastUpdated: new Date().toISOString(),
      };

      // Register with the registry
      widgetRegistry.registerWidget(entry);

      // Emit registration event
      this.emitEvent({
        type: 'WIDGET_REGISTERED',
        payload: { widgetType: type },
      });

      if (this.config.logRegistrations) {
        console.log(`[WidgetRegistration] Widget registered: ${type}`);
      }

      return true;
    } catch (error) {
      console.error(`[WidgetRegistration] Failed to register widget ${type}:`, error);
      return false;
    }
  }

  /**
   * Unregister a widget
   */
  unregisterWidget(type: WidgetType): boolean {
    try {
      widgetRegistry.unregisterWidget(type);

      // Emit unregistration event
      this.emitEvent({
        type: 'WIDGET_UNREGISTERED',
        payload: { widgetType: type },
      });

      if (this.config.logRegistrations) {
        console.log(`[WidgetRegistration] Widget unregistered: ${type}`);
      }

      return true;
    } catch (error) {
      console.error(`[WidgetRegistration] Failed to unregister widget ${type}:`, error);
      return false;
    }
  }

  /**
   * Enable or disable a widget
   */
  setWidgetEnabled(type: WidgetType, enabled: boolean): boolean {
    try {
      widgetRegistry.setWidgetEnabled(type, enabled);

      // Emit enable/disable event
      this.emitEvent({
        type: 'WIDGET_ENABLED',
        payload: { widgetType: type, enabled },
      });

      if (this.config.logRegistrations) {
        console.log(`[WidgetRegistration] Widget ${enabled ? 'enabled' : 'disabled'}: ${type}`);
      }

      return true;
    } catch (error) {
      console.error(`[WidgetRegistration] Failed to ${enabled ? 'enable' : 'disable'} widget ${type}:`, error);
      return false;
    }
  }

  /**
   * Bulk register widgets
   */
  async registerWidgets(
    widgets: Array<{
      type: WidgetType;
      metadata: WidgetMetadata;
      component: ComponentType<WidgetComponentProps>;
      options?: {
        previewComponent?: ComponentType<any>;
        permissions?: string[];
        enabled?: boolean;
        version?: string;
      };
    }>
  ): Promise<{ successful: WidgetType[]; failed: WidgetType[] }> {
    const successful: WidgetType[] = [];
    const failed: WidgetType[] = [];

    for (const widget of widgets) {
      const success = await this.registerWidget(
        widget.type,
        widget.metadata,
        widget.component,
        widget.options
      );

      if (success) {
        successful.push(widget.type);
      } else {
        failed.push(widget.type);
      }
    }

    if (this.config.logRegistrations) {
      console.log(`[WidgetRegistration] Bulk registration completed: ${successful.length} successful, ${failed.length} failed`);
    }

    return { successful, failed };
  }

  /**
   * Auto-register all available widgets
   */
  private async autoRegisterWidgets(): Promise<void> {
    // All widgets are already registered in the registry constructor
    // This method is for future extensibility
    const stats = widgetRegistry.getRegistryStats();
    
    if (this.config.logRegistrations) {
      console.log(`[WidgetRegistration] Auto-registration completed: ${stats.totalWidgets} widgets registered`);
    }
  }

  /**
   * Validate a widget component
   */
  private async validateComponent(component: ComponentType<WidgetComponentProps>): Promise<boolean> {
    try {
      // Basic validation - check if component is a valid React component
      if (typeof component !== 'function' && typeof component !== 'object') {
        return false;
      }

      // Additional validation could be added here
      // - Check for required props
      // - Validate component structure
      // - Test rendering in isolated environment

      return true;
    } catch (error) {
      console.error('[WidgetRegistration] Component validation error:', error);
      return false;
    }
  }

  /**
   * Get registration statistics
   */
  getRegistrationStats(): {
    totalRegistered: number;
    enabledWidgets: number;
    disabledWidgets: number;
    categoryCounts: Record<WidgetCategory, number>;
    premiumWidgets: number;
    lastRegistration?: string;
  } {
    const registryStats = widgetRegistry.getRegistryStats();
    
    return {
      totalRegistered: registryStats.totalWidgets,
      enabledWidgets: registryStats.enabledWidgets,
      disabledWidgets: registryStats.totalWidgets - registryStats.enabledWidgets,
      categoryCounts: registryStats.categoryCounts,
      premiumWidgets: registryStats.premiumWidgets,
      lastRegistration: new Date().toISOString(),
    };
  }

  /**
   * Check if widget is registered
   */
  isWidgetRegistered(type: WidgetType): boolean {
    return widgetRegistry.getWidget(type) !== undefined;
  }

  /**
   * Get all registered widget types
   */
  getRegisteredWidgetTypes(): WidgetType[] {
    return widgetRegistry.getAllWidgets().map(widget => widget.type);
  }

  /**
   * Get widgets by category
   */
  getWidgetsByCategory(category: WidgetCategory): WidgetRegistryEntry[] {
    return widgetRegistry.getWidgetsByCategory(category);
  }

  /**
   * Search widgets by query
   */
  searchWidgets(query: string): WidgetRegistryEntry[] {
    const searchTerm = query.toLowerCase();
    return widgetRegistry.getAllWidgets().filter(widget =>
      widget.metadata.name.toLowerCase().includes(searchTerm) ||
      widget.metadata.description.toLowerCase().includes(searchTerm) ||
      widget.metadata.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Add event handler
   */
  addEventListener(handler: RegistrationEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  removeEventListener(handler: RegistrationEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Emit registration event
   */
  private emitEvent(event: RegistrationEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('[WidgetRegistration] Event handler error:', error);
      }
    });
  }

  /**
   * Update registration configuration
   */
  updateConfig(newConfig: Partial<RegistrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.logRegistrations) {
      console.log('[WidgetRegistration] Configuration updated:', newConfig);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): RegistrationConfig {
    return { ...this.config };
  }

  /**
   * Reset registration service
   */
  reset(): void {
    this.eventHandlers = [];
    this.initialized = false;
    
    if (this.config.logRegistrations) {
      console.log('[WidgetRegistration] Registration service reset');
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// ===============================================
// Singleton Instance
// ===============================================

export const widgetRegistration = new WidgetRegistrationService();

// ===============================================
// Utility Functions
// ===============================================

/**
 * Initialize widget registration
 */
export const initializeWidgetRegistration = async (config?: Partial<RegistrationConfig>): Promise<void> => {
  if (config) {
    widgetRegistration.updateConfig(config);
  }
  await widgetRegistration.initialize();
};

/**
 * Register a widget
 */
export const registerWidget = async (
  type: WidgetType,
  metadata: WidgetMetadata,
  component: ComponentType<WidgetComponentProps>,
  options?: {
    previewComponent?: ComponentType<any>;
    permissions?: string[];
    enabled?: boolean;
    version?: string;
  }
): Promise<boolean> => {
  return widgetRegistration.registerWidget(type, metadata, component, options);
};

/**
 * Unregister a widget
 */
export const unregisterWidget = (type: WidgetType): boolean => {
  return widgetRegistration.unregisterWidget(type);
};

/**
 * Enable/disable a widget
 */
export const setWidgetEnabled = (type: WidgetType, enabled: boolean): boolean => {
  return widgetRegistration.setWidgetEnabled(type, enabled);
};

/**
 * Get registration statistics
 */
export const getRegistrationStats = () => {
  return widgetRegistration.getRegistrationStats();
};

/**
 * Check if widget is registered
 */
export const isWidgetRegistered = (type: WidgetType): boolean => {
  return widgetRegistration.isWidgetRegistered(type);
};

/**
 * Search widgets
 */
export const searchWidgets = (query: string): WidgetRegistryEntry[] => {
  return widgetRegistration.searchWidgets(query);
};

export default widgetRegistration; 