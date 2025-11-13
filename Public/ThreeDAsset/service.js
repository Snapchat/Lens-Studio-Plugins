import app from './application/app.js';
import { PluginID } from './application/common.js';

import { EntityGenerator, Descriptor } from 'LensStudio:EntityGenerator';

export class ThreeDAssetGenerationService extends EntityGenerator {
    static descriptor() {
        const descriptor = new Descriptor();

        descriptor.id = PluginID;
        descriptor.name = app.name;
        descriptor.description = app.name;
        descriptor.dependencies = [];
        descriptor.displayOrder = 4;
        descriptor.icon = app.icon;
        descriptor.entityType = 'RenderMesh';

        return descriptor;
    }

    constructor(pluginSystem) {
        super(pluginSystem);
        app.initialize(pluginSystem);
    }

    async generate() {
        app.show();
        return null;
    }
}
