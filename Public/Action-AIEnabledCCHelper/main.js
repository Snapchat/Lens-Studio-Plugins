import CoreService from "LensStudio:CoreService";
import * as remoteServiceModule from 'LensStudio:RemoteServiceModule';
import * as fileSystem from "LensStudio:FileSystem";

import RemoteAPIHelper from './helpers/RemoteAPIHelper.js';
import { generateMarkdown } from './helpers/GenerateMetadata.js';

/**
 * CONFIGS
 */
const metadataDtsRelativeFilePath = './data/metadata.d.ts';
const attachmentFileJson = "AiMetadata.json";
const attachmentFileName = "AiMetadata.md";
const exampleJsonRelativePath = './data/example.json';
const promptRelativeFilePath = './data/prompt.md';

export class AiEnabledCCHelper extends CoreService {
    static descriptor() {
        return {
            id: "Com.Snap.EL.Action",
            name: "Make Script AI Enabled",
            description: "Adds additional support files needed to make custom component AI Enabled.",
            dependencies: [Editor.IContextActionRegistry, Editor.IEntityPicker, Editor.Model.IModel],
            interfaces: []
        };
    }

    /**
     * @param {Editor.PluginSystem} pluginSystem
     */
    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);
        this.gptHelper = new RemoteAPIHelper(remoteServiceModule, fileSystem);
    }

    createAssetAction(context) {

        // This is the action that will be added to the context menu.
        const action = new Editor.ContextAction();

        // Because we are trying to add a new action to the context menu of the Asset Browser,
        // check if the context is of type AssetContext. If not, return an empty action.
        if (!context.isOfType("AssetContext")) {
            return action;
        }

        /**
         * Check to see if we need to add the action
         */

        /** @type {Editor.Model.AssetContext.Item[]} */
        const selection = context.selection;
        if (selection.length !== 1) {
            return action;
        }

        /** @type {Editor.Assets.Asset} */
        const selectedAsset = selection[0].asset

        // E.g. selected root `Assets` or `Packages`
        if (!selectedAsset) {
            return action;
        }

        const selectedAssetType = selectedAsset.type;


        if (selectedAssetType !== "JavaScriptAsset" && selectedAssetType !== "TypeScriptAsset") {
            return action;
        }

        // Don't show menu item if AiMetadata already exists
        if (Array.isArray(selectedAsset.attachments)) {
            const attachmentsFileNames = selectedAsset.attachments.map(a => a ? a.name : null).filter(a => a !== null);
            if (attachmentsFileNames.includes("AiMetadata")) {
                return action;
            }
        }
        else {
            selectedAsset.attachments = [];
        }


        action.id = "Action.AiReadySupport";
        action.caption = "Add files to make script AI Enabled";
        action.description = "Adds additional support files needed to make this custom component AI Enabled";
        // Array of strings. It will populate a sub menu in the context menu, creating more actions. If empty, no sub menu will be created.
        action.group = [];
        // This is the function that will be called when the action is clicked.
        action.apply = async () => {
            try {

                /**
                 * ADD FILES 
                 */

                const model = this.pluginSystem.findInterface(Editor.Model.IModel)
                /** @type {Editor.Model.AssetManager} */
                const assetManager = model.project.assetManager;
                const assetDirectory = model.project.assetsDirectory;

                /**
                 * Generate AiMetadata from cc script.
                 */
                let generatedMetadata = "";
                try {
                    const metadataDts = fileSystem.readFile(import.meta.resolve(metadataDtsRelativeFilePath));
                    const prompt = fileSystem.readFile(import.meta.resolve(promptRelativeFilePath));

                    const generatedMetadataJson = await this.getGeneratedAiMetadata(prompt, metadataDts, assetDirectory, selectedAsset);

                    // Temporarily save the generated JSON to a file
                    // const tempFile = assetManager.cacheDirectory.appended(attachmentFileJson);
                    // fileSystem.writeFile(tempFile, generatedMetadataJson);
                    // const importedAiMetadataFile = assetManager.importExternalFile(tempFile, selection[0].path.parent, Editor.Model.ResultType.Auto);
                    // End

                    generatedMetadata = generateMarkdown(JSON.parse(generatedMetadataJson));
                } catch (e) {
                    console.error("Error generating AiMetadata:", e, "...Using fallback.");

                    const exampleMetadataJson = fileSystem.readFile(import.meta.resolve(exampleJsonRelativePath))
                    generatedMetadata = generateMarkdown(JSON.parse(exampleMetadataJson));
                }

                // Create an asset to the generated metadata file
                const tempFile = assetManager.cacheDirectory.appended(attachmentFileName);
                fileSystem.writeFile(tempFile, generatedMetadata);

                // Import it into the project
                const importedAiMetadataFile = assetManager.importExternalFile(tempFile, selection[0].path.parent, Editor.Model.ResultType.Auto);

                // Attach it to the CC
                selectedAsset.attachments = selectedAsset.attachments.concat([importedAiMetadataFile.primary]);

            } catch (e) {
                if (e instanceof Error) {
                    console.error(e.message);
                    console.error(e.stack);
                    console.error(e);
                } else {
                    console.error(e);
                }
            }
        };
        return action;
    }

    async getGeneratedAiMetadata(prompt, metadataTemplate, assetDirectory, selectedAsset) {
        /** @type {Editor.Path} */
        const selectedFilePath = assetDirectory.appended(selectedAsset.fileMeta.sourcePath);
        const selectedFileContent = fileSystem.readFile(selectedFilePath);

        const fullRequest = `${prompt}\n\n\`\`\`d.ts\n${metadataTemplate}\n\`\`\`\n\nFile: ${selectedFilePath.fileNameBase}\n\n\`\`\`js\n${selectedFileContent}\n\`\`\``;
        return await this.gptHelper.runJob(fullRequest);
    }

    async getMarkdownWithHints(prompt, metadataTemplate, currentMarkdown) {
        const fullRequest = `${prompt}\n\n\`\`\`d.ts\n${metadataTemplate}\n\`\`\`\n\n\`\`\`md\n${currentMarkdown}\n\`\`\``;

        return await this.gptHelper.runJob(fullRequest);
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