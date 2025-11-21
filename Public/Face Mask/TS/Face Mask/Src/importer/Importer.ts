import app from "../Application.js";

export class Importer {
    constructor() {}

    async addFaceMaskComponent(assetManager: Editor.Model.AssetManager, sceneObject: Editor.Model.SceneObject, mainTexture: any): Promise<Editor.Components.FaceMaskVisual | undefined> {
        try {
            const faceMaskComponent = sceneObject.addComponent("FaceMaskVisual") as Editor.Components.FaceMaskVisual;
            const material = await this.importFaceMaskMaterial(assetManager, mainTexture);
            faceMaskComponent.addMaterialAt(material, 0);
            return faceMaskComponent;
        } catch (e: any) {
            return undefined;
        }
    }

    async importFaceMaskMaterial(assetManager: Editor.Model.AssetManager, mainTexture: Editor.Assets.TextureParameter): Promise<Editor.Assets.Material> {
        let faceMaskMaterialPackage = assetManager.importExternalFile(
            new Editor.Path(import.meta.resolve("./Resources/FaceMask.lspkg")),
            new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets),
            Editor.Model.ResultType.Unpacked
        ) as Editor.Model.ImportResult;

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

        return maskMaterialMeta.primaryAsset as Editor.Assets.Material;
    }

    async createFaceMask(model: Editor.Model.IModel, parentSceneObject: Editor.Model.SceneObject, mainTexture: any) {
        const assetManager = model.project.assetManager;
        const scene = model.project.scene;

        const faceMaskSceneObject = scene.addSceneObject(parentSceneObject) as Editor.Model.SceneObject;
        faceMaskSceneObject.name = "Face Mask";
        const faceMaskComponent = await this.addFaceMaskComponent(assetManager, faceMaskSceneObject, mainTexture);

        return faceMaskComponent;
    }

    async import(textureBytes: Uint8Array) {
        const model = app.findInterface(Editor.Model.IModel) as any;
        const assetManager = model.project.assetManager;

        let mainTexture = await assetManager.importExternalFileAsync(
            app.storage.createFile("FaceMask.jpg", textureBytes),
            new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets),
            Editor.Model.ResultType.Auto
        );
        mainTexture = mainTexture.primary;

        const effectsObject = this.findOrCreateEffectsObject(model);
        await this.createFaceMask(model, effectsObject, mainTexture);

        return new Promise<void>((resolve) => {
            resolve();
        });
    }

    private findOrCreateEffectsObject(model: Editor.Model.IModel): Editor.Model.SceneObject {
        const scene = model.project.scene as Editor.Assets.Scene;
        let effects = scene.sceneObjects.find((object: Editor.Model.SceneObject) => object.name === "Effects");
        if (effects) {
            return effects;
        }

        effects = model.project.scene.addSceneObject(scene.mainCamera.sceneObject);
        effects.name = "Effects";

        return effects;
    }
}
