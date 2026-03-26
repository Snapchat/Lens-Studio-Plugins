// @ts-nocheck
import app from "./app.js";
import * as FileSystem from 'LensStudio:FileSystem';
export class Importer {
    constructor() {
        this.tempDir = FileSystem.TempDir.create();
    }
    async importEffect(filePath, packId, previewsPath) {
        const model = this.findInterface(app.pluginSystem, Editor.Model.IModel);
        const assetManager = model.project.assetManager;
        const scene = model.project.scene;
        const selection = model.project.selection;
        const scriptAssetImportResult = await assetManager.importExternalFileAsync(filePath, new Editor.Path('/'), Editor.Model.ResultType.Auto);
        const videoPreviewImportResult = await assetManager.importExternalFileAsync(previewsPath[0], new Editor.Path('./AI Clips Resources/'), Editor.Model.ResultType.Auto);
        const scriptAsset = scriptAssetImportResult.primary;
        scriptAsset.setScriptInputHidden('outputTexture', true);
        const so = scene.addSceneObject(null);
        so.name = "AI Clips";
        const scriptComponent = so.addComponent('ScriptComponent');
        scriptComponent.scriptAsset = scriptAsset;
        scriptComponent.dreamPackId = packId;
        scriptComponent.preview = videoPreviewImportResult.primary;
        return so;
    }
    findInterface(pluginSystem, interfaceID) {
        return pluginSystem.findInterface(interfaceID);
    }
    importToProject(packId, previewsPath) {
        return this.importEffect(import.meta.resolve('./Resources/AI Clips.lsc'), packId, previewsPath);
    }
}
