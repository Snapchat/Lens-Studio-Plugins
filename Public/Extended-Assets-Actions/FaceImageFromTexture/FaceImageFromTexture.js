//@ts-check
//@file FaceImageFromTexture.js
import * as Utils from '../Utils/Utils.js'

export function createObjectAction(context, plugins) {

    if (!context.isOfType('AssetContext')) {
        return new Editor.ContextAction()
    }

    if (context.selection.length !== 1) {
        return new Editor.ContextAction()
    }

    const asset = context.selection[0].asset

    if (asset != null && !asset.isOfType('FileTexture')) {
        return new Editor.ContextAction()
    }

    const action = new Editor.ContextAction()
    action.id = 'Action.FaceImageFromTexture'
    action.caption = 'Instantiate Face Image from Asset'
    action.description = 'Instantiate Face Image from Asset'
    action.group = []

    action.apply = () => {
        const model = plugins.findInterface(Editor.Model.IModel)
        const scene = model.project.scene

        const faceImageObject = createFaceImageObject(model)

        const imageComponent = faceImageObject.addComponent('Image')
        const material = Utils.createImageMaterial(model, asset.id)
        const baseTexParam = new Editor.Assets.TextureParameter(asset.id)
        //TODO: make sure the 0 is the correct index and it does exist
        material.passInfos[0].baseTex = baseTexParam

        imageComponent.materials = [material]
        imageComponent.stretchMode = Editor.Components.StretchMode.Fit

        faceImageObject.name = 'Face Image'
    }

    return action
}

export const descriptor = {
    id: 'FaceImageFromTexture',
    name: 'FaceImageFromTexture',
    description: 'Add an item to the context menu to use the texture asset as a Face Image',
}

function createFaceImageObject(model, sceneObject) {
    const scene = model.project.scene

    const rootObject = Utils.findOrCreateCameraObject(scene, sceneObject)
    const effectsObject = Utils.findOrCreateChildWithName(rootObject, 'Effects', scene)
    const headBindingObject = scene.addSceneObject(effectsObject)
    headBindingObject.name = 'Head Binding'
    const headBinding = headBindingObject.addComponent('Head')
    headBinding.attachmentPoint = Editor.Components.HeadAttachmentPointType.CandideCenter

    const faceImageObject = scene.addSceneObject(headBindingObject)
    faceImageObject.name = 'Face Image'
    faceImageObject.localTransform = new Editor.Transform(new vec3(0, 0, 0), new vec3(0, 0, 0), new vec3(5, 5, 1))

    return faceImageObject
}
