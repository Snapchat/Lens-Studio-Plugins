import {CoreService} from 'LensStudio:CoreService';
import {UsageFinder} from "./UsageFinder.js";
import {EntitiesSelector} from "./EntitiesSelector.js";
import {EntityFromContextExtractor} from "./EntityFromContextExtractor.js";

export class FindUsageContextMenuItemService extends CoreService {
    static descriptor() {
        return {
            id: "Com.Snap.FindUsageContextMenuItemService",
            name: "Service Managing Find Usage Action",
            description: "Looks for references of particular asset in Scene",
        }
    }

    constructor(pluginSystem) {
        super(pluginSystem)
        this.usageFinder = new UsageFinder(pluginSystem);
        this.sceneObjectSelector = new EntitiesSelector(pluginSystem);
        this.entityExtractor = new EntityFromContextExtractor();
        this.supportedContextMap = this.createSupportedContextMap();
    }

    createSupportedContextMap(){
        return {
            "ObjectContext": true,
            "AssetContext": true
        };
    }

    createContextAction(context) {
        if (!this.isContextSupported(context) || context.selection.length !== 1) {
            return new Editor.ContextAction();
        }

        let assets = this.entityExtractor.extractEntitiesFromContext(context);
        if (assets.length !== 1){
            return new Editor.ContextAction();
        }

        let action = new Editor.ContextAction()
        action.id = "Action.FindUsage"
        action.caption = "Find Usage"
        action.descriptor = "Looks for references of particular entity in Scene"
        action.group = [];
        action.apply = () => {
            let usages = this.usageFinder.findUsage(assets[0]);
            console.log(`Found ${usages.length} usages`);
            this.sceneObjectSelector.collapseAll();
            this.sceneObjectSelector.selectEntities(usages);
        }
        return action;
    }

    start() {
        const actionsRegistry = this.findInterface(Editor.IContextActionRegistry)
        this.guard = []
        this.guard.push(actionsRegistry.registerAction((context) => this.createContextAction(context)))
    }

    stop() {
        this.guard = []
    }

    findInterface(interfaceID) {
        return this.pluginSystem.findInterface(interfaceID)
    }

    isContextSupported(context){
        return !!this.supportedContextMap[context.getTypeName()];
    }
}
