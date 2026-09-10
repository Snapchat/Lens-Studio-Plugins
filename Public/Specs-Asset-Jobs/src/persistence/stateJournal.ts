import { parsePersistedBatch, type PersistedBatch } from "../domain/contracts.js";

export interface StateFileSystem<Path> {
  exists(path: Path): boolean;
  read(path: Path): string;
  write(path: Path, contents: string): void;
  remove(path: Path): void;
  rename(from: Path, to: Path): void;
}

export interface StateJournalPaths<Path> {
  readonly primary: Path;
  readonly backup: Path;
  readonly temporary: Path;
}

type StateRead =
  | { readonly exists: false }
  | { readonly exists: true; readonly batch: PersistedBatch }
  | { readonly exists: true; readonly error: string };

export class PersistedBatchJournal<Path> {
  constructor(
    private readonly files: StateFileSystem<Path>,
    private readonly paths: StateJournalPaths<Path>,
    private readonly onRecovery: (message: string) => void = () => undefined,
  ) {}

  load(): PersistedBatch | null {
    const primary = this.read(this.paths.primary);
    if ("batch" in primary) return primary.batch;

    const backup = this.read(this.paths.backup);
    if ("batch" in backup) {
      this.onRecovery("Recovered SPECS asset state from the last-known-good backup");
      return backup.batch;
    }
    const temporary = this.read(this.paths.temporary);
    if ("batch" in temporary) {
      this.onRecovery("Recovered SPECS asset state from a validated staged write");
      return temporary.batch;
    }
    if (!primary.exists && !backup.exists && !temporary.exists) return null;
    throw this.corrupt(primary, backup, temporary);
  }

  save(batch: PersistedBatch): void {
    const contents = `${JSON.stringify(batch)}\n`;
    parsePersistedBatch(JSON.parse(contents));

    if (this.files.exists(this.paths.temporary)) this.files.remove(this.paths.temporary);
    this.files.write(this.paths.temporary, contents);
    try {
      const staged = this.read(this.paths.temporary);
      if (!("batch" in staged)) throw new Error("Failed to stage valid SPECS asset state");

      const primary = this.read(this.paths.primary);
      const backup = this.read(this.paths.backup);
      if ("batch" in primary) {
        if (backup.exists) this.files.remove(this.paths.backup);
        this.files.rename(this.paths.primary, this.paths.backup);
      } else if (primary.exists) {
        if (!("batch" in backup)) throw this.corrupt(primary, backup);
        this.files.remove(this.paths.primary);
      } else if (backup.exists && !("batch" in backup)) {
        throw this.corrupt(primary, backup);
      }
      this.files.rename(this.paths.temporary, this.paths.primary);
    } finally {
      if (this.files.exists(this.paths.temporary)) this.files.remove(this.paths.temporary);
    }
  }

  private read(path: Path): StateRead {
    if (!this.files.exists(path)) return { exists: false };
    try {
      return {
        exists: true,
        batch: parsePersistedBatch(JSON.parse(this.files.read(path))),
      };
    } catch (error) {
      return {
        exists: true,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private corrupt(primary: StateRead, backup: StateRead, temporary?: StateRead): Error {
    const describe = (state: StateRead): string => !state.exists
      ? "missing"
      : "error" in state ? state.error : "valid";
    const staged = temporary === undefined ? "" : `; staged ${describe(temporary)}`;
    return new Error(
      `Corrupt SPECS asset state: primary ${describe(primary)}; backup ${describe(backup)}${staged}. ` +
      "To abandon any unresolved remote generation, remove .clad/asset-jobs.v1.json plus its .bak and .tmp files, then reopen the project.",
    );
  }
}
