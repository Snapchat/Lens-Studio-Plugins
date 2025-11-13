// @ts-nocheck
import { EntityGenerator, Descriptor } from 'LensStudio:EntityGenerator';
import * as Ui from "LensStudio:Ui";
import {Dialog} from "./Dialog.js";
import app from "./app.js";

export class FaceAnimator extends EntityGenerator {

    private name: string = "Face Animator";
    private dialog: Dialog;
    private mGui: Ui.IGui;
    private guard: Array<any> = [];

    static override descriptor() {
        const descriptor = new Descriptor();

        descriptor.id = "Com.Snap.FaceAnimator";
        descriptor.name = "Face Animator";
        descriptor.description = "Face Animator";
        descriptor.dependencies = [];
        descriptor.displayOrder = 8;
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
