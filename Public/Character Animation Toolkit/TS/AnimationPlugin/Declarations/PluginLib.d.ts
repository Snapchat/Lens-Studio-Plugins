/**
 * The plugin system has an API that describes the entry points that a plugin
 * will use to register itself with the editor and gain access to the rest
 * of the editor API interfaces.
 */
declare namespace Plugin {
    import Entity = Editor.Model.Entity;

    interface Descriptor {
        id: string
        name: string
        description: string
        dependencies?: Editor.Model[]
    }

    interface PresetDescriptor extends Descriptor {
        icon: Editor.Icon
        section: string
        entityType: "Asset" | "Component" | "SceneObject"
    }

    interface EditorDescriptor extends Descriptor {
        canEdit: (entity: Entity) => boolean;
    }
}

/**
 * CoreService is a type of plugin.
 */
declare module "LensStudio:CoreService" {
    export abstract class CoreService {
        static descriptor(): Plugin.Descriptor
        constructor(pluginSystem: Editor.PluginSystem)
        abstract start(): void
        abstract stop(): void
        readonly pluginSystem: Editor.PluginSystem
    }
    export default CoreService
}

/**
 * CoreService is a type of plugin.
 */
declare module "LensStudio:GuiService" {
    export abstract class GuiService {
        static descriptor(): Plugin.Descriptor
        constructor(pluginSystem: Editor.PluginSystem)
        abstract start(): void
        abstract stop(): void
        readonly pluginSystem: Editor.PluginSystem
    }
    export default GuiService
}

/**
 * PanelPlugin is a type of plugin.
 */
declare module "LensStudio:PanelPlugin" {
    export abstract class PanelPlugin {
        static descriptor(): Plugin.Descriptor
        constructor(pluginSystem: Editor.PluginSystem)
        createWidget(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Widget
        readonly pluginSystem: Editor.PluginSystem
    }
    export default PanelPlugin
}

/**
 * DialogPlugin is a type of plugin.
 */
declare module "LensStudio:DialogPlugin" {
    export abstract class DialogPlugin {
        static descriptor(): Plugin.Descriptor
        constructor(pluginSystem: Editor.PluginSystem)
        createWidget(parent: import('LensStudio:Ui').Widget): import('LensStudio:Ui').Widget
        readonly pluginSystem: Editor.PluginSystem
    }
    export default DialogPlugin
}

/**
 * Preset is a type of plugin.
 */
declare module "LensStudio:Preset" {
    export abstract class Preset {
        static descriptor(): Plugin.PresetDescriptor
        constructor(pluginSystem: Editor.PluginSystem)
    }
    export default Preset
}

/**
 * EditorPlugin is a type of plugin.
 */
declare module "LensStudio:EditorPlugin" {
    import Entity = Editor.Model.Entity;
    import PanelPlugin from "LensStudio:PanelPlugin";

    export abstract class EditorPlugin extends PanelPlugin {
        static descriptor(): Plugin.EditorDescriptor
        constructor(pluginSystem: Editor.PluginSystem)
        edit(entities: Entity[]): boolean
        deinit(): void
    }
    export default EditorPlugin
}
