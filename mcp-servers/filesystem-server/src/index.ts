#!/usr/bin/env node

/**
 * StockPulse MCP Filesystem Server
 * Enterprise-grade MCP server for secure filesystem access
 * Implements MCP specification with JSON-RPC 2.0 protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import winston from 'winston';
import fs from 'fs-extra';
import path from 'path';

// Import our modules
import { createConfigManager, ConfigManager } from './config/server-config.js';
import { createSecurityValidator, SecurityValidator, PathValidationError } from './security/path-validator.js';
import { allTools, toolHandlers, FileSystemToolsContext } from './tools/filesystem-tools.js';
import { listResources, readResource, FileSystemResourcesContext } from './resources/filesystem-resources.js';

/**
 * Main MCP Filesystem Server class
 */
class FileSystemMCPServer {
  private server: Server;
  private configManager: ConfigManager;
  private securityValidator: SecurityValidator;
  private logger: winston.Logger;
  private context: FileSystemToolsContext & FileSystemResourcesContext;

  constructor() {
    // Initialize configuration
    this.configManager = createConfigManager();
    
    // Initialize security validator
    this.securityValidator = createSecurityValidator(this.configManager);
    
    // Initialize logger
    this.logger = this.createLogger();
    
    // Create context for tools and resources
    this.context = {
      configManager: this.configManager,
      securityValidator: this.securityValidator,
      logger: this.logger
    };
    
    // Initialize MCP server
    const config = this.configManager.getConfig();
    this.server = new Server(
      {
        name: config.server.name,
        version: config.server.version,
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );
    
    this.setupHandlers();
    this.logger.info('FileSystem MCP Server initialized');
  }

  /**
   * Create Winston logger instance
   */
  private createLogger(): winston.Logger {
    const config = this.configManager.getConfig();
    
    // Ensure log directory exists
    if (config.logging.logFile) {
      const logDir = path.dirname(config.logging.logFile);
      fs.ensureDirSync(logDir);
    }
    
    const transports: winston.transport[] = [];
    
    // Console transport
    if (config.logging.enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
            })
          ),
        })
      );
    }
    
    // File transport
    if (config.logging.logFile) {
      transports.push(
        new winston.transports.File({
          filename: config.logging.logFile,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
        })
      );
    }
    
    return winston.createLogger({
      level: config.logging.level,
      transports,
      exitOnError: false,
    });
  }

  /**
   * Setup MCP server request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      this.logger.debug('Listing available tools');
      return {
        tools: allTools,
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      this.logger.info(`Tool call: ${name}`, { args });
      
      try {
        // Rate limiting check
        await this.checkRateLimit();
        
        // Get handler
        const handler = toolHandlers[name as keyof typeof toolHandlers];
        if (!handler) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
        }
        
        // Validate arguments
        if (!args || typeof args !== 'object') {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Invalid or missing arguments'
          );
        }
        
        // Execute handler
        const result = await handler(args as any, this.context);
        
        // Log successful operation
        if (this.configManager.getConfig().security.enableAuditLog) {
          this.logger.info(`Tool execution successful: ${name}`, {
            tool: name,
            args,
            success: true,
            timestamp: new Date().toISOString()
          });
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        // Log error
        this.logger.error(`Tool execution failed: ${name}`, {
          tool: name,
          args,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
        
        // Handle specific error types
        if (error instanceof PathValidationError) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            error.message
          );
        }
        
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      this.logger.debug('Listing available resources');
      
      try {
        const resources = await listResources(this.context);
        return { resources };
      } catch (error) {
        this.logger.error('Failed to list resources', { error });
        throw new McpError(
          ErrorCode.InternalError,
          'Failed to list resources'
        );
      }
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      this.logger.info(`Resource read: ${uri}`);
      
      try {
        // Rate limiting check
        await this.checkRateLimit();
        
        const result = await readResource(uri, this.context);
        
        // Log successful operation
        if (this.configManager.getConfig().security.enableAuditLog) {
          this.logger.info(`Resource read successful: ${uri}`, {
            uri,
            success: true,
            timestamp: new Date().toISOString()
          });
        }
        
        return result;
      } catch (error) {
        // Log error
        this.logger.error(`Resource read failed: ${uri}`, {
          uri,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
        
        if (error instanceof PathValidationError) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            error.message
          );
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
      }
    });
  }

  /**
   * Simple rate limiting check
   */
  private async checkRateLimit(): Promise<void> {
    // Implement rate limiting logic here
    // For now, this is a placeholder
    const config = this.configManager.getConfig();
    
    // In a real implementation, you would track requests per minute
    // and throw an error if the limit is exceeded
    if (config.limits.rateLimitPerMinute > 0) {
      // Rate limiting logic would go here
    }
  }

  /**
   * Start the MCP server
   */
  public async start(): Promise<void> {
    const config = this.configManager.getConfig();
    
    try {
      // Create log directory if needed
      if (config.logging.logFile) {
        await fs.ensureDir(path.dirname(config.logging.logFile));
      }
      
      // Validate configuration
      this.logger.info('Starting StockPulse Filesystem MCP Server', {
        name: config.server.name,
        version: config.server.version,
        allowedPaths: config.security.allowedRootPaths,
        readOnlyMode: config.security.readOnlyMode
      });
      
      // Verify allowed paths exist
      for (const rootPath of config.security.allowedRootPaths) {
        const resolvedPath = path.resolve(rootPath);
        if (!(await fs.pathExists(resolvedPath))) {
          this.logger.warn(`Allowed path does not exist: ${resolvedPath}`);
        }
      }
      
      // Start the server with stdio transport
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      this.logger.info('MCP Filesystem Server started successfully');
      
      // Handle graceful shutdown
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
      
    } catch (error) {
      this.logger.error('Failed to start MCP server', { error });
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(): Promise<void> {
    this.logger.info('Shutting down MCP Filesystem Server');
    
    try {
      await this.server.close();
      this.logger.info('MCP Filesystem Server shutdown complete');
      process.exit(0);
    } catch (error) {
      this.logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    // Load custom configuration if provided
    const configFile = process.env.MCP_FILESYSTEM_CONFIG;
    
    if (configFile && await fs.pathExists(configFile)) {
      try {
        const configContent = await fs.readFile(configFile, 'utf8');
        JSON.parse(configContent); // Validate JSON
        console.log(`Loaded configuration from: ${configFile}`);
      } catch (error) {
        console.warn(`Failed to load config file ${configFile}:`, error);
      }
    }
    
    // Create and start server
    const server = new FileSystemMCPServer();
    await server.start();
    
  } catch (error) {
    console.error('Fatal error starting MCP Filesystem Server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
} 