import {GuiService} from 'LensStudio:GuiService';
import * as Ui from 'LensStudio:Ui';
import * as SysInfo from 'LensStudio:SysInfo';
import {UsageFinder} from "./UsageFinder.js";
import {EntitiesSelector} from "./EntitiesSelector.js";
import {EntityFromContextExtractor} from "./EntityFromContextExtractor.js";

const isMac = () => SysInfo.productType === "macos";
const FIND_USAGE_KEY = "Ctrl+U";
const FIND_USAGE_CAPTION = () => (isMac() ? "⌘U" : "Ctrl+U");

export class FindUsageContextMenuItemService extends GuiService {
    static descriptor() {
        return {
            id: "Com.Snap.FindUsageContextMenuItemService",
            name: "Service Managing Find Usage Action",
            description: "Looks for references of particular asset in Scene",
        }
    }

    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor)
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
        action.caption = `Find Usage\t${FIND_USAGE_CAPTION()}`
        action.descriptor = "Looks for references of particular entity in Scene"
        action.group = [];
        action.apply = () => this.runFindUsage(assets[0]);
        return action;
    }

    runFindUsage(entity) {
        const usages = this.usageFinder.findUsage(entity);
        console.log(`Found ${usages.length} usages`);
        this.sceneObjectSelector.collapseAll();
        this.sceneObjectSelector.selectEntities(usages);
    }

    start() {
        const actionsRegistry = this.findInterface(Editor.IContextActionRegistry)
        this.guard = []
        this.guard.push(actionsRegistry.registerAction((context) => this.createContextAction(context)))

        const gui = this.findInterface(Ui.IGui)
        if (gui) {
            const mainWindow = gui.createWidget()
            const shortcut = new Ui.Shortcut(mainWindow, FIND_USAGE_KEY, Ui.ShortcutContext.ApplicationShortcut)
            this.guard.push(shortcut.onActivated.connect(() => {
                const selection = this.findInterface(Editor.Model.IModel)?.project?.selection
                const assets = selection?.assets ?? []
                const sceneObjects = selection?.sceneObjects ?? []
                const entities = [...assets, ...sceneObjects]
                if (entities.length === 1) this.runFindUsage(entities[0])
            }))
            this.guard.push(shortcut)
        }
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
