import app from "../Application.js";
export class Importer {
    async import(textureBytes, prompt, pluginSystemOverride) {
        const pluginSystem = pluginSystemOverride ?? app.pluginSystem;
        const model = pluginSystem.findInterface(Editor.Model.IModel);
        const assetManager = model.project.assetManager;
        let textureName = prompt.replace(/[^a-zA-Z0-9\s]/g, "").trim().slice(0, 50).trim();
        if (!textureName) {
            textureName = "Texture Generation Result";
        }
        const textureFileName = textureName + ".png";
        const destPath = new Editor.Path("Generated Textures");
        const generatedTexture = assetManager.importExternalFile(app.storage.createFile(textureFileName, textureBytes), new Editor.Model.SourcePath(destPath, Editor.Model.SourceRootDirectory.Assets), Editor.Model.ResultType.Unpacked);
        return {
            textureAsset: generatedTexture.primary,
        };
    }
}
