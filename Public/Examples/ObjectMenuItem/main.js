//@ts-nocheck
import CoreService from "LensStudio:CoreService";

// Add a menu item [Ungroup] to the context menu of Scene Objects in the Scene Hierarchy
export class ObjectMenuItem extends CoreService {
    static descriptor() {
        return {
            id: "LS.Plugin.Example.ObjectMenuItem",
            interfaces: CoreService.descriptor().interfaces,
            name: "Ungroup",
            description: "Adds an Ungroup action to the context menu of Scene Objects in the Scene Hierarchy for ungrouping a scene object hierarchy",
            dependencies: [Editor.IContextActionRegistry]
        };
    }

    /**
     * @param {Editor.PluginSystem} pluginSystem
     */
    constructor(pluginSystem) {
        super(pluginSystem);
        this.pluginSystem = pluginSystem;
    }

    // In the ungroup method
    /**
     * @param {Editor.Model.SceneObject} node - The scene object to ungroup
     */
    ungroup(node) {
        if (node == null) {
            return;
        }

        const parent = node.getParent();
        const members = [];

        // Traverse the hierarchy of the node and store all the descendants (including the node itself) in the members array
        const traverseHierarchy = (sceneObject) => {
            members.push(sceneObject);
            sceneObject.children.forEach(child => traverseHierarchy(child));
        };

        traverseHierarchy(node);

        // Get the start index for inserting the members
        const insertionIndex = parent == null ? node.topOwner.getRootObjectIndex(node) : parent.indexOfChild(node);

        // Reparent all the members (node and its descendants) to the parent of the node
        members.forEach((member, index) => {
            node.topOwner.reparentSceneObject(member, parent, insertionIndex + index);
        });
    }


    createObjectAction(context) {
        const action = new Editor.ContextAction();
        if (!context.isOfType("ObjectContext")) {
            // If the context is not of type ObjectContext, return an empty action.
            return action;
        }
        action.id = "Action.UngroupAction";
        action.caption = "Ungroup";
        action.description = "Ungroups a scene object hierarchy";
        // Array of strings, it will populate a sub menu in the context menu, creating more actions. If empty, no sub menu will be created
        action.group = [];
        action.apply = () => {
            /** @type {Editor.Model.SceneObject[]} */
            const selection = context.selection;
            selection.forEach((item) => {
                this.ungroup(item);
            });
        };
        return action;
    }

    // Start function in CoreService is called when Lens Studio starts and the plugin is loaded
    start() {
        Editor.print("Starting Ungroup Action core service");
        /** @type {Editor.IContextActionRegistry} */
        const actionsRegistry = this.pluginSystem.findInterface(Editor.IContextActionRegistry);
        // We need to hold the references to the actions to prevent them from being garbage collected
        this.guard = [];
        this.guard.push(actionsRegistry.registerAction((context) => this.createObjectAction(context)));
    }

    stop() {
        // Clear the guard array to allow the actions to be garbage collected
        this.guard = [];
    }
}
