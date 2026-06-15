import * as FileSystem from "LensStudio:FileSystem";

export class StorageProvider {
    private directory: { path: Editor.Path };

    constructor(path?: Editor.Path) {
        if (path) {
            this.directory = { path };
        } else {
            this.directory = FileSystem.TempDir.create();
        }
    }

    createFile(name: Editor.Path, content: Uint8Array): Editor.Path {
        const filePath = this.directory.path.appended(name);
        FileSystem.writeFile(filePath, content);
        return filePath;
    }

    readBytes(path: Editor.Path): Uint8Array {
        return FileSystem.readBytes(path) as Uint8Array;
    }
}
