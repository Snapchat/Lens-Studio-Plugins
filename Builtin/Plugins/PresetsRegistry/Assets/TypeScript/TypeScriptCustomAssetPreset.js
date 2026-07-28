import { Preset } from 'LensStudio:Preset';

export async function createTypeScriptAsset(model, destination) {
    const meta = await model.project.assetManager.importExternalFileAsync(import.meta.resolve('Resources/Untitled TypeScript Custom Asset.ts'), destination, Editor.Model.ResultType.Unpacked);
    return meta.primary;
}
export class TypeScriptCustomAssetPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.TypeScriptCustomAssetPreset',
            name: 'TypeScript Custom Asset',
            description: 'Creates empty TypeScript custom asset file',
            icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/CustomAsset.svg')),
            section: 'Scripting',
            entityType: 'TypeScriptAsset'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createTypeScriptAsset(model, destination);
    }
}
