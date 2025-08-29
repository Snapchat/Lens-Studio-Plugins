import GuiService from 'LensStudio:GuiService';
import app from './application/app.js';

import { PluginID } from './application/common.js';

export class FaceMLService extends GuiService {
    static descriptor() {
        return {
            id: PluginID,
            name: app.name,
            description: app.name,
            dependencies: [Editor.Model.IEntityPrototypeRegistry]
        };
    }

    constructor(pluginSystem) {
        super(pluginSystem);
        app.initialize(pluginSystem);
    }

    createPrototypeData() {
        const result = new Editor.Model.EntityPrototypeData();

        result.caption = app.name;
        result.baseEntityType = 'Texture';
        result.entityType = "face_generator";
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
    }

    findInterface(interfaceID) {
        return this.pluginSystem.findInterface(interfaceID);
    }
}
