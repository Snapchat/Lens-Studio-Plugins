import {createResourcePresetClass, PresetCreateMethod} from '../Utils/ResourcePresetFactory.js';

function createCustomCodeNodePreset(name) {
    return createResourcePresetClass({
        name,
        id: `Com.Snap.CustomCodeNodePreset.${name}`,
        description: "Use with Shader & VFX Graph Custom Code Nodes",
        icon: Editor.Icon.fromFile(import.meta.resolve("./Resources/CustomCodeNodeAsset.svg")),
        section: "Custom Code Node Assets",
        entityType: "CustomCodeNodeAsset",
        resourcePath: import.meta.resolve(`Resources/CustomCodeNodeAssets/${name}.customCode`),
        createMethod: PresetCreateMethod.AlwaysCreateNew
    });
}

export const DefaultCustomCodePreset = createCustomCodeNodePreset("Default Custom Code Node Asset");
