/**
 * StockPulse MCP Filesystem Server Configuration
 * Enterprise-grade configuration management with security controls
 */

import Joi from 'joi';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface FileSystemConfig {
  server: {
    name: string;
    version: string;
    port?: number;
    host?: string;
  };
  security: {
    allowedRootPaths: string[];
    readOnlyMode: boolean;
    maxFileSize: number; // in bytes
    maxDirectoryDepth: number;
    allowedFileExtensions: string[];
    blockedPatterns: string[];
    enableAuditLog: boolean;
  };
  features: {
    enableFileWatch: boolean;
    enableSearch: boolean;
    enableBinaryFiles: boolean;
    cacheDirectoryListings: boolean;
  };
  limits: {
    maxFilesPerRequest: number;
    maxConcurrentOperations: number;
    rateLimitPerMinute: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    logFile?: string;
    enableConsole: boolean;
  };
}

// Joi schema for configuration validation
const configSchema = Joi.object<FileSystemConfig>({
  server: Joi.object({
    name: Joi.string().required(),
    version: Joi.string().required(),
    port: Joi.number().port().optional(),
    host: Joi.string().hostname().optional(),
  }).required(),
  
  security: Joi.object({
    allowedRootPaths: Joi.array().items(Joi.string()).min(1).required(),
    readOnlyMode: Joi.boolean().required(),
    maxFileSize: Joi.number().positive().required(),
    maxDirectoryDepth: Joi.number().positive().max(20).required(),
    allowedFileExtensions: Joi.array().items(Joi.string()).required(),
    blockedPatterns: Joi.array().items(Joi.string()).required(),
    enableAuditLog: Joi.boolean().required(),
  }).required(),
  
  features: Joi.object({
    enableFileWatch: Joi.boolean().required(),
    enableSearch: Joi.boolean().required(),
    enableBinaryFiles: Joi.boolean().required(),
    cacheDirectoryListings: Joi.boolean().required(),
  }).required(),
  
  limits: Joi.object({
    maxFilesPerRequest: Joi.number().positive().max(1000).required(),
    maxConcurrentOperations: Joi.number().positive().max(50).required(),
    rateLimitPerMinute: Joi.number().positive().required(),
  }).required(),
  
  logging: Joi.object({
    level: Joi.string().valid('debug', 'info', 'warn', 'error').required(),
    logFile: Joi.string().optional(),
    enableConsole: Joi.boolean().required(),
  }).required(),
});

// Default configuration
const defaultConfig: FileSystemConfig = {
  server: {
    name: 'stockpulse-filesystem-mcp',
    version: '1.0.0',
    port: 3001,
    host: 'localhost',
  },
  security: {
    allowedRootPaths: [
      path.resolve(__dirname, '../../../..'), // StockPulse root
    ],
    readOnlyMode: false,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxDirectoryDepth: 10,
    allowedFileExtensions: [
      '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt',
      '.yml', '.yaml', '.env.example', '.gitignore', '.css',
      '.html', '.svg', '.png', '.jpg', '.jpeg', '.gif',
      '.py', '.sql', '.sh', '.bat', '.ps1', '.xml'
    ],
    blockedPatterns: [
      '**/node_modules/**',
      '**/.git/**',
      '**/.env',
      '**/*.log',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.pem',
      '**/*.key',
      '**/*.p12',
      '**/*.jks'
    ],
    enableAuditLog: true,
  },
  features: {
    enableFileWatch: true,
    enableSearch: true,
    enableBinaryFiles: false,
    cacheDirectoryListings: true,
  },
  limits: {
    maxFilesPerRequest: 100,
    maxConcurrentOperations: 10,
    rateLimitPerMinute: 1000,
  },
  logging: {
    level: 'info',
    logFile: path.join(__dirname, '../../logs/filesystem-server.log'),
    enableConsole: true,
  },
};

export class ConfigManager {
  private config: FileSystemConfig;

  constructor(customConfig?: Partial<FileSystemConfig>) {
    this.config = this.mergeConfig(defaultConfig, customConfig || {});
    this.validateConfig();
  }

  private mergeConfig(
    defaultConf: FileSystemConfig,
    customConf: Partial<FileSystemConfig>
  ): FileSystemConfig {
    return {
      ...defaultConf,
      ...customConf,
      server: { ...defaultConf.server, ...customConf.server },
      security: { ...defaultConf.security, ...customConf.security },
      features: { ...defaultConf.features, ...customConf.features },
      limits: { ...defaultConf.limits, ...customConf.limits },
      logging: { ...defaultConf.logging, ...customConf.logging },
    };
  }

  private validateConfig(): void {
    const { error } = configSchema.validate(this.config);
    if (error) {
      throw new Error(`Configuration validation failed: ${error.message}`);
    }
  }

  public getConfig(): FileSystemConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<FileSystemConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
    this.validateConfig();
  }

  public isPathAllowed(targetPath: string): boolean {
    const resolvedPath = path.resolve(targetPath);
    
    // Check if path is within allowed root paths
    const isWithinAllowed = this.config.security.allowedRootPaths.some(
      allowedPath => resolvedPath.startsWith(path.resolve(allowedPath))
    );
    
    if (!isWithinAllowed) {
      return false;
    }
    
    // Check against blocked patterns
    const isBlocked = this.config.security.blockedPatterns.some(
      pattern => this.matchesPattern(resolvedPath, pattern)
    );
    
    return !isBlocked;
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  public isFileExtensionAllowed(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.config.security.allowedFileExtensions.includes(ext) || 
           this.config.security.allowedFileExtensions.includes('*');
  }
}

export const createConfigManager = (customConfig?: Partial<FileSystemConfig>): ConfigManager => {
  return new ConfigManager(customConfig);
}; 