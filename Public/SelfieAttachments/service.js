import GuiService from 'LensStudio:GuiService';
import app from './application/app.js';

import { PluginID } from './application/common.js';

export class SelfieAttachmentsService extends GuiService {
    static descriptor() {
        return {
            id: PluginID,
            name: app.name,
            description: 'Snap ML Kit / Selfie Attachments',
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
        result.entityType = "selfie_attachments_asset";
        result.section = 'Generative AI';
        result.icon = app.icon;

        result.creator = () => {
            app.show();

            return null;
        };

        return result;
    }

    start() {
        // app.show();

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
