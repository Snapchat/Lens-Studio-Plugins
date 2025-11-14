#!/usr/bin/env node

/**
 * Lens Studio MCP Proxy Server
 *
 * This server bridges Claude Desktop (stdio transport) to Lens Studio's HTTP MCP server.
 * It automatically requests authentication from Lens Studio on first connection.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Hard-coded port for Lens Studio MCP server
const LENS_STUDIO_PORT = 50050;
const TOKEN_FILE = '.lens_studio_auth_token.json';

class LensStudioProxyServer {
  constructor() {
    this.server = new Server(
      {
        name: 'lens-studio',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.baseUrl = `http://localhost:${LENS_STUDIO_PORT}/mcp`;
    this.authToken = null;
    this.isAuthenticating = false;

    this.setupHandlers();
  }

  /**
   * Load saved auth token from file
   */
  async loadToken() {
    try {
      const tokenPath = join(dirname(__dirname), TOKEN_FILE);
      const tokenData = await readFile(tokenPath, 'utf-8');
      const data = JSON.parse(tokenData);

      if (data.authToken) {
        this.authToken = data.authToken;
        console.error('[Lens Studio Proxy] Loaded saved authentication token');
        return true;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('[Lens Studio Proxy] Error loading token:', error.message);
      }
    }
    return false;
  }

  /**
   * Save auth token to file
   */
  async saveToken(token) {
    try {
      const tokenPath = join(dirname(__dirname), TOKEN_FILE);
      const data = { authToken: token };
      await writeFile(tokenPath, JSON.stringify(data, null, 2), 'utf-8');
      console.error('[Lens Studio Proxy] Saved authentication token');
    } catch (error) {
      console.error('[Lens Studio Proxy] Error saving token:', error.message);
    }
  }

  /**
   * Request authentication from Lens Studio
   */
  async requestAuth() {
    if (this.isAuthenticating) {
      console.error('[Lens Studio Proxy] Authentication already in progress');
      return false;
      }

    this.isAuthenticating = true;

    try {
      console.error('[Lens Studio Proxy] Requesting authentication from Lens Studio...');

      const authUrl = `http://localhost:${LENS_STUDIO_PORT}/mcp/request-auth`;
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: 'Claude Desktop',
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const result = await response.json();

      if (result.token) {
        this.authToken = result.token;
        await this.saveToken(result.token);
        console.error('[Lens Studio Proxy] ✅ Authentication successful!');
      return true;
      } else {
        throw new Error('No token in response');
      }
    } catch (error) {
      console.error('[Lens Studio Proxy] Authentication failed:', error.message);
      if (error.cause?.code === 'ECONNREFUSED') {
        console.error('[Lens Studio Proxy] Is Lens Studio running with the MCP server enabled?');
      }
      return false;
    } finally {
      this.isAuthenticating = false;
    }
  }

  /**
   * Ensure we have a valid auth token
   */
  async ensureAuthenticated() {
    // Try loading saved token first
    if (!this.authToken) {
      await this.loadToken();
    }

    // If still no token, request authentication
    if (!this.authToken) {
      const success = await this.requestAuth();
      if (!success) {
        throw new Error(
          'Authentication required. Please start Lens Studio with MCP server enabled and approve the connection request.'
        );
      }
    }
  }

  /**
   * Make HTTP request to Lens Studio MCP server
   */
  async makeHttpRequest(jsonRpcRequest, isRetry = false) {
    // Ensure we're authenticated before making requests
    await this.ensureAuthenticated();

    try {
      console.error('[Lens Studio Proxy] Making HTTP request to:', this.baseUrl);
      console.error('[Lens Studio Proxy] Request body:', JSON.stringify(jsonRpcRequest));

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
          'MCP-Protocol-Version': '2025-06-18'
        },
        body: JSON.stringify(jsonRpcRequest),
      });

      console.error('[Lens Studio Proxy] HTTP status:', response.status);

      if (response.status === 401 && !isRetry) {
        // Token might have been invalidated, clear it and try to re-authenticate
        console.error('[Lens Studio Proxy] Token invalid, requesting new authentication...');
        this.authToken = null;
        const authSuccess = await this.requestAuth();

        if (!authSuccess) {
          throw new Error('Failed to re-authenticate after 401 response');
        }

        // Retry the request once with new token
        return await this.makeHttpRequest(jsonRpcRequest, true);
      }

      if (response.status === 401 && isRetry) {
        throw new Error('Authentication failed: Token rejected even after re-authentication');
      }

      if (!response.ok) {
        const text = await response.text();
        console.error('[Lens Studio Proxy] HTTP error response:', text);
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const responseText = await response.text();
      console.error('[Lens Studio Proxy] Raw HTTP response:', responseText);

      const jsonResponse = JSON.parse(responseText);
      console.error('[Lens Studio Proxy] Parsed JSON response:', JSON.stringify(jsonResponse));

      return jsonResponse;
    } catch (error) {
      console.error('[Lens Studio Proxy] HTTP request error:', error);
      if (error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED') {
        throw new Error(
          `Cannot connect to Lens Studio at localhost:${LENS_STUDIO_PORT}. ` +
          'Is Lens Studio running with the MCP server enabled?'
        );
      }
      throw error;
    }
  }

  setupHandlers() {
    // Handle tools/list requests
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        console.error('[Lens Studio Proxy] Received tools/list request');

        const jsonRpcRequest = {
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/list',
          params: {}
        };

        console.error('[Lens Studio Proxy] Sending HTTP request:', JSON.stringify(jsonRpcRequest));
        const response = await this.makeHttpRequest(jsonRpcRequest);
        console.error('[Lens Studio Proxy] Received HTTP response:', JSON.stringify(response));

        if (response.error) {
          console.error('[Lens Studio Proxy] Error from Lens Studio:', response.error);
          return { tools: [] };
        }

        const result = response.result || { tools: [] };
        console.error('[Lens Studio Proxy] Returning to Claude Desktop:', JSON.stringify(result));
        console.error('[Lens Studio Proxy] Number of tools:', result.tools?.length || 0);

        return result;
      } catch (error) {
        console.error('[Lens Studio Proxy] Failed to list tools:', error.message);
        console.error('[Lens Studio Proxy] Error stack:', error.stack);
        // Return empty tools list on error to prevent MCP protocol errors
        return { tools: [] };
      }
    });

    // Handle tools/call requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const jsonRpcRequest = {
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: name,
            arguments: args || {}
          }
        };

        const response = await this.makeHttpRequest(jsonRpcRequest);

        if (response.error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error from Lens Studio: ${response.error.message || JSON.stringify(response.error)}`
              }
            ],
            isError: true
          };
        }

        // Forward the result from Lens Studio
        return response.result;
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Proxy error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async run() {
    // Try to load saved token (doesn't fail if not found)
    await this.loadToken();

    // If no token, request authentication before connecting to Claude Desktop
    if (!this.authToken) {
      console.error('[Lens Studio Proxy] No saved token - requesting authentication from Lens Studio...');
      const authSuccess = await this.requestAuth();

      if (!authSuccess) {
        throw new Error(
          'Failed to authenticate with Lens Studio. ' +
          'Please ensure Lens Studio 5.15 or later is running and try again.'
        );
      }
    }

    // Start stdio transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('[Lens Studio Proxy] Server running on stdio');
    console.error('[Lens Studio Proxy] Forwarding to:', this.baseUrl);
  }
}

// Start the server
const server = new LensStudioProxyServer();
server.run().catch((error) => {
  console.error('[Lens Studio Proxy] Fatal error:', error);
  process.exit(1);
});
