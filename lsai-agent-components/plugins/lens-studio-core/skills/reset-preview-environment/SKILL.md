---
name: reset-preview-environment
description: Reset the Lens Studio preview to a clean state before scene generation. Captures a baseline log timestamp. Use before any scene generation task or when starting fresh.
user-invocable: false
---

# Reset Preview Environment

Prepare a clean Lens Studio scene state before any generation task. All scene manipulation is done via `ExecuteEditorCode` through the `editor-api-agent` agent.

## Step 1: Survey and Reset via ExecuteEditorCode

Delegate to the `editor-api-agent` agent to survey the scene and reset the camera in a single call:

```typescript
try {
    const results: string[] = [];

    // Find and reset camera
    let camera = scene.sceneObjects.find(
        (o: Editor.Model.SceneObject) => o.name === 'Camera'
    );
    if (!camera) {
        camera = scene.sceneObjects.find(
            (o: Editor.Model.SceneObject) => o.name === 'Main Camera'
        );
    }

    if (camera) {
        camera.localTransform.position = new vec3(0, 0, 0);
        camera.localTransform.rotation = new vec3(0, 0, 0);
        results.push(`Reset camera: ${camera.name}`);
    } else {
        results.push('Warning: No Camera found');
    }

    // List all root objects for cleanup analysis
    const rootNames = scene.rootSceneObjects.map(
        (o: Editor.Model.SceneObject) => ({
            name: o.name,
            id: o.id.toString(),
            enabled: o.enabled
        })
    );

    return JSON.stringify({ camera: results, rootObjects: rootNames });
} catch (e: any) {
    return `Failed: ${e.message}`;
}
```

## Step 2: Verify Clean Preview via Screenshot

Take a screenshot and visually confirm nothing but the virtual environment is visible.

**Loop:**

1. Capture the Preview panel using `CapturePanelScreenshotTool` with `pluginId: "Snap.Plugin.Gui.PreviewPanel"`.
2. Analyze the screenshot. A clean preview shows only the default virtual environment (skybox, ground plane, ambient lighting). Any 3D meshes, UI panels, images, text, or other rendered content means the preview is **not** clean.
3. If the preview is clean, exit the loop and proceed to Step 3.
4. If extra visual content is detected, delegate to the `editor-api-agent` agent to disable the responsible objects:

```typescript
try {
    const toDisable = ['<object-name-1>', '<object-name-2>'];
    const disabled: string[] = [];

    for (const name of toDisable) {
        const obj = scene.sceneObjects.find(
            (o: Editor.Model.SceneObject) => o.name === name
        );
        if (obj) {
            obj.enabled = false;
            disabled.push(name);
        }
    }

    return JSON.stringify({ disabled });
} catch (e: any) {
    return `Failed: ${e.message}`;
}
```

5. Return to step 1 of this loop and take a new screenshot to confirm.
6. Repeat until the preview is confirmed clean, up to a maximum of **5 iterations**. If still not clean after 5 passes, warn the user and list the remaining visible content.

## Step 3: Baseline Logs

Delegate to the `editor-api-agent` to get the log file path via `ExecuteEditorCode`:

```ts
const FS = await import("LensStudio:FileSystem");
return FS.getLogFile().toString();
```

Use Read on the returned path to note the current file length — this offset filters for only new entries generated during the build.

## Completion

Report:
- Camera reset status
- Whether the preview was already clean or required cleanup
- Names of any scene objects that were disabled
- Number of screenshot iterations taken
- Log baseline timestamp

---

## Notes

- If no Camera is found, warn the user but continue — the scene may not have an explicit camera object
- When choosing which objects to disable, prefer disabling top-level parents over individual children — disabling a parent disables its entire subtree.
- Do not disable objects that are part of the permanent environment setup (e.g., lighting rigs, skybox, device camera feeds, tracking nodes).
- This skill is safe to run multiple times — it is idempotent. Objects disabled in a previous run will already be disabled on re-run.
- All scene manipulation flows through `ExecuteEditorCode` via the `editor-api-agent` agent — never use individual MCP scene tools (SetLensStudioProperty, etc.) directly.
