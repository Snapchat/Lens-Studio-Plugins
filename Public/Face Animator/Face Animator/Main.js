// @ts-nocheck
import { CoreService } from "LensStudio:CoreService";
import * as Ui from "LensStudio:Ui";
import { Dialog } from "./Dialog.js";
import app from "./app.js";
export class FaceAnimator extends CoreService {
    static descriptor() {
        return {
            id: "Com.Snap.FaceAnimator",
            name: this.name,
            description: "Snap ML Kit / Face Animator",
            dependencies: [Ui.IGui]
        };
    }
    constructor(pluginSystem) {
        super(pluginSystem);
        this.name = "Face Animator";
        this.guard = [];
        app.initialize(pluginSystem);
        this.mGui = this.pluginSystem.findInterface(Ui.IGui);
        this.dialog = new Dialog(this.mGui.createDialog(), this.name);
    }
    start() {
        const entityPrototypeRegistry = this.pluginSystem.findInterface(Editor.Model.IEntityPrototypeRegistry);
        this.guard.push(entityPrototypeRegistry.registerEntityPrototype(this.createPrototypeData()));
    }
    stop() {
        this.guard = [];
        this.dialog.deinit();
    }
    createPrototypeData() {
        const result = new Editor.Model.EntityPrototypeData();
        result.caption = this.name;
        result.baseEntityType = 'RenderMesh';
        result.entityType = 'face_animator';
        result.section = 'Generative AI';
        result.icon = Editor.Icon.fromFile(import.meta.resolve('./Resources/mainIcon.svg'));
        result.creator = () => {
            this.dialog.show();
            return null;
        };
        return result;
    }
}
