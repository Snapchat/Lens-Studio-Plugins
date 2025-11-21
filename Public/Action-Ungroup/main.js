import {CoreService} from 'LensStudio:CoreService';

export class ObjectMenuItemService extends CoreService {
    static descriptor() {
        return {
            id: "Com.YourCompany.ObjectMenuItemService",
            name: "Service Managing Ungroup Action",
            description: "No details",
        }
    }

    /**
     * @param {Editor.PluginSystem} pluginSystem
     */
    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor)
    }


    ungroup(node) {
        if (node == null) {
            return
        }
        let parent = node.getParent()
        let stack = []
        let members = []
        stack.push(node)
        let idx = 0;
        while (stack.length > 0) {
            let sceneObject = stack.pop()
            members.push(sceneObject)
            idx = sceneObject.children.length - 1
            sceneObject.children.forEach(() => {
                let child = sceneObject.children[idx]
                stack.push(child)
                idx--
            })
        }
        idx = parent == null ? node.topOwner.getRootObjectIndex(node) : parent.indexOfChild(node)
        members.forEach(member => {
            node.topOwner.reparentSceneObject(member, parent, idx)
            idx++
        })
    }

    /**
     * @param {{ isOfType: (arg0: string) => any; selection: any[]; }} context
     */
    createObjectAction(context) {
        if(!context.isOfType("ObjectContext")) {
            return new Editor.ContextAction();
        }
        let action = new Editor.ContextAction()
        action.id = "Action.UngroupAction"
        action.caption = "Ungroup"
        action.description = "Ungroups a scene object hierarchy"
        action.group = []
        action.apply = () => {
            context.selection.forEach((/** @type {any} */ el) => {
                this.ungroup(el)
            })
        }
        return action
    }

    start() {
        console.log("Starting Ungroup Action core service")
        /**
         * @type {Editor.ContextActionRegistry}
         */
        const actionsRegistry = this.pluginSystem.findInterface(Editor.IContextActionRegistry)
        /**
         * @type {any[]}
         */
        this.guard = []
        this.guard.push(actionsRegistry.registerAction((/** @type {any} */ context) => this.createObjectAction(context)))
    }

    stop() {
        /**
         * @type {any[]}
         */
        this.guard = []
    }
}
