import app from "../Application.js";

export class Importer {
    constructor() {}

    async import(textureBytes: Uint8Array) {
        const model = app.findInterface(Editor.Model.IModel) as any;
        const assetManager = model.project.assetManager;

        await assetManager.importExternalFileAsync(
            app.storage.createFile("Texture Generation Result.jpg", textureBytes),
            new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets),
            Editor.Model.ResultType.Auto
        );

        return new Promise<void>((resolve) => {
            resolve();
        });
    }
}
