import { CoreService } from 'LensStudio:CoreService';
import * as fs from 'LensStudio:FileSystem';
import { PackageTracker } from './PackageTracker.js';
import { PluginDirectoryLoader } from './PluginDirectoryLoader.js';

const pluginsFolderName = "Plugins";

export class ProjectScopedPluginsManager extends CoreService {
    static descriptor() {
        return {
            id: "Com.Snap.ProjectScopedPluginsManager",
            name: "Project Scoped Plugins Manager",
            description: "Service Managing Plugins with local lens project scope",
        }
    }

    start() {
        this.model = this.pluginSystem.findInterface(Editor.Model.IModel);
        this.modelGuards = [];
        this.projectGuards = [];
        this.packageTracker = null;
        this.startupTimer = null;
        this.stopping = false;
        this.pluginDirectoryLoader = new PluginDirectoryLoader(this.pluginSystem);

        this.startupTimer = setTimeout(() => {
            this.startupTimer = null;
            this.initializeAfterPluginLoad();
        }, 0);
    }

    initializeAfterPluginLoad() {
        if (!this.pluginDirectoryLoader) {
            return;
        }

        this.packageTracker = new PackageTracker({
            getAbsolutePath: (sourcePath) => {
                const assetManager = this.model.project.assetManager;
                return assetManager.assetsDirectory.appended(new Editor.Path(sourcePath)).toString();
            },
            getProjectDir: () => this.getProjectDirectory().toString(),
            loadPlugins: (pluginDir) => {
                const dir = new Editor.Path(pluginDir);
                if (fs.exists(dir)) {
                    console.log("[PackageTracker] Loading plugins from: " + pluginDir, console.None);
                    this.pluginDirectoryLoader.load(dir);
                }
            },
            unloadPlugins: (pluginDir) => {
                const dir = new Editor.Path(pluginDir);
                console.log("[PackageTracker] Unloading plugins from: " + pluginDir, console.None);
                this.pluginDirectoryLoader.unload(dir, !this.stopping);
            }
        });

        this.modelGuards.push(this.model.onProjectChanged.connect(() => this.onProjectChanged()));
        this.modelGuards.push(this.model.onProjectAboutToBeChanged.connect(() => this.onProjectAboutToBeChanged()));
        this.modelGuards.push(this.model.onProjectSaving.connect((mode, path) => this.onProjectSaving(mode, path)));

        this.connectProjectListeners();

        this.addDirectory(this.getPluginsDirectory());
    }

    connectProjectListeners() {
        this.projectGuards.push(this.model.project.onEntityAdded("AssetImportMetadata").connect((entity) => {
            let pluginId = null;
            let descriptorId = null;
            if (entity.nativePackageDescriptor) {
                pluginId = entity.nativePackageDescriptor.componentId?.toString() || null;
                descriptorId = entity.nativePackageDescriptor.id?.toString() || null;
            }
            this.packageTracker.handleEntityAdded({
                id: entity.id,
                sourcePath: entity.sourcePath.toString(),
                extension: entity.sourcePath.extension,
                hasNativePackageDescriptor: !!entity.nativePackageDescriptor,
                pluginId: pluginId,
                descriptorId: descriptorId
            });
        }));
        this.projectGuards.push(this.model.project.onEntityRemoved("AssetImportMetadata").connect((uuid) => {
            this.packageTracker.handleEntityRemoved(uuid);
        }));
        this.projectGuards.push(this.model.project.onEntityUpdated("AssetImportMetadata").connect((entity) => {
            let pluginId = null;
            let descriptorId = null;
            if (entity.nativePackageDescriptor) {
                pluginId = entity.nativePackageDescriptor.componentId?.toString() || null;
                descriptorId = entity.nativePackageDescriptor.id?.toString() || null;
            }
            this.packageTracker.handleEntityUpdated({
                id: entity.id,
                sourcePath: entity.sourcePath.toString(),
                extension: entity.sourcePath.extension,
                isPackedPackageItem: entity.isPackedPackageItem,
                hasNativePackageDescriptor: !!entity.nativePackageDescriptor,
                pluginId: pluginId,
                descriptorId: descriptorId
            });
        }));
        this.projectGuards.push(this.model.project.onEntityRemoved("NativePackageDescriptor").connect((uuid) => {
            this.packageTracker.handleDescriptorRemoved(uuid);
        }));
    }

    disconnectProjectListeners() {
        this.projectGuards.forEach(guard => guard.disconnect());
        this.projectGuards.length = 0;
    }

    onProjectChanged() {
        this.connectProjectListeners();
        this.addDirectory(this.getPluginsDirectory());
    }

    onProjectAboutToBeChanged() {
        this.disconnectProjectListeners();
        if (this.packageTracker) {
            this.packageTracker.clear();
        }
        this.removeDirectory(this.getPluginsDirectory());
    }

    onProjectSaving(mode, sourceProjectPath) {
        if (mode == Editor.Model.ProjectSaveMode.Autosave) {
            return;
        }

        // cut-off projectName.esproj
        const sourceProjectDirectory = sourceProjectPath.parent;

        // no need to copy Plugins/ folder if project is not changed
        if (sourceProjectDirectory.toString() == this.getProjectDirectory().toString()) {
            return;
        }

        const currentPluginsDirectory = sourceProjectDirectory.appended(pluginsFolderName);

        // copy Plugins/ folder into new project location and reload plugins
        if (fs.exists(currentPluginsDirectory)) {
            const newPluginsDirectory = this.getPluginsDirectory();

            fs.copyDir(currentPluginsDirectory, newPluginsDirectory, { force: true, recursive: true });

            this.removeDirectory(currentPluginsDirectory);
            this.addDirectory(newPluginsDirectory);
        }
    }

    stop() {
        this.stopping = true;

        if (this.startupTimer) {
            clearTimeout(this.startupTimer);
            this.startupTimer = null;
        }

        this.modelGuards.forEach(guard => guard.disconnect());
        this.modelGuards.length = 0;
        this.disconnectProjectListeners();
        if (this.packageTracker) {
            this.packageTracker.clear();
        }

        this.removeDirectory(this.getPluginsDirectory());

        if (this.pluginDirectoryLoader) {
            this.pluginDirectoryLoader.dispose();
            this.pluginDirectoryLoader = null;
        }
    }

    getProjectDirectory() {
        return this.model.project.projectDirectory;
    }

    getPluginsDirectory() {
        return this.getProjectDirectory().appended(pluginsFolderName);
    }

    addDirectory(directory) {
        if (this.pluginDirectoryLoader && fs.exists(directory)) {
            this.pluginDirectoryLoader.load(directory);
        }
    }

    removeDirectory(directory) {
        if (this.pluginDirectoryLoader) {
            this.pluginDirectoryLoader.unload(directory, !this.stopping);
        }
    }
}
