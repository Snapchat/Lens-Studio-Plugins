import { Preset } from "LensStudio:Preset";
import * as Utils from "LensStudio:Utils@1.0.js";

export const PresetCreateMethod = Object.freeze({
    FindOrCreate: "FindOrCreate",
    AlwaysCreateNew: "AlwaysCreateNew"
});

// Preset factory for presets that simply import some resource and perform no property modifications
export function createResourcePresetClass({
    name,
    id,
    description,
    icon,
    section,
    entityType,
    resourcePath,
    createMethod = PresetCreateMethod.FindOrCreate,
}) {
    return class ResourcePreset extends Preset {
        static descriptor() {
            return {
                id,
                name,
                description,
                icon,
                section,
                entityType,
            };
        }

        async createAsync(d) {
            try {
                const destination = d || new Editor.Path("");
                const model = this.pluginSystem.findInterface(Editor.Model.IModel);
                const assetManager = model.project.assetManager;

                switch (createMethod) {
                    case PresetCreateMethod.FindOrCreate:
                        return await Utils.findOrCreateAsync(assetManager, resourcePath, destination);
                    case PresetCreateMethod.AlwaysCreateNew:
                        const meta = await assetManager.importExternalFileAsync(resourcePath, destination, Editor.Model.ResultType.Unpacked);
                        return meta.primary;
                    default:
                        throw new Error(`Unsupported preset create method: ${createMethod}`);
                }
            } catch (e) {
                console.log(`${e.message}\n${e.stack}`);
            }
        }
    };
}
