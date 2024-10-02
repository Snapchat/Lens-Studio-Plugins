import { Preset } from 'LensStudio:Preset';

export async function createTypeScriptAsset(model, destination) {
    const meta = await model.project.assetManager.importExternalFileAsync(import.meta.resolve('Resources/Untitled TypeScript.ts'), destination, Editor.Model.ResultType.Unpacked);
    return meta.primary;
}
export class TypeScriptComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.TypeScriptComponentPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'TypeScript File',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/TypeScript.svg')),
            section: 'General',
            entityType: 'TypeScriptAsset'
        };
    }
    async createAsync(destination) {
        const model = super.findInterface(Editor.ModelComponentID);
        return await createTypeScriptAsset(model, destination);
    }
}
