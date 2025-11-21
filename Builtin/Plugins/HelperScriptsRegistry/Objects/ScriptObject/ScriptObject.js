/**
 * This preset allows you to register a preset to the `+` menu of the `Scene Hierarchy` panel which includes a component.
 * It relies on another preset, which adds the component itself.
 * See: Components/ScriptComponent
 */

import { Preset } from 'LensStudio:Preset';
import { BehaviorComponentPreset } from '../../Components/ScriptComponent/ScriptComponent.js'

/**
 * Adds a preset to the `Scene Hierarchy`'s `+` menu, which adds an object and calls a preset to add new script component on it.
 *
 * Relies on another preset to add the script component.
 * For example: Components/ScriptComponent
 *
 * @param {string} id The preset id
 * @param {string} name The name of the preset to be added to the `Add New Component` menu
 * @param {string} iconPath The path to the preset's item icon
 * @param {string} objectName The default name that the new object should be given.
 * @param {Preset} ComponentPreset The preset that should be called on the object to add a component on it.
 * @returns {Preset}
 */
function createJsObjectPreset(id, name, iconPath, objectName, ComponentPreset) {
    class JsObjectPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.JsObjectPreset.${id}`,
                name: name,
                description: 'Allows you to set up trigger and response for various Lens behaviors using dropdowns.',
                icon: Editor.Icon.fromFile(import.meta.resolve(iconPath)),
                section: 'Scripts',
                entityType: 'SceneObject'
            };
        }
        async createAsync(destination) {
            try {
                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const scene = model.project.scene;
                destination = scene.addSceneObject(destination);

                destination.name = objectName;

                const componentPreset = new ComponentPreset(this.pluginSystem);
                const component = await componentPreset.createAsync(destination);

                return destination;
            } catch (e) {
                console.log(`${e.message}\n${e.stack}`);
            }
        }
    }

    return JsObjectPreset;
}

/**
 * Create the presets we can register to the plugin.
 * You can duplicate such lines with a different preset to add another object preset.
 */
export const BehaviorObjectPreset = createJsObjectPreset('behavior', 'Behavior', '../../Assets/Resources/Behavior.svg', 'Behavior', BehaviorComponentPreset)
