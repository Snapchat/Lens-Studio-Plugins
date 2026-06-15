/**
 * MCP utilities for .mcp.json file manipulation.
 * Pure functions that handle extraction, transformation, and merging of MCP server configurations.
 */

export interface McpServerConfig {
    type: string;
    url: string;
    headers: {
        Authorization: string;
    };
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

/**
 * Extract the lens-studio server config from the getConfig() API response.
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
    if (!serverConfig || !serverConfig.url) {
        return null;
    }

    return {
        type: serverConfig.type || "http",
        url: serverConfig.url,
        headers: {
            Authorization: serverConfig.headers?.Authorization || ""
        }
    };
}

/**
 * Internal helper: merge a new MCP server config into existing JSON content
 * using the specified server key (e.g., "mcpServers" or "servers").
 */
function _mergeServers(
    existingContent: string | null,
    newServerName: string,
    newServerConfig: McpServerConfig,
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
        // Remove any previous lens-studio entry (both old per-project and new fixed names)
        if (key !== newServerName && !key.startsWith('lens-studio-')) {
            filtered[key] = value as McpServerConfig;
        }
    }

    filtered[newServerName] = newServerConfig;

    return { ...data, [serverKey]: filtered };
}

/**
 * Merge a new MCP server config into existing .mcp.json content.
 * Uses "mcpServers" key (Claude Code / Cursor format).
 *
 * Strategy:
 * 1. Parse existing JSON (or start with empty structure)
 * 2. Filter out all old lens-studio-* entries (handles project renames)
 * 3. Add the new server entry
 * 4. Preserve non-lens-studio servers and other top-level keys
 */
export function mergeMcpJson(
    existingContent: string | null,
    newServerName: string,
    newServerConfig: McpServerConfig
): McpJsonContent {
    return _mergeServers(existingContent, newServerName, newServerConfig, "mcpServers") as McpJsonContent;
}

/**
 * Merge a new MCP server config into existing VS Code mcp.json content.
 * Uses "servers" key (VS Code format).
 *
 * Same merge strategy as mergeMcpJson — only the top-level key differs.
 */
export function mergeVsCodeMcpJson(
    existingContent: string | null,
    newServerName: string,
    newServerConfig: McpServerConfig
): VsCodeMcpJsonContent {
    return _mergeServers(existingContent, newServerName, newServerConfig, "servers") as VsCodeMcpJsonContent;
}

/**
 * Serialize MCP JSON content to a formatted string with 2-space indentation.
 */
export function serializeMcpJson(content: McpJsonContent | VsCodeMcpJsonContent): string {
    return JSON.stringify(content, null, 2);
}
