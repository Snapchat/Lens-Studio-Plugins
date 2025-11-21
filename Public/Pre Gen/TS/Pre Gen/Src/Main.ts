// @ts-nocheck
import { EntityGenerator, Descriptor } from 'LensStudio:EntityGenerator';
import * as Ui from "LensStudio:Ui";
import {Dialog} from "./Dialog.js";
import app from "./app.js";

export class PreGen extends EntityGenerator {

    private name: string = "AI Portraits Beta";
    private dialog: Dialog;
    private mGui: Ui.IGui;
    private guard: Array<any> = [];

    static override descriptor() {
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

    constructor(pluginSystem: Editor.PluginSystem) {
        super(pluginSystem);
        app.initialize(pluginSystem);
        this.mGui = this.pluginSystem.findInterface(Ui.IGui);
        this.dialog = new Dialog(this.mGui.createDialog(), this.name);
    }

    async generate() {
        this.dialog.show();
        return null;
    }
}
