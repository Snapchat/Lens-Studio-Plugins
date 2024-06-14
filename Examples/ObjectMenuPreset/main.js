//@ts-nocheck
import Preset from "LensStudio:Preset";
import Utils from "./utils.js";

// Add a new item to the Add menu of the Scene Hierarchy named "Screen Image" within the "Demo" section
export class ObjectMenuPreset extends Preset {
    static descriptor() {
        return {
            id: "LS.Plugin.Example.ObjectMenuPreset",
            interfaces: Preset.descriptor().interfaces,
            name: "Screen Image Preset",
            description: "Preset for adding a Screen Image to the Scene Hierarchy",
            icon: Editor.Icon.fromFile(new Editor.Path(import.meta.resolve("./icon.svg"))),
            // Section is the category in which the preset will be added into
            section: "Demo",
            entityType: "SceneObject",
            dependencies: [Editor.Model.IModel]
        };
    }

    /**
     * @param {Editor.PluginSystem} pluginSystem
     */
    constructor(pluginSystem) {
        super(pluginSystem);
        this.pluginSystem = pluginSystem;
        // Flags    
        this.image = null;
        this.material = null;
    }

    /**
    * @description Called when a user adds the preset. The synchronous version is `create`, and the asynchronous version is `createAsync`. 
     * Important: You must return an EntityRef from this function.
     * The destination parameter will be evaluated as either a string or a (SceneObject | null) depending on the entityType parameter in the descriptor function. 
     * For entityType: 'Asset', destination will be an Editor.Path representing the asset directory.
     * For entityType: 'SceneObject', destination will be a SceneObject, which is the selected scene object at the moment, or null if no scene object is selected.
     * For entityType: 'Component', destination will be a SceneObject, which is the bearer of the component.
     * For more information, please refer to the official documentation.
     * 
     * @param {Editor.Model.SceneObject} destination - the return type is determined by the entityType parameter in the descriptor function.
     * 
     */
    async createAsync(destination) {
        // Preparation
        /** @type {Editor.Model.IModel} */
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);

        // Find the bearer object
        const bearer = this.findBearerObject(destination, model);

        // Add screen image to the bearer        
        const screenImage = await Utils.createScreenImage(model, bearer);

        //we return the newly created scene object, if the screen image was created successfully
        if (screenImage && screenImage.sceneObject) {
            return screenImage.sceneObject;
        } else {
            //return null if the screen image was not created successfully
            Editor.print("Failed to create screen image.");
            return null;
        }
    }

    /**
     * Finds the bearer object based on the given selection and model.
     * 
     * @param {Editor.Model.SceneObject} selection - The selection object.
     * @param {Editor.Model.IModel} model - The model object.
     * @returns {Editor.Model.SceneObject} The bearer object.
     */
    findBearerObject(selection, model) {
        // Check if the parent of the selection has an ortho camera or screen transform component
        const parentObject = selection ? selection.getParent() : null;
        if (parentObject) {
            const componentTypes = parentObject.components.map(component => component.getTypeName());
            const isOrthoCam = componentTypes.includes("Camera") && parentObject.components.some(component => component.cameraType == Editor.Components.CameraType.Orthographic);
            const isScreenTransform = componentTypes.includes("ScreenTransform");
            if (isOrthoCam || isScreenTransform) {
                return selection;
            }
        }

        // If bearer is not found, check for other ortho cams in the scene
        let cameraObject = Utils.getOrthoCameraObject(model);

        const scene = model.project.scene;

        // If Ortho cam does not exist, add a new one to the selection
        if (!cameraObject) {
            if (selection == null) {
                selection = model.project.scene.addSceneObject(null);
                selection.name = "Ortho Camera";
            }
            cameraObject = Utils.createOrthoCamera(scene, selection);
        }

        // Add a child scene object and return it as the bearer
        return model.project.scene.addSceneObject(cameraObject);
    }
}
