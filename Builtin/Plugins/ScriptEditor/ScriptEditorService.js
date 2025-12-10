import * as Logger from 'LensStudio:Logger';
import {GuiService} from 'LensStudio:GuiService';
import {PluginSettings} from './lib/Resources/Common.js';

/**
 * ScriptError - Represents a parsed script error with filename and line number
 */
export class ScriptError {
    constructor(fileName = '', lineNumber = -1) {
        this.fileName = fileName;
        this.lineNumber = lineNumber;
    }

    /**
     * Parse an error string to extract filename and line number
     * @param {string} errorString - The error string to parse
     * @returns {ScriptError} A ScriptError instance, or empty if parsing fails
     */
    static fromCoreException(errorString) {
        if (!/[:\(\[]/.test(errorString)) {
            return new ScriptError();
        }

        // Error patterns: [1]=filename, [2]=lineNumber
        const patterns = [
            // Bracketed print: "[Assets/foo.js:3] ..." or "[Packages/foo.js:3] ..."
            /\[(?:(?:Assets|Packages)\/)?([^\]]+\.(?:js|ts)):(\d+)\]/,
            // TS compile: "Assets/foo.ts(2,18):" or "Packages/foo.ts(2,18):"
            /(?:(?:Assets|Packages)\/)?(.+?)\((\d+),\d+\):\s*error\s*TS\d+/,
            // JS stack: "...@Assets/foo.js:12" or "...@Packages/foo.js:12"
            /Stack trace:\s*(?:[^@]*@)?(?:(?:Assets|Packages)\/)?(.+?):(\d+)/
        ];

        for (const pattern of patterns) {
            const match = errorString.match(pattern);
            if (match) {
                return new ScriptError(match[1].trim(), parseInt(match[2], 10));
            }
        }

        return new ScriptError();
    }

    /**
     * Check if this error is valid (has a line number)
     * @returns {boolean} True if the error contains valid information
     */
    get isValid() {
        return this.fileName !== '' && this.lineNumber !== -1;
    }
}

/**
 * ScriptEditorService - A service for managing ScriptEditor functionality
 * Extends GuiService to provide GUI-related services for the Script Editor plugin
 */
export class ScriptEditorService extends GuiService {
    static descriptor() {
        return {
            id: `${PluginSettings.PluginID}.Service`,
            name: "Script Editor Service",
            description: "Service for managing Script Editor functionality",
            dependencies: [Editor.Model.IModel, Editor.Dock.IDockManager]
        };
    }

    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);
        this.guards = [];
    }

    start() {
        const logCollector = this.pluginSystem.findInterface(Logger.IUserLogCollector);
        if (!logCollector) {
            console.error("ScriptEditorService: LogCollector not available");
            return;
        }

        this.guards.push(logCollector.onRevealLogRequest.connect((message) => {
            try {
                const error = ScriptError.fromCoreException(message);
                if (!error.isValid)
                    return;

                const scriptAsset = this.findScriptAssetFromError(error);
                if (!scriptAsset)
                    return;

                this.openScriptAssetInEditor(scriptAsset, error.lineNumber);
            } catch (e) {
                console.error("ScriptEditorService: Error handling log reveal request:", e);
            }
        }));
    }

    stop() {
        this.cleanup();
    }

    cleanup() {
        this.guards.forEach(guard => {
            if (guard && typeof guard.disconnect === 'function') {
                guard.disconnect();
            } else if (guard && typeof guard.dispose === 'function') {
                guard.dispose();
            }
        });
        this.guards = [];
    }

    getModel() {
        return this.pluginSystem.findInterface(Editor.Model.IModel);
    }

    /**
     * Find script asset from a ScriptError
     * Checks Assets/ first, then Packages/
     * @param {ScriptError} scriptError - The parsed script error
     * @returns {Editor.Assets.ScriptAsset|null} The script asset, or null if not found
     */
    findScriptAssetFromError(scriptError) {
        const model = this.getModel();
        const assetManager = model.project.assetManager;

        const rootDirectories = [
            Editor.Model.SourceRootDirectory.Assets,
            Editor.Model.SourceRootDirectory.Packages
        ];

        for (const rootDir of rootDirectories) {
            try {
                const sourcePath = new Editor.Model.SourcePath(
                    new Editor.Path(scriptError.fileName),
                    rootDir
                );
                const fileMeta = assetManager.getFileMeta(sourcePath);

                if (!fileMeta) {
                    continue;
                }

                const targetSourcePath = fileMeta.sourcePath.toString();
                const scriptAsset = assetManager.assets.find(asset => {
                    const isScriptAsset = asset.getTypeName() === "JavaScriptAsset" ||
                                         asset.getTypeName() === "TypeScriptAsset";
                    return isScriptAsset &&
                           asset.fileMeta &&
                           asset.fileMeta.sourcePath &&
                           asset.fileMeta.sourcePath.toString() === targetSourcePath;
                });

                if (scriptAsset) {
                    return scriptAsset;
                }
            } catch (e) {
                continue;
            }
        }

        return null;
    }

    /**
     * Find or create ScriptEditor panel and open the script asset
     * @param {Editor.Assets.ScriptAsset} scriptAsset - The script asset to open
     * @param {number} lineNumber - Optional line number to navigate to (default: -1, meaning no line number)
     * @returns {boolean} True if successfully opened, false otherwise
     */
    openScriptAssetInEditor(scriptAsset, lineNumber = -1) {
        if (!scriptAsset || !scriptAsset.fileMeta) {
            return false;
        }

        const dockManager = this.pluginSystem.findInterface(Editor.Dock.IDockManager);
        if (!dockManager) {
            return false;
        }

        const normalizedLineNumber = (lineNumber !== null && lineNumber !== undefined && lineNumber > 0) ? lineNumber : null;

        const panels = dockManager.panels;
        let scriptEditorPanel = panels.find((panel) => panel.id.includes(PluginSettings.PluginID));

        if (!scriptEditorPanel) {
            try {
                const panelFilter = (descriptor) => descriptor.id === PluginSettings.PluginID;
                const allDescriptors = this.pluginSystem.descriptors;
                const panelDescriptor = allDescriptors.find(panelFilter);

                if (!panelDescriptor) {
                    console.error("ScriptEditorService: ScriptEditor descriptor not found");
                    return false;
                }

                scriptEditorPanel = this.pluginSystem.create(panelDescriptor);
                dockManager.add(scriptEditorPanel);
            } catch (e) {
                console.error("ScriptEditorService: Error creating ScriptEditor panel:", e);
                return false;
            }
        }

        if (!scriptEditorPanel) {
            console.error("ScriptEditorService: ScriptEditor panel is null");
            return false;
        }
        dockManager.activate(scriptEditorPanel);

        return scriptEditorPanel.edit([scriptAsset], normalizedLineNumber);
    }
}
