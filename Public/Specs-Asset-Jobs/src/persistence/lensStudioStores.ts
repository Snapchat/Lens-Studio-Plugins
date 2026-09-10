import * as FileSystem from "LensStudio:FileSystem";
import type { PersistedBatch } from "../domain/contracts.js";
import type { OutputFileStore, StateRepository } from "../service/specsAssetJobCoordinator.js";
import { durableWrite, type OverwriteCapableFs } from "./durableWrite.js";
import { PersistedBatchJournal } from "./stateJournal.js";

export class LensStudioStateRepository implements StateRepository {
  private readonly journal: PersistedBatchJournal<Editor.Path>;

  constructor(projectFile: Editor.Path) {
    const directory = projectFile.parent.appended(new Editor.Path(".clad"));
    const stateFile = directory.appended(new Editor.Path("asset-jobs.v1.json"));
    if (!FileSystem.exists(directory)) {
      FileSystem.createDir(directory, { recursive: true } as FileSystem.CreateDirOptions);
    }
    this.journal = new PersistedBatchJournal(
      {
        exists: (path) => FileSystem.exists(path),
        read: (path) => FileSystem.readFile(path),
        write: (path, contents) => FileSystem.writeFile(path, contents),
        remove: (path) => FileSystem.remove(path),
        rename: (from, to) => FileSystem.rename(from, to),
      },
      {
        primary: stateFile,
        backup: new Editor.Path(`${stateFile.toString()}.bak`),
        temporary: new Editor.Path(`${stateFile.toString()}.tmp`),
      },
      (message) => console.warn(`[SpecsAssetJobs] ${message}`, console.None),
    );
  }

  load(): PersistedBatch | null {
    return this.journal.load();
  }

  save(batch: PersistedBatch): void {
    this.journal.save(batch);
  }
}

export class LensStudioOutputFileStore implements OutputFileStore {
  private readonly fs: OverwriteCapableFs<Editor.Path> = {
    exists: (path) => FileSystem.exists(path),
    size: (path) => FileSystem.size(path),
    writeFile: (path, bytes) => FileSystem.writeFile(path, bytes),
    remove: (path) => FileSystem.remove(path),
    rename: (from, to) => FileSystem.rename(from, to),
  };

  constructor(
    private readonly assetsDirectory: Editor.Path,
    private readonly warn: (message: string) => void = (message) =>
      console.warn(`[SpecsAssetJobs] ${message}`, console.None),
  ) {}

  exists(relativePath: string): boolean {
    return FileSystem.exists(this.path(relativePath));
  }

  write(relativePath: string, bytes: Uint8Array, allowOverwrite = false): void {
    const finalPath = this.path(relativePath);
    if (!FileSystem.exists(finalPath.parent)) {
      FileSystem.createDir(finalPath.parent, { recursive: true } as FileSystem.CreateDirOptions);
    }
    durableWrite(
      this.fs,
      {
        final: finalPath,
        temporary: new Editor.Path(`${finalPath.toString()}.clad-download.tmp`),
        sideways: new Editor.Path(`${finalPath.toString()}.clad-replaced.tmp`),
      },
      bytes,
      { allowOverwrite, conflictLabel: relativePath },
      this.warn,
    );
  }

  private path(relativePath: string): Editor.Path {
    if (!relativePath.startsWith("Assets/") || relativePath.includes("\\")) {
      throw new Error("Output path must be project-relative under Assets");
    }
    const path = this.assetsDirectory.appended(new Editor.Path(relativePath.slice("Assets/".length)));
    if (!path.isInside(this.assetsDirectory)) throw new Error("Output path escaped the project Assets directory");
    return path;
  }
}
