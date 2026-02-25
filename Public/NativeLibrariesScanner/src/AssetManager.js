export class AssetManager {
    constructor(impl) {
        this.impl = impl;
    }

    findImportedCopy(absolutePath, sourcePath) {
        if (!(absolutePath instanceof Editor.Path))
            throw new TypeError('absolutePath must be an Editor.Path');

        if (!(sourcePath instanceof Editor.Model.SourcePath))
            throw new TypeError('sourcePath must be an Editor.Model.SourcePath');

        return this.impl.findImportedCopy(absolutePath, sourcePath);
    }

    importExternalFile(absolutePath, sourcePath) {
        if (!(absolutePath instanceof Editor.Path))
            throw new TypeError('absolutePath must be an Editor.Path');

        if (!(sourcePath instanceof Editor.Model.SourcePath))
            throw new TypeError('sourcePath must be an Editor.Model.SourcePath');

        return this.impl.importExternalFile(absolutePath, sourcePath);
    }
}
