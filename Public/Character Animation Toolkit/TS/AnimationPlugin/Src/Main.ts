// @ts-nocheck
import { CoreService } from 'LensStudio:CoreService';
import * as Ui from "LensStudio:Ui";
import {Dialog} from "./Dialog.js";
import {dependencyContainer, DependencyKeys} from "./DependencyContainer.js";

export class CharacterAnimationToolkit extends CoreService {

    private name: string = "Character Animation";
    private guard: Array<any> = [];
    private dialog: Dialog;
    private mGui: Ui.IGui;

    static override descriptor() {
        return {
            id: "Com.Snap.CharacterAnimation",
            name: "Character Animation",
            description: "Snap ML Kit / Character Animation",
            dependencies: [Ui.IGui]
        };
    }

    constructor(pluginSystem: Editor.PluginSystem) {
        super(pluginSystem);
        dependencyContainer.register(DependencyKeys.PluginSystem, this.pluginSystem);
        this.mGui = this.pluginSystem.findInterface(Ui.IGui);
        this.dialog = new Dialog(this.mGui.createDialog(), this.name);
    }

    override start(): void {
        const entityPrototypeRegistry: Editor.Model.IEntityPrototypeRegistry = this.pluginSystem.findInterface(Editor.Model.IEntityPrototypeRegistry);
        this.guard.push(entityPrototypeRegistry.registerEntityPrototype(this.createPrototypeData()));
    }

    override stop(): void {
        this.guard = [];
        this.dialog.deinit();
    }

    createPrototypeData() {
        const result = new Editor.Model.EntityPrototypeData();

        result.caption = this.name;
        result.baseEntityType = 'RenderMesh';
        result.entityType = 'character_animation';
        result.section = 'Generative AI';
        result.icon = Editor.Icon.fromFile(import.meta.resolve('./Resources/mainIcon.svg'));

        result.creator = () => {
            this.dialog.show();
            return null;
        };

        return result;
    }

}
