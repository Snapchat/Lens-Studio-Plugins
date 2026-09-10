import { McpServerConfig, McpServerEntry } from "./mcpUtils.js";

/** Marker comments used to identify the Lens Studio managed Codex config region. */
export const CODEX_CONFIG_MANAGED_START = "# BEGIN Lens Studio managed Codex block";
export const CODEX_CONFIG_MANAGED_END = "# END Lens Studio managed Codex block";

/**
 * Escape a value for use inside a TOML basic string.
 * Codex config only needs a small subset here because Lens Studio emits
 * plain HTTP URLs and bearer-token headers.
 */
function escapeTomlString(value: string): string {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
}

function startsWithLineBreak(value: string): boolean {
    return value.startsWith("\n") || value.startsWith("\r\n");
}

/**
 * Build the Multiple MCP servers block for `.codex/config.toml`.
 */
export function buildManagedCodexConfig(entries: McpServerEntry[]): string {
    const lines: string[] = [CODEX_CONFIG_MANAGED_START];

    entries.forEach((entry, index) => {
        if (index > 0) {
            lines.push("");
        }
        lines.push(...buildServerTable(entry.name, entry.config));
    });

    lines.push(CODEX_CONFIG_MANAGED_END);
    return lines.join("\n");
}

/**
 * Merge the Multiple MCP servers block into an existing `.codex/config.toml`.
 * Returns null if the file contains malformed managed markers.
 */
export function mergeCodexConfig(
    existingContent: string | null,
    entries: McpServerEntry[]
): string | null {
    if (!existingContent || existingContent.trim().length === 0) {
        return buildManagedCodexConfig(entries) + "\n";
    }

    const startIndex = existingContent.indexOf(CODEX_CONFIG_MANAGED_START);
    const endIndex = existingContent.indexOf(CODEX_CONFIG_MANAGED_END);

    if (startIndex === -1 && endIndex === -1) {
        const safeEntries = entries.filter(entry => !hasServerTable(existingContent, entry.name));
        if (safeEntries.length === 0) {
            return existingContent;
        }

        let merged = existingContent;
        if (!merged.endsWith("\n")) {
            merged += "\n";
        }
        merged += "\n" + buildManagedCodexConfig(safeEntries) + "\n";
        return merged;
    }

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        return null;
    }

    const before = existingContent.slice(0, startIndex);
    const after = existingContent.slice(endIndex + CODEX_CONFIG_MANAGED_END.length);

    // Preserve the developer's out-of-region tables; the managed region is ours.
    const managedBlock = buildManagedCodexConfig(
        entries.filter(entry => !hasServerTable(before + after, entry.name))
    );

    let merged = before;
    if (merged.length > 0 && !merged.endsWith("\n")) {
        merged += "\n";
    }
    merged += managedBlock;
    if (after.length > 0 && !startsWithLineBreak(after)) {
        merged += "\n";
    }
    merged += after;

    if (!merged.endsWith("\n")) {
        merged += "\n";
    }

    return merged;
}

/** Build the TOML table for a single MCP server entry. */
function buildServerTable(serverName: string, serverConfig: McpServerConfig): string[] {
    const lines = [
        `[mcp_servers.${serverName}]`,
        `url = "${escapeTomlString(serverConfig.url)}"`,
    ];

    const authorization = serverConfig.headers?.Authorization ?? "";
    if (authorization.length > 0) {
        lines.push(
            `http_headers = { Authorization = "${escapeTomlString(authorization)}" }`
        );
    }
    // TODO(snapcloud-allowlist): "writes" for supabase if removing read_only
    lines.push(`default_tools_approval_mode = "approve"`);

    return lines;
}

function hasServerTable(content: string, serverName: string): boolean {
    const escaped = serverName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const header = new RegExp(`^\\s*\\[\\s*mcp_servers\\s*\\.\\s*["']?${escaped}["']?\\s*\\]\\s*(#.*)?$`);
    return content.split(/\r?\n/).some(line => header.test(line));
}
