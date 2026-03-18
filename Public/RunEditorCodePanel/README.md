# Run Editor Code Panel

A panel plugin for executing editor code snippets during Lens Studio plugin development. Uses WebEngineView with Monaco Editor for a full-featured code editing experience.

## Features

- **Monaco Editor** - Syntax highlighting, undo/redo, code folding, dark theme, full Lens Studio API autocomplete (from shared-types/editor.d.ts)
- **Pre-defined Variables** - `model` and `pluginSystem` passed as parameters; get `scene` and `assetManager` from `model.project`
- **Async Support** - `await import()` and top-level await for dynamic imports
- **Output Panel** - `console.log`, `console.error`, `console.warn` shown inline
- **Persistence** - Code saved to localStorage across sessions
- **Shortcuts** - Ctrl+Enter to execute

## Usage

1. **Build:**
   ```bash
   npm install
   npm run build
   ```

2. **Load in Lens Studio:** Window > Plugins > Load plugin folder

3. **Open panel:** Window > Editors > Run Editor Code

4. **Execute:** Click Execute or press Ctrl+Enter

## Available Variables

- `model` - `Editor.Model.IModel` instance
- `pluginSystem` - `Editor.PluginSystem` instance
- `model.project.scene` - Scene access
- `model.project.assetManager` - Asset manager access

## Example

```javascript
const scene = model.project.scene;
const obj = scene.createSceneObject("Hello World");
console.log("Created:", obj.name);

const App = await import("LensStudio:App");
console.log("App version:", App.version);
```

## Development

- `npm run build` - Build UI + plugin
- `npm run clean` - Remove `dist/`
- `npm run watch` - Watch mode for plugin TypeScript
- `npm run pack` - Clean, build, and zip only distributable files
