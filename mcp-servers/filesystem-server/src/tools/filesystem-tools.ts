/**
 * StockPulse MCP Filesystem Server - Tools Implementation
 * MCP tools for secure filesystem operations following JSON-RPC 2.0 specification
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs-extra";
import path from "path";
import mime from "mime-types";
import { ConfigManager } from "../config/server-config.js";
import {
  SecurityValidator,
  PathValidationError,
} from "../security/path-validator.js";

export interface FileSystemToolsContext {
  configManager: ConfigManager;
  securityValidator: SecurityValidator;
  logger: any; // Winston logger
}

/**
 * Browse directory contents
 */
export const browseDirectoryTool: Tool = {
  name: "browse_directory",
  description: "List contents of a directory with security filtering",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Directory path to browse",
      },
      includeHidden: {
        type: "boolean",
        description: "Include hidden files and directories",
        default: false,
      },
      recursive: {
        type: "boolean",
        description: "Browse subdirectories recursively",
        default: false,
      },
    },
    required: ["path"],
  },
};

export async function handleBrowseDirectory(
  args: { path: string; includeHidden?: boolean; recursive?: boolean },
  context: FileSystemToolsContext,
): Promise<any> {
  try {
    context.logger.info(`Browse directory request: ${args.path}`);

    await context.securityValidator.validateDirectoryOperation(
      args.path,
      "read",
    );

    const listing = await context.securityValidator.getSecureDirectoryListing(
      args.path,
      args.includeHidden || false,
    );

    const result = {
      path: args.path,
      items: listing,
      totalItems: listing.length,
      hasMore: false, // Could implement pagination here
    };

    // If recursive is requested, add subdirectories
    if (args.recursive) {
      const subdirs = listing.filter(
        (item) => item.type === "directory" && item.accessible,
      );
      for (const subdir of subdirs.slice(0, 5)) {
        // Limit recursive depth
        try {
          const subdirPath = path.join(args.path, subdir.name);
          const subdirListing =
            await context.securityValidator.getSecureDirectoryListing(
              subdirPath,
              args.includeHidden || false,
            );
          (result as any)[`subdirectory_${subdir.name}`] = subdirListing;
        } catch (error) {
          context.logger.warn(
            `Failed to read subdirectory ${subdir.name}: ${error}`,
          );
        }
      }
    }

    return result;
  } catch (error) {
    context.logger.error(`Browse directory error: ${error}`);
    throw error;
  }
}

/**
 * Read file contents
 */
export const readFileTool: Tool = {
  name: "read_file",
  description: "Read contents of a file with security validation",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "File path to read",
      },
      encoding: {
        type: "string",
        description: "File encoding (utf8, base64, etc.)",
        default: "utf8",
      },
      maxSize: {
        type: "number",
        description: "Maximum file size to read in bytes",
        default: 1048576, // 1MB
      },
    },
    required: ["path"],
  },
};

export async function handleReadFile(
  args: { path: string; encoding?: string; maxSize?: number },
  context: FileSystemToolsContext,
): Promise<any> {
  try {
    context.logger.info(`Read file request: ${args.path}`);

    await context.securityValidator.validateFileOperation(args.path, "read");

    const validatedPath = await context.securityValidator.validatePath(
      args.path,
    );
    const stats = await fs.stat(validatedPath);
    const maxSize = args.maxSize || 1048576;

    if (stats.size > maxSize) {
      throw new PathValidationError(
        `File size ${stats.size} exceeds maximum ${maxSize} bytes`,
        "FILE_TOO_LARGE",
      );
    }

    // Check if it's a binary file
    const isBinary =
      await context.securityValidator.isBinaryFile(validatedPath);
    const config = context.configManager.getConfig();

    if (isBinary && !config.features.enableBinaryFiles) {
      throw new PathValidationError(
        "Binary files are not allowed",
        "BINARY_NOT_ALLOWED",
      );
    }

    const encoding = args.encoding || (isBinary ? "base64" : "utf8");
    let content = await fs.readFile(validatedPath, encoding as any);

    // Sanitize content for security
    if (typeof content === "string" && !isBinary) {
      const mimeType = mime.lookup(validatedPath) || undefined;
      content = context.securityValidator.sanitizeContent(
        content,
        mimeType,
      ) as any;
    }

    return {
      path: args.path,
      content,
      encoding,
      size: stats.size,
      mimeType: mime.lookup(validatedPath) || "application/octet-stream",
      lastModified: stats.mtime.toISOString(),
      isBinary,
    };
  } catch (error) {
    context.logger.error(`Read file error: ${error}`);
    throw error;
  }
}

/**
 * Write file contents
 */
export const writeFileTool: Tool = {
  name: "write_file",
  description: "Write content to a file with security validation",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "File path to write",
      },
      content: {
        type: "string",
        description: "Content to write to the file",
      },
      encoding: {
        type: "string",
        description: "Content encoding (utf8, base64, etc.)",
        default: "utf8",
      },
      createDirectories: {
        type: "boolean",
        description: "Create parent directories if they do not exist",
        default: false,
      },
      backup: {
        type: "boolean",
        description: "Create backup of existing file",
        default: false,
      },
    },
    required: ["path", "content"],
  },
};

export async function handleWriteFile(
  args: {
    path: string;
    content: string;
    encoding?: string;
    createDirectories?: boolean;
    backup?: boolean;
  },
  context: FileSystemToolsContext,
): Promise<any> {
  try {
    context.logger.info(`Write file request: ${args.path}`);

    const validatedPath = await context.securityValidator.validatePath(
      args.path,
    );
    const exists = await fs.pathExists(validatedPath);

    await context.securityValidator.validateFileOperation(
      args.path,
      exists ? "write" : "create",
    );

    // Create directories if requested
    if (args.createDirectories) {
      await fs.ensureDir(path.dirname(validatedPath));
    }

    // Create backup if requested and file exists
    let backupPath: string | undefined;
    if (args.backup && exists) {
      backupPath = `${validatedPath}.backup.${Date.now()}`;
      await fs.copy(validatedPath, backupPath);
    }

    // Sanitize content
    const encoding = args.encoding || "utf8";
    let sanitizedContent = args.content;

    if (encoding === "utf8") {
      const mimeType = mime.lookup(validatedPath) || undefined;
      sanitizedContent = context.securityValidator.sanitizeContent(
        args.content,
        mimeType,
      );
    }

    // Write the file
    await fs.writeFile(validatedPath, sanitizedContent, encoding as any);

    const stats = await fs.stat(validatedPath);

    return {
      path: args.path,
      size: stats.size,
      encoding,
      lastModified: stats.mtime.toISOString(),
      created: !exists,
      backupPath,
    };
  } catch (error) {
    context.logger.error(`Write file error: ${error}`);
    throw error;
  }
}

/**
 * Delete file or directory
 */
export const deleteTool: Tool = {
  name: "delete_file",
  description: "Delete a file or directory with security validation",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to delete",
      },
      recursive: {
        type: "boolean",
        description: "Delete directories recursively",
        default: false,
      },
      backup: {
        type: "boolean",
        description: "Create backup before deletion",
        default: false,
      },
    },
    required: ["path"],
  },
};

export async function handleDelete(
  args: { path: string; recursive?: boolean; backup?: boolean },
  context: FileSystemToolsContext,
): Promise<any> {
  try {
    context.logger.info(`Delete request: ${args.path}`);

    const validatedPath = await context.securityValidator.validatePath(
      args.path,
    );
    const stats = await fs.stat(validatedPath);

    if (stats.isDirectory()) {
      await context.securityValidator.validateDirectoryOperation(
        args.path,
        "delete",
      );
    } else {
      await context.securityValidator.validateFileOperation(
        args.path,
        "delete",
      );
    }

    let backupPath: string | undefined;

    // Create backup if requested
    if (args.backup) {
      backupPath = `${validatedPath}.deleted.${Date.now()}`;
      if (stats.isDirectory()) {
        await fs.copy(validatedPath, backupPath);
      } else {
        await fs.copy(validatedPath, backupPath);
      }
    }

    // Perform deletion
    if (stats.isDirectory()) {
      if (args.recursive) {
        await fs.remove(validatedPath);
      } else {
        await fs.rmdir(validatedPath);
      }
    } else {
      await fs.unlink(validatedPath);
    }

    return {
      path: args.path,
      type: stats.isDirectory() ? "directory" : "file",
      size: stats.size,
      deleted: true,
      backupPath,
    };
  } catch (error) {
    context.logger.error(`Delete error: ${error}`);
    throw error;
  }
}

/**
 * Get file/directory information
 */
export const getInfoTool: Tool = {
  name: "get_file_info",
  description: "Get detailed information about a file or directory",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to get information about",
      },
    },
    required: ["path"],
  },
};

export async function handleGetInfo(
  args: { path: string },
  context: FileSystemToolsContext,
): Promise<any> {
  try {
    context.logger.info(`Get info request: ${args.path}`);

    const validatedPath = await context.securityValidator.validatePath(
      args.path,
    );
    const stats = await fs.stat(validatedPath);

    const result: any = {
      path: args.path,
      absolutePath: validatedPath,
      type: stats.isDirectory() ? "directory" : "file",
      size: stats.size,
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString(),
      accessed: stats.atime.toISOString(),
      permissions: {
        readable: true, // We already validated access
        writable: !context.configManager.getConfig().security.readOnlyMode,
        executable: false,
      },
      isHidden: path.basename(validatedPath).startsWith("."),
      extension: stats.isFile() ? path.extname(validatedPath) : undefined,
      mimeType: stats.isFile()
        ? mime.lookup(validatedPath) || "application/octet-stream"
        : undefined,
    };

    // Add directory-specific info
    if (stats.isDirectory()) {
      try {
        const items = await fs.readdir(validatedPath);
        result.itemCount = items.length;
      } catch (error) {
        result.itemCount = 0;
      }
    }

    // Add file-specific info
    if (stats.isFile()) {
      result.isBinary =
        await context.securityValidator.isBinaryFile(validatedPath);
    }

    return result;
  } catch (error) {
    context.logger.error(`Get info error: ${error}`);
    throw error;
  }
}

/**
 * Search for files and directories
 */
export const searchTool: Tool = {
  name: "search_files",
  description: "Search for files and directories matching patterns",
  inputSchema: {
    type: "object",
    properties: {
      rootPath: {
        type: "string",
        description: "Root directory to search from",
      },
      pattern: {
        type: "string",
        description: "Search pattern (glob or regex)",
      },
      type: {
        type: "string",
        enum: ["file", "directory", "both"],
        description: "Type of items to search for",
        default: "both",
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results to return",
        default: 50,
      },
      maxDepth: {
        type: "number",
        description: "Maximum directory depth to search",
        default: 5,
      },
    },
    required: ["rootPath", "pattern"],
  },
};

export async function handleSearch(
  args: {
    rootPath: string;
    pattern: string;
    type?: string;
    maxResults?: number;
    maxDepth?: number;
  },
  context: FileSystemToolsContext,
): Promise<any> {
  try {
    context.logger.info(`Search request: ${args.pattern} in ${args.rootPath}`);

    const config = context.configManager.getConfig();
    if (!config.features.enableSearch) {
      throw new PathValidationError(
        "Search feature is disabled",
        "FEATURE_DISABLED",
      );
    }

    await context.securityValidator.validateDirectoryOperation(
      args.rootPath,
      "read",
    );

    const validatedPath = await context.securityValidator.validatePath(
      args.rootPath,
    );
    const maxResults = Math.min(
      args.maxResults || 50,
      config.limits.maxFilesPerRequest,
    );
    const maxDepth = Math.min(
      args.maxDepth || 5,
      config.security.maxDirectoryDepth,
    );

    const results: any[] = [];

    // Convert pattern to regex
    const regexPattern = args.pattern.replace(/\*/g, ".*").replace(/\?/g, ".");
    const regex = new RegExp(regexPattern, "i");

    async function searchRecursive(
      currentPath: string,
      depth: number,
    ): Promise<void> {
      if (depth > maxDepth || results.length >= maxResults) {
        return;
      }

      try {
        const items = await fs.readdir(currentPath, { withFileTypes: true });

        for (const item of items) {
          if (results.length >= maxResults) break;

          const itemPath = path.join(currentPath, item.name);

          // Check security
          if (!context.configManager.isPathAllowed(itemPath)) {
            continue;
          }

          // Check if matches pattern
          if (regex.test(item.name)) {
            const itemType = item.isDirectory() ? "directory" : "file";

            if (args.type === "both" || args.type === itemType) {
              try {
                const stats = await fs.stat(itemPath);
                results.push({
                  path: itemPath,
                  relativePath: path.relative(validatedPath, itemPath),
                  name: item.name,
                  type: itemType,
                  size: item.isFile() ? stats.size : undefined,
                  modified: stats.mtime.toISOString(),
                  depth,
                });
              } catch (error) {
                // Skip inaccessible items
              }
            }
          }

          // Recurse into directories
          if (item.isDirectory() && depth < maxDepth) {
            await searchRecursive(itemPath, depth + 1);
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    }

    await searchRecursive(validatedPath, 0);

    return {
      rootPath: args.rootPath,
      pattern: args.pattern,
      results,
      totalFound: results.length,
      maxResults,
      searchComplete: results.length < maxResults,
    };
  } catch (error) {
    context.logger.error(`Search error: ${error}`);
    throw error;
  }
}

// Export all tools and handlers
export const allTools: Tool[] = [
  browseDirectoryTool,
  readFileTool,
  writeFileTool,
  deleteTool,
  getInfoTool,
  searchTool,
];

export const toolHandlers = {
  browse_directory: handleBrowseDirectory,
  read_file: handleReadFile,
  write_file: handleWriteFile,
  delete_file: handleDelete,
  get_file_info: handleGetInfo,
  search_files: handleSearch,
};
