import { CoreService, Descriptor } from "LensStudio:CoreService";
import * as FileSystem from "LensStudio:FileSystem";
import * as AssetLibrary from "LensStudio:AssetLibrary";
import * as App from "LensStudio:App";
import { IMcpServer } from "LensStudio:Mcp";

/** Local type stub — the full IMcpServer definition lives in the C++ MCP bindings. */
interface McpServerApi {
    isRunning(): boolean;
    getConfig(): any;
}

import {
    extractProjectName,
    buildServerName,
    extractServerConfig,
    mergeMcpJson,
    mergeVsCodeMcpJson,
    serializeMcpJson,
    McpServerConfig,
    McpJsonContent,
    VsCodeMcpJsonContent
} from "./mcpUtils.js";

import {
    parseSettings,
    mergeMarketplace,
    mergePermissions,
    serializeSettings
} from "./settingsUtils.js";
import {
    CODEX_CONFIG_MANAGED_START,
    mergeCodexConfig,
} from "./codexUtils.js";
import {
    buildManagedAgentsMd,
    getAgentsMdMergeFailureMessage,
    mergeAgentsMd,
} from "./contentUtils.js";
import { fetchContentfulEntry } from "./contentfulFetch.js";


/** Contentful entry IDs for AGENTS.md content. */
const AGENTS_MD_INTERNAL_ENTRY_ID = "34TiypWvcqruuRj5fUuqzh";
const AGENTS_MD_PUBLIC_ENTRY_ID = "5OdvA4h0aG8nrSINK9WDKR";

/** Contentful entry IDs for editor.d.ts content. */
const EDITOR_DTS_INTERNAL_ENTRY_ID = "25uXmoF3jfh5EVdV4vKDDE";
const EDITOR_DTS_PUBLIC_ENTRY_ID = "5PlRuLmYco73ADkBUfsVHS";

type AssetFetchStatus = "not-started" | "pending" | "succeeded" | "failed";

function formatError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

function fetchFailureMessage(name: string): string {
    return `[AgentsDocs] Failed to fetch ${name} from Contentful; ${name} was not injected. This can happen when Lens Studio is not signed in or the user is not authorized.`;
}

function logFetchFailure(name: string, error: unknown): void {
    console.warn(fetchFailureMessage(name));
    console.warn(`[AgentsDocs] ${name} Contentful fetch failure details:`, error, console.None);
}

/**
 * AgentsDocsService - A CoreService plugin that:
 *   1. Copies editor.d.ts to Support/ on project open/save
 *   2. Fetches AGENTS.md from Contentful and injects into projects
 *   3. Writes MCP config files for agent auto-discovery
 *   4. Ensures .gitignore covers auto-generated config files
 *   5. Injects .claude/settings.local.json with marketplace config and MCP permission allowlist
 *   6. Cleans up files previously injected by older versions of this plugin
 */
export class AgentsDocsService extends CoreService {
    private connections: Editor.ScopedConnection[] = [];

    /** Cached AGENTS.md content fetched from Contentful once per session. */
    private cachedAgentsMd: string | null = null;
    private agentsMdFetchStatus: AssetFetchStatus = "not-started";

    /** Cached editor.d.ts content fetched from Contentful once per session. */
    private cachedEditorDts: string | null = null;
    private editorDtsFetchStatus: AssetFetchStatus = "not-started";

    private authorization: Editor.IAuthorization | null = null;

    /** Emits the "sign in for internal docs" warning at most once per session. */
    private warnedInternalFallback: boolean = false;

    static descriptor(): Descriptor {
        const d = new Descriptor();
        d.id = "com.snap.AgentsDocs.Service";
        d.name = "Agents Docs Service";
        d.description = "Automatically injects AGENTS.md and .claude/ configuration into projects";
        d.dependencies = [Editor.Model.IModel, Editor.IAuthorization];
        return d;
    }

    override start(): void {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;

        this.connections.push(
            model.onProjectChanged.connect(() => this.onProjectReady())
        );
        this.connections.push(
            model.onProjectSaving.connect(() => this.onProjectReady())
        );
        this.authorization = this.pluginSystem.findInterface(Editor.IAuthorization) as Editor.IAuthorization;

        if (!Editor.isNull(model.project)) {
            this.onProjectReady();
        }

        void this.fetchAndInjectAgentsMd();
        void this.fetchAndInjectEditorDts();
    }

    private async fetchAndInjectAgentsMd(): Promise<void> {
        if (this.agentsMdFetchStatus === "pending") {
            return;
        }

        this.agentsMdFetchStatus = "pending";
        try {
            const content = await this.fetchEntryFromContentful(
                AGENTS_MD_INTERNAL_ENTRY_ID,
                AGENTS_MD_PUBLIC_ENTRY_ID
            );
            this.cachedAgentsMd = content;
            this.agentsMdFetchStatus = "succeeded";
            this.injectAgentsMdIntoCurrentProject();
        } catch (e) {
            this.cachedAgentsMd = null;
            this.agentsMdFetchStatus = "failed";
            logFetchFailure("AGENTS.md", e);
        }
    }

    private async fetchAndInjectEditorDts(): Promise<void> {
        if (this.editorDtsFetchStatus === "pending") {
            return;
        }

        if (!EDITOR_DTS_INTERNAL_ENTRY_ID && !EDITOR_DTS_PUBLIC_ENTRY_ID) {
            // Entry IDs not configured yet; skip silently until they are filled in.
            this.editorDtsFetchStatus = "failed";
            return;
        }

        this.editorDtsFetchStatus = "pending";
        try {
            const content = await this.fetchEntryFromContentful(
                EDITOR_DTS_INTERNAL_ENTRY_ID,
                EDITOR_DTS_PUBLIC_ENTRY_ID
            );
            this.cachedEditorDts = content;
            this.editorDtsFetchStatus = "succeeded";
            this.injectEditorDtsIntoCurrentProject();
        } catch (e) {
            this.cachedEditorDts = null;
            this.editorDtsFetchStatus = "failed";
            logFetchFailure("editor.d.ts", e);
        }
    }

    private async fetchEntryFromContentful(internalId: string, publicId: string): Promise<string> {
        // App.isInternal is a build-time flag — true on internal Lens Studio builds —
        // but it does NOT guarantee the signed-in user has internal asset-library scope.
        // Try the internal entry first; if the backend rejects the auth, fall back to public.
        // @ts-ignore — App.isInternal is @hidden but stable.
        if (App.isInternal && internalId) {
            try {
                return await fetchContentfulEntry(this.pluginSystem, {
                    entryId: internalId,
                    space: AssetLibrary.Space.Internal,
                });
            } catch (e) {
                console.log("[AgentsDocs] Internal asset-library fetch error:", e, console.None);
                if (!this.warnedInternalFallback) {
                    this.warnedInternalFallback = true;
                    console.warn("[AgentsDocs] Sign in to My Lenses to download internal agent docs. Falling back to public docs for now.");
                }
            }
        }
        return fetchContentfulEntry(this.pluginSystem, {
            entryId: publicId,
            space: AssetLibrary.Space.Public,
        });
    }

    private injectAgentsMdIntoCurrentProject(): void {
        try {
            const m = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
            if (!Editor.isNull(m.project) && !Editor.isNull(m.project.projectDirectory)) {
                this.injectAgentsMd(m.project.projectDirectory);
            }
        } catch (e) {
            console.warn(
                "[AgentsDocs] Fetched AGENTS.md but could not inject it into the current project; AGENTS.md will be retried on the next project load/save. Error: " + formatError(e)
            );
        }
    }

    private injectEditorDtsIntoCurrentProject(): void {
        try {
            const m = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
            if (!Editor.isNull(m.project) && !Editor.isNull(m.project.projectDirectory)) {
                this.injectEditorDts(m.project.projectDirectory);
            }
        } catch (e) {
            console.warn(
                "[AgentsDocs] Fetched editor.d.ts but could not inject it into the current project; will retry on the next project load/save. Error: " + formatError(e)
            );
        }
    }

    private isAuthorized(): boolean {
        return this.authorization?.isAuthorized ?? false;
    }

    override stop(): void {
        // Clean up all connections
        this.connections.forEach(c => c?.disconnect());
        this.connections = [];
    }

    private onProjectReady(): void {
        try {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
            const project = model.project;

            if (Editor.isNull(project) || Editor.isNull(project.projectDirectory) || Editor.isNull(project.projectFile)) {
                return;
            }

            this.cleanupLegacyInjections(project.projectDirectory);
            this.ensureEditorDts(project.projectDirectory);
            this.ensureAgentsMd(project.projectDirectory);
            this.ensureInstructionsMd(project.projectDirectory);
            this.updateMcpJson(project.projectDirectory, project.projectFile);
            this.updateCodexConfig(project.projectDirectory, project.projectFile);
            this.ensureGitignore(project.projectDirectory);
            this.injectClaudeSettings(project.projectDirectory, project.projectFile);
        } catch (e) {
            console.error("[AgentsDocs] Error:", e, console.None);
        }
    }

    private ensureAgentsMd(projectDir: Editor.Path): void {
        if (this.cachedAgentsMd !== null) {
            this.injectAgentsMd(projectDir);
            return;
        }

        if (this.agentsMdFetchStatus === "failed" && this.isAuthorized()) {
            void this.fetchAndInjectAgentsMd();
            return;
        }

        this.injectAgentsMd(projectDir);
    }

    private ensureEditorDts(projectDir: Editor.Path): void {
        if (this.cachedEditorDts !== null) {
            this.injectEditorDts(projectDir);
            return;
        }

        if (this.editorDtsFetchStatus === "failed" && this.isAuthorized()) {
            void this.fetchAndInjectEditorDts();
            return;
        }

        this.injectEditorDts(projectDir);
    }

    /**
     * Remove the legacy .agents/ directory left behind by earlier plugin versions.
     * This runs on every project load so existing projects are cleaned up automatically.
     */
    private removeLegacyAgentsDir(projectDir: Editor.Path): void {
        const legacyDir = projectDir.appended(new Editor.Path(".agents"));
        if (FileSystem.exists(legacyDir)) {
            try {
                FileSystem.remove(legacyDir);
                console.log("[AgentsDocs] Removed legacy .agents/ directory", console.None);
            } catch (e) {
                console.warn("[AgentsDocs] Could not remove legacy .agents/ dir:", e, console.None);
            }
        }
    }

    /**
     * Clean up files previously injected by older versions of this plugin.
     * All removals are safe because the old plugin always wipe-and-recreated
     * these paths — they are not user-created content.
     */
    private cleanupLegacyInjections(projectDir: Editor.Path): void {
        // Remove legacy .agents/ directory (from even older plugin version)
        this.removeLegacyAgentsDir(projectDir);

        // Remove .claude/docs/ (was wipe-and-recreated every project load)
        const docsDir = projectDir.appended(new Editor.Path(".claude/docs"));
        this.removeIfExists(docsDir);

        // Remove injected skills (was wipe-and-recreated every project load)
        const editorApiSkill = projectDir.appended(new Editor.Path(".claude/skills/editor-api-execute"));
        this.removeIfExists(editorApiSkill);
        const logsSkill = projectDir.appended(new Editor.Path(".claude/skills/lens-studio-logs"));
        this.removeIfExists(logsSkill);

        // Remove injected agent (was wipe-and-recreated every project load)
        const agentFile = projectDir.appended(new Editor.Path(".claude/agents/editor-api-agent.md"));
        if (FileSystem.exists(agentFile)) {
            try {
                FileSystem.remove(agentFile);
                console.log("[AgentsDocs] Removed legacy injected agent", console.None);
            } catch (e) {
                console.warn("[AgentsDocs] Could not remove legacy agent:", e, console.None);
            }
        }

    }

    private removeIfExists(path: Editor.Path): void {
        if (FileSystem.exists(path)) {
            try {
                FileSystem.remove(path);
            } catch (e) {
                console.warn("[AgentsDocs] Could not remove " + path.toString() + ":", e, console.None);
            }
        }
    }

    /**
     * Inject AGENTS.md into the project root from Contentful-fetched cache.
     * Only the Lens Studio managed region is replaced on future project opens.
     * Custom content outside the managed markers is preserved. Existing files
     * without Lens Studio markers are treated as user-owned and left untouched.
     */
    private injectAgentsMd(projectDir: Editor.Path): void {
        if (this.cachedAgentsMd === null) {
            if (this.agentsMdFetchStatus === "failed") {
                console.warn(fetchFailureMessage("AGENTS.md"));
            }
            return;
        }

        const destPath = projectDir.appended(new Editor.Path("AGENTS.md"));

        try {
            let nextContent: string;

            if (FileSystem.exists(destPath)) {
                const existing = FileSystem.readFile(destPath);
                const merged = mergeAgentsMd(existing, this.cachedAgentsMd);
                if (merged === null) {
                    const failureMessage = getAgentsMdMergeFailureMessage(existing) ?? "existing AGENTS.md could not be merged; AGENTS.md was not injected.";
                    console.warn("[AgentsDocs] Could not inject AGENTS.md: " + failureMessage);
                    return;
                }
                nextContent = merged;
            } else {
                nextContent = buildManagedAgentsMd(this.cachedAgentsMd);
            }

            FileSystem.writeFile(destPath, nextContent);
            console.log("[AgentsDocs] Injected AGENTS.md", console.None);
        } catch (e) {
            console.warn("[AgentsDocs] Could not inject AGENTS.md due to a file system error; AGENTS.md was not injected:", e);
        }
    }

    /**
     * Create CLAUDE.md at the project root if one doesn't already exist.
     * Seeds it with "@AGENTS.md" so AI coding agents automatically read
     * the plugin-injected AGENTS.md documentation.
     */
    private ensureInstructionsMd(projectDir: Editor.Path): void {
        const instructionsMdPath = projectDir.appended(new Editor.Path("CLAUDE.md"));

        if (FileSystem.exists(instructionsMdPath)) {
            return;
        }

        try {
            FileSystem.writeFile(instructionsMdPath, "@AGENTS.md\n");
            console.log("[AgentsDocs] Created CLAUDE.md with @AGENTS.md directive", console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error creating CLAUDE.md:", e, console.None);
        }
    }

    /**
     * Write editor.d.ts (Editor API type definitions) into the project's Support/ directory
     * from the Contentful-fetched cache. Always overwrites so users get updated
     * definitions on plugin upgrades or new Lens Studio versions.
     * On fetch failure the existing Support/editor.d.ts (if any) is left untouched.
     */
    private injectEditorDts(projectDir: Editor.Path): void {
        if (this.cachedEditorDts === null) {
            if (this.editorDtsFetchStatus === "failed") {
                console.warn(fetchFailureMessage("editor.d.ts"));
            }
            return;
        }

        const supportDir = projectDir.appended(new Editor.Path("Support"));
        const destPath = supportDir.appended(new Editor.Path("editor.d.ts"));

        try {
            if (!FileSystem.exists(supportDir)) {
                FileSystem.createDir(supportDir, { recursive: true });
            }
            FileSystem.writeFile(destPath, this.cachedEditorDts);
            console.log("[AgentsDocs] Injected editor.d.ts to Support/", console.None);
        } catch (e) {
            console.warn("[AgentsDocs] Could not inject editor.d.ts due to a file system error:", e);
        }
    }

    /** MCP config targets: path relative to project root, and which merge function to use. */
    private static readonly MCP_TARGETS: Array<{
        path: string;
        merge: (existing: string | null, name: string, config: McpServerConfig) => McpJsonContent | VsCodeMcpJsonContent;
    }> = [
        { path: ".mcp.json", merge: mergeMcpJson },              // Claude Code
        { path: ".cursor/mcp.json", merge: mergeMcpJson },       // Cursor
        { path: ".vscode/mcp.json", merge: mergeVsCodeMcpJson }, // VS Code
    ];

    /**
     * Resolve the live Lens Studio MCP server info for the current project.
     * Returns null when MCP is unavailable or not currently running.
     */
    private getLiveMcpServerInfo(projectFile: Editor.Path): {
        projectName: string;
        serverName: string;
        serverConfig: McpServerConfig;
    } | null {
        const server = this.pluginSystem.findInterface(IMcpServer) as unknown as McpServerApi | null;
        if (!server) {
            return null;
        }

        // In CLI mode the server object may be uninitialized
        let isRunning = false;
        try {
            isRunning = server.isRunning();
        } catch {
            return null;
        }

        if (!isRunning) {
            return null;
        }

        const mcpConfig = server.getConfig();
        if (!mcpConfig) {
            return null;
        }

        const serverConfig = extractServerConfig(mcpConfig);
        if (!serverConfig) {
            console.warn("[AgentsDocs] Unrecognized MCP config structure, skipping MCP config update", console.None);
            return null;
        }

        const projectName = extractProjectName(projectFile);
        if (!projectName) {
            return null;
        }

        return {
            projectName,
            serverName: buildServerName(projectName),
            serverConfig,
        };
    }

    /**
     * Write MCP config files for Claude Code, Cursor, and VS Code.
     * Only writes if the MCP server is running. Preserves existing non-lens-studio
     * servers and removes stale lens-studio-* entries from previous project names.
     */
    private updateMcpJson(projectDir: Editor.Path, projectFile: Editor.Path): void {
        try {
            const info = this.getLiveMcpServerInfo(projectFile);
            if (!info) {
                return;
            }

            for (const target of AgentsDocsService.MCP_TARGETS) {
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
        } catch (e) {
            console.error("[AgentsDocs] Error updating .mcp.json:", e, console.None);
        }
    }

    /**
     * Write `.codex/config.toml` with the same Lens Studio MCP server endpoint
     * used for the JSON-based editor integrations.
     */
    private updateCodexConfig(projectDir: Editor.Path, projectFile: Editor.Path): void {
        try {
            const info = this.getLiveMcpServerInfo(projectFile);
            if (!info) {
                return;
            }

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
        } catch (e) {
            console.error("[AgentsDocs] Error updating .codex/config.toml:", e, console.None);
        }
    }

    /** Entries the plugin ensures are present in the project's .gitignore. */
    private static readonly GITIGNORE_ENTRIES = [
        ".mcp.json",
        ".cursor/mcp.json",
        ".vscode/mcp.json",
        ".codex/config.toml",
        ".claude/settings.local.json",
    ];

    /**
     * Ensure the project's .gitignore contains entries for auto-generated
     * MCP config files. Creates the file if missing, or appends only the
     * entries not already present.
     */
    private ensureGitignore(projectDir: Editor.Path): void {
        const gitignorePath = projectDir.appended(new Editor.Path(".gitignore"));

        try {
            let existing = "";
            if (FileSystem.exists(gitignorePath)) {
                existing = FileSystem.readFile(gitignorePath);
            }

            const existingLines = new Set(
                existing.split("\n").map(l => l.trim())
            );

            const missing = AgentsDocsService.GITIGNORE_ENTRIES.filter(
                entry => !existingLines.has(entry)
            );

            if (missing.length === 0) {
                return;
            }

            let content = existing;
            if (content.length > 0) {
                if (!content.endsWith("\n")) {
                    content += "\n";
                }
                content += "\n";
            }
            content += "# Auto-generated by Lens Studio (Agents-Docs plugin)\n";
            content += missing.join("\n") + "\n";

            FileSystem.writeFile(gitignorePath, content);
            console.log("[AgentsDocs] Updated .gitignore with MCP ignore rules", console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error updating .gitignore:", e, console.None);
        }
    }

    /**
     * Inject .claude/settings.local.json with marketplace configuration.
     * Reads existing file if present, deep-merges the lens-studio-extensions
     * marketplace entry, and writes back. Preserves all other settings.
     */
    private injectClaudeSettings(projectDir: Editor.Path, projectFile: Editor.Path): void {
        try {
            const claudeDir = projectDir.appended(new Editor.Path(".claude"));
            const settingsPath = claudeDir.appended(new Editor.Path("settings.local.json"));

            // Read existing content (may not exist)
            let existingContent: string | null = null;
            if (FileSystem.exists(settingsPath)) {
                existingContent = FileSystem.readFile(settingsPath);
            }

            // Parse, merge marketplace, merge MCP permissions, serialize
            const settings = parseSettings(existingContent);
            let merged = mergeMarketplace(settings);

            const projectName = extractProjectName(projectFile);
            if (projectName) {
                const serverName = buildServerName(projectName);
                merged = mergePermissions(merged, serverName);
            }

            const output = serializeSettings(merged);

            // Ensure .claude/ directory exists
            if (!FileSystem.exists(claudeDir)) {
                FileSystem.createDir(claudeDir, { recursive: true });
            }

            FileSystem.writeFile(settingsPath, output);
            console.log("[AgentsDocs] Updated .claude/settings.local.json with marketplace config", console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error injecting Claude settings:", e, console.None);
        }
    }
}
