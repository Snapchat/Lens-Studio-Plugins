import * as AssetLibrary from "LensStudio:AssetLibrary";
import * as App from "LensStudio:App";

import { fetchContentfulEntry } from "../contentfulFetch.js";

/** Public Contentful entry ID for AGENTS.md content. */
const AGENTS_MD_ENTRY_ID = "5OdvA4h0aG8nrSINK9WDKR";

/** Contentful entry IDs for editor.d.ts content. */
const EDITOR_DTS_INTERNAL_ENTRY_ID = "25uXmoF3jfh5EVdV4vKDDE";
const EDITOR_DTS_PUBLIC_ENTRY_ID = "5PlRuLmYco73ADkBUfsVHS";

/**
 * Fetches Agents-Docs content (AGENTS.md, editor.d.ts) from Contentful.
 *
 * Encapsulates the public AGENTS.md fetch, plus the internal-vs-public
 * asset-library fallback used by docs that still have internal variants.
 */
export class ContentfulDocsProvider {
    /** Emits the internal editor.d.ts fallback warning at most once per session. */
    private warnedInternalEditorDtsFallback: boolean = false;

    constructor(
        private readonly pluginSystem: Editor.PluginSystem,
        private readonly authorization: Editor.IAuthorization | null
    ) {}

    /** Whether at least one editor.d.ts Contentful entry ID is configured. */
    editorDtsEntryIdsConfigured(): boolean {
        return Boolean(EDITOR_DTS_INTERNAL_ENTRY_ID || EDITOR_DTS_PUBLIC_ENTRY_ID);
    }

    fetchAgentsMd(): Promise<string> {
        return fetchContentfulEntry(this.pluginSystem, {
            entryId: AGENTS_MD_ENTRY_ID,
            space: AssetLibrary.Space.Public,
        });
    }

    fetchEditorDts(): Promise<string> {
        return this.fetchEditorDtsEntry();
    }

    private async fetchEditorDtsEntry(): Promise<string> {
        // Internal editor.d.ts is only available on internal builds for
        // authorized users. Fall back to public editor.d.ts otherwise.
        // @ts-ignore — App.isInternal is @hidden but stable.
        if (App.isInternal && this.authorization?.isAuthorized && EDITOR_DTS_INTERNAL_ENTRY_ID) {
            try {
                return await fetchContentfulEntry(this.pluginSystem, {
                    entryId: EDITOR_DTS_INTERNAL_ENTRY_ID,
                    space: AssetLibrary.Space.Internal,
                });
            } catch (e) {
                console.log("[AgentsDocs] Internal asset-library fetch error:", e, console.None);
                if (!this.warnedInternalEditorDtsFallback) {
                    this.warnedInternalEditorDtsFallback = true;
                    console.warn("[AgentsDocs] Could not download internal editor.d.ts. Falling back to public editor.d.ts for now.");
                }
            }
        }
        return fetchContentfulEntry(this.pluginSystem, {
            entryId: EDITOR_DTS_PUBLIC_ENTRY_ID,
            space: AssetLibrary.Space.Public,
        });
    }
}
