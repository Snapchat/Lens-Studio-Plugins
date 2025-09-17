// @ts-nocheck
import { Widget } from "../components/common/widgets/widget.js";
import * as Ui from "LensStudio:Ui";
import { VBoxLayout } from "../components/common/layouts/vBoxLayout.js";
import { Grid } from "../components/ui/grid.js";
import { HBoxLayout } from "../components/common/layouts/hBoxLayout.js";
import { GridTile } from "../components/ui/gridTile.js";
import AssetLibImporter from "./assetLibImporter.js";
import { dependencyContainer, DependencyKeys } from "../DependencyContainer.js";
import { MenuTemplate } from "./MenuTemplate.js";
import * as FileSystem from 'LensStudio:FileSystem';
import { deleteAnimationById, getAnimationById, getMyAnimations } from "../api.js";
import { logEventCreate } from "../analytics.js";
export var GridPages;
(function (GridPages) {
    GridPages[GridPages["Actions"] = 0] = "Actions";
    GridPages[GridPages["Emotions"] = 1] = "Emotions";
    GridPages[GridPages["MyGallery"] = 2] = "MyGallery";
})(GridPages || (GridPages = {}));
export class AnimationLibrary {
    constructor() {
        this.pages = {};
        this.actionsIdMap = {};
        this.emotionsIdMap = {};
        this.actionsIds = [];
        this.emotionsIds = [];
        this.tileData = {};
        this.maxInitialPreviewTiles = 24;
        this.connections = [];
        this.returnFunction = () => { };
        this.pages = {};
        this.actionsIdMap = {};
        this.emotionsIdMap = {};
        this.actionsIds = [];
        this.emotionsIds = [];
        this.isActive = true;
        dependencyContainer.register(DependencyKeys.AnimationLibrary, this);
        this.menuTemplate = new MenuTemplate();
        this.tileBackground = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/preview.svg')));
        this.tileHoveredBackground = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/preview_h.svg')));
        this.tileFailedBackground = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/preview_e.svg')));
        this.blendIcon = new Ui.Pixmap(import.meta.resolve('./Resources/blend.svg'));
        this.actionsIdMap = JSON.parse(FileSystem.readFile(new Editor.Path(import.meta.resolve("./actionsIdMap.json"))));
        Object.keys(this.actionsIdMap).forEach(id => {
            this.actionsIds.push(id);
        });
        this.emotionsIdMap = JSON.parse(FileSystem.readFile(new Editor.Path(import.meta.resolve("./emotionsIdMap.json"))));
        Object.keys(this.emotionsIdMap).forEach(id => {
            this.emotionsIds.push(id);
        });
    }
    create(parent, onReturnCallback) {
        const widget = new Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const layout = new VBoxLayout();
        layout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, 0, 0);
        const contentWidget = new Widget(widget);
        contentWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const contentLayout = new VBoxLayout();
        contentLayout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.DoublePadding, Ui.Sizes.Padding);
        contentLayout.spacing = Ui.Sizes.Padding;
        this.returnFunction = onReturnCallback;
        //Header
        const header = this.menuTemplate.createHeader(widget.toNativeWidget(), 'Animation Library', () => {
            this.returnFunction();
        });
        // Tap Bar
        this.tabBar = new Ui.TabBar(contentWidget.toNativeWidget());
        this.tabBar.addTab('Actions');
        this.tabBar.addTab('Emotions');
        this.tabBar.addTab('My Gallery');
        this.tabBar.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        contentLayout.addNativeWidget(this.tabBar);
        // Search Line
        const searchLine = new Ui.SearchLineEdit(contentWidget.toNativeWidget());
        contentLayout.addNativeWidget(searchLine);
        // Grid
        this.preview = dependencyContainer.get(DependencyKeys.Preview);
        this.lbePreview = dependencyContainer.get(DependencyKeys.LBEPreview);
        const pluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem);
        this.assetLibImporter = new AssetLibImporter(pluginSystem);
        const gridStackedWidget = new Ui.StackedWidget(widget.toNativeWidget());
        gridStackedWidget.setContentsMargins(0, 0, 0, 0);
        let grid = this.createGrid(gridStackedWidget, 0);
        this.pages[GridPages.Actions] = grid.galleryWidget;
        gridStackedWidget.addWidget(grid.widget.toNativeWidget());
        grid = this.createGrid(gridStackedWidget, 0);
        this.pages[GridPages.Emotions] = grid.galleryWidget;
        gridStackedWidget.addWidget(grid.widget.toNativeWidget());
        grid = this.createGrid(gridStackedWidget, 0);
        this.pages[GridPages.MyGallery] = grid.galleryWidget;
        gridStackedWidget.addWidget(grid.widget.toNativeWidget());
        this.tileData[GridPages.MyGallery] = {};
        this.setMyGalleryAnimations(GridPages.MyGallery);
        this.tileData[GridPages.Actions] = {};
        this.setUpGrid(GridPages.Actions, this.actionsIds, this.actionsIdMap);
        this.setUpScrollEvent(GridPages.Actions);
        this.tileData[GridPages.Emotions] = {};
        this.setUpGrid(GridPages.Emotions, this.emotionsIds, this.emotionsIdMap);
        this.setUpScrollEvent(GridPages.Emotions);
        searchLine.onTextChange.connect((text) => {
            Object.keys(this.pages).forEach((pageType) => {
                var _a;
                (_a = this.pages[pageType]) === null || _a === void 0 ? void 0 : _a.onSearchTextChanged(text.toLowerCase());
            });
        });
        this.tabBar.onCurrentChange.connect((index) => {
            if (gridStackedWidget) {
                gridStackedWidget.currentIndex = index;
            }
        });
        //
        contentWidget.layout = contentLayout;
        layout.addNativeWidget(header);
        layout.addWidgetWithStretch(contentWidget, 0, Ui.Alignment.AlignTop);
        layout.addNativeWidget(gridStackedWidget);
        widget.layout = layout;
        return widget;
    }
    setUpGrid(pageName, ids, idMap) {
        if (!this.tileData[pageName] || !this.assetLibImporter || !this.preview || !this.lbePreview) {
            return;
        }
        let filter = "action";
        if (pageName === GridPages.Emotions) {
            filter = "emotion";
        }
        const tileData = this.tileData[pageName];
        let items = [];
        getMyAnimations((response, isNextPage) => {
            var _a;
            if (!this.isActive) {
                return;
            }
            if (response.statusCode !== 200 && response.statusCode !== 201) {
                return;
            }
            items = JSON.parse(response.body.toString()).items;
            items.forEach((item) => {
                const tile = this.addNewTile(pageName);
                if (tile) {
                    tileData[tile.getId()] = {
                        tile: tile,
                        id: item.id,
                        animation_preview: item.previewPluginUrl.toString(),
                        bitmoji_animation: item.bitmojiUrl.toString()
                    };
                    if (item.description) {
                        tile.addDescription(item.description);
                    }
                    this.setUpClickEvent(pageName, tile);
                }
            });
            (_a = this.pages[pageName]) === null || _a === void 0 ? void 0 : _a.arrangeLayout();
        }, null, filter);
    }
    setMyGalleryAnimations(pageName) {
        if (!this.tileData[pageName] || !this.assetLibImporter || !this.preview || !this.lbePreview) {
            return;
        }
        const tileData = this.tileData[pageName];
        let items = [];
        getMyAnimations((response, isNextPage) => {
            var _a;
            if (!this.isActive) {
                return;
            }
            if (response.statusCode !== 200 && response.statusCode !== 201) {
                return;
            }
            items = JSON.parse(response.body.toString()).items;
            items.forEach((item) => {
                if (item.state != "SUCCESS" && item.state != "FAILED") {
                    const startIntervalFunction = this.addAnimationToMyGallery("");
                    startIntervalFunction(item.id);
                    return;
                }
                if (!this.assetLibImporter || !this.preview || !this.lbePreview) {
                    return;
                }
                const tile = this.addNewTile(pageName);
                tile === null || tile === void 0 ? void 0 : tile.addRemoveButton();
                if (item.state === "FAILED") {
                    if (tile) {
                        tile.onFailed();
                        this.setUpRemoveCallback(GridPages.MyGallery, tile);
                        tileData[tile.getId()] = {
                            tile: tile,
                            id: item.id,
                            animation_preview: null,
                            bitmoji_animation: null
                        };
                    }
                    return;
                }
                if (tile) {
                    tileData[tile.getId()] = {
                        tile: tile,
                        id: item.id,
                        animation_preview: item.previewPluginUrl.toString(),
                        bitmoji_animation: item.bitmojiUrl.toString()
                    };
                    tile.setType(item.type);
                    if (item.description) {
                        tile.addDescription(item.description);
                    }
                    if (item.type === "stitch") {
                        tile.addBlendIcon(this.blendIcon);
                    }
                    this.setUpClickEvent(GridPages.MyGallery, tile);
                    this.setUpRemoveCallback(GridPages.MyGallery, tile);
                }
            });
            (_a = this.pages[pageName]) === null || _a === void 0 ? void 0 : _a.arrangeLayout();
        });
        this.setUpScrollEvent(pageName);
    }
    createGrid(widget, cnt) {
        const gridWidget = new Widget(widget);
        gridWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const gridLayout = new HBoxLayout();
        gridLayout.setContentsMargins(Ui.Sizes.Padding, 0, 0, 0);
        const galleryWidget = new Grid(gridWidget, 110, 220, 160);
        for (let i = 0; i < cnt; i++) {
            this.createTile(galleryWidget);
        }
        gridLayout.addWidget(galleryWidget);
        gridWidget.layout = gridLayout;
        return { widget: gridWidget, galleryWidget: galleryWidget };
    }
    setUpScrollEvent(pageName) {
        const page = this.pages[pageName];
        page.addOnScrollValueChangedCallback((value) => {
            var _a;
            if (!this.isActive || !this.tileData[pageName] || !this.assetLibImporter) {
                return;
            }
            const tileData = this.tileData[pageName];
            const rowCount = Math.floor((page.getVisibleTiles().length + 2) / 3);
            const scrollStepPerRow = 1 / rowCount;
            const maxPreviewTileIdx = Math.min(this.maxInitialPreviewTiles + Math.ceil(value / scrollStepPerRow) * 3, page.getVisibleTiles().length);
            const visibleTiles = page.getVisibleTiles();
            const to = Math.max(0, maxPreviewTileIdx);
            for (let i = 0; i < to; i++) {
                const curId = visibleTiles[i].getId();
                if (tileData[curId] && !tileData[curId].tile.hasPreview && tileData[curId].animation_preview) {
                    const fileName = tileData[curId].id + "_" + "animation_preview" + ".webp";
                    tileData[curId].tile.hasPreview = true;
                    (_a = this.assetLibImporter) === null || _a === void 0 ? void 0 : _a.downloadAsset(tileData[curId].animation_preview, fileName, (response) => {
                        if (!this.isActive) {
                            return;
                        }
                        if (response.success && tileData[curId].tile) {
                            tileData[curId].tile.addPreview(response.path);
                        }
                    });
                }
            }
        });
    }
    setUpClickEvent(pageName, tile) {
        if (!this.tileData[pageName]) {
            return;
        }
        tile.addOnClickCallback((id) => {
            var _a;
            this.selectTile(pageName, id, tile);
            (_a = this.preview) === null || _a === void 0 ? void 0 : _a.selectTile(pageName, id, tile.getPreviewPath());
        });
    }
    selectTile(pageName, id, tile) {
        var _a, _b;
        this.clearSelection();
        if (tile) {
            (_a = this.pages[pageName]) === null || _a === void 0 ? void 0 : _a.selectTile(tile);
            this.previewAnimation(tile, pageName);
        }
        else {
            const curTile = this.tileData[pageName][id].tile;
            (_b = this.pages[pageName]) === null || _b === void 0 ? void 0 : _b.selectTile(curTile);
            this.previewAnimation(curTile, pageName);
        }
    }
    previewAnimation(tile, pageName) {
        var _a, _b;
        (_a = this.preview) === null || _a === void 0 ? void 0 : _a.onAnimationLoadStart();
        const tileData = this.tileData[pageName];
        if (!tileData) {
            return;
        }
        let fileName = tileData[tile.getId()].id + "_" + "bitmoji_animation" + ".fbx";
        let url = tileData[tile.getId()].bitmoji_animation;
        (_b = this.assetLibImporter) === null || _b === void 0 ? void 0 : _b.downloadAsset(url, fileName, (response) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (!this.isActive) {
                return;
            }
            if (response.success && tile) {
                (_a = this.lbePreview) === null || _a === void 0 ? void 0 : _a.sendMessage({
                    "event_type": "update_animation",
                    "path": response.path,
                    "type": tile.getType()
                });
                if (pageName === GridPages.Actions) {
                    (_b = this.preview) === null || _b === void 0 ? void 0 : _b.onAnimationSelected(response.path, "ACTIONS", tileData[tile.getId()].id);
                }
                else if (pageName === GridPages.Emotions) {
                    (_c = this.preview) === null || _c === void 0 ? void 0 : _c.onAnimationSelected(response.path, "EMOTIONS", tileData[tile.getId()].id);
                }
                else if (pageName === GridPages.MyGallery) {
                    if (tile.getType() == "text") {
                        (_d = this.preview) === null || _d === void 0 ? void 0 : _d.onAnimationSelected(response.path, "PROMPT_TEXT", tileData[tile.getId()].id);
                    }
                    else if (tile.getType() == "video") {
                        (_e = this.preview) === null || _e === void 0 ? void 0 : _e.onAnimationSelected(response.path, "PROMPT_VIDEO", tileData[tile.getId()].id);
                    }
                    else if (tile.getType() == "stitch") {
                        (_f = this.preview) === null || _f === void 0 ? void 0 : _f.onAnimationSelected(response.path, "STITCHED", tileData[tile.getId()].id);
                    }
                    else if (tile.getType() == "animation") {
                        (_g = this.preview) === null || _g === void 0 ? void 0 : _g.onAnimationSelected(response.path, "UPLOAD", tileData[tile.getId()].id);
                    }
                    else {
                        (_h = this.preview) === null || _h === void 0 ? void 0 : _h.onAnimationSelected(response.path, "MY_GALLERY", tileData[tile.getId()].id);
                    }
                }
            }
        });
    }
    setUpRemoveCallback(pageName, tile) {
        tile.addOnRemoveCallback((id) => {
            var _a;
            if (this.tileData[pageName] && this.tileData[pageName][tile.getId()] && this.tileData[pageName][tile.getId()].id) {
                deleteAnimationById(this.tileData[pageName][tile.getId()].id);
            }
            (_a = this.pages[pageName]) === null || _a === void 0 ? void 0 : _a.onTileRemoved();
        });
    }
    createTile(galleryWidget, isGenerated) {
        const tile = new GridTile(galleryWidget, galleryWidget.getAllTiles().length);
        tile.background = this.tileBackground;
        tile.hoveredBackground = this.tileHoveredBackground;
        tile.errorBackground = this.tileFailedBackground;
        if (isGenerated) {
            galleryWidget.addTileToFront(tile);
        }
        else {
            galleryWidget.addTile(tile, false);
        }
        return tile;
    }
    addNewTile(pageName, isGenerated = false) {
        if (this.pages[pageName]) {
            const tile = this.createTile(this.pages[pageName], isGenerated);
            return tile;
        }
        return null;
    }
    addAnimationToMyGallery(inputFormat) {
        var _a, _b;
        (_a = this.pages[GridPages.MyGallery]) === null || _a === void 0 ? void 0 : _a.resetScroll();
        const tile = this.addNewTile(GridPages.MyGallery, true);
        tile === null || tile === void 0 ? void 0 : tile.addRemoveButton();
        (_b = this.pages[GridPages.MyGallery]) === null || _b === void 0 ? void 0 : _b.arrangeLayout();
        return (animationId) => {
            if (!this.isActive) {
                return;
            }
            if (!animationId) {
                if (tile) {
                    logEventCreate("FAILED", inputFormat);
                    tile.onFailed();
                    this.setUpRemoveCallback(GridPages.MyGallery, tile);
                }
                return;
            }
            let isRequestInProgress = false;
            tile === null || tile === void 0 ? void 0 : tile.setProgress(0);
            const sendAnimationRequest = () => {
                isRequestInProgress = true;
                getAnimationById(animationId, (response) => {
                    var _a;
                    if (!this.isActive) {
                        clearInterval(interval);
                        isRequestInProgress = false;
                        return;
                    }
                    if (response.statusCode !== 200) {
                        isRequestInProgress = false;
                        return;
                    }
                    const responseBody = JSON.parse(response.body);
                    tile === null || tile === void 0 ? void 0 : tile.setProgress(responseBody.progressPercent);
                    if (inputFormat === "") {
                        if (responseBody.type == "text") {
                            inputFormat = "PROMPT_TEXT";
                        }
                        else if (responseBody.type == "video") {
                            inputFormat = "PROMPT_VIDEO";
                        }
                        else if (responseBody.type == "stitch") {
                            inputFormat = "STITCHED";
                        }
                        else if (responseBody.type == "animation") {
                            inputFormat = "UPLOAD";
                        }
                    }
                    if (responseBody.state === "FAILED") {
                        logEventCreate("FAILED", inputFormat);
                        if (tile) {
                            tile.onFailed();
                            this.setUpRemoveCallback(GridPages.MyGallery, tile);
                        }
                        clearInterval(interval);
                        isRequestInProgress = false;
                        return;
                    }
                    if (responseBody.state === "SUCCESS") {
                        logEventCreate("SUCCESS", inputFormat);
                        clearInterval(interval);
                        if (tile && this.tileData[GridPages.MyGallery]) {
                            this.tileData[GridPages.MyGallery][tile.getId()] = {
                                tile: tile,
                                id: responseBody.id,
                                animation_preview: responseBody.previewPluginUrl.toString(),
                                bitmoji_animation: responseBody.bitmojiUrl.toString()
                            };
                            tile.setType(responseBody.type);
                            if (responseBody.description) {
                                tile.addDescription(responseBody.description);
                            }
                            if (responseBody.type === "stitch") {
                                tile.addBlendIcon(this.blendIcon);
                            }
                            tile.hasPreview = true;
                            const fileName = responseBody.id + "_" + "animation_preview" + ".webp";
                            (_a = this.assetLibImporter) === null || _a === void 0 ? void 0 : _a.downloadAsset(responseBody.previewPluginUrl, fileName, (response) => {
                                if (!this.isActive) {
                                    return;
                                }
                                if (response.success && tile) {
                                    tile.addPreview(response.path);
                                }
                            });
                            this.setUpClickEvent(GridPages.MyGallery, tile);
                            this.setUpRemoveCallback(GridPages.MyGallery, tile);
                        }
                    }
                    isRequestInProgress = false;
                });
            };
            const interval = setInterval(() => {
                if (!this.isActive) {
                    clearInterval(interval);
                    return;
                }
                if (isRequestInProgress) {
                    return;
                }
                sendAnimationRequest();
            }, 5000);
            this.connections.push(interval);
        };
    }
    setReturnFunction(returnFunction) {
        this.returnFunction = returnFunction;
    }
    showMyGalleryPage() {
        if (this.tabBar) {
            this.tabBar.currentIndex = GridPages.MyGallery;
        }
    }
    getAnimationId(pageName, id) {
        return this.tileData[pageName][id].id;
    }
    clearSelection() {
        Object.keys(this.pages).forEach((pageType) => {
            var _a;
            (_a = this.pages[pageType]) === null || _a === void 0 ? void 0 : _a.clearSelection();
        });
    }
    deinit() {
        this.isActive = false;
    }
}
