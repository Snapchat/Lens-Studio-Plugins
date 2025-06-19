import { AssetInstantiator, Descriptor } from 'LensStudio:AssetInstantiator';
import * as FileSystem from 'LensStudio:FileSystem';
import * as InstantiatorUtils from './utils/InstantiatorUtils.js';
const PREFIX = {
    "screen_hierarchy": ['ORTHO_CAM', 'ORTHO'],
    "main_camera_hierarchy": ['MAIN_CAM', 'CAMERA'],
    "scene_hierarchy": ['SCENE', 'OBJECTS_PANEL']
};
const SEPARATOR = "__";
/**
 * @example <caption>Setup script example<caption>
 * return function instantiate(asset, scene, target, setupScriptInterface){
 *     try {
 *         let prefabFile = asset.fileMeta.sourcePath.parent.appended('World Object Controller__ADD_TO_SCENE.prefab');
 *         const prefab =  setupScriptInterface.getAssetManager().getFileMeta(prefabFile).primaryAsset;
 *         let sceneObject = setupScriptInterface.getScene().instantiatePrefab(prefab, null);
 *         setupScriptInterface.getUtils().addToMainCamera(project.scene, sceneObject);
 *     } catch (e) {
 *         console.log(e, "Couldn't add asset to scene automatically, please add prefab to scene")
 *     }
 * }
 */
export class PackageInstantiator extends AssetInstantiator {
    static descriptor() {
        const descriptor = new Descriptor();
        descriptor.id = 'Com.Snap.AssetPackageInstantiator';
        descriptor.dependencies = [];
        descriptor.name = 'Instantiator - Asset Package';
        descriptor.description = 'Instantiator for Native Packages. Allows executing setup scripts defined in the asset package settings.';
        descriptor.canInstantiate = (asset) => {
            return asset.type == "NativePackageDescriptor";
        };
        return descriptor;
    }
    instantiate(asset, scene, target) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        // If a setup script exists:
        //  Execute the setup script.
        //  Provide an Utils to facilitate adding objects to the scene.
        let nativePackageDescriptor = asset;
        if (nativePackageDescriptor.setupScript.code.length > 0) {
            // @ts-ignore 
            const instantiatePackage = createFunctionObject(nativePackageDescriptor.setupScript.code, "defaultAssetInstantiatorFunc");
            let result = instantiatePackage(asset, scene, target, this);
            return result;
        }
        //  If no setup script exists:
        // Iterate through all prefabs included in the package.
        // Check if the prefab's file name contains a recognized prefix (e.g., ADD_TO_SCENE, ADD_TO_MAIN_CAM).
        // Instantiate the prefab and add it to the scene in the appropriate way based on the prefix.
        else {
            //@ts-ignore
            const assetManager = model.project.assetManager;
            const fullPath = assetManager.assetsDirectory.appended(asset.fileMeta.sourcePath.parent);
            let files = FileSystem.readDir(fullPath, { recursive: false });
            // special case for packages that have prefabs that need to be added to scene in common way
            const prefabFiles = files.filter(file => file.extension == 'prefab');
            for (let i = 0; i < prefabFiles.length; i++) {
                try {
                    this.instantiatePrefabWithPrefix(prefabFiles[i], asset.fileMeta.sourcePath.parent, model);
                }
                catch (e) {
                    console.log("Error instantiating prefab:", prefabFiles[i], e);
                }
            }
        }
    }
    instantiatePrefabWithPrefix(prefabFile, folderPath, model) {
        const [sceneObjectName, prefix] = prefabFile.fileNameBase.split(SEPARATOR); // making this strict, some assets need to be tweaked
        //@ts-ignore
        const assetManager = model.project.assetManager;
        //@ts-ignore
        const scene = model.project.scene;
        if (prefix != undefined) {
            let matched = false;
            const prefabFilePath = folderPath.appended(prefabFile);
            const prefab = assetManager.getFileMeta(prefabFilePath);
            for (const [key, values] of Object.entries(PREFIX)) {
                if (values.some(value => prefix.includes(value))) {
                    const sceneObject = scene.instantiatePrefab(prefab.primaryAsset, null);
                    sceneObject.name = sceneObjectName;
                    //Add the instantiated scene object to the scene based on the prefix
                    if (key === "screen_hierarchy") {
                        InstantiatorUtils.addToOrthoCamera(scene, sceneObject);
                    }
                    else if (key === "main_camera_hierarchy") {
                        InstantiatorUtils.addToMainCamera(scene, sceneObject);
                    }
                    else if (key === "scene_hierarchy") {
                        // console.log("Added to Scene:", sceneObjectName);
                    }
                    matched = true;
                    break; // Exit the inner loop for this prefab, but continue processing other prefabs
                }
            }
            if (!matched) {
                //console.log("No matching prefix found for prefab:", prefabFile.fileNameBase);
            }
        }
    }
    // Implementation of SetupScriptInterface
    defaultInstantiate(asset, scene, target) {
        // we don't instantiate package by default, just import
    }
    getAssetManager() {
        // Retrieve the asset manager from the plugin system's model
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        // Cast to the expected type if needed
        return model.project.assetManager;
    }
    getScene() {
        // Retrieve the scene from the plugin system's model
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        // Cast to the expected type if needed
        return model.project.scene;
    }
    getUtils() {
        return InstantiatorUtils;
    }
}
