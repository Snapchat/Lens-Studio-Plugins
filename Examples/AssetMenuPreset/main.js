//@ts-nocheck
import Preset from "LensStudio:Preset";

export class AssetMenuPreset extends Preset {
    static descriptor() {
        return {
            id: "LS.Plugin.Example.AssetMenuPreset",
            interfaces: Preset.descriptor().interfaces,
            name: "GLTF Asset Preset",
            description: "Asset Preset for importing a GLTF file",
            icon: Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("./icon.svg"))),
            // Section is the category in which the preset will be added into.
            section: "Demo",
            entityType: "Asset",
            dependencies: [Editor.Model.IModel]
        };
    }

    /**
     * @param {Editor.PluginSystem} pluginSystem
     */
    constructor(pluginSystem) {
        super(pluginSystem);
        this.pluginSystem = pluginSystem;
    }

    /**
     * @param {Editor.Path} destination
     * 
     * @description Called when a user adds the preset. The synchronous version is `create`, and the asynchronous version is `createAsync`. 
     * Important: You must return an EntityRef from this function.
     * The destination parameter will be evaluated as either a string or a (SceneObject | null) depending on the entityType parameter in the descriptor function. 
     * For entityType: 'Asset', destination will be an Editor.Path representing the asset directory.
     * For entityType: 'SceneObject', destination will be a SceneObject, which is the selected scene object at the moment, or null, if no scene object is selected.
     * For entityType: 'Component', destination will be a SceneObject, which is the bearer of the component.
     * For more information, please refer to the official documentation.
     */
    async createAsync(destination) {
        try {
            // Get the Model component
            /** @type {Editor.Model.IModel} */
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);
            // Get the asset manager from Model
            /** @type {Editor.Model.AssetManager} */
            const assetManager = model.project.assetManager;
            // Get the absolute path of the box gltf file
            const absolutePath = new Editor.Path(import.meta.resolve("box.gltf"));
            // Import the file and get the metadata of the asset
            const importResult = await assetManager.importExternalFileAsync(absolutePath,
                destination,
                Editor.Model.ResultType.Packed);

            // Optionally modify the imported file        
            importResult.primary.sceneObjects.forEach((object) => {
                const transform = object.localTransform;
                transform.scale = new vec3(1, 1, 1);
                object.localTransform = transform;
            });

            // returning the asset that was imported     
            return importResult.primary;
        } catch (e) {
            Editor.print(e);
            Editor.print(e.message);
            Editor.print(e.stack);
        }
    }
}
