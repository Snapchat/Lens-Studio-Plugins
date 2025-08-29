import * as Ui from 'LensStudio:Ui';

import { PreviewMenu } from './PreviewMenu.js';
import { AssetPreview } from './AssetPreview.js';

export class Preview {
    constructor(onStateChanged) {
        this.previewMenu = new PreviewMenu(onStateChanged, this.reset.bind(this));
        this.assetPreview = new AssetPreview(onStateChanged);

        this.currentPreviewMenuState = PreviewMenuState.PreviewMenu;
        this.onStateChanged = onStateChanged;
        this.connections = [];
    }

    stop() {
        this.reset();
    }

    reset() {
        this.assetPreview.reset();
    }

    updatePreview(state) {
        this.state = state;

        this.previewMenu.updatePreview(state);
        this.assetPreview.updatePreview(state);


        this.menuWidget.currentIndex = this.currentPreviewMenuState;
        this.rightSideWidget.currentIndex = this.currentPreviewMenuState;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        this.menuWidget = new Ui.StackedWidget(this.widget);

        this.menuWidget.addWidget(this.previewMenu.create(this.menuWidget));

        this.menuWidget.currentIndex = this.currentPreviewMenuState;

        this.menuWidget.setFixedWidth(320);
        this.menuWidget.setFixedHeight(620);

        this.menuWidget.setContentsMargins(0, 0, 0, 0);

        layout.addWidget(this.menuWidget);
        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, this.widget);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);

        layout.addWidget(separator);

        this.rightSideWidget = new Ui.StackedWidget(this.widget);
        this.rightSideWidget.setContentsMargins(0, 0, 0, 0);

        this.rightSideWidget.addWidget(this.assetPreview.create(this.rightSideWidget));

        layout.addWidget(this.rightSideWidget);

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
