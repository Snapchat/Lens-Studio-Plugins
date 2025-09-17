/* A utility class for instantiating assets in Lens Studio.
* This class provides methods to add objects to the scene, main camera, or orthographic camera,
* as well as utility functions for working with assets.

* since setup script does not allow imports we provide these function for simpler access
*/
import * as HierarchyUtils from 'LensStudio:HierarchyUtils.js';
import * as AssetUtils from 'LensStudio:AssetUtils.js';
/**
 *
 * @returns {Utils}
 */
export function getAssetUtils() {
    return AssetUtils;
}
/**
 *
 * @returns {HierarchyUtils}
 */
export function getHierarchyUtils() {
    return HierarchyUtils;
}
export function addToOrthoCamera(scene, sceneObject) {
    const orthoCamera = HierarchyUtils.findOrCreateCameraObject(scene, Editor.Components.CameraType.Orthographic);
    if (!sceneObject.isSame(orthoCamera)) {
        sceneObject.setParent(orthoCamera);
    }
    console.log("Added to Orthographic Camera " + sceneObject.name);
}
export function addToMainCamera(scene, sceneObject) {
    const camera = scene.mainCamera;
    if (camera != null && !camera.sceneObject.isSame(sceneObject)) {
        sceneObject.setParent(camera.sceneObject);
        console.log("Added to Main Camera " + sceneObject.name);
    }
    else {
        console.log("Main Camera not found, create a new camera and place prefab under it");
    }
}
/**
 * Get or add a DeviceTracking component to the main camera.
 */
export function getOrAddDeviceTracking(scene) {
    const camera = scene.mainCamera;
    if (camera != null) {
        let deviceTracking = camera.sceneObject.getComponent("DeviceTracking");
        if (deviceTracking == null) {
            deviceTracking = camera.sceneObject.addComponent("DeviceTracking");
        }
        return deviceTracking;
    }
    return null;
}
/** */
export function createScreenTransformObject(scene, target) {
    let sceneObject = scene.createSceneObject("Screen Transform");
    const { cameraObject, canvasComponent, screenRegionComponent } = HierarchyUtils.findOrCreateOrthoCameraForObject(scene, sceneObject);
    if (cameraObject == sceneObject || screenRegionComponent.sceneObject == sceneObject) {
        sceneObject = scene.createSceneObject("Screen Transform");
    }
    // Set the parent of the sceneObject to the camera's screen region component
    sceneObject.setParent(screenRegionComponent.sceneObject);
    // Set the layer of the sceneObject to match the screen region component's layer
    sceneObject.layers = screenRegionComponent.sceneObject.layers;
    // add screen transform component to the sceneObject
    const screenTransform = sceneObject.addComponent("ScreenTransform");
    return screenTransform;
}
/**
 * Checks if the given value is a valid result.
 * @param value - The value to check.
 * @returns True if the value is a valid result, false otherwise.
 */
export function isValidResult(value) {
    return value !== null && value !== undefined && value.isOfType != undefined && value.isOfType("Prefabable");
}
/**
 * Converts custom instantiator result to an array of Prefabable objects.
 * @param value - The value to convert to an array of Prefabable objects.
 * @returns An array of Prefabable objects.
 */
export function toPrefabableArray(value) {
    if (!Array.isArray(value)) {
        value = [value];
    }
    return value.filter((item) => isValidResult(item));
}
