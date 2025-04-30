import { AssetInstantiator, Descriptor }  from 'LensStudio:AssetInstantiator';

export class DefaultAssetInstantiator extends AssetInstantiator {
    static descriptor() {
        const descriptor = new Descriptor();
        descriptor.id = 'Com.Company.DefaultAssetInstantiator';
        descriptor.dependencies = [];
        descriptor.name = 'Package Instantiator';
        descriptor.description = 'Instantiator for Studio Packages';
        
        descriptor.canInstantiate = (asset) => {
            if(asset.type != "NativePackageDescriptor") return false;
            const setupScript = asset.setupScript.code;
            return setupScript.length > 0;

        };
        return descriptor;
    }
    
    instantiate(asset, scene, target) {
        const instantiateFunc = createFunctionObject(asset.setupScript.code, "defaultAssetInstantiatorFunc");
        let model = this.pluginSystem.findInterface(Editor.Model.IModel);
        instantiateFunc(asset, scene, target, model);
        return {};
    }
    
}
