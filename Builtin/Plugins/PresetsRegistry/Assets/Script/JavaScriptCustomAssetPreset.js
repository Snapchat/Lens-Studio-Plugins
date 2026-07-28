import { Preset } from 'LensStudio:Preset';

export async function createJavaScriptAsset(model, destination) {
    const meta = await model.project.assetManager.importExternalFileAsync(import.meta.resolve('Resources/Untitled JavaScript Custom Asset.js'), destination, Editor.Model.ResultType.Unpacked);
    return meta.primary;
}

export class JavaScriptCustomAssetPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.JavaScriptCustomAssetPreset',
            name: 'JavaScript Custom Asset',
            description: 'Creates empty JavaScript custom asset file',
            icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/CustomAsset.svg')),
            section: 'Scripting',
            entityType: 'JavaScriptAsset'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createJavaScriptAsset(model, destination);
    }
}
