import app from "../Application.js";
import * as FileSystem from 'LensStudio:FileSystem';
export class Importer {
    constructor() {
        this.tempDir = FileSystem.TempDir.create();
    }
    async import(textureBytes, prompt) {
        const pluginSystem = app.pluginSystem;
        const model = pluginSystem.findInterface(Editor.Model.IModel);
        const assetManager = model.project.assetManager;
        let textureFileName = prompt.replace(/[^a-zA-Z0-9\s]/g, "_");
        // If the result only contains underscores and spaces, use default name
        if (/^[_\s]+$/.test(textureFileName)) {
            textureFileName = "Texture Generation Result";
        }
        textureFileName += ".jpg";
        const generatedTexture = assetManager.importExternalFile(app.storage.createFile(textureFileName, textureBytes), new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets), Editor.Model.ResultType.Auto);
        const textureGenResultPackage = assetManager.importExternalFile(new Editor.Path(import.meta.resolve("../Resources/Texture Generation Result.lspkg")), new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets), Editor.Model.ResultType.Unpacked);
        let placeholderFile;
        let nativePackageDescriptorFile;
        for (let i = 0; i < textureGenResultPackage.files.length; i++) {
            if (textureGenResultPackage.files[i].primaryAsset.name === "placeholder") {
                placeholderFile = textureGenResultPackage.files[i].sourcePath;
            }
            else if (textureGenResultPackage.files[i].primaryAsset.type === "NativePackageDescriptor") {
                nativePackageDescriptorFile = textureGenResultPackage.files[i].primaryAsset;
            }
        }
        assetManager.remove(new Editor.Model.SourcePath(placeholderFile, Editor.Model.SourceRootDirectory.Assets));
        assetManager.move(generatedTexture.primary.fileMeta, new Editor.Model.SourcePath(textureGenResultPackage.path, Editor.Model.SourceRootDirectory.Assets));
        const actionManager = pluginSystem.findInterface(Editor.IPackageActions);
        const exportOptions = new Editor.Model.ExportOptions();
        const exportPath = new Editor.Path(this.tempDir.path + "/Texture Generation Result.lspkg");
        exportOptions.packagePolicy = Editor.Assets.PackagePolicy.CanBeUnpacked;
        actionManager.exportPackage(nativePackageDescriptorFile, exportPath, exportOptions);
        let packedTextureGenPackage = assetManager.importExternalFile(exportPath, new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Packages), Editor.Model.ResultType.Packed);
        assetManager.remove(new Editor.Model.SourcePath(textureGenResultPackage.path, Editor.Model.SourceRootDirectory.Assets));
        return new Promise((resolve) => {
            resolve();
        });
    }
}
