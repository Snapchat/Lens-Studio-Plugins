// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import {ColorRole} from "LensStudio:Ui";
import {UploadVideoPage} from "./UploadVideoPage.js";
import {InfoPage} from "./InfoPage.js";

export class GeneratePage {

    private uploadVideoPage: UploadVideoPage | undefined;
    private infoPage: InfoPage | undefined;
    private onTileClickedCallback: Function;
    private onItemDataChangedCallback: Function;
    private checkGenerationState: Function;

    constructor(onTileClickedCallback: Function, onItemDataChangedCallback: Function, checkGenerationState) {
        this.onTileClickedCallback = onTileClickedCallback;
        this.onItemDataChangedCallback = onItemDataChangedCallback;
        this.checkGenerationState = checkGenerationState;
    }

    create(parent: Ui.Widget, authComponent: Editor.IAuthorization): Ui.Widget {
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
        this.infoPage = new InfoPage(widget, this.onTileClickedCallback, this.onItemDataChangedCallback, this.checkGenerationState, authComponent);
        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, widget);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);

        layout.addWidgetWithStretch(this.uploadVideoPage.widget, 0, Ui.Alignment.AlignLeft);
        layout.addWidgetWithStretch(separator, 0, Ui.Alignment.AlignLeft);
        layout.addWidgetWithStretch(this.infoPage.widget, 0, Ui.Alignment.AlignLeft);

        widget.layout = layout;

        return widget;
    }

    onNewAnimatorCreated: Function = (animatorData: any) => {
        if (this.infoPage) {
            this.infoPage.onNewAnimatorCreated(animatorData);
        }
    }

    removeById(id: string) {
        if (this.infoPage) {
            this.infoPage.removeById(id);
        }
    }

    updateItemData(animatorData: any) {
        this.infoPage.updateItemData(animatorData);
    }

    updateGrid() {
        this.infoPage.updateGrid();
    }
}