import { EntityGenerator, Descriptor } from 'LensStudio:EntityGenerator';
import * as Ui from "LensStudio:Ui";
import {Dialog} from "./Dialog.js";
import app from "./app.js";

export class PreGen extends EntityGenerator {

    private name: string = "AI Video Transform";
    private dialog: Dialog;
    private mGui: Ui.IGui;
    private guard: Array<any> = [];

    static descriptor() {
        const descriptor = new Descriptor();

        descriptor.id = "Com.Snap.AiVideoTransform";
        descriptor.name = "AI Video Transform";
        descriptor.description = "AI Video Transform";
        descriptor.dependencies = [];
        descriptor.displayOrder = 18;
        descriptor.icon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/mainIcon.svg')));
        descriptor.entityType = 'RenderMesh';

        return descriptor;
    }

    constructor(pluginSystem: Editor.PluginSystem, descriptor: Descriptor) {
        super(pluginSystem, descriptor);
        app.initialize(pluginSystem);
        this.mGui = this.pluginSystem.findInterface(Ui.IGui) as Ui.IGui;
        this.dialog = new Dialog(this.mGui.createDialog(), this.name);
    }

    // Generation is handled via the dialog UI rather than returning an entity.
    override async generate(): Promise<Editor.Model.Entity> {
        this.dialog.show();
        return null as unknown as Editor.Model.Entity;
    }
}
