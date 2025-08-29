import { Preset } from 'LensStudio:Preset';
import { createOrthographicCameraObject }  from '../OrthographicCamera/OrthographicCameraObject.js';

function createOverlayRenderTarget(project) {
    const scene = project.scene;
    const assetManager = project.assetManager;
    const renderTarget = assetManager.createNativeAsset('RenderTarget', 'Overlay Render Target', new Editor.Path(''));

    scene.liveOverlayTarget = renderTarget;

    return renderTarget;
}

export class OverlayCameraObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Company.OverlayCameraObjectPreset',
            name: 'Overlay Camera',
            description: 'Overlay Camera Preset',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/OverlayCamera.svg')),
            section: 'General',
            entityType: 'SceneObject'
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
    }

    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = model.project.scene;
        destination = scene.addSceneObject(destination);

        // Create Overlay Render Target and set it to Scene Overlay Texture
        const overlayRenderTarget = createOverlayRenderTarget(model.project);

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
