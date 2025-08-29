import { BITMOJI_3D_COMPONENT_UID } from './constants.js';
import { BITMOJI_AL_ID } from './constants.js';

import * as AssetLibrary from "LensStudio:AssetLibrary"
import { AssetLibraryProviderWrapper } from './AssetLibraryProviderWrapper.js';

import * as app from "LensStudio:App"

export async function createBitmoji3DObject(pluginSystem) {
    console.log("Create bitmoji3DObject");
    try {
        const model = pluginSystem.findInterface(Editor.Model.IModel);
        const project = model.project;
        const assetManager = project.assetManager;
        const scene = project.scene;

        // step 1: try find in assets
        let scriptAsset = assetManager.assets.find((asset) =>  (asset.isOfType("ScriptAsset") && asset.componentId == BITMOJI_3D_COMPONENT_UID));

        /*
        // skip this for now, since it can be old version of CC
        // step 2: create asset from local library
        if (!scriptAsset) {
            scriptAsset = await this.getScriptFromInstalledLibrary(Uuid.fromString(BITMOJI_3D_COMPONENT_UID));
        }
        */

        // step 3: download from asset library
        if (!scriptAsset) {
            const assetLibraryProvider = new AssetLibraryProviderWrapper(pluginSystem, AssetLibrary.Space.Public, AssetLibrary.Environment.Production);
            const resourcePath = await assetLibraryProvider.fetch(BITMOJI_AL_ID, "CUSTOM_COMPONENTS", app.version);

            const importResult = assetManager.importExternalFile(resourcePath, new Editor.Path('/'), Editor.Model.ResultType.Auto);
            scriptAsset = importResult.primary;
        }

        if (!scriptAsset) {
            console.error("Failed to retreive Bitmoji 3D asset.");
            return null;
        }

        const destination = scene.createSceneObject("");

        destination.name = "Bitmoji 3D";
        destination.localTransform = new Editor.Transform(new vec3(0, -50, -100), new vec3(0, 0, 0), new vec3(1, 1, 1));

        const scriptComponent = destination.addComponent("ScriptComponent");
        scriptComponent.scriptAsset = scriptAsset;
        scriptComponent.mixamoAnimation = false;

        return destination;
    } catch (e) {
        console.error("Failed to import Bitmoji 3D component", e);
        return null;
    }
}
