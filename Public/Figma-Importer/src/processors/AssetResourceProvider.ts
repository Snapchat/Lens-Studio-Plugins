import * as utils from '../utils/generalUtils.js'

export default class AssetResourceProvider {
    private context: GlobalContext
    private shaderGraphDirName = 'FigmaResources'

    constructor(context: GlobalContext) {
        this.context = context
    }

    async findOrCreateAsset(assetPath: string, relativeDestDir: string) {
        const absoluteAssetPath = this.context.workingDirectory.appended(new Editor.Path(assetPath))
        return utils.findOrCreate(this.context.assetManager, absoluteAssetPath, new Editor.Model.SourcePath(new Editor.Path(relativeDestDir), Editor.Model.SourceRootDirectory.Assets))
    }

    async createMaterialFromGraph(shaderGraphPath: string, materialFileName: string, outputFolder: string) {
        const shaderGraphAsset = await this.findOrCreateAsset(shaderGraphPath, `${this.shaderGraphDirName}/Shaders`)
        const material = this.context.assetManager.createNativeAsset('Material', materialFileName, new Editor.Model.SourcePath(new Editor.Path(outputFolder), Editor.Model.SourceRootDirectory.Assets)) as Editor.Assets.Material
        const passInfo = material.addPass(shaderGraphAsset)

        //disable depthTest and depthWrite
        passInfo.depthTest = false
        passInfo.depthWrite = false

        passInfo.blendMode = Editor.Assets.BlendMode.PremultipliedAlphaAuto
        utils.addDefine(passInfo, 'ENABLE_BASE_TEX')
        return { material, passInfo }
    }
}
