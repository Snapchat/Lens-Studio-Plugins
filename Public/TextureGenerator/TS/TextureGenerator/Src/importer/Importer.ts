import app from "../Application.js";

export interface TextureImportResult {
    textureAsset: Editor.Assets.Asset;
}

export class Importer {

    async import(textureBytes: Uint8Array, prompt: string, pluginSystemOverride?: Editor.PluginSystem): Promise<TextureImportResult> {
        const pluginSystem: Editor.PluginSystem = pluginSystemOverride ?? (app.pluginSystem as Editor.PluginSystem);
        const model = pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
        const assetManager: Editor.Model.AssetManager = model.project.assetManager

        let textureName = prompt.replace(/[^a-zA-Z0-9\s]/g, "").trim().slice(0, 50).trim();
        if (!textureName) {
            textureName = "Texture Generation Result";
        }
        const textureFileName = textureName + ".png";
        const destPath = new Editor.Path("Generated Textures");
        const generatedTexture = assetManager.importExternalFile(
            app.storage.createFile(textureFileName, textureBytes),
            new Editor.Model.SourcePath(destPath, Editor.Model.SourceRootDirectory.Assets),
            Editor.Model.ResultType.Unpacked
        );

        return {
            textureAsset: generatedTexture.primary,
        };
    }
}
