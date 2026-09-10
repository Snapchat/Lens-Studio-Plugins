/**
 * Snap Cloud (Supabase) MCP utilities.
 */

import { McpServerConfig } from "../../mcpUtils.js";

/**
 * Fixed MCP server name
 */
export const SNAP_CLOUD_SERVER_NAME = "supabase";

/** Hosted Snap Cloud MCP endpoint. */
export const SNAP_CLOUD_MCP_BASE_URL = "https://cloudapi.snap.com/mcp";

/**
 * Build the Snap Cloud MCP server config: account-level read-only, no auth
 * header. `supabase` is also a conventional user-owned server name, so an
 * existing entry is always preserved regardless of its endpoint or shape.
 */
export function buildSnapCloudServerConfig(): McpServerConfig {
    return {
        type: "http",
        url: `${SNAP_CLOUD_MCP_BASE_URL}?read_only=true`,
        shouldOverwrite: () => false,
    };
}
