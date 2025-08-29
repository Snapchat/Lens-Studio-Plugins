//@ts-check

import * as Utils from '../Utils/Utils.js'

export const descriptor =  {
    id: 'ScreenImageFromTexture',
    name: 'ScreenImageFromTexture',
    description: 'Add an item to the context menu to use the texture asset as a screen image',
}

export function createObjectAction(context, plugins) {

    if (!context.isOfType('AssetContext')) {
        return new Editor.ContextAction()
    }
    if (context.selection.length < 1) {
        return new Editor.ContextAction()
    }
    // check if every selected asset is a texture
    if (!context.selection.every(sel => sel && sel.asset && sel.asset.isOfType('FileTexture'))) {
        return new Editor.ContextAction()
    }

    const action = new Editor.ContextAction()
    action.id = 'Action.ScreenImageFromTexture'
    action.caption = 'Instantiate Screen Image from Asset'
    action.description = 'Instantiate Screen Image from Asset'
    action.group = []

    action.apply = () => {
        const model = plugins.findInterface(Editor.Model.IModel)
        const scene = model.project.scene

        for (const sel of context.selection) {
            instantiateScreenImageFromAsset(model, sel.asset)
        }
    }
    return action
}

function instantiateScreenImageFromAsset(model, asset) {
    // create camera object
    const cameraSceneObject = Utils.findOrCreateOrthoCam(model)
    cameraSceneObject.layer = Editor.Model.LayerId.Ortho
    // create screen region object
    const parent = Utils.createSceneRegion(model, cameraSceneObject)
    parent.layer = Editor.Model.LayerId.Ortho
    // create screen image object and assign asset as its texture
    const screenImgObject = Utils.createScreenImage(model, parent, asset.id, Editor.Components.StretchMode.Fit)
    screenImgObject.layer = Editor.Model.LayerId.Ortho
}
