/**
 * This preset allows you to register items to the `Add New Component` menu of an object.
 * It relies on a asset importer preset, to provide the asset to be added to the script component of an object.
 * See: Assets/Scripts
 */

import { Preset } from 'LensStudio:Preset';
import { createBehaviorAsset } from '../../Assets/Scripts/Scripts.js';

/**
 * Calls an asset importer to get a reference to an asset, which it then
 * adds to a ScriptComponent on the passed in object.
 * 
 * You can duplicate this function, and modify the asset importer function.
 * Usually the importer function is defined in the Assets/Scripts folder.
 *
 * We export our function so that it can be used to create an object. 
 * See: Objects/ScriptObject for an example. 
 *
 * @param {Editor.Model.IModel} model The model which provides access to the scene's Asset Browser.
 * @param {Editor.Model.SceneObject} destinationObject The scene object which the new component should be added to.
 * @returns {Editor.Components.ScriptComponent}
 */
export async function createBehaviorComponent(model, destinationObject) {
    const scriptAsset = await createBehaviorAsset(model, new Editor.Path(''));
    const scriptComponent = destinationObject.addComponent('ScriptComponent');
    scriptComponent.scriptAsset = scriptAsset;
    return scriptComponent;
}

/**
 * Adds a preset to the `Add New Component` of a scene object.
 * @param {string} id The preset id
 * @param {string} name The name of the preset to be added to the `Add New Component` menu
 * @param {string} iconPath The path to the preset's item icon
 * @param {(model:Editor.Model.IModel, destination:Editor.Path)=>Editor.Components.ScriptComponent} createFn The function which will add a filled in script component on the object.
 * @param {Editor.Components} entityType The entity type added by the `createFn`
 * @returns {Preset}
 */
function createScriptComponentPreset(id, name, iconPath, createFn, entityType) {
    class ScriptComponentPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.JsComponentPreset.${id}`,
                interfaces: Preset.descriptor().interfaces,
                name: name,
                description: 'Allows you to set up trigger and response for various Lens behaviors using dropdowns.',
                icon: Editor.Icon.fromFile(import.meta.resolve(iconPath)),
                section: 'Scripts',
                entityType: entityType
            };
        }
        constructor(pluginSystem) {
            super(pluginSystem);
        }
        async createAsync(parent) {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);

            let destination = parent;

            // If there's no destination, we need to add a whole new scene object.
            if (destination === null) {
                destination = model.project.scene.addSceneObject(parent);
                destination.name = name;
            }

            return await createFn(model, destination);
        }
    }
    return ScriptComponentPreset;
}

/**
 * Create the presets we can register to the plugin.
 * You can duplicate such lines with a different component generator to add another object preset.
 */
export const BehaviorComponentPreset = createScriptComponentPreset('BehaviorComponent', 'Behavior', '../../Assets/Resources/HelperScript.svg', createBehaviorComponent, 'ScriptComponent');