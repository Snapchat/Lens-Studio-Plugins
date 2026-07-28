import { Preset } from 'LensStudio:Preset';

export async function createTypeScriptModule(model, destination) {
    const meta = await model.project.assetManager.importExternalFileAsync(import.meta.resolve('Resources/Untitled TypeScript Module.ts'), destination, Editor.Model.ResultType.Unpacked);
    return meta.primary;
}
export class TypeScriptModulePreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.TypeScriptModulePreset',
            name: 'TypeScript Module',
            description: 'Creates empty TypeScript module file',
            icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/TypeScript.svg')),
            section: 'Scripting',
            entityType: 'TypeScriptAsset'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createTypeScriptModule(model, destination);
    }
}
