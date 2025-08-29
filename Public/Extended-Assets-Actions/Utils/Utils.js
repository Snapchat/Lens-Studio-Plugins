//@ts-check

export function createImageMaterial(model, assetId) {
    const assetManager = model.project.assetManager
    const newMaterial = assetManager.createNativeAsset('Material', 'Image', '')
    const flatgraph = findOrCreate(assetManager, new Editor.Path(import.meta.resolve('../Resources/flat.ss_graph')))
    const passInfo = newMaterial.addPass(flatgraph)
    addDefine(passInfo, 'ENABLE_BASE_TEX')
    const baseTexParam = new Editor.Assets.TextureParameter(assetId)
    passInfo.baseTex = baseTexParam
    passInfo.depthWrite = false
    passInfo.depthTest = false
    passInfo.blendMode = Editor.Assets.BlendMode.PremultipliedAlphaAuto

    return newMaterial
}

export function createScreenImage(model, parent, assetId, stretchMode) {
    // create scene object
    /** @type {Editor.Model.SceneObject} */
    const screenImgObject = model.project.scene.addSceneObject(parent)
    // add component
    /** @type {Editor.Components.ScreenTransform} */
    const screenTransformComponent = screenImgObject.addComponent('ScreenTransform')
    screenTransformComponent.advanced=true
    // add component image
    const imageComponent = screenImgObject.addComponent('Image')
    // create material for that image
    const material = createImageMaterial(model, assetId)
    // extract texture from the selected asset
    const baseTexParam = new Editor.Assets.TextureParameter(assetId)
    material.passInfos[0].baseTex = baseTexParam
    // assign material to the image component
    imageComponent.materials = [material]
    imageComponent.stretchMode = stretchMode
    screenImgObject.name = 'Screen Image'
    return screenImgObject
}

export function addDefine(passInfo, define) {
    const defines = passInfo.defines
    defines.push(define)
    passInfo.defines = defines
}

export function findOrCreate(assetManager, absolutePath) {
    const meta = assetManager.findImportedCopy(absolutePath)
    if (meta) {
        return meta.primaryAsset
    }
    const importResult = assetManager.importExternalFile(absolutePath, '', Editor.Model.ResultType.Packed)
    return importResult.primary
}


export function findOrCreateCameraObject(scene, parentObject) {
    let result = null;

    const mainCamera = scene.mainCamera;
    if (mainCamera === null) {
        result = parentObject;
        if (result === null) {
            result = scene.addSceneObject(/*parent:*/null);
        }
        const camera = result.addComponent('Camera');
        camera.cameraType = Editor.Components.CameraType.Perspective;
        camera.renderTarget = scene.captureTarget;
        result.name = 'Camera';
    } else {
        result = mainCamera.sceneObject;
    }

    return result;
}

export function findOrCreateChildWithName(rootObject, name, scene) {
    let result = null

    const sceneObjects = rootObject.children
    for (let i = 0; i < sceneObjects.length; i++) {
        const object = sceneObjects[i]
        if (object.name === name)
            result = object
    }

    if (result === null) {
        result = scene.addSceneObject(rootObject)
        result.name = 'Effects'
    }

    return result
}

export function createSceneRegion(model, sceneObject) {
    const scene = model.project.scene

    const screenRegionObject = scene.addSceneObject(sceneObject)
    const screenRegion = screenRegionObject.addComponent('ScreenRegionComponent')
    screenRegion.region = Editor.Components.ScreenRegionType.FullFrame
    screenRegionObject.name = 'Full Frame Region'
    screenRegionObject.addComponent('ScreenTransform')

    return screenRegionObject
}

export function findOrCreateOrthoCam(model) {
    const scene = model.project.scene

    let cameraObject = null
    const cameras = scene.findComponents('Camera')

    // Look for any ortho cam.
    for (let i = 0; i < cameras.length; i++) {
        const camera = cameras[i]
        if (camera.cameraType !== Editor.Components.CameraType.Orthographic) {
            continue
        }

        cameraObject = camera.sceneObject
        break
    }

    // If we haven't found an ortho cam, let's make our own.
    if (cameraObject === null) {
        cameraObject = scene.addSceneObject(null) // Add object to top level without parent.
        createOrthographicCameraObject(model, cameraObject)
    }

    return cameraObject
}

export function createOrthographicCameraObject(model, sceneObject) {
    const scene = model.project.scene
    const camera = sceneObject.addComponent('Camera')
    camera.cameraType = Editor.Components.CameraType.Orthographic
    camera.renderTarget = scene.captureTarget
    camera.renderOrder = scene.mainCamera.renderOrder + 1
    camera.renderLayer = Editor.Model.LayerSet.fromId(Editor.Model.LayerId.Ortho)
    camera.size = 20.0
    camera.near = -1
    camera.far = 200.0
    sceneObject.name = 'Orthographic Camera'
    sceneObject.localTransform = new Editor.Transform(new vec3(-120, 0, 40),
        new vec3(0, 0, 0),
        new vec3(1, 1, 1))

    return sceneObject
}
