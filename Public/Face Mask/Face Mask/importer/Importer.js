import app from "../Application.js";
import * as FileSystem from 'LensStudio:FileSystem';
export class Importer {
    constructor() {
        this.tempDir = FileSystem.TempDir.create();
    }
    async importTextureAndCreateFaceMask(textureBytes, prompt, pluginSystemOverride) {
        const pluginSystem = pluginSystemOverride ?? app.pluginSystem;
        const model = pluginSystem.findInterface(Editor.Model.IModel);
        const assetManager = model.project.assetManager;
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
        const tempTexture = assetManager.importExternalFile(texturePath, new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets), Editor.Model.ResultType.Auto);
        const faceMaskPackage = assetManager.importExternalFile(new Editor.Path(import.meta.resolve("./Resources/FaceMask.lspkg")), new Editor.Model.SourcePath(new Editor.Path(""), Editor.Model.SourceRootDirectory.Assets), Editor.Model.ResultType.Unpacked);
        assetManager.move(tempTexture.primary.fileMeta, new Editor.Model.SourcePath(faceMaskPackage.path, Editor.Model.SourceRootDirectory.Assets));
        let nativePackageDescriptorFile;
        for (let i = 0; i < faceMaskPackage.files.length; i++) {
            const file = faceMaskPackage.files[i];
            if (file.primaryAsset.type === "NativePackageDescriptor") {
                nativePackageDescriptorFile = file.primaryAsset;
            }
        }
        let materialPath = faceMaskPackage.path.appended(new Editor.Path("Face Mask.mat"));
        let materialMeta = assetManager.getFileMeta(new Editor.Model.SourcePath(materialPath, Editor.Model.SourceRootDirectory.Assets));
        let material = materialMeta.primaryAsset;
        const mainTexParam = new Editor.Assets.TextureParameter(tempTexture.primary.id);
        //@ts-ignore
        material.passInfos[0].baseTex = mainTexParam;
        // Export the package to temp folder and re-import it unpacked to Assets
        const actionManager = pluginSystem.findInterface(Editor.IPackageActions);
        const exportOptions = new Editor.Model.ExportOptions();
        const exportPath = this.tempDir.path.appended(new Editor.Path(`${textureName}.lspkg`));
        exportOptions.packagePolicy = Editor.Assets.PackagePolicy.CanBeUnpacked;
        actionManager.exportPackage(nativePackageDescriptorFile, exportPath, exportOptions);
        let unpackedFaceMaskPackage = assetManager.importExternalFile(exportPath, new Editor.Model.SourcePath(new Editor.Path("Generated Face Masks"), Editor.Model.SourceRootDirectory.Assets), Editor.Model.ResultType.Unpacked);
        assetManager.remove(new Editor.Model.SourcePath(faceMaskPackage.path, Editor.Model.SourceRootDirectory.Assets));
        const effectsObject = this.findOrCreateEffectsObject(model);
        const faceMaskSceneObject = scene.addSceneObject(effectsObject);
        faceMaskSceneObject.name = `Face Mask`;
        const faceMaskComponent = await this.addFaceMaskComponent(faceMaskSceneObject, unpackedFaceMaskPackage, pluginSystem);
        return {
            textureAsset: tempTexture.primary,
            sceneObject: faceMaskSceneObject,
            faceMaskComponent
        };
    }
    async addFaceMaskComponent(sceneObject, packageResult, pluginSystemOverride) {
        try {
            const pluginSystem = pluginSystemOverride ?? app.pluginSystem;
            const model = pluginSystem.findInterface(Editor.Model.IModel);
            const assetManager = model.project.assetManager;
            const materialPath = packageResult.path.appended(new Editor.Path("Face Mask.mat"));
            const materialMeta = assetManager.getFileMeta(new Editor.Model.SourcePath(materialPath, Editor.Model.SourceRootDirectory.Assets));
            const material = materialMeta.primaryAsset;
            // Add the FaceMask component with the material
            const faceMaskComponent = sceneObject.addComponent("FaceMaskVisual");
            faceMaskComponent.addMaterialAt(material, 0);
            return faceMaskComponent;
        }
        catch (e) {
            console.error("Failed to add FaceMaskComponent:", e);
            return undefined;
        }
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
