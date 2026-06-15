// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import {GalleryItem} from "./GalleryItem.js";

export class Gallery {

    private items: GalleryItem[] = [];
    private parent: Ui.Widget | undefined;
    private gridLayout: Ui.GridLayout | undefined;
    private spacer: Ui.Widget | undefined;
    private spinner: Ui.ProgressIndicator;
    private verticalScrollArea: Ui.VerticalScrollArea | undefined;
    private onTileClickCallback: Function;
    private onImportClickCallback: Function;
    private onReloadClickCallback: Function;
    private onScrollToBottomCallback: Function;
    private onSearchChangedCallback: Function;
    private onFavoriteClickCallback: Function;
    private onFavoritesFilterCallback: Function;
    private isWaitingForCallback: boolean = false;
    private pendingPreviews: Record<string, GalleryItem> = {};
    private tilesPerRow = 3;
    private filterButton: Ui.ToolButton | undefined;
    private filterMenu: Ui.Menu | undefined;
    private showAllAction: Ui.Action | undefined;
    private myFavoritesAction: Ui.Action | undefined;
    private _favoritesFilterActive: boolean = false;

    constructor(
        onTileClickCallback: Function,
        onImportClickCallback: Function,
        onReloadClickCallback: Function,
        onScrollToBottomCallback: Function,
        onSearchChangedCallback: Function,
        onFavoriteClickCallback: Function,
        onFavoritesFilterCallback: Function
    ) {
        this.onTileClickCallback = onTileClickCallback;
        this.onImportClickCallback = onImportClickCallback;
        this.onReloadClickCallback = onReloadClickCallback;
        this.onScrollToBottomCallback = onScrollToBottomCallback;
        this.onSearchChangedCallback = onSearchChangedCallback;
        this.onFavoriteClickCallback = onFavoriteClickCallback;
        this.onFavoritesFilterCallback = onFavoritesFilterCallback;
    }

    create(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        widget.setContentsMargins(0, 0, 0, 0);
        widget.autoFillBackground = true;
        widget.backgroundRole = Ui.ColorRole.Base;

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = Ui.Sizes.DoublePadding;

        const header = this.createHeader(widget);

        this.spacer = new Ui.Widget(widget);
        this.spacer.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const gridWidget = new Ui.Widget(widget);
        gridWidget.setContentsMargins(0, 0, 0, 0);

        const grid = new Ui.GridLayout();
        grid.spacing = 8;
        grid.setContentsMargins(0, 0, 0, 0);

        const scrollWidget = new Ui.Widget(gridWidget);
        scrollWidget.setContentsMargins(0, 0, 16, 0)
        scrollWidget.layout = grid;
        this.verticalScrollArea = new Ui.VerticalScrollArea(gridWidget);
        this.verticalScrollArea.setWidget(scrollWidget);

        this.verticalScrollArea.onValueChange.connect((value: number) => {
            if (this.verticalScrollArea && value >= this.verticalScrollArea.maximum * 0.9) {
                this.onScrollToBottomCallback();
            }
        });

        const scrollLayout = new Ui.BoxLayout();
        scrollLayout.setDirection(Ui.Direction.TopToBottom);
        scrollLayout.addWidget(this.verticalScrollArea);
        scrollLayout.spacing = 0;
        scrollLayout.setContentsMargins(0, 0, 0, 0);

        this.gridLayout = grid;
        this.parent = gridWidget;

        const spinner = new Ui.ProgressIndicator(gridWidget);
        spinner.setFixedWidth(32);
        spinner.setFixedHeight(32);
        spinner.start();
        spinner.visible = false;
        spinner.move(178, 240);

        this.spinner = spinner;

        gridWidget.layout = scrollLayout;

        layout.addWidget(header);
        layout.addWidget(gridWidget);

        widget.layout = layout;

        return widget;
    }

    private createHeader(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        widget.setContentsMargins(0, 0, 0, 0);
        widget.autoFillBackground = true;
        widget.backgroundRole = Ui.ColorRole.Base;
        widget.setFixedHeight(20);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = Ui.Sizes.HalfPadding;

        const reloadButton = new Ui.ToolButton(widget);
        reloadButton.scaledContents = true;
        const reloadIconPath = new Editor.Path(import.meta.resolve('./Resources/refresh.svg'));
        reloadButton.setIcon(Editor.Icon.fromFile(reloadIconPath));

        const searchLine = new Ui.SearchLineEdit(widget);

        this.filterButton = new Ui.ToolButton(widget);
        const filterIconPath = new Editor.Path(import.meta.resolve('./Resources/filter.svg'));
        this.filterButton.setIcon(Editor.Icon.fromFile(filterIconPath));

        this.filterMenu = new Ui.Menu(widget);

        this.showAllAction = new Ui.Action(widget);
        this.showAllAction.text = 'Show All';
        this.showAllAction.checkable = true;
        this.showAllAction.checked = true;

        this.myFavoritesAction = new Ui.Action(widget);
        this.myFavoritesAction.text = 'My Favorites';
        this.myFavoritesAction.checkable = true;
        this.myFavoritesAction.checked = false;

        this.filterMenu.addAction(this.showAllAction);
        this.filterMenu.addAction(this.myFavoritesAction);

        this.showAllAction.onToggle.connect((toggled: boolean) => {
            if (!toggled && !this.myFavoritesAction!.checked) {
                this.showAllAction!.blockSignals(true);
                this.showAllAction!.checked = true;
                this.showAllAction!.blockSignals(false);
                return;
            }
            if (toggled) {
                this.myFavoritesAction!.blockSignals(true);
                this.myFavoritesAction!.checked = false;
                this.myFavoritesAction!.blockSignals(false);
                this._favoritesFilterActive = false;
                this.onFavoritesFilterCallback(false);
            }
        });

        this.myFavoritesAction.onToggle.connect((toggled: boolean) => {
            if (!toggled && !this.showAllAction!.checked) {
                this.myFavoritesAction!.blockSignals(true);
                this.myFavoritesAction!.checked = true;
                this.myFavoritesAction!.blockSignals(false);
                return;
            }
            if (toggled) {
                this.showAllAction!.blockSignals(true);
                this.showAllAction!.checked = false;
                this.showAllAction!.blockSignals(false);
                this._favoritesFilterActive = true;
                this.onFavoritesFilterCallback(true);
            }
        });

        this.filterButton.onClick.connect(() => {
            this.filterMenu!.popup(this.filterButton!);
        });

        layout.addWidget(reloadButton);
        layout.addWidget(searchLine);
        layout.addWidget(this.filterButton);

        widget.layout = layout;

        searchLine.onTextChange.connect((text: string) => {
            this.onSearchChangedCallback(text);
        })

        reloadButton.onClick.connect(() => {
            this.onReloadClickCallback();
        })

        widget.onShow.connect(() => {
            searchLine.setFocus();
        });

        return widget;
    }

    addItem(id: string, description: string, previewUrl: string, isDefault: boolean = false, inProgress: boolean = false, isTraining: boolean = false, isTrained: boolean = false, isFavorite: boolean = false) {
        const startIndex = this.items.length;
        const item = this.createItem(id, description, previewUrl, isDefault, inProgress, isTraining, isTrained, isFavorite);
        if (item) {
            item.widget.visible = false;
            this.appendToLayout(startIndex);
            item.widget.visible = true;
        }
    }

    addItems(itemsData: Array<{id: string, description: string, previewUrl: string, isDefault?: boolean, inProgress?: boolean, isTraining?: boolean, isTrained?: boolean, isFavorite?: boolean}>) {
        const startIndex = this.items.length;
        const newItems: GalleryItem[] = [];
        itemsData.forEach((data) => {
            const item = this.createItem(data.id, data.description, data.previewUrl, data.isDefault ?? false, data.inProgress ?? false, data.isTraining ?? false, data.isTrained ?? false, data.isFavorite ?? false);
            if (item) {
                item.widget.visible = false;
                newItems.push(item);
            }
        });
        this.appendToLayout(startIndex);
        newItems.forEach((item) => {
            item.widget.visible = true;
        });
    }

    private createItem(id: string, description: string, previewUrl: string, isDefault: boolean, inProgress: boolean, isTraining: boolean, isTrained: boolean, isFavorite: boolean = false): GalleryItem | undefined {
        if (!this.parent || !this.gridLayout) {
            return undefined;
        }

        this.spinner.visible = false;

        const item = new GalleryItem(this.parent, id);
        if (isDefault) {
            item.addDefaultItemPreview();
        }
        else {
            if (!inProgress) {
                item.addPreview(previewUrl);
            }
            else {
                this.pendingPreviews[id] = item;
            }
        }

        if (isTraining) {
            this.pendingPreviews[id] = item;
            item.showLoadingOverlay();
        }
        else if (isTrained) {
            item.setTrained();
        }

        item.setOnClickCallback((id: string) => {
            if (this.isWaitingForCallback) {
                return;
            }
            item.enableLoading();
            this.isWaitingForCallback = true;
            this.onTileClickCallback(id, () => {
                if (item.state === "SUCCESS" || item.state === "FAILED" || item.state === "DEFAULT") {
                    item.disableLoading();
                }
                this.isWaitingForCallback = false;
            });
        })

        item.setOnImportClickCallback((id: string) => {
            return this.onImportClickCallback(id);
        })

        item.setOnFavoriteClickCallback((id: string, isFav: boolean) => {
            this.onFavoriteClickCallback(id, isFav, item);
        })

        item.setFavorite(isFavorite);
        item.addDescription(description);

        this.items.push(item);

        return item;
    }

    addPreview(id: string, previewUrl: string) {
        if (this.pendingPreviews[id]) {
            this.pendingPreviews[id].addPreview(previewUrl);
        }
    }

    setFailed(id: string) {
        if (this.pendingPreviews[id]) {
            this.pendingPreviews[id].hideLoadingOverlay();
            this.pendingPreviews[id].setFailed();
        }
    }

    setItemTrained(id: string) {
        if (this.pendingPreviews[id]) {
            this.pendingPreviews[id].hideLoadingOverlay();
            this.pendingPreviews[id].setTrained();
            delete this.pendingPreviews[id];
        }
    }

    private appendToLayout(startIndex: number) {
        if (!this.gridLayout || !this.spacer) {
            return;
        }

        let row = Math.floor(startIndex / this.tilesPerRow);
        let col = startIndex % this.tilesPerRow;

        for (let i = startIndex; i < this.items.length; i++) {
            if (col === 0) {
                this.gridLayout.setRowStretch(row, 0);
            }

            this.gridLayout.addWidgetAt(this.items[i].widget, row, col, Ui.Alignment.AlignCenter);

            col++;
            if (col >= this.tilesPerRow) {
                col = 0;
                row++;
            }
        }

        this.gridLayout.addWidgetAt(this.spacer, row, col, Ui.Alignment.Default);
        this.gridLayout.setRowStretch(row + 1, 1);
    }

    private rebuildLayout() {
        if (!this.gridLayout || !this.spacer) {
            return;
        }

        this.gridLayout.clear(Ui.ClearLayoutBehavior.KeepClearedWidgets);
        this.appendToLayout(0);
    }

    isNearBottom(): boolean {
        if (!this.verticalScrollArea) {
            return false;
        }
        return this.verticalScrollArea.value >= this.verticalScrollArea.maximum * 0.9;
    }

    resetFilter() {
        this._favoritesFilterActive = false;
        if (this.showAllAction && this.myFavoritesAction) {
            this.showAllAction.blockSignals(true);
            this.myFavoritesAction.blockSignals(true);
            this.showAllAction.checked = true;
            this.myFavoritesAction.checked = false;
            this.showAllAction.blockSignals(false);
            this.myFavoritesAction.blockSignals(false);
        }
    }

    reset() {
        this.items.forEach((item, i) => {
            item.widget.visible = false;
        })
        this.items = [];
        this.pendingPreviews = {};
        this.isWaitingForCallback = false;
        this.rebuildLayout();
        this.spinner.visible = true;
    }
}
