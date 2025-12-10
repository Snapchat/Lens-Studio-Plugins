import * as Ui from 'LensStudio:Ui';
import * as SysInfo from 'LensStudio:SysInfo';
import {EditorPlugin} from "LensStudio:EditorPlugin";
import {launchWebSocketServer} from './webviewServerManager.js';
import TcpServerManager from './TcpServerManager.js';
import {FileWatcher} from "./utils/files/fileWatcher.js";
import {PluginSettings} from "./lib/Resources/Common.js";
import { isValidEntityToEdit, isCustomComponentFile, isValidScriptToEdit } from './utils/index.js';


const LOCALHOST_ADDRESS = "127.0.0.1";
const addr = {
    serverAddr: `http://${LOCALHOST_ADDRESS}`,
};

const findEditableEntity = (entities) => {
    if (Array.isArray(entities)) {
        return entities.find(e => isValidEntityToEdit(e));
    } else if (isValidEntityToEdit(entities)) {
        return entities;
    }
    return undefined;
};

export class ScriptEditor extends EditorPlugin {
    static descriptor() {
        return {
            id: PluginSettings.PluginID,
            name: PluginSettings.PluginName,
            description: 'Lens Studio Text Editor',
            canEdit: entity => {
                return isValidEntityToEdit(entity);
            },
            defaultSize: new Ui.Size(800, 500),
            minimumSize: new Ui.Size(100, 150),
            isUnique: true
        };
    }

    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);
        const model = pluginSystem.findInterface(Editor.Model.IModel);
        this.assetManager = model.project.assetManager;
        this.mGui = pluginSystem.findInterface(Ui.IGui);
        this.initialDependenciesLoaded = false;
        this.guards = [];

        this.webSocketManager = launchWebSocketServer(this.assetManager, this.mGui, SysInfo.productType);
        this.tcpManager = new TcpServerManager();
        this.tcpManager.start(LOCALHOST_ADDRESS);

        this.fileWatcher = new FileWatcher(model, this.webSocketManager);

        this.guards.push(model.onProjectSaving.connect(() => {
            this.webSocketManager.saveAllFiles();
        }));
        this.guards.push(model.onProjectAboutToBeChanged.connect(() => {
            // changing
        }));
        this.guards.push(model.onProjectChanged.connect(() => {
            this.assetManager = model.project.assetManager;
            this.initialDependenciesLoaded = false;
            if (!this.isClosing) {
                this.deinit();
            }
        }));
    }

    createWidget(parent) {
        const widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        widget.layout = layout;

        const stackedWidget = new Ui.StackedWidget(widget);
        stackedWidget.backgroundRole = Ui.ColorRole.Base;
        stackedWidget.autoFillBackground = true;
        layout.addWidget(stackedWidget);

        const loadingWidget = new Ui.Widget(stackedWidget);
        loadingWidget.backgroundRole = Ui.ColorRole.Base;
        loadingWidget.autoFillBackground = true;
        const loadingLayout = new Ui.BoxLayout();
        loadingLayout.setDirection(Ui.Direction.TopToBottom);
        loadingWidget.layout = loadingLayout;

        this.loadingIndicator = new Ui.StatusIndicator('Loading Text Editor...', loadingWidget);
        this.loadingIndicator.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        loadingLayout.addWidget(this.loadingIndicator);
        this.loadingIndicator.start();

        stackedWidget.addWidget(loadingWidget);

        const webView = new Ui.WebEngineView(stackedWidget);
        webView.contextMenuPolicy = Ui.ContextMenuPolicy.NoContextMenu;
        webView.backgroundRole = Ui.ColorRole.Base;
        webView.autoFillBackground = true;
        stackedWidget.addWidget(webView);

        stackedWidget.currentIndex = 0;

        const tcpPort = this.tcpManager.getPort();
        const webserverPort = this.webSocketManager.getPort();
        const editorUrl = `${addr.serverAddr}:${tcpPort}/web/editor?port=${webserverPort}`;

        webView.onLoadStarted.connect(() => {
            stackedWidget.currentIndex = 0;
        });

        webView.onLoadFinished.connect(() => {
            webView.setUndoableRecursive(true);
        });

        this.webSocketManager.onEditorFullyLoaded = () => {
            stackedWidget.currentIndex = 1;
            this.loadingIndicator.stop();
        };

        webView.load(editorUrl);

        this.isClosing = false;
        this.guards.push(widget.onClose.connect((event) => {
            if (this.isClosing) {
                if (event) event.ignore();
                return;
            }

            const hasUnsaved = this.webSocketManager.checkUnsavedFiles();
            if (!hasUnsaved) {
                if (event) event.accept();
                return;
            }

            this.isClosing = true;
            const buttons = Ui.MessageBox.StandardButton.Save | Ui.MessageBox.StandardButton.Discard | Ui.MessageBox.StandardButton.Cancel;
            const defaultButton = Ui.MessageBox.StandardButton.Save;
            const userChoice = Ui.MessageBox.warning(
                "",
                "Would you like to save modified assets?",
                buttons,
                defaultButton
            );

            if (userChoice === Ui.MessageBox.StandardButton.Save) {
                this.webSocketManager.saveAllFiles();
                if (event) event.accept();
            } else if (userChoice === Ui.MessageBox.StandardButton.Discard) {
                if (event) event.accept();
            } else {
                if (event) event.ignore();
                this.isClosing = false;
            }
        }));

        return widget;
    }

    updateLoadingMessage(scriptName) {
        if (this.loadingIndicator) {
            this.loadingIndicator.text = `Loading ${scriptName}...`;
        }
    }


    edit(entities, line = null) {
        this.editableEntity = findEditableEntity(entities);

        if (!this.editableEntity) {
            return false;
        }

        let assetToOpen = this.editableEntity;
        const sourcePath = assetToOpen.fileMeta.sourcePath.toString();
        const scriptName = sourcePath.split('/').pop().split('\\').pop();
        this.updateLoadingMessage(scriptName);

        // Handle custom component files
        if (isCustomComponentFile(sourcePath)) {
            if (assetToOpen.primaryAsset && isValidEntityToEdit(assetToOpen.primaryAsset)) {
                assetToOpen = assetToOpen.primaryAsset;
            } else {
                console.warn(`[Text Editor] Selected packed Custom Component has no primary asset. Aborting open.`);
                return false;
            }
        }

        if (!this.initialDependenciesLoaded) {
            const allAssets = this.assetManager.assets;
            allAssets.forEach(asset => {
                const dependencySourcePath = asset.fileMeta.sourcePath.toString();
                if (!assetToOpen.isSame(asset) && isValidScriptToEdit(asset) && !isCustomComponentFile(dependencySourcePath)) {
                    this.webSocketManager.loadDependency(dependencySourcePath, asset.id.toString());
                }
            });
            this.initialDependenciesLoaded = true;
        }

        const relativeAssetPath = assetToOpen.fileMeta.sourcePath.toString();
        const componentId = assetToOpen.id.toString();
        const finalLineNumber = (line !== null && line !== undefined && line > 0) ? line : null;

        this.webSocketManager.openFile(relativeAssetPath, componentId, finalLineNumber);
        return true;
    }

    deinit() {
        return new Promise((resolve) => {
            this.isClosing = true;

            try {
                for (const sub of this.guards) {
                    sub.disconnect();
                }
                this.guards = [];
            } catch (e) {
                console.error("Error disconnecting guards:", e);
            }

            if (this.fileWatcher) {
                try {
                    this.fileWatcher.close();
                } catch (e) {
                    console.error("Error closing fileWatcher:", e);
                }
            }

            if (this.webSocketManager) {
                this.webSocketManager.broadcastShutdownAndWait(() => {
                    try {
                        this.webSocketManager.close();
                        if (this.tcpManager) this.tcpManager.close();
                    } catch (e) {
                        console.error("Error closing servers:", e);
                    }
                    resolve();
                });
            } else {
                try {
                    if (this.tcpManager) this.tcpManager.close();
                } catch (e) {
                    console.error("Error closing tcpManager:", e);
                }
                resolve();
            }
        });
    }
}
