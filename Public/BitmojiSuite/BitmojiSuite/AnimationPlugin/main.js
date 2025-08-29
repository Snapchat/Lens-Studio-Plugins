import { PanelPlugin as Panel } from 'LensStudio:PanelPlugin';
import * as Ui from 'LensStudio:Ui';
import {HomeScreen} from "./HomeScreen.js";
import {dependencyContainer, DependencyKeys} from "./DependencyContainer.js";
import {OUTFIT_OVERRIDE_COMPONENT_ID} from "./constants.js";
import { PLUGIN_ID } from './constants.js';
import {logEventOpen} from "./analytics.js";

export class BitmojiAnimation extends Panel {
    static descriptor() {
        return {
            id: PLUGIN_ID,
            name: 'Bitmoji Animation',
            dependencies: [Ui.IGui],
            menuActionHierarchy: [''],
            isUnique: true,
            bitmojiSuite: {
                title: "Animate"
            }
        };
    }

    createWidget(parent) {
        dependencyContainer.register(DependencyKeys.Main, this);
        dependencyContainer.register(DependencyKeys.IsActive, true);
        const widget = new Ui.Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        dependencyContainer.register(DependencyKeys.PluginSystem, this.pluginSystem);

        this.homeScreen = new HomeScreen();
        const homeScreenWidget = this.homeScreen.create(widget);

        layout.addWidget(homeScreenWidget.toNativeWidget());

        widget.layout = layout;

        logEventOpen();

        return widget;
    }

    edit(bitmojiComponent) {
        this.bitmojiComponent = bitmojiComponent;
        dependencyContainer.register(DependencyKeys.BitmojiComponent, bitmojiComponent);

        const so = bitmojiComponent.sceneObject;

        const outfitOverride = this.findOutfitComponent(so);
        this.data  = { items: [] };

        if (outfitOverride && outfitOverride.enabled) {
            try {
                this.data = { items: JSON.parse(outfitOverride.outfitOverrideParameters).items.filter((item) => {
                    return outfitOverride.outfitOverrideList.find((other) => other.type == item.globalType);
                }) };
            } catch(e) {
                // if outfitOverride.outfitOverrideParameters is invalid JSON or empty string, reset to empty
                this.data = { items: [] };
            }
        } else {
            this.data = { items: [] };
        }

        if (dependencyContainer.has(DependencyKeys.LBEPreview)) {
            const lbePreview = dependencyContainer.get(DependencyKeys.LBEPreview);
            if (lbePreview.isLbeLoaded()) {
                lbePreview.sendMessage({
                    "event_type": "update_outfit",
                    "params": JSON.stringify(this.data),
                        "bitmojiType": bitmojiComponent.bitmojiType,
                        "friendIndex": bitmojiComponent.friendIndex
                });
            }
            else{
                lbePreview.addOnLbeLoadedCallback(() => {
                    lbePreview.sendMessage({
                        "event_type": "update_outfit",
                        "params": JSON.stringify(this.data),
                        "bitmojiType": bitmojiComponent.bitmojiType,
                        "friendIndex": bitmojiComponent.friendIndex
                    });
                })
            }
        }
    }

    editWithBitmojiComponent() {
        this.edit(this.bitmojiComponent);
    }

    deinit() {
        dependencyContainer.register(DependencyKeys.IsActive, false);
        if (this.homeScreen) {
            this.homeScreen.deinit();
        }
        if (dependencyContainer.has(DependencyKeys.LBEPreview)) {
            dependencyContainer.get(DependencyKeys.LBEPreview).deinit();
        }

        dependencyContainer.deinit();
    }

    findOutfitComponent(so) {
        const scriptComponents = so.getComponents("ScriptComponent");
        return scriptComponents.find((comp) => this.isOutfitOverrideComponent(comp));
    }

    isOutfitOverrideAsset(asset) {
        return asset && asset.componentId == OUTFIT_OVERRIDE_COMPONENT_ID;
    }

    isOutfitOverrideComponent(component) {
        return component && this.isOutfitOverrideAsset(component.scriptAsset);
    }
}
