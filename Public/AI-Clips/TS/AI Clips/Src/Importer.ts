// @ts-nocheck
import app from "./app.js";
import * as FileSystem from 'LensStudio:FileSystem';

export class Importer {
    private tempDir: FileSystem.TempDir;

    constructor() {
        this.tempDir = FileSystem.TempDir.create();
    }

    private async importEffect(filePath: any, packId: string, previewsPath: string[]) {
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

    private findInterface(pluginSystem: any, interfaceID: any) {
        return pluginSystem.findInterface(interfaceID);
    }

    importToProject(packId: string, previewsPath: string[]): Promise<any> {
        return this.importEffect(import.meta.resolve('./Resources/AI Clips.lsc'), packId, previewsPath);
    }
}
