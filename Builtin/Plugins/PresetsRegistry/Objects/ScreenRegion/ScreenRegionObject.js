import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { createScreenTransformObject } from '../ScreenTransform/ScreenTransformObject.js';

export function createScreenRegionComponent(model, sceneObject) {
    sceneObject.name = 'Full Frame Region';

    const screenRegion = sceneObject.addComponent('ScreenRegionComponent');
    screenRegion.region = Editor.Components.ScreenRegionType.FullFrame;

    return screenRegion;
}

export class ScreenRegionObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.ScreenRegionObjectPreset',
            name: 'Screen Region',
            description: 'Creates an object with ScreenTransform and ScreenRegionComponent for defining 2D layout boundaries. Defaults to Full Frame region.',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/ScreenRegion.svg')),
            section: '2D',
            entityType: 'SceneObject',
            intendedPlatforms: [Editor.TargetPlatform.Snapchat]
        };
    }
    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = Utils.resolveScene(model, destination);
        destination = scene.addSceneObject(destination);
        const screenTransform = createScreenTransformObject(model, destination, true);
        createScreenRegionComponent(model, screenTransform);
        return screenTransform;
    }
}
