/**
 * Durable file replacement, separated from Lens Studio's `FileSystem` (injected as
 * `fs`) so the non-clobbering-rename logic can be unit-tested.
 */
export interface OverwriteCapableFs<P> {
  exists(path: P): boolean;
  size(path: P): number;
  writeFile(path: P, bytes: Uint8Array): void;
  remove(path: P): void;
  rename(from: P, to: P): void;
}

export interface DurableWritePaths<P> {
  readonly final: P;
  readonly temporary: P;
  readonly sideways: P;
}

export interface DurableWriteOptions {
  /** When the final path is occupied, replace it only if set; otherwise refuse. */
  readonly allowOverwrite: boolean;
  /** The project-relative path named in an OUTPUT_CONFLICT refusal. */
  readonly conflictLabel: string;
}

/**
 * Stage `bytes` at `temporary`, verify it, then swap into `final`. Because rename does
 * not clobber, an occupied `final` is moved to `sideways` first and dropped only after
 * the swap lands — and restored if it fails, so a failed overwrite never empties `final`.
 */
export function durableWrite<P>(
  fs: OverwriteCapableFs<P>,
  paths: DurableWritePaths<P>,
  bytes: Uint8Array,
  options: DurableWriteOptions,
  warn: (message: string) => void,
): void {
  const { final, temporary, sideways } = paths;

  if (fs.exists(temporary)) fs.remove(temporary);
  fs.writeFile(temporary, bytes);
  try {
    if (fs.size(temporary) !== bytes.length) throw new Error("Downloaded GLB was incomplete");
    if (!fs.exists(final)) {
      fs.rename(temporary, final); // nothing to protect; a straight swap is durable
      return;
    }
    // A file the caller did not flag for overwrite is foreign; refuse it.
    if (!options.allowOverwrite) throw new Error(`OUTPUT_CONFLICT: ${options.conflictLabel}`);
  } catch (error) {
    if (fs.exists(temporary)) fs.remove(temporary);
    throw error;
  }

  // Move the existing file aside, keeping it until the replacement lands.
  if (fs.exists(sideways)) fs.remove(sideways);
  fs.rename(final, sideways);
  try {
    fs.rename(temporary, final);
  } catch (error) {
    try {
      fs.rename(sideways, final); // restore the original
    } catch (restoreError) {
      // Not lost — still at the backup path — but no longer at `final`.
      warn(
        `Could not restore the original output after a failed overwrite; it remains at the backup path: ` +
        `${restoreError instanceof Error ? restoreError.message : String(restoreError)}`,
      );
    }
    if (fs.exists(temporary)) fs.remove(temporary);
    throw error;
  }

  try {
    fs.remove(sideways);
  } catch (error) {
    // Replacement is already in place; failing to drop the backup only leaks it.
    warn(`Could not remove the replaced-output backup: ${error instanceof Error ? error.message : String(error)}`);
  }
}
