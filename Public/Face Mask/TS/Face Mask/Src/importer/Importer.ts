import app from "../Application.js";
import * as FileSystem from 'LensStudio:FileSystem';

export interface FaceMaskImportResult {
    textureAsset: Editor.Assets.Asset;
    sceneObject: Editor.Model.SceneObject;
    faceMaskComponent: Editor.Components.FaceMaskVisual | undefined;
}

export class Importer {
    private tempDir: FileSystem.TempDir;

    constructor() {
        this.tempDir = FileSystem.TempDir.create();
    }

    async importTextureAndCreateFaceMask(textureBytes: Uint8Array, prompt: string, pluginSystemOverride?: Editor.PluginSystem): Promise<FaceMaskImportResult> {
        const pluginSystem: Editor.PluginSystem = pluginSystemOverride ?? (app.pluginSystem as Editor.PluginSystem);
        const model = pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
        const assetManager: Editor.Model.AssetManager = model.project.assetManager;
        const scene = model.project.scene;

        // We need to
        // 1. Create the texture file from the texture bytes
        // 2. Import the FaceMask packages (with other resources)
        // 3. Move the generated texture into the FaceMask packages
        // 4. Update the FaceMask material
        // 4. Export the package and re-import it as packed to Packages
        // 5. Create scene object with Face Mask component

        let textureName = prompt.replace(/[^a-zA-Z0-9\s]/g, "").trim().slice(0, 50).trim();
        if (!textureName) {
            textureName = "Face Mask";
        }
        const textureFileName = textureName + ".png";
        const texturePath = app.storage.createFile(textureFileName, textureBytes);

        // Import texture temporarily into the lspkg so the material can reference it
        const tempTexture = assetManager.importExternalFile(
            texturePath,
            new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets),
            Editor.Model.ResultType.Auto
        );

        const faceMaskPackage = assetManager.importExternalFile(
            new Editor.Path(import.meta.resolve("./Resources/FaceMask.lspkg")),
            new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets),
            Editor.Model.ResultType.Unpacked
        );

        assetManager.move(
            tempTexture.primary.fileMeta,
            new Editor.Model.SourcePath(faceMaskPackage.path, Editor.Model.SourceRootDirectory.Assets)
        );

        let nativePackageDescriptorFile: Editor.Assets.NativePackageDescriptor | undefined;
        for (let i = 0; i < faceMaskPackage.files.length; i++) {
            const file = faceMaskPackage.files[i];
            if (file.primaryAsset.type === "NativePackageDescriptor") {
                nativePackageDescriptorFile = file.primaryAsset as Editor.Assets.NativePackageDescriptor;
            }
        }

        let materialPath = faceMaskPackage.path.appended(new Editor.Path("Face Mask.mat"));
        let materialMeta = assetManager.getFileMeta(new Editor.Model.SourcePath(materialPath, Editor.Model.SourceRootDirectory.Assets));
        let material = materialMeta.primaryAsset as Editor.Assets.Material;
        const mainTexParam = new Editor.Assets.TextureParameter(tempTexture.primary.id);
        //@ts-ignore
        material.passInfos[0].baseTex = mainTexParam;

        // Export the package to temp folder and re-import it unpacked to Assets
        const actionManager = pluginSystem.findInterface(Editor.IPackageActions) as Editor.IPackageActions;
        const exportOptions = new Editor.Model.ExportOptions();
        const exportPath = this.tempDir.path.appended(new Editor.Path(`${textureName}.lspkg`));
        exportOptions.packagePolicy = Editor.Assets.PackagePolicy.CanBeUnpacked;
        actionManager.exportPackage(nativePackageDescriptorFile!, exportPath, exportOptions);

        let unpackedFaceMaskPackage = assetManager.importExternalFile(
            exportPath,
            new Editor.Model.SourcePath(new Editor.Path("Generated Face Masks"), Editor.Model.SourceRootDirectory.Assets),
            Editor.Model.ResultType.Unpacked
        );

        assetManager.remove(new Editor.Model.SourcePath(faceMaskPackage.path, Editor.Model.SourceRootDirectory.Assets));

        const effectsObject = this.findOrCreateEffectsObject(model);
        const faceMaskSceneObject = scene.addSceneObject(effectsObject) as Editor.Model.SceneObject;
        faceMaskSceneObject.name = `Face Mask`;
        const faceMaskComponent = await this.addFaceMaskComponent(faceMaskSceneObject, unpackedFaceMaskPackage, pluginSystem);

        return {
            textureAsset: tempTexture.primary,
            sceneObject: faceMaskSceneObject,
            faceMaskComponent
        };
    }

    async addFaceMaskComponent(sceneObject: Editor.Model.SceneObject, packageResult: Editor.Model.ImportResult, pluginSystemOverride?: Editor.PluginSystem): Promise<Editor.Components.FaceMaskVisual | undefined> {
        try {
            const pluginSystem: Editor.PluginSystem = pluginSystemOverride ?? (app.pluginSystem as Editor.PluginSystem);
            const model = pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
            const assetManager: Editor.Model.AssetManager = model.project.assetManager;

            const materialPath = packageResult.path.appended(new Editor.Path("Face Mask.mat"));
            const materialMeta = assetManager.getFileMeta(
                new Editor.Model.SourcePath(materialPath, Editor.Model.SourceRootDirectory.Assets)
            );
            const material = materialMeta.primaryAsset as Editor.Assets.Material;

            // Add the FaceMask component with the material
            const faceMaskComponent = sceneObject.addComponent("FaceMaskVisual") as Editor.Components.FaceMaskVisual;
            faceMaskComponent.addMaterialAt(material, 0);
            return faceMaskComponent;
        } catch (e: any) {
            console.error("Failed to add FaceMaskComponent:", e);
            return undefined;
        }
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
