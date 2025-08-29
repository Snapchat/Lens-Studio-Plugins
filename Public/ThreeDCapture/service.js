import GuiService from 'LensStudio:GuiService';
import app from './application/app.js';

import { PluginID } from './application/common.js';

export class GaussianSplattingGenerationService extends GuiService {
    static descriptor() {
        return {
            id: PluginID,
            name: app.name,
            description: 'Snap ML Kit / 3D Capture',
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
        result.baseEntityType = 'GaussianSplattingAsset';
        result.entityType = "gaussian_splatting_asset_generation";
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
