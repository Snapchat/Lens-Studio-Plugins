import { assert } from "./assert.js"

/** Type guard for narrowing the true branch with a type predicate. */
export function isScriptObject(obj: unknown): obj is ScriptObject {
    if (!obj || typeof obj !== "object") return false
    var isOfType = Reflect.get(obj as ScriptObject, "isOfType")
    if (typeof isOfType !== "function") return false
    return isOfType.call(obj, "ScriptObject") === true
}

/** Type guard for narrowing the true branch with a type predicate. */
export function isEntity(obj: unknown): obj is Editor.Model.Entity {
    return isScriptObject(obj) && obj.isOfType("Entity")
}

/** Type guard for narrowing the true branch with a type predicate. */
export function isPrefabable(obj: unknown): obj is Editor.Model.Prefabable {
    return isScriptObject(obj) && obj.isOfType("Prefabable")
}

/** Type guard for narrowing the true branch with a type predicate. */
export function isSceneObject(obj: unknown): obj is Editor.Model.SceneObject {
    return isScriptObject(obj) && obj.isOfType("SceneObject")
}

/** Type guard for narrowing the true branch with a type predicate. */
export function isComponent(obj: unknown): obj is Editor.Components.Component {
    return isScriptObject(obj) && obj.isOfType("Component")
}

/** Type guard for narrowing the true branch with a type predicate. */
export function isScriptComponent(obj: unknown): obj is Editor.Components.ScriptComponent {
    return isScriptObject(obj) && obj.isOfType("Component.ScriptComponent")
}

/** Type guard for narrowing the true branch with a type predicate. */
export function isAsset(obj: unknown): obj is Editor.Assets.Asset {
    return isScriptObject(obj) && obj.isOfType("Asset")
}

/** Type guard for narrowing the true branch with a type predicate. */
export function isScriptAsset(obj: unknown): obj is Editor.Assets.ScriptAsset {
    return isScriptObject(obj) && obj.isOfType("Asset.ScriptAsset")
}

/** Type guard for narrowing the true branch with a type predicate. */
export function isJavaScriptAsset(obj: unknown): obj is Editor.Assets.JavaScriptAsset {
    return isScriptObject(obj) && obj.isOfType("Asset.JavaScriptAsset")
}

/** Type guard for narrowing the true branch with a type predicate. */
export function isFileMesh(obj: unknown): obj is Editor.Assets.FileMesh {
    return isScriptObject(obj) && obj.isOfType("FileMesh")
}

/** Type guard for narrowing the true branch with a type predicate. */
export function isAssetContext(obj: unknown): obj is Editor.Model.AssetContext {
    return isScriptObject(obj) && obj.isOfType("AssetContext")
}

/** Type guard for narrowing the true branch with a type predicate. */
export function isObjectContext(obj: unknown): obj is Editor.Model.ObjectContext {
    return isScriptObject(obj) && obj.isOfType("ObjectContext")
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertScriptObject(obj: unknown): asserts obj is ScriptObject {
    assert(isScriptObject(obj))
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertEntity(obj: unknown): asserts obj is Editor.Model.Entity {
    assert(isEntity(obj))
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertPrefabable(obj: unknown): asserts obj is Editor.Model.Prefabable {
    assert(isPrefabable(obj))
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertSceneObject(obj: unknown): asserts obj is Editor.Model.SceneObject {
    assert(isSceneObject(obj))
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertComponent(obj: unknown): asserts obj is Editor.Components.Component {
    assert(isComponent(obj))
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertScriptComponent(obj: unknown): asserts obj is Editor.Components.ScriptComponent {
    assert(isScriptComponent(obj))
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertAsset(obj: unknown): asserts obj is Editor.Assets.Asset {
    assert(isAsset(obj))
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertScriptAsset(obj: unknown): asserts obj is Editor.Assets.ScriptAsset {
    assert(isScriptAsset(obj))
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertJavaScriptAsset(obj: unknown): asserts obj is Editor.Assets.JavaScriptAsset {
    assert(isJavaScriptAsset(obj))
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertFileMesh(obj: unknown): asserts obj is Editor.Assets.FileMesh {
    assert(isFileMesh(obj))
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertAssetContext(obj: unknown): asserts obj is Editor.Model.AssetContext {
    assert(isAssetContext(obj))
}

/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertObjectContext(obj: unknown): asserts obj is Editor.Model.ObjectContext {
    assert(isObjectContext(obj))
}
