import { CoreService, Descriptor } from "LensStudio:CoreService";
import * as FileSystem from "LensStudio:FileSystem";
import * as App from "LensStudio:App";
// @ts-ignore - LensStudio:Mcp not yet in type definitions
import { IMcpServer } from "LensStudio:Mcp";

/** Local type stub — the full IMcpServer definition lives in the C++ MCP bindings. */
interface McpServerApi {
    isRunning(): boolean;
    getConfig(): any;
}

import {
    AGENTS_MD_HEADER,
    AGENTS_MD_DISCLAIMER,
    FLAVOR_PUBLIC,
    extractUserContent,
    buildPatchedAgentsMd,
    buildDefaultAgentsGitignore,
    processTemplate,
    parseFlavorFromProjectFile
} from "./contentUtils.js";
import {
    extractProjectName,
    buildServerName,
    extractServerConfig,
    mergeMcpJson,
    serializeMcpJson
} from "./mcpUtils.js";


/**
 * AgentsDocsService - A CoreService plugin that automatically injects
 * AGENTS.md and .claude/docs/ documentation into Lens Studio projects
 * when they are opened.
 *
 * This replicates the behavior from SupportFiles.cpp in the C++ codebase.
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

        // Listen for project changes (handles reopening existing projects)
        this.connections.push(
            model.onProjectChanged.connect(() => this.tryInjectDocumentation())
        );

        // Listen for project saves - handles "Save As" to new locations
        this.connections.push(
            model.onProjectSaving.connect(() => this.tryInjectDocumentation())
        );

        // Run on initial start if a project is already loaded
        if (!Editor.isNull(model.project)) {
            this.tryInjectDocumentation();
        }
    }

    override stop(): void {
        // Clean up all connections
        this.connections.forEach(c => c?.disconnect());
        this.connections = [];
    }

    /**
     * Attempt to inject documentation if the project is ready and we haven't already.
     * Called on project open/change and after saves complete.
     */
    private tryInjectDocumentation(): void {
        try {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
            const project = model.project;

            if (Editor.isNull(project) || Editor.isNull(project.projectDirectory) || Editor.isNull(project.projectFile)) {
                return;
            }

            this.injectDocumentation(project.projectDirectory, project.projectFile);
        } catch (e) {
            console.error("[AgentsDocs] Error in tryInjectDocumentation:", e, console.None);
        }
    }

    private injectDocumentation(projectDir: Editor.Path, projectFile: Editor.Path): void {
        // Get version, flavor, and platform information
        const version = App.version;
        const flavor = this.detectFlavor(projectFile);
        const platforms = this.detectPlatforms();

        // Clean up legacy .agents/ directory from earlier plugin versions
        this.removeLegacyAgentsDir(projectDir);

        // Copy docs into .claude/docs/
        this.copyInjectedDocs(projectDir);

        // Copy editor.d.ts to Support/
        this.copyEditorDts(projectDir);

        // Patch AGENTS.md file with version, flavor, and platform info
        this.patchAgentsMd(projectDir, version, flavor, platforms);

        // Inject skills, agents, and seed instructions file
        this.copyInjectedSkills(projectDir);
        this.copyInjectedAgents(projectDir);
        this.ensureInstructionsMd(projectDir);

        // Write .mcp.json for IDE auto-discovery of the MCP server
        this.updateMcpJson(projectDir, projectFile);

        console.log(`[AgentsDocs] Documentation injection complete. Version: ${version}, Flavor: ${flavor}, Platforms: ${platforms.join(", ") || "none"}`, console.None);
    }

    /**
     * Detect the Lens Studio flavor (Public/Internal) by reading the project file.
     * Falls back to "Public" if detection fails.
     */
    private detectFlavor(projectFile: Editor.Path): string {
        try {
            if (!FileSystem.exists(projectFile)) {
                console.log("[AgentsDocs] Project file not found, defaulting to Public flavor", console.None);
                return FLAVOR_PUBLIC;
            }

            const projectContent = FileSystem.readFile(projectFile);
            const flavor = parseFlavorFromProjectFile(projectContent);

            if (flavor) {
                return flavor;
            }

            console.log("[AgentsDocs] Could not parse flavor from project file, defaulting to Public", console.None);
            return FLAVOR_PUBLIC;
        } catch (e) {
            console.warn("[AgentsDocs] Error detecting flavor:", e, console.None);
            return FLAVOR_PUBLIC;
        }
    }

    /**
     * Detect the target platforms from the project's MetaInfo.lensClientCompatibilities.
     * Returns an array of platform display names (e.g. ["Spectacles"] or ["Mobile", "Web"]).
     * Falls back to [] if detection fails or no platforms are set.
     */
    private detectPlatforms(): string[] {
        try {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
            const project = model.project;

            if (Editor.isNull(project) || Editor.isNull(project.metaInfo)) {
                return [];
            }

            // @ts-ignore - lensClientCompatibilities is a new API not yet in the type definitions
            const compatibilities = project.metaInfo.lensClientCompatibilities;
            if (!compatibilities || compatibilities.length === 0) {
                return [];
            }

            // @ts-ignore - LensClientCompatibility is a new API not yet in the type definitions
            const compat = Editor.Model.LensClientCompatibility;
            const platformNames: string[] = [];
            for (const c of compatibilities) {
                if (c === compat.Mobile) platformNames.push("Mobile");
                else if (c === compat.Web) platformNames.push("Web");
                else if (c === compat.Spectacles) platformNames.push("Spectacles");
                else if (c === compat.CameraKit) platformNames.push("CameraKit");
            }
            return platformNames;
        } catch (e) {
            console.warn("[AgentsDocs] Error detecting platforms:", e, console.None);
            return [];
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
     * Copy the .claude/docs/ documentation folder to the project.
     * This wipes and recreates the folder on every project load,
     * but preserves the user's .gitignore if they've modified it.
     */
    private copyInjectedDocs(projectDir: Editor.Path): void {
        const sourceFolder = this.resourcesPath.appended(new Editor.Path("injected-docs"));
        const configDir = projectDir.appended(new Editor.Path(".claude"));
        const destFolder = configDir.appended(new Editor.Path("docs"));
        const gitIgnorePath = destFolder.appended(new Editor.Path(".gitignore"));

        if (!FileSystem.exists(sourceFolder)) {
            console.warn("[AgentsDocs] Source folder not found: " + sourceFolder.toString(), console.None);
            return;
        }

        try {
            // Preserve user's .gitignore if it exists
            let existingGitignore: string | null = null;
            if (FileSystem.exists(gitIgnorePath)) {
                existingGitignore = FileSystem.readFile(gitIgnorePath);
            }

            // Wipe and recreate the .claude/docs directory
            // This ensures the directory is always in sync with the shipped content
            if (FileSystem.exists(destFolder)) {
                FileSystem.remove(destFolder);
            }

            // Ensure parent .claude directory exists
            if (!FileSystem.exists(configDir)) {
                FileSystem.createDir(configDir, { recursive: true });
            }

            // Copy the documentation folder
            FileSystem.copyDir(sourceFolder, destFolder, { force: true, recursive: true });

            // Restore user's .gitignore if they had one, otherwise create the default
            if (existingGitignore !== null) {
                FileSystem.writeFile(gitIgnorePath, existingGitignore);
            } else {
                this.createDocsGitignore(gitIgnorePath);
            }

            console.log("[AgentsDocs] Copied .claude/docs/ folder", console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error copying docs folder:", e, console.None);
        }
    }

    /**
     * Create the default .gitignore for the .claude/docs/ folder.
     * This ignores all contents by default to prevent committing auto-generated docs.
     */
    private createDocsGitignore(gitIgnorePath: Editor.Path): void {
        FileSystem.writeFile(gitIgnorePath, buildDefaultAgentsGitignore());
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
     * Patch the AGENTS.md file in the project root.
     * This preserves any user content outside the auto-generated markers.
     *
     * File format:
     * <!-- Shipped by Lens Studio -->
     * <!-- Auto-generated disclaimer -->
     * [auto-generated content with version and flavor-specific paths]
     * <!-- Shipped by Lens Studio -->
     * [user content - preserved across updates]
     *
     * @param projectDir - The project directory path
     * @param version - The Lens Studio version string
     * @param flavor - The flavor ("Public" or "Internal")
     * @param platforms - Array of target platform names (e.g. ["Spectacles"])
     */
    private patchAgentsMd(projectDir: Editor.Path, version: string, flavor: string, platforms: string[] = []): void {
        const agentsMdTemplatePath = this.resourcesPath.appended(new Editor.Path("AGENTS.md.in"));
        const agentsMdDestPath = projectDir.appended(new Editor.Path("AGENTS.md"));

        if (!FileSystem.exists(agentsMdTemplatePath)) {
            console.warn("[AgentsDocs] AGENTS.md.in template not found: " + agentsMdTemplatePath.toString(), console.None);
            return;
        }

        try {
            // Read the template content
            const rawTemplate = FileSystem.readFile(agentsMdTemplatePath);

            // Process the template with version, flavor, and platform information
            const templateContent = processTemplate(rawTemplate, version, flavor, platforms);

            // Read existing file content (if any)
            let existingContent = "";
            if (FileSystem.exists(agentsMdDestPath)) {
                existingContent = FileSystem.readFile(agentsMdDestPath);
            }

            // Extract user content and build patched file using utility functions
            const userContent = extractUserContent(existingContent, AGENTS_MD_HEADER);
            const result = buildPatchedAgentsMd(templateContent, userContent, AGENTS_MD_HEADER, AGENTS_MD_DISCLAIMER);

            // Write the patched file
            FileSystem.writeFile(agentsMdDestPath, result);

            console.log("[AgentsDocs] Patched AGENTS.md", console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error patching AGENTS.md:", e, console.None);
        }
    }

    /**
     * Copy skill definitions from Resources into the project's .claude/skills/ directory.
     * Wipes and recreates on every project load to ensure definitions stay current.
     */
    private copyInjectedSkills(projectDir: Editor.Path): void {
        const sourceFolder = this.resourcesPath.appended(new Editor.Path("injected-skills"));
        const configDir = projectDir.appended(new Editor.Path(".claude"));
        const destFolder = configDir.appended(new Editor.Path("skills"));

        if (!FileSystem.exists(sourceFolder)) {
            console.warn("[AgentsDocs] injected-skills source not found: " + sourceFolder.toString(), console.None);
            return;
        }

        try {
            if (FileSystem.exists(destFolder)) {
                FileSystem.remove(destFolder);
            }

            if (!FileSystem.exists(configDir)) {
                FileSystem.createDir(configDir, { recursive: true });
            }

            FileSystem.copyDir(sourceFolder, destFolder, { force: true, recursive: true });
            console.log("[AgentsDocs] Copied .claude/skills/ folder", console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error copying injected skills:", e, console.None);
        }
    }

    /**
     * Copy agent definitions from Resources into the project's .claude/agents/ directory.
     * Wipes and recreates on every project load to ensure definitions stay current.
     */
    private copyInjectedAgents(projectDir: Editor.Path): void {
        const sourceFolder = this.resourcesPath.appended(new Editor.Path("injected-agents"));
        const configDir = projectDir.appended(new Editor.Path(".claude"));
        const destFolder = configDir.appended(new Editor.Path("agents"));

        if (!FileSystem.exists(sourceFolder)) {
            console.warn("[AgentsDocs] injected-agents source not found: " + sourceFolder.toString(), console.None);
            return;
        }

        try {
            if (FileSystem.exists(destFolder)) {
                FileSystem.remove(destFolder);
            }

            if (!FileSystem.exists(configDir)) {
                FileSystem.createDir(configDir, { recursive: true });
            }

            FileSystem.copyDir(sourceFolder, destFolder, { force: true, recursive: true });
            console.log("[AgentsDocs] Copied .claude/agents/ folder", console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error copying injected agents:", e, console.None);
        }
    }

    /**
     * Create a CLAUDE.md at the project root if one doesn't already exist.
     * Seeds it with "@AGENTS.md" so AI coding agents automatically read the
     * plugin-generated AGENTS.md documentation.
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
