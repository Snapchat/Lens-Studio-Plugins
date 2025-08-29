import { NodeHandler, ProcessorContext } from './Handlers.js'
import * as utils from '../utils/generalUtils.js'
import { logger } from '../utils/FigmaUtils.js'
import UserPrefManager from '../services/UserPrefManager.js'

type ScreenTransformData = {
    anchor: Editor.Rect
    offset: Editor.Rect
    position: vec3
    rotation: vec3
    scale: vec3
}

export default class TransformHandler extends NodeHandler {

    verbose = false

    //main entry function
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async process(nodeContext: ProcessorContext, globalContext: GlobalContext) {
        const data = this.convertNodeToScreenTransformData(nodeContext.node, nodeContext.parentNode)
        const screenTransform = nodeContext.screenTransform
        this.applyScreenTransformDataToScreenTransform(screenTransform, data)
    }

    private applyScreenTransformDataToScreenTransform(screenTransform: Editor.Components.ScreenTransform, data: ScreenTransformData) {
        //set transform as use advanced because we are setting the values manually
        screenTransform.advanced = true

        const transform = screenTransform.transform
        transform.position = data.position
        transform.rotation = data.rotation
        transform.scale = data.scale
        screenTransform.transform = transform
        //apply data to screen transform
        screenTransform.anchor = data.anchor
        screenTransform.offset = data.offset
    }

    private convertNodeToScreenTransformData(node: Figma.Node, parentNode: Figma.Node | null): ScreenTransformData {

        //check if node or parentNode is a DOCUMENT or CANVAS node
        if (node.type === 'DOCUMENT' || node.type === 'CANVAS' || parentNode?.type === 'DOCUMENT' || parentNode?.type === 'CANVAS') {
            throw new Error('convertNodeToScreenTransformData: node or parentNode is a DOCUMENT or CANVAS node. This is not supported.')
        }

        // Default ScreenTransformData
        const output: ScreenTransformData = {
            anchor: Editor.Rect.create(-1, 1, -1, 1),
            offset: Editor.Rect.create(0, 0, 0, 0),
            //these basic transform values would just be the identity matrix
            position: new vec3(0, 0, 0), rotation: new vec3(0, 0, 0), scale: new vec3(1, 1, 1),
        }

        //if parent node doesnt exist it means this is the root node.
        //if constraints doesnt exist it means this node is...werid!
        if (!parentNode || !('constraints' in node)) {
            //TODO: need to handle cases without Constraints like Union type.
            return output
        }

        //for easier access
        const constraints = node.constraints

        //////////////////////////// deal with contraints ////////////////////////////
        //the pixel needs to be in 1x. meaning that a iphone 8 would be 375x667
        function unitConversion(pixel: number): number {
            const v = UserPrefManager.readPref('figma_canvas_scaler')
            const scaler = parseInt(v, 10)
            if (isNaN(scaler)) throw new Error(`userConfig.figma_canvas_scaler is not a number. It is ${v}`)
            return pixel * (2 / scaler)
        }

        // Prepare all the necessary data
        // group value together for easier access
        const parentSpecPx = {
            w: parentNode.absoluteBoundingBox.width,
            h: parentNode.absoluteBoundingBox.height,
        }
        const nodeSpecPx = {
            w: node.absoluteBoundingBox.width,
            h: node.absoluteBoundingBox.height,
            x: node.absoluteBoundingBox.x - parentNode.absoluteBoundingBox.x,
            y: node.absoluteBoundingBox.y - parentNode.absoluteBoundingBox.y,
        }
        /////// now the main calculation ///////

        // calculate horizontal
        const {
            anchorLeft,
            anchorRight,
            offsetLeft,
            offsetRight
        } = this.getScreenTransformDataFromHorizontal(constraints.horizontal, nodeSpecPx, parentSpecPx, unitConversion)

        // calculate vertical
        const {
            anchorBottom,
            anchorTop,
            offsetBottom,
            offsetTop
        } = this.getScreenTransformDataFromVertical(constraints.vertical, nodeSpecPx, parentSpecPx, unitConversion)

        //apply these
        output.anchor = Editor.Rect.create(anchorLeft, anchorRight, anchorBottom, anchorTop)
        output.offset = Editor.Rect.create(offsetLeft, offsetRight, offsetBottom, offsetTop)

        if (this.verbose) logger.debug(`${node.name}::: constraints : ${constraints.horizontal} ${constraints.vertical}. anchor:: left: ${anchorLeft} top: ${anchorTop} right: ${anchorRight} bottom: ${anchorBottom}. offset:: left: ${offsetLeft} top: ${offsetTop} right: ${offsetRight} bottom: ${offsetBottom}`)

        return output
    }

    private getScreenTransformDataFromVertical(
        directionalConstraints: ('TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE'),
        nodeSpecPx: { w: number, h: number, x: number, y: number },
        parentSpecPx: { w: number, h: number },
        unitConversionFunc: (pixel: number) => number
    ) {
        let anchorBottom = -1
        let anchorTop = 1
        let offsetBottom = 0
        let offsetTop = 0

        if (this.verbose) logger.debug(`calculating the vertical constraints for ${directionalConstraints}`)

        const heightInWorldUnit = unitConversionFunc(nodeSpecPx.h)
        switch (directionalConstraints) {
            case 'BOTTOM':
                //CHECKED
                anchorBottom = -1
                anchorTop = -1
                offsetBottom = unitConversionFunc(parentSpecPx.h - nodeSpecPx.y - nodeSpecPx.h) // Correct bottom padding
                offsetTop = offsetBottom + heightInWorldUnit
                if (this.verbose) logger.debug(`BOTTOM: anchorBottom: ${anchorBottom}, anchorTop: ${anchorTop}, offsetBottom: ${offsetBottom}, offsetTop: ${offsetTop}`)
                break
            case 'TOP':
                //stData.anchor.left = stData.anchor.right = 1
                anchorBottom = 1
                anchorTop = 1
                offsetTop = -unitConversionFunc(nodeSpecPx.y)
                offsetBottom = offsetTop - heightInWorldUnit
                if (this.verbose) logger.debug(`TOP: anchorBottom: ${anchorBottom}, anchorTop: ${anchorTop}, offsetBottom: ${offsetBottom}, offsetTop: ${offsetTop}`)
                break
            //position proportional to parent. width is fixed.
            case 'CENTER': {
                const center = (nodeSpecPx.y + nodeSpecPx.h / 2) / parentSpecPx.h
                anchorBottom = anchorTop = utils.remap(center, 0, 1, 1, -1)
                offsetBottom = -heightInWorldUnit / 2
                offsetTop = heightInWorldUnit / 2
                if (this.verbose) logger.debug(`CENTER: anchorBottom: ${anchorBottom}, anchorTop: ${anchorTop}, offsetBottom: ${offsetBottom}, offsetTop: ${offsetTop}`)
                break
            }
            //position proportional to parent. width is proportional to parent.
            case 'SCALE':
                anchorBottom = utils.remap(nodeSpecPx.y / parentSpecPx.h, 0, 1, -1, 1)
                anchorTop = utils.remap((nodeSpecPx.y + nodeSpecPx.h) / parentSpecPx.h, 0, 1, -1, 1)
                break
            //left to edge is in fixed pixel, right to edge is in fixed pixel. width is calculated from previous two.
            case 'TOP_BOTTOM':
                //CHECKED
                //leave anchor value intact (full frame setting)
                offsetBottom = unitConversionFunc(nodeSpecPx.y + nodeSpecPx.h)
                offsetTop = -unitConversionFunc(nodeSpecPx.y)
                if (this.verbose) logger.debug(`TOP_BOTTOM: anchorBottom: ${anchorBottom}, anchorTop: ${anchorTop}, offsetBottom: ${offsetBottom}, offsetTop: ${offsetTop}`)
                break
            default:
                logger.debug(`Unknown directionalConstraints: ${directionalConstraints}`)
                break
        }

        if (this.verbose) logger.debug(`returning from getScreenTransformDataFromVertical: anchorBottom: ${anchorBottom}, anchorTop: ${anchorTop}, offsetBottom: ${offsetBottom}, offsetTop: ${offsetTop}`)
        return {
            anchorBottom,
            anchorTop,
            offsetBottom,
            offsetTop
        }
    }

    private getScreenTransformDataFromHorizontal(
        directionalConstraints: ('LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE'),
        nodeSpecPx: { w: number, h: number, x: number, y: number },
        parentSpecPx: { w: number, h: number },
        unitConversionFunc: (pixel: number) => number
    ) {

        let anchorLeft = -1
        let anchorRight = 1
        let offsetLeft = 0
        let offsetRight = 0

        const widthInWorldUnit = unitConversionFunc(nodeSpecPx.w)
        switch (directionalConstraints) {
            //left or bottom to edge is in fixed pixel. size is fixed.
            case 'LEFT':
                anchorLeft = -1
                anchorRight = -1
                offsetLeft = unitConversionFunc(nodeSpecPx.x) // Left padding
                offsetRight = offsetLeft + widthInWorldUnit
                break
            //right or top to edge is in fixed pixel. size is fixed.
            case 'RIGHT':
                anchorLeft = 1
                anchorRight = 1
                offsetLeft = -unitConversionFunc(parentSpecPx.w - nodeSpecPx.x)
                offsetRight = offsetLeft + widthInWorldUnit
                break
            //position proportional to parent. width is fixed.
            case 'CENTER': {
                const center = (nodeSpecPx.x + nodeSpecPx.w / 2) / parentSpecPx.w
                anchorLeft = anchorRight = utils.remap(center, 0, 1, -1, 1)
                offsetLeft = -widthInWorldUnit / 2
                offsetRight = widthInWorldUnit / 2
                break
            }
            //position proportional to parent. width is proportional to parent.
            case 'SCALE':
                anchorLeft = utils.remap(nodeSpecPx.x / parentSpecPx.w, 0, 1, -1, 1)
                anchorRight = utils.remap((nodeSpecPx.x + nodeSpecPx.w) / parentSpecPx.w, 0, 1, -1, 1)
                break
            //left to edge is in fixed pixel, right to edge is in fixed pixel. width is calculated from previous two.
            case 'LEFT_RIGHT':
                //leave anchor value intact (full frame setting)
                offsetLeft = unitConversionFunc(nodeSpecPx.x)
                offsetRight = -unitConversionFunc(parentSpecPx.w - nodeSpecPx.x - nodeSpecPx.w)
                break
            default:
                break
        }

        return {
            anchorLeft,
            anchorRight,
            offsetLeft,
            offsetRight
        }
    }
}
