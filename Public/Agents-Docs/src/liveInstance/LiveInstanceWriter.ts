import * as App from "LensStudio:App";
import * as FileSystem from "LensStudio:FileSystem";

import {
    LIVE_INSTANCE_FILENAME,
    buildLiveInstanceRecord,
} from "../liveInstanceUtils.js";

/** Sibling file the record is staged in before being renamed into place. */
const LIVE_INSTANCE_TEMP_FILENAME = LIVE_INSTANCE_FILENAME + ".tmp";

/**
 * Reads `LensStudio:App.executablePath`, which is absent on Studio builds older
 * than the change that added it regardless of what the type declaration says.
 * Returns undefined when unavailable so the key is omitted from the record.
 */
function readExecutablePath(): string | undefined {
    try {
        const value = (App as unknown as { executablePath?: unknown }).executablePath;
        return typeof value === "string" && value.length > 0 ? value : undefined;
    } catch (e) {
        console.error("[AgentsDocs] Error reading the Lens Studio executable path:", e, console.None);
        return undefined;
    }
}

/**
 * Writes `ls-live-instance.json` into the open project's directory, recording
 * how to restore Lens Studio for that project.
 *
 * The record describes nothing about the MCP server, so this write neither waits
 * for MCP to start nor retries. It is also never removed: how to restore the
 * project stays true whether Studio is running or not.
 */
export class LiveInstanceWriter {
    /**
     * Write the record for the given project. Safe to call repeatedly — the
     * write is skipped when the record on disk is already current.
     */
    write(projectDir: Editor.Path, projectFile: Editor.Path): void {
        try {
            const projectPath = projectFile.toString();
            if (projectPath.length === 0) {
                return;
            }

            const content = buildLiveInstanceRecord({
                executablePath: readExecutablePath(),
                studioVersion: App.version,
                projectPath,
            });

            const recordPath = projectDir.appended(new Editor.Path(LIVE_INSTANCE_FILENAME));
            if (FileSystem.exists(recordPath) && FileSystem.readFile(recordPath) === content) {
                return;
            }

            this.publish(projectDir, recordPath, content);
            console.log(`[AgentsDocs] Wrote ${LIVE_INSTANCE_FILENAME}`, console.None);
        } catch (e) {
            console.error(`[AgentsDocs] Error writing ${LIVE_INSTANCE_FILENAME}:`, e, console.None);
        }
    }

    /**
     * Stage the record in a sibling temp file and rename it into place, so a
     * reader never observes a half-written record.
     *
     * LensStudio:FileSystem has no atomic overwrite — rename() refuses a
     * destination that already exists — so an existing record is removed first.
     * A reader can therefore briefly find no record at all, which is a state it
     * already has to handle, but never a partial one.
     */
    private publish(projectDir: Editor.Path, recordPath: Editor.Path, content: string): void {
        const tempPath = projectDir.appended(new Editor.Path(LIVE_INSTANCE_TEMP_FILENAME));

        try {
            FileSystem.writeFile(tempPath, content);
            if (FileSystem.exists(recordPath)) {
                FileSystem.remove(recordPath);
            }
            FileSystem.rename(tempPath, recordPath);
        } catch (e) {
            // Never leave the project without a record: write in place instead,
            // accepting the partial-read window this one time.
            console.warn(`[AgentsDocs] Could not stage ${LIVE_INSTANCE_FILENAME}; writing it in place:`, e, console.None);
            FileSystem.writeFile(recordPath, content);
        } finally {
            // Runs whether the rename succeeded, the fallback ran, or the fallback
            // itself threw. Nothing is left to remove after a successful rename;
            // otherwise a stale .tmp would outlive the write that created it.
            try {
                if (FileSystem.exists(tempPath)) {
                    FileSystem.remove(tempPath);
                }
            } catch (e) {
                // Swallowed on purpose: throwing here would replace the in-flight
                // write error with a cleanup error, hiding the real failure.
                console.warn(`[AgentsDocs] Could not remove ${LIVE_INSTANCE_TEMP_FILENAME}:`, e, console.None);
            }
        }
    }
}
