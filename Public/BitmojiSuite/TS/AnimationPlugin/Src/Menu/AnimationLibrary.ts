import {Widget} from "../components/common/widgets/widget.js";
import * as Ui from "LensStudio:Ui";
import {VBoxLayout} from "../components/common/layouts/vBoxLayout.js";
import {Grid} from "../components/ui/grid.js";
import {HBoxLayout} from "../components/common/layouts/hBoxLayout.js";
import {GridTile} from "../components/ui/gridTile.js";
import AssetLibImporter from "./assetLibImporter.js";
import {dependencyContainer, DependencyKeys} from "../DependencyContainer.js";
import {LBEPreview} from "../Preview/LBEPreview.js";
import {Preview} from "../Preview/Preview.js";
import {MenuTemplate} from "./MenuTemplate.js";
import * as FileSystem from 'LensStudio:FileSystem';
import {deleteAnimationById, getAnimationById, getMyAnimations} from "../api.js";
import {logEventCreate} from "../analytics.js";

export enum GridPages {
    Actions,
    Emotions,
    MyGallery
}

export class AnimationLibrary {

    private pages: { [key in GridPages]?: Grid } = {};
    private tabBar: Ui.TabBar | undefined;
    private actionsIdMap: { [key: string]: string } = {};
    private emotionsIdMap: { [key: string]: string } = {};
    private actionsIds: string[] = [];
    private emotionsIds: string[] = [];
    private tileData: { [key in GridPages]?: { [tileId: string]: {
                tile: any,
                id: string,
                animation_preview: any,
                bitmoji_animation: any
            }}} = {};
    private isActive: boolean;
    private maxInitialPreviewTiles: number = 24
    private tileBackground: Ui.Pixmap;
    private tileHoveredBackground: Ui.Pixmap;
    private tileFailedBackground: Ui.Pixmap;
    private menuTemplate: MenuTemplate;
    private connections: Array<any> = [];
    private assetLibImporter: AssetLibImporter | undefined;
    private preview: Preview | undefined;
    private lbePreview: LBEPreview | undefined;
    private returnFunction: Function = () => {};

    constructor() {
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

        this.actionsIdMap = JSON.parse(FileSystem.readFile(new Editor.Path(import.meta.resolve("./actionsIdMap.json"))));
        Object.keys(this.actionsIdMap).forEach(id => {
            this.actionsIds.push(id);
        })

        this.emotionsIdMap = JSON.parse(FileSystem.readFile(new Editor.Path(import.meta.resolve("./emotionsIdMap.json"))));
        Object.keys(this.emotionsIdMap).forEach(id => {
            this.emotionsIds.push(id);
        })
    }

    create(parent: Widget, onReturnCallback: Function): Widget {
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

        this.preview = dependencyContainer.get(DependencyKeys.Preview) as Preview;
        this.lbePreview = dependencyContainer.get(DependencyKeys.LBEPreview) as LBEPreview;
        const pluginSystem: Editor.PluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem) as Editor.PluginSystem;
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

        searchLine.onTextChange.connect((text: string) => {
            (Object.keys(this.pages) as unknown as GridPages[]).forEach((pageType) => {
                this.pages[pageType]?.onSearchTextChanged(text.toLowerCase());
            });
        })

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

    private setUpGrid(pageName: GridPages, ids: string[], idMap: { [key: string]: string }): void {
        if (!this.tileData[pageName] || !this.assetLibImporter || !this.preview || !this.lbePreview) {
            return;
        }

        const tileData = this.tileData[pageName];
        this.assetLibImporter.fetchAssets(0, ids, (assetData: {id: string; animation_preview: string; bitmoji_animation: string}) => {
            if (!this.isActive) {
                return;
            }
            const tile = this.addNewTile(pageName);
            if (idMap[assetData.id]) {
                tile?.addDescription(idMap[assetData.id].replace(/-/g, ' ').replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim());
            }
            if (tile) {
                tileData[tile.getId()] = {
                    tile: tile,
                    id: assetData.id,
                    animation_preview: assetData.animation_preview,
                    bitmoji_animation: assetData.bitmoji_animation
                };

                if (this.assetLibImporter && this.preview && this.lbePreview) {
                    this.setUpClickEvent(pageName, tile);
                }
            }
        }, () => {
            if (!this.isActive) {
                return;
            }

            this.pages[pageName]?.resetScroll();
        });
    }

    private setMyGalleryAnimations(pageName: GridPages): void {
        if (!this.tileData[pageName] || !this.assetLibImporter || !this.preview || !this.lbePreview) {
            return;
        }
        const tileData = this.tileData[pageName];
        let items: any[] = [];
        getMyAnimations((response: any, isNextPage: boolean) => {
            if (!this.isActive) {
                return;
            }
            if (response.statusCode !== 200 && response.statusCode !== 201) {
                return;
            }

            items.push(...JSON.parse(response.body.toString()).items);

            if (isNextPage) {
                return;
            }

            items = items.reverse();

            items.forEach((item: any) => {
                if (item.state != "SUCCESS" && item.state != "FAILED") {
                    const startIntervalFunction =  this.addAnimationToMyGallery("");
                    startIntervalFunction(item.id);
                    return;
                }
                if (!this.assetLibImporter || !this.preview || !this.lbePreview) {
                    return;
                }
                const tile = this.addNewTile(pageName);
                tile?.addRemoveButton();

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
                    this.setUpClickEvent(GridPages.MyGallery, tile);
                    this.setUpRemoveCallback(GridPages.MyGallery, tile);
                }
            })

            this.pages[pageName]?.resetScroll();
        });

        this.setUpScrollEvent(pageName);
    }

    private createGrid(widget: Ui.Widget, cnt: number): {widget: Widget; galleryWidget: Grid} {
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

        return {widget: gridWidget, galleryWidget : galleryWidget};
    }

    private setUpScrollEvent(pageName: GridPages) {
        const page = this.pages[pageName] as Grid;

        page.addOnScrollValueChangedCallback((value: number) => {
            if (!this.isActive || !this.tileData[pageName] || !this.assetLibImporter) {
                return;
            }
            const tileData = this.tileData[pageName];
            const rowCount: number = Math.floor((page.getVisibleTiles().length + 2) / 3);
            const scrollStepPerRow: number = 1 / rowCount;
            const maxPreviewTileIdx: number = Math.min(this.maxInitialPreviewTiles + Math.ceil(value / scrollStepPerRow) * 3, page.getVisibleTiles().length);
            const visibleTiles = page.getVisibleTiles();
            const to = Math.max(0, visibleTiles.length - maxPreviewTileIdx);

            for (let i = visibleTiles.length - 1; i >= to; i--) {
                const curId: number = visibleTiles[i].getId();
                if (tileData[curId] && !tileData[curId].tile.hasPreview && tileData[curId].animation_preview) {
                    const fileName = tileData[curId].id + "_" + "animation_preview" + ".webp";
                    tileData[curId].tile.hasPreview = true;
                    this.assetLibImporter?.downloadAsset(tileData[curId].animation_preview, fileName, (response: any) => {
                        if (!this.isActive) {
                            return;
                        }
                        if (response.success && tileData[curId].tile) {
                            tileData[curId].tile.addPreview(response.path);
                        }
                    })
                }
            }
        })
    }

    private setUpClickEvent(pageName: GridPages, tile: GridTile) {
        if (!this.tileData[pageName]) {
            return;
        }

        const tileData = this.tileData[pageName];

        tile.addOnClickCallback((id: number) => {
            this.preview?.onAnimationLoadStart();
            this.clearSelection();
            this.pages[pageName]?.selectTile(id);

            const bFileName = tileData[tile.getId()].id + "_" + "bitmoji_animation" + ".fbx";
            this.assetLibImporter?.downloadAsset(tileData[tile.getId()].bitmoji_animation, bFileName, (response: any) => {
                if (!this.isActive) {
                    return;
                }
                if (response.success && tile) {
                    this.lbePreview?.sendMessage({
                        "event_type": "update_animation",
                        "path": response.path,
                        "type": tile.getType()
                    });
                    if (pageName === GridPages.Actions) {
                        this.preview?.onAnimationSelected(response.path, "ACTIONS");
                    }
                    else if (pageName === GridPages.Emotions) {
                        this.preview?.onAnimationSelected(response.path, "EMOTIONS");
                    }
                    else if(pageName === GridPages.MyGallery) {
                        if (tile.getType() == "text") {
                            this.preview?.onAnimationSelected(response.path, "PROMPT_TEXT");
                        }
                        else if (tile.getType() == "video") {
                            this.preview?.onAnimationSelected(response.path, "PROMPT_VIDEO");
                        }
                        else {
                            this.preview?.onAnimationSelected(response.path, "MY_GALLERY");
                        }
                    }
                }
            })
        })
    }

    private setUpRemoveCallback(pageName: GridPages, tile: GridTile) {
        tile.addOnRemoveCallback((id: number) => {
            if (this.tileData[pageName] && this.tileData[pageName][tile.getId()] && this.tileData[pageName][tile.getId()].id) {
                deleteAnimationById(this.tileData[pageName][tile.getId()].id);
            }
            this.pages[pageName]?.onTileRemoved();

        })
    }

    private createTile(galleryWidget: Grid) {
        const tile = new GridTile(galleryWidget, galleryWidget.getAllTiles().length);
        tile.background = this.tileBackground;
        tile.hoveredBackground = this.tileHoveredBackground;
        tile.errorBackground = this.tileFailedBackground;
        galleryWidget.addTile(tile);
        return tile;
    }

    private addNewTile(pageName: GridPages): GridTile | null {
        if (this.pages[pageName]) {
            const tile: GridTile = this.createTile(this.pages[pageName]);
            return tile;
        }

        return null;
    }

    addAnimationToMyGallery(inputFormat: string) {
        this.pages[GridPages.MyGallery]?.resetScroll();
        const tile = this.addNewTile(GridPages.MyGallery);
        tile?.addRemoveButton();
        return (animationId: string | null) => {
            if (!this.isActive) {
                return;
            }
            if (!animationId){
                if (tile) {
                    logEventCreate("FAILED", inputFormat);
                    tile.onFailed();
                    this.setUpRemoveCallback(GridPages.MyGallery, tile);
                }
                return;
            }

            let isRequestInProgress = false;
            tile?.setProgress(0);

            const sendAnimationRequest = () => {
                isRequestInProgress = true;
                getAnimationById(animationId, (response: any) => {
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
                    tile?.setProgress(responseBody.progressPercent);
                    if (inputFormat === "") {
                        if (responseBody.type == "text") {
                            inputFormat = "PROMPT_TEXT";
                        } else if (responseBody.type == "video") {
                            inputFormat = "PROMPT_VIDEO";
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
                            tile.hasPreview = true;
                            const fileName = responseBody.id + "_" + "animation_preview" + ".webp";
                            this.assetLibImporter?.downloadAsset(responseBody.previewPluginUrl, fileName, (response: any) => {
                                if (!this.isActive) {
                                    return;
                                }
                                if (response.success && tile) {
                                    tile.addPreview(response.path);
                                }
                            })

                            this.setUpClickEvent(GridPages.MyGallery, tile);
                            this.setUpRemoveCallback(GridPages.MyGallery, tile);
                        }
                    }
                    isRequestInProgress = false;
                })
            }

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
        }
    }

    setReturnFunction(returnFunction: Function) {
        this.returnFunction = returnFunction;
    }

    showMyGalleryPage() {
        if (this.tabBar) {
            this.tabBar.currentIndex = GridPages.MyGallery;
        }
    }

    clearSelection() {
        (Object.keys(this.pages) as unknown as GridPages[]).forEach((pageType) => {
            this.pages[pageType]?.clearSelection();
        });
    }

    deinit(): void {
        this.isActive = false;
    }
}
