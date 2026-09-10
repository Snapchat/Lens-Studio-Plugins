import * as FileSystem from 'LensStudio:FileSystem';
import {downloadFile} from "./api.js";
import {isContainedRelativePath, zipEntriesAreContained} from "./zipSafety.js";

/**
 * Downloads dream preview assets (direct files or zip archives) into a
 * TempDir, with retry/backoff for transient native unpack failures.
 */
export class PreviewDownloader {

    private static uniqueCounter = 0;

    private tempDir: FileSystem.TempDir;
    private connections: Array<Editor.ScopedConnection | Timeout> = [];
    private lastWrittenPaths: Record<string, Editor.Path> = {};

    constructor(tempDir?: FileSystem.TempDir) {
        this.tempDir = tempDir ?? FileSystem.TempDir.create();
    }

    get directory(): FileSystem.TempDir {
        return this.tempDir;
    }

    /**
     * Previews are re-downloaded under the same logical name (e.g. when a dream
     * is reopened), but the file already on disk may still be open by a Pixmap.
     * Windows keeps an exclusive lock on open files, so deleting and rewriting
     * in place fails - write to a fresh name instead.
     */
    private uniqueName(fileName: string): string {
        return `${fileName}_${Date.now().toString(36)}_${PreviewDownloader.uniqueCounter++}`;
    }

    private removeIfPossible(path: Editor.Path): void {
        try {
            if (FileSystem.exists(path)) {
                FileSystem.remove(path);
            }
        } catch (e) {
            // Still locked by whatever is displaying it - the TempDir teardown
            // will clean it up instead.
            console.error(`[AI Photo Duo] Could not remove superseded preview "${path.toString()}":`, e, console.None);
        }
    }

    private extensionForContentType(contentType: string, extractFile: string): string {
        const map: Record<string, string> = {
            "image/webp": ".webp",
            "image/png": ".png",
            "image/jpeg": ".jpg",
            "image/gif": ".gif",
        };
        if (contentType && map[contentType.split(';')[0].trim()]) {
            return map[contentType.split(';')[0].trim()];
        }
        const dotIdx = extractFile.lastIndexOf('.');
        return dotIdx >= 0 ? extractFile.substring(dotIdx) : ".webp";
    }

    download(url: string, fileName: string, callback: Function, extractFile: string = "preview.webp"): void {
        const tempDir = this.tempDir;
        downloadFile(url, (response: any) => {
            if (response.error) {
                console.error(`[AI Photo Duo] downloadFile "${fileName}" reported an error despite statusCode ${response.statusCode}: ${response.error}`);
            }
            if (response.statusCode === 200) {
                const resolvedDirectoryPath = import.meta.resolve(tempDir.path.toString());

                const bytes = response.body.toBytes();
                if (!bytes || bytes.length === 0) {
                    console.error(`[AI Photo Duo] Downloaded preview "${fileName}" has an empty body - not attempting to save it.`);
                    return;
                }

                // The dreams API serves some previews as a direct image rather than a
                // zip archive - detect that case and save the bytes as-is instead of
                // trying (and failing) to unpack them as a zip.
                const isZip = !!response.contentType && response.contentType.indexOf('zip') !== -1;

                const uniqueName = this.uniqueName(fileName);

                if (!isZip) {
                    const directPath = tempDir.path.appended(new Editor.Path(uniqueName + this.extensionForContentType(response.contentType, extractFile)));
                    const resolvedFilePath = import.meta.resolve(directPath.toString());
                    if (!resolvedFilePath.startsWith(resolvedDirectoryPath)) {
                        console.error(`[AI Photo Duo] Resolved file path is not inside the resolved directory. resolvedFilePath: ${resolvedFilePath} | resolvedDirectoryPath: ${resolvedDirectoryPath}`);
                        return;
                    }
                    try {
                        FileSystem.writeFile(directPath, bytes);
                        const supersededPath = this.lastWrittenPaths[fileName];
                        this.lastWrittenPaths[fileName] = directPath;
                        callback(directPath);
                        // Only once the consumer has switched to the new file does the
                        // previous one stand a chance of no longer being locked.
                        if (supersededPath) {
                            this.removeIfPossible(supersededPath);
                        }
                    } catch (e) {
                        console.error(`[AI Photo Duo] Failed to save direct preview "${fileName}" (contentType: ${response.contentType}):`, e);
                    }
                    return;
                }

                if (!isContainedRelativePath(extractFile)) {
                    console.error(`[AI Photo Duo] Refusing to unpack preview "${fileName}": requested entry is not a contained relative path.`);
                    return;
                }

                // Checked before the archive is handed to the native unpacker,
                // which would otherwise write entries wherever their names point.
                const entryCheck = zipEntriesAreContained(bytes);
                if (!entryCheck.contained) {
                    console.error(`[AI Photo Duo] Refusing to unpack preview "${fileName}": ${entryCheck.reason}.`);
                    return;
                }

                const retryDelaysMs = [100, 300, 600, 1200];

                const attempt = (attemptIndex: number) => {
                    // Each attempt gets its own name so a retry never has to reuse a
                    // half-written or still-locked zip from the failed attempt.
                    const attemptName = attemptIndex === 0 ? uniqueName : this.uniqueName(fileName);
                    const zipPath = tempDir.path.appended(new Editor.Path(attemptName + ".zip"));
                    const unzipDir = tempDir.path.appended(new Editor.Path(attemptName));

                    const resolvedFilePath = import.meta.resolve(zipPath.toString());
                    if (!resolvedFilePath.startsWith(resolvedDirectoryPath)) {
                        console.error(`[AI Photo Duo] Resolved file path is not inside the resolved directory. resolvedFilePath: ${resolvedFilePath} | resolvedDirectoryPath: ${resolvedDirectoryPath}`);
                        return;
                    }

                    try {
                        FileSystem.writeFile(zipPath, bytes);
                        FileSystem.createDir(unzipDir, {recursive: true} as any);
                        Editor.Compression.Zip.unpack(zipPath, unzipDir);

                        const extractPath = unzipDir.appended(new Editor.Path(extractFile));
                        const resolvedUnzipDir = import.meta.resolve(unzipDir.toString());
                        const resolvedExtractPath = import.meta.resolve(extractPath.toString());
                        if (!resolvedExtractPath.startsWith(resolvedUnzipDir)) {
                            console.error(`[AI Photo Duo] Unpacked preview "${fileName}" resolves outside its unpack directory - discarding it.`);
                            this.removeIfPossible(zipPath);
                            return;
                        }

                        const supersededPath = this.lastWrittenPaths[fileName];
                        this.lastWrittenPaths[fileName] = unzipDir;
                        callback(extractPath);
                        this.removeIfPossible(zipPath);
                        if (supersededPath) {
                            this.removeIfPossible(supersededPath);
                        }
                    } catch (e) {
                        // The native write/unpack sequence can transiently fail to open
                        // the just-written zip (seen as "Cannot open file (file, RW, ...)")
                        // if the file write hasn't fully released its handle yet. Retry a
                        // few times with backoff before giving up.
                        if (attemptIndex < retryDelaysMs.length) {
                            console.error(`[AI Photo Duo] Attempt ${attemptIndex + 1} failed to download/unpack preview "${fileName}", retrying in ${retryDelaysMs[attemptIndex]}ms:`, e);
                            // Keep a reference to the timer - an unreferenced Timeout can be
                            // silently garbage-collected before it fires.
                            this.connections.push(setTimeout(() => attempt(attemptIndex + 1), retryDelaysMs[attemptIndex]));
                        } else {
                            console.error(`[AI Photo Duo] Failed to download/unpack preview "${fileName}" after ${attemptIndex + 1} attempts:`, e);
                        }
                    }
                };

                attempt(0);
            }
            else {
                console.error(`[AI Photo Duo] Failed to download preview "${fileName}", status code: ${response.statusCode}`);
            }
        })
    }
}
