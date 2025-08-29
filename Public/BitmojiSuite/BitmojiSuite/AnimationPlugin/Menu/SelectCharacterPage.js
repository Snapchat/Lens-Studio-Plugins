import * as Ui from "LensStudio:Ui";
import { MenuTemplate } from "./MenuTemplate.js";
import { Widget } from "../components/common/widgets/widget.js";
import { Grid } from "../components/ui/grid.js";
import { HBoxLayout } from "../components/common/layouts/hBoxLayout.js";
import { GridTile } from "../components/ui/gridTile.js";
import AssetLibImporter from "./assetLibImporter.js";
import { dependencyContainer, DependencyKeys } from "../DependencyContainer.js";
import { proceedWithSelectedTrack } from "../api.js";
export class SelectCharacterPage {
    constructor(animationLibrary) {
        this.connections = [];
        this.animationId = null;
        this.menuTemplate = new MenuTemplate();
        this.animationLibrary = animationLibrary;
        this.tileBackground = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/preview.svg')));
        this.selectedBackground = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/character_tile_s.svg')));
        this.isActive = true;
        this.selectedCnt = 0;
    }
    create(parent, onReturnCallback, goToGalleryPage) {
        const widget = this.menuTemplate.createWidget(parent);
        const layout = this.menuTemplate.createLayout();
        layout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, 0, Ui.Sizes.DoublePadding);
        this.createWarningDialog(onReturnCallback);
        const header = this.menuTemplate.createHeader(widget, 'Video Source', () => {
            var _a;
            (_a = this.warningDialog) === null || _a === void 0 ? void 0 : _a.show();
        });
        const contentWidget = new Widget(widget);
        contentWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const contentLayout = this.menuTemplate.createContentLayout();
        contentLayout.addWidget(this.menuTemplate.createLabel(contentWidget.toNativeWidget(), "Select Character"));
        const label = new Ui.Label(contentWidget.toNativeWidget());
        label.wordWrap = true;
        label.text = "Mark the characters you want to track for animation.";
        contentLayout.addWidget(label);
        const grid = this.createGrid(widget, 0);
        this.grid = grid.galleryWidget;
        this.generateButton = new Ui.PushButton(widget);
        this.generateButton.text = 'Generate Animation';
        this.generateButton.setIconWithMode(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/generate.svg'))), Ui.IconMode.MonoChrome);
        this.generateButton.setFixedWidth(150);
        this.generateButton.setFixedHeight(20);
        this.generateButton.primary = true;
        this.generateButton.enabled = false;
        this.connections.push(this.generateButton.onClick.connect(() => {
            if (!this.grid || !this.animationId) {
                return;
            }
            this.grid.getVisibleTiles().forEach((tile, i) => {
                if (tile.visible && tile.selected && this.animationId) {
                    const startIntervalFunction = this.animationLibrary.addAnimationToMyGallery("PROMPT_VIDEO");
                    proceedWithSelectedTrack(this.animationId, i, (response) => {
                        if (!this.isActive) {
                            return;
                        }
                        if (response.statusCode === 200 || response.statusCode === 201) {
                            startIntervalFunction(JSON.parse(response.body).id);
                        }
                        else {
                            startIntervalFunction(null);
                        }
                    });
                }
            });
            goToGalleryPage(2);
        }));
        layout.addWidget(header);
        layout.addWidgetWithStretch(contentWidget.toNativeWidget(), 0, Ui.Alignment.AlignTop);
        layout.addWidget(grid.widget.toNativeWidget());
        layout.addWidgetWithStretch(this.generateButton, 0, Ui.Alignment.AlignBottom | Ui.Alignment.AlignCenter);
        widget.layout = layout;
        const pluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem);
        this.assetLibImporter = new AssetLibImporter(pluginSystem);
        return widget;
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
    createTile(galleryWidget) {
        const tile = new GridTile(galleryWidget, galleryWidget.getAllTiles().length);
        tile.background = this.tileBackground;
        tile.clickableIfSelected = true;
        tile.checkmarkImage = this.selectedBackground;
        tile.resetContentsMargins();
        tile.radius = 8;
        galleryWidget.addTile(tile);
        tile.addOnClickCallback(() => {
            var _a;
            (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getVisibleTiles().forEach((tile) => {
                tile.selected = false;
                tile.hideCheckmarkOverlay();
            });
            if (tile.selected) {
                tile.selected = false;
                tile.hideCheckmarkOverlay();
                this.selectedCnt = 0;
                if (this.generateButton) {
                    this.generateButton.enabled = this.selectedCnt > 0;
                }
            }
            else {
                tile.selected = true;
                tile.showCheckmarkOverlay();
                this.selectedCnt = 1;
                if (this.generateButton) {
                    this.generateButton.enabled = true;
                }
            }
        });
        return tile;
    }
    addTracks(tracks) {
        if (!this.grid) {
            return;
        }
        this.selectedCnt = 0;
        this.grid.getAllTiles().forEach(tile => {
            tile.visible = false;
        });
        for (let i = this.grid.getAllTiles().length; i < tracks.length; i++) {
            this.createTile(this.grid);
        }
        this.grid.setVisibleCnt(tracks.length);
        tracks.forEach((track, i) => {
            var _a;
            if (!this.grid) {
                return;
            }
            const tile = this.grid.getVisibleTiles()[i];
            tile.selected = false;
            tile.background = this.tileBackground;
            tile.hideCheckmarkOverlay();
            (_a = this.assetLibImporter) === null || _a === void 0 ? void 0 : _a.downloadAsset(track.previewUrl, "track_" + i + ".jpg", (response) => {
                if (!this.isActive) {
                    return;
                }
                if (this.grid && response.success) {
                    tile.background = new Ui.Pixmap(new Editor.Path(response.path));
                    tile.setDefaultState();
                }
            });
        });
    }
    setAnimationId(id) {
        this.animationId = id;
    }
    createWarningDialog(onReturnCallback) {
        const pluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem);
        const gui = pluginSystem.findInterface(Ui.IGui);
        this.warningDialog = gui.createDialog();
        this.warningDialog.setFixedWidth(288);
        this.warningDialog.setFixedHeight(136);
        this.warningDialog.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding);
        const captionWidget = new Ui.Widget(this.warningDialog);
        const captionLayout = new Ui.BoxLayout();
        captionLayout.setDirection(Ui.Direction.LeftToRight);
        captionLayout.setContentsMargins(0, 0, 0, 0);
        captionLayout.spacing = Ui.Sizes.DoublePadding;
        const warningImage = new Ui.ImageView(captionWidget);
        warningImage.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/warning.svg')));
        warningImage.setFixedWidth(48);
        warningImage.setFixedHeight(48);
        warningImage.scaledContents = true;
        const textWidget = new Ui.Widget(captionWidget);
        const textLayout = new Ui.BoxLayout();
        textLayout.setContentsMargins(Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding);
        textLayout.setDirection(Ui.Direction.TopToBottom);
        textLayout.spacing = Ui.Sizes.Padding;
        const headerLabel = new Ui.Label(textWidget);
        const paragraphLabel = new Ui.Label(textWidget);
        headerLabel.text = 'Unfinished Process';
        headerLabel.fontRole = Ui.FontRole.TitleBold;
        headerLabel.foregroundRole = Ui.ColorRole.BrightText;
        paragraphLabel.text = 'Your progress will be lost and cannot be recovered.';
        paragraphLabel.wordWrap = true;
        paragraphLabel.fontRole = Ui.FontRole.Title;
        textLayout.addWidget(headerLabel);
        textLayout.addWidget(paragraphLabel);
        textWidget.layout = textLayout;
        captionLayout.addWidget(warningImage);
        captionLayout.addWidget(textWidget);
        captionWidget.layout = captionLayout;
        const buttonsWidget = new Ui.Widget(this.warningDialog);
        const buttonsLayout = new Ui.BoxLayout();
        buttonsLayout.setDirection(Ui.Direction.LeftToRight);
        buttonsLayout.setContentsMargins(0, 0, 0, 0);
        const cancelButton = new Ui.PushButton(buttonsWidget);
        const deleteButton = new Ui.PushButton(buttonsWidget);
        cancelButton.text = 'Cancel';
        deleteButton.text = 'Proceed';
        deleteButton.primary = true;
        const _this = this;
        this.connections.push(cancelButton.onClick.connect(function () {
            var _a;
            (_a = _this.warningDialog) === null || _a === void 0 ? void 0 : _a.close();
        }.bind(this)));
        this.connections.push(deleteButton.onClick.connect(function () {
            var _a;
            onReturnCallback();
            (_a = _this.warningDialog) === null || _a === void 0 ? void 0 : _a.close();
        }.bind(this)));
        buttonsLayout.addStretch(0);
        buttonsLayout.addWidget(cancelButton);
        buttonsLayout.addWidget(deleteButton);
        buttonsWidget.layout = buttonsLayout;
        layout.addWidget(captionWidget);
        layout.addStretch(0);
        layout.addWidgetWithStretch(buttonsWidget, 0, Ui.Alignment.AlignBottom | Ui.Alignment.AlignCenter);
        this.warningDialog.layout = layout;
    }
    deinit() {
        this.isActive = false;
    }
}
