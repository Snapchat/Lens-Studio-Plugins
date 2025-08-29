import { NodeMaterializerContext } from './NodeMaterializer.js'
import FigmaFileAgent from '../services/FigmaFileAgent.js'
import { RecreationMethod } from '../services/rulebook.js'
import { filenameSafeString } from '../utils/generalUtils.js'

export abstract class NodeHandler {
    constructor(protected appContext: NodeMaterializerContext) { }
    abstract process(nodeContext: ProcessorContext, globalContext: GlobalContext): Promise<void>

    getAssetDirName(owner: FigmaFileAgent) {
        const mainDir = 'FigmaImported'
        const fileName = filenameSafeString(owner.file?.name ?? 'Unknown')
        const fileVersion = owner.file?.version ?? 'Unknown'
        const importedNodeName = filenameSafeString(owner.hookNodeName ?? 'Unknown')
        return `${mainDir}/${fileName}_${fileVersion}/${importedNodeName}`
    }
}

export type ProcessorContext = {
    node: Figma.Node,
    method: RecreationMethod,
    parentNode: Figma.Node | null,
    sceneObject: Editor.Model.SceneObject,
    screenTransform: Editor.Components.ScreenTransform,
    imageUrl: string | null,
    owner: FigmaFileAgent
}
