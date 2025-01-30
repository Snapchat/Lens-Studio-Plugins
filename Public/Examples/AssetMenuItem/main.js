//@ts-nocheck
import CoreService from "LensStudio:CoreService";

// Add a menu item [Replace] to the context menu of items in the Asset Browser
// But, there is a caveat: textures in materials won't be replaced. this is due to how we handle materials in Lens Studio
export class AssetMenuItem extends CoreService {
    static descriptor() {
        return {
            id: "LS.Plugin.Example.AssetMenuItem",
            interfaces: CoreService.descriptor().interfaces,
            name: "Replace References",
            description: "Adds a Replace action to the context menu of items in the Asset Browser for replacing references in the active scene to selected assets",
            dependencies: [Editor.IContextActionRegistry, Editor.IEntityPicker, Editor.Model.IModel]
        };
    }

    /**
     * @param {Editor.PluginSystem} pluginSystem
     */
    constructor(pluginSystem) {
        super(pluginSystem);
    }

    createAssetAction(context) {

        // Because we are trying to add a new action to the context menu of the Asset Browser,
        // check if the context is of type AssetContext. If not, return an empty action.
        if (!context.isOfType("AssetContext")) {
            return new Editor.ContextAction();
        }

        // This is the action that will be added to the context menu.
        const action = new Editor.ContextAction();
        action.id = "Action.ReplaceReferences";
        action.caption = "Replace";
        action.description = "Replaces references to selected assets";
        // Array of strings. It will populate a sub menu in the context menu, creating more actions. If empty, no sub menu will be created.
        action.group = [];
        // This is the function that will be called when the action is clicked.
        action.apply = () => {
            try {
                const selection = context.selection;
                if (selection.length === 0) {
                    return;
                }

                const selectedAssetType = selection[0].asset.type;
                const selectedAssets = this.getSelectedAssets(selection, selectedAssetType);

                /** @type {Editor.IEntityPicker} */
                const entityPicker = this.pluginSystem.findInterface(Editor.IEntityPicker);
                entityPicker.requestPicker(selectedAssetType, (pickedEntity) => {
                    if (!pickedEntity) {
                        throw new Error("No asset picked");
                    }
                    this.replaceReferences(selectedAssets, pickedEntity);
                });
            } catch (e) {
                console.error(e);
                console.error(e.message);
                console.error(e.stack);
            }
        };
        return action;
    }


    getSelectedAssets(selection, selectedAssetType) {
        return selection.map(item => {
            if (!item.asset.isOfType(selectedAssetType)) {
                throw new Error("All selected assets must be of the same type");
            }
            return item.asset;
        });
    }

    replaceReferences(selectedAssets, pickedEntity) {
        console.log("Starting references replacement...");
        const remaps = this.createRemapObject(selectedAssets, pickedEntity);
        /** @type {Editor.Model.IModel} */
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const project = model.project;
        const scene = project.scene;
        //we remap all the references used in the scene
        scene.remapReferences(remaps);
        console.log("References replaced");
    }

    createRemapObject(selectedAssets, pickedEntity) {
        const remaps = {};
        for (const asset of selectedAssets) {
            remaps[asset.id.toString()] = pickedEntity.id.toString();
        }
        return remaps;
    }

    getUnselectedAssets(projectAssets, selectedAssets) {
        return projectAssets.filter(asset => {
            const isSelected = selectedAssets.some(selectedAsset => selectedAsset.id.toString() === asset.id.toString());
            return !isSelected;
        });
    }


    // Start function in CoreService is called when Lens Studio starts and the plugin is loaded.
    start() {
        // Get the action registry component through the component ID.
        const actionsRegistry = this.pluginSystem.findInterface(Editor.IContextActionRegistry);
        // We need to hold the references to the actions to prevent them from being garbage collected.
        this.guard = [];
        this.guard.push(actionsRegistry.registerAction((context) => this.createAssetAction(context)));
    }

    stop() {
        // Clear the guard array to allow the actions to be garbage collected.
        this.guard = [];
    }
}
