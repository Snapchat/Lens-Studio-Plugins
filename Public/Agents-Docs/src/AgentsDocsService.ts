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


/**
 * AgentsDocsService - A CoreService plugin that:
 *   1. Copies editor.d.ts to Support/ on project open/save
 *   2. Writes .mcp.json for MCP server auto-discovery
 *   3. Cleans up files previously injected by older versions of this plugin
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
            this.updateMcpJson(project.projectDirectory, project.projectFile);
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

        // Remove AGENTS.md only if it was auto-generated by this plugin
        // (identified by the marker comment at the start)
        const agentsMdPath = projectDir.appended(new Editor.Path("AGENTS.md"));
        if (FileSystem.exists(agentsMdPath)) {
            try {
                const content = FileSystem.readFile(agentsMdPath);
                if (content.startsWith("<!-- Shipped by Lens Studio -->")) {
                    FileSystem.remove(agentsMdPath);
                    console.log("[AgentsDocs] Removed auto-generated AGENTS.md", console.None);
                }
            } catch (e) {
                console.warn("[AgentsDocs] Could not check/remove AGENTS.md:", e, console.None);
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

            const mcpJsonPath = projectDir.appended(new Editor.Path(".mcp.json"));
            let existingContent: string | null = null;
            if (FileSystem.exists(mcpJsonPath)) {
                existingContent = FileSystem.readFile(mcpJsonPath);
            }

            const merged = mergeMcpJson(existingContent, buildServerName(projectName), serverConfig);
            FileSystem.writeFile(mcpJsonPath, serializeMcpJson(merged));

            console.log(`[AgentsDocs] Updated .mcp.json for project: ${projectName}`, console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error updating .mcp.json:", e, console.None);
        }
    }
}
