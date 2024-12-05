import { Preset } from 'LensStudio:Preset';

export async function createJSONAsset(model, destination) {
    const meta = await model.project.assetManager.importExternalFileAsync(import.meta.resolve('Resources/tsconfig.json'), destination, Editor.Model.ResultType.Unpacked);
    return meta.primary;
}
export class TsConfigPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.JsonAssetPreset.TsConfig',
            interfaces: Preset.descriptor().interfaces,
            name: 'TS Config',
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
