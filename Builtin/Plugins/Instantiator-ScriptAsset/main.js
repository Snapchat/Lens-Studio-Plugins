// @ts-ignore: Suppress module not found error if LensStudio:AssetInstantiator is not available during type checking
import { AssetInstantiator, Descriptor } from 'LensStudio:AssetInstantiator';
import * as InstantiatorUtils from './utils/InstantiatorUtils.js';
/**
* ScriptInstantiator usage example:
* @example
* // This is how you might use ScriptInstantiator in a setup script:
* const BUTTONSIZE = new vec2(300, 50); // Default size for the button

* return function instantiate(asset, scene, target, instantiator) {
*     try {
*         const screenTransform = instantiator.getUtils().createScreenTransformObject(scene, target);
*         const scriptComponent = instantiator.defaultInstantiate(asset, scene, screenTransform.sceneObject);
*         // configure anchors for the screen transform
*         let anchors = new Editor.Rect();
*         anchors.left = 0;
*         anchors.right = 0;
*         anchors.top = 0;
*         anchors.bottom = 0;
*         screenTransform.anchor = anchors;
*
*         let offset = new Editor.Rect();
*         offset.left = -BUTTONSIZE.x / 2;
*         offset.right = BUTTONSIZE.x / 2;
*         offset.top = BUTTONSIZE.y / 2;
*         offset.bottom = -BUTTONSIZE.y / 2;
*         screenTransform.offset = offset;
*
*         let constraints = screenTransform.constraints
*         constraints.fixedWidth = true;
*         constraints.fixedHeight = true;
*
*         screenTransform.constraints = constraints;
*         return scriptComponent;
*     } catch (e) {
*         console.error("Error instantiating UIButton: ", e)
*         return null
*     }
* }
*/
export class ScriptInstantiator extends AssetInstantiator {
    static descriptor() {
        const descriptor = new Descriptor();
        descriptor.id = 'Com.Snap.ScriptAssetInstantiator';
        descriptor.dependencies = [];
        descriptor.name = 'Instantiator - Script Asset';
        descriptor.description = 'Instantiator for Scripts and Custom Components. Allows executing setup scripts defined in the script asset settings.';
        descriptor.canInstantiate = (asset) => {
            return asset.type == "JavaScriptAsset" || asset.type == "TypeScriptAsset";
        };
        return descriptor;
    }
    instantiate(asset, scene, target) {
        const rootAsset = this.getNativePackageDescriptor(asset);
        // If a setup script exists, execute it.
        // This script should return a function that takes the asset, scene, target, instantiatorPlugin, and utils as parameters.
        // This function will be responsible for instantiating the asset in the scene.
        // Function should return Component or SceneObject that was created.
        if (rootAsset != null && rootAsset.setupScript != undefined && rootAsset.setupScript.code.length > 0) {
            console.log("Executing setup script for asset: ", asset.name);
            // @ts-ignore 
            const instantiateScript = createFunctionObject(rootAsset.setupScript.code, "defaultAssetInstantiatorFunc");
            const result = instantiateScript(asset, scene, target, this);
            return result;
        }
        else {
            const result = this.defaultInstantiate(asset, scene, target);
            return result;
        }
    }
    // begin of SetupScriptInterface implementation
    // default instantiation for scripts and custom components
    defaultInstantiate(asset, scene, target) {
        // If no setup script exists, we can instantiate the script directly 
        // Default LS logic is to create a new SceneObject with the script component
        if (target == null) {
            target = scene.createSceneObject(asset.name);
        }
        const result = this.createScriptComponent(target, asset);
        return result;
    }
    getAssetManager() {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        //@ts-ignore
        const assetManager = model.project.assetManager;
        return assetManager;
    }
    getScene() {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        //@ts-ignore
        return model.project.scene;
    }
    getUtils() {
        return InstantiatorUtils;
    }
    // end of SetupScriptInterface implementation
    getNativePackageDescriptor(asset) {
        const meta = asset.fileMeta;
        const rootMeta = meta.topmostNativePackageRoot;
        if (rootMeta != null) {
            const nativePackageDescriptor = rootMeta.nativePackageDescriptor;
            return nativePackageDescriptor;
        }
        return rootMeta;
    }
    createScriptComponent(sceneObject, scriptAsset) {
        const scriptComponent = sceneObject.addComponent("ScriptComponent");
        scriptComponent.scriptAsset = scriptAsset;
        return scriptComponent;
    }
}
