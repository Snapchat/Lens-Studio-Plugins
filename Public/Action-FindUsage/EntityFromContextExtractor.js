export class EntityFromContextExtractor {

    constructor() {
        this.extractorFuncMap = {
            "ObjectContext": (context) => this.extractSceneObjectsFromObjectContext(context),
            "AssetContext": (context) => this.extractAssetsFromAssetContext(context)
        }
    }

    extractEntitiesFromContext(context){
        let extractionFunc = this.extractorFuncMap[context.getTypeName()];
        if (!extractionFunc){
            return null;
        } else {
            return extractionFunc(context);
        }
    }

    extractSceneObjectsFromObjectContext(context){
        return context.selection.concat([]);
    }

    extractAssetsFromAssetContext(context){
        let assets = [];
        for (let contextItem of context.selection){
            if (contextItem.asset) {
                assets.push(contextItem.asset);
            }
        }
        return assets;
    }
}
