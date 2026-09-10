/**
 * ls-live-instance.json utilities.
 * Pure functions for building the record that describes how to restore Lens
 * Studio for the currently open project.
 *
 * The filename, the key names and the schema version below are a cross-repo
 * contract: a crash-recovery hook that ships separately reads them. A mismatch
 * fails silently — the hook reads nothing and reports every failure as
 * indeterminate — so changing any of them is a coordinated two-repo change.
 */

/** Name of the record file written into the open project's directory. */
export const LIVE_INSTANCE_FILENAME = "ls-live-instance.json";

/**
 * Format version of the record. Deliberately a string: the reader is a shell
 * script with no JSON parser and no type distinction, and it recognises exactly
 * this value. Bumping it degrades an older hook to its record-free path.
 */
export const LIVE_INSTANCE_SCHEMA_VERSION = "1";

export interface LiveInstanceFields {
    /**
     * Absolute path to the running Lens Studio executable. Optional: Studio
     * builds without the native value simply don't have one, which is an
     * expected outcome rather than a failure.
     */
    executablePath?: string;
    /** The running Studio's version string. */
    studioVersion: string;
    /** Absolute path to the project file this instance has open. */
    projectPath: string;
}

/**
 * Serialize the live-instance record.
 *
 * The layout is part of the contract, not a formatting preference: the reader
 * extracts single keys with a line-oriented pattern match. Keep the object flat
 * — no nested objects, no arrays — every value a JSON string, and keep the
 * two-space indentation that puts one key on each line. Switching to compact
 * serialisation would break the reader silently.
 */
export function buildLiveInstanceRecord(fields: LiveInstanceFields): string {
    const record: Record<string, string> = {
        schemaVersion: LIVE_INSTANCE_SCHEMA_VERSION,
    };

    // Omitted entirely when unavailable, never written as an empty string, so
    // the reader's "no executable path" branch fires.
    if (fields.executablePath) {
        record.executablePath = fields.executablePath;
    }

    record.studioVersion = fields.studioVersion;
    record.projectPath = fields.projectPath;

    return JSON.stringify(record, null, 2) + "\n";
}
