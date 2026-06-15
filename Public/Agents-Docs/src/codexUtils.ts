import { McpServerConfig } from "./mcpUtils.js";

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
 * Build the Lens Studio managed block for `.codex/config.toml`.
 * Only includes `http_headers` when an Authorization header is present.
 */
export function buildManagedCodexConfig(
    serverName: string,
    serverConfig: McpServerConfig
): string {
    const lines = [
        CODEX_CONFIG_MANAGED_START,
        `[mcp_servers.${serverName}]`,
        `url = "${escapeTomlString(serverConfig.url)}"`,
    ];

    const authorization = serverConfig.headers?.Authorization ?? "";
    if (authorization.length > 0) {
        lines.push(
            `http_headers = { Authorization = "${escapeTomlString(authorization)}" }`
        );
    }
    lines.push(`default_tools_approval_mode = "approve"`);

    lines.push(CODEX_CONFIG_MANAGED_END);
    return lines.join("\n");
}

/**
 * Merge the Lens Studio managed block into an existing `.codex/config.toml`.
 * Returns null if the file contains malformed managed markers.
 */
export function mergeCodexConfig(
    existingContent: string | null,
    serverName: string,
    serverConfig: McpServerConfig
): string | null {
    const managedBlock = buildManagedCodexConfig(serverName, serverConfig);

    if (!existingContent || existingContent.trim().length === 0) {
        return managedBlock + "\n";
    }

    const startIndex = existingContent.indexOf(CODEX_CONFIG_MANAGED_START);
    const endIndex = existingContent.indexOf(CODEX_CONFIG_MANAGED_END);

    if (startIndex === -1 && endIndex === -1) {
        let merged = existingContent;
        if (!merged.endsWith("\n")) {
            merged += "\n";
        }
        merged += "\n" + managedBlock + "\n";
        return merged;
    }

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        return null;
    }

    const before = existingContent.slice(0, startIndex);
    const after = existingContent.slice(endIndex + CODEX_CONFIG_MANAGED_END.length);

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
