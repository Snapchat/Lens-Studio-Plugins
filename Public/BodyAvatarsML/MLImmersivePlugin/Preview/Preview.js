import * as Ui from 'LensStudio:Ui';

import { PreviewMenu } from './PreviewMenu.js';
import { AssetPreview } from './AssetPreview.js';

export class Preview {
    constructor(onStateChanged, onTrainingStarted) {
        this.previewMenu = new PreviewMenu(onStateChanged, this.reset.bind(this), this.setDefaultState.bind(this), this.setPreviewState.bind(this));
        this.assetPreview = new AssetPreview(onStateChanged, onTrainingStarted);

        this.currentPreviewMenuState = PreviewMenuState.PreviewMenu;
        this.onStateChanged = onStateChanged;
        this.connections = [];
    }

    reset() {
        this.assetPreview.reset();
    }

    stop() {
        this.assetPreview.reset();
    }

    updatePreview(state) {
        this.previewMenu.updatePreview(state);
        this.assetPreview.updatePreview(state);
        this.state = state;
        this.currentPreviewMenuState = PreviewMenuState.PreviewMenu;
        this.menuWidget.currentIndex = this.currentPreviewMenuState;
    }

    previewGenerated(item, callback) {
        if (this.previewMenu.isLocked() && this.assetPreview.checkPreviewUpdate(item)) {
            callback(true);
        }
        else {
            callback(false);
        }
        // this.assetPreview.previewGenerated(item);
    }

    setDefaultState() {
        this.assetPreview.setDefaultState()
    }

    setPreviewState() {
        this.assetPreview.setPreviewState();
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        this.menuWidget = new Ui.StackedWidget(this.widget);

        this.menuWidget.addWidget(this.previewMenu.create(this.menuWidget));
        this.menuWidget.currentIndex = this.currentPreviewMenuState;

        this.menuWidget.setFixedWidth(378);
        this.menuWidget.setFixedHeight(620);

        this.menuWidget.setContentsMargins(0, 0, 0, 0);

        this.assetPreview.setDeleteButton(this.previewMenu.getDeleteButton());
        this.assetPreviewWidget = this.assetPreview.create(this.widget);

        this.previewMenu.setGenerateButton(this.assetPreview.getGenerateButton());

        layout.addWidget(this.menuWidget);
        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, this.widget);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);

        separator.setFixedHeight(564);

        layout.addWidgetWithStretch(separator, 0, Ui.Alignment.AlignTop);
        layout.addWidget(this.assetPreviewWidget);

        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        this.widget.layout = layout;

        return this.widget;
    }
}

const PreviewMenuState = {
    PreviewMenu: 0,
    ChangeGeometryMenu: 1,
    RetextureMenu: 2
};
