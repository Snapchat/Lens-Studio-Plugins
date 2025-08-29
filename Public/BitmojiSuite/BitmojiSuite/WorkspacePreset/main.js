import { GuiService } from "LensStudio:GuiService";
import * as Ui from "LensStudio:Ui";

export class BitmojiWorkspaceRegistrator extends GuiService {
    static descriptor() {
        return {
            id: "Com.Snap.Bitmoji.BitmojiSuite.WorkspacePreset",
            name: "Bitmoji Workspace Preset",
            description: "Bitmoji Workspace Preset",
            dependencies: [Ui.IGui]
        };
    }

    start() {
        const gui = this.pluginSystem.findInterface(Ui.IGui);
        const workspaceManager = gui.workspaces;
        const workspaceDescriptor = workspaceManager.readDescriptor(import.meta.resolve("./Resources/Bitmoji Suite"));

        if (!workspaceManager.isRegistered(workspaceDescriptor)) {
            this.presetHandle = workspaceManager.register(workspaceDescriptor);
        }
    }

    stop() {
        const gui = this.pluginSystem.findInterface(Ui.IGui);
        const workspaceManager = gui.workspaces;
        if (this.presetHandle) {
            workspaceManager.unregister(this.presetHandle);
        }
    }
}
