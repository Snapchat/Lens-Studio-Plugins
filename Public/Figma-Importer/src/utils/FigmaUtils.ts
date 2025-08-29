import { Logger } from './generalUtils.js'

export default class FigmaUtils {

    static deepFind(node: Figma.Node, predicate: (node: Figma.Node) => boolean) {
        const result: Figma.Node[] = []

        if (predicate(node)) {
            result.push(node)
        }
        if ('children' in node && node.children) {
            for (const child of node.children) {
                result.push(...this.deepFind(child, predicate))
            }
        }
        return result
    }

    static findById(id: string, fromNode: Figma.Node) {
        const node = FigmaUtils.deepFind(fromNode, (node) => node.id == id)
        if (node.length != 1) {
            logger.warn(`Node with id ${id} not found or found more than 1 which shouldn't happen!`)
            return null
        } else {
            return node[0]
        }
    }

    static linkParser(link: string) {

        //official regexp provided by figma
        const patten = /https:\/\/[\w.-]+\.?figma.com\/([\w-]+)\/([0-9a-zA-Z]{22,128})(?:.*node-id=([0-9-]+))?.*$/

        const match = link.match(patten)

        const fileType = match?.[1]
        const fileKey = match?.[2]
        let nodeId = match?.[3]

        logger.debug(`File type: ${fileType}, File key: ${fileKey}, Node id: ${nodeId}`)

        if (nodeId) {
            nodeId = nodeId.replace(/-/g, ':')
        }

        return {
            fileKey: fileKey,
            nodeId: nodeId
        }
    }
}

const loggerLevel = 'DEBUG'
export const logger = new Logger('[Figma Importer]', loggerLevel)
