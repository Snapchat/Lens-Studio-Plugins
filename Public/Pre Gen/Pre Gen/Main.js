// @ts-nocheck
import { EntityGenerator, Descriptor } from 'LensStudio:EntityGenerator';
import * as Ui from "LensStudio:Ui";
import { Dialog } from "./Dialog.js";
import app from "./app.js";
export class PreGen extends EntityGenerator {
    static descriptor() {
        const descriptor = new Descriptor();
        descriptor.id = "Com.Snap.PreGen";
        descriptor.name = "AI Portraits Beta";
        descriptor.description = "AI Portraits Beta";
        descriptor.dependencies = [];
        descriptor.displayOrder = 11;
        descriptor.icon = Editor.Icon.fromFile(import.meta.resolve('./Resources/mainIcon.svg'));
        descriptor.entityType = 'RenderMesh';
        return descriptor;
    }
    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);
        this.name = "AI Portraits Beta";
        this.guard = [];
        app.initialize(pluginSystem);
        this.mGui = this.pluginSystem.findInterface(Ui.IGui);
        this.dialog = new Dialog(this.mGui.createDialog(), this.name);
    }
    async generate() {
        this.dialog.show();
        return null;
    }
}
