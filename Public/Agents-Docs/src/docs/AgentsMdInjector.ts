import * as FileSystem from "LensStudio:FileSystem";

import { logFetchFailure } from "../logging.js";
import {
    buildManagedAgentsMd,
    getAgentsMdMergeFailureMessage,
    mergeAgentsMd,
} from "../contentUtils.js";
import { ContentfulDocsProvider } from "./ContentfulDocsProvider.js";

/**
 * Fetches AGENTS.md from Contentful and injects it into the project root,
 * preserving custom content outside the Lens Studio managed region.
 */
export class AgentsMdInjector {
    /** Prevents older overlapping AGENTS.md fetches from writing after a newer injection starts. */
    private injectionGeneration: number = 0;

    constructor(private readonly provider: ContentfulDocsProvider) {}

    /**
     * Inject AGENTS.md into the project root from freshly fetched Contentful content.
     * Only the Lens Studio managed region is replaced on future project opens.
     * Custom content outside the managed markers is preserved. Existing files
     * without Lens Studio markers are treated as user-owned and left untouched.
     */
    async inject(projectDir: Editor.Path): Promise<void> {
        const generation = ++this.injectionGeneration;
        let latestAgentsMd: string;

        try {
            latestAgentsMd = await this.provider.fetchAgentsMd();
        } catch (e) {
            logFetchFailure("AGENTS.md", e);
            return;
        }

        if (generation !== this.injectionGeneration) {
            return;
        }

        const destPath = projectDir.appended(new Editor.Path("AGENTS.md"));

        try {
            let nextContent: string;

            if (FileSystem.exists(destPath)) {
                const existing = FileSystem.readFile(destPath);
                const merged = mergeAgentsMd(existing, latestAgentsMd);
                if (merged === null) {
                    const failureMessage = getAgentsMdMergeFailureMessage(existing) ?? "existing AGENTS.md could not be merged; AGENTS.md was not injected.";
                    console.warn("[AgentsDocs] Could not inject AGENTS.md: " + failureMessage);
                    return;
                }
                nextContent = merged;
            } else {
                nextContent = buildManagedAgentsMd(latestAgentsMd);
            }

            FileSystem.writeFile(destPath, nextContent);
            console.log("[AgentsDocs] Injected AGENTS.md", console.None);
        } catch (e) {
            console.warn("[AgentsDocs] Could not inject AGENTS.md due to a file system error; AGENTS.md was not injected:", e);
        }
    }
}
