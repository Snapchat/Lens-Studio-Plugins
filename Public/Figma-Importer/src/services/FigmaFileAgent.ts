import FigmaUtils from '../utils/FigmaUtils.js'
import * as figmaApi from './FigmaApiService.js'
import * as FileSystem from 'LensStudio:FileSystem'

/**
 * object to hold data for the current file being processed
 * this class should ONLY hold data that belongs to the figma file
 * please no business logic here
 */
export default class FigmaFileAgent {
    fileKey: string
    hookNodeName?: string
    file?: Figma.GetFileResponse
    document?: Figma.DOCUMENT

    private hookNodeId: string

    private constructor(fileKey: string, nodeId: string) {
        this.hookNodeId = nodeId
        this.fileKey = fileKey
    }

    public static async create(fileKey: string, nodeId: string): Promise<FigmaFileAgent> {
        const instance = new FigmaFileAgent(fileKey, nodeId)
        await instance.fetch()
        return instance
    }

    /*** Fetches file data from the Figma API. */
    private async fetch(writeToFile = false) {
        this.file = await figmaApi.fetchFile(this.fileKey)
        if (!this.file) {
            throw new Error('File not found')
        }
        ////debugging
        if (writeToFile) {
            const json = JSON.stringify(this.file.document, null, 4)
            const modulePath = new Editor.Path(import.meta.resolve(''))
            const filepath = new Editor.Path('.fetchedFile.json')
            const fileRelPath = modulePath.parent.appended(filepath)
            FileSystem.writeFile(fileRelPath, json)
        }
        /////
        this.document = this.file.document
        this.hookNodeName = FigmaUtils.findById(this.hookNodeId, this.document)?.name
    }
}
