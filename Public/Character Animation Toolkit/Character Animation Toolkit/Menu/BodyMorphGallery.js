// @ts-nocheck
import { Widget } from "../components/common/widgets/widget.js";
import * as Ui from "LensStudio:Ui";
import { Grid } from "../components/ui/grid.js";
import { HBoxLayout } from "../components/common/layouts/hBoxLayout.js";
import { GridTile } from "../components/ui/gridTile.js";
import { downloadFile, listMorphs } from "../api.js";
import { VBoxLayout } from "../components/common/layouts/vBoxLayout.js";
import AssetLibImporter from "./assetLibImporter.js";
import { dependencyContainer, DependencyKeys } from "../DependencyContainer.js";
import * as FileSystem from 'LensStudio:FileSystem';
import { MenuTemplate } from "./MenuTemplate.js";
export class BodyMorphGallery {
    constructor() {
        this.hasBodyMorphList = false;
        this.isDownloadingFile = false;
        this.onBodyMorphTapped = () => { };
        this.isActive = true;
        this.menuTemplate = new MenuTemplate();
        this.tileBackground = new Ui.Pixmap(import.meta.resolve('./Resources/preview.svg'));
        this.selectedBackground = new Ui.Pixmap(import.meta.resolve('./Resources/character_tile_s.svg'));
        this.tempDir = FileSystem.TempDir.create();
    }
    create(parent) {
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
        const pluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem);
        this.assetLibImporter = new AssetLibImporter(pluginSystem);
        return widget;
    }
    createGrid(widget) {
        const gridWidget = new Widget(widget);
        gridWidget.setFixedWidth(372);
        gridWidget.setFixedHeight(520);
        gridWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const gridLayout = new HBoxLayout();
        gridLayout.setContentsMargins(Ui.Sizes.Padding, 0, 0, 0);
        const galleryWidget = new Grid(gridWidget, 110, 110, 160);
        gridLayout.addWidget(galleryWidget);
        gridWidget.layout = gridLayout;
        return { widget: gridWidget, galleryWidget: galleryWidget };
    }
    createTile(galleryWidget, path, glbUrl, id) {
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
            });
            tile.select();
            this.downLoadBodyMorphAsset(glbUrl, id);
        });
        return tile;
    }
    downLoadBodyMorphAsset(glbUrl, id) {
        this.isDownloadingFile = true;
        if (!this.lbePreview) {
            this.lbePreview = dependencyContainer.get(DependencyKeys.LBEPreview);
        }
        downloadFile(glbUrl, (response) => {
            var _a;
            if (!this.isActive) {
                return;
            }
            this.isDownloadingFile = false;
            if (response.statusCode !== 200 && response.statusCode !== 201) {
                return;
            }
            const assetName = id + "_body_morph_model.glb";
            const tempFolderPath = this.tempDir.path + "/Temporary";
            if (FileSystem.exists(tempFolderPath)) {
                FileSystem.remove(tempFolderPath);
            }
            FileSystem.createDir(tempFolderPath, { recursive: false });
            const tempFilePath = tempFolderPath + "/result_file.zip";
            FileSystem.writeFile(tempFilePath, response.body.toBytes());
            Editor.Compression.Zip.unpack(tempFilePath, tempFolderPath);
            FileSystem.rename(tempFolderPath + "/" + "model.glb", tempFolderPath + "/" + assetName);
            FileSystem.copyFile(tempFolderPath + "/" + assetName, this.tempDir.path + "/" + assetName);
            FileSystem.remove(tempFolderPath);
            this.onBodyMorphTapped(this.tempDir.path + "/" + assetName);
            if (this.lbePreview) {
                (_a = this.lbePreview) === null || _a === void 0 ? void 0 : _a.sendMessage({
                    "event_type": "update_body_morph",
                    "path": this.tempDir.path + "/" + assetName
                });
            }
        });
    }
    onLibraryShown() {
        if (!this.hasBodyMorphList) {
            this.hasBodyMorphList = true;
            listMorphs(15, (response) => {
                if (!this.isActive) {
                    return;
                }
                if (response.statusCode !== 200 && response.statusCode !== 201) {
                    return;
                }
                JSON.parse(response.body).items.forEach((item) => {
                    var _a;
                    if (!item.previewUrl || !item.glbUrl) {
                        return;
                    }
                    (_a = this.assetLibImporter) === null || _a === void 0 ? void 0 : _a.downloadAsset(item.previewUrl, item.id + '_preview.webp', (response) => {
                        if (!this.isActive) {
                            return;
                        }
                        if (response.success && this.grid) {
                            const tile = this.createTile(this.grid, response.path, item.glbUrl, item.id);
                        }
                    });
                });
            }, null);
        }
    }
    setOnBodyMorphTapped(callback) {
        this.onBodyMorphTapped = callback;
    }
    deinit() {
        this.isActive = false;
    }
}
