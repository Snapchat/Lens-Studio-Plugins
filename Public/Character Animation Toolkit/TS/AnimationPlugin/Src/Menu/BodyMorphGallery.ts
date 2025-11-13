// @ts-nocheck
import {Widget} from "../components/common/widgets/widget.js";
import * as Ui from "LensStudio:Ui";
import {Grid} from "../components/ui/grid.js";
import {HBoxLayout} from "../components/common/layouts/hBoxLayout.js";
import {GridTile} from "../components/ui/gridTile.js";
import {downloadFile, listMorphs} from "../api.js";
import {VBoxLayout} from "../components/common/layouts/vBoxLayout.js";
import AssetLibImporter from "./assetLibImporter.js";
import {dependencyContainer, DependencyKeys} from "../DependencyContainer.js";
import * as FileSystem from 'LensStudio:FileSystem';
import {LBEPreview} from "../Preview/LBEPreview.js";
import {MenuTemplate} from "./MenuTemplate.js";

export class BodyMorphGallery {

    private hasBodyMorphList: boolean = false;
    private assetLibImporter: AssetLibImporter | undefined;
    private lbePreview: LBEPreview | undefined;
    private menuTemplate: MenuTemplate;
    private grid: Grid | undefined;
    private tileBackground: Ui.Pixmap;
    private selectedBackground: Ui.Pixmap;
    private calloutWidget: Ui.Widget | undefined;
    private tempDir: FileSystem.TempDir;
    private isDownloadingFile: boolean = false;
    private isActive: boolean;
    private onBodyMorphTapped: Function = () => {};

    constructor() {
        this.isActive = true;
        this.menuTemplate = new MenuTemplate();
        this.tileBackground = new Ui.Pixmap(import.meta.resolve('./Resources/preview.svg'));
        this.selectedBackground = new Ui.Pixmap(import.meta.resolve('./Resources/character_tile_s.svg'));
        this.tempDir = FileSystem.TempDir.create();
    }

    create(parent: Widget): Widget {
        const widget = new Widget(parent);
        widget.autoFillBackground = true;
        widget.backgroundRole = Ui.ColorRole.Base;
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const layout = new VBoxLayout();

        const grid = this.createGrid(widget.toNativeWidget());
        this.grid = grid.galleryWidget;

        layout.addWidgetWithStretch(grid.widget, 0, Ui.Alignment.AlignCenter);

        const bodyMorphLink = 'https://developers.snap.com/lens-studio/features/genai-suite/body-morph-generation';
        const bodyMorphUrlString = Ui.getUrlString('Body Morph', bodyMorphLink);
        const bodyMorphText = 'Try ' + bodyMorphUrlString + ' to create new characters.';
        this.calloutWidget = this.menuTemplate.createCalloutWidget(widget.toNativeWidget(), bodyMorphText);
        this.calloutWidget.setFixedWidth(262);
        this.calloutWidget.setFixedHeight(32);
        this.calloutWidget.move(80, 500);

        widget.layout = layout;

        const pluginSystem: Editor.PluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem) as Editor.PluginSystem;
        this.assetLibImporter = new AssetLibImporter(pluginSystem);

        return widget;
    }

    private createGrid(widget: Ui.Widget): {widget: Widget; galleryWidget: Grid} {
        const gridWidget = new Widget(widget);

        gridWidget.setFixedWidth(372);
        gridWidget.setFixedHeight(520);
        gridWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const gridLayout = new HBoxLayout();
        gridLayout.setContentsMargins(Ui.Sizes.Padding, 0, 0, 0);

        const galleryWidget = new Grid(gridWidget, 110, 110, 160);

        gridLayout.addWidget(galleryWidget);
        gridWidget.layout = gridLayout;

        return {widget: gridWidget, galleryWidget : galleryWidget};
    }

    private createTile(galleryWidget: Grid, path: Editor.Path, glbUrl: string, id: string) {
        if (this.calloutWidget) {
            this.calloutWidget.visible = false;
        }
        const tile = new GridTile(galleryWidget, galleryWidget.getAllTiles().length);
        tile.background = this.tileBackground;
        tile.hoveredBackground = this.selectedBackground;
        tile.clickableIfSelected = true;
        tile.addBodyMorphPreview(path);
        galleryWidget.addTile(tile);

        tile.addOnClickCallback(() => {
            if (this.isDownloadingFile) {
                return;
            }

            galleryWidget.getAllTiles().forEach(curTile => {
                curTile.deselect();
            })
            tile.select();
            this.downLoadBodyMorphAsset(glbUrl, id);
        })

        return tile;
    }

    private downLoadBodyMorphAsset(glbUrl: string, id: string) {
        this.isDownloadingFile = true;

        if (!this.lbePreview) {
            this.lbePreview = dependencyContainer.get(DependencyKeys.LBEPreview) as LBEPreview;
        }

        downloadFile(glbUrl, (response:any) => {
            if (!this.isActive) {
                return;
            }
            this.isDownloadingFile = false;

            if (response.statusCode !== 200 && response.statusCode !== 201) {
                return;
            }

            const assetName = id + "_body_morph_model.glb"
            const tempFolderPath = this.tempDir.path + "/Temporary";

            if (FileSystem.exists(tempFolderPath)) {
                FileSystem.remove(tempFolderPath);
            }
            FileSystem.createDir(tempFolderPath, {recursive: false});

            const tempFilePath = tempFolderPath + "/result_file.zip";
            FileSystem.writeFile(tempFilePath, response.body.toBytes());
            Editor.Compression.Zip.unpack(tempFilePath, tempFolderPath);
            FileSystem.rename(tempFolderPath + "/" + "model.glb", tempFolderPath + "/" + assetName)
            FileSystem.copyFile(tempFolderPath + "/" + assetName, this.tempDir.path + "/" + assetName);
            FileSystem.remove(tempFolderPath);

            this.onBodyMorphTapped(this.tempDir.path + "/" + assetName);

            if (this.lbePreview) {
                this.lbePreview?.sendMessage({
                    "event_type": "update_body_morph",
                    "path": this.tempDir.path + "/" + assetName
                });
            }
        })
    }

    onLibraryShown() {
        if (!this.hasBodyMorphList) {
            this.hasBodyMorphList = true;

            listMorphs(15, (response: any) => {
                if (!this.isActive) {
                    return;
                }
                if (response.statusCode !== 200 && response.statusCode !== 201) {
                    return;
                }

                JSON.parse(response.body).items.forEach((item: any) => {
                    if (!item.previewUrl || !item.glbUrl) {
                        return;
                    }
                    this.assetLibImporter?.downloadAsset(item.previewUrl, item.id + '_preview.webp', (response: any) => {
                        if (!this.isActive) {
                            return;
                        }
                        if (response.success && this.grid) {
                            const tile = this.createTile(this.grid, response.path, item.glbUrl, item.id);
                        }
                    })
                })

            }, null);
        }
    }

    setOnBodyMorphTapped(callback: Function) {
        this.onBodyMorphTapped = callback;
    }

    deinit(): void {
        this.isActive = false;
    }
}
