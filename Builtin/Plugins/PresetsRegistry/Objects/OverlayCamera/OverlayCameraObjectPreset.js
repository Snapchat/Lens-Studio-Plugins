import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { createOrthographicCameraObject }  from '../OrthographicCamera/OrthographicCameraObject.js';

function createOverlayRenderTarget(scene, assetManager) {
    const renderTarget = assetManager.createNativeAsset('RenderTarget', 'Overlay Render Target', new Editor.Path(''));

    if (scene.isOfType('Scene')) {
        scene.liveOverlayTarget = renderTarget;
    }

    return renderTarget;
}

export class OverlayCameraObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Company.OverlayCameraObjectPreset',
            name: 'Overlay Camera',
            description: 'Creates a scene object with Orthographic Camera component and Overlay Render Target',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/OverlayCamera.svg')),
            section: 'General',
            entityType: 'SceneObject'
        };
    }

    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = Utils.resolveScene(model, destination);
        destination = scene.addSceneObject(destination);

        // Create Overlay Render Target and set it to Scene Overlay Texture
        const overlayRenderTarget = createOverlayRenderTarget(scene, model.project.assetManager);

        // Create Orthographic Camera
        const orthoCameraSceneObj = createOrthographicCameraObject(model, destination);
        orthoCameraSceneObj.getComponent('Camera').renderTarget = overlayRenderTarget;
        orthoCameraSceneObj.name = 'Overlay Camera';

        const canvas = orthoCameraSceneObj.addComponent('Canvas');
        canvas.unitType = Editor.Components.UnitType.Points;
        canvas.sortingType = Editor.Components.SortingType.Hierarchy;

        return destination;
    }
}
