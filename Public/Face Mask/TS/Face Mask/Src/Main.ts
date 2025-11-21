//@ts-ignore
import { EntityGenerator, Descriptor } from 'LensStudio:EntityGenerator';
import app from "./Application";


export class FaceMask extends EntityGenerator {
    static descriptor() {
        const descriptor = new Descriptor();

        descriptor.id = 'Com.Snap.FaceMask';
        descriptor.name = app.name;
        descriptor.description = app.name;
        descriptor.dependencies = [];
        descriptor.displayOrder = 1;
        descriptor.icon = app.icon;
        descriptor.entityType = 'Texture';
        return descriptor;
    }

    constructor(pluginSystem: Editor.PluginSystem) {
        super(pluginSystem);
        app.init(pluginSystem);
    }

    async generate() {
        app.show();
        return null;
    }
}
