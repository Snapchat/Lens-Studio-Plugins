// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import {GalleryItem} from "./GalleryItem.js";

export class Gallery {

    private allItems: GalleryItem[] = [];
    private visibleItems: GalleryItem[] = [];
    private parent: Ui.Widget | undefined;
    private gridLayout: Ui.GridLayout | undefined;
    private spacer: Ui.Widget | undefined;
    private spinner: Ui.ProgressIndicator;
    private onTileClickCallback: Function;
    private onImportClickCallback: Function;
    private onReloadClickCallback: Function;
    private isWaitingForCallback: boolean = false;
    private pendingPreviews: Record<string, GalleryItem> = {};
    private tilesPerRow = 3;
    private searchText: string;

    constructor(onTileClickCallback: Function, onImportClickCallback: Function, onReloadClickCallback: Function) {
        this.onTileClickCallback = onTileClickCallback;
        this.onImportClickCallback = onImportClickCallback;
        this.onReloadClickCallback = onReloadClickCallback;
        this.searchText = "";
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
        const verticalScrollArea = new Ui.VerticalScrollArea(gridWidget);
        verticalScrollArea.setWidget(scrollWidget);

        const scrollLayout = new Ui.BoxLayout();
        scrollLayout.setDirection(Ui.Direction.TopToBottom);
        scrollLayout.addWidget(verticalScrollArea);
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

        layout.addWidget(reloadButton);
        layout.addWidget(searchLine);

        widget.layout = layout;

        searchLine.onTextChange.connect((text: string) => {
            this.onSearchTextChanged(text.toLowerCase());
        })

        reloadButton.onClick.connect(() => {
            this.onReloadClickCallback();
        })

        return widget;
    }

    addItem(id: string, description: string, previewUrl: string, isDefault: boolean = false, inProgress: boolean = false, isTraining: boolean = false, isTrained: boolean = false) {
        if (!this.parent || !this.gridLayout) {
            return;
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
            this.onImportClickCallback(id);
        })

        item.addDescription(description);

        this.allItems.push(item);
        if (this.shouldItemBeVisible(item)) {
            this.visibleItems.push(item);
        }

        this.arrangeLayout();
    }

    addPreview(id: string, previewUrl: string) {
        if (this.pendingPreviews[id]) {
            this.pendingPreviews[id].addPreview(previewUrl);
        }
    }

    setFailed(id: string) {
        this.pendingPreviews[id].setFailed();
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

    private onSearchTextChanged(newSearchText: string) {
        this.searchText = newSearchText;
        this.selectVisibleItems();
    }

    private selectVisibleItems() {
        this.visibleItems = [];
        this.allItems.forEach((item: GalleryItem) => {
            if (this.shouldItemBeVisible(item)) {
                item.widget.visible = true;
                this.visibleItems.push(item);
            }
            else {
                item.widget.visible = false;
            }
        })

        this.arrangeLayout();
    }

    private shouldItemBeVisible(item: GalleryItem) {
        if ((this.searchText === "" || item.getDescription().toLowerCase().search(this.searchText) !== -1)) {
            return true;
        }

        return false;
    }

    reset() {
        this.allItems.forEach((item, i) => {
            item.widget.visible = false;
        })
        this.allItems = [];
        this.visibleItems = [];
        this.pendingPreviews = {};
        this.isWaitingForCallback = false;
        this.arrangeLayout();
        this.spinner.visible = true;
    }
}
