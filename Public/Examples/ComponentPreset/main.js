//@ts-nocheck
import Preset from "LensStudio:Preset";

// Add a new item to the "Add Component" menu in the Component menu inside Inspector
export class ComponentPreset extends Preset {
    static descriptor() {
        return {
            id: "LS.Plugin.Example.ComponentPreset",
            name: "UI Button Preset",
            description: "Component Preset for adding a UI Button",
            icon: Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("./icon.svg"))),
            // Section is the category in which the preset will be added into
            section: "Demo",
            entityType: "Component",
            dependencies: [Editor.Model.IModel]
        };
    }

    /**
     * @param {Editor.PluginSystem} pluginSystem
     */

    /**
     * @param {Editor.Model.SceneObject} destination
     *
     * Called when a user adds the preset. The synchronous version is `create`, and the asynchronous version is `createAsync`.
     * Important: You must return an EntityRef from this function.
     * The destination parameter will be evaluated as either a string or a (SceneObject | null) depending on the entityType parameter in the descriptor function.
     * For entityType: 'Asset', destination will be an Editor.Path representing the asset directory.
     * For entityType: 'SceneObject', destination will be a SceneObject, which is the selected scene object at the moment, or null if no scene object is selected.
     * For entityType: 'Component', destination will be a SceneObject, which is the bearer of the component.
     * For more information, please refer to the official documentation.
     */
    create(destination) {
        /** @type {Editor.Model.IModel} */
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        //we return the newly created component
        return createScriptComponent(model, destination);
    }
}

/**
 * Creates a script component and fills it with the metadata of a script asset.
 * @param {Editor.Model.IModel} model - The model object.
 * @param {Editor.Model.SceneObject} destination - The destination entity where the script component will be added.
 * @returns {Editor.Components.ScriptComponent} The created script component.
 */
function createScriptComponent(model, destination) {
    // Create an empty script component
    /** @type {Editor.Components.ScriptComponent} */
    const scriptComponent = destination.addComponent("ScriptComponent");
    // Get the asset manager from Model
    const assetManager = model.project.assetManager;
    // Get the absolute path of the UI_Button.lsc file
    const absolutePath = new Editor.Path(import.meta.resolve("UI_Button.lsc"));
    // Import the file and get the metadata of the asset
    const importResult = assetManager.importExternalFile(absolutePath, new Editor.Path(""), Editor.Model.ResultType.Auto);
    // Fill up the script component with the metadata of the script asset
    scriptComponent.scriptAsset = importResult.primary;
    // Set UI Button properties
    //@ts-expect-error
    scriptComponent.text = "CHANGED BUTTON TEXT";
    //@ts-expect-error
    scriptComponent.normalColor = new vec4(0.2, 1, 0.2, 1);
    // Return the script component
    return scriptComponent;
}
