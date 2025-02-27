import { Preset } from 'LensStudio:Preset';

export async function createJavaScriptAsset(model, destination) {
    const meta = await model.project.assetManager.importExternalFileAsync(import.meta.resolve('Resources/Untitled JavaScript.js'), destination, Editor.Model.ResultType.Unpacked);
    return meta.primary;
}

export class JavaScriptPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.JavaScriptPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'JavaScript File',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/JavaScript.svg')),
            section: 'Scripting',
            entityType: 'JavaScriptAsset'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createJavaScriptAsset(model, destination);
    }
}
