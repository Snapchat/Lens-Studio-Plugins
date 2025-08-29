import * as FileSystem from 'LensStudio:FileSystem'
import { NodeHandler, ProcessorContext } from './Handlers.js'
import * as figmaApi from '../services/FigmaApiService.js'
import * as utils from '../utils/generalUtils.js'
import UserPrefManager from '../services/UserPrefManager.js'
import { RecreationMethod } from '../services/rulebook.js'
import FigmaFileAgent from '../services/FigmaFileAgent.js'
import { logger } from '../utils/FigmaUtils.js'
import AssetResourceProvider from './AssetResourceProvider.js'

/**
 * Recreate the graphics elements of a node, the approach would be different based on the recreation method
 */
export default class GraphicsHandler extends NodeHandler {

    nodeContext?: ProcessorContext
    globalContext?: GlobalContext

    public async process(nodeContext: ProcessorContext, globalContext: GlobalContext) {

        //save the contexts, we use a shallow copy to avoid the original context being modified
        this.nodeContext = { ...nodeContext }
        this.globalContext = globalContext

        if (!this.nodeContext || !this.globalContext) {
            throw new Error('NodeContext or GlobalContext is not set.')
        }

        //add & set image component
        const imageComponent = this.nodeContext.sceneObject.addComponent('Image') as Editor.Components.Image

        //set texture
        switch (this.nodeContext.method) {
            case RecreationMethod.Rasterization:
                try {
                    if (!this.nodeContext.owner) throw new Error('Owner is not set.')
                    if (!this.globalContext.assetManager) throw new Error('AssetManager is not set.')
                    await this.loadAndSetTexture(imageComponent, this.nodeContext.node.name, this.nodeContext.imageUrl, this.globalContext.assetManager, this.nodeContext.owner)
                } catch (e) {
                    logger.error(`Error when setting texture for node ${nodeContext.node.name}`, e)
                }
                break
            case RecreationMethod.Shape2D:
                try {
                    await this.set2DShape(imageComponent)
                } catch (e) {
                    logger.error(`Error when setting 2D shape for node ${nodeContext.node.name}`, e)
                }
                break
            default:
                throw new Error(`Unsupported recreation method: ${this.nodeContext.method}`)
        }
    }

    private static async addAutoAdjustingShape2DController(sceneObject: Editor.Model.SceneObject, assetResourceProvider: AssetResourceProvider) {
        const scriptComponent = sceneObject.addComponent('ScriptComponent') as Editor.Components.ScriptComponent
        const scriptLoc = 'assets/AutoAdjustingShape2DController.js'
        const relDestDir = 'FigmaResources/Scripts'
        const scriptAsset = await assetResourceProvider.findOrCreateAsset(scriptLoc, relDestDir) as Editor.Assets.ScriptAsset
        scriptComponent.scriptAsset = scriptAsset
        return scriptComponent
    }

    //TODO: finish implementing this
    private async set2DShape(imageComponent: Editor.Components.Image) {

        //we copy the node in case it gets modified by other processors
        const nodeContext = { ...this.nodeContext }
        const node = nodeContext.node

        if (!node) {
            logger.warn('Node is not set, skipping setting 2D shape')
            return
        }
        if (!nodeContext.sceneObject) {
            logger.warn('SceneObject is not set, skipping setting 2D shape')
            return
        }

        // const node = { ...this.nodeContext!.node }
        // const sceneObject = this.nodeContext!.sceneObject

        //set the stretch mode to fill becasue the 2D shape shader will handle the reshaping
        imageComponent.stretchMode = Editor.Components.StretchMode.Fill
        //TODO: parameterize the shader name
        const shaderName = '2D Shapes Shader v1.ss_graph'
        const { material } = await this.createMaterial(shaderName, node.name)

        imageComponent.materials = [material]

        await GraphicsHandler.addAutoAdjustingShape2DController(nodeContext.sceneObject, this.appContext.resourceProvider)

        const mainPass = material.passInfos[0] as any

        mainPass.shapeRoundness = 0.0
        mainPass.shapeColorInvert = true
        mainPass.shapeRotation = 0

        if (node && 'fills' in node && node.fills.length > 0) {
            //TODO: process more than 1 fills
            const fill = node.fills[0]

            if (fill && 'opacity' in fill) {
                mainPass.shapeAlpha = fill.opacity
            }

            if (fill && 'color' in fill) {
                //get color from figma node
                const fillColor = fill.color
                const color = new vec4(fillColor.r, fillColor.g, fillColor.b, fillColor.a)
                mainPass.shapeColor = color
            }
        }

        if (node && 'strokes' in node && node.strokes.length > 0) {
            //TODO: process more than 1 strokes
            const stroke = node.strokes[0]

            if (stroke) {
                mainPass.useStroke = true

                if ('color' in stroke) {
                    const strokeColor = stroke.color
                    const color = new vec4(strokeColor.r, strokeColor.g, strokeColor.b, strokeColor.a)
                    mainPass.strokeColor = color
                }

                if ('opacity' in stroke) {
                    mainPass.strokeAlpha = stroke.opacity
                }
            }

            if ('strokeWeight' in node) {
                //TODO: implement a more precise conversion
                //convert strokeWeight to strokeThickness, this is a rough conversion based on my own observation
                const strokeWeight = utils.remap(node.strokeWeight, 1, 17, 0.1, 1)
                mainPass.strokeThickness = strokeWeight
            }
        }

        if ('cornerRadius' in node || 'rectangleCornerRadii' in node) {
            //convert corner radius to shape roundness
            //corner radius is in pixels, shape roundness is in normalized units (0 is a square, 1 is a circle)
            let cornerRadius = null
            if ('cornerRadius' in node) {
                cornerRadius = node.cornerRadius
            }
            if ('rectangleCornerRadii' in node) {
                const radii = node.rectangleCornerRadii as [number, number, number, number]
                cornerRadius = Math.max(...radii)
            }
            if (cornerRadius == null) return
            if (!('absoluteBoundingBox' in node)) return
            const width = node.absoluteBoundingBox.width
            const height = node.absoluteBoundingBox.height
            const minDim = Math.min(width, height)
            const roundness = utils.remap(cornerRadius, 0, minDim / 2, 0, 1)
            mainPass.shapeRoundness = roundness
        }
    }

    private nodeNameToFilename(nodeName: string) {
        let newName = utils.filenameSafeString(nodeName)
        // If the resulting name is empty, use a default name
        if (newName === '') {
            newName = 'default_filename'
        }
        return newName
    }

    private async loadAndSetTexture(
        imageComponent: Editor.Components.Image,
        nodeName: string,
        imageUrl: string | null,
        assetManager: Editor.Model.AssetManager,
        owner: FigmaFileAgent
    ) {

        if (!imageUrl) return

        //make sure the nodeName is a valid filename
        nodeName = this.nodeNameToFilename(nodeName)

        const figmaUrlPattern = /^https:\/\/figma-.*\..*\.amazonaws\.com\/images\/.*/
        // logger.logMessage(`Downloading image from ${imageUrl}`)
        //validate the url of imageUrl to make sure it is from figma
        if (!figmaUrlPattern.test(imageUrl)) {
            logger.warn(`Invalid URL: ${imageUrl}, the url has to be from ${figmaUrlPattern}`)
            return
        }
        const { bytes, subType } = await figmaApi.downloadImageFile(imageUrl)

        const tempDir = FileSystem.TempDir.create()
        const assetDirName = this.getAssetDirName(owner)
        const filename = `${nodeName}.${subType}`
        const meta = await this.importImage(
            bytes as any,
            assetManager,
            filename,
            assetDirName,
            tempDir
        )

        const imageMeta = meta?.primary?.fileMeta

        if (!imageMeta) {
            logger.error(`Error when loading node ${nodeName} image. Skipping populating image component.`, null)
            return
        }

        const { material, passInfo } = await this.createMaterial('uber.ss_graph', nodeName)
        imageComponent.materials = [material]
        //tweak
        passInfo.depthTest = false
        passInfo.depthWrite = false

        if (imageMeta && 'baseTex' in passInfo) {
            const textureParam = new Editor.Assets.TextureParameter(imageMeta.primaryAsset.id)
            textureParam.sampler = utils.setupSamplerWrapMode(textureParam.sampler, Editor.Assets.WrapMode.ClampToEdge)
            passInfo.baseTex = textureParam

            //retreive the saved stretch mode
            const savedStretchMode = UserPrefManager.readPref('image_component_stretch_mode')
            imageComponent.stretchMode = this.getStretchModeFromString(savedStretchMode)
        } else {
            logger.warn('Setting texture failed.')
        }
    }

    // create a material based on the given graph, the material will be placed in the Materials folder and given the name "node name + Material"
    private async createMaterial(graphName: string, nodeName: string) {
        const destDir = `${this.getAssetDirName(this.nodeContext!.owner)}/Materials`
        nodeName = utils.filenameSafeString(nodeName)
        const { material, passInfo } = await this.appContext.resourceProvider.createMaterialFromGraph(`assets/${graphName}`, nodeName + ' Material', destDir)
        return { material, passInfo }
    }

    // Convert string to StretchMode enum value
    private getStretchModeFromString(stretchModeString: string): Editor.Components.StretchMode {
        const normalizedString = stretchModeString.toLowerCase().replace(/\s/g, '')
        const stretchModeKey = Object.keys(Editor.Components.StretchMode).find(
            key => key.toLowerCase().replace(/\s/g, '') === normalizedString
        )
        return stretchModeKey ? Editor.Components.StretchMode[stretchModeKey as keyof typeof Editor.Components.StretchMode] : Editor.Components.StretchMode.Stretch
    }

    private async importImage(imageBytes: number[], assetManager: Editor.Model.AssetManager, filename: string, assetDirName: string, tempDir: FileSystem.TempDir) {
        try {
            const imageFileName: Editor.Path = new Editor.Path(filename)
            const filePath = tempDir.path.appended(imageFileName)
            GraphicsHandler.validatePathInsideDirectory(filePath.toString(), tempDir.path.toString())
            FileSystem.writeFile(filePath, imageBytes as any)
            return assetManager.importExternalFileAsync(filePath, new Editor.Path(`${assetDirName}/Texture`), Editor.Model.ResultType.Auto)
        } catch (e) {
            logger.error('Error importing image', e)
            return null
        }
    }

    /**
     * check if path1 is inside of path2
     * @throws Error if path1 is not inside of path2
     */
    private static validatePathInsideDirectory(path1: string, path2: string) {
        const resolvedFilePath = import.meta.resolve(path1)
        const resolvedDirectoryPath = import.meta.resolve(path2)

        if (!resolvedFilePath.startsWith(resolvedDirectoryPath)) {
            throw new Error(`Resolved file path is not inside the resolved directory. resolvedFilePath: ${resolvedFilePath} | resolvedDirectoryPath: ${resolvedDirectoryPath}`)
        }
    }
}
