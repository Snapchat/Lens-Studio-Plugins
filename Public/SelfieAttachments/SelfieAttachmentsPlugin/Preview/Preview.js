import * as Ui from 'LensStudio:Ui';

import { PreviewMenu } from './PreviewMenu.js';
import { ChangeGeometryMenu } from './ChangeGeometryMenu.js';
import { AssetPreview } from './AssetPreview.js';
import { DraftMeshPreview } from '../HomeScreen/DraftMeshPreview.js';

import app from '../../application/app.js';

export class Preview {
    constructor(onStateChanged) {
        this.previewMenu = new PreviewMenu(onStateChanged, this.reset.bind(this));
        this.changeGeometryMenu = new ChangeGeometryMenu(onStateChanged, this.reset.bind(this));
        this.assetPreview = new AssetPreview(onStateChanged);
        this.draftMeshPreview = new DraftMeshPreview(onStateChanged, this.reset.bind(this));

        this.currentPreviewMenuState = PreviewMenuState.PreviewMenu;
        this.onStateChanged = onStateChanged;
        this.connections = [];
    }

    init() {
        this.assetPreview.init();
    }

    stop() {
        this.assetPreview.reset(true);
        this.draftMeshPreview.reset();
    }

    reset() {
        this.assetPreview.reset(false);
        this.draftMeshPreview.reset();
    }

    updatePreview(state) {
        this.state = state;

        if (state.sub_screen && state.sub_screen == 'draft_mesh') {
            this.currentPreviewMenuState = PreviewMenuState.ChangeGeometryMenu;

            this.changeGeometryMenu.updatePreview(state);
            this.draftMeshPreview.reset(state);
        } else {
            this.previewMenu.updatePreview(state);
            this.assetPreview.updatePreview(state);
            this.draftMeshPreview.reset();
            this.currentPreviewMenuState = PreviewMenuState.PreviewMenu;
        }

        this.menuWidget.currentIndex = this.currentPreviewMenuState;
        this.rightSideWidget.currentIndex = this.currentPreviewMenuState;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        this.menuWidget = new Ui.StackedWidget(this.widget);

        this.menuWidget.addWidget(this.previewMenu.create(this.menuWidget));
        this.menuWidget.addWidget(this.changeGeometryMenu.create(this.menuWidget));

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
        this.rightSideWidget.addWidget(this.draftMeshPreview.create(this.rightSideWidget));

        layout.addWidget(this.rightSideWidget);

        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        this.widget.layout = layout;

        this.connections.push(this.changeGeometryMenu.backButton.onClick.connect(function() {
            this.currentPreviewMenuState = PreviewMenuState.PreviewMenu;
            app.log('', { 'enabled': false });

            this.draftMeshPreview.reset();
            this.assetPreview.showFooter();
            this.menuWidget.currentIndex = this.currentPreviewMenuState;
            this.rightSideWidget.currentIndex = this.currentPreviewMenuState;
        }.bind(this)));

        return this.widget;
    }
}

const PreviewMenuState = {
    PreviewMenu: 0,
    ChangeGeometryMenu: 1,
    RetextureMenu: 2
};
