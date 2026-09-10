import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

export class CompositionLayerObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.CompositionLayerObjectPreset',
            name: 'CompositionLayer - Quad',
            description: 'Creates a composition layer - Quad, corresponding Render, and Camera components with a dedicated layer and render target',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/Quad.svg')),
            section: '2D',
            entityType: 'SceneObject'
        };
    }

    create(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const scene = Utils.resolveScene(model, destination);
        const assetManager = model.project.assetManager;

        // Find a free user layer for the Quad
        let freeLayerId = null;
        Editor.Model.LayerId.forEachUser((layerId) => {
            if (freeLayerId === null && !scene.layers.contains(layerId)) {
                freeLayerId = layerId;
            }
        });
        if (freeLayerId === null) {
            throw new Error('No free layer available for Quad');
        }
        const layer = scene.layers.add(freeLayerId);
        const layerSet = Editor.Model.LayerSet.fromId(layer.id);

        // Create RenderTarget asset
        const renderTarget = assetManager.createNativeAsset('RenderTarget', 'Quad Render Target', new Editor.Path(''));
        renderTarget.useScreenResolution = false;
        renderTarget.resolution = Editor.Size.fromVec2(new vec2(1024, 1024));
        renderTarget.clearColorOption = Editor.Assets.ClearColorOption.CustomColor;
        renderTarget.clearColor = new vec4(1.0, 0.5, 0.0, 1.0);

        // Create Camera scene object (sibling)
        const cameraObject = scene.addSceneObject(destination);
        cameraObject.name = 'Quad Camera';
        cameraObject.layers = layerSet;
        const camera = cameraObject.addComponent('Camera');
        camera.renderTarget = renderTarget;
        camera.renderLayer = layerSet;
        camera.cameraType = Editor.Components.CameraType.Orthographic;
        camera.deviceProperty = Editor.Components.CameraDeviceProperty.None;
        camera.size = 1;
        camera.near = -1;
        camera.far = 100;

        // Create Quad scene object (sibling)
        const quadObject = scene.addSceneObject(destination);
        quadObject.name = 'Quad';
        quadObject.layers = layerSet;
        quadObject.localTransform = new Editor.Transform(
            new vec3(0, 0, -30),
            new vec3(0, 0, 0),
            new vec3(40, 40, 1));

        // Add CompositionLayer components. The layer references the camera's render
        // target texture; the system infers the rendering camera by matching this
        // texture against each camera's render target.
        const compositionLayer = quadObject.addComponent('CompositionLayerComponent');
        compositionLayer.texture = renderTarget;
        const compositionLayerRender = quadObject.addComponent('CompositionLayerRenderComponent');

        return quadObject;
    }
}
