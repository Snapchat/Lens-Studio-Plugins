import app from "../Application.js";
export class Importer {
    constructor() { }
    async addFaceMaskComponent(assetManager, sceneObject, mainTexture) {
        try {
            const faceMaskComponent = sceneObject.addComponent("FaceMaskVisual");
            const material = await this.importFaceMaskMaterial(assetManager, mainTexture);
            faceMaskComponent.addMaterialAt(material, 0);
            return faceMaskComponent;
        }
        catch (e) {
            return undefined;
        }
    }
    async importFaceMaskMaterial(assetManager, mainTexture) {
        let faceMaskMaterialPackage = assetManager.importExternalFile(new Editor.Path(import.meta.resolve("./Resources/FaceMask.lspkg")), new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets), Editor.Model.ResultType.Unpacked);
        let lspkgPath = faceMaskMaterialPackage.path;
        let maskMaterialPath = lspkgPath.appended(new Editor.Path("Face Mask.mat"));
        let maskMaterialMeta = assetManager.getFileMeta(new Editor.Model.SourcePath(maskMaterialPath, Editor.Model.SourceRootDirectory.Assets));
        let passInfoPath = lspkgPath.appended(new Editor.Path("flat.ss_graph"));
        let passInfoMeta = assetManager.getFileMeta(new Editor.Model.SourcePath(passInfoPath, Editor.Model.SourceRootDirectory.Assets));
        let opacityMaterialPath = lspkgPath.appended(new Editor.Path("FaceMaskOpacity.jpg"));
        let opacityMaterialMeta = assetManager.getFileMeta(new Editor.Model.SourcePath(opacityMaterialPath, Editor.Model.SourceRootDirectory.Assets));
        assetManager.move(maskMaterialMeta, new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets));
        assetManager.move(passInfoMeta, new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets));
        assetManager.move(opacityMaterialMeta, new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets));
        assetManager.remove(new Editor.Model.SourcePath(lspkgPath, Editor.Model.SourceRootDirectory.Assets));
        const mainTexParam = new Editor.Assets.TextureParameter(mainTexture.id);
        //@ts-ignore
        maskMaterialMeta.primaryAsset.passInfos[0].baseTex = mainTexParam;
        return maskMaterialMeta.primaryAsset;
    }
    async createFaceMask(model, parentSceneObject, mainTexture) {
        const assetManager = model.project.assetManager;
        const scene = model.project.scene;
        const faceMaskSceneObject = scene.addSceneObject(parentSceneObject);
        faceMaskSceneObject.name = "Face Mask";
        const faceMaskComponent = await this.addFaceMaskComponent(assetManager, faceMaskSceneObject, mainTexture);
        return faceMaskComponent;
    }
    async import(textureBytes) {
        const model = app.findInterface(Editor.Model.IModel);
        const assetManager = model.project.assetManager;
        let mainTexture = await assetManager.importExternalFileAsync(app.storage.createFile("FaceMask.jpg", textureBytes), new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets), Editor.Model.ResultType.Auto);
        mainTexture = mainTexture.primary;
        const effectsObject = this.findOrCreateEffectsObject(model);
        await this.createFaceMask(model, effectsObject, mainTexture);
        return new Promise((resolve) => {
            resolve();
        });
    }
    findOrCreateEffectsObject(model) {
        const scene = model.project.scene;
        let effects = scene.sceneObjects.find((object) => object.name === "Effects");
        if (effects) {
            return effects;
        }
        effects = model.project.scene.addSceneObject(scene.mainCamera.sceneObject);
        effects.name = "Effects";
        return effects;
    }
}
