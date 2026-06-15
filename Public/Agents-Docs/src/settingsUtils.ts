/**
 * Claude Code settings.local.json utilities.
 * Pure functions for parsing, merging, and serializing Claude Code project-level settings.
 */

/** The marketplace config we inject. */
export const MARKETPLACE_NAME = "lens-studio-extensions";
export const MARKETPLACE_CONFIG = {
    source: {
        source: "github" as const,
        repo: "Snapchat/Lens-Studio-Plugins"
    }
};

export interface ClaudeSettings {
    extraKnownMarketplaces?: {
        [name: string]: unknown;
    };
    permissions?: {
        allow?: string[];
        deny?: string[];
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

/**
 * Parse a JSON string into a ClaudeSettings object.
 * Returns empty object on null, empty, or invalid input.
 */
export function parseSettings(content: string | null): ClaudeSettings {
    if (!content || content.trim().length === 0) {
        return {};
    }
    try {
        return JSON.parse(content) as ClaudeSettings;
    } catch {
        return {};
    }
}

/**
 * Merge the lens-studio-extensions marketplace into existing settings.
 * Preserves all existing keys and other marketplaces.
 */
export function mergeMarketplace(settings: ClaudeSettings): ClaudeSettings {
    return {
        ...settings,
        extraKnownMarketplaces: {
            ...settings.extraKnownMarketplaces,
            [MARKETPLACE_NAME]: MARKETPLACE_CONFIG
        }
    };
}

/**
 * Merge MCP server permission into existing settings.
 * Removes stale lens-studio MCP allow entries (both old per-project and new fixed names)
 * and adds the current server. Preserves all other allow/deny entries.
 */
export function mergePermissions(settings: ClaudeSettings, serverName: string): ClaudeSettings {
    const rawAllow = settings.permissions?.allow;
    const existingAllow = Array.isArray(rawAllow)
        ? rawAllow.filter((entry): entry is string => typeof entry === "string")
        : [];

    // Filter out all lens-studio MCP allow entries (old per-project "mcp__lens-studio-*" and new fixed "mcp__lens-studio")
    const filtered = existingAllow.filter(
        entry => !entry.startsWith("mcp__lens-studio")
    );

    // Add the new entry — normalize spaces to underscores to match
    // Claude Code's internal MCP server name normalization
    const normalized = serverName.replace(/ /g, "_");
    filtered.push(`mcp__${normalized}`);

    return {
        ...settings,
        permissions: {
            ...settings.permissions,
            allow: filtered
        }
    };
}

/**
 * Serialize settings to a formatted JSON string with 2-space indentation.
 */
export function serializeSettings(settings: ClaudeSettings): string {
    return JSON.stringify(settings, null, 2);
}
