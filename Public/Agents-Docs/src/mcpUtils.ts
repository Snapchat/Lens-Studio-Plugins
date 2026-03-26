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
 * Format: "lens-studio-{ProjectName}"
 */
export function buildServerName(projectName: string): string {
    return `lens-studio-${projectName}`;
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
 * Merge a new MCP server config into existing .mcp.json content.
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
    let data: McpJsonContent;

    try {
        if (existingContent && existingContent.trim().length > 0) {
            const parsed = JSON.parse(existingContent);
            data = {
                ...parsed,
                mcpServers: parsed.mcpServers || {}
            };
        } else {
            data = { mcpServers: {} };
        }
    } catch {
        data = { mcpServers: {} };
    }

    const filtered: { [key: string]: McpServerConfig } = {};
    for (const [key, value] of Object.entries(data.mcpServers)) {
        if (!key.startsWith('lens-studio-')) {
            filtered[key] = value as McpServerConfig;
        }
    }

    filtered[newServerName] = newServerConfig;

    return { ...data, mcpServers: filtered };
}

/**
 * Serialize MCP JSON content to a formatted string with 2-space indentation.
 */
export function serializeMcpJson(content: McpJsonContent): string {
    return JSON.stringify(content, null, 2);
}
