import { Preset } from 'LensStudio:Preset';

function createComponentOnlyObject(componentName, niceName, iconPath, group) {
    class ComponentOnlyObjectPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.${componentName}ObjectPreset`,
                interfaces: Preset.descriptor().interfaces,
                name: niceName,
                description: '',
                icon: Editor.Icon.fromFile(import.meta.resolve(iconPath)),
                section: group ? group : 'General',
                entityType: 'SceneObject'
            };
        }
        constructor(pluginSystem) {
            super(pluginSystem);
        }
        async createAsync(selectedObject) {
            try {
                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const scene = model.project.scene;

                // Create a new object with the component.
                // If a parent was selected, put it inside the parent.
                const newObject = scene.createSceneObject(niceName);
                if (selectedObject) {
                    {
                        newObject.setParent(selectedObject, selectedObject.getChildrenCount());
                    }
                }
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
