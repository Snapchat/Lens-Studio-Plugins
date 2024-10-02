import * as utils from '../utils/generalUtils.js'
import { getRuleByType, RecreationMethod } from '../services/rulebook.js'
import * as figmaApi from '../services/FigmaApiService.js'
import FigmaFileAgent from '../services/FigmaFileAgent.js'
import AssetResourceProvider from './AssetResourceProvider.js'
import { NodeHandler, ProcessorContext } from './Handlers.js'
import TransformHandler from './TransformHandler.js'
import GraphicsHandler from './GraphicsHandler.js'
import { logger } from '../utils/FigmaUtils.js'

// Define a global context class
export class NodeMaterializerContext {
    public readonly globalContext: GlobalContext
    public readonly resourceProvider: AssetResourceProvider

    constructor(globalContext: GlobalContext) {
        this.globalContext = globalContext
        this.resourceProvider = new AssetResourceProvider(this.globalContext)
    }
}

export default class NodeMaterializer {
    //global level properties
    private nodeMatContext: NodeMaterializerContext
    private imgOptions: figmaApi.ImageOptions
    private nodeProcessor: NodeProcessor

    //local level properties
    constructor(context: GlobalContext) {
        this.imgOptions = figmaApi.createDefaultImageOptions({ scale: 2 })
        //ease for passing around
        this.nodeMatContext = new NodeMaterializerContext(context)
        this.nodeProcessor = new NodeProcessor(this.nodeMatContext)
        //create a temp dir to hold all the assets needed for the materialization
    }

    //Generates a root scene object name based on the file agent and master node.
    private makeRootSceneObjectName(fileAgent: FigmaFileAgent) {
        const name = fileAgent.file?.name || 'NAME_NOT_FOUND'
        const version = fileAgent.file?.version || 'VERSION_NOT_FOUND'
        return `[${name}]_(v: ${version})`
    }

    private collectRasterizationTargets(node: Figma.Node): Figma.Node[] {
        let results: Figma.Node[] = []
        const rule = getRuleByType(node.type)

        if (rule.recreationMethod === RecreationMethod.Rasterization) results.push(node)
        if (!rule.ignoreChildren && 'children' in node && node.children) {
            node.children.forEach(child => results = results.concat(this.collectRasterizationTargets(child)))
        }
        return results
    }

    //build a parent map for the nodes so we can easily find the parent of a node
    private buildParentMap(node: Figma.Node, parentMap: Map<Figma.Node, Figma.Node | null> = new Map()): Map<Figma.Node, Figma.Node | null> {
        if ('children' in node) {
            for (const child of node.children) {
                parentMap.set(child, node)
                this.buildParentMap(child, parentMap)
            }
        }
        return parentMap
    }

    /**
     * Renders the node hierarchy starting from the root node.
     */
    public async renderNodeHierarchy(root: Figma.Node, owner: FigmaFileAgent, progressReporter: (addition: number) => void) {

        // We will count all nodes
        const countNodes = (node: Figma.Node): number => {
            if (node.visible === false) return 0

            let count
            const rule = getRuleByType(node.type)

            if (rule.ignoreSelf) { count = 0 } else {
                count = 1
            }
            if ('children' in node && rule.ignoreChildren === false) {
                for (const child of node.children) {
                    count += countNodes(child)
                }
            }
            return count
        }

        const findLegitParentNode = (node: Figma.Node, ignoredNames: string[]): Figma.Node => {
            const rule = getRuleByType(node.type)
            if (rule.ignoreSelf) {
                ignoredNames.push(node.name)
                const parentNode = parentMap.get(node)
                if (parentNode) {
                    return findLegitParentNode(parentNode, ignoredNames)
                } else if (node === root) {
                    return node
                } else {
                    throw new Error(`Unexpectedly, the parent of node: ${node.name} is null. This is not expected.`)
                }
            }
            return node
        }

        const iterateSceneNodes = async (node: Figma.Node, parentNode: Figma.Node | null, parentSceneObject: Editor.Model.SceneObject | null): Promise<void> => {

            // Parameter check. Since this function are being used for both the root node and the children nodes, we need to check if the parameters are correct
            if (node === root) {
                if (parentNode || parentSceneObject) {
                    throw new Error('Root node should not have parent node or parent scene object')
                }
            } else {
                if (!parentNode || !parentSceneObject) {
                    throw new Error('Non-root node should have parent node and parent scene object')
                }
            }

            // If there is no parent scene object, it means this is the root node. then we need to find or create a camera
            // We are creating a Screen Region scene object for the Frame, whose name would be the name of the File and Frame
            if (!parentSceneObject) {
                logger.debug(`Creating ortho cam for root node: ${node.name}`)
                const rootSceneObject = utils.findOrCreateOrthoCam(this.nodeMatContext.globalContext.model, null, true)
                rootSceneObject.name = this.makeRootSceneObjectName(owner)
                parentSceneObject = rootSceneObject
            }

            if ('visible' in node && node.visible === false) {
                return
            }

            const imgUrl = imgUrlMap[node.id]

            let baseNodeName = node.name

            const rule = getRuleByType(node.type)

            // If we do have a parent node, and the parent node is supposed to be ignored, we would perform a heuristic to find the parent node
            // We also need to keep records of the names of the nodes we are ignoring so we can reflect the hierarchy in the scene object name
            if (parentNode != null) {
                const r = getRuleByType(parentNode.type)
                if (r.ignoreSelf) {
                    const ignoredNames: string[] = []
                    parentNode = findLegitParentNode(parentNode, ignoredNames)
                    const connector = ' -> '
                    baseNodeName = `${ignoredNames.reverse().join(connector)}${connector}${baseNodeName}`
                }
            }

            let newParent: Editor.Model.SceneObject

            //material self
            if (!rule.ignoreSelf) {
                newParent = await this.nodeProcessor.processSingleNode(
                    node,
                    rule.recreationMethod,
                    baseNodeName, parentNode, parentSceneObject, imgUrl, owner
                )
                progressReporter(increment)
            } else {
                newParent = parentSceneObject
            }

            if ('children' in node && !rule.ignoreChildren) {
                await Promise.all(node.children.map(child => iterateSceneNodes(child, node, newParent)))
            }
        }

        //business logic starts here
        const parentMap = this.buildParentMap(root)
        const idsForRasterization = this.collectRasterizationTargets(root).map(n => n.id)
        const imgUrlMap = await this.fetchNodeImageUrls(owner.fileKey, idsForRasterization, 20)
        const totalNodes = countNodes(root)
        const increment = 1 / totalNodes * 100
        logger.debug(`Total nodes to process: ${totalNodes}`)
        logger.debug(`Start plowing through the node hierarchy, starting from the root node: ${root.name}`)
        await iterateSceneNodes(root, null, null)

    }

    /**
     * Fetches the image URLs for the given node IDs in chunks and returns a mapping of node IDs to image URLs.
     * @param fileKey - The key of the file containing the nodes.
     * @param idsForRasterization - The array of node IDs to fetch image URLs for.
     * @param chunkSize - The size of each chunk for fetching image URLs.
     * @returns A promise that resolves to an object mapping node IDs to image URLs.
     */
    private async fetchNodeImageUrls(fileKey: string, idsForRasterization: string[], chunkSize: number): Promise<{ [id: string]: string }> {
        const chunks = []
        for (let i = 0; i < idsForRasterization.length; i += chunkSize) {
            chunks.push(idsForRasterization.slice(i, i + chunkSize))
        }
        logger.debug(`Fetching image URLs for ${idsForRasterization.length} nodes in ${chunks.length} chunks`)

        const results = await Promise.all(chunks.map(async chunk => {
            const imgUrls = await figmaApi.fetchNodeImgUrls(fileKey, chunk, this.imgOptions)
            return imgUrls
        }))

        return Object.assign({}, ...results)
    }
}

class NodeProcessor {

    /** @description a map of strategies by the type of node */
    nodeProcessingStrategies: Map<string, NodeHandler[]>
    /** @description the default handlers to be used for all components */
    defaultHandlers: NodeHandler[]

    constructor(private myContext: NodeMaterializerContext) {
        this.defaultHandlers = [new TransformHandler(this.myContext), new GraphicsHandler(this.myContext)]
        this.nodeProcessingStrategies = new Map<string, NodeHandler[]>(
            [
                ['GROUP', [new TransformHandler(this.myContext)]]
            ]
        )
    }

    //the base is a scene object with screen transform component
    private createBase(name: string, parentSceneObject: Editor.Model.SceneObject): Editor.Components.ScreenTransform {
        const newSceneObject = this.myContext.globalContext.scene.addSceneObject(parentSceneObject)
        newSceneObject.name = name

        const screenTransform = newSceneObject.addComponent('ScreenTransform') as Editor.Components.ScreenTransform
        newSceneObject.layer = newSceneObject.getParent().layer

        return screenTransform
    }

    /**
     * make a new scene object for this node.
     * and process the node with the Component specific handlers
     *
     * @param node - The node to be processed.
     * @param recreateMethod - The method to be used to recreate the node in hierarchy.
     * @param objectName - The name for the about to be created scene object.
     * @param parentNode - The parent node of the node being processed.
     * @param parentSceneObject - The scene object of the parent node.
     * @param imageUrl - The image url of the node's visual, if any.
     * @param owner - The file who owns the node.
     *
     */
    public async processSingleNode(
        node: Figma.Node,
        recreateMethod: RecreationMethod,
        objectName: string,
        parentNode: Figma.Node | null,
        parentSceneObject: Editor.Model.SceneObject,
        imageUrl: string | null,
        owner: FigmaFileAgent
    ): Promise<Editor.Model.SceneObject> {

        const handlers = this.nodeProcessingStrategies.get(node.type) || this.defaultHandlers

        const base = this.createBase(objectName, parentSceneObject)

        const context: ProcessorContext = {
            /** the node being processed */
            node: node,
            /** the method being used to recreate the node in hierarchy */
            method: recreateMethod,
            /** the parent node of the node being processed */
            parentNode: parentNode,
            /** the scene object of the parent node */
            sceneObject: base.sceneObject,
            /** the screen transform component of the scene object */
            screenTransform: base,
            /** the image url of the node */
            imageUrl: imageUrl,
            /** the owner of the node */
            owner: owner
        }
        for (const handler of handlers) {
            try {
                await handler.process(context, this.myContext.globalContext)
            } catch (e) {
                logger.error('Error processing node: ${node.name} with handler: ${handler.constructor.name}', null)
                logger.error('', e)
            }
        }
        return base.sceneObject
    }
}
