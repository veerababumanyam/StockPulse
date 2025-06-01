# MCP Integration Tutorial

## Introduction

This tutorial provides a step-by-step guide to setting up and using the Anthropic Model Context Protocol (MCP) integration in StockPulse. Whether you're looking to connect to external MCP servers or expose your own capabilities, this guide will walk you through the process.

## Prerequisites

Before starting, ensure you have:

- StockPulse application installed and configured
- API keys for any external MCP servers you plan to connect to
- Basic understanding of the MCP concept and terminology

## Setting Up as an MCP Client

### Step 1: Access the MCP Setup Wizard

1. Log in to your StockPulse account
2. Navigate to **Agents** > **MCP Setup Wizard**
3. The wizard welcome screen will appear

### Step 2: Choose Client Configuration

1. Select the **MCP Client** option
2. Click **Next** to proceed to the configuration screen

### Step 3: Configure Connection Details

1. Enter a descriptive **Connection Name** (e.g., "Market Data Provider")
2. Enter the **Server URL** provided by the MCP server (e.g., "https://mcp.marketdata.example.com/sse")
3. Enter your **API Key** for authentication
4. Select the appropriate **Connection Type** based on your needs:
   - **Standard**: For regular usage
   - **Enterprise**: For high-volume, priority access
   - **Dedicated**: For exclusive, high-performance connections
5. Click **Next** to proceed

### Step 4: Select Capabilities

1. Browse the list of available capabilities from the server
2. Select the capabilities you want to use by clicking on them
3. Review your selections in the summary section
4. Click **Next** to proceed

### Step 5: Configure Performance & Security

1. Set **Max Connections** to control the connection pool size
2. Set **Max Requests/min** to control the rate limiting
3. Toggle **Enable Response Caching** if you want to cache responses
4. If caching is enabled, set the **Cache TTL** (time-to-live) in seconds
5. Toggle **Enable Mutual TLS** for enhanced security (requires certificates)
6. Select the appropriate **Security Level** based on your requirements
7. Click **Next** to proceed

### Step 6: Review & Complete

1. Review all your configuration settings
2. Click **Complete Setup** to finalize the connection
3. You'll be redirected to the MCP Federation Registry page where your new connection will be visible

## Setting Up as an MCP Server

### Step 1: Access the MCP Setup Wizard

1. Log in to your StockPulse account
2. Navigate to **Agents** > **MCP Setup Wizard**
3. The wizard welcome screen will appear

### Step 2: Choose Server Configuration

1. Select the **MCP Server** option
2. Click **Next** to proceed to the configuration screen

### Step 3: Configure Server Details

1. Enter a descriptive **Connection Name** (e.g., "StockPulse Analysis Server")
2. Enter a **Server Description** to help clients understand your server's purpose
3. Set the **Server Port** (default: 8080)
4. Set the **Server Path** (default: /mcp/sse)
5. Select the appropriate **Security Level** based on your requirements
6. Click **Next** to proceed

### Step 4: Configure Server Capabilities

1. Select the capabilities you want to expose from your StockPulse instance
2. Each capability represents a set of related functions (e.g., Market Data, Technical Analysis)
3. Review your selections in the summary section
4. Click **Next** to proceed

### Step 5: Configure Security Settings

1. Select the **Authentication Method** you want to use:
   - **Mutual TLS + JWT**: Highest security with certificate and token authentication
   - **TLS + API Key**: Standard security with API key authentication
   - **API Key Only**: Basic security with just API key authentication
2. Toggle **Enable Mutual TLS** if you want certificate-based authentication
3. Configure **IP Allowlisting** if you want to restrict access by IP address
4. Set **Rate Limiting** parameters to prevent abuse
5. Click **Next** to proceed

### Step 6: Review & Complete

1. Review all your configuration settings
2. Click **Complete Setup** to finalize the server configuration
3. You'll be redirected to the MCP Observability page where you can monitor your server

## Using the MCP Capability Mapping

The Capability Mapping provides a visual representation of your MCP connections, servers, and capabilities.

### Viewing the Map

1. Navigate to **Agents** > **MCP Capability Mapping**
2. The main view shows a graph of clients, servers, and capabilities
3. Use the controls to zoom, pan, and adjust the view

### Filtering and Searching

1. Use the **Search** box to find specific nodes by name or description
2. Use the **Status** filter to show only active or inactive connections
3. Use the **Capability Type** filter to focus on specific capability types
4. Toggle **Show/Hide Capabilities** to simplify the view if needed
5. Switch between **Horizontal** and **Vertical** layouts based on your preference

### Working with Nodes

1. Click on any node to view its details in the sidebar
2. For server nodes, you can see connected clients and available capabilities
3. For client nodes, you can see connected servers
4. For capability nodes, you can see which server provides them
5. Use the action buttons in the details panel to configure or test connections

### Exporting the Map

1. Click the **Export Map** button to save the current map as a JSON file
2. This file can be used for documentation or sharing with team members

## Managing Mobile Access

The Mobile Management interface allows you to control how MCP connections work on mobile devices.

### Configuring Connections for Mobile

1. Navigate to **Agents** > **MCP Mobile Management**
2. In the **Connections** tab, you'll see all your MCP connections
3. For each connection, toggle **Mobile Access** to enable or disable mobile access
4. Toggle **Notifications** to enable or disable notifications for this connection
5. Use the **Sync Now** button to manually synchronize data
6. Click **View Details** to see more information about the connection

### Managing Notifications

1. Switch to the **Notifications** tab
2. View all notifications related to your MCP connections
3. Click **Mark All Read** to mark all notifications as read
4. Click **Clear All** to remove all notifications
5. For individual notifications, use the action buttons to mark as read or view details

### Configuring Mobile Settings

1. Switch to the **Settings** tab
2. In the **Notification Settings** section:
   - Toggle **Push Notifications** to enable or disable all notifications
   - Configure which types of alerts you want to receive
   - Set the **Notification Frequency** (Real-time, Hourly, or Daily)
3. In the **Mobile Settings** section:
   - Toggle **Data Saver Mode** to reduce data usage on cellular networks
   - Toggle **Offline Mode** to use cached data when offline
   - Set the **Sync Frequency** to control how often data is synchronized
4. In the **Display Settings** section:
   - Choose between **Compact** and **Expanded** layouts
   - Choose between **Standard** and **High Contrast** color schemes
   - Choose between **Minimal** and **Detailed** notification styles

## Troubleshooting

### Connection Issues

If you're having trouble connecting to an MCP server:

1. Verify the server URL is correct and accessible
2. Check that your API key is valid and has not expired
3. Ensure your network allows the connection (no firewall blocking)
4. Check the server's health status in the Capability Mapping
5. Try the **Test Connection** button in the connection details

### Performance Issues

If you're experiencing slow performance:

1. Increase the **Max Connections** setting for the connection
2. Enable **Response Caching** to reduce repeated requests
3. Check if the server is experiencing high load
4. Consider switching to a more powerful connection type if available

### Security Alerts

If you receive security alerts:

1. Check the notification details for specific information
2. Verify your authentication settings are correct
3. Ensure your certificates are valid and not expired (for Mutual TLS)
4. Check for any IP restrictions that might be blocking your access

## Next Steps

After setting up your MCP connections, consider:

1. Exploring the **MCP Federation Registry** to discover more servers
2. Setting up **Model Orchestration** to coordinate multiple AI models
3. Configuring **Compliance and Governance** settings for regulatory requirements
4. Reviewing the **Observability Dashboard** to monitor performance and health

For more detailed information, refer to the comprehensive [MCP Integration Documentation](./mcp-integration-documentation.md).

---

This tutorial covers the basics of setting up and using the MCP integration in StockPulse. For advanced usage scenarios or specific questions, please contact the StockPulse support team.
