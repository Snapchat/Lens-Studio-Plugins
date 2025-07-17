import { CoreService } from 'LensStudio:CoreService';
import * as fs from 'LensStudio:FileSystem';

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
        this.guards = [];

        this.guards.push(this.model.onProjectChanged.connect(() => this.onProjectChanged()));
        this.guards.push(this.model.onProjectAboutToBeChanged.connect(() => this.onProjectAboutToBeChanged()));
        this.guards.push(this.model.onProjectSaving.connect((mode, path) => this.onProjectSaving(mode, path)));

        this.timeout = setTimeout(() => this.addDirectory(this.getPluginsDirectory()), 0);
    }

    onProjectChanged() {
        this.addDirectory(this.getPluginsDirectory());
    }

    onProjectAboutToBeChanged() {
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
        this.guards.forEach(guard => guard.disconnect());
        this.guards.length = 0;

        this.removeDirectory(this.getPluginsDirectory());
    }

    getProjectDirectory() {
        return this.model.project.projectDirectory;
    }

    getPluginsDirectory() {
        return this.getProjectDirectory().appended(pluginsFolderName);
    }

    addDirectory(directory) {
        if (fs.exists(directory)) {
            this.pluginSystem.loadDirectory(directory);
        }
    }

    removeDirectory(directory) {
        if (fs.exists(directory)) {
            this.pluginSystem.unloadDirectory(directory);
        }
    }
}
