import GuiService from "LensStudio:GuiService";
import * as Ui from "LensStudio:Ui";

import { ScriptEditor } from "../main";

export function createAssetEditMenuItem({
    entityType,
}) {
    return class AssetEditMenuItem extends GuiService {
        static descriptor() {
            return {
                id: `Com.Snap.Edit${entityType}ContextMenuItemService`,
                name: `Edit ${entityType}`,
                description: `Opens ${entityType} in the Text Editor`,
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

            // Filter to only assets of expected type
            const editableAssets = selection
                .map(item => item.asset)
                .filter(asset => asset && asset.type === entityType);

            if (editableAssets.length === 0) {
                return action;
            }

            action.id = "Action.MarkdownEdit";
            action.caption = `Edit ${entityType} in the Text Editor`;
            action.description = `Edits the selected ${entityType} file(s) in the Text Editor.`;
            action.group = [];

            action.apply = async () => {
                try {
                    const model = this.pluginSystem.findInterface(Editor.Model.IModel)
                    /** @type {Editor.Model.AssetManager} */
                    const assetDirectory = model.project.assetsDirectory;

                    editableAssets.map(asset => assetDirectory.appended(asset.fileMeta.sourcePath));

                    const editorsComponent = this.pluginSystem.findInterface(Ui.IEditorsManager);
                    for (const asset of editableAssets) {
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

}
