/**
 * StockPulse MCP Filesystem Server - Security Module
 * Enterprise-grade path validation and access control
 */

import path from 'path';
import fs from 'fs-extra';
import { ConfigManager } from '../config/server-config.js';

export class PathValidationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'PathValidationError';
  }
}

export class SecurityValidator {
  constructor(private configManager: ConfigManager) {}

  /**
   * Validate and normalize a file path
   * Prevents directory traversal and enforces security policies
   */
  public async validatePath(inputPath: string): Promise<string> {
    if (!inputPath || typeof inputPath !== 'string') {
      throw new PathValidationError('Invalid path provided', 'INVALID_PATH');
    }

    // Normalize and resolve the path
    const normalizedPath = path.normalize(inputPath);
    const resolvedPath = path.resolve(normalizedPath);

    // Check for directory traversal attempts
    if (normalizedPath.includes('..')) {
      throw new PathValidationError(
        'Directory traversal not allowed',
        'TRAVERSAL_ATTEMPT'
      );
    }

    // Check if path is within allowed root paths
    if (!this.configManager.isPathAllowed(resolvedPath)) {
      throw new PathValidationError(
        `Access denied: Path outside allowed directories`,
        'ACCESS_DENIED'
      );
    }

    return resolvedPath;
  }

  /**
   * Validate file operation permissions
   */
  public async validateFileOperation(
    filePath: string,
    operation: 'read' | 'write' | 'delete' | 'create'
  ): Promise<void> {
    const validatedPath = await this.validatePath(filePath);
    const config = this.configManager.getConfig();

    // Check read-only mode
    if (config.security.readOnlyMode && ['write', 'delete', 'create'].includes(operation)) {
      throw new PathValidationError(
        'Server is in read-only mode',
        'READ_ONLY_MODE'
      );
    }

    // Check file extension
    if (!this.configManager.isFileExtensionAllowed(validatedPath)) {
      throw new PathValidationError(
        `File extension not allowed: ${path.extname(validatedPath)}`,
        'EXTENSION_NOT_ALLOWED'
      );
    }

    // Check if file exists for read/delete operations
    if (['read', 'delete'].includes(operation)) {
      const exists = await fs.pathExists(validatedPath);
      if (!exists) {
        throw new PathValidationError(
          'File not found',
          'FILE_NOT_FOUND'
        );
      }
    }

    // Check file size for write operations
    if (operation === 'write') {
      try {
        const stats = await fs.stat(validatedPath);
        if (stats.size > config.security.maxFileSize) {
          throw new PathValidationError(
            `File size exceeds limit: ${config.security.maxFileSize} bytes`,
            'FILE_TOO_LARGE'
          );
        }
      } catch (error) {
        // File doesn't exist, which is fine for create operations
        if ((error as any).code !== 'ENOENT') {
          throw error;
        }
      }
    }
  }

  /**
   * Validate directory operation permissions
   */
  public async validateDirectoryOperation(
    dirPath: string,
    operation: 'read' | 'create' | 'delete'
  ): Promise<void> {
    const validatedPath = await this.validatePath(dirPath);
    const config = this.configManager.getConfig();

    // Check read-only mode
    if (config.security.readOnlyMode && ['create', 'delete'].includes(operation)) {
      throw new PathValidationError(
        'Server is in read-only mode',
        'READ_ONLY_MODE'
      );
    }

    // Check directory depth
    const rootPaths = config.security.allowedRootPaths;
    const nearestRoot = rootPaths.find(root => 
      validatedPath.startsWith(path.resolve(root))
    );

    if (nearestRoot) {
      const relativePath = path.relative(path.resolve(nearestRoot), validatedPath);
      const depth = relativePath.split(path.sep).length;
      
      if (depth > config.security.maxDirectoryDepth) {
        throw new PathValidationError(
          `Directory depth exceeds limit: ${config.security.maxDirectoryDepth}`,
          'DEPTH_EXCEEDED'
        );
      }
    }

    // Check if directory exists for read/delete operations
    if (['read', 'delete'].includes(operation)) {
      const exists = await fs.pathExists(validatedPath);
      if (!exists) {
        throw new PathValidationError(
          'Directory not found',
          'DIRECTORY_NOT_FOUND'
        );
      }
    }
  }

  /**
   * Sanitize file content for security
   */
  public sanitizeContent(content: string, mimeType?: string): string {
    // Remove null bytes that could cause issues
    let sanitized = content.replace(/\0/g, '');

    // For specific file types, apply additional sanitization
    if (mimeType?.includes('text') || mimeType?.includes('json')) {
      // Remove potentially dangerous control characters
      sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    }

    return sanitized;
  }

  /**
   * Check if a path represents a binary file
   */
  public async isBinaryFile(filePath: string): Promise<boolean> {
    try {
      const buffer = await fs.readFile(filePath, { flag: 'r' });
      const chunk = buffer.slice(0, 8000);
      
      // Check for null bytes (common in binary files)
      for (let i = 0; i < chunk.length; i++) {
        if (chunk[i] === 0) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate safe file listing with security filtering
   */
  public async getSecureDirectoryListing(
    dirPath: string,
    includeHidden: boolean = false
  ): Promise<Array<{
    name: string;
    type: 'file' | 'directory';
    size?: number;
    modified?: Date;
    accessible: boolean;
  }>> {
    const validatedPath = await this.validatePath(dirPath);
    const config = this.configManager.getConfig();
    
    try {
      const items = await fs.readdir(validatedPath, { withFileTypes: true });
      const result: Array<{
        name: string;
        type: 'file' | 'directory';
        size?: number;
        modified?: Date;
        accessible: boolean;
      }> = [];

      for (const item of items) {
        const itemPath = path.join(validatedPath, item.name);
        
        // Skip hidden files unless explicitly requested
        if (!includeHidden && item.name.startsWith('.')) {
          continue;
        }

        // Check if item is accessible based on security rules
        const accessible = this.configManager.isPathAllowed(itemPath) &&
          (item.isDirectory() || this.configManager.isFileExtensionAllowed(itemPath));

        let size: number | undefined;
        let modified: Date | undefined;

        if (accessible) {
          try {
            const stats = await fs.stat(itemPath);
            size = item.isFile() ? stats.size : undefined;
            modified = stats.mtime;
          } catch (error) {
            // Item might have been deleted or is inaccessible
          }
        }

        result.push({
          name: item.name,
          type: item.isDirectory() ? 'directory' : 'file',
          ...(size !== undefined && { size }),
          ...(modified !== undefined && { modified }),
          accessible,
        });
      }

      // Limit the number of items returned
      return result.slice(0, config.limits.maxFilesPerRequest);
    } catch (error) {
      throw new PathValidationError(
        `Failed to read directory: ${(error as Error).message}`,
        'DIRECTORY_READ_ERROR'
      );
    }
  }
}

export const createSecurityValidator = (configManager: ConfigManager): SecurityValidator => {
  return new SecurityValidator(configManager);
}; 