import { assert } from "./assert.js";
/** Type guard for narrowing the true branch with a type predicate. */
export function isScriptObject(obj) {
    if (!obj || typeof obj !== "object")
        return false;
    var isOfType = Reflect.get(obj, "isOfType");
    if (typeof isOfType !== "function")
        return false;
    return isOfType.call(obj, "ScriptObject") === true;
}
/** Type guard for narrowing the true branch with a type predicate. */
export function isEntity(obj) {
    return isScriptObject(obj) && obj.isOfType("Entity");
}
/** Type guard for narrowing the true branch with a type predicate. */
export function isPrefabable(obj) {
    return isScriptObject(obj) && obj.isOfType("Prefabable");
}
/** Type guard for narrowing the true branch with a type predicate. */
export function isSceneObject(obj) {
    return isScriptObject(obj) && obj.isOfType("SceneObject");
}
/** Type guard for narrowing the true branch with a type predicate. */
export function isComponent(obj) {
    return isScriptObject(obj) && obj.isOfType("Component");
}
/** Type guard for narrowing the true branch with a type predicate. */
export function isScriptComponent(obj) {
    return isScriptObject(obj) && obj.isOfType("Component.ScriptComponent");
}
/** Type guard for narrowing the true branch with a type predicate. */
export function isAsset(obj) {
    return isScriptObject(obj) && obj.isOfType("Asset");
}
/** Type guard for narrowing the true branch with a type predicate. */
export function isScriptAsset(obj) {
    return isScriptObject(obj) && obj.isOfType("Asset.ScriptAsset");
}
/** Type guard for narrowing the true branch with a type predicate. */
export function isJavaScriptAsset(obj) {
    return isScriptObject(obj) && obj.isOfType("Asset.JavaScriptAsset");
}
/** Type guard for narrowing the true branch with a type predicate. */
export function isFileMesh(obj) {
    return isScriptObject(obj) && obj.isOfType("FileMesh");
}
/** Type guard for narrowing the true branch with a type predicate. */
export function isAssetContext(obj) {
    return isScriptObject(obj) && obj.isOfType("AssetContext");
}
/** Type guard for narrowing the true branch with a type predicate. */
export function isObjectContext(obj) {
    return isScriptObject(obj) && obj.isOfType("ObjectContext");
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertScriptObject(obj) {
    assert(isScriptObject(obj));
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertEntity(obj) {
    assert(isEntity(obj));
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertPrefabable(obj) {
    assert(isPrefabable(obj));
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertSceneObject(obj) {
    assert(isSceneObject(obj));
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertComponent(obj) {
    assert(isComponent(obj));
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertScriptComponent(obj) {
    assert(isScriptComponent(obj));
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertAsset(obj) {
    assert(isAsset(obj));
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertScriptAsset(obj) {
    assert(isScriptAsset(obj));
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertJavaScriptAsset(obj) {
    assert(isJavaScriptAsset(obj));
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertFileMesh(obj) {
    assert(isFileMesh(obj));
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertAssetContext(obj) {
    assert(isAssetContext(obj));
}
/** Type guard that uses an assertion signature to narrow the type or else throw an error. */
export function assertObjectContext(obj) {
    assert(isObjectContext(obj));
}
