import {getModel} from "./HelperFunctions.js";

const SearchResult = {
    None: 0,
    NoUsage: 1,
    HasUsage: 2
}

export class UsageFinder {

    constructor (pluginSystem){
        this.pluginSystem = pluginSystem;
    }


    findUsage(entity){
        let root = getModel(this.pluginSystem);
        let project = root.project;
        if (!project){
            return;
        }

        let scene = project.scene;
        let sceneObjects = scene.sceneObjects;
        this.hasUsageSceneObjects = new Set();
        this.visited = {};
        this.result = {};

        for (let sceneObject of sceneObjects) {
            let isUsage = false;
            for (let component of sceneObject.components) {
                if (this.hasUsageEntity(component, entity)) {
                    isUsage = true;
                    break;
                }
            }
            if (isUsage) {
                this.hasUsageSceneObjects.add(sceneObject);
            }
        }

        if (entity.isOfType("ObjectPrefab")){
            let instances = entity.prefabInstances;
            let instancesMap = {};
            for (let instance of instances){
                instancesMap[instance.id.toString()] = true;
            }
            for (let sceneObject of sceneObjects){
                if (instancesMap[sceneObject.id.toString()]){
                    this.hasUsageSceneObjects.add(sceneObject);
                }
            }
        }

        let result = [];
        this.hasUsageSceneObjects.forEach((item) => {
            result.push(item);
        })

        return result;
    }

    hasUsageEntity(entity, entitySearchedFor){
        let uuidString = entity.id.toString();

        if (this.visited[uuidString]){
            return false;
        }

        this.visited[uuidString] = true;

        if (this.result[uuidString]){
            this.visited[uuidString] = false;
            return this.result[uuidString] === SearchResult.HasUsage;
        }

        if (entity.isSame(entitySearchedFor)){
            this.visited[uuidString] = false;
            this.result[uuidString] = SearchResult.HasUsage;
            return true;
        }

        if (entity.isOfType("SceneObject")){
            // We do not continue recursive search from SceneObject
            this.visited[uuidString] = false;
            return false;
        }

        let entitiesToSearch;
        if (entity.isOfType("ScriptAsset") && !entitySearchedFor.isOfType("ScriptAsset")){
            entitiesToSearch = []; // TODO: Remove this logic once ScriptAsset.resolveModules is faster
        } else {
            entitiesToSearch = entity.getDirectlyReferencedEntities();
        }

        for (let entityToSearch of entitiesToSearch){

            let result = this.hasUsageEntity(entityToSearch, entitySearchedFor);
            if (result){
                this.result[uuidString] = SearchResult.HasUsage;
                this.visited[uuidString] = false;
                return true;
            }
        }

        this.result[uuidString] = SearchResult.NoUsage;
        this.visited[uuidString] = false;
        return false;
    }
}
