import { GuiService } from 'LensStudio:GuiService';
import app from './application/app.js';
import { PluginID } from './application/common.js';

export class AnimationService extends GuiService {
    static descriptor() {
        return {
            id: PluginID,
            name: "Bitmoji Animation",
            description: 'Snap ML Kit / Bitmoji Animation',
            dependencies: [Editor.Model.IEntityPrototypeRegistry]
        };
    }

    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);
        app.initialize(pluginSystem);
    }

    createPrototypeData() {
        const result = new Editor.Model.EntityPrototypeData();

        result.caption = "Bitmoji Animation";
        result.baseEntityType = 'RenderMesh';
        result.entityType = 'bitmoji_animation';
        result.section = 'Generative AI';
        result.icon = app.icon;

        result.creator = () => {
            app.show();

            return null;
        };

        return result;
    }

    start() {
        this.guard = [];
        const entityPrototypeRegistry = this.findInterface(Editor.Model.IEntityPrototypeRegistry);
        this.guard.push(entityPrototypeRegistry.registerEntityPrototype(this.createPrototypeData()));
    }

    stop() {
        this.guard = [];
        app.animationDialog.deinit();
    }

    findInterface(_interface) {
        return this.pluginSystem.findInterface(_interface);
    }
}
