import { isValidEntityToEdit } from '../index.js';

export class FileWatcher {
    constructor(model, webSocketManager) {
        this.model = model;
        this.webSocketManager = webSocketManager;
        this.connections = [];

        this.connections.push(this.model.onProjectChanged.connect(() => {
            this.clearFileWatchers();
            this.initializeWatcher();
        }));

        if (this.model.project) {
            this.initializeWatcher();
        }
    }

    initializeWatcher() {
        const project = this.model.project;
        if (!project) {
            return;
        }

        // Handles adding a new script asset to the project
        this.connections.push(project.onEntityAdded("ScriptAsset").connect((entity) => {
            if (isValidEntityToEdit(entity)) {
                this.webSocketManager.loadDependency(entity.fileMeta.sourcePath.toString(), entity.id.toString());
            }
        }));

        // Handles file renames and package renames/repacks
        this.connections.push(project.onEntityUpdated("AssetImportMetadata").connect((entity) => {
            const primaryAsset = entity.primaryAsset;

            if (primaryAsset && primaryAsset.isOfType("NativePackageDescriptor")) {
                this.handlePackageRename(entity);
            } else if (primaryAsset && isValidEntityToEdit(primaryAsset)) {
                this.notifyPathChange(primaryAsset);
            }
        }));

        // Handles external content updates and path changes from repacking
        this.connections.push(project.onEntityUpdated("ScriptAsset").connect((entity) => {
            if (isValidEntityToEdit(entity)) {
                this.notifyPathChange(entity);
                this.webSocketManager.notifyFileContentChanged(entity.id.toString());
            }
        }));

        // Handles asset deletion
        this.connections.push(project.onEntityRemoved("ScriptAsset").connect((uuid) => {
            if (uuid.isValid()) {
                this.webSocketManager.notifyFileDeleted(uuid.toString());
            }
        }));

        this.connections.push(project.onEntityUpdated("Asset").connect((entity) => {
            if (isValidEntityToEdit(entity)) {
                this.webSocketManager.notifyFileContentChanged(entity.id.toString());
                this.webSocketManager.updateFileReadOnlyStatus(entity.id.toString());
            }
        }));
    }

    clearFileWatchers() {
        if (this.connections.length > 0) {
            this.connections.forEach(connection => connection.disconnect());
            this.connections = [];
        }
    }

    close() {
        this.clearFileWatchers();
    }

    notifyPathChange(asset) {
        if (!isValidEntityToEdit(asset)) {
            return;
        }

        const physicalPath = asset.fileMeta.sourcePath.toString();
        const packageMeta = asset.fileMeta.topmostNativePackageRoot;
        let displayPath = physicalPath;

        if (packageMeta) {
            const packagePath = packageMeta.sourcePath.toString();
            const packageName = packagePath.split('/').pop();
            const dataMarker = 'Data/';
            const dataIndex = physicalPath.indexOf(dataMarker);

            if (dataIndex !== -1) {
                const scriptPath = physicalPath.substring(dataIndex + dataMarker.length);
                displayPath = `${packageName}/${scriptPath}`;
            } else {
                displayPath = `${packageName}/${physicalPath.split('/').pop()}`;
            }
        }

        this.webSocketManager.notifyFileRenamed({
            newFilePath: displayPath,
            newOriginalFilePath: physicalPath,
            componentId: asset.id.toString()
        });

        this.webSocketManager.updateFileReadOnlyStatus(asset.id.toString());
    }

    handlePackageRename(packageEntity) {
        const allAssets = this.webSocketManager.assetManager.assets;
        for (const asset of allAssets) {
            const packageMeta = asset.fileMeta.topmostNativePackageRoot;
            if (packageMeta && packageMeta.id.toString() === packageEntity.id.toString()) {
                this.notifyPathChange(asset);
            }
        }
    }
}
