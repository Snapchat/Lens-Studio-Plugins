import {OptimizationOptionType} from "./OptimizationOptions.js";
import * as fs from 'LensStudio:FileSystem';

export class ProjectOptimizer {

    constructor (pluginSystem, project){
        this.pluginSystem = pluginSystem;
        this.project = project
    }

    optimizeProject(optimizationOptions){
        let time = new Date();
        if (!this.project){
            return;
        }
        this.tryRemoveSceneObjects(optimizationOptions);
        this.tryRemoveLightSources(optimizationOptions);
        this.tryRemoveRenderLayers(optimizationOptions);
        this.tryRemoveAssets(optimizationOptions);
        this.tryRemoveEmptyFolders(optimizationOptions);
        console.log(`Project optimized in ${new Date().getTime() - time.getTime()} ms.`)
    }

    tryRemoveLightSources(optimizationOptions){
        let option = optimizationOptions[OptimizationOptionType.LightSource];
        if (!option || !option.enabled){
            return;
        }

        let renderLayersOfBMVLayerSet = Editor.Model.LayerSet.fromMask(0);
        if (!renderLayersOfBMVLayerSet.isEmpty()){
            throw new Error("Initial layer set should be empty");
        }
        /**
         *
         * @type {SceneObject[]}
         */
        let allSceneObjectsWithLightSource = [];
        let traverse = (sceneObjects) => {
            for (let i = 0; i < sceneObjects.length; i++){
                let sceneObject = sceneObjects[i];
                let meshVisuals = sceneObject.getComponents("BaseMeshVisual");
                if (meshVisuals.length){
                    renderLayersOfBMVLayerSet = renderLayersOfBMVLayerSet.union(
                        Editor.Model.LayerSet.fromId(sceneObject.layer))
                }
                let lightSources = sceneObject.getComponents("LightSource");
                if (lightSources.length) {
                    allSceneObjectsWithLightSource.push(sceneObject);
                }
                traverse(sceneObject.children);
            }
        }
        traverse(this.project.scene.rootSceneObjects);
        let removedLightSources = 0;
        for (let sceneObject of allSceneObjectsWithLightSource){
            let lightSources = sceneObject.getComponents("LightSource");
            for (let i = 0; i < lightSources.length; i++){
                let lightSource = lightSources[i];
                let layerSetOfLightSource = lightSource.renderLayer;
                if (renderLayersOfBMVLayerSet.intersect(layerSetOfLightSource).isEmpty()){
                    let indexOfComponent = sceneObject.indexOfComponent(lightSource);
                    sceneObject.removeComponentAt(indexOfComponent);
                    removedLightSources++;
                }
            }
        }
        console.log("Removed unused light sources: " + removedLightSources);
    }

    tryRemoveSceneObjects(optimizationOptions){
        let option = optimizationOptions[OptimizationOptionType.SceneObject];
        if (!option || !option.enabled){
            return;
        }
        let removedDisabledSceneObjects = 0;
        let traverseAndRemoveSceneObjects = (sceneObjects) => {
            for (let i = 0; i < sceneObjects.length; i++){
                if (option.filter(sceneObjects[i])){
                    sceneObjects[i].destroy();
                    removedDisabledSceneObjects++;
                } else {
                    traverseAndRemoveSceneObjects(sceneObjects[i].children);
                }
            }
        };
        traverseAndRemoveSceneObjects(this.project.scene.rootSceneObjects);
        console.log("Removed disabled scene objects: " + removedDisabledSceneObjects);
    }

    tryRemoveRenderLayers(optimizationOptions){
        let option = optimizationOptions[OptimizationOptionType.RenderLayer];
        if (!option || !option.enabled){
            return;
        }
        let usedRenderLayersLayerSet = Editor.Model.LayerSet.fromMask(0);
        if (!usedRenderLayersLayerSet.isEmpty()){
            throw new Error("Expected empty LayerSet after creation");
        }
        let traverseAndGetRenderLayers = (sceneObjects) => {
            for (let i = 0; i < sceneObjects.length; i++){
                let renderLayer = sceneObjects[i].layer;
                let layerSet = Editor.Model.LayerSet.fromId(renderLayer);
                usedRenderLayersLayerSet = usedRenderLayersLayerSet.union(layerSet);
                if (sceneObjects[i].children.length) {
                    traverseAndGetRenderLayers(sceneObjects[i].children)
                }
            }
        }
        traverseAndGetRenderLayers(this.project.scene.rootSceneObjects);
        /**
         *
         * @param layer {LayerSet}
         * @returns {boolean}
         */
        let notUsed = (layer) => {
            return usedRenderLayersLayerSet.intersect(layer).isEmpty();
        }
        let layers = this.project.scene.layers;
        let allLayersLayerIds = layers.combinedIds;
        let layerIdArray = allLayersLayerIds.toArray();
        let toRemove = [];
        let defaultAndOrthoSet = Editor.Model.LayerSet.fromId(Editor.Model.LayerId.Default);
        defaultAndOrthoSet = defaultAndOrthoSet.union(Editor.Model.LayerSet.fromId(Editor.Model.LayerId.Ortho));
        for (let layer of layerIdArray){
            let layerSet = Editor.Model.LayerSet.fromId(layer);
            if (notUsed(layerSet) && layerSet.intersect(defaultAndOrthoSet).isEmpty()){
                toRemove.push(layer);
            }
        }
        let removedLayers = 0;
        for (let layer of toRemove){
            layers.remove(layer);
            removedLayers++;
        }
        console.log("Removed unused layers: " + removedLayers);
    }

    tryRemoveAssets(optimizationOptions){
        let option = optimizationOptions[OptimizationOptionType.Asset];
        if (!option || !option.enabled){
            return;
        }
        let usedUuids = this.collectUsedUuids();
        let allAssets = this.getAllAssets();
        /**
         *
         * @type {Set<string>}
         */
        let unusedSources = new Set();
        for (let asset of allAssets){
            // first we add all sources to this set and then we remove used ones
            unusedSources.add(asset.fileMeta.sourcePath.toString());
            // it is important to use strings in order for set to correctly work with the same paths
        }
        let usedAssets = allAssets.filter((asset) => {
            return usedUuids[asset.id.toString()];
        });

        for (let asset of allAssets){
            if (!option.filter(asset)){
                unusedSources.delete(asset.fileMeta.sourcePath.toString());
            }
        }

        for (let usedAsset of usedAssets){
            unusedSources.delete(usedAsset.fileMeta.sourcePath.toString());
        }

        this.removeSources(unusedSources);
    }

    tryRemoveEmptyFolders(optimizationOptions){
        let option = optimizationOptions[OptimizationOptionType.Directory];
        if (!option || !option.enabled){
            return;
        }
        this.removeEmptyFolders();
    }

    collectUsedUuids(){
        let scene = this.project.scene;
        let sceneObjects = scene.sceneObjects;
        let usedUuids = {};
        for (let sceneObject of sceneObjects){
            for (let component of sceneObject.components){
                this.traverseReferences(component, usedUuids);
            }
        }
        this.collectUsedPrefabs(sceneObjects, usedUuids);
        return usedUuids;
    }

    collectUsedPrefabs(sceneObjects, outUsedUuids){
        let objectPrefabs = this.getAllAssets().filter((item) => {
            return item.isOfType("ObjectPrefab");
        })
        let sceneObjectMap = {};
        for (let sceneObject of sceneObjects){
            sceneObjectMap[sceneObject.id.toString()] = true;
        }
        let isPrefabUsed = (prefab) => {
            if (outUsedUuids[prefab.id.toString()]){
                return true;
            }
            let instances = prefab.prefabInstances;
            for (let instance of instances){
                if (sceneObjectMap[instance.id.toString()]){
                    return true;
                }
            }
            return false;
        }
        for (let prefab of objectPrefabs){
            if (isPrefabUsed(prefab)){
                outUsedUuids[prefab.id.toString()] = true;
            }
        }
    }

    traverseReferences(entity, outUsedUuids){
        if (outUsedUuids[entity.id.toString()]){
            return;
        }
        outUsedUuids[entity.id.toString()] = true;
        let directReferences = entity.getDirectlyReferencedEntities();
        for (let entity of directReferences){
            this.traverseReferences(entity, outUsedUuids);
        }
    }

    getAllAssets(){
        return this.project.assetManager.assets;
    }

    /**
     * @param sourcePathSet {Set<string>}
     */
    removeSources(sourcePathSet){
        let removed = 0;
        let sceneSourceString = this.project.scene.fileMeta.sourcePath.toString();
        sourcePathSet.forEach((sourcePath) => {
            if (sourcePath === sceneSourceString){
                return;
            }
            try {
                this.project.assetManager.remove(new Editor.Path(sourcePath));
                removed++;
            } catch (e) {
                console.error(`Failed to remove source: ${sourcePath}. Reason: ${e.message}`);
            }
        });
        console.log("Removed source files: " + removed);
    }

    removeEmptyFolders(){
        let assetsDirectory = this.project.assetsDirectory;
        let result = this.traverseChildren(assetsDirectory, fs.readDir(assetsDirectory, {})
            .map((item) => assetsDirectory.appended(item)));
        console.log("Removed empty directories: " + result.totalRemoved);
    }

    /**
     *
     * @param assetsDirectory
     * @param path
     * @returns {{totalRemoved: number, parentRemoved: boolean}}
     */
    removeEmptyFoldersRecursive(assetsDirectory, path){
        let filesAndDirs = fs.readDir(path, {});
        filesAndDirs = filesAndDirs.map((relPath) => {
            return path.appended(relPath);
        })
        if (filesAndDirs.length === 0){
            this.project.assetManager.remove(path.relative(assetsDirectory));
            return {
                parentRemoved: true,
                totalRemoved: 1
            };
        }
        let traverseResult = this.traverseChildren(assetsDirectory, filesAndDirs);
        if (traverseResult.directChildrenRemoved === filesAndDirs.length){
            this.project.assetManager.remove(path.relative(assetsDirectory));
            return {
                parentRemoved: true,
                totalRemoved: traverseResult.totalRemoved + 1
            }
        }
        return {
            parentRemoved: false,
            totalRemoved: traverseResult.totalRemoved
        }
    }

    /**
     *
     * @param assetsDirectory
     * @param childrenFilesOrDirs
     * @returns {{totalRemoved: number, directChildrenRemoved: number}}
     */
    traverseChildren(assetsDirectory, childrenFilesOrDirs){
        let totalRemoved = 0;
        let directChildrenRemoved = 0;
        for (let fileOrDir of childrenFilesOrDirs){
            if (fs.isDirectory(fileOrDir)){
                let subResult = this.removeEmptyFoldersRecursive(assetsDirectory, fileOrDir);
                if (subResult.parentRemoved){
                    directChildrenRemoved++;
                }
                totalRemoved += subResult.totalRemoved;
            }
        }
        return {
            totalRemoved: totalRemoved,
            directChildrenRemoved: directChildrenRemoved
        }
    }
}
