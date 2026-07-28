import * as FileSystem from 'LensStudio:FileSystem';

export class Storage {
    directory: { path: Editor.Path };

    constructor(path?: Editor.Path) {
        if (path) {
            this.directory = { "path": path };
        } else {
            this.directory = FileSystem.TempDir.create();
        }
    }

    createFile(name: string, content: string | Uint8Array) {
        const filePath = this.directory.path.appended(new Editor.Path(name));

        if (this.verifyPath(filePath)) {
            FileSystem.writeFile(filePath, content);

            return filePath;
        } else {
            throw new Error(`Resolved file path is not inside the resolved directory.`);
        }
    }

    read(path: Editor.Path, readFunction: Function) {
        if (this.verifyPath(path)) {
            return readFunction(path);
        } else {
            console.error("[Storage] Can't read file outside of storage directory.");
            return null;
        }
    }

    unpackContent(archivePath: Editor.Path) {
        if (!FileSystem.exists(archivePath)) {
            throw Error(`Unpack content failed: file not exists (${archivePath})`)
        }
        Editor.Compression.Zip.unpack(archivePath, this.directory.path.appended(new Editor.Path(archivePath.fileNameBase)));

        return this.directory.path.appended(new Editor.Path(archivePath.fileNameBase));
    }

    readFile(path: Editor.Path) {
        return this.read(path, FileSystem.readFile);
    }

    readBytes(path: Editor.Path) {
        return this.read(path, FileSystem.readBytes);
    }

    verifyPath(filePath: Editor.Path) {
        const resolvedDirectoryPath = import.meta.resolve(this.directory.path.toString());
        const resolvedFilePath = import.meta.resolve(filePath.toString());

        return resolvedFilePath.startsWith(resolvedDirectoryPath);
    }
}
