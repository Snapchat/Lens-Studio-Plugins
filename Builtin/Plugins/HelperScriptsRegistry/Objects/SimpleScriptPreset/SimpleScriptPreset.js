import { Preset } from 'LensStudio:Preset';

function createSimpleScriptPreset(name, relativeLsoPath, description) {
    class SimpleScriptPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.SimpleScriptPresets.${name}`,
                interfaces: Preset.descriptor().interfaces,
                name: name,
                description: description,
                icon: Editor.Icon.fromFile(import.meta.resolve('../../Assets/Resources/HelperScript.svg')),
                section: 'Scripts',
                entityType: 'SceneObject'
            };
        }
        constructor(pluginSystem) {
            super(pluginSystem);
        }
        async createAsync(destination) {
            // destination may be null
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);
            const absLsoPath = new Editor.Path(import.meta.resolve(relativeLsoPath)); // lso
            const assetManager = model.project.assetManager;
            const scene = model.project.scene;
            const importResult = await assetManager.importExternalFileAsync(absLsoPath, '', Editor.Model.ResultType.Unpacked);
            return scene.instantiatePrefab(importResult.primary, /*parent:*/destination);
        }
    }
    return SimpleScriptPreset;
}

export const TweenManagerHelperScriptPreset = createSimpleScriptPreset('Tween', '../../Assets/LSOs/TweenManager.lso', 'Allows you to add simple animations to objects in your Lens.');
export const MakeupHelperScriptPreset = createSimpleScriptPreset('Makeup', '../../Assets/LSOs/Makeup.lspkg', 'Allows you to add and customize makeup to apply on the user.');
