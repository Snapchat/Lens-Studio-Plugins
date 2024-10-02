import { Preset } from 'LensStudio:Preset';
import * as Utils from 'LensStudio:Utils@1.0.js';
import { LocationMeshMaterialPreset } from '../../Assets/LocationMeshMaterial/LocationMeshMaterial.js';

function findOrCreateDeviceTracking(scene) {
    const perspectiveCameraObjects = [];

    scene.rootSceneObjects.forEach(element => {
        element.components.forEach(component => {
            if (component.getTypeName() == 'Camera' && component.cameraType == Editor.Components.CameraType.Perspective) {
                perspectiveCameraObjects.push(element);
            }
        });
    });

    let deviceTrackingComponent = null;
    perspectiveCameraObjects.forEach(element => {
        element.components.forEach(component => {
            if (component.getTypeName() == 'DeviceTracking') {
                deviceTrackingComponent = component;
            }
        });
    });

    if (deviceTrackingComponent !== null) {
        return deviceTrackingComponent;
    } else if (perspectiveCameraObjects.length > 0) {
        const deviceTracking = perspectiveCameraObjects[0].addComponent('DeviceTracking');
        deviceTracking.deviceTrackingMode = Editor.Components.DeviceTrackingMode.World;
        return deviceTracking;
    } else {
        const cameraObject = scene.createSceneObject('Perspective Camera');
        const camera = cameraObject.addComponent('Camera');
        camera.cameraType = Editor.Components.CameraType.Perspective;
        camera.renderTarget = scene.renderOutput;
        const deviceTracking = cameraObject.addComponent('DeviceTracking');
        deviceTracking.deviceTrackingMode = Editor.Components.DeviceTrackingMode.World;
        return deviceTracking;
    }
}

export class CustomLocationObjectPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.CustomLocationObjectPreset',
            interfaces: Preset.descriptor().interfaces,
            name: 'Custom Location',
            description: 'Adds a Custom Location',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/LocationAsset.svg')),
            section: 'World',
            entityType: 'SceneObject'
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
    }
    async createAsync(destination) {
        const model = super.findInterface(Editor.ModelComponentID);
        const scene = model.project.scene;
        destination = scene.addSceneObject(destination);
        const assetManager = model.project.assetManager;

        // add device tracking to camera
        findOrCreateDeviceTracking(scene);

        // execute all async steps
        // Load camera flip JS
        const jsAsset = await Utils.findOrCreateAsync(assetManager, new Editor.Path(import.meta.resolve('Resources/FrontCameraMirror.js')), new Editor.Path(''));
        // Load material
        const locationMeshMaterialPreset = new LocationMeshMaterialPreset(this.pluginSystem);
        const locationMeshMaterial = await locationMeshMaterialPreset.createAsync(new Editor.Path(''));

        const history = model.project.history;
        history.executeAsGroup('Set Custom Location', () => {
            // add custom location asset, location mesh and vertexColor material
            const locationAsset = assetManager.createNativeAsset('Location', 'Custom Location Asset [Input ID]', new Editor.Path(''));
            locationAsset.locationType = Editor.Assets.LocationType.Custom;
            const locationMesh = assetManager.createNativeAsset('LocationMesh', 'Custom Location Mesh', new Editor.Path(''));
            locationMesh.location = locationAsset;

            // add locatedAt
            const rootLocatedAtObject = destination;
            rootLocatedAtObject.name = 'Custom Location';
            const locatedAtComponent = rootLocatedAtObject.addComponent('LocatedAtComponent');
            locatedAtComponent.location = locationAsset;

            // Add camera flip JS component under locatedAt
            const flipCameraObject = scene.addSceneObject(rootLocatedAtObject);
            flipCameraObject.name = 'Flip camera controller';
            const jsComponent = flipCameraObject.addComponent('ScriptComponent');
            jsComponent.scriptAsset = jsAsset;

            // Add render mesh visual under JS component
            const childObject = scene.addSceneObject(flipCameraObject);
            childObject.name = 'Custom Location Render Mesh';
            const renderMeshVisual = childObject.addComponent('RenderMeshVisual');
            renderMeshVisual.materials = [locationMeshMaterial];
            renderMeshVisual.mesh = locationMesh;

        });

        return rootLocatedAtObject;
    }
}
