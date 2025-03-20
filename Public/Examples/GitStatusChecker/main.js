import CoreService from "LensStudio:CoreService";
import { spawnSync } from "LensStudio:Subprocess";
import * as app from "LensStudio:App";
// We put it in a separate file to make it easier to read, since the ASCII making process is quite long and repetitive
import makeASCII from "./asciiMaker.js";

export class GitStatusCat extends CoreService {
    static descriptor() {
        return {
            id: "LS.Plugin.Example.GitStatusChecker",
            name: "Git Status Cat",
            description: "A plugin that checks the git status of the current project",
            dependencies: [Editor.Model.IModel]
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
        this.timer = null;
        this.model = pluginSystem.findInterface(Editor.Model.IModel);
        this.refreshProjectPath();
        // Interval at which the git status will be checked
        this.interval = 60 * 1000;
    }

    refreshProjectPath() {
        const projectAssetPath = this.model.project.assetsDirectory;
        // The project path is the parent of the 'assets' directory
        this.projectPath = projectAssetPath.parent;
    }

    executeGitStatus() {
        if (!this.projectPath) {
            console.log("Project path not found");
            return;
        }

        const myEnv = app.env;
        console.log(`Project path: ${this.projectPath}`);
        // If you wish to override the PATH environment variable, you can do it like this:
        // myEnv.PATH = '/path/to/your/bin'
        const options = { cwd: this.projectPath, timeout: 5000, env: myEnv };
        const result = spawnSync("git", ["status", "--porcelain"], options);

        if (result.exitCode !== 0) {
            console.log(`Git status failed: ${result.stderr}`);
            return;
        }

        const cat = makeASCII(result);
        console.log(cat);
    }

    start() {
        this.timer = setInterval(() => {
            // Since project path can change anytime, we need to refresh it every time
            this.refreshProjectPath();
            this.executeGitStatus();
        },
        this.interval
        ); // Execute git status every 60 seconds
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}
