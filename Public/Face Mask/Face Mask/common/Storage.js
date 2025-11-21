import * as FileSystem from 'LensStudio:FileSystem';
export class Storage {
    constructor(path) {
        if (path) {
            this.directory = { "path": path };
        }
        else {
            this.directory = FileSystem.TempDir.create();
        }
    }
    createFile(name, content) {
        const filePath = this.directory.path.appended(new Editor.Path(name));
        if (this.verifyPath(filePath)) {
            FileSystem.writeFile(filePath, content);
            return filePath;
        }
        else {
            throw new Error(`Resolved file path is not inside the resolved directory.`);
        }
    }
    read(path, readFunction) {
        if (this.verifyPath(path)) {
            return readFunction(path);
        }
        else {
            console.error("[Storage] Can't read file outside of storage directory.");
            return null;
        }
    }
    unpackContent(archivePath) {
        if (!FileSystem.exists(archivePath)) {
            throw Error(`Unpack content failed: file not exists (${archivePath})`);
        }
        Editor.Compression.Zip.unpack(archivePath, this.directory.path.appended(new Editor.Path(archivePath.fileNameBase)));
        return this.directory.path.appended(new Editor.Path(archivePath.fileNameBase));
    }
    readFile(path) {
        return this.read(path, FileSystem.readFile);
    }
    readBytes(path) {
        return this.read(path, FileSystem.readBytes);
    }
    verifyPath(filePath) {
        const resolvedDirectoryPath = import.meta.resolve(this.directory.path.toString());
        const resolvedFilePath = import.meta.resolve(filePath.toString());
        return resolvedFilePath.startsWith(resolvedDirectoryPath);
    }
}
