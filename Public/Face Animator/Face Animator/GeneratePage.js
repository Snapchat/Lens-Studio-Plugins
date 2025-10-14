// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { ColorRole } from "LensStudio:Ui";
import { UploadVideoPage } from "./UploadVideoPage.js";
import { InfoPage } from "./InfoPage.js";
export class GeneratePage {
    constructor(onTileClickedCallback, onItemDataChangedCallback, checkGenerationState, onImportToProjectClickedCallback) {
        this.onNewAnimatorCreated = (animatorData) => {
            if (this.infoPage) {
                this.infoPage.onNewAnimatorCreated(animatorData);
            }
        };
        this.onTileClickedCallback = onTileClickedCallback;
        this.onItemDataChangedCallback = onItemDataChangedCallback;
        this.checkGenerationState = checkGenerationState;
        this.onImportToProjectClickedCallback = onImportToProjectClickedCallback;
    }
    create(parent, authComponent) {
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        widget.autoFillBackground = true;
        widget.backgroundRole = ColorRole.Base;
        widget.setFixedWidth(800);
        widget.setFixedHeight(620);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        this.uploadVideoPage = new UploadVideoPage(widget, this.onNewAnimatorCreated.bind(this));
        this.uploadVideoPage.setVideoProcessingStartListener(this.onVideoProcessingStart.bind(this));
        this.uploadVideoPage.setVideoProcessingEndListener(this.onVideoProcessingEnd.bind(this));
        this.infoPage = new InfoPage(widget, this.onTileClickedCallback, this.onItemDataChangedCallback, this.checkGenerationState, this.onImportToProjectClickedCallback, authComponent);
        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, widget);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);
        layout.addWidgetWithStretch(this.uploadVideoPage.widget, 0, Ui.Alignment.AlignLeft);
        layout.addWidgetWithStretch(separator, 0, Ui.Alignment.AlignLeft);
        layout.addWidgetWithStretch(this.infoPage.widget, 0, Ui.Alignment.AlignLeft);
        widget.layout = layout;
        return widget;
    }
    removeById(id) {
        if (this.infoPage) {
            this.infoPage.removeById(id);
        }
    }
    updateItemData(animatorData) {
        this.infoPage.updateItemData(animatorData);
    }
    updateGrid() {
        this.infoPage.updateGrid();
    }
    onVideoProcessingStart() {
        this.onVideoProcessingStartCallback();
    }
    onVideoProcessingEnd() {
        this.onVideoProcessingEndCallback();
    }
    setVideoProcessingStartListener(callback) {
        this.onVideoProcessingStartCallback = callback;
    }
    setVideoProcessingEndListener(callback) {
        this.onVideoProcessingEndCallback = callback;
    }
}
