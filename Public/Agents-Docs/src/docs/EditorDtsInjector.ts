import * as FileSystem from "LensStudio:FileSystem";

import { formatError, fetchFailureMessage, logFetchFailure } from "../logging.js";
import { ContentfulDocsProvider } from "./ContentfulDocsProvider.js";

type AssetFetchStatus = "not-started" | "pending" | "succeeded" | "failed";

/**
 * Fetches editor.d.ts (Editor API type definitions) from Contentful once per
 * session, caches it, and writes it into a project's Support/ directory.
 */
export class EditorDtsInjector {
    /** Cached editor.d.ts content fetched from Contentful once per session. */
    private cachedEditorDts: string | null = null;
    private fetchStatus: AssetFetchStatus = "not-started";

    constructor(
        private readonly pluginSystem: Editor.PluginSystem,
        private readonly provider: ContentfulDocsProvider
    ) {}

    /**
     * Inject the cached editor.d.ts if available; otherwise retry after a
     * previous fetch failure.
     */
    ensure(projectDir: Editor.Path): void {
        if (this.cachedEditorDts !== null) {
            this.injectCached(projectDir);
            return;
        }

        if (this.fetchStatus === "failed") {
            void this.fetchAndInject();
            return;
        }

        this.injectCached(projectDir);
    }

    async fetchAndInject(): Promise<void> {
        if (this.fetchStatus === "pending") {
            return;
        }

        if (!this.provider.editorDtsEntryIdsConfigured()) {
            // Entry IDs not configured yet; skip silently until they are filled in.
            this.fetchStatus = "failed";
            return;
        }

        this.fetchStatus = "pending";
        try {
            const content = await this.provider.fetchEditorDts();
            this.cachedEditorDts = content;
            this.fetchStatus = "succeeded";
            this.injectIntoCurrentProject();
        } catch (e) {
            this.cachedEditorDts = null;
            this.fetchStatus = "failed";
            logFetchFailure("editor.d.ts", e);
        }
    }

    private injectIntoCurrentProject(): void {
        try {
            const m = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
            if (!Editor.isNull(m.project) && !Editor.isNull(m.project.projectDirectory)) {
                this.injectCached(m.project.projectDirectory);
            }
        } catch (e) {
            console.warn(
                "[AgentsDocs] Fetched editor.d.ts but could not inject it into the current project; will retry on the next project load/save. Error: " + formatError(e)
            );
        }
    }

    /**
     * Write editor.d.ts into the project's Support/ directory from the
     * Contentful-fetched cache. Always overwrites so users get updated
     * definitions on plugin upgrades or new Lens Studio versions.
     * On fetch failure the existing Support/editor.d.ts (if any) is left untouched.
     */
    private injectCached(projectDir: Editor.Path): void {
        if (this.cachedEditorDts === null) {
            if (this.fetchStatus === "failed") {
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
}
