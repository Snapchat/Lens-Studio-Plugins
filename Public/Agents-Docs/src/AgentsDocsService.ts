import { CoreService, Descriptor } from "LensStudio:CoreService";

import { ContentfulDocsProvider } from "./docs/ContentfulDocsProvider.js";
import { EditorDtsInjector } from "./docs/EditorDtsInjector.js";
import { AgentsMdInjector } from "./docs/AgentsMdInjector.js";
import { McpConfigManager } from "./mcp/McpConfigManager.js";
import { cleanupLegacyInjections } from "./injectors/legacyCleanup.js";
import {
    ensureInstructionsMd,
    ensureGitignore,
    injectClaudeSettings,
} from "./injectors/staticFileInjectors.js";

type CurrentProject = {
    projectDir: Editor.Path;
    projectFile: Editor.Path;
};

/**
 * AgentsDocsService - A CoreService plugin that:
 *   1. Copies editor.d.ts to Support/ on project open/save
 *   2. Fetches AGENTS.md from Contentful and injects into projects
 *   3. Writes MCP config files for agent auto-discovery
 *   4. Ensures .gitignore covers auto-generated config files
 *   5. Updates .claude/settings.local.json with MCP permission allowlist
 *   6. Cleans up files previously injected by older versions of this plugin
 *
 * The work is delegated to focused collaborators; this class only owns the
 * plugin lifecycle, event wiring, and per-project orchestration order.
 */
export class AgentsDocsService extends CoreService {
    private connections: Editor.ScopedConnection[] = [];

    private docsProvider!: ContentfulDocsProvider;
    private editorDts!: EditorDtsInjector;
    private agentsMd!: AgentsMdInjector;
    private mcpConfig!: McpConfigManager;

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
        const authorization = this.pluginSystem.findInterface(Editor.IAuthorization) as Editor.IAuthorization;

        this.docsProvider = new ContentfulDocsProvider(this.pluginSystem, authorization);
        this.editorDts = new EditorDtsInjector(this.pluginSystem, this.docsProvider);
        this.agentsMd = new AgentsMdInjector(this.docsProvider);
        this.mcpConfig = new McpConfigManager(this.pluginSystem);

        this.connections.push(
            model.onProjectChanged.connect(() => this.onProjectReady())
        );
        this.connections.push(
            model.onProjectSaving.connect(() => this.onProjectReady())
        );

        if (!Editor.isNull(model.project)) {
            this.onProjectReady();
        }

        void this.editorDts.fetchAndInject();
    }

    override stop(): void {
        this.mcpConfig?.stop();
        // Clean up all connections
        this.connections.forEach(c => c?.disconnect());
        this.connections = [];
    }

    private onProjectReady(): void {
        try {
            const project = this.currentProject();
            if (!project) {
                return;
            }

            this.mcpConfig.resetForProjectReady();
            cleanupLegacyInjections(project.projectDir);
            this.editorDts.ensure(project.projectDir);
            void this.agentsMd.inject(project.projectDir);
            ensureInstructionsMd(project.projectDir);
            this.mcpConfig.updateOrRetry(project.projectDir, project.projectFile);
            ensureGitignore(project.projectDir);
            injectClaudeSettings(project.projectDir, project.projectFile);
        } catch (e) {
            console.error("[AgentsDocs] Error:", e, console.None);
        }
    }

    private currentProject(): CurrentProject | null {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
        const project = model.project;

        if (Editor.isNull(project) || Editor.isNull(project.projectDirectory) || Editor.isNull(project.projectFile)) {
            return null;
        }

        return {
            projectDir: project.projectDirectory,
            projectFile: project.projectFile,
        };
    }
}
