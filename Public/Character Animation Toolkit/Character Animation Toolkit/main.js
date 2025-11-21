// @ts-nocheck
import { EntityGenerator, Descriptor } from 'LensStudio:EntityGenerator';
import * as Ui from "LensStudio:Ui";
import { Dialog } from "./Dialog.js";
import { dependencyContainer, DependencyKeys } from "./DependencyContainer.js";
export class CharacterAnimationToolkit extends EntityGenerator {
    static descriptor() {
        const descriptor = new Descriptor();
        descriptor.id = "Com.Snap.CharacterAnimation";
        descriptor.name = "Character Animation";
        descriptor.description = "Character Animation";
        descriptor.dependencies = [];
        descriptor.displayOrder = 7;
        descriptor.icon = Editor.Icon.fromFile(import.meta.resolve('./Resources/mainIcon.svg'));
        descriptor.entityType = 'RenderMesh';
        return descriptor;
    }
    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);
        this.name = "Character Animation";
        this.guard = [];
        dependencyContainer.register(DependencyKeys.PluginSystem, this.pluginSystem);
        this.mGui = this.pluginSystem.findInterface(Ui.IGui);
        this.dialog = new Dialog(this.mGui.createDialog(), this.name);
    }
    async generate() {
        this.dialog.show();
        return null;
    }
}
