# StockPulse MCP Filesystem Server

## 🚀 Enterprise-Grade MCP Server for Secure Filesystem Access

This is a **Model Context Protocol (MCP)** server that provides secure, enterprise-grade filesystem access to MCP clients. Built following the [MCP specification](https://spec.modelcontextprotocol.io/specification/2024-11-05/) with JSON-RPC 2.0 protocol implementation.

### Key Features

- **🔒 Enterprise Security**: Path validation, access controls, and audit logging
- **🏗️ MCP Compliant**: Full implementation of MCP tools and resources
- **📁 Comprehensive Operations**: Browse, read, write, delete, search filesystem operations
- **🛡️ Safety First**: Sandboxed access with configurable restrictions
- **📊 Monitoring**: Structured logging and audit trails
- **⚡ Performance**: Rate limiting and resource management

## Architecture

Based on the [MCP Architecture](https://medium.com/@nimritakoul01/the-model-context-protocol-mcp-a-complete-tutorial-a3abe8a7f4ef), this server:

- **Exposes Tools**: File operations via standardized MCP tool interface
- **Provides Resources**: File contents and directory listings via URI-based resources
- **Follows Security**: Enterprise-grade access controls and validation
- **Uses JSON-RPC 2.0**: Standard protocol for client-server communication

## Quick Start

### 1. Installation

```bash
cd mcp-servers/filesystem-server
npm install
npm run build
```

### 2. Basic Usage

```bash
# Start the server (stdio transport)
npm start

# Development mode with watch
npm run dev
```

### 3. Configuration

Create a custom configuration file:

```json
{
  "security": {
    "allowedRootPaths": ["/path/to/your/project"],
    "readOnlyMode": false,
    "maxFileSize": 10485760
  },
  "logging": {
    "level": "info",
    "enableConsole": true
  }
}
```

Set the config path:
```bash
export MCP_FILESYSTEM_CONFIG=/path/to/config.json
npm start
```

## MCP Tools Available

### 1. `browse_directory`
Browse directory contents with security filtering.

```json
{
  "name": "browse_directory",
  "arguments": {
    "path": "/project/src",
    "includeHidden": false,
    "recursive": false
  }
}
```

### 2. `read_file`
Read file contents with validation and encoding support.

```json
{
  "name": "read_file",
  "arguments": {
    "path": "/project/src/app.ts",
    "encoding": "utf8",
    "maxSize": 1048576
  }
}
```

### 3. `write_file`
Write content to files with backup and validation.

```json
{
  "name": "write_file",
  "arguments": {
    "path": "/project/src/new-file.ts",
    "content": "// TypeScript code here",
    "createDirectories": true,
    "backup": true
  }
}
```

### 4. `delete_file`
Delete files or directories with optional backup.

```json
{
  "name": "delete_file",
  "arguments": {
    "path": "/project/temp/old-file.txt",
    "recursive": false,
    "backup": true
  }
}
```

### 5. `get_file_info`
Get detailed metadata about files or directories.

```json
{
  "name": "get_file_info",
  "arguments": {
    "path": "/project/package.json"
  }
}
```

### 6. `search_files`
Search for files matching patterns.

```json
{
  "name": "search_files",
  "arguments": {
    "rootPath": "/project/src",
    "pattern": "*.ts",
    "type": "file",
    "maxResults": 50
  }
}
```

## MCP Resources Available

### File Resources
Access file contents directly via URI:
```
file:///absolute/path/to/file.txt
```

### Directory Resources
Get directory listings via URI:
```
directory:///absolute/path/to/directory
```

### Metadata Resources
Get file/directory metadata via URI:
```
metadata:///absolute/path/to/item
```

### System Resources
Server information and capabilities:
```
system://filesystem-server/info
system://filesystem-server/capabilities
```

## Security Features

### Path Validation
- **Directory Traversal Protection**: Prevents `../` attacks
- **Allowed Path Enforcement**: Restricts access to configured directories
- **Extension Filtering**: Controls which file types can be accessed

### Access Controls
- **Read-Only Mode**: Disable write operations entirely
- **File Size Limits**: Prevent reading/writing large files
- **Directory Depth Limits**: Control recursion depth
- **Pattern Blocking**: Block access to sensitive files (`.env`, `.git`, etc.)

### Audit Logging
- **Operation Logging**: All file operations logged with context
- **Error Tracking**: Security violations and errors tracked
- **Structured Logs**: JSON format for analysis and monitoring

## Configuration Reference

### Server Configuration
```typescript
{
  server: {
    name: string;           // Server identifier
    version: string;        // Server version
    port?: number;         // Optional port (for future HTTP transport)
    host?: string;         // Optional host (for future HTTP transport)
  }
}
```

### Security Configuration
```typescript
{
  security: {
    allowedRootPaths: string[];      // Permitted root directories
    readOnlyMode: boolean;           // Disable write operations
    maxFileSize: number;             // Max file size in bytes
    maxDirectoryDepth: number;       // Max recursion depth
    allowedFileExtensions: string[]; // Permitted file extensions
    blockedPatterns: string[];       // Blocked path patterns
    enableAuditLog: boolean;         // Enable audit logging
  }
}
```

### Features Configuration
```typescript
{
  features: {
    enableFileWatch: boolean;         // File change notifications
    enableSearch: boolean;            // Search functionality
    enableBinaryFiles: boolean;       // Binary file support
    cacheDirectoryListings: boolean;  // Directory caching
  }
}
```

### Limits Configuration
```typescript
{
  limits: {
    maxFilesPerRequest: number;      // Max files returned per request
    maxConcurrentOperations: number; // Max concurrent operations
    rateLimitPerMinute: number;      // Rate limit per minute
  }
}
```

## Integration Examples

### Using with Cursor IDE

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["/path/to/mcp-servers/filesystem-server/dist/index.js"],
      "env": {
        "MCP_FILESYSTEM_CONFIG": "/path/to/config.json"
      }
    }
  }
}
```

### Using with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["/path/to/mcp-servers/filesystem-server/dist/index.js"]
    }
  }
}
```

### Using with Custom MCP Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/path/to/filesystem-server/dist/index.js']
});

const client = new Client({
  name: 'my-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);

// Use the filesystem tools
const result = await client.callTool({
  name: 'browse_directory',
  arguments: { path: '/project' }
});
```

## Default Security Settings

The server comes with secure defaults:

### Allowed File Extensions
- Source code: `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.sql`
- Documentation: `.md`, `.txt`, `.json`, `.yml`, `.yaml`
- Configuration: `.env.example`, `.gitignore`
- Assets: `.css`, `.html`, `.svg`, `.png`, `.jpg`

### Blocked Patterns
- Dependencies: `**/node_modules/**`, `**/dist/**`
- Version control: `**/.git/**`
- Secrets: `**/.env`, `**/*.key`, `**/*.pem`
- Logs: `**/*.log`
- Build artifacts: `**/build/**`, `**/.next/**`

### Size Limits
- Max file size: 10MB
- Max directory depth: 10 levels
- Max files per request: 100

## Troubleshooting

### Common Issues

1. **"Access denied" errors**
   - Check that paths are within `allowedRootPaths`
   - Verify file extensions are in `allowedFileExtensions`
   - Ensure paths don't match `blockedPatterns`

2. **"File too large" errors**
   - Increase `maxFileSize` in configuration
   - Use streaming for large files

3. **Permission errors**
   - Ensure the server process has filesystem permissions
   - Check file/directory ownership and permissions

### Debug Mode

Enable debug logging:

```json
{
  "logging": {
    "level": "debug",
    "enableConsole": true
  }
}
```

### Health Check

Check server capabilities:

```bash
# Using the system resource
curl -X POST -H "Content-Type: application/json" \
  -d '{"method":"resources/read","params":{"uri":"system://filesystem-server/info"}}' \
  http://localhost:3001/mcp
```

## Development

### Project Structure

```
mcp-servers/filesystem-server/
├── src/
│   ├── config/          # Configuration management
│   ├── security/        # Security validation
│   ├── tools/          # MCP tools implementation
│   ├── resources/      # MCP resources implementation
│   └── index.ts        # Main server entry point
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

### Build Commands

```bash
npm run build      # Compile TypeScript
npm run dev        # Development with watch
npm run test       # Run tests
npm run lint       # Lint code
npm run type-check # TypeScript checking
```

### Testing

```bash
npm test
```

## Contributing

1. Follow TypeScript strict mode
2. Maintain enterprise security standards
3. Add comprehensive tests for new features
4. Update documentation for changes
5. Follow existing code patterns

## License

MIT License - Part of the StockPulse project.

## References

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/specification/2024-11-05/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Tutorial](https://medium.com/@nimritakoul01/the-model-context-protocol-mcp-a-complete-tutorial-a3abe8a7f4ef)
- [StockPulse Architecture](../../docs/architecture/)

---

🚀 **Built for StockPulse - Enterprise-Grade Financial Trading Platform** 