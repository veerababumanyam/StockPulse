/**
 * Widget Registry System
 * Central registry for dynamic widget management in federated architecture
 */

import { WidgetType, WidgetConfig, WidgetLibraryItem, WidgetCategory } from '../types/dashboard';

// Widget metadata for registration
export interface WidgetMetadata {
  type: WidgetType;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  config: WidgetConfig;
  libraryItem: WidgetLibraryItem;
  previewComponent?: React.LazyExoticComponent<React.ComponentType<any>>;
  dependencies?: string[];
  permissions?: string[];
  dataRequirements?: string[];
}

// Widget factory interface
export interface WidgetFactory {
  create: (config: Record<string, any>) => React.ComponentType<any>;
  validate: (config: Record<string, any>) => boolean;
  getDefaultConfig: () => Record<string, any>;
}

// Widget registry class
class WidgetRegistryService {
  private widgets: Map<WidgetType, WidgetMetadata> = new Map();
  private factories: Map<WidgetType, WidgetFactory> = new Map();
  private categories: Map<WidgetCategory, WidgetType[]> = new Map();
  private loadPromises: Map<WidgetType, Promise<void>> = new Map();

  /**
   * Register a widget with the registry
   */
  register(metadata: WidgetMetadata, factory?: WidgetFactory): void {
    this.widgets.set(metadata.type, metadata);
    
    if (factory) {
      this.factories.set(metadata.type, factory);
    }

    // Update category mapping
    const category = metadata.libraryItem.category;
    const categoryWidgets = this.categories.get(category) || [];
    if (!categoryWidgets.includes(metadata.type)) {
      categoryWidgets.push(metadata.type);
      this.categories.set(category, categoryWidgets);
    }

    console.log(`Widget registered: ${metadata.type}`);
  }

  /**
   * Get all registered widgets
   */
  getAll(): WidgetMetadata[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Get widgets by category
   */
  getByCategory(category: WidgetCategory): WidgetMetadata[] {
    const widgetTypes = this.categories.get(category) || [];
    return widgetTypes
      .map(type => this.widgets.get(type))
      .filter((widget): widget is WidgetMetadata => widget !== undefined);
  }

  /**
   * Get widget metadata by type
   */
  get(type: WidgetType): WidgetMetadata | undefined {
    return this.widgets.get(type);
  }

  /**
   * Get widget component (lazy loaded)
   */
  async getComponent(type: WidgetType): Promise<React.ComponentType<any> | null> {
    const metadata = this.widgets.get(type);
    if (!metadata) return null;

    try {
      const module = await metadata.component();
      return module.default || module;
    } catch (error) {
      console.error(`Failed to load widget component: ${type}`, error);
      return null;
    }
  }

  /**
   * Get widget preview component
   */
  async getPreviewComponent(type: WidgetType): Promise<React.ComponentType<any> | null> {
    const metadata = this.widgets.get(type);
    if (!metadata?.previewComponent) return null;

    try {
      const module = await metadata.previewComponent();
      return module.default || module;
    } catch (error) {
      console.error(`Failed to load widget preview: ${type}`, error);
      return null;
    }
  }

  /**
   * Get widget factory
   */
  getFactory(type: WidgetType): WidgetFactory | undefined {
    return this.factories.get(type);
  }

  /**
   * Check if widget is available
   */
  isAvailable(type: WidgetType): boolean {
    const metadata = this.widgets.get(type);
    return metadata?.libraryItem.isAvailable ?? false;
  }

  /**
   * Search widgets by query
   */
  search(query: string): WidgetMetadata[] {
    const searchTerm = query.toLowerCase();
    return this.getAll().filter(widget => 
      widget.config.title.toLowerCase().includes(searchTerm) ||
      widget.config.description.toLowerCase().includes(searchTerm) ||
      widget.libraryItem.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Validate widget configuration
   */
  validateConfig(type: WidgetType, config: Record<string, any>): boolean {
    const factory = this.factories.get(type);
    return factory?.validate(config) ?? true;
  }

  /**
   * Get default configuration for widget
   */
  getDefaultConfig(type: WidgetType): Record<string, any> {
    const factory = this.factories.get(type);
    return factory?.getDefaultConfig() ?? {};
  }

  /**
   * Check widget permissions
   */
  checkPermissions(type: WidgetType, userPermissions: string[]): boolean {
    const metadata = this.widgets.get(type);
    if (!metadata?.permissions) return true;

    return metadata.permissions.every(permission => 
      userPermissions.includes(permission)
    );
  }

  /**
   * Get widget library items for display
   */
  getLibraryItems(): WidgetLibraryItem[] {
    return this.getAll()
      .map(widget => widget.libraryItem)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  /**
   * Get categories with widget counts
   */
  getCategoriesWithCounts(): Array<{ category: WidgetCategory; count: number; widgets: WidgetType[] }> {
    return Array.from(this.categories.entries()).map(([category, widgets]) => ({
      category,
      count: widgets.length,
      widgets
    }));
  }

  /**
   * Preload widget components
   */
  async preloadWidgets(types?: WidgetType[]): Promise<void> {
    const widgetsToLoad = types || Array.from(this.widgets.keys());
    const loadPromises = widgetsToLoad.map(type => this.preloadWidget(type));
    await Promise.allSettled(loadPromises);
  }

  /**
   * Preload single widget
   */
  private async preloadWidget(type: WidgetType): Promise<void> {
    if (this.loadPromises.has(type)) {
      return this.loadPromises.get(type);
    }

    const loadPromise = this.getComponent(type).then(() => {
      console.log(`Widget preloaded: ${type}`);
    });

    this.loadPromises.set(type, loadPromise);
    return loadPromise;
  }

  /**
   * Unregister widget
   */
  unregister(type: WidgetType): boolean {
    const metadata = this.widgets.get(type);
    if (!metadata) return false;

    this.widgets.delete(type);
    this.factories.delete(type);
    this.loadPromises.delete(type);

    // Update category mapping
    const category = metadata.libraryItem.category;
    const categoryWidgets = this.categories.get(category) || [];
    const updatedWidgets = categoryWidgets.filter(w => w !== type);
    if (updatedWidgets.length > 0) {
      this.categories.set(category, updatedWidgets);
    } else {
      this.categories.delete(category);
    }

    console.log(`Widget unregistered: ${type}`);
    return true;
  }

  /**
   * Clear all registrations (for testing)
   */
  clear(): void {
    this.widgets.clear();
    this.factories.clear();
    this.categories.clear();
    this.loadPromises.clear();
  }
}

// Export singleton instance
export const widgetRegistry = new WidgetRegistryService();

// Export utility functions
export const registerWidget = (metadata: WidgetMetadata, factory?: WidgetFactory) => 
  widgetRegistry.register(metadata, factory);

export const getWidget = (type: WidgetType) => widgetRegistry.get(type);

export const getWidgetComponent = (type: WidgetType) => widgetRegistry.getComponent(type);

export const searchWidgets = (query: string) => widgetRegistry.search(query);

export const getWidgetsByCategory = (category: WidgetCategory) => 
  widgetRegistry.getByCategory(category);

export const getWidgetLibrary = () => widgetRegistry.getLibraryItems(); 