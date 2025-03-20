import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';

async function createHandTracking3D(model, sceneObject) {
    const scene = model.project.scene;
    const assetManager = model.project.assetManager;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);

    const handTracking3DObject = scene.addSceneObject(effectsObject);
    handTracking3DObject.name = '3D Hand Tracking';

    const rightHandTracking3DObject = scene.addSceneObject(handTracking3DObject);
    rightHandTracking3DObject.name = '3D Hand Tracking Right';

    const leftHandTracking3DObject = scene.addSceneObject(handTracking3DObject);
    leftHandTracking3DObject.name = '3D Hand Tracking Left';

    const assetsPath = new Editor.Path('3D Hand Tracking Assets');
    const rightHandTracking3DAsset = assetManager.createNativeAsset('HandTracking3DAsset', 'Hand Tracking Asset Right', assetsPath);
    rightHandTracking3DAsset.handType = Editor.Assets.HandTracking3DHandType.Right;
    const leftHandTracking3DAsset = assetManager.createNativeAsset('HandTracking3DAsset', 'Hand Tracking Asset Left', assetsPath);
    leftHandTracking3DAsset.handType = Editor.Assets.HandTracking3DHandType.Left;

    const rightHandTracking3D = rightHandTracking3DObject.addComponent('ObjectTracking3D');
    rightHandTracking3D.trackingAsset = rightHandTracking3DAsset;

    const leftHandTracking3D = leftHandTracking3DObject.addComponent('ObjectTracking3D');
    leftHandTracking3D.trackingAsset = leftHandTracking3DAsset;

    return handTracking3DObject;
}

async function createBodyTracking3D(model, sceneObject) {
    const scene = model.project.scene;
    const assetManager = model.project.assetManager;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);

    const bodyTracking3DObject = scene.addSceneObject(effectsObject);
    bodyTracking3DObject.name = '3D Body Tracking';

    const bodyTracking3DAsset = assetManager.createNativeAsset('BodyTracking3DAsset', '3D Body Tracking', new Editor.Path(''));

    const objectTracking3D = bodyTracking3DObject.addComponent('ObjectTracking3D');
    objectTracking3D.trackingAsset = bodyTracking3DAsset;

    return bodyTracking3DObject;
}

async function createUpperBodyTracking3D(model, sceneObject) {
    const scene = model.project.scene;
    const assetManager = model.project.assetManager;

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject);
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene);

    const upperBodyTracking3DObject = scene.addSceneObject(effectsObject);
    upperBodyTracking3DObject.name = '3D Upper Body Tracking';

    const upperBodyTracking3DAsset = assetManager.createNativeAsset('UpperBodyTracking3DAsset', '3D Upper Body Tracking', new Editor.Path(''));

    const objectTracking3D = upperBodyTracking3DObject.addComponent('ObjectTracking3D');
    objectTracking3D.trackingAsset = upperBodyTracking3DAsset;

    return upperBodyTracking3DObject;
}

function createObjectTracking3DPreset(id, name, iconPath, createFn) {
    class ObjectTracking3DPreset extends Preset {
        static descriptor() {
            return {
                id: `Com.Snap.${id}ObjectTracking3DPreset`,
                name: name,
                description: '',
                icon: Editor.Icon.fromFile(import.meta.resolve(iconPath)),
                section: 'Tracking',
                entityType: 'SceneObject'
            };
        }
        constructor(pluginSystem) {
            super(pluginSystem);
        }
        async createAsync(destination) {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);
            return await createFn.call(this, model, destination);
        }
    }
    return ObjectTracking3DPreset;
}

export const HandObjectTracking3DPreset = createObjectTracking3DPreset('Hand', 'Hand Tracking 3D', 'Resources/HandTracking3DAsset.svg', createHandTracking3D);
export const BodyObjectTracking3DPreset = createObjectTracking3DPreset('Body', 'Body Tracking 3D', 'Resources/BodyTracking3DAsset.svg', createBodyTracking3D);
export const UpperBodyObjectTracking3DPreset = createObjectTracking3DPreset('Upper Body', 'Upper Body Tracking 3D', 'Resources/UpperBodyTracking3DAsset.svg', createUpperBodyTracking3D);
