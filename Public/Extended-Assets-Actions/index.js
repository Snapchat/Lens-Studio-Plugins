//@ts-check
import CoreService from 'LensStudio:CoreService'
import * as FaceImageFromTexture from './FaceImageFromTexture/FaceImageFromTexture.js'
import * as ScreenImageFromTexture from './ScreenImageFromTexture/ScreenImageFromTextureAsset.js'

/**
 * Creates a specialized CoreService class based on the given descriptor and createObjectAction function.
 *
 * @function createAssetAction
 * @param {Object} descriptor - Object containing the properties required for the dynamic class's static descriptor method.
 * @param {string} descriptor.id - Unique identifier for the specialized service.
 * @param {string} descriptor.name - Human-readable name of the specialized service.
 * @param {string} descriptor.description - A brief description of the specialized service.
 * @param {function(any,any):Editor.ContextAction} createObjectAction - Function to be called within the context action registry.
 *   Expected to return an action that can be executed within the editor context.
 */
function createAssetAction(descriptor, createObjectAction) {
    return class DynamicActionService extends CoreService {
        static descriptor() {
            return {
                id: `Com.Snap.${descriptor.id}`,
                name: descriptor.name,
                description: descriptor.description
            }
        }
        constructor(pluginSystem, descriptor) {
            super(pluginSystem, descriptor)
        }
        start() {
            /** @type {Editor.IContextActionRegistry} */
            const actionsRegistry = this.pluginSystem.findInterface(Editor.IContextActionRegistry);
            /** @type {Editor.ScopeGuard[]} */
            this.guards = []
            this.guards.push(actionsRegistry.registerAction((context) => createObjectAction(context, this.pluginSystem)))
        }
        stop() {
            // discard all guards so they can be garbage collected
            this.guards = []
        }
    }
}

export const FaceImageFromTextureAction = createAssetAction(FaceImageFromTexture.descriptor,
    FaceImageFromTexture.createObjectAction)
export const ScreenImageFromTextureAction = createAssetAction(ScreenImageFromTexture.descriptor,
    ScreenImageFromTexture.createObjectAction)
