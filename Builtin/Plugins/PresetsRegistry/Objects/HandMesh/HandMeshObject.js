import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { PBRMaterialPreset } from '../../Assets/PBRMaterial/PBRMaterial.js';

function createHandMeshComponent(model, destinationObject, sideName, handType, material) {
    const assetManager = model.project.assetManager;
    const assetsPath = new Editor.Path('Hand Mesh Assets');

    const renderMeshVisual = destinationObject.addComponent('RenderMeshVisual');
    renderMeshVisual.materials = [material];

    const handMeshAsset = assetManager.createNativeAsset('HandMesh', `Hand Mesh ${sideName}`, assetsPath);
    handMeshAsset.handType = handType;
    renderMeshVisual.mesh = handMeshAsset;

    return renderMeshVisual;
}

function createHandMeshSide(model, parent, sideName, handType, material) {
    const scene = Utils.resolveScene(model, parent);
    const assetManager = model.project.assetManager;
    const assetsPath = new Editor.Path('Hand Mesh Assets');

    const trackingObject = scene.addSceneObject(parent);
    trackingObject.name = `3D Hand Tracking ${sideName}`;

    const trackingAsset = assetManager.createNativeAsset('HandTracking3DAsset', `Hand Tracking Asset ${sideName}`, assetsPath);
    trackingAsset.handType = handType;

    const tracking = trackingObject.addComponent('ObjectTracking3D');
    tracking.trackingAsset = trackingAsset;

    const handMeshObject = scene.addSceneObject(trackingObject);
    handMeshObject.name = `Hand Mesh ${sideName}`;

    createHandMeshComponent(model, handMeshObject, sideName, handType, material);

    return trackingObject;
}

async function createHandMeshObject(model, sceneObject) {
    // Do all async work up front so the scene is never observed half-built.
    const materialPreset = new PBRMaterialPreset(this.pluginSystem);
    const assetManager = model.project.assetManager;
    const assetsPath = new Editor.Path('Hand Mesh Assets');
    const rightMaterial = await materialPreset.createAsync(assetsPath);
    assetManager.rename(rightMaterial.fileMeta, 'Hand Mesh Material Right');
    const leftMaterial = await materialPreset.createAsync(assetsPath);
    assetManager.rename(leftMaterial.fileMeta, 'Hand Mesh Material Left');

    const scene = Utils.resolveScene(model, sceneObject);

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);

    const handMeshObject = scene.addSceneObject(effectsObject);
    handMeshObject.name = 'Hand Mesh';

    createHandMeshSide(model, handMeshObject, 'Right', Editor.Assets.HandTracking3DHandType.Right, rightMaterial);
    createHandMeshSide(model, handMeshObject, 'Left', Editor.Assets.HandTracking3DHandType.Left, leftMaterial);

    return handMeshObject;
}

export class HandMeshObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.HandMeshObjectPreset',
            name: 'Hand Mesh',
            description: 'Creates a hand mesh with RenderMeshVisual and 3D hand tracking for both hands.',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/HandMesh.svg')),
            section: '3D',
            entityType: 'SceneObject'
        };
    }
    async createAsync(destination) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        return await createHandMeshObject.call(this, model, destination);
    }
}
