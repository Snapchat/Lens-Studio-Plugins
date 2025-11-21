import app from "../Application.js";
export class Importer {
    constructor() { }
    async import(textureBytes) {
        const model = app.findInterface(Editor.Model.IModel);
        const assetManager = model.project.assetManager;
        await assetManager.importExternalFileAsync(app.storage.createFile("Texture Generation Result.jpg", textureBytes), new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets), Editor.Model.ResultType.Auto);
        return new Promise((resolve) => {
            resolve();
        });
    }
}
