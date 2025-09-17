import {EDITOR_EVENTS} from "../../lib/Resources/Common.js";
import {
    generateCustomTypeInterfaces,
    parseInputTypeTree,
    parseUiLayout,
    parseTypedefs,
    updateCompletionData
} from "./completion.js";
import { getLanguageFromFilePath } from "../index.js";

function _resolvedPath(fileMeta, filePath) {
    try {
        const dataMarker = 'Data/';
        const dataIndex = filePath.indexOf(dataMarker);

        if (dataIndex !== -1) {
            const scriptPath = filePath.substring(dataIndex + dataMarker.length);
            let packageName;

            if (fileMeta && fileMeta.topmostNativePackageRoot && fileMeta.topmostNativePackageRoot.packageName) {
                packageName = fileMeta.topmostNativePackageRoot.packageName;
            } else {
                const cachePathParts = filePath.split('/');
                const cacheIndex = cachePathParts.findIndex(part => part === 'Cache');
                if (cacheIndex !== -1 && cacheIndex + 1 < cachePathParts.length) {
                    packageName = cachePathParts[cacheIndex + 1];
                }
            }

            return `${packageName}/${scriptPath}`;
        }

        if (fileMeta && fileMeta.topmostNativePackageRoot && fileMeta.topmostNativePackageRoot.packageName) {
            const packageName = fileMeta.topmostNativePackageRoot.packageName;
            const fileName = filePath.split('/').pop();
            return `${packageName}/${fileName}`;
        }

        return filePath;

    } catch (e) {
        console.error(`Error resolving packed file path: ${filePath}`, e);
        return filePath;
    }
}

/**
 * @file Manages the editor's file state, UI tabs, and interaction logic.
 */
export class FileManager {
    constructor(editorInstance, tabBarElement, networkManager) {
        this.editor = editorInstance;
        this.tabBarElement = tabBarElement;
        this.networkManager = networkManager;

        this.openFiles = new Map();
        this.backgroundFiles = new Map();
        this.currentFile = null;
        this.dynamicDeclarationsLib = null;
        this.readOnlyFiles = new Map();
        this.unsavedState = false;
        this.connections = [];
        this.lastDiagnosticRefresh = 0;

        let debounceTimer;
        this.connections.push(this.editor.onDidChangeModelContent(() => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.handleContentChange();
            }, 20);
        }));
    }

    notifyOnUnsavedStateChange() {
        const hasUnsaved = this.getUnsavedFiles().length > 0;
        if (hasUnsaved !== this.unsavedState) {
            this.unsavedState = hasUnsaved;
            this.networkManager.notify(EDITOR_EVENTS.UNSAVED_STATE_CHANGED, {hasUnsaved});
        }
    }

    async _getPackedStatus(physicalPath) {
        if (physicalPath.toLowerCase().endsWith('.lsc')) {
            return {isPacked: true, fileMeta: null};
        }

        try {
            const {fileMeta} = await this.networkManager.request(EDITOR_EVENTS.GET_FILE_METADATA, {filePath: physicalPath});

            if (fileMeta) {
                const isPacked = !!(fileMeta.topmostNativePackageRoot || (fileMeta.sourcePath && fileMeta.sourcePath.includes("/Cache/")));
                return {isPacked, fileMeta};
            }
        } catch (e) {
            console.error(`Could not get metadata for ${physicalPath}`, e);
        }

        return {isPacked: false, fileMeta: null};
    }

    findFile(componentId) {
        if (this.openFiles.has(componentId)) {
            return {fileObject: this.openFiles.get(componentId), open: true};
        }
        if (this.backgroundFiles.has(componentId)) {
            return {fileObject: this.backgroundFiles.get(componentId), open: false};
        }
        return {fileObject: null, open: null};
    }

    renderTabs() {
        this.tabBarElement.innerHTML = '';
        for (const file of this.openFiles.values()) {
            const tabElement = document.createElement('div');
            tabElement.className = 'tab';
            if (this.currentFile && file.componentId === this.currentFile.componentId) tabElement.classList.add('active');
            if (file.hasChanges) tabElement.classList.add('has-changes');
            if (file.readOnly) tabElement.classList.add('read-only');
            const fileNameSpan = document.createElement('span');
            fileNameSpan.textContent = file.filePath.split(/[\\/]/).pop();
            tabElement.appendChild(fileNameSpan);
            const indicatorContainer = document.createElement('div');
            indicatorContainer.className = 'tab-indicator-container';
            const hasChangesIndicator = document.createElement('div');
            hasChangesIndicator.className = 'has-changes-indicator';
            indicatorContainer.appendChild(hasChangesIndicator);
            const closeIcon = document.createElement('span');
            closeIcon.className = 'close-icon';
            closeIcon.innerHTML = '&times;';
            indicatorContainer.appendChild(closeIcon);
            closeIcon.onclick = (e) => {
                e.stopPropagation();
                this.closeFile(file.componentId);
            };

            tabElement.appendChild(indicatorContainer);
            tabElement.title = file.filePath;
            tabElement.onclick = () => this.openAndSwitchToFile(file.filePath, null, file.componentId);
            this.tabBarElement.appendChild(tabElement);
        }
    }

    async updateFileReadOnlyStatus(componentId) {
        const {fileObject} = this.findFile(componentId);
        if (!fileObject) {
            return;
        }

        const {isPacked} = await this._getPackedStatus(fileObject.originalFilePath);

        if (isPacked && !fileObject.readOnly && fileObject.hasChanges) {
            fileObject.hasChanges = false;
            fileObject.model.setValue(fileObject.originalContent);
        }

        fileObject.readOnly = isPacked;
        if (this.currentFile && this.currentFile.componentId === componentId) {
            this.editor.updateOptions({
                readOnly: isPacked,
                readOnlyMessage: isPacked ? {value: "This script is inside a packed package and cannot be edited."} : undefined
            });
        }
        this.renderTabs();
        this.notifyOnUnsavedStateChange();
    }

    createDefinitionFile(filePath, content) {
        const language = getLanguageFromFilePath(filePath);
        const newModel = monaco.editor.createModel(content, language, monaco.Uri.parse(filePath));

        if (language !== 'markdown') {
            monaco.languages.typescript.javascriptDefaults.addExtraLib(content, `file:///${filePath}`);
            monaco.languages.typescript.typescriptDefaults.addExtraLib(content, `file:///${filePath}`);
        }

        const fileObject = {
            filePath,
            originalFilePath: filePath,
            componentId: `readonly_${filePath}`,
            model: newModel,
            viewState: null,
            hasChanges: false,
            originalContent: content,
            readOnly: true
        };

        this.readOnlyFiles.set(filePath, fileObject);
        this.backgroundFiles.set(fileObject.componentId, fileObject);
        return fileObject;
    }

    async getFileObject(filePath, componentId) {
        let {fileObject} = this.findFile(componentId)
        if (fileObject) {
            return fileObject;
        }

        try {
            const {content} = await this.networkManager.request(EDITOR_EVENTS.GET_SCRIPT_CONTENT, {filePath});
            const language = getLanguageFromFilePath(filePath);

            const {isPacked, fileMeta} = await this._getPackedStatus(filePath);

            let resolvedPath = filePath;
            if (isPacked) {
                resolvedPath = _resolvedPath(fileMeta, filePath);
            }

            if (resolvedPath.includes('/Cache/')) {
                console.error(`Error Loading Asset at ${filePath}`);
                return null;
            }

            const newModel = monaco.editor.createModel(content, language, monaco.Uri.parse(resolvedPath));

            fileObject = {
                filePath: resolvedPath,
                originalFilePath: filePath,
                componentId,
                model: newModel,
                viewState: null,
                hasChanges: false,
                originalContent: content,
                readOnly: isPacked
            };

            this.backgroundFiles.set(componentId, fileObject);
            return fileObject;

        } catch (e) {
            console.error(`Failed to load model for: ${filePath}`, e);
            return null;
        }
    }

    async loadDependency(filePath, componentId) {
        await this.getFileObject(filePath, componentId);
    }

    async openAndSwitchToFile(filePath, position, componentId) {
        if (!componentId) {
            this.editor.setModel(null);
            this.currentFile = null;
            this.renderTabs();
            return;
        }

        const fileObject = await this.getFileObject(filePath, componentId);

        if (fileObject) {
            await this.switchToFile(componentId, position);
        }
    }

    jumpToPosition(position) {
        if (monaco.Range.isIRange(position)) {
            this.editor.revealRangeInCenterIfOutsideViewport(position);
            this.editor.setSelection(position);
        } else {
            this.editor.revealPositionInCenterIfOutsideViewport(position);
            this.editor.setPosition(position);
        }
    }

    async switchToFile(componentId, position) {
        if (this.currentFile && this.currentFile.componentId === componentId) {
            if (position) this.jumpToPosition(position);
            return;
        }

        if (this.currentFile) {
            this.currentFile.viewState = this.editor.saveViewState();
        }

        let {fileObject} = this.findFile(componentId)
        if (!fileObject || !fileObject.model) {
            return
        }

        const wasInBackground = !this.openFiles.has(componentId);
        if (wasInBackground) {
            this.backgroundFiles.delete(componentId);
            this.openFiles.set(componentId, fileObject);
        }

        this.currentFile = fileObject;
        this.editor.setModel(fileObject.model);
        this.refreshModelDiagnostics(fileObject.model);

        await this.updateDeclarations(this.currentFile.model.getValue());
        this.editor.updateOptions({
            readOnly: fileObject.readOnly,
            readOnlyMessage: fileObject.readOnly ? {value: 'This script is inside a packed package and cannot be edited.'} : undefined
        });

        if (fileObject.viewState) {
            this.editor.restoreViewState(fileObject.viewState);
        }
        this.editor.focus();

        this.renderTabs();
        scrollTabIntoView(fileObject.filePath);
        if (position) this.jumpToPosition(position);
    }

    closeFile(componentId) {
        const {fileObject} = this.findFile(componentId)
        if (!fileObject) return;

        if (fileObject.hasChanges) {
            this.showSaveConfirmationDialog(fileObject);
        } else {
            this.proceedWithClose(fileObject);
        }
    }

    proceedWithClose(fileToClose) {
        const componentId = fileToClose.componentId;

        this.openFiles.delete(componentId);
        this.backgroundFiles.set(componentId, fileToClose);

        if (this.currentFile && this.currentFile.componentId === componentId) {
            const openFileValues = Array.from(this.openFiles.values());
            const nextFile = openFileValues.length > 0 ? openFileValues[0] : null;
            this.openAndSwitchToFile(nextFile ? nextFile.filePath : null, null, nextFile ? nextFile.componentId : null);
        } else {
            this.renderTabs();
        }
        this.notifyOnUnsavedStateChange();
    }

    async showSaveConfirmationDialog(fileToClose) {
        try {
            const result = await this.networkManager.request(EDITOR_EVENTS.SHOW_SAVE_DIALOG, {});
            if (result === 'save') {
                this.networkManager.notify(EDITOR_EVENTS.SAVE_SCRIPT_CONTENT, {
                    content: fileToClose.model.getValue(), filePath: fileToClose.originalFilePath
                });
                fileToClose.hasChanges = false;
                fileToClose.originalContent = fileToClose.model.getValue();
            } else if (result === 'discard') {
                fileToClose.hasChanges = false;
                fileToClose.model.setValue(fileToClose.originalContent);
            } else {
                return;
            }
            this.proceedWithClose(fileToClose);
        } catch (error) {
            console.error("Error communicating with save dialog:", error);
        }
    }

    async updateDeclarations(content) {
        try {
            const customTypeInterfaces = generateCustomTypeInterfaces(content);
            if (this.customTypeLib) {
                this.customTypeLib.dispose();
            }
            if (customTypeInterfaces) {
                this.customTypeLib = monaco.languages.typescript.javascriptDefaults.addExtraLib(customTypeInterfaces, 'file:///custom-types.d.ts');
            }

            const {inputDeclarations} = await this.networkManager.request(EDITOR_EVENTS.GET_CONTENT_DECLARATIONS, {content: content});
            if (this.dynamicDeclarationsLib) {
                this.dynamicDeclarationsLib.dispose();
            }
            if (inputDeclarations) {
                this.dynamicDeclarationsLib = monaco.languages.typescript.javascriptDefaults.addExtraLib(inputDeclarations, 'file:///script-inputs.d.ts');
            }
        } catch (e) {
            console.error("Failed to update declarations in real-time:", e);
        }
    }

    refreshModelDiagnostics(model) {
        if (!model) return;

        const now = Date.now();
        if (now - this.lastDiagnosticRefresh < 10) {
            return;
        }
        this.lastDiagnosticRefresh = now;

        try {
            // Preserves undo history while forcing TypeScript recompilation to recheck imports. Sourced from monaco-editor repo.
            const lastLineNumber = model.getLineCount();
            const lastLineLength = model.getLineLength(lastLineNumber);

            model.pushEditOperations([], [{
                range: new monaco.Range(lastLineNumber, lastLineLength + 1, lastLineNumber, lastLineLength + 1),
                text: ' '
            }], () => null);

            model.pushEditOperations([], [{
                range: new monaco.Range(lastLineNumber, lastLineLength + 1, lastLineNumber, lastLineLength + 2),
                text: ''
            }], () => null);
        } catch (e) {
            console.error("Failed to refresh model diagnostics:", e);
        }
    }

    async handleContentChange() {
        if (!this.currentFile || this.currentFile.readOnly) return;

        const currentContent = this.editor.getValue();
        const hasChanged = currentContent !== this.currentFile.originalContent;
        if (this.currentFile.hasChanges !== hasChanged) {
            this.currentFile.hasChanges = hasChanged;
            this.renderTabs();
            this.notifyOnUnsavedStateChange();
        }

        const currentCustomTypes = parseTypedefs(currentContent);
        const customTypeMap = {};
        Object.keys(currentCustomTypes).forEach(typeName => {
            customTypeMap[typeName] = typeName;
        });
        updateCompletionData(customTypeMap);

        await this.updateDeclarations(currentContent);
        parseUiLayout(currentContent);
        parseInputTypeTree(currentContent);
    }

    async handleFileRename(componentId, newFilePath, newOriginalFilePath) {
        const {fileObject} = this.findFile(componentId)
        if (!fileObject || newFilePath === fileObject.filePath || newFilePath === fileObject.originalFilePath) {
            return;
        }

        const oldModel = fileObject.model;
        if (!oldModel) {
            fileObject.filePath = newFilePath;
            fileObject.originalFilePath = newOriginalFilePath || newFilePath;
            this.renderTabs();
            return;
        }

        const viewState = this.editor.saveViewState();
        const currentContent = oldModel.getValue();
        const currentLanguage = oldModel.getLanguageId();
        const wasActive = this.currentFile && this.currentFile.componentId === componentId;

        oldModel.dispose();
        const newModel = monaco.editor.createModel(currentContent, currentLanguage, monaco.Uri.parse(newFilePath));

        fileObject.filePath = newFilePath;
        fileObject.originalFilePath = newOriginalFilePath || newFilePath;
        fileObject.model = newModel;

        if (wasActive) {
            this.editor.setModel(newModel);
            this.editor.restoreViewState(viewState);
        }

        this.renderTabs();

        if (this.currentFile && this.currentFile.componentId !== componentId && this.currentFile.model) {
            this.refreshModelDiagnostics(this.currentFile.model);
        }
    }

    handleFileDelete(componentId) {
        const {fileObject, open} = this.findFile(componentId);
        if (!fileObject) return;

        const wasActive = this.currentFile && this.currentFile.componentId === componentId;
        if (fileObject.model) fileObject.model.dispose();
        if (open) this.openFiles.delete(componentId); else this.backgroundFiles.delete(componentId);

        if (wasActive) {
            const openFileValues = Array.from(this.openFiles.values());
            const nextVisibleFile = openFileValues.length > 0 ? openFileValues[0] : null;
            this.openAndSwitchToFile(nextVisibleFile ? nextVisibleFile.filePath : null, null, nextVisibleFile ? nextVisibleFile.componentId : null);
        }
        this.renderTabs();
        this.notifyOnUnsavedStateChange();
    }

    async handleFileContentChange(componentId) {
        const {fileObject} = this.findFile(componentId);
        if (!fileObject) return;

        try {
            const {content: newContent} = await this.networkManager.request(EDITOR_EVENTS.GET_SCRIPT_CONTENT, {filePath: fileObject.filePath});

            if (fileObject.model.getValue() === newContent) {
                return;
            }

            fileObject.originalContent = newContent;
            fileObject.hasChanges = false;
            fileObject.model.setValue(newContent);
            this.renderTabs();
            this.notifyOnUnsavedStateChange();
        } catch (error) {
            console.error(`Error handling file content change for ${fileObject.filePath}:`, error);
        }
    }

    getUnsavedFiles() {
        return Array.from(this.openFiles.values()).filter(f => f.hasChanges);
    }

    saveAllUnsavedFiles() {
        const unsavedFiles = this.getUnsavedFiles();
        const filesToSave = unsavedFiles.map(file => ({
            filePath: file.filePath,
            content: file.model.getValue(),
        }));

        if (filesToSave.length > 0) {
            this.networkManager.notify(EDITOR_EVENTS.SAVE_ALL_FILES, {files: filesToSave});
            for (const file of unsavedFiles) {
                file.hasChanges = false;
                file.originalContent = file.model.getValue();
            }
        }
        this.renderTabs();
        this.notifyOnUnsavedStateChange();
    }

    discardAllUnsavedFiles() {
        const unsavedFiles = this.getUnsavedFiles();
        if (unsavedFiles.length === 0) return;
        for (const file of unsavedFiles) {
            file.hasChanges = false;
            file.model.setValue(file.originalContent);
        }
        this.renderTabs();
        this.notifyOnUnsavedStateChange();
    }

    cleanup() {
        try {
            for (const connection of this.connections) {
                try {
                    connection.disconnect();
                } catch (e) {
                    console.error("Error disconnecting file manager connection:", e);
                }
            }
            this.connections = [];

            try {
                for (const file of this.openFiles.values()) {
                    if (file.model) {
                        file.model.dispose();
                    }
                }
                for (const file of this.backgroundFiles.values()) {
                    if (file.model) {
                        file.model.dispose();
                    }
                }
                for (const file of this.readOnlyFiles.values()) {
                    if (file.model) {
                        file.model.dispose();
                    }
                }
            } catch (e) {
                console.error("Error disposing Monaco models:", e);
            }

            this.openFiles.clear();
            this.backgroundFiles.clear();
            this.readOnlyFiles.clear();
            this.currentFile = null;

            if (this.customTypeLib) {
                try {
                    this.customTypeLib.dispose();
                } catch (e) {
                    console.error("Error disposing custom type lib:", e);
                }
                this.customTypeLib = null;
            }
            if (this.dynamicDeclarationsLib) {
                try {
                    this.dynamicDeclarationsLib.dispose();
                } catch (e) {
                    console.error("Error disposing dynamic declarations lib:", e);
                }
                this.dynamicDeclarationsLib = null;
            }
        } catch (e) {
            console.error("Error during FileManager cleanup:", e);
        }
    }
}
