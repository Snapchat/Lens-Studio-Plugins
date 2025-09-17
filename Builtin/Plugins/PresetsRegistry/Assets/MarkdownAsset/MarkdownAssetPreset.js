import { Preset } from 'LensStudio:Preset';

export async function createMarkdownAsset(model, destination) {
    const meta = await model.project.assetManager.importExternalFileAsync(import.meta.resolve('Resources/Untitled Markdown.md'), destination, Editor.Model.ResultType.Unpacked);
    return meta.primary;
}

export class MarkdownAssetPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.MarkdownPreset',
            name: 'Markdown File',
            description: '',
            icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/Markdown.svg')),
            section: 'Scripting',
            entityType: 'MarkdownAsset'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createMarkdownAsset(model, destination);
    }
}
