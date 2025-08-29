import { PanelPlugin as Panel } from 'LensStudio:PanelPlugin';
import * as Ui from 'LensStudio:Ui';

import { SectionSelector } from './widgets/Sections/SectionSelector.js';
import { SectionItem } from './widgets/Sections/SectionItem.js';
import { Gallery } from './widgets/Gallery/Gallery.js';
import { Preview } from './widgets/Preview/Preview.js';

import { SectionsProvider } from './providers/SectionsProvider.js';
import { BitmojiPreviewProvider } from './providers/BitmojiPreviewProvider.js';
import { DEFAULT_CAMERA_POSITION_ID } from '../constants.js';
import { WidgetFactory } from '../WidgetFactory.js';
import { ReactiveVariable } from '../ReactiveVariable.js';
import { OUTFIT_OVERRIDE_COMPONENT_ID, PLUGIN_ID } from './constants.js';
import { deepEqual, uniqueBy, compareVersions, compareArrays } from '../utils.js';
import { ColorSelector } from './widgets/ColorSelector/ColorSelector.js';
import { logEventOpen, logEventAssetCreation, logEventAssetImport } from './analytics.js';

const isOutfitOverrideAsset = (asset) => {
    return asset && asset.componentId == OUTFIT_OVERRIDE_COMPONENT_ID;
}

const isOutfitOverrideComponent = (component) => {
    return component && isOutfitOverrideAsset(component.scriptAsset);
}

export class BitmojiOutfit extends Panel {
    static descriptor() {
        return {
            id: PLUGIN_ID,
            name: 'Bitmoji Outfit',
            dependencies: [Ui.IGui],
            menuActionHierarchy: [''],
            isUnique: true,
            bitmojiSuite: {
                title: "Outfit"
            }
        };
    }

    createWidget(parent) {
        this.pendingData = new ReactiveVariable(null);
        this.galleryList = [];
        this.sections = [];

        const widget = WidgetFactory.beginWidget(parent).sizePolicy(Ui.SizePolicy.Policy.Expanding).contentsMargings(0).end();

        this.selector = new SectionSelector(widget);

        const horizontalContainer = WidgetFactory.beginWidget(parent).end();

        this.preview = new Preview(horizontalContainer, this.pluginSystem.findInterface(Editor.IAuthorization));

        this.preview.addEventListener(Preview.BusyChanged, ({isBusy}) => {
            this.onPreviewBusy(isBusy);
        });

        this.gallery = this.createGallery(horizontalContainer);

        this.colorSelector = new ColorSelector(horizontalContainer);
        this.colorSelector.addEventListener(ColorSelector.ColorChanged, ({index}) => this.onColorChanged(index));

        horizontalContainer.layout = WidgetFactory.beginHorizontalLayout()
            .contentsMargings(0)
            .spacing(0)
            .addWidgetWithStretch(this.gallery, 4)
            .addWidgetWithStretch(this.preview.widget, 5)
            .addWidgetWithStretch(this.colorSelector.widget)
            .end();

        const { widget: footer, reset: reset, apply: apply } = this.createFooter(widget);

        this.pendingData.addEventListener(ReactiveVariable.Change, ({value}) => {
            if (value == null) {
                if (!apply.isNull) {
                    apply.enabled = false;
                }
                if (!reset.isNull) {
                    reset.enabled = false;
                }
            } else {
                if (!apply.isNull) {
                    apply.enabled = true;
                }
                if (!reset.isNull) {
                    reset.enabled = true;
                }
            }
        });

        const separator = WidgetFactory.beginSeparator(widget).end();

        widget.layout = WidgetFactory.beginVerticalLayout()
            .contentsMargings(0)
            .spacing(0)
            .addWidget(this.selector.widget)
            .addWidget(horizontalContainer)
            .addWidget(separator)
            .addWidget(footer)
            .end();;

        this.init();

        return widget;
    }

    onPreviewBusy(isBusy) {
        this.galleryList.forEach((gallery) => {
            gallery.setBusy(isBusy);
        });

        this.colorSelector.setBusy(isBusy);
    }

    async init() {
        try {
            logEventOpen();
            this.colorSelector.widget.visible = false;
            this.gallery.visible = false;
            this.preview.changeCamera(DEFAULT_CAMERA_POSITION_ID);

            const sections = await SectionsProvider.getAll();
            this.sections = sections.items;

            this.sections.forEach((section) => {
                const item = new SectionItem(this.selector.widget);
                item.setIcon(section.icon, section.iconHover);
                item.setTitle(section.title);

                this.selector.addSection(item);
            });

            this.preview.requestBitmojiData((bitmojiData) => {
                this.bitmojiData = bitmojiData;
                this.bitmojiPreviewProvider = new BitmojiPreviewProvider(bitmojiData);

                this.sections.forEach((section) => {
                    const gallery = new Gallery(this.gallery, section.provider, this.bitmojiPreviewProvider, section.aspectRatio);
                    this.gallery.addWidget(gallery.widget);
                    this.galleryList.push(gallery);
                    gallery.addEventListener(Gallery.ItemSelected, ({data}) => this.onItemSelected(this.galleryList.indexOf(gallery), data));
                });

                this.selector.addEventListener(SectionSelector.SectionChanged, ({index}) => this.onSectionChanged(index));
            });
        } catch (error) {
            console.error("Failed to initialize Bitmoji Outfit plugin:", error);
        }
    }

    onColorChanged(index) {
        const item = this.galleryList[this.gallery.currentIndex].getCurrentModel();

        for (let i = 0; i < item.options.length; i++) {
            item.options[i].colorIndex = index;
        }

        this.galleryList[this.gallery.currentIndex].refresh();

        this.updateView();
    }

    onItemSelected(galleryIndex, item) {
        if (item) {
            // logEventAssetCreation("SUCCESS", this.sections[galleryIndex].title.toUpperCase());
            this.sections[galleryIndex].cancel.forEach((sectionIdToCancel) => {
                const index = this.sections.findIndex((section) => section.id == sectionIdToCancel);

                this.galleryList[index].unselectAll();
            });

            this.sections[galleryIndex].provider.getTones(item.options[0].optionId).then((tones) => {
                if (tones.length > 1) {
                    this.colorSelector.setColors(tones);

                    if (item.options[0].colorIndex != -1) {
                        this.colorSelector.blockSignals(true);
                        this.colorSelector.selectIndex(item.options[0].colorIndex);
                        this.colorSelector.blockSignals(false);
                    } else {
                        const index = tones.findIndex((tone) => compareArrays(tone, item.options[0].colors[0]));

                        if (index != -1) {
                            this.colorSelector.blockSignals(true);
                            this.colorSelector.selectIndex(index);
                            this.colorSelector.blockSignals(false);

                            item.options.forEach((option) => {
                                option.colorIndex = index;
                            });
                        }
                    }

                    for (let i = 0; i < item.options.length; i++) {
                        item.options[i].colors = tones;
                    }
                } else {
                    this.colorSelector.reset();
                }
            });
        } else {
            this.colorSelector.reset();
        }
        this.updateView();
    }

    onSectionChanged(index) {
        if (index == -1) {
            this.colorSelector.reset();
            this.gallery.visible = false;
            this.preview.changeCamera(DEFAULT_CAMERA_POSITION_ID);
            this.colorSelector.widget.visible = false;
        } else {
            this.gallery.visible = true;

            this.galleryList[index].init();
            this.gallery.currentWidget.visible = false;
            this.gallery.currentIndex = index;
            this.gallery.currentWidget.visible = true;
            this.preview.changeCamera(this.sections[index].id);

            const item = this.galleryList[index].getCurrentModel();

            if (item && item.options && item.options[0] && item.options[0].colors && item.options[0].colors.length > 1) {
                this.colorSelector.setColors(item.options[0].colors);
                if (item.options[0].colorIndex >= 0) {
                    this.colorSelector.blockSignals(true);
                    this.colorSelector.selectIndex(item.options[0].colorIndex);
                    this.colorSelector.blockSignals(false);
                }
            } else {
                this.colorSelector.reset();
            }
            this.colorSelector.widget.visible = true;
        }
    }

    createGallery(parent) {
        const stack = new Ui.StackedWidget(parent);
        stack.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        return stack;
    }

    createView(parent) {
        const preview = new Preview(parent, this.pluginSystem.findInterface(Editor.IAuthorization));
        return preview;
    }

    createFooter(parent) {
        const widget = WidgetFactory.beginWidget(parent).sizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed).end();
        const layout = WidgetFactory.beginHorizontalLayout().contentsMargings(Ui.Sizes.Padding).end();

        const reset = new Ui.PushButton(widget);
        reset.text = "Reset";
        reset.enabled = false;

        this.onResetConnection = reset.onClick.connect(() => this.onReset());

        const apply = new Ui.PushButton(widget);
        apply.text = "Apply";
        apply.primary = true;
        apply.enabled = false;

        this.onApplyConnection = apply.onClick.connect(() => this.onApply());

        layout.addWidget(reset);
        layout.addStretch(0);
        layout.addWidget(apply);

        widget.layout = layout;

        return { widget, reset, apply };
    }

    clearSelection() {
        this.galleryList.forEach((gallery) => {
            if (gallery && gallery.unselectAll) {
                gallery.unselectAll();
            }
        });

        this.colorSelector.reset();

        this.pendingData.set(null);
    }

    updateBitmojiData() {
        this.preview.requestBitmojiData((bitmojiData) => {
            if (!deepEqual(bitmojiData, this.bitmojiData)) {
                this.bitmojiData = bitmojiData;
                this.bitmojiPreviewProvider = new BitmojiPreviewProvider(bitmojiData);
                this.galleryList.forEach((gallery) => {
                    gallery.updateBitmojiProvider(this.bitmojiPreviewProvider);
                });
            }
        });
    }

    onReset() {
        this.reset();
        logEventAssetImport("SUCCESS", "RESET_LIBRARY");
    }

    reset() {
        this.clearSelection();
        this.updateView();
        this.timeout = setTimeout(() => {
            this.updateBitmojiData();
        }, 0);
    }

    async onApply() {
        try {
            await this.apply();
            logEventAssetImport("SUCCESS", "APPLY_LIBRARY");
        } catch(error) {
            console.error("Apply failed:", error);
            logEventAssetImport("FAILED", "APPLY_LIBRARY");
        }
    }

    async apply() {
        this.data = this.pendingData.get();

        const so = this.currentBitmojiComponent.sceneObject;

        let outfitComponent = this.findOutfitComponent(so);

        if (!outfitComponent) {
            outfitComponent = await this.addOutfitOverride(so);
        }

        outfitComponent.outfitOverrideParameters = JSON.stringify(this.data);
        const list = uniqueBy(this.data.items.map(item => { return { type: item.globalType } }), (lhs, rhs) => lhs.type == rhs.type);

        outfitComponent.outfitOverrideList = list;

        this.edit(this.currentBitmojiComponent);
    }

    findOutfitComponent(so) {
        const scriptComponents = so.getComponents("ScriptComponent");
        return scriptComponents.find((comp) => isOutfitOverrideComponent(comp));
    }

    async addOutfitOverride(sceneObject) {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const project = model.project;
        const assetManager = project.assetManager;

        const instantiateScriptAsset = (scriptAsset) => {
            const scriptComponent = sceneObject.addComponent("ScriptComponent");
            scriptComponent.scriptAsset = scriptAsset;

            return scriptComponent;
        }
        const scriptAsset = assetManager.assets.find((asset) => {
            return isOutfitOverrideAsset(asset);
        });

        if (scriptAsset) {
            return instantiateScriptAsset(scriptAsset.fileMeta.nativePackageRoot.primaryAsset);
        } else {
            const importResult = await assetManager.importExternalFileAsync(import.meta.resolve("./Resources/Outfit Override.lsc"), new Editor.Path('/'), Editor.Model.ResultType.Auto)
            return instantiateScriptAsset(importResult.primary);
        }
    }

    retreiveOptionIdFromDebug(option, debug) {
        if (option.type == "glasses") {
            return String(debug.charData.head_piece_mappings[option.type]);
        } else {
            return String(debug.charData.split_clothing[option.type]);
        }
    }

    async translateDataToLensFormat(data) {
        if (data.options) {
            const debugData = await this.bitmojiPreviewProvider.getPreviewData(data);
            let result = [];
            data.options.forEach((option) => {
                if (option.optionId) {
                    const optionId = this.retreiveOptionIdFromDebug(option, debugData);

                    let params = "{}";

                    if (debugData.charData.custom_colours[option.type]) {
                        if (option.type == "footwear") {
                            params = JSON.stringify(debugData.charData.custom_colours[option.type].CategoryColors_3D.FootwearColors);
                        } else {
                            params = JSON.stringify(debugData.charData.custom_colours[option.type].CategoryColors_3D.ClothingColors);
                        }
                    }

                    result.push({
                        optionId,
                        params: params,
                        type: option.type,
                        globalType: data.globalType
                    });
                } else {
                    result.push({
                        optionId: option.optionId,
                        params: option.params,
                        type: option.type,
                        globalType: data.globalType
                    });
                }
            });

            return result;
        } else {
            return null;
        }
    }

    updateView() {
        const promises = this.galleryList.map((gallery) => {
            if (gallery.selectedData) {
                // theoretically, JSON's would be cached for each new invokations
                // to-do: check if it's true, add caching otherwise
                return this.translateDataToLensFormat(gallery.selectedData);
            } else {
                return Promise.resolve(null);
            }
        });

        Promise.all(promises).then((results) => {
            const list = results.filter(data => data !== null).flat(1).reverse();

            if (list.length == 0) {
                this.pendingData.set(null);
                this.preview.updateView(this.data, this.bitmojiType, this.friendIndex);
            } else {
                const currentData = this.data;
                this.pendingData.set(this.merge(currentData, {items: list}));
                this.preview.updateView(this.pendingData.get(), this.bitmojiType, this.friendIndex);
            }
        }).catch(error => {
            console.error(error.stack);
            console.error("Failed to update view: ", error);
        });
    }

    // to-do: describe why this merging strategy makes sense
    merge(currentData, newData) {
        const newMap = new Map(newData.items.map(item => [item.type, item]));

        const filteredCurrentItems = currentData.items.filter(currentItem => {
            if (currentItem.globalType === "mannequin-with-head-center") {
                const hasMatchingBottom = currentData.items.some(item =>
                    item.type === "bottom" &&
                    item.optionId === currentItem.optionId &&
                    item.globalType === "mannequin-with-head-center"
                );
                const hasMatchingTop = currentData.items.some(item =>
                    item.type === "top" &&
                    item.optionId === currentItem.optionId &&
                    item.globalType === "mannequin-with-head-center"
                );

                if ((newMap.has("bottom") || newMap.has("top")) && hasMatchingBottom && hasMatchingTop) {
                    return false;
                }
            }
            return true;
        });

        const resultItems = [];

        filteredCurrentItems.forEach(currentItem => {
            const itemType = currentItem.type;
            if (newMap.has(itemType)) {
                resultItems.push(newMap.get(itemType));
            } else {
                resultItems.push(currentItem);
            }
        });

        const existingTypes = new Set(resultItems.map(item => item.type));
        newData.items.forEach(newItem => {
            if (!existingTypes.has(newItem.type)) {
                resultItems.push(newItem);
            }
        });

        return { items: this.cleanup(resultItems) };
    }

    cleanup(items) {
        const result = [];

        items.forEach(item => {
            if (item.type == "top") {
                if (item.globalType == "dress") {
                    if (items.find((other) => other.type == "bottom" && other.globalType == "dress")) {
                        result.push(item);
                    }
                } else {
                    result.push(item);
                }
            } else if (item.type == "bottom") {
                if (item.globalType == "dress") {
                    if (items.find((other) => other.type == "top" && other.globalType == "dress")) {
                        result.push(item);
                    }
                } else {
                    result.push(item);
                }
            } else {
                result.push(item);
            }
        });

        return result;
    }

    checkVersion(bitmojiComponent) {
        const version = bitmojiComponent.scriptAsset.version;

        const versionString = version.major + "." + version.minor + "." + version.patch;
        if (compareVersions(version, { major: 8, minor: 1, patch: 1 }) < 0) {
            console.warn(`[Bitmoji Suite] Bitmoji 3D component version ${versionString} is not supported and can cause unexpected behavior. Minimal supported version is 8.1.1+. Please, upgrade in asset library.`);
        }
    }

    edit(bitmojiComponent) {
        this.checkVersion(bitmojiComponent);
        this.currentBitmojiComponent = bitmojiComponent;
        const so = bitmojiComponent.sceneObject;

        this.bitmojiType = bitmojiComponent.bitmojiType;
        this.friendIndex = bitmojiComponent.friendIndex;

        const outfitOverride = this.findOutfitComponent(so);

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

        this.reset();
    }

    deinit() {
        if (this.onApplyConnection) {
            this.onApplyConnection.disconnect();
            this.onApplyConnection = null;
        }
        if (this.onResetConnection) {
            this.onResetConnection.disconnect();
            this.onResetConnection = null;
        }

        if (this.preview && this.preview.deinit) {
            this.preview.deinit();
        }
        if (this.galleryList) {
            this.galleryList.forEach((gallery) => {
                if (gallery && gallery.deinit) {
                    gallery.deinit();
                }
            });
        }
    }
}
