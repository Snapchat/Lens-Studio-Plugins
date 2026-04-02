//@ts-ignore
import { EntityGenerator, Descriptor } from 'LensStudio:EntityGenerator';
import app from "./Application";
export { GenerateFaceMaskTextureChatTool } from "./chat-tools/GenerateFaceMaskTextureChatTool";
export class FaceMask extends EntityGenerator {
    static descriptor() {
        const descriptor = new Descriptor();
        descriptor.id = 'Com.Snap.FaceMask';
        descriptor.name = app.name;
        descriptor.description = app.name;
        descriptor.dependencies = [];
        descriptor.displayOrder = 9;
        descriptor.icon = app.icon;
        descriptor.entityType = 'Texture';
        return descriptor;
    }
    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);
        app.init(pluginSystem);
    }
    // @ts-ignore - returns null because generation is handled via the dialog UI
    async generate() {
        app.show();
        return null;
    }
}
