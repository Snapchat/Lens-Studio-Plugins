import { PanelPlugin as Panel, Descriptor } from 'LensStudio:PanelPlugin';
import * as Ui from 'LensStudio:Ui';
import * as FileSystem from 'LensStudio:FileSystem';

import { Fs } from './Fs.js';
import { Console } from './Console.js';
import { AssetManager } from './AssetManager.js';
import { PersistenceStorage } from './Storage.js';
import { PathsManager } from './PathsManager.js';
import { Sync } from './Sync.js';
import { PanelUI } from './PanelUI.js';
import { DirectoryWidgetUI } from './DirectoryWidgetUI.js';

const NativeLibraryExt = 'so';

const RealFsImpl = FileSystem;
const RealConsoleImpl = console;

export class NativeLibrariesScanner extends Panel {
    static descriptor() {
        const descriptor = new Descriptor();
        descriptor.id = 'Snap.NativeLibrariesScanner';
        descriptor.name = 'Native Libraries Scanner';
        descriptor.menuActionHierarchy = ['Window', 'Utilities'];
        return descriptor;
    }

    get model() {
        return this.pluginSystem.findInterface(Editor.Model.IModel);
    }

    get gui() {
        return this.pluginSystem.findInterface(Ui.IGui);
    }

    get project() {
        return this.model.project;
    }

    get storage() {
        if (!this._storage) {
            const cacheFilePath = this.fs.getCachedFile('NativeLibrariesScanner_config.json');
            this._storage = new PersistenceStorage(this.fs, cacheFilePath);
        }
        return this._storage;
    }

    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);

        this.fs = new Fs(RealFsImpl);
        this.console = new Console(RealConsoleImpl);
        this.pathsManager = new PathsManager();
    }

    get assetManager() {
        if (!this._assetManager) {
            const realAssetManagerImpl = {
                findImportedCopy: (absolutePath, sourcePath) => {
                    return this.project.assetManager.findImportedCopy(absolutePath, sourcePath);
                },
                importExternalFile: (absolutePath, sourcePath) => {
                    return this.project.assetManager.importExternalFile(absolutePath, sourcePath);
                }
            };
            this._assetManager = new AssetManager(realAssetManagerImpl);
        }
        return this._assetManager;
    }

    get synchronizer() {
        if (!this._synchronizer) {
            this._synchronizer = new Sync(
                this.fs,
                this.console,
                this.assetManager,
                NativeLibraryExt
            );
        }
        return this._synchronizer;
    }

    restoreSourceDirectories() {
        this.console.info('Restoring source directories from runtime storage');
        try {
            const config = this.storage.readConfig();
            let message = ' - Restoring user directories\n';

            if ('paths' in config && Array.isArray(config.paths)) {
                this.pathsManager.loadFrom(config.paths);
            }

            this.pathsManager.forEach((pathObj, index) => {
                message += ` - ${index}: ${pathObj.from} -> ${pathObj.to}\n`;
                this.addDirectoryWidget(pathObj.from, pathObj.to);
            });

            message += ' - End';
            this.console.info(message);
        } catch (e) {
            const error = `Failed to restore source directories, reason: ${e}\n${e.stack}`;
            this.console.error(error);
        }
    }

    saveSourceDirectories() {
        let message = '- Saving user directories:\n';
        const pathsToSave = this.pathsManager.toPlainArray();

        pathsToSave.forEach((pathObj, index) => {
            message += ` - ${index}: ${pathObj.from} -> ${pathObj.to}\n`;
        });

        message += '- End';
        this.console.info(message);
        try {
            this.console.info('Saving to runtime storage');
            this.storage.writeConfig({ paths: pathsToSave });
        } catch (e) {
            const error = `Failed to save user directories, reason: ${e}\n${e.stack}`;
            this.console.error(error);
        }
    }

    createWidget(parent) {
        this.subscriptions = [];

        const { widget, directoriesLayout, directoriesWidget, connections } = PanelUI.createMainPanel(parent, {
            onAddDirectory: () => {
                const directory = this.gui.dialogs.selectFolderToOpen({
                    options: Ui.Dialogs.Options.DirectoriesOnly
                }, '');

                if (directory.isEmpty)
                    return;

                const destination = new Editor.Path('NativeLibs');
                this.pathsManager.add(directory, destination);
                this.addDirectoryWidget(directory, destination);
            }
        });

        this.subscriptions.push(...connections);
        this.directoriesWidgetLayout = directoriesLayout;
        this.directoriesWidget = directoriesWidget;
        this.restoreSourceDirectories();

        return widget;
    }

    deinit() {
        this.saveSourceDirectories();

        for (const connection of this.subscriptions) {
            if (connection && connection.disconnect) {
                connection.disconnect();
            }
        }

        this.subscriptions = [];
    }

    addDirectoryWidget(directoryPath, destinationPath) {
        if (directoryPath.isEmpty)
            throw new Error('Directory is empty');

        if (!FileSystem.exists(directoryPath))
            throw new Error('Directory does not exist');

        const { container, connections } = DirectoryWidgetUI.createDirectoryRow(
            this.directoriesWidget,
            directoryPath,
            destinationPath,
            {
                onDestinationChange: (newDestinationText) => {
                    const newDestination = new Editor.Path(newDestinationText);
                    const updated = this.pathsManager.updateDestination(directoryPath, newDestination);
                    if (updated) {
                        this.console.log(`Updated destination for ${directoryPath} to ${newDestinationText}`);
                    }
                },

                onSync: (sourcePath, destinationText) => {
                    const destination = new Editor.Model.SourcePath(
                        destinationText,
                        Editor.Model.SourceRootDirectory.Assets
                    );

                    try {
                        this.synchronizer.sync(sourcePath, destination);
                        this.console.info('✓ Sync completed successfully');
                    } catch (e) {
                        this.console.error(`✗ Sync failed: ${e.message}\n${e.stack}`);
                    }
                },

                onRemove: () => {
                    const removed = this.pathsManager.remove(directoryPath);
                    if (removed) {
                        this.console.log(`Removed directory: ${directoryPath}`);
                    }
                    container.deleteLater();
                }
            }
        );

        this.subscriptions.push(...connections);
        this.directoriesWidgetLayout.addWidgetWithStretch(container, 0, Ui.Alignment.AlignTop);
    }
}
