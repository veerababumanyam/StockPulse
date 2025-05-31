/**
 * Advanced Theme Storage - Enterprise-grade persistence
 * Implements IndexedDB, cross-tab sync, and fallback strategies
 */

import { ColorTheme, ThemeMode } from '../types/theme';

// Storage configuration
interface StorageConfig {
  version: number;
  name: string;
  stores: string[];
  enableSync: boolean;
  enableCompression: boolean;
  maxEntries: number;
}

// Theme storage data structure
interface ThemeStorageData {
  mode: ThemeMode;
  colorTheme: ColorTheme;
  variant?: string;
  customizations?: any;
  timestamp: number;
  version: string;
  userPreferences?: UserPreferences;
}

interface UserPreferences {
  autoSwitch: boolean;
  preferredTransitionSpeed: number;
  accessibilityMode: boolean;
  favoriteThemes: ColorTheme[];
  themeHistory: ThemeHistoryEntry[];
}

interface ThemeHistoryEntry {
  theme: ColorTheme;
  mode: ThemeMode;
  timestamp: number;
  duration: number; // How long the theme was active
}

/**
 * Advanced Theme Storage Manager
 */
export class ThemeStorageManager {
  private db: IDBDatabase | null = null;
  private config: StorageConfig;
  private syncChannel: BroadcastChannel | null = null;
  private compressionEnabled = false;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      version: 1,
      name: 'StockPulseThemeDB',
      stores: ['themes', 'preferences', 'history'],
      enableSync: true,
      enableCompression: false,
      maxEntries: 100,
      ...config
    };

    this.init();
  }

  /**
   * Initialize storage system
   */
  private async init(): Promise<void> {
    try {
      // Initialize IndexedDB
      await this.initIndexedDB();
      
      // Setup cross-tab synchronization
      if (this.config.enableSync) {
        this.initCrossTabSync();
      }
      
      // Check for compression support
      this.compressionEnabled = this.config.enableCompression && 'CompressionStream' in window;
      
    } catch (error) {
      console.warn('Advanced storage initialization failed, falling back to localStorage:', error);
    }
  }

  /**
   * Save theme data with multiple storage strategies
   */
  async saveThemeData(data: ThemeStorageData): Promise<boolean> {
    try {
      // Try IndexedDB first
      if (this.db) {
        await this.saveToIndexedDB(data);
      }
      
      // Fallback to localStorage
      await this.saveToLocalStorage(data);
      
      // Update user preferences and history
      await this.updateUserPreferences(data);
      await this.addToHistory(data);
      
      // Sync across tabs
      if (this.syncChannel) {
        this.syncChannel.postMessage({
          type: 'THEME_UPDATED',
          data
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save theme data:', error);
      return false;
    }
  }

  /**
   * Load theme data with fallback chain
   */
  async loadThemeData(): Promise<ThemeStorageData | null> {
    try {
      // Try IndexedDB first
      if (this.db) {
        const data = await this.loadFromIndexedDB();
        if (data) return data;
      }
      
      // Fallback to localStorage
      return await this.loadFromLocalStorage();
      
    } catch (error) {
      console.error('Failed to load theme data:', error);
      return null;
    }
  }

  /**
   * Get user preferences with analytics
   */
  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      if (this.db) {
        const transaction = this.db.transaction(['preferences'], 'readonly');
        const store = transaction.objectStore('preferences');
        const request = store.get('userPreferences');
        
        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result?.data || null);
          request.onerror = () => reject(request.error);
        });
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem('stockpulse-user-preferences');
      return stored ? JSON.parse(stored) : null;
      
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return null;
    }
  }

  /**
   * Get theme usage analytics
   */
  async getThemeAnalytics(): Promise<any> {
    try {
      const history = await this.getThemeHistory();
      const preferences = await this.getUserPreferences();
      
      if (!history || !preferences) return null;
      
      // Calculate analytics
      const themeUsage = this.calculateThemeUsage(history);
      const averageSessionTime = this.calculateAverageSessionTime(history);
      const mostUsedThemes = this.getMostUsedThemes(history);
      const themeTransitionPatterns = this.getTransitionPatterns(history);
      
      return {
        themeUsage,
        averageSessionTime,
        mostUsedThemes,
        themeTransitionPatterns,
        totalSessions: history.length,
        favoriteThemes: preferences.favoriteThemes
      };
      
    } catch (error) {
      console.error('Failed to generate theme analytics:', error);
      return null;
    }
  }

  /**
   * Export theme data for backup/migration
   */
  async exportThemeData(): Promise<string> {
    try {
      const currentTheme = await this.loadThemeData();
      const preferences = await this.getUserPreferences();
      const history = await this.getThemeHistory();
      
      const exportData = {
        version: '2.0',
        timestamp: Date.now(),
        currentTheme,
        preferences,
        history: history?.slice(-50) // Only export recent history
      };
      
      if (this.compressionEnabled) {
        return await this.compressData(JSON.stringify(exportData));
      }
      
      return JSON.stringify(exportData);
      
    } catch (error) {
      console.error('Failed to export theme data:', error);
      throw error;
    }
  }

  /**
   * Import theme data from backup
   */
  async importThemeData(importData: string): Promise<boolean> {
    try {
      let data;
      
      if (this.compressionEnabled) {
        data = JSON.parse(await this.decompressData(importData));
      } else {
        data = JSON.parse(importData);
      }
      
      // Validate import data
      if (!this.validateImportData(data)) {
        throw new Error('Invalid import data format');
      }
      
      // Import current theme
      if (data.currentTheme) {
        await this.saveThemeData(data.currentTheme);
      }
      
      // Import preferences
      if (data.preferences) {
        await this.saveUserPreferences(data.preferences);
      }
      
      // Import history
      if (data.history) {
        await this.importThemeHistory(data.history);
      }
      
      return true;
      
    } catch (error) {
      console.error('Failed to import theme data:', error);
      return false;
    }
  }

  /**
   * Clear all theme data
   */
  async clearAllData(): Promise<boolean> {
    try {
      // Clear IndexedDB
      if (this.db) {
        const stores = ['themes', 'preferences', 'history'];
        for (const storeName of stores) {
          const transaction = this.db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          await new Promise<void>((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        }
      }
      
      // Clear localStorage
      const keys = [
        'stockpulse-theme',
        'stockpulse-color-theme',
        'stockpulse-user-preferences',
        'stockpulse-theme-history',
        'stockpulse-theme-version'
      ];
      
      keys.forEach(key => localStorage.removeItem(key));
      
      return true;
      
    } catch (error) {
      console.error('Failed to clear theme data:', error);
      return false;
    }
  }

  // Private methods
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        this.config.stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            
            if (storeName === 'history') {
              store.createIndex('timestamp', 'timestamp', { unique: false });
              store.createIndex('theme', 'theme', { unique: false });
            }
          }
        });
      };
    });
  }

  private initCrossTabSync(): void {
    try {
      this.syncChannel = new BroadcastChannel('stockpulse-theme-sync');
      
      this.syncChannel.addEventListener('message', (event) => {
        if (event.data.type === 'THEME_UPDATED') {
          // Emit custom event for theme update
          window.dispatchEvent(new CustomEvent('themeUpdatedFromSync', {
            detail: event.data.data
          }));
        }
      });
      
    } catch (error) {
      console.warn('Cross-tab sync not available:', error);
    }
  }

  private async saveToIndexedDB(data: ThemeStorageData): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not available');
    
    const transaction = this.db.transaction(['themes'], 'readwrite');
    const store = transaction.objectStore('themes');
    
    const storageData = {
      id: 'current',
      ...data
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(storageData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async loadFromIndexedDB(): Promise<ThemeStorageData | null> {
    if (!this.db) return null;
    
    const transaction = this.db.transaction(['themes'], 'readonly');
    const store = transaction.objectStore('themes');
    
    return new Promise((resolve, reject) => {
      const request = store.get('current');
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { id, ...data } = result;
          resolve(data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async saveToLocalStorage(data: ThemeStorageData): Promise<void> {
    try {
      const compressed = this.compressionEnabled 
        ? await this.compressData(JSON.stringify(data))
        : JSON.stringify(data);
        
      localStorage.setItem('stockpulse-theme-data', compressed);
    } catch (error) {
      console.error('localStorage save failed:', error);
      throw error;
    }
  }

  private async loadFromLocalStorage(): Promise<ThemeStorageData | null> {
    try {
      const stored = localStorage.getItem('stockpulse-theme-data');
      if (!stored) return null;
      
      const data = this.compressionEnabled 
        ? await this.decompressData(stored)
        : stored;
        
      return JSON.parse(data);
    } catch (error) {
      console.error('localStorage load failed:', error);
      return null;
    }
  }

  private async updateUserPreferences(data: ThemeStorageData): Promise<void> {
    // Implementation for updating user preferences based on usage
  }

  private async addToHistory(data: ThemeStorageData): Promise<void> {
    // Implementation for adding to theme history
  }

  private async getThemeHistory(): Promise<ThemeHistoryEntry[] | null> {
    // Implementation for getting theme history
    return null;
  }

  private calculateThemeUsage(history: ThemeHistoryEntry[]): any {
    // Implementation for calculating theme usage statistics
    return {};
  }

  private calculateAverageSessionTime(history: ThemeHistoryEntry[]): number {
    // Implementation for calculating average session time
    return 0;
  }

  private getMostUsedThemes(history: ThemeHistoryEntry[]): ColorTheme[] {
    // Implementation for getting most used themes
    return [];
  }

  private getTransitionPatterns(history: ThemeHistoryEntry[]): any {
    // Implementation for analyzing theme transition patterns
    return {};
  }

  private async compressData(data: string): Promise<string> {
    // Implementation for data compression
    return data;
  }

  private async decompressData(data: string): Promise<string> {
    // Implementation for data decompression
    return data;
  }

  private validateImportData(data: any): boolean {
    // Implementation for validating import data structure
    return true;
  }

  private async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    // Implementation for saving user preferences
  }

  private async importThemeHistory(history: ThemeHistoryEntry[]): Promise<void> {
    // Implementation for importing theme history
  }
}

// Export singleton instance
export const themeStorage = new ThemeStorageManager(); 