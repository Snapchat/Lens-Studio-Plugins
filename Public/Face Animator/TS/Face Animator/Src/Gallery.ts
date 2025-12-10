// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import {GalleryItem} from "./GalleryItem.js";

export class Gallery {

    private allItems: GalleryItem[] = [];
    private visibleItems: GalleryItem[] = [];
    private parent: Ui.Widget | undefined;
    private gridLayout: Ui.GridLayout | undefined;
    private spacer: Ui.Widget | undefined;
    private tilesPerRow = 3;
    private onTileClickCallback: Function;
    private onImportToProjectClickedCallback: Function;
    private removedItems: any = {}
    private itemsMap: any = {};

    constructor(onTileClickCallback: Function, onImportToProjectClickedCallback: Function) {
        this.onTileClickCallback = onTileClickCallback;
        this.onImportToProjectClickedCallback = onImportToProjectClickedCallback;
    }

    create(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        widget.setContentsMargins(0, 0, 0, 0);

        this.spacer = new Ui.Widget(widget);
        this.spacer.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const grid = new Ui.GridLayout();
        grid.spacing = 8;
        grid.setContentsMargins(0, 0, 0, 0);

        const scrollWidget = new Ui.Widget(widget);
        scrollWidget.setContentsMargins(0, 0, 16, 0)
        scrollWidget.layout = grid;
        const verticalScrollArea = new Ui.VerticalScrollArea(widget);
        verticalScrollArea.setWidget(scrollWidget);

        const scrollLayout = new Ui.BoxLayout();
        scrollLayout.setDirection(Ui.Direction.TopToBottom);
        scrollLayout.addWidget(verticalScrollArea);
        scrollLayout.spacing = 0;
        scrollLayout.setContentsMargins(0, 0, 0, 0);

        this.gridLayout = grid;
        this.parent = widget;

        widget.layout = scrollLayout;

        this.arrangeLayout();

        return widget;
    }

    addItem(animatorData: any) {
        const item = new GalleryItem(this.parent);
        item.setItemData(animatorData);
        this.itemsMap[animatorData.id] = item;

        this.allItems.push(item);
        this.visibleItems.push(item);

        this.arrangeLayout();

        item.setOnClickCallback((itemData: any) => {
            this.onTileClickCallback(itemData);
        })

        item.setOnImportClickCallback((itemData: any) => {
            this.onImportToProjectClickedCallback(itemData);
        })

        item.setOnRemoveCallback(this.onItemRemove.bind(this));

        return item;
    }

    addItemToFront(animatorData: any) {
        const item = new GalleryItem(this.parent);
        item.setItemData(animatorData);
        this.itemsMap[animatorData.id] = item;

        this.allItems.unshift(item);
        this.visibleItems.unshift(item);
        this.arrangeLayout();

        item.setOnClickCallback((itemData: any) => {
            this.onTileClickCallback(itemData);
        })

        item.setOnImportClickCallback((itemData: any) => {
            this.onImportToProjectClickedCallback(itemData);
        })

        item.setOnRemoveCallback(this.onItemRemove.bind(this));

        return item;
    }

    updateItemData(animatorData: any) {
        this.itemsMap[animatorData.id].setItemData(animatorData);
        if (animatorData.state == "PREVIEW_FAILED") {
            this.itemsMap[animatorData.id].setFailed();
        }
        else if (animatorData.state === "GENERATION_QUEUED" || animatorData.state === "GENERATION_RUNNING") {
            this.itemsMap[animatorData.id].showLoadingOverlay();
        }

        if (animatorData.state !== "PREVIEW_QUEUED" && animatorData.state !== "PREVIEW_RUNNING") {
            this.itemsMap[animatorData.id].hideLoading();
        }
    }

    private onItemRemove() {
        this.visibleItems = [];
        this.allItems.forEach((item) => {
            if (!item.removed && !this.removedItems[item.getId()]) {
                this.visibleItems.push(item);
            }
            else {
                item.widget.visible = false;
            }
        })

        this.arrangeLayout();
    }

    removeById(id: string) {
        this.removedItems[id] = true;
        this.onItemRemove();
    }

    private arrangeLayout() {
        if (!this.gridLayout || !this.spacer) {
            return;
        }

        this.gridLayout.clear(Ui.ClearLayoutBehavior.KeepClearedWidgets);

        let row = 0, col = 0;
        this.visibleItems.forEach((item, i) => {
            if (!this.gridLayout) {
                return;
            }
            if (col === 0) {
                this.gridLayout.setRowStretch(row, 0);
            }

            this.gridLayout.addWidgetAt(item.widget, row, col, Ui.Alignment.AlignCenter);

            col++;
            if (col >= this.tilesPerRow) {
                col = 0;
                row++;
            }
        })

        this.gridLayout.addWidgetAt(this.spacer, row, col, Ui.Alignment.Default);
        this.gridLayout.setRowStretch(row + 1, 1);
    }
}
