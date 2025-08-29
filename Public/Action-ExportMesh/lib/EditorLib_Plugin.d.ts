/**
 * The plugin system has an API that describes the entry points that a plugin
 * will use to register itself with the editor and gain access to the rest
 * of the editor API interfaces.
 */
declare namespace Plugin {
    interface Descriptor {
        id: string
        name: string
        description?: string
        interfaces?: string[]
        dependencies: Editor.Model[]
    }

    interface PresetDescriptor extends Descriptor {
        entityType: "SceneObject" | "Component" | "Asset"
        section: string
        icon: Editor.Icon
    }

    interface EditorDescriptor extends Descriptor {
        canEdit: (entity: Editor.Model.Entity) => boolean
    }
}

/**
 * CoreService is a type of plugin.
 */
declare module "LensStudio:CoreService" {
    export abstract class CoreService {
        static descriptor(): Plugin.Descriptor
        constructor(pluginSystem: Editor.PluginSystem)
        readonly pluginSystem: Editor.PluginSystem
        abstract start(): void
        abstract stop(): void
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
        readonly pluginSystem: Editor.PluginSystem
        abstract start(): void
        abstract stop(): void
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
        readonly pluginSystem: Editor.PluginSystem
    }
    export default Preset
}

/**
 * EditorPlugin is a type of plugin.
 */
declare module "LensStudio:EditorPlugin" {
    import PanelPlugin from "LensStudio:PanelPlugin"

    export abstract class EditorPlugin extends PanelPlugin {
        static descriptor(): Plugin.EditorDescriptor
        constructor(pluginSystem: Editor.PluginSystem)
        edit(entities: Editor.Model.Entity[]): boolean
        deinit(): void
    }
    export default EditorPlugin
}
