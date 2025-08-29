import * as Ui from 'LensStudio:Ui';

import { downloadFileFromBucket } from '../utils.js';
import { getAsset, continueGeneration } from '../api.js';

import app from '../../application/app.js';

export class DraftMeshPreview {
    constructor(onStateChanged, resetParent) {
        this.isDeinitialized = false;
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.resetParent = resetParent;

        this.hoverImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/draft_mesh_bg_hovered_state.svg')));
        this.defaultImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/draft_mesh_bg_default_state.svg')));
        this.checkedImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/draft_mesh_bg_checked_state.svg')));
        this.tiles = [[{}, {}], [{}, {}]];

        this.statusUpdater = setInterval(() => {
            this.tryToUpdateModel();
        }, 3000);
    }

    createPreview(parent) {
        this.preview = new Ui.Widget(parent);
        this.preview.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.preview.setContentsMargins(0, 0, 0, 0);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        const header = new Ui.CalloutFrame(this.preview);
        header.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        header.setFixedHeight(30);
        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);

        const headerText = new Ui.Label(header);
        headerText.text = 'Select a preview to generate a high-quality model.';

        headerLayout.addStretch(0);
        headerLayout.addWidget(headerText);
        headerLayout.addStretch(0);

        header.layout = headerLayout;

        const grid = new Ui.Widget(this.preview);
        grid.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        grid.setFixedWidth(440);
        grid.setFixedHeight(440);
        const gridLayout = new Ui.GridLayout();

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                this.tiles[i][j].tile_bg = new Ui.ImageView(grid);

                this.tiles[i][j].tile_bg.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
                this.tiles[i][j].tile_bg.scaledContents = true;
                this.tiles[i][j].tile_bg.pixmap = this.defaultImage;
                this.tiles[i][j].tile_bg.responseHover = true;

                this.tiles[i][j].checked = false;

                this.tiles[i][j].preview_loaded = i == j;
                this.tiles[i][j].tile_image = new Ui.MovieView(this.tiles[i][j].tile_bg);
                this.tiles[i][j].tile_image.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
                this.tiles[i][j].tile_image.scaledContents = true;
                this.tiles[i][j].tile_image.animated = true;

                this.tiles[i][j].loading = new Ui.StatusIndicator('', this.tiles[i][j].tile_bg);
                this.tiles[i][j].loading.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
                this.tiles[i][j].loading.setFixedHeight(216);
                this.tiles[i][j].loading.setFixedWidth(216);


                this.connections.push(this.tiles[i][j].tile_bg.onHover.connect((hovered) => {
                    if (!this.tiles[i][j].checked) {
                        if (hovered) {
                            if (this.tiles[i][j].preview_loaded) {
                                this.tiles[i][j].tile_bg.pixmap = this.hoverImage;
                            } else {
                                this.tiles[i][j].tile_bg.pixmap = this.defaultImage;
                            }
                        } else {
                            this.tiles[i][j].tile_bg.pixmap = this.defaultImage;
                        }
                    }
                }));

                this.connections.push(this.tiles[i][j].tile_image.onClick.connect(() => {
                    if (!this.tiles[i][j].checked) {
                        this.updateCheck(i, j);
                    }
                }));

                gridLayout.addWidgetAt(this.tiles[i][j].tile_bg, i, j, Ui.Alignment.AlignCenter);
            }
        }

        grid.layout = gridLayout;

        layout.addWidget(header);
        // layout.addWidget(grid);
        layout.addWidgetWithStretch(grid, 0, Ui.Alignment.AlignCenter);

        this.preview.layout = layout;

        return this.preview;
    }

    updateCheck(ai, aj) {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                if (ai == i && aj == j) {
                    if (this.tiles[i][j].checked) {
                        this.tiles[i][j].checked = false;
                        this.tiles[i][j].tile_bg.pixmap = this.hoverImage;
                    } else {
                        if (this.tiles[i][j].preview_loaded) {
                            this.tiles[i][j].checked = true;
                            this.tiles[i][j].tile_bg.pixmap = this.checkedImage;
                        }
                    }
                } else {
                    this.tiles[i][j].checked = false;
                    this.tiles[i][j].tile_bg.pixmap = this.defaultImage;
                }
            }
        }

        this.updateGenerateButton();
    }

    updateGenerateButton() {
        let anyChecked = false;
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                if (this.tiles[i][j].checked) {
                    anyChecked = true;
                }
            }
        }

        this.ctaButton.enabled = anyChecked;
    }

    generateAsset(asset_id, draft_mesh_id) {
        this.ctaButton.enabled = false;
        app.log('Creating new asset...', { 'progressBar': true });

        continueGeneration(asset_id, draft_mesh_id, (response) => {
            if (this.isDeinitialized) {
                return;
            }
            if (response.statusCode == 200) {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                    'creation': true,
                });
                app.log('3D Asset is queued. 3D Asset creation is estimated to take 10-15 min, please check back later.', { 'progressBar': true });

            } else if (response.statusCode == 422) {
                app.log('The result violates our community guidelines');

                this.ctaButton.enabled = true;
            } else {
                app.log('Something went wrong, please try again.');

                this.ctaButton.enabled = true;
            }
        });
    }

    ctaButtonClicked() {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                if (this.tiles[i][j].checked) {
                    this.generateAsset(this.asset_id, this.tiles[i][j].draft_mesh_id);
                    return;
                }
            }
        }
    }

    reset(state) {
        this.resetModel();

        if (state) {
            this.updateModel(state.assetData);
            this.updatePreview();
        }
    }

    init() {
        this.reset();
    }

    resetModel() {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                this.tiles[i][j].checked = false;
                this.tiles[i][j].tile_image.visible = false;
                this.tiles[i][j].tile_bg.pixmap = this.defaultImage;
                this.tiles[i][j].loading.visible = true;

                this.tiles[i][j].draft_mesh_id = null;
                this.tiles[i][j].draft_mesh_loaded = false;
                this.tiles[i][j].previewImageUrl = null;
                this.tiles[i][j].preview_loaded = false;
            }
        }

        this.modelIsReady = false;
        this.asset_id = null;
        this.updateGenerateButton();
    }

    tryToUpdateModel() {
        if (this.asset_id && !this.modelIsReady) {
            try {
                getAsset(this.asset_id, (data) => {
                    if (this.isDeinitialized) {
                        return;
                    }
                    if (data) {
                        this.updateModel(data);
                    }
                });
            } catch (error) {

            }
        }
    }

    updateModel(data) {
        let needsToUpdate = false;
        if (this.asset_id) {
            // model already loaded, so needs to update
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    if (this.tiles[i][j].draft_mesh_id && !this.tiles[i][j].draft_mesh_loaded) {
                        const foundDraftMesh = data.draftMeshes.find(mesh => mesh.id == this.tiles[i][j].draft_mesh_id);

                        if (!foundDraftMesh) {
                            throw Error('Coudn\'t find draft mesh');
                        }

                        if (foundDraftMesh.previewImageUrl) {
                            // download preview from bucker
                            this.tiles[i][j].draft_mesh_loaded = true;
                            this.tiles[i][j].previewImageUrl = foundDraftMesh.previewImageUrl;

                            downloadFileFromBucket(foundDraftMesh.previewImageUrl, this.tiles[i][j].draft_mesh_id + '.webp', (preview_path, tempDir) => {
                                if (this.isDeinitialized) {
                                    return;
                                }
                                const movie = new Ui.Movie(preview_path);
                                // movie.resize(216, 216);
                                movie.resize(208, 208);
                                this.tiles[i][j].tile_image.movie = movie;
                                this.tiles[i][j].preview_loaded = true;
                                this.updatePreview();
                            });
                        } else {
                            // no url, need to wait
                            needsToUpdate = true;
                        }
                    } else if (!this.tiles[i][j].draft_mesh_id) {
                        throw Error('asset_id is not null, draft_mesh_id is null, reached impossible invariant');
                    }
                }
            }
        } else {
            needsToUpdate = true;
            this.asset_id = data.id;
            for (let i = 0; i < data.draftMeshes.length; i++) {
                this.tiles[Math.floor(i / 2)][i % 2].draft_mesh_id = data.draftMeshes[i].id;
            }
        }

        if (!needsToUpdate) {
            this.modelIsReady = true;
        }
    }

    updatePreview() {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                if (this.tiles[i][j].preview_loaded) {
                    this.tiles[i][j].tile_image.visible = true;
                    this.tiles[i][j].loading.visible = false;
                } else {
                    this.tiles[i][j].tile_image.visible = false;
                    this.tiles[i][j].loading.visible = true;
                    this.tiles[i][j].loading.start();
                }
            }
        }
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(65);
        this.footer.setContentsMargins(0, 0, 0, 0);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 12, 8, 8);

        // Import To Project button
        this.ctaButton = new Ui.PushButton(this.footer);
        this.ctaButton.text = 'Generate Asset';
        this.ctaButton.primary = true;

        this.connections.push(this.ctaButton.onClick.connect(() => {
            this.ctaButtonClicked();
        }));

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.ctaButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.layout.addWidget(this.createPreview(this.widget));

        const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator);

        this.layout.addWidget(this.createFooter(this.widget));

        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }

    deinit() {
        this.isDeinitialized = true;
    }
}
