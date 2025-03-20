/**
 * This preset allows you to register various JS asset to be imported to the Asset Browser.
 * It is used by component, object presets to import the asset it needs.
 * See: Components/ScriptComponent, Object/ScriptObject
 */

import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

/**
 * An asset importer generator function which a preset can call.
 * You can duplicate this function, and modify the file that is imported.
 *
 * We export our creator function so that it can be used to create a component.
 * See: Components/ScriptComponent for an example.
 *
 * @param {Editor.Model.IModel} model The model which provides access to Asset Manager
 * @param {Editor.Path} destination The path where this asset will be imported to.
 * @returns {Editor.Assets.Asset}
 */
export async function createBehaviorAsset(model, destination) {
    const assetManager = model.project.assetManager;
    const absFilePath = import.meta.resolve('./Resources/Behavior.js');
    return await Utils.findOrCreateAsync(assetManager, absFilePath, destination);
}

/**
 * Creates an asset preset given the generator.
 * @param {string} id The preset id.
 * @param {string} name The preset `Add New` name.
 * @param {(model:Editor.Model.IModel, destination:Editor.Path)=>Editor.Assets.Asset} generator fn that creates the asset.
 * @returns
 */
function createScriptAssetPreset(id, name, generator) {
    class JsAssetPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.${id}`,
                name: name,
                description: 'Allows you to set up trigger and response for various Lens behaviors using dropdowns.',
                icon: Editor.Icon.fromFile(import.meta.resolve('../Resources/HelperScript.svg')),
                section: 'Scripting',
                entityType: 'JavaScriptAsset'
            };
        }
        async createAsync(destination) {
            try {
                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                return await generator.apply(this, [model, destination]);
            } catch (e) {
                console.error(e)
            }
        }
    }

    return JsAssetPreset;
}

/**
 * Create the presets we can register to the plugin.
 * You can duplicate such lines with a different function which imports a different asset.
 */
export const BehaviorAssetPreset = createScriptAssetPreset('behaviorAssetPreset', 'Behavior', createBehaviorAsset);
