import * as ws from 'LensStudio:WebSocket';
import * as Network from 'LensStudio:Network';
import * as fs from 'LensStudio:FileSystem';
import * as Ui from 'LensStudio:Ui';
import * as Script from 'LensStudio:ScriptEditor';
import {generateInputDeclarations} from "./utils/files/completion.js";
import {EDITOR_EVENTS, FILE_EVENTS} from "./lib/Resources/Common.js";
import { isValidComponentToEdit } from './utils/index.js';

const scriptPath = import.meta.url.replace('file://', '');
const scriptDir = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
const tsScriptPath = scriptDir + '/lib/BaseScriptComponent.d.ts';
const decScriptPath = scriptDir + '/lib/Decorators.d.ts'; // TODO only add if TS?
const uiDefPath = scriptDir + '/lib/UIControl.d.ts';
const scriptDef = "\ndeclare var script : ScriptComponent;"

function generateTypeMap(definitionsContent, projectScripts, assetManager) {
    const componentRegex = /interface ComponentNameMap\s*\{(?<content>[\s\S]*?)\}/;
    const componentMatch = definitionsContent.match(componentRegex);
    const generatedTypeMap = {
        'float': 'number',
        'int': 'number',
        'bool': 'boolean',
        'string': 'string',
        'vec2': 'vec2',
        'vec3': 'vec3',
        'vec4': 'vec4',
        'quat': 'quat',
        'mat2': 'mat2',
        'mat3': 'mat3',
        'mat4': 'mat4',
    };

    if (componentMatch && componentMatch.groups.content) {
        const componentPairsRegex = /"\b(.*?)\b":\s*(\w+);/g;
        let pair;
        while ((pair = componentPairsRegex.exec(componentMatch.groups.content)) !== null) {
            generatedTypeMap[`Component.${pair[1]}`] = pair[2];
            generatedTypeMap[pair[1]] = pair[2];
        }
    }

    const assetRegex = /declare class (\w+) extends Asset/g;
    let assetMatch;
    while ((assetMatch = assetRegex.exec(definitionsContent)) !== null) {
        generatedTypeMap[`Asset.${assetMatch[1]}`] = assetMatch[1];
        generatedTypeMap[assetMatch[1]] = assetMatch[1];
    }

    const typedefRegex = /\/\*\*?\s*@typedef\s+([^\s\*]+)[\s\S]*?\*\//gm;
    const customTypeDefs = {};
    const assetsDirectoryPath = assetManager.assetsDirectory;

    projectScripts.forEach(script => {
        if (script.filePath.toLowerCase().endsWith('.lsc')) {
            return;
        }

        try {
            const absolutePath = `${assetsDirectoryPath.toString()}/${script.filePath}`;
            const scriptContent = fs.readFile(new Editor.Path(absolutePath)).toString();
            let match;
            while ((match = typedefRegex.exec(scriptContent)) !== null) {
                if (match[1]) {
                    customTypeDefs[match[1]] = match[1];
                }
            }
        } catch (e) {
            console.error(`Could not read script ${script.filePath} for typedef parsing.`);
        }
    });

    return {...generatedTypeMap, ...customTypeDefs};
}


async function handleEditorMessage(socket, message, serverManager) {
    let parsedMessage;
    try {
        parsedMessage = JSON.parse(message);
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return;
    }

    const {event, payload, requestId} = parsedMessage;

    const sendResponse = (data) => {
        socket.send(JSON.stringify({event: `${event}Response`, payload: data, requestId}));
    };

    switch (event) {
        case EDITOR_EVENTS.EDITOR_READY:
            try {
                const scriptingDefPath = Script.Definitions.StudioLibAbsolutePath;
                const definitionsContent = fs.readFile(scriptingDefPath).toString() + scriptDef;

                const projectScripts = serverManager.assetManager.assets
                    .filter(isValidComponentToEdit)
                    .map(asset => ({
                        filePath: asset.fileMeta.sourcePath.toString(),
                        componentId: asset.id.toString()
                    }));

                serverManager.typeMap = generateTypeMap(definitionsContent, projectScripts, serverManager.assetManager);

                const declarations = [{
                    path: 'StudioLib.d.ts',
                    content: definitionsContent
                }, {
                    path: 'BaseScriptComponent.d.ts',
                    content: fs.readFile(new Editor.Path(tsScriptPath)).toString()
                }, {
                    path: 'UIControl.d.ts',
                    content: fs.readFile(new Editor.Path(uiDefPath)).toString()
                }, {
                    path: 'Decorators.d.ts',
                    content: fs.readFile(new Editor.Path(decScriptPath)).toString()
                }];

                socket.send(JSON.stringify({
                    event: EDITOR_EVENTS.CREATE_DEF_FILES, payload: {
                        files: declarations,
                        generatedTypeMap: serverManager.typeMap,
                        projectScripts,
                    }
                }));
            } catch (error) {
                console.error("Failed to read declaration files:", error);
            }
            break;

        case EDITOR_EVENTS.GET_SCRIPT_CONTENT:
            if (payload && payload.filePath) {
                const assetsDirectoryPath = serverManager.assetManager.assetsDirectory;
                const absolutePath = `${assetsDirectoryPath.toString()}/${payload.filePath}`;
                let scriptContent = '';

                try {
                    scriptContent = fs.readFile(new Editor.Path(absolutePath)).toString();
                } catch (e) {
                    return
                }

                const typeMap = serverManager.typeMap;
                const inputDeclarations = generateInputDeclarations(scriptContent, typeMap);
                sendResponse({
                    content: scriptContent,
                    filePath: payload.filePath,
                    inputDeclarations: inputDeclarations,
                });
            } else {
                sendResponse({content: "// No script selected", filePath: null});
            }
            break;
        case EDITOR_EVENTS.SHOW_SAVE_DIALOG: {
            serverManager.createSaveDialog(sendResponse);
            break;
        }
        case EDITOR_EVENTS.SAVE_ALL_FILES:
            if (payload && payload.files) {
                const assetsDirectoryPath = serverManager.assetManager.assetsDirectory;
                for (const file of payload.files) {
                    const absolutePath = `${assetsDirectoryPath.toString()}/${file.filePath}`;
                    fs.writeFile(new Editor.Path(absolutePath), file.content);
                }
            }
            break;
        case EDITOR_EVENTS.SAVE_SCRIPT_CONTENT:
            if (payload && payload.filePath && payload.content) {
                const assetsDirectoryPath = serverManager.assetManager.assetsDirectory;
                const absolutePath = `${assetsDirectoryPath.toString()}/${payload.filePath}`;
                let pathToWrite = new Editor.Path(absolutePath)
                fs.writeFile(pathToWrite, payload.content);
            }
            break;
        case EDITOR_EVENTS.GET_CONTENT_DECLARATIONS:
            if (payload && payload.content !== undefined) {
                const typeMap = serverManager.typeMap;
                const inputDeclarations = generateInputDeclarations(payload.content, typeMap);
                sendResponse({inputDeclarations});
            }
            break;
        case EDITOR_EVENTS.GET_FILE_METADATA:
            if (payload && payload.filePath) {
                try {
                    let fileMeta = null;
                    // Try the direct path lookup
                    try {
                        const editorPath = new Editor.Path(payload.filePath);
                        if (serverManager && serverManager.assetManager)
                            fileMeta = serverManager.assetManager.getFileMeta(editorPath);
                    } catch (e) {
                        // Will fail on assets in /Cache/
                    }

                    // If /Cache/, search all assets.
                    if (!fileMeta && payload.filePath.includes('/Cache/')) {
                        const allAssets = serverManager.assetManager.assets;
                        const targetAsset = allAssets.find(asset => asset.fileMeta.sourcePath.toString() === payload.filePath);
                        if (targetAsset) {
                            fileMeta = targetAsset.fileMeta;
                        }
                    }

                    sendResponse({
                        fileMeta: fileMeta ? {
                            sourcePath: fileMeta.sourcePath.toString(),
                            topmostNativePackageRoot: fileMeta.topmostNativePackageRoot ? {
                                sourcePath: fileMeta.topmostNativePackageRoot.sourcePath.toString(),
                                packageName: fileMeta.topmostNativePackageRoot.sourcePath.toString().split('/').pop()
                            } : null
                        } : null
                    });
                } catch (e) {
                    console.error("Error getting file metadata:", e);
                    sendResponse({fileMeta: null});
                }
            }
            break;
        case EDITOR_EVENTS.UNSAVED_STATE_CHANGED:
            if (payload && typeof payload.hasUnsaved === 'boolean') {
                serverManager.hasUnsavedFiles = payload.hasUnsaved;
            }
            break;
        case 'editorFullyLoaded':
            if (serverManager.onEditorFullyLoaded) {
                serverManager.onEditorFullyLoaded();
            }
            break;
        case 'shutdownComplete':
            break;
        default:
            console.warn(event);
    }
}

class WebviewServerManager {
    constructor(assetManager, mGui, productType) {
        this.server = ws.WebSocketServer.create();
        this.socket = 0;
        this.filesToOpen = [];
        this.assetManager = assetManager;
        this.mGui = mGui;
        this.typeMap = {};
        this.productType = productType;
        this.hasUnsavedFiles = false;
        this.onEditorFullyLoaded = null;

        this.server.onConnect.connect((socket) => {
            this.socket = socket;
            this.openDelayedFiles();

            this.socket.send(JSON.stringify({
                event: EDITOR_EVENTS.PLATFORM_INFO,
                payload: {productType: this.productType}
            }));

            socket.onData.connect((buffer) => {
                handleEditorMessage(this.socket, buffer.toString(), this);
            });
            socket.onEnd.connect(() => {
                // Connection ended
            });
            socket.onError.connect((error) => {
                if (error !== 1)
                    console.error('Socket error: ' + error);
            });
        });

        this.server.onError.connect((error) => {
            console.error('Server error: ' + error);
        });
    }

    start() {
        const localhostAddr = new Network.Address();
        localhostAddr.address = '127.0.0.1';
        localhostAddr.port = 0;
        this.server.listen(localhostAddr);
    }

    async close() {
        try {
            if (this.socket) {
                this.socket.close();
            }
        } catch (e) {
            console.error("Error closing WebSocket:", e);
        }

        try {
            this.server.close();
        } catch (e) {
            console.error("Error closing WebSocket server:", e);
        }
    }

    broadcastShutdownAndWait(onComplete) {
        if (this.socket) {
            let completed = false;
            let shutdownConnection = null;

            const timeout = setTimeout(() => {
                if (!completed) {
                    console.warn("WebSocket shutdown timeout, forcing close");
                    completed = true;
                    if (shutdownConnection) {
                        shutdownConnection.disconnect();
                    }
                    onComplete();
                }
            }, 5000);

            try {
                this.socket.send(JSON.stringify({event: EDITOR_EVENTS.SHUTDOWN}));

                const handler = (buffer) => {
                    try {
                        const msg = JSON.parse(buffer.toString());
                        if (msg.event === 'shutdownComplete') {
                            if (!completed) {
                                completed = true;
                                clearTimeout(timeout);
                                if (shutdownConnection) {
                                    shutdownConnection.disconnect();
                                }
                                onComplete();
                            }
                        }
                    } catch (e) {
                        console.error("Error parsing shutdown response:", e);
                    }
                };

                shutdownConnection = this.socket.onData.connect(handler);
            } catch (e) {
                console.error("Error sending shutdown message:", e);
                if (!completed) {
                    completed = true;
                    clearTimeout(timeout);
                    if (shutdownConnection) {
                        shutdownConnection.disconnect();
                    }
                    onComplete();
                }
            }
        } else {
            onComplete();
        }
    }

    getPort() {
        return this.server.port;
    }

    checkUnsavedFiles() {
        return this.hasUnsavedFiles;
    }

    saveAllFiles() {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                event: FILE_EVENTS.SAVE_ALL_FILES
            }));
        }
    }

    discardAllFiles() {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                event: FILE_EVENTS.DISCARD_ALL_FILES
            }));
        }
    }

    openFile(filePath, componentId) {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                event: FILE_EVENTS.ACTIVE_CHANGED, payload: {filePath, componentId}
            }));
        } else {
            this.filesToOpen.push({path: filePath, id: componentId, visible: true});
        }
    }

    loadDependency(filePath, componentId) {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                event: FILE_EVENTS.LOAD_DEPENDENCY, payload: {filePath, componentId}
            }));
        } else {
            if (!this.filesToOpen.some(f => f.id === componentId)) {
                this.filesToOpen.push({path: filePath, id: componentId, visible: false});
            }
        }
    }

    notifyFileContentChanged(componentId) {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                event: FILE_EVENTS.CONTENT_CHANGED, payload: {componentId}
            }));
        }
    }

    notifyFileRenamed(payload) {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                event: FILE_EVENTS.RENAMED,
                payload: payload
            }));
        }
    }

    notifyFileDeleted(componentId) {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                event: FILE_EVENTS.DELETED, payload: {componentId}
            }));
        }
    }

    updateFileReadOnlyStatus(componentId) {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                event: FILE_EVENTS.UPDATE_READONLY, payload: {componentId}
            }));
        }
    }

    openDelayedFiles() {
        for (let {path, id, visible} of this.filesToOpen) {
            if (visible) this.openFile(path, id); else this.loadDependency(path, id);
        }
        this.filesToOpen = [];
    }

    createSaveDialog(sendResponse) {
        const buttons = Ui.MessageBox.StandardButton.Save | Ui.MessageBox.StandardButton.Discard | Ui.MessageBox.StandardButton.Cancel;
        const defaultButton = Ui.MessageBox.StandardButton.Save;
        const userChoice = Ui.MessageBox.warning(
            "",
            "Do you want to save this script?",
            buttons,
            defaultButton
        );

        if (userChoice === Ui.MessageBox.StandardButton.Save) {
            sendResponse('save')
        } else if (userChoice === Ui.MessageBox.StandardButton.Discard) {
            sendResponse('discard')
        }

        sendResponse('cancel')
    }
}

export function launchWebSocketServer(assetManager, mGui, productType) {
    const server = new WebviewServerManager(assetManager, mGui, productType);
    server.start();
    return server;
}
