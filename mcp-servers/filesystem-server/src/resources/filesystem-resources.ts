/**
 * StockPulse MCP Filesystem Server - Resources Implementation
 * MCP resources for exposing filesystem data following MCP specification
 */

import { Resource } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs-extra';
import path from 'path';
import mime from 'mime-types';
import { ConfigManager } from '../config/server-config.js';
import { SecurityValidator } from '../security/path-validator.js';

export interface FileSystemResourcesContext {
  configManager: ConfigManager;
  securityValidator: SecurityValidator;
  logger: any; // Winston logger
}

/**
 * Generate file resource URIs
 */
export function generateFileResourceUri(filePath: string): string {
  return `file://${filePath.replace(/\\/g, '/')}`;
}

export function generateDirectoryResourceUri(dirPath: string): string {
  return `directory://${dirPath.replace(/\\/g, '/')}`;
}

export function generateMetadataResourceUri(targetPath: string): string {
  return `metadata://${targetPath.replace(/\\/g, '/')}`;
}

/**
 * Parse resource URI to extract path and type
 */
export function parseResourceUri(uri: string): { type: string; path: string } | null {
  const match = uri.match(/^(file|directory|metadata):\/\/(.+)$/);
  if (!match) {
    return null;
  }
  
  return {
    type: match[1],
    path: match[2].replace(/\//g, path.sep)
  };
}

/**
 * List all available resources
 */
export async function listResources(
  context: FileSystemResourcesContext
): Promise<Resource[]> {
  const config = context.configManager.getConfig();
  const resources: Resource[] = [];
  
  try {
    // Add root directory resources
    for (const rootPath of config.security.allowedRootPaths) {
      const resolvedPath = path.resolve(rootPath);
      
      if (await fs.pathExists(resolvedPath)) {
        // Add the root directory itself
        resources.push({
          uri: generateDirectoryResourceUri(resolvedPath),
          name: `Directory: ${path.basename(resolvedPath)}`,
          description: `Root directory access for ${resolvedPath}`,
          mimeType: 'application/x-directory'
        });
        
        // Add metadata resource for the root
        resources.push({
          uri: generateMetadataResourceUri(resolvedPath),
          name: `Metadata: ${path.basename(resolvedPath)}`,
          description: `Metadata information for ${resolvedPath}`,
          mimeType: 'application/json'
        });
      }
    }
    
    // Add system information resource
    resources.push({
      uri: 'system://filesystem-server/info',
      name: 'Filesystem Server Information',
      description: 'Server configuration and status information',
      mimeType: 'application/json'
    });
    
    // Add capability resource
    resources.push({
      uri: 'system://filesystem-server/capabilities',
      name: 'Server Capabilities',
      description: 'Available tools and features',
      mimeType: 'application/json'
    });
    
  } catch (error) {
    context.logger.error(`Error listing resources: ${error}`);
  }
  
  return resources;
}

/**
 * Read resource content
 */
export async function readResource(
  uri: string,
  context: FileSystemResourcesContext
): Promise<{ contents: any[]; }> {
  context.logger.info(`Reading resource: ${uri}`);
  
  // Handle system resources
  if (uri.startsWith('system://filesystem-server/')) {
    return await handleSystemResource(uri, context);
  }
  
  // Parse the URI
  const parsed = parseResourceUri(uri);
  if (!parsed) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }
  
  switch (parsed.type) {
    case 'file':
      return await readFileResource(parsed.path, context);
    case 'directory':
      return await readDirectoryResource(parsed.path, context);
    case 'metadata':
      return await readMetadataResource(parsed.path, context);
    default:
      throw new Error(`Unsupported resource type: ${parsed.type}`);
  }
}

/**
 * Handle system resource requests
 */
async function handleSystemResource(
  uri: string,
  context: FileSystemResourcesContext
): Promise<{ contents: any[] }> {
  const config = context.configManager.getConfig();
  
  if (uri === 'system://filesystem-server/info') {
    const info = {
      server: config.server,
      security: {
        readOnlyMode: config.security.readOnlyMode,
        allowedExtensions: config.security.allowedFileExtensions.slice(0, 10), // Limit for display
        maxFileSize: config.security.maxFileSize,
        maxDirectoryDepth: config.security.maxDirectoryDepth,
        enableAuditLog: config.security.enableAuditLog
      },
      features: config.features,
      limits: config.limits,
      status: 'operational',
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform
    };
    
    return {
      contents: [{
        type: 'text',
        text: JSON.stringify(info, null, 2)
      }]
    };
  }
  
  if (uri === 'system://filesystem-server/capabilities') {
    const capabilities = {
      tools: [
        'browse_directory',
        'read_file',
        'write_file',
        'delete_file',
        'get_file_info',
        'search_files'
      ],
      resources: [
        'file://path - File contents',
        'directory://path - Directory listings',
        'metadata://path - File/directory metadata'
      ],
      features: {
        securityValidation: true,
        pathSandboxing: true,
        fileTypeFiltering: true,
        binaryFileSupport: config.features.enableBinaryFiles,
        searchCapability: config.features.enableSearch,
        fileWatching: config.features.enableFileWatch,
        auditLogging: config.security.enableAuditLog
      },
      limits: config.limits,
      supportedEncodings: ['utf8', 'base64', 'ascii', 'binary'],
      supportedMimeTypes: [
        'text/*',
        'application/json',
        'application/javascript',
        'application/typescript',
        'image/*'
      ]
    };
    
    return {
      contents: [{
        type: 'text',
        text: JSON.stringify(capabilities, null, 2)
      }]
    };
  }
  
  throw new Error(`Unknown system resource: ${uri}`);
}

/**
 * Read file resource
 */
async function readFileResource(
  filePath: string,
  context: FileSystemResourcesContext
): Promise<{ contents: any[] }> {
  await context.securityValidator.validateFileOperation(filePath, 'read');
  
  const validatedPath = await context.securityValidator.validatePath(filePath);
  const stats = await fs.stat(validatedPath);
  const config = context.configManager.getConfig();
  
  // Check file size
  if (stats.size > config.security.maxFileSize) {
    throw new Error(`File size ${stats.size} exceeds maximum ${config.security.maxFileSize} bytes`);
  }
  
  // Determine if binary
  const isBinary = await context.securityValidator.isBinaryFile(validatedPath);
  
  if (isBinary && !config.features.enableBinaryFiles) {
    throw new Error('Binary files are not supported');
  }
  
  // Read file content
  const encoding = isBinary ? 'base64' : 'utf8';
  let content = await fs.readFile(validatedPath, encoding as any);
  
  // Sanitize text content
  if (typeof content === 'string' && !isBinary) {
    const mimeType = mime.lookup(validatedPath) || undefined;
    content = context.securityValidator.sanitizeContent(content, mimeType) as any;
  }
  
  const mimeType = mime.lookup(validatedPath) || 'application/octet-stream';
  
  return {
    contents: [{
      type: 'text',
      text: content.toString(),
      annotations: {
        mimeType,
        encoding,
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        isBinary,
        path: validatedPath
      }
    }]
  };
}

/**
 * Read directory resource
 */
async function readDirectoryResource(
  dirPath: string,
  context: FileSystemResourcesContext
): Promise<{ contents: any[] }> {
  await context.securityValidator.validateDirectoryOperation(dirPath, 'read');
  
  const listing = await context.securityValidator.getSecureDirectoryListing(dirPath, false);
  
  // Create a structured representation of the directory
  const directoryData = {
    path: dirPath,
    type: 'directory',
    totalItems: listing.length,
    accessibleItems: listing.filter(item => item.accessible).length,
    items: listing.map(item => ({
      name: item.name,
      type: item.type,
      size: item.size,
      modified: item.modified?.toISOString(),
      accessible: item.accessible,
      uri: item.type === 'directory' 
        ? generateDirectoryResourceUri(path.join(dirPath, item.name))
        : generateFileResourceUri(path.join(dirPath, item.name))
    }))
  };
  
  return {
    contents: [{
      type: 'text',
      text: JSON.stringify(directoryData, null, 2),
      annotations: {
        mimeType: 'application/json',
        directoryPath: dirPath,
        itemCount: listing.length
      }
    }]
  };
}

/**
 * Read metadata resource
 */
async function readMetadataResource(
  targetPath: string,
  context: FileSystemResourcesContext
): Promise<{ contents: any[] }> {
  const validatedPath = await context.securityValidator.validatePath(targetPath);
  const stats = await fs.stat(validatedPath);
  
  const metadata: any = {
    path: targetPath,
    absolutePath: validatedPath,
    type: stats.isDirectory() ? 'directory' : 'file',
    size: stats.size,
    created: stats.birthtime.toISOString(),
    modified: stats.mtime.toISOString(),
    accessed: stats.atime.toISOString(),
    permissions: {
      readable: true,
      writable: !context.configManager.getConfig().security.readOnlyMode,
      executable: false
    },
    isHidden: path.basename(validatedPath).startsWith('.'),
    extension: stats.isFile() ? path.extname(validatedPath) : null,
    mimeType: stats.isFile() ? mime.lookup(validatedPath) || 'application/octet-stream' : null,
    security: {
      accessible: context.configManager.isPathAllowed(validatedPath),
      extensionAllowed: stats.isFile() ? context.configManager.isFileExtensionAllowed(validatedPath) : true
    }
  };
  
  // Add directory-specific metadata
  if (stats.isDirectory()) {
    try {
      const items = await fs.readdir(validatedPath);
      metadata.itemCount = items.length;
    } catch (error) {
      metadata.itemCount = 0;
    }
  }
  
  // Add file-specific metadata
  if (stats.isFile()) {
    metadata.isBinary = await context.securityValidator.isBinaryFile(validatedPath);
  }
  
  return {
    contents: [{
      type: 'text',
      text: JSON.stringify(metadata, null, 2),
      annotations: {
        mimeType: 'application/json',
        metadataFor: targetPath,
        resourceType: metadata.type
      }
    }]
  };
}

/**
 * Subscribe to resource changes (for file watching)
 */
export function subscribeToResource(
  uri: string,
  context: FileSystemResourcesContext
): void {
  const config = context.configManager.getConfig();
  
  if (!config.features.enableFileWatch) {
    throw new Error('File watching is disabled');
  }
  
  // Parse the URI
  const parsed = parseResourceUri(uri);
  if (!parsed) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }
  
  // Implementation would set up file system watchers
  // This is a placeholder for the actual implementation
  context.logger.info(`Subscribed to resource changes: ${uri}`);
}

/**
 * Unsubscribe from resource changes
 */
export function unsubscribeFromResource(
  uri: string,
  context: FileSystemResourcesContext
): void {
  // Implementation would remove file system watchers
  // This is a placeholder for the actual implementation
  context.logger.info(`Unsubscribed from resource changes: ${uri}`);
} 