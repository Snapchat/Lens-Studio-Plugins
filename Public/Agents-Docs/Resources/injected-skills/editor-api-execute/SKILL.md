---
name: editor-api-execute
description: ExecuteEditorCode MCP tool contract and Editor API paradigms. MUST be loaded by the editor-api-agent subagent.
user-invocable: false
---

# ExecuteEditorCode Tool Reference

## Runtime

Code runs as an **ES2021 async function body** with a `pluginSystem` parameter:

```js
async function(pluginSystem) {
  // your code here
}
```

**Input**: `{ code: string }`
**Success**: `{ status: "Execution Succeeded", returnValue: <value>, console: [...] }`
**Runtime error**: `{ status: "Execution Failed", error: <message>, stack: <trace>, console: [...] }`

Use `return` to produce output. `console.log()` calls are captured in the `console` array.

## Editor API vs Lens Runtime — Do Not Confuse

You operate in the **Editor API** environment. The project's `.ts` files use the **Lens Runtime** API, which is completely different:

| Aspect | Editor API (this tool) | Lens Runtime (project .ts files) |
|---|---|---|
| Types file | `shared-types/editor.d.ts` | `Support/StudioLib_Internal.d.ts` |
| Get position | `obj.localTransform.position` | `obj.getTransform().getLocalPosition()` |
| Set position | `obj.localTransform.position = new vec3(...)` | `obj.getTransform().setLocalPosition(new vec3(...))` |
| Rotation | `vec3` Euler in **degrees** | `quat` (quaternion, radians) |
| Get component | `obj.getComponent('RenderMeshVisual')` | `obj.getComponent('Component.RenderMeshVisual')` |
| Create object | `scene.createSceneObject('name')` | Not directly available |

**NEVER** use Lens Runtime patterns in ExecuteEditorCode. **NEVER** reference `StudioLib_Internal.d.ts`.

## Two API Access Patterns

### 1. `pluginSystem.findInterface()` — Editor-internal interfaces

Access the scene model, asset manager, and registries:

```js
// Scene & project access (most common entry point)
const model = pluginSystem.findInterface(Editor.Model.IModel);
const scene = model.project.scene;
const assetManager = model.project.assetManager;

// Component/entity type lookups
const protoRegistry = pluginSystem.findInterface(Editor.Model.IEntityPrototypeRegistry);

// Entity metadata (isAbstract, etc.)
const entityRegistry = pluginSystem.findInterface(Editor.Model.IEntityRegistry);
```

### 2. `await import("LensStudio:___")` — Platform modules

Access filesystem, shell, network, and other platform services:

```js
const App = await import("LensStudio:App");           // version, edition info
const FS = await import("LensStudio:FileSystem");      // read/write files
const Shell = await import("LensStudio:Shell");         // run shell commands
const Network = await import("LensStudio:Network");     // HTTP requests
const Preset = await import("LensStudio:Preset");       // apply presets
const Preview = await import("LensStudio:Preview");     // preview controls
```

Grep `declare module "LensStudio:` in `shared-types/editor.d.ts` for the full list.

## Essential Patterns

**Scene traversal** (recursive children walk):
```js
const model = pluginSystem.findInterface(Editor.Model.IModel);
function walk(obj) {
  const info = { name: obj.name, id: obj.uniqueIdentifier.toString() };
  if (obj.children.length > 0) info.children = obj.children.map(walk);
  return info;
}
return model.project.scene.rootSceneObjects.map(walk);
```

**Type construction** (vec3, Transform, etc.):
```js
const pos = new vec3(1, 2, 3);
const xform = new Editor.Transform();
xform.position = pos;
```

**Return values** must be JSON-serializable. Call `.toString()` on UUIDs, IDs, and other opaque types before returning.

**Batch operations** — prefer loops in a single call over multiple tool calls:
```js
const model = pluginSystem.findInterface(Editor.Model.IModel);
const scene = model.project.scene;

const parent = scene.createSceneObject('Grid');
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const tile = scene.createSceneObject(`Tile_${row}_${col}`);
        scene.reparentSceneObject(tile, parent);
        tile.localTransform.position = new vec3(col * 10, 0, row * 10);
    }
}
return `Created ${8 * 8} tiles under ${parent.name}`;
```

## Critical Gotchas

**1. Use `new vec3()`, NEVER plain objects:**
```js
// FAILS: "Value is not a native object"
obj.localTransform.position = { x: 10, y: 0, z: 5 };

// WORKS
obj.localTransform.position = new vec3(10, 0, 5);
```

**2. Position getter returns a COPY — must assign back:**
```js
// BROKEN: modifies a detached copy, does nothing to the scene object
const pos = obj.localTransform.position;
pos.x = 99;

// CORRECT
obj.localTransform.position = new vec3(99, 0, 0);
```

**3. Rotation is degrees (vec3), not radians or quaternion:**
```js
obj.localTransform.rotation = new vec3(90, 0, 0); // 90 degrees around X
```

**4. Look up assets by file path using SourcePath:**
```js
const path = new Editor.Model.SourcePath(
    new Editor.Path('MyMaterial.mat'),
    Editor.Model.SourceRootDirectory.Assets
);
const material = assetManager.getFileMeta(path).assets[0];
```

**5. Always wrap in try/catch — return errors as strings:**
```js
try {
    // ... your operations ...
    return 'Success: created 64 tiles';
} catch (e) {
    return `Failed: ${e.message}`;
}
```

## API Reference Lookup

The workspace contains `shared-types/editor.d.ts` (~26K lines). **Never read the full file.** Use Grep:

```
Grep pattern="interface IModel" path="shared-types/editor.d.ts"
Grep pattern="class SceneObject" path="shared-types/editor.d.ts"
Grep pattern="addComponent|removeComponent" path="shared-types/editor.d.ts"
```

## Error Handling

After calling ExecuteEditorCode, check the result:
1. If `status` is `"Execution Failed"` — analyze the `error` message, `stack` trace, and `console` output.
2. Retry up to 3 times. If still failing, report the error with the stack trace.
