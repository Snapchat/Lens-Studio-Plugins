/**
 * Injected variables for Run Editor Code panel.
 * The Editor namespace types are loaded from ./types/editor.d.ts
 */

// Forward declare the Editor namespace (actual definitions come from editor.d.ts)
declare namespace Editor {
  namespace Model {
    interface IModel {}
  }
  interface PluginSystem {}
}

declare const model: Editor.Model.IModel;
declare const pluginSystem: Editor.PluginSystem;
