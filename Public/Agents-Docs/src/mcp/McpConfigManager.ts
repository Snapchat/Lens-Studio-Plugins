import * as FileSystem from "LensStudio:FileSystem";
import { IMcpServer } from "LensStudio:Mcp";

import {
    extractProjectName,
    buildServerName,
    extractServerConfig,
    mergeMcpJson,
    mergeVsCodeMcpJson,
    serializeMcpJson,
    getMcpRetryDelayMs,
    McpServerConfig,
    McpJsonContent,
    VsCodeMcpJsonContent
} from "../mcpUtils.js";
import {
    CODEX_CONFIG_MANAGED_START,
    mergeCodexConfig,
} from "../codexUtils.js";

/** Local type stub — the full IMcpServer definition lives in the C++ MCP bindings. */
interface McpServerApi {
    isRunning(): boolean;
    getConfig(): any;
    getServerUrl?(): string;
    getServerToken?(): string;
}

type McpUnavailableReason =
    | "interface-unavailable"
    | "server-uninitialized"
    | "server-not-running"
    | "config-unavailable"
    | "config-unrecognized"
    | "project-name-unavailable";

type LiveMcpServerInfo = {
    projectName: string;
    serverName: string;
    serverConfig: McpServerConfig;
};

type McpInfoResolution =
    | { status: "ready"; info: LiveMcpServerInfo }
    | { status: "unavailable"; reason: McpUnavailableReason; retryable: boolean };

type McpConfigUpdateResult =
    | { status: "updated" }
    | { status: "skipped"; reason: McpUnavailableReason; retryable: boolean }
    | { status: "failed"; error: unknown };

/**
 * Writes MCP-backed config files (.mcp.json, .cursor/mcp.json, .vscode/mcp.json,
 * .codex/config.toml) for the live Lens Studio MCP server, retrying for a bounded
 * window while the server is still starting up.
 */
export class McpConfigManager {
    private static readonly MCP_RETRY_MAX_ATTEMPTS = 12;

    /** MCP config targets: path relative to project root, and which merge function to use. */
    private static readonly MCP_TARGETS: Array<{
        path: string;
        merge: (existing: string | null, name: string, config: McpServerConfig) => McpJsonContent | VsCodeMcpJsonContent;
    }> = [
        { path: ".mcp.json", merge: mergeMcpJson },              // Claude Code
        { path: ".cursor/mcp.json", merge: mergeMcpJson },       // Cursor
        { path: ".vscode/mcp.json", merge: mergeVsCodeMcpJson }, // VS Code
    ];

    /** Keeps delayed MCP config retries alive and cancellable across project switches. */
    private retryTimer: Timeout | null = null;
    private retryGeneration: number = 0;
    private retryAttempt: number = 0;
    private lastRetryReason: McpUnavailableReason | null = null;

    constructor(private readonly pluginSystem: Editor.PluginSystem) {}

    /** Invalidate any in-flight retry and reset state when a new project becomes ready. */
    resetForProjectReady(): void {
        this.retryGeneration++;
        this.clearRetryTimer();
        this.retryAttempt = 0;
        this.lastRetryReason = null;
    }

    /** Cancel any pending retry; call from the owning plugin's stop(). */
    stop(): void {
        this.retryGeneration++;
        this.clearRetryTimer();
    }

    /**
     * Write MCP-backed config files once immediately, then retry for a bounded
     * window when the Lens Studio MCP server is still starting up.
     */
    updateOrRetry(projectDir: Editor.Path, projectFile: Editor.Path): void {
        const result = this.tryUpdate(projectDir, projectFile);
        if (result.status === "updated") {
            this.resetAfterSuccess();
            return;
        }

        if (result.status === "failed") {
            console.error("[AgentsDocs] Error updating MCP config files:", result.error);
            return;
        }

        if (!result.retryable) {
            console.warn("[AgentsDocs] Could not update MCP config files: " + this.describeFailureReason(result.reason));
            return;
        }

        this.scheduleRetry(result.reason);
    }

    private tryUpdate(projectDir: Editor.Path, projectFile: Editor.Path): McpConfigUpdateResult {
        try {
            const resolution = this.resolveLiveMcpServerInfo(projectFile);
            if (resolution.status === "unavailable") {
                return { status: "skipped", reason: resolution.reason, retryable: resolution.retryable };
            }

            this.updateMcpJson(projectDir, resolution.info);
            this.updateCodexConfig(projectDir, resolution.info);
            return { status: "updated" };
        } catch (e) {
            return { status: "failed", error: e };
        }
    }

    /**
     * Resolve the live Lens Studio MCP server info for the current project.
     * Returns an unavailable outcome when MCP is not ready yet.
     */
    private resolveLiveMcpServerInfo(projectFile: Editor.Path): McpInfoResolution {
        const server = this.pluginSystem.findInterface(IMcpServer) as unknown as McpServerApi | null;
        if (!server || Editor.isNull(server)) {
            return { status: "unavailable", reason: "interface-unavailable", retryable: true };
        }

        // In CLI mode the server object may be uninitialized
        let isRunning = false;
        try {
            isRunning = server.isRunning();
        } catch {
            return { status: "unavailable", reason: "server-uninitialized", retryable: true };
        }

        if (!isRunning) {
            return { status: "unavailable", reason: "server-not-running", retryable: true };
        }

        let serverConfig: McpServerConfig | null = null;
        let sawConfig = false;
        try {
            const mcpConfig = server.getConfig();
            if (mcpConfig) {
                sawConfig = true;
                serverConfig = extractServerConfig(mcpConfig);
            }
        } catch {
            // Fall back to the connection accessors below.
        }
        serverConfig = serverConfig ?? this.extractServerConfigFromConnection(server);
        if (!serverConfig) {
            return {
                status: "unavailable",
                reason: sawConfig ? "config-unrecognized" : "config-unavailable",
                retryable: true,
            };
        }

        const projectName = extractProjectName(projectFile);
        if (!projectName) {
            return { status: "unavailable", reason: "project-name-unavailable", retryable: false };
        }

        return {
            status: "ready",
            info: {
                projectName,
                serverName: buildServerName(projectName),
                serverConfig,
            },
        };
    }

    /**
     * Build an MCP server config from the lower-level connection APIs when
     * getConfig() is temporarily unavailable or uses an unexpected shape.
     */
    private extractServerConfigFromConnection(server: McpServerApi): McpServerConfig | null {
        if (typeof server.getServerUrl !== "function" || typeof server.getServerToken !== "function") {
            return null;
        }

        try {
            return extractServerConfig({
                type: "http",
                url: server.getServerUrl(),
                token: server.getServerToken(),
            });
        } catch {
            return null;
        }
    }

    /**
     * Write MCP config files for Claude Code, Cursor, and VS Code.
     * Preserves existing non-lens-studio servers and removes stale
     * lens-studio-* entries from previous project names.
     */
    private updateMcpJson(projectDir: Editor.Path, info: LiveMcpServerInfo): void {
        for (const target of McpConfigManager.MCP_TARGETS) {
            const filePath = projectDir.appended(new Editor.Path(target.path));
            const parentDir = filePath.parent;

            if (!FileSystem.exists(parentDir)) {
                FileSystem.createDir(parentDir, { recursive: true });
            }

            let existing: string | null = null;
            if (FileSystem.exists(filePath)) {
                existing = FileSystem.readFile(filePath);
            }

            const merged = target.merge(existing, info.serverName, info.serverConfig);
            FileSystem.writeFile(filePath, serializeMcpJson(merged));
        }

        console.log(`[AgentsDocs] Updated MCP configs for project: ${info.projectName}`, console.None);
    }

    /**
     * Write `.codex/config.toml` with the same Lens Studio MCP server endpoint
     * used for the JSON-based editor integrations.
     */
    private updateCodexConfig(projectDir: Editor.Path, info: LiveMcpServerInfo): void {
        const codexDir = projectDir.appended(new Editor.Path(".codex"));
        const configPath = codexDir.appended(new Editor.Path("config.toml"));

        let existing: string | null = null;
        if (FileSystem.exists(configPath)) {
            existing = FileSystem.readFile(configPath);
        }

        const merged = mergeCodexConfig(existing, info.serverName, info.serverConfig);
        if (merged === null) {
            if ((existing ?? "").includes(CODEX_CONFIG_MANAGED_START)) {
                console.warn("[AgentsDocs] .codex/config.toml has malformed managed markers; leaving file unchanged", console.None);
            }
            return;
        }

        if (!FileSystem.exists(codexDir)) {
            FileSystem.createDir(codexDir, { recursive: true });
        }

        FileSystem.writeFile(configPath, merged);
        console.log(`[AgentsDocs] Updated .codex/config.toml for project: ${info.projectName}`, console.None);
    }

    private resetAfterSuccess(): void {
        this.retryGeneration++;
        this.clearRetryTimer();
        this.retryAttempt = 0;
        this.lastRetryReason = null;
    }

    private clearRetryTimer(): void {
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }
    }

    private scheduleRetry(reason: McpUnavailableReason): void {
        if (this.retryTimer !== null) {
            return;
        }

        if (this.lastRetryReason !== reason) {
            console.log("[AgentsDocs] MCP config update is waiting for " + this.describeWaitTarget(reason), console.None);
            this.lastRetryReason = reason;
        }

        if (this.retryAttempt >= McpConfigManager.MCP_RETRY_MAX_ATTEMPTS) {
            console.warn("[AgentsDocs] Could not update MCP config files after retrying: " + this.describeFailureReason(reason));
            return;
        }

        const retryGeneration = this.retryGeneration;
        const retryDelayMs = getMcpRetryDelayMs(this.retryAttempt);
        this.retryAttempt++;
        this.retryTimer = setTimeout(() => {
            this.retryTimer = null;
            if (retryGeneration !== this.retryGeneration) {
                return;
            }
            this.retryForCurrentProject();
        }, retryDelayMs);
    }

    private retryForCurrentProject(): void {
        try {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
            const project = model.project;

            if (Editor.isNull(project) || Editor.isNull(project.projectDirectory) || Editor.isNull(project.projectFile)) {
                return;
            }

            this.updateOrRetry(project.projectDirectory, project.projectFile);
        } catch (e) {
            console.error("[AgentsDocs] Error retrying MCP config update:", e);
        }
    }

    private describeWaitTarget(reason: McpUnavailableReason): string {
        switch (reason) {
            case "interface-unavailable":
                return "the Lens Studio MCP service to become available";
            case "server-uninitialized":
                return "the Lens Studio MCP service to finish initializing";
            case "server-not-running":
                return "the Lens Studio MCP server to start running";
            case "config-unavailable":
                return "the Lens Studio MCP server connection details";
            case "config-unrecognized":
                return "recognized Lens Studio MCP server connection details";
            case "project-name-unavailable":
                return "a supported .lsproj or .esproj project file";
        }
    }

    private describeFailureReason(reason: McpUnavailableReason): string {
        switch (reason) {
            case "interface-unavailable":
                return "the Lens Studio MCP service is unavailable";
            case "server-uninitialized":
                return "the Lens Studio MCP service did not finish initializing";
            case "server-not-running":
                return "the Lens Studio MCP server is not running";
            case "config-unavailable":
                return "Lens Studio MCP server connection details are unavailable";
            case "config-unrecognized":
                return "Lens Studio MCP server connection details are not recognized";
            case "project-name-unavailable":
                return "the project file is not a supported .lsproj or .esproj file";
        }
    }
}
