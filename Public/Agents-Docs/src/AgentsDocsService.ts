import { CoreService, Descriptor } from "LensStudio:CoreService";
import * as FileSystem from "LensStudio:FileSystem";
// @ts-ignore - LensStudio:Mcp not yet in type definitions
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
    serializeMcpJson
} from "./mcpUtils.js";

import {
    parseSettings,
    mergeMarketplace,
    serializeSettings
} from "./settingsUtils.js";


/**
 * AgentsDocsService - A CoreService plugin that:
 *   1. Copies editor.d.ts to Support/ on project open/save
 *   2. Injects AGENTS.md and CLAUDE.md into projects (if not already present)
 *   3. Writes .mcp.json for MCP server auto-discovery
 *   4. Ensures .gitignore covers auto-generated MCP config files
 *   5. Injects .claude/settings.local.json with Claude Code marketplace config
 *   6. Cleans up files previously injected by older versions of this plugin
 */
export class AgentsDocsService extends CoreService {
    private connections: Editor.ScopedConnection[] = [];

    /** Path to the Resources folder bundled with this plugin.
     *  Resolved at plugin installation time; cannot change while the plugin is loaded. */
    private readonly resourcesPath: Editor.Path;

    static descriptor(): Descriptor {
        const d = new Descriptor();
        d.id = "com.snap.AgentsDocs.Service";
        d.name = "Agents Docs Service";
        d.description = "Automatically injects AGENTS.md and .claude/ configuration into projects";
        d.dependencies = [Editor.Model.IModel];
        return d;
    }

    constructor(pluginSystem: Editor.PluginSystem) {
        super(pluginSystem);
        this.resourcesPath = new Editor.Path(import.meta.resolve("../Resources/"));
    }

    override start(): void {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;

        this.connections.push(
            model.onProjectChanged.connect(() => this.onProjectReady())
        );
        this.connections.push(
            model.onProjectSaving.connect(() => this.onProjectReady())
        );

        if (!Editor.isNull(model.project)) {
            this.onProjectReady();
        }
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
            this.copyEditorDts(project.projectDirectory);
            this.injectAgentsMd(project.projectDirectory);
            this.ensureInstructionsMd(project.projectDirectory);
            this.updateMcpJson(project.projectDirectory, project.projectFile);
            this.ensureGitignore(project.projectDirectory);
            this.injectClaudeSettings(project.projectDirectory);
        } catch (e) {
            console.error("[AgentsDocs] Error:", e, console.None);
        }
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

    private static readonly AGENTS_MD_MARKER = "<!-- Shipped by Lens Studio -->\n";

    /**
     * Inject AGENTS.md into the project root from bundled Resources.
     * Always prepends a marker header so the plugin can update its own
     * injections on future project opens. If a user removes the marker
     * and writes their own content, the plugin leaves it untouched.
     */
    private injectAgentsMd(projectDir: Editor.Path): void {
        const sourcePath = this.resourcesPath.appended(new Editor.Path("AGENTS.md"));
        const destPath = projectDir.appended(new Editor.Path("AGENTS.md"));

        if (FileSystem.exists(destPath)) {
            try {
                const existing = FileSystem.readFile(destPath);
                if (!existing.startsWith(AgentsDocsService.AGENTS_MD_MARKER)) {
                    return;
                }
            } catch (e) {
                return;
            }
        }

        if (!FileSystem.exists(sourcePath)) {
            console.warn("[AgentsDocs] AGENTS.md not found in plugin resources: " + sourcePath.toString(), console.None);
            return;
        }

        try {
            const content = FileSystem.readFile(sourcePath);
            FileSystem.writeFile(destPath, AgentsDocsService.AGENTS_MD_MARKER + content);
            console.log("[AgentsDocs] Injected AGENTS.md", console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error injecting AGENTS.md:", e, console.None);
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
     * Copy editor.d.ts (Editor API type definitions) into the project's Support/ directory.
     * The source file is bundled in the plugin's Resources/ folder at build time.
     * Always overwrites to ensure users get updated definitions on plugin upgrades.
     */
    private copyEditorDts(projectDir: Editor.Path): void {
        const sourcePath = this.resourcesPath.appended(new Editor.Path("editor.d.ts"));
        const supportDir = projectDir.appended(new Editor.Path("Support"));
        const destPath = supportDir.appended(new Editor.Path("editor.d.ts"));

        if (!FileSystem.exists(sourcePath)) {
            console.warn("[AgentsDocs] editor.d.ts not found in plugin resources: " + sourcePath.toString(), console.None);
            return;
        }

        try {
            // Ensure Support/ directory exists (Lens Studio normally creates it)
            if (!FileSystem.exists(supportDir)) {
                FileSystem.createDir(supportDir, { recursive: true });
            }

            const content = FileSystem.readFile(sourcePath);
            FileSystem.writeFile(destPath, content);

            console.log("[AgentsDocs] Copied editor.d.ts to Support/", console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error copying editor.d.ts:", e, console.None);
        }
    }

    /**
     * Write .mcp.json to the project root with current MCP server configuration.
     * Enables external tools (Claude Code, Cursor) to auto-discover the MCP server.
     *
     * Only writes if the MCP server is running. Preserves existing non-lens-studio
     * servers and removes stale lens-studio-* entries from previous project names.
     */
    private updateMcpJson(projectDir: Editor.Path, projectFile: Editor.Path): void {
        try {
            const server = this.pluginSystem.findInterface(IMcpServer) as unknown as McpServerApi | null;
            if (!server) {
                return;
            }

            // In CLI mode the server object may be uninitialized
            let isRunning = false;
            try {
                isRunning = server.isRunning();
            } catch {
                return;
            }

            if (!isRunning) {
                return;
            }

            const mcpConfig = server.getConfig();
            if (!mcpConfig) {
                return;
            }

            const serverConfig = extractServerConfig(mcpConfig);
            if (!serverConfig) {
                console.warn("[AgentsDocs] Unrecognized MCP config structure, skipping .mcp.json update", console.None);
                return;
            }

            const projectName = extractProjectName(projectFile);
            if (!projectName) {
                return;
            }

            const serverName = buildServerName(projectName);

            // Write .mcp.json (project root) — used by Claude Code
            const mcpJsonPath = projectDir.appended(new Editor.Path(".mcp.json"));
            let existingContent: string | null = null;
            if (FileSystem.exists(mcpJsonPath)) {
                existingContent = FileSystem.readFile(mcpJsonPath);
            }

            const merged = mergeMcpJson(existingContent, serverName, serverConfig);
            FileSystem.writeFile(mcpJsonPath, serializeMcpJson(merged));

            // Write .cursor/mcp.json — used by Cursor
            const cursorDir = projectDir.appended(new Editor.Path(".cursor"));
            const cursorMcpPath = cursorDir.appended(new Editor.Path("mcp.json"));
            let cursorExisting: string | null = null;
            if (FileSystem.exists(cursorMcpPath)) {
                cursorExisting = FileSystem.readFile(cursorMcpPath);
            }

            if (!FileSystem.exists(cursorDir)) {
                FileSystem.createDir(cursorDir, { recursive: true });
            }

            const cursorMerged = mergeMcpJson(cursorExisting, serverName, serverConfig);
            FileSystem.writeFile(cursorMcpPath, serializeMcpJson(cursorMerged));

            console.log(`[AgentsDocs] Updated .mcp.json and .cursor/mcp.json for project: ${projectName}`, console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error updating .mcp.json:", e, console.None);
        }
    }

    /** Entries the plugin ensures are present in the project's .gitignore. */
    private static readonly GITIGNORE_ENTRIES = [
        ".mcp.json",
        ".cursor/mcp.json",
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
    private injectClaudeSettings(projectDir: Editor.Path): void {
        try {
            const claudeDir = projectDir.appended(new Editor.Path(".claude"));
            const settingsPath = claudeDir.appended(new Editor.Path("settings.local.json"));

            // Read existing content (may not exist)
            let existingContent: string | null = null;
            if (FileSystem.exists(settingsPath)) {
                existingContent = FileSystem.readFile(settingsPath);
            }

            // Parse, merge, serialize
            const settings = parseSettings(existingContent);
            const merged = mergeMarketplace(settings);
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
