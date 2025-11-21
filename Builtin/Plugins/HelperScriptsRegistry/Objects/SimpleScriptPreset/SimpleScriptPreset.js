import { Preset } from 'LensStudio:Preset';
import * as HierarchyUtils from 'LensStudio:HierarchyUtils.js';

function createSimpleScriptPreset(name, relativePackagePath, relativeIconPath, description) {
    class SimpleScriptPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.SimpleScriptPresets.${name}`,
                name: name,
                description: description,
                icon: Editor.Icon.fromFile(import.meta.resolve(relativeIconPath)),
                section: 'Scripts',
                entityType: 'SceneObject'
            };
        }
        async createAsync(destination) {
            try {
                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const absPackagePath = new Editor.Path(import.meta.resolve(relativePackagePath));
                const assetManager = model.project.assetManager;
                const importPath = new Editor.Model.SourcePath('',Editor.Model.SourceRootDirectory.Packages);
                // Import the external file asynchronously
                const importResult = await assetManager.importExternalFileAsync(absPackagePath, importPath, Editor.Model.ResultType.Auto);

                // First: instantiate and wait for it to finish
                const res = await assetManager.instantiate([importResult.primary]);
                
                // Second: only after instantiate finishes, unpack
                const unpackedRes = await assetManager.unpack(importResult.primary.fileMeta.nativePackageRoot);
                
                return res.length == 0 ? destination : res[0];
            } catch (e) {
                console.log(`${e.message}\n${e.stack}`);
            }
        }

    }
    return SimpleScriptPreset;
}

export const TweenManagerHelperScriptPreset = createSimpleScriptPreset('Tween', '../../Assets/Packages/TweenManager.lspkg','../../Assets/Resources/Tween.svg', 'Allows you to add simple animations to objects in your Lens.');
export const MakeupHelperScriptPreset = createSimpleScriptPreset('Makeup', '../../Assets/Packages/Makeup.lspkg','../../Assets/Resources/HelperScript.svg', 'Allows you to add and customize makeup to apply on the user.');
