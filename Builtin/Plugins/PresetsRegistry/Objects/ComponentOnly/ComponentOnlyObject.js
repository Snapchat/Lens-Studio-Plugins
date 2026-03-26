import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

function createComponentOnlyObject(componentName, niceName, iconPath, group) {
    class ComponentOnlyObjectPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.${componentName}ObjectPreset`,
                name: niceName,
                description: `Creates a new scene object and adds a ${componentName} component to it.`,
                icon: Editor.Icon.fromFile(import.meta.resolve(iconPath)),
                section: group ? group : 'General',
                entityType: 'SceneObject'
            };
        }
        async createAsync(selectedObject) {
            try {
                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const scene = Utils.resolveScene(model, selectedObject);

                // Create a new object with the component as a child of the selected object.
                const newObject = scene.addSceneObject(selectedObject);
                newObject.name = niceName;
                newObject.addComponent(componentName);

                return newObject;
            } catch (e) {
                console.error(e);
            }

        }
    }

    return ComponentOnlyObjectPreset;
}

export const AudioObjectPreset = createComponentOnlyObject('AudioComponent', 'Audio', 'Resources/Audio.svg', 'Audio');
export const AudioListenerObjectPreset = createComponentOnlyObject('AudioListenerComponent', 'Audio Listener', 'Resources/AudioListener.svg', 'Audio');
export const CameraObjectPreset = createComponentOnlyObject('Camera', 'Camera', '../OrthographicCamera/Resources/Camera.svg');
export const CanvasObjectPreset = createComponentOnlyObject('Canvas', 'Canvas', 'Resources/Canvas.svg', '2D');
export const LightObjectPreset = createComponentOnlyObject('LightSource', 'Light', 'Resources/LightSource.svg');
