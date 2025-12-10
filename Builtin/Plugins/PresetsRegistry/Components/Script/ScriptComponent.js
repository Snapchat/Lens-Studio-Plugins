import { Preset } from 'LensStudio:Preset';
import { createTypeScriptAsset } from '../../Assets/TypeScript/TypeScriptComponentPreset.js';
import { createJavaScriptAsset } from '../../Assets/Script/JavaScriptPreset.js';

export async function createTypeScriptComponent(model, destinationObject) {
    const scriptAsset = await createTypeScriptAsset(model, new Editor.Path(''));
    const scriptComponent = destinationObject.addComponent('ScriptComponent');
    scriptComponent.scriptAsset = scriptAsset;
    return scriptComponent;
}

export async function createJavaScriptComponent(model, destinationObject) {
    const scriptAsset = await createJavaScriptAsset(model, new Editor.Path(''));
    const scriptComponent = destinationObject.addComponent('ScriptComponent');
    scriptComponent.scriptAsset = scriptAsset;
    return scriptComponent;
}

function createScriptComponentPreset(id, name, iconPath, createFn, entityType, description = 'Creates a ScriptComponent on a scene object') {
    class ScriptComponentPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.${id}ScriptComponentPreset`,
                name: name,
                description: description,
                icon: Editor.Icon.fromFile(import.meta.resolve(iconPath)),
                section: 'Scripts',
                entityType: entityType
            };
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

export const TypeScriptFileComponentPreset = createScriptComponentPreset('TypeScriptComponent', 'TypeScript', '../../Assets/Resources/TypeScript.svg', createTypeScriptComponent, 'ScriptComponent', 'ScriptComponent with empty TypeScript asset');
export const JavaScriptFileComponentPreset = createScriptComponentPreset('JavaScriptComponent', 'JavaScript', '../../Assets/Resources/JavaScript.svg', createJavaScriptComponent, 'ScriptComponent', 'ScriptComponent with empty JavaScript asset');
export const TypeScriptFileObjectPreset = createScriptComponentPreset('TypeScriptObject', 'TypeScript', '../../Assets/Resources/TypeScript.svg', createTypeScriptComponent, 'SceneObject','Creates scene object with ScriptComponent and empty TypeScript asset.');
export const JavaScriptFileObjectPreset = createScriptComponentPreset('JavaScriptObject', 'JavaScript', '../../Assets/Resources/JavaScript.svg', createJavaScriptComponent, 'SceneObject','Creates scene object with ScriptComponent and empty JavaScript asset.');
