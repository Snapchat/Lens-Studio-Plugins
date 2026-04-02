// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { GalleryItem } from "./GalleryItem.js";
export class Gallery {
    constructor(onTileClickCallback, onImportClickCallback, onReloadClickCallback, onScrollToBottomCallback, onSearchChangedCallback) {
        this.items = [];
        this.isWaitingForCallback = false;
        this.pendingPreviews = {};
        this.tilesPerRow = 3;
        this.onTileClickCallback = onTileClickCallback;
        this.onImportClickCallback = onImportClickCallback;
        this.onReloadClickCallback = onReloadClickCallback;
        this.onScrollToBottomCallback = onScrollToBottomCallback;
        this.onSearchChangedCallback = onSearchChangedCallback;
    }
    create(parent) {
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
        scrollWidget.setContentsMargins(0, 0, 16, 0);
        scrollWidget.layout = grid;
        this.verticalScrollArea = new Ui.VerticalScrollArea(gridWidget);
        this.verticalScrollArea.setWidget(scrollWidget);
        this.verticalScrollArea.onValueChange.connect((value) => {
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
    createHeader(parent) {
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
        layout.addWidget(reloadButton);
        layout.addWidget(searchLine);
        widget.layout = layout;
        searchLine.onTextChange.connect((text) => {
            this.onSearchChangedCallback(text);
        });
        reloadButton.onClick.connect(() => {
            this.onReloadClickCallback();
        });
        return widget;
    }
    addItem(id, description, previewUrl, isDefault = false, inProgress = false, isTraining = false, isTrained = false) {
        const startIndex = this.items.length;
        const item = this.createItem(id, description, previewUrl, isDefault, inProgress, isTraining, isTrained);
        if (item) {
            item.widget.visible = false;
            this.appendToLayout(startIndex);
            item.widget.visible = true;
        }
    }
    addItems(itemsData) {
        const startIndex = this.items.length;
        const newItems = [];
        itemsData.forEach((data) => {
            const item = this.createItem(data.id, data.description, data.previewUrl, data.isDefault ?? false, data.inProgress ?? false, data.isTraining ?? false, data.isTrained ?? false);
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
    createItem(id, description, previewUrl, isDefault, inProgress, isTraining, isTrained) {
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
        item.setOnClickCallback((id) => {
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
        });
        item.setOnImportClickCallback((id) => {
            return this.onImportClickCallback(id);
        });
        item.addDescription(description);
        this.items.push(item);
        return item;
    }
    addPreview(id, previewUrl) {
        if (this.pendingPreviews[id]) {
            this.pendingPreviews[id].addPreview(previewUrl);
        }
    }
    setFailed(id) {
        if (this.pendingPreviews[id]) {
            this.pendingPreviews[id].hideLoadingOverlay();
            this.pendingPreviews[id].setFailed();
        }
    }
    setItemTrained(id) {
        if (this.pendingPreviews[id]) {
            this.pendingPreviews[id].hideLoadingOverlay();
            this.pendingPreviews[id].setTrained();
            delete this.pendingPreviews[id];
        }
    }
    appendToLayout(startIndex) {
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
    rebuildLayout() {
        if (!this.gridLayout || !this.spacer) {
            return;
        }
        this.gridLayout.clear(Ui.ClearLayoutBehavior.KeepClearedWidgets);
        this.appendToLayout(0);
    }
    isNearBottom() {
        if (!this.verticalScrollArea) {
            return false;
        }
        return this.verticalScrollArea.value >= this.verticalScrollArea.maximum * 0.9;
    }
    reset() {
        this.items.forEach((item, i) => {
            item.widget.visible = false;
        });
        this.items = [];
        this.pendingPreviews = {};
        this.isWaitingForCallback = false;
        this.rebuildLayout();
        this.spinner.visible = true;
    }
}
