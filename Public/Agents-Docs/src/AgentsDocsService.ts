import { CoreService, Descriptor } from "LensStudio:CoreService";
import * as FileSystem from "LensStudio:FileSystem";
import * as App from "LensStudio:App";
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


/**
 * AgentsDocsService - A CoreService plugin that automatically injects
 * AGENTS.md and .agents/ documentation folder into Lens Studio projects
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
        d.description = "Automatically injects AGENTS.md and .agents/ documentation into projects";
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

            if (Editor.isNull(project) || Editor.isNull(project.projectDirectory)) {
                return;
            }

            const projectDir = project.projectDirectory;

            console.log("projectDir: " + projectDir.toString(), console.None);

            this.injectDocumentation(projectDir, project.projectFile);
        } catch (e) {
            console.error("[AgentsDocs] Error in tryInjectDocumentation:", e, console.None);
        }
    }

    private injectDocumentation(projectDir: Editor.Path, projectFile: Editor.Path): void {
        // Get version and flavor information
        const version = App.version;
        const flavor = this.detectFlavor(projectFile);

        // Copy .agents/LensStudio/ folder
        this.copyAgentsFolder(projectDir);

        // Copy editor.d.ts to Support/
        this.copyEditorDts(projectDir);

        // Patch AGENTS.md file with version and flavor info
        this.patchAgentsMd(projectDir, version, flavor);

        console.log(`[AgentsDocs] Documentation injection complete. Version: ${version}, Flavor: ${flavor}`, console.None);
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
     * Copy the .agents/LensStudio/ documentation folder to the project.
     * This wipes and recreates the folder on every project load,
     * but preserves the user's .gitignore if they've modified it.
     */
    private copyAgentsFolder(projectDir: Editor.Path): void {
        const resourcesPath = this.resourcesPath;
        const sourceFolder = resourcesPath.appended(new Editor.Path("LensStudio"));
        const agentsFolder = projectDir.appended(new Editor.Path(".agents"));
        const destFolder = agentsFolder.appended(new Editor.Path("LensStudio"));
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

            // Wipe and recreate the .agents/LensStudio directory
            // This ensures the directory is always in sync with the shipped content
            if (FileSystem.exists(destFolder)) {
                FileSystem.remove(destFolder);
            }

            // Ensure parent .agents directory exists
            if (!FileSystem.exists(agentsFolder)) {
                FileSystem.createDir(agentsFolder, { recursive: true });
            }

            // Copy the documentation folder
            FileSystem.copyDir(sourceFolder, destFolder, { force: true, recursive: true });

            // Restore user's .gitignore if they had one, otherwise create the default
            if (existingGitignore !== null) {
                FileSystem.writeFile(gitIgnorePath, existingGitignore);
            } else {
                this.createAgentsGitignore(gitIgnorePath);
            }

            console.log("[AgentsDocs] Copied .agents/LensStudio/ folder", console.None);
        } catch (e) {
            console.error("[AgentsDocs] Error copying agents folder:", e, console.None);
        }
    }

    /**
     * Create the default .gitignore for the .agents/LensStudio/ folder.
     * This ignores all contents by default to prevent committing auto-generated docs.
     */
    private createAgentsGitignore(gitIgnorePath: Editor.Path): void {
        FileSystem.writeFile(gitIgnorePath, buildDefaultAgentsGitignore());
    }

    /**
     * Copy editor.d.ts (Editor API type definitions) into the project's Support/ directory.
     * The source file is bundled in the plugin's Resources/ folder at build time.
     * Skips the copy if the destination already exists to avoid redundant I/O on every save.
     */
    private copyEditorDts(projectDir: Editor.Path): void {
        const resourcesPath = this.resourcesPath;
        const sourcePath = resourcesPath.appended(new Editor.Path("editor.d.ts"));
        const supportDir = projectDir.appended(new Editor.Path("Support"));
        const destPath = supportDir.appended(new Editor.Path("editor.d.ts"));

        if (!FileSystem.exists(sourcePath)) {
            console.warn("[AgentsDocs] editor.d.ts not found in plugin resources: " + sourcePath.toString(), console.None);
            return;
        }

        // Skip if already present — the file is static per plugin version,
        // so re-copying on every save is unnecessary I/O.
        if (FileSystem.exists(destPath)) {
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
     */
    private patchAgentsMd(projectDir: Editor.Path, version: string, flavor: string): void {
        const resourcesPath = this.resourcesPath;
        const agentsMdTemplatePath = resourcesPath.appended(new Editor.Path("AGENTS.md.in"));
        const agentsMdDestPath = projectDir.appended(new Editor.Path("AGENTS.md"));

        if (!FileSystem.exists(agentsMdTemplatePath)) {
            console.warn("[AgentsDocs] AGENTS.md.in template not found: " + agentsMdTemplatePath.toString(), console.None);
            return;
        }

        try {
            // Read the template content
            const rawTemplate = FileSystem.readFile(agentsMdTemplatePath);

            // Process the template with version and flavor information
            const templateContent = processTemplate(rawTemplate, version, flavor);

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
}
