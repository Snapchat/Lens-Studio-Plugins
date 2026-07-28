import { Preset } from 'LensStudio:Preset';

export async function createJavaScriptAsset(model, destination) {
    const meta = await model.project.assetManager.importExternalFileAsync(import.meta.resolve('Resources/Untitled JavaScript Module.js'), destination, Editor.Model.ResultType.Unpacked);
    return meta.primary;
}

export class JavaScriptModulePreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.JavaScriptModulePreset',
            name: 'JavaScript Module',
            description: 'Creates empty JavaScript module file',
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
