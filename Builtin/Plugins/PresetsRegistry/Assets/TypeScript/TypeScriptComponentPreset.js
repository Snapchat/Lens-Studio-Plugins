import { Preset } from 'LensStudio:Preset';

export async function createTypeScriptAsset(model, destination) {
    const meta = await model.project.assetManager.importExternalFileAsync(import.meta.resolve('Resources/Untitled TypeScript Component.ts'), destination, Editor.Model.ResultType.Unpacked);
    return meta.primary;
}
export class TypeScriptComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.TypeScriptComponentPreset',
            name: 'TypeScript Component',
            description: 'Creates empty TypeScript asset file',
            icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/CustomComponent.svg')),
            section: 'Scripting',
            entityType: 'TypeScriptAsset'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createTypeScriptAsset(model, destination);
    }
}
