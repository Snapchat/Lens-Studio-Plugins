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

function createScriptComponentPreset(id, name, iconPath, createFn, entityType) {
    class ScriptComponentPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.${id}ScriptComponentPreset`,
                interfaces: Preset.descriptor().interfaces,
                name: name,
                description: '',
                icon: Editor.Icon.fromFile(import.meta.resolve(iconPath)),
                section: 'Scripts',
                entityType: entityType
            };
        }
        constructor(pluginSystem) {
            super(pluginSystem);
        }
        async createAsync(parent) {
            const model = super.findInterface(Editor.ModelComponentID);

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

export const TypeScriptFileComponentPreset = createScriptComponentPreset('TypeScriptComponent', 'TypeScript', '../../Assets/Resources/TypeScript.svg', createTypeScriptComponent, 'ScriptComponent');
export const JavaScriptFileComponentPreset = createScriptComponentPreset('JavaScriptComponent', 'JavaScript', '../../Assets/Resources/JavaScript.svg', createJavaScriptComponent, 'ScriptComponent');
export const TypeScriptFileObjectPreset = createScriptComponentPreset('TypeScriptObject', 'TypeScript', '../../Assets/Resources/TypeScript.svg', createTypeScriptComponent, 'SceneObject');
export const JavaScriptFileObjectPreset = createScriptComponentPreset('JavaScriptObject', 'JavaScript', '../../Assets/Resources/JavaScript.svg', createJavaScriptComponent, 'SceneObject');
