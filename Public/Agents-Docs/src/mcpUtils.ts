/**
 * MCP utilities for .mcp.json file manipulation.
 * Pure functions that handle extraction, transformation, and merging of MCP server configurations.
 */

export interface McpServerConfig {
    type: string;
    url: string;
    /**
     * Optional: remote servers that authenticate through custom OAuth flow
     */
    headers?: {
        Authorization?: string;
    };
    /**
     * Optional update policy. Given the server already present under the same
     * name, return true to overwrite it or false to keep the developer's.
     * Absent means always overwrite. Not serialized — JSON.stringify drops it.
     */
    shouldOverwrite?: (existing: McpServerConfig) => boolean;
}

/**
 * A named server to write into an MCP config file. Whether an existing server
 * of the same name is overwritten is decided by config.shouldOverwrite.
 */
export interface McpServerEntry {
    name: string;
    config: McpServerConfig;
}

export interface McpJsonContent {
    mcpServers: {
        [serverName: string]: McpServerConfig;
    };
    [key: string]: unknown;
}

/** VS Code uses "servers" instead of "mcpServers" as the top-level key. */
export interface VsCodeMcpJsonContent {
    servers: {
        [serverName: string]: McpServerConfig;
    };
    [key: string]: unknown;
}

/**
 * Extract the project name from a project file path.
 *
 * Examples:
 *   "/path/to/MyProject.lsproj" -> "MyProject"
 *   "C:\\Users\\Name\\Project.lsproj" -> "Project"
 *   "/path/to/My Project.esproj" -> "My Project"
 */
export function extractProjectName(projectFile: Editor.Path): string | null {
    try {
        const pathStr = projectFile.toString();
        const lastSlashIdx = Math.max(pathStr.lastIndexOf('/'), pathStr.lastIndexOf('\\'));
        const filename = lastSlashIdx >= 0 ? pathStr.substring(lastSlashIdx + 1) : pathStr;

        const lowerFilename = filename.toLowerCase();
        let projectName: string | null = null;
        if (lowerFilename.endsWith('.lsproj')) {
            projectName = filename.substring(0, filename.length - '.lsproj'.length);
        } else if (lowerFilename.endsWith('.esproj')) {
            projectName = filename.substring(0, filename.length - '.esproj'.length);
        } else {
            return null;
        }

        return projectName.length > 0 ? projectName : null;
    } catch {
        return null;
    }
}

/**
 * Build the MCP server name for a Lens Studio project.
 * Uses a fixed name so that agent tool references (mcp__lens-studio__*) always match.
 */
export function buildServerName(_projectName?: string): string {
    return "lens-studio";
}

export const MCP_RETRY_BASE_DELAY_MS = 250;
export const MCP_RETRY_MAX_DELAY_MS = 5000;

export function getMcpRetryDelayMs(
    attempt: number,
    baseDelayMs: number = MCP_RETRY_BASE_DELAY_MS,
    maxDelayMs: number = MCP_RETRY_MAX_DELAY_MS
): number {
    const normalizedAttempt = Math.max(0, Math.floor(attempt));
    const delay = baseDelayMs * Math.pow(2, normalizedAttempt);
    return Math.min(delay, maxDelayMs);
}

/**
 * Extract the lens-studio server config from the getConfig() API response
 * or from a flat URL/token snapshot built from the MCP server connection APIs.
 *
 * The LensStudio:Mcp getConfig() API returns:
 * {
 *   "mcpServers": {
 *     "lens-studio": {
 *       "type": "http",
 *       "url": "http://localhost:50049/mcp",
 *       "headers": { "Authorization": "Bearer <token>" }
 *     }
 *   }
 * }
 *
 * Returns null if the config structure is not recognized.
 */
export function extractServerConfig(mcpConfig: any): McpServerConfig | null {
    const serverConfig = mcpConfig?.mcpServers?.["lens-studio"];
    if (serverConfig?.url) {
        return {
            type: serverConfig.type || "http",
            url: serverConfig.url,
            headers: {
                Authorization: serverConfig.headers?.Authorization || ""
            }
        };
    }

    if (!mcpConfig?.url || !mcpConfig?.token) {
        return null;
    }

    return {
        type: mcpConfig.type || "http",
        url: mcpConfig.url,
        headers: {
            Authorization: `Bearer ${mcpConfig.token}`
        }
    };
}

/**
 * Merge server entries into existing JSON content under `serverKey`
 * ("mcpServers" or "servers"). Only the given names are (over)written; every
 * other server the developer configured is preserved.
 */
function _mergeServers(
    existingContent: string | null,
    entries: McpServerEntry[],
    serverKey: string
): Record<string, unknown> {
    let data: Record<string, unknown>;
    let servers: { [key: string]: McpServerConfig };

    try {
        if (existingContent && existingContent.trim().length > 0) {
            data = JSON.parse(existingContent);
            servers = (data[serverKey] as { [key: string]: McpServerConfig }) || {};
        } else {
            data = {};
            servers = {};
        }
    } catch {
        data = {};
        servers = {};
    }

    const filtered: { [key: string]: McpServerConfig } = {};
    for (const [key, value] of Object.entries(servers)) {
        // Drop stale per-project lens-studio-* keys (renames). Managed names are
        // overwritten in place below — stable key order keeps no-op passes no-ops.
        if (key.startsWith('lens-studio-')) {
            continue;
        }
        filtered[key] = value as McpServerConfig;
    }

    // Overwrite each entry in place (preserving position), or append if new.
    // A config may veto the overwrite (shouldOverwrite) to keep the developer's.
    for (const entry of entries) {
        const existing = filtered[entry.name];
        if (existing && entry.config.shouldOverwrite && !entry.config.shouldOverwrite(existing)) {
            continue;
        }
        filtered[entry.name] = entry.config;
    }

    return { ...data, [serverKey]: filtered };
}

/** Merge MCP server entries into .mcp.json content ("mcpServers" key). */
export function mergeMcpJson(
    existingContent: string | null,
    entries: McpServerEntry[]
): McpJsonContent {
    return _mergeServers(existingContent, entries, "mcpServers") as McpJsonContent;
}

/**
 * Merge MCP server configs into existing VS Code mcp.json content in one pass.
 * Uses "servers" key — same merge strategy, only the top-level key differs.
 */
export function mergeVsCodeMcpJson(
    existingContent: string | null,
    entries: McpServerEntry[]
): VsCodeMcpJsonContent {
    return _mergeServers(existingContent, entries, "servers") as VsCodeMcpJsonContent;
}

/**
 * Serialize MCP JSON content to a formatted string with 2-space indentation.
 */
export function serializeMcpJson(content: McpJsonContent | VsCodeMcpJsonContent): string {
    return JSON.stringify(content, null, 2);
}
