import { Preset } from 'LensStudio:Preset';

export async function createJSONAsset(model, destination) {
    const meta = await model.project.assetManager.importExternalFileAsync(import.meta.resolve('Resources/Empty JSON.json'), destination, Editor.Model.ResultType.Unpacked);
    return meta.primary;
}
export class EmptyJsonAssetPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.JsonAssetPreset.EmptyJson',
            name: 'Empty JSON',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/JsonFile.svg')),
            section: 'General',
            entityType: 'JsonAsset'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createJSONAsset(model, destination);
    }
}
