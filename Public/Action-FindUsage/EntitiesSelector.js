import {getModel} from "./HelperFunctions.js";

export class EntitiesSelector {
    constructor(pluginSystem) {
        this.modelRoot = getModel(pluginSystem);
    }

    collapseAll(){

    }

    selectEntities(selection){
        this.modelRoot.project.selection.set(selection);
    }
}
