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
 * Serialize settings to a formatted JSON string with 2-space indentation.
 */
export function serializeSettings(settings: ClaudeSettings): string {
    return JSON.stringify(settings, null, 2);
}
