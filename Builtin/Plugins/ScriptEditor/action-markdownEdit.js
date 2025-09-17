import CoreService from "LensStudio:CoreService";
import * as Ui from "LensStudio:Ui";

import { ScriptEditor } from "./main";

export class AssetMenuItem extends CoreService {
    static descriptor() {
        return {
            id: "Com.Snap.EditMarkdownContextMenuItemService",
            name: "Edit Markdown",
            description: "Opens Markdown in the Script Editor",
            dependencies: [Editor.IContextActionRegistry, Editor.IEntityPicker, Editor.Model.IModel, Ui.IEditorsManager]
        };
    }

    /**
     * @param {Editor.PluginSystem} pluginSystem
     */
    constructor(pluginSystem) {
        super(pluginSystem);
    }

    createAssetAction(context) {

        const action = new Editor.ContextAction();

        /**
         * Below is the logic to check whether we should add some action.
         */

        // Because we are trying to add a new action to the context menu of the Asset Browser,
        // check if the context is of type AssetContext. If not, return an empty action.
        if (!context.isOfType("AssetContext")) {
            return action;
        }

        /** @type {Editor.Model.AssetContext.Item[]} */
        const selection = context.selection;
        if (selection.length === 0 || selection.length > 1) {
            return action;
        }

        // Filter to only markdown assets
        const markdownAssets = selection
            .map(item => item.asset)
            .filter(asset => asset && asset.type === "MarkdownAsset");

        // Check if any asset is a markdown asset.
        if (markdownAssets.length === 0) {
            return action;
        }

        /**
         * Below is the action that will be added to the context menu.
         */

        action.id = "Action.MarkdownEdit";
        action.caption = "Edit Markdown in the Script Editor";
        action.description = "Edits the selected Markdown file(s) in the Script Editor.";
        action.group = [];

        action.apply = async () => {
            try {
                const model = this.pluginSystem.findInterface(Editor.Model.IModel)
                /** @type {Editor.Model.AssetManager} */
                const assetDirectory = model.project.assetsDirectory;

                markdownAssets.map(asset => assetDirectory.appended(asset.fileMeta.sourcePath));

                const editorsComponent = this.pluginSystem.findInterface(Ui.IEditorsManager);
                for (const asset of markdownAssets) {
                    editorsComponent.openEditors(asset, [ScriptEditor.descriptor().id]);
                }

            } catch (e) {
                console.error(e);
                console.error(e.stack);
            }
        };
        return action;
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
