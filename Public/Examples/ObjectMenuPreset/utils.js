export default class Utils {

    /**
     * Adds an image component to a scene object.
     * If the image component does not exist, it creates a new one with the provided material and stretch mode.
     *
     * @param {Editor.Model.AssetManager} assetManager - The asset manager.
     * @param {Editor.Model.SceneObject} sceneObject - The scene object to which the image component will be added.
     */
    static async addImageComponent(assetManager, sceneObject) {
        try {
            /** @type {Editor.Components.Image} */
            const image = sceneObject.addComponent("Image");
            const material = await Utils.createImageMaterial(assetManager);
            image.materials = [material];
            image.stretchMode = Editor.Components.StretchMode.Fit;
            return image;
        } catch (e) {
            console.error(e.message  + " " + e.stack);
        }
    }

    /**
     * Creates an image material with a shader graph and an image texture.
     * @param {Editor.Model.AssetManager} assetManager - The asset manager.
     */
    static async createImageMaterial(assetManager) {
        // Get the absolute path of the shader graph file.
        const absoluteGraphPath = new Editor.Path(import.meta.resolve("Resources/flat.ss_graph"));
        // Import the file and get the metadata of the asset.
        /** @type {Editor.Model.ImportResult} */
        const importResultGraph = await assetManager.importExternalFileAsync(absoluteGraphPath, new Editor.Path("Shader Graphs"), Editor.Model.ResultType.Auto);
        // Get the absolute path of the image file.
        const absoluteImagePath = new Editor.Path(import.meta.resolve("Resources/Image.png"));
        // Import the file and get the metadata of the asset.
        /** @type {Editor.Model.ImportResult} */
        const importRestultImage = await assetManager.importExternalFileAsync(absoluteImagePath, new Editor.Path("Textures"), Editor.Model.ResultType.Auto);
        // Get asset for the material.
        const material = assetManager.createNativeAsset("Material", "Image Material", new Editor.Path("Materials"));
        if (!material) {
            throw new Error("Failed to create material");
        }
        // Get the pass info from the graph.
        const passInfo = material.addPass(importResultGraph.primary);
        // Enable the shader define for the base texture.
        Utils.addDefine(passInfo, "ENABLE_BASE_TEX");
        const baseTexParam = new Editor.Assets.TextureParameter(importRestultImage.primary.id);
        // Set the base texture parameter in the shader pass.
        passInfo.baseTex = baseTexParam;
        return material;
    }

    // Adds a define to the shader pass.
    static addDefine(passInfo, define) {
        const defines = passInfo.defines;
        defines.push(define);
        passInfo.defines = defines;
    }

    /**
     * Searches the root scene object for a scene object with an orthographic camera component.
     * @param {Editor.Model.IModel} model - The model component.
     * @returns {Editor.Model.SceneObject|null} - The orthographic camera object if found, or null if not found.
     */
    static getOrthoCameraObject(model) {
        console.log("Checking scene for orthographic cameras");
        const scene = model.project.scene;
        let cameraObject = null;
        scene.rootSceneObjects.forEach(element => {
            element.components.forEach(component => {
                //@ts-expect-error
                if (component.getTypeName() == "Camera" && component.cameraType == Editor.Components.CameraType.Orthographic) {
                    console.log("Found orthographic camera");
                    cameraObject = element;
                }
            });
        });
        return cameraObject;
    }

    static createOrthoCamera(scene, sceneObject) {
        console.log("Creating new orthographic camera");
        const camera = sceneObject.addComponent("Camera");
        camera.renderLayer = Editor.Model.LayerSet.fromId(Editor.Model.LayerId.Ortho);
        camera.cameraType = Editor.Components.CameraType.Orthographic;
        camera.renderTarget = scene.captureTarget;
        sceneObject.name = "Orthographic Camera";
        return sceneObject;
    }

    // Creates a screen image based on the provided model and scene object.
    static async createScreenImage(model, sceneObject) {
        console.log("Creating screen image");
        let addScreenRegion = true;

        sceneObject.getParent().components.forEach(component => {
            if (component.getTypeName() == "ScreenTransform") {
                console.log("Scene object has a screen transform");
                addScreenRegion = false;
            }
        });
        // Add a screen transform component to the scene object.
        sceneObject.addComponent("ScreenTransform");

        const assetManager = model.project.assetManager;
        const scene = model.project.scene;

        if (addScreenRegion) {
            sceneObject.name = "Full Frame Region";
            const screenRegion = sceneObject.addComponent("ScreenRegionComponent");
            screenRegion.region = Editor.Components.ScreenRegionType.FullFrame;
            const screenImageObject = scene.addSceneObject(sceneObject);
            screenImageObject.name = "Screen Image";
            screenImageObject.layer = Editor.Model.LayerId.Ortho;
            /** @type {Editor.Components.ScreenTransform} */
            const screenTransformComponent = screenImageObject.addComponent("ScreenTransform");
            //set the z position of the screen image to -1
            const tr = screenTransformComponent.transform;
            tr.position = new vec3(0, 0, -1);
            screenTransformComponent.transform = tr;
            //add the image component to the screen image object
            console.log("Adding image component to screen image object");
            const image = Utils.addImageComponent(assetManager, screenImageObject);
            return image;
        } else {
            sceneObject.name = "Screen Image";
            sceneObject.layer = Editor.Model.LayerId.Ortho;
            console.log("Adding image component to screen object");
            const image = Utils.addImageComponent(assetManager, sceneObject);
            return image;
        }
    }
}
