/**
 * Remaps a value from one range to another range.
 * @param {number} value - The value to be remapped.
 * @param {number} from1 - The lower bound of the original range.
 * @param {number} to1 - The upper bound of the original range.
 * @param {number} from2 - The lower bound of the target range.
 * @param {number} to2 - The upper bound of the target range.
 * @param {boolean} [shouldClamp=false] - Whether the remapped value should be clamped within the target range.
 * @returns {number} - The remapped value.
 */
export function remap(value: number, from1: number, to1: number, from2: number, to2: number, shouldClamp: boolean = false): number {
    let result = (value - from1) / (to1 - from1) * (to2 - from2) + from2

    if (shouldClamp) {
        const minVal = Math.min(from2, to2)
        const maxVal = Math.max(from2, to2)
        result = Math.max(minVal, Math.min(maxVal, result))
    }

    return result
}

export async function findOrCreate(assetManager: Editor.Model.AssetManager, absolutePath: Editor.Path, relativerDestDir: Editor.Path) {

    const meta = assetManager.findImportedCopy(absolutePath)

    if (meta) {
        return meta.primaryAsset
    }

    const importResult = await assetManager.importExternalFileAsync(absolutePath, relativerDestDir, Editor.Model.ResultType.Auto) as Editor.Model.ImportResult

    if (!importResult) {
        throw new Error(`Error importing asset: ${absolutePath}`)
    } else if (!importResult.primary) {
        throw new Error(`Error importing asset: ${absolutePath}`)
    }

    return importResult.primary
}

export function getFirstParentOrthoCamRecursive(object: Editor.Model.SceneObject | null | undefined): Editor.Model.SceneObject | null {
    // Base case: If no object is provided, return null.
    if (!object) {
        return null
    }

    // Check if the current object has an Orthographic Camera component.
    const camera = object.getComponent('Camera')
    const isOrthoCam = camera && camera.cameraType === Editor.Components.CameraType.Orthographic
    if (isOrthoCam) {
        return object
    }

    // Recursive case: Proceed to the parent object.
    const parentObject = object.getParent()
    return parentObject ? getFirstParentOrthoCamRecursive(parentObject) : null
}

function getFirstOrthoCamInScene(model: Editor.Model.IModel) {
    const scene = model.project.scene

    const cameras = scene.findComponents('Camera') as Editor.Components.Camera[]

    // Look for any ortho cam.
    for (let i = 0; i < cameras.length; i++) {
        const camera = cameras[i]
        if (camera.cameraType !== Editor.Components.CameraType.Orthographic) {
            continue
        }

        return camera.sceneObject
    }
}

/**
 * @param sceneObject - The scene object to find or create ortho cam for.
 * @param model
 * @returns The ortho cam scene object, or, if addRegion is true, the screen region scene object.
 */
export function findOrCreateOrthoCam(model: Editor.Model.IModel, sceneObject: Editor.Model.SceneObject | null | undefined, addRegion: boolean = false) {
    const scene = model.project.scene

    // Go up parents to find ortho camera.
    let cameraObject = getFirstParentOrthoCamRecursive(sceneObject) as (Editor.Model.SceneObject | null | undefined)

    // If not found, find first ortho camera in scene.
    if (!cameraObject) {
        cameraObject = getFirstOrthoCamInScene(model)
    }

    // If still have not found any, make a new one.
    if (!cameraObject) {
        //@ts-expect-error - the .d.ts is not up to date
        cameraObject = scene.addSceneObject(null) // Add object to top level without parent.
        createOrthographicCameraObject(model, cameraObject)
    }

    try {
        let canvasComponent = cameraObject.getComponent('Canvas') as Editor.Components.Canvas
        // Make sure there's a canvas on ortho cam so users can easily change units.
        if (!canvasComponent) {
            canvasComponent = cameraObject.addComponent('Canvas') as Editor.Components.Canvas
        }

        //set the unit type to point
        canvasComponent.unitType = Editor.Components.UnitType.Points

        //now we add region if needed
        if (addRegion) {
            const regionBearer = scene.addSceneObject(cameraObject) // Add object to top level without parent.
            regionBearer.name = 'Screen Region'
            const regionComponent = regionBearer.addComponent('ScreenRegionComponent') as Editor.Components.ScreenRegionComponent
            regionBearer.addComponent('ScreenTransform')
            regionBearer.layer = Editor.Model.LayerId.Ortho
            regionComponent.region = Editor.Components.ScreenRegionType.FullFrame
            return regionBearer
        }
    } catch (e) {
        //@ts-expect-error - TS doesn't know about e.message or e.stack
        console.log(e.message)
        //@ts-expect-error - TS doesn't know about e.message or e.stack
        console.log(e.stack)
    }

    return cameraObject
}

export function filenameSafeString(str: string) {
    // Replace non-standardized spaces and disallowed characters
    const processed = str.replace(/[^\x20-\x7E]|[/<>:"|?*]/g, '_').toLowerCase()

    // Check for disallowed names in Windows
    const disallowedNames = ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9', 'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9']
    if (disallowedNames.includes(processed)) {
        return '_' + processed
    }

    // Limit the length to 20 characters
    if (processed.length > 20) {
        return processed.substring(0, 20)
    }

    return processed
}

/////////////////// copied from
// LensStudio/StudioPlugins/Model/JsPlugins/PresetsRegistry/Assets/Utils/Material.js

export function addDefine(passInfo: Editor.Assets.PassInfo, define: string) {
    const defines = passInfo.defines
    defines.push(define)
    passInfo.defines = defines
}

export function setupSamplerWrapMode(sampler: Editor.Assets.Sampler, wrapMode: Editor.Assets.WrapMode) {
    sampler.wrapModeU = wrapMode
    sampler.wrapModeV = wrapMode
    sampler.wrapModeW = wrapMode
    return sampler
}

//////////////////////////////////////////////////////////

export function createOrthographicCameraObject(model: Editor.Model.IModel, sceneObject: Editor.Model.SceneObject) {
    const scene = model.project.scene
    const camera = sceneObject.addComponent('Camera') as Editor.Components.Camera
    camera.cameraType = Editor.Components.CameraType.Orthographic
    camera.renderTarget = scene.renderOutput
    camera.renderOrder = scene.mainCamera.renderOrder + 1
    camera.renderLayer = Editor.Model.LayerSet.fromId(Editor.Model.LayerId.Ortho)
    camera.size = 20.0
    camera.near = -1.0 //we use minus near plant to make sure any screen transform with 0 as their z value will be rendered
    camera.far = 200.0
    sceneObject.name = 'Orthographic Camera'
    sceneObject.localTransform = new Editor.Transform(new vec3(-120, 0, 40), new vec3(0, 0, 0), new vec3(1, 1, 1))
    sceneObject.layer = Editor.Model.LayerId.Ortho

    return sceneObject
}

export function secondsToDHM(sec: number) {
    const days = Math.floor(sec / 86400)
    sec -= days * 86400
    const hours = Math.floor(sec / 3600)
    sec -= hours * 3600
    const minutes = Math.floor(sec / 60)
    return `${days} days, ${hours} hours, ${minutes} minutes`
}

export function sleep(millisecond: number) {
    return new Promise(resolve => setTimeout(resolve, millisecond))
}

export class Logger {
    private static readonly LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR'];
    private currentLevel: string

    constructor(private prefix: string, level: string = 'DEBUG') {
        this.prefix = prefix
        this.currentLevel = level
    }

    private log(level: string, message: string) {
        if (Logger.LEVELS.indexOf(level) < Logger.LEVELS.indexOf(this.currentLevel)) {
            return
        }


        let logMethod = console.log

        switch (level) {
            case 'DEBUG':
                logMethod = console.debug
                break
            case 'INFO':
                logMethod = console.info
                break
            case 'WARNING':
                logMethod = console.warn
                break
            case 'ERROR':
                logMethod = console.error
                break
        }

        let formattedMessage = `${this.prefix} [${level}] ${message}`

        if (formattedMessage.length > 1000) {
            formattedMessage = formattedMessage.slice(0, 1000) + '...'
        }

        logMethod(formattedMessage)
    }

    public debug(message: string) {
        this.log('DEBUG', message)
    }

    public info(message: string) {
        this.log('INFO', message)
    }

    public warn(warning: string) {
        this.log('WARNING', warning)
    }

    public error(devMessage?: string | any, error?: any) {
        let formattedMessage = ''

        if (devMessage != undefined) {
            formattedMessage += `Developer Message: ${this.safeStringify(devMessage)}\n`
        }

        formattedMessage += 'Error Details:\n'

        let msg = ''
        let stack = ''

        if (error != undefined) {
            if (typeof error === 'string') {
                msg = error
            } else if (typeof error === 'object') {
                if ('message' in error) {
                    msg = this.safeStringify(error.message)
                }
                if ('stack' in error) {
                    stack = this.safeStringify(error.stack)
                }
            } else {
                msg = JSON.stringify(error, null, 2)
            }
        } else {
            msg = 'No error object provided.'
        }

        formattedMessage += `    Message: ${msg}\n`
        formattedMessage += `    Stack: ${stack || 'No stack trace available'}\n`

        this.log('ERROR', this.desensitizeMessage(formattedMessage))
    }

    private safeStringify(input: any): string {
        if (typeof input === 'string') return input
        if (input === null) return 'null'
        if (input === undefined) return 'undefined'
        if (typeof input === 'function') return '[Function]'
        if (typeof input === 'object') {
            try {
                return JSON.stringify(input)
            } catch {
                return '[Unstringifiable Object]'
            }
        }
        return String(input)
    }

    private desensitizeMessage(message: string) {
        const pathToPluginDir = import.meta.resolve('./')
        const stringToId = 'Bundle/Plugins'
        const toRemove = pathToPluginDir.substring(0, pathToPluginDir.indexOf(stringToId) + stringToId.length)
        while (message.includes(toRemove)) {
            message = message.replace(toRemove, '.../')
        }
        return message
    }
}
