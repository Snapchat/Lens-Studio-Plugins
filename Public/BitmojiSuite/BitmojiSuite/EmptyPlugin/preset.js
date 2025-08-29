import { Preset } from 'LensStudio:Preset';

import { BITMOJI_3D_COMPONENT_UID } from '../constants.js';
import { BITMOJI_AL_ID } from './constants.js';

import * as AssetLibrary from "LensStudio:AssetLibrary"
import { AssetLibraryProviderWrapper } from './AssetLibraryProviderWrapper.js';

import * as app from "LensStudio:App"
import * as Uuid from "LensStudio:Uuid";

export class BitmojiComponentPreset extends Preset {
    static descriptor() {
        return {
            id: 'Com.Snap.BitmojiComponentPreset',
            name: 'Bitmoji 3D',
            description: 'Bitmoji 3D Component',
            icon: Editor.Icon.fromFile(import.meta.resolve('Resources/bitmoji_icon.svg')),
            section: 'Scripts',
            entityType: 'SceneObject'
        };
    }

    async createAsync(destination) {
        try {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);
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
                const assetLibraryProvider = new AssetLibraryProviderWrapper(this.pluginSystem, AssetLibrary.Space.Public, AssetLibrary.Environment.Production);
                const resourcePath = await assetLibraryProvider.fetch(BITMOJI_AL_ID, "CUSTOM_COMPONENTS", app.version);

                const importResult = await assetManager.importExternalFileAsync(resourcePath, new Editor.Path('/'), Editor.Model.ResultType.Auto);
                scriptAsset = importResult.primary;
            }

            if (!scriptAsset) {
                console.error("Failed to retreive Bitmoji 3D asset.");
                return null;
            }

            if (destination) {
                destination = scene.addSceneObject(destination);
            } else {
                destination = scene.createSceneObject("");
            }

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

    /**
     * Get script from registry by uid
     * @param {string} id
     * @returns {Editor.Assets.Asset || null}
     */
    async getScriptFromInstalledLibrary(id) {
        return new Promise((resolve) => {
            const entityPrototypeRegistry = this.pluginSystem.findInterface(Editor.Model.IEntityPrototypeRegistry);

            const scriptRegistry = this.pluginSystem.findInterface(Editor.IPackageRegistry);

            const inLibraryById = scriptRegistry.getTypeById(id, Editor.Model.EntityBaseType.Asset);

            if (inLibraryById) {
                entityPrototypeRegistry.createEntity(inLibraryById, new Editor.Path("/"), (entity) => {
                    resolve(entity);
                });
            } else {
                return resolve(null);
            }
        });
    }
}
