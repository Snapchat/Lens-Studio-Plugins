import { PanelPlugin as Panel } from 'LensStudio:PanelPlugin';
import * as Ui from 'LensStudio:Ui';
import { ThreeDAssetGenerationPlugin } from "./ThreeDAssetGenerationPlugin/ThreeDAssetGeneration.js";
import { PLUGIN_ID } from './constants.js';

export class BitmojiProps extends Panel {
    static descriptor() {
        return {
            id: PLUGIN_ID,
            name: 'Bitmoji Props',
            dependencies: [Ui.IGui],
            menuActionHierarchy: [''],
            isUnique: true,
            bitmojiSuite: {
                title: "Props"
            }
        };
    }

    createWidget(parent) {
        const widget = new Ui.Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);

        this.threeDAssetGenerationPlugin = new ThreeDAssetGenerationPlugin(this.pluginSystem);
        const pluginWidget = this.threeDAssetGenerationPlugin.createWidget(widget);

        layout.addWidget(pluginWidget);

        widget.layout = layout;

        return widget;
    }

    edit(bitmojiComponent) {
    }

    deinit() {
        if (this.threeDAssetGenerationPlugin) {
            this.threeDAssetGenerationPlugin.deinit();
        }
    }
}
