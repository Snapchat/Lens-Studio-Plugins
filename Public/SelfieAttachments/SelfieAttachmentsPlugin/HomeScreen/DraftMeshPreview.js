import * as Ui from 'LensStudio:Ui';

import { downloadFileFromBucket } from '../utils.js';
import { getAsset, continueGeneration, continueAnimationGeneration } from '../api.js';

import app from '../../application/app.js';
import { logEventAssetCreation } from '../../application/analytics.js';

import { ProgressBar } from './ProgressBar.js';

export class DraftMeshPreview {
    constructor(onStateChanged, resetParent) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
        this.resetParent = resetParent;
        this.waitingForPreviewCount = 4;
        this.previewCallbacksQueue = [];
        this.newGenerationStartedCallbacks = [];

        this.hoverForegroundImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/draft_mesh_fg_hovered_state.svg')));
        this.checkedForegroundImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/draft_mesh_fg_checked_state.svg')));
        this.defaultForegroundImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/draft_mesh_fg_default_state_1.svg')));
        this.failedIcon = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/error_icon.svg')));

        this.tiles = [[{}, {}], [{}, {}]];
        this.animationMode = false;

        this.statusUpdater = setInterval(() => {
            this.tryToUpdateModel();
        }, 3000);
    }

    createPreview(parent) {
        this.preview = new Ui.Widget(parent);
        this.preview.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.preview.setContentsMargins(0, 0, 0, 0);
        this.preview.setFixedWidth(422);
        this.preview.setFixedHeight(555);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        // const header = new Ui.CalloutFrame(this.preview);
        // const headerLayout = new Ui.BoxLayout();
        // headerLayout.setDirection(Ui.Direction.LeftToRight);
        //
        // const headerText = new Ui.Label(header);
        // headerText.text = 'Select a preview to generate a high-quality model.';
        //
        // headerLayout.addStretch(0);
        // headerLayout.addWidget(headerText);
        // headerLayout.addStretch(0);
        //
        // header.layout = headerLayout;

        const grid = new Ui.Widget(this.preview);
        grid.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        const gridLayout = new Ui.GridLayout();

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                this.tiles[i][j].tile_bg = new Ui.CalloutFrame(grid);
                this.tiles[i][j].tile_bg.setContentsMargins(1, 1, 1, 1);
                this.tiles[i][j].tile_bg.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
                this.tiles[i][j].tile_bg.setFixedWidth(186);
                this.tiles[i][j].tile_bg.setFixedHeight(186);
                this.tiles[i][j].tile_bg.lineWidth = 1;

                this.tiles[i][j].tile_bg.setForegroundColor(this.createColor(30, 33, 38, 255));
                this.tiles[i][j].tile_bg.setBackgroundColor(this.createColor(30, 33, 38, 255));

                this.tiles[i][j].checked = false;

                this.tiles[i][j].preview_loaded = i == j;
                this.tiles[i][j].tile_image = new Ui.MovieView(this.tiles[i][j].tile_bg);
                this.tiles[i][j].tile_image.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
                this.tiles[i][j].tile_image.setFixedWidth(184);
                this.tiles[i][j].tile_image.setFixedHeight(184);
                this.tiles[i][j].tile_image.scaledContents = true;
                this.tiles[i][j].tile_image.animated = true;

                this.tiles[i][j].tile_fg = new Ui.ImageView(this.tiles[i][j].tile_bg);

                this.tiles[i][j].tile_fg.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
                this.tiles[i][j].tile_fg.setFixedWidth(186);
                this.tiles[i][j].tile_fg.setFixedHeight(186);
                this.tiles[i][j].tile_fg.scaledContents = true;
                this.tiles[i][j].tile_fg.pixmap = this.defaultForegroundImage;
                this.tiles[i][j].tile_fg.responseHover = true;

                /*
                this.tiles[i][j].loading = new Ui.StatusIndicator('', this.tiles[i][j].tile_bg);
                this.tiles[i][j].loading.setFixedHeight(216);
                this.tiles[i][j].loading.setFixedWidth(216);
                this.tiles[i][j].loading.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
                */
                this.tiles[i][j].loading = new ProgressBar(this.tiles[i][j].tile_bg);
                this.tiles[i][j].loading.widget.setFixedHeight(186);
                this.tiles[i][j].loading.widget.setFixedWidth(186);
                this.tiles[i][j].loading.widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

                this.connections.push(this.tiles[i][j].tile_fg.onHover.connect((hovered) => {
                    if (!this.tiles[i][j].checked) {
                        if (hovered) {
                            if (this.tiles[i][j].preview_loaded) {
                                this.tiles[i][j].tile_fg.pixmap = this.hoverForegroundImage;
                            } else {
                                this.tiles[i][j].tile_fg.pixmap = this.defaultForegroundImage;
                            }
                        } else {
                            this.tiles[i][j].tile_fg.pixmap = this.defaultForegroundImage;
                        }
                    }
                }));

                this.connections.push(this.tiles[i][j].tile_fg.onClick.connect(() => {
                    // Only allow selecting tiles that successfully loaded a preview.
                    if (!this.tiles[i][j].checked && this.tiles[i][j].preview_loaded && !this.tiles[i][j].failed) {
                        this.updateCheck(i, j);
                    }
                }));

                gridLayout.addWidgetAt(this.tiles[i][j].tile_bg, i, j, Ui.Alignment.AlignCenter);

                // Centered "Failed" overlay - transparent background with icon + label side by side
                this.tiles[i][j].failed_container = new Ui.Widget(this.tiles[i][j].tile_bg);
                this.tiles[i][j].failed_container.setFixedWidth(186);
                this.tiles[i][j].failed_container.setFixedHeight(186);
                this.tiles[i][j].failed_container.setContentsMargins(0, 0, 0, 0);
                this.tiles[i][j].failed_container.visible = false;

                // Outer layout for vertical centering
                const failedOuterLayout = new Ui.BoxLayout();
                failedOuterLayout.setDirection(Ui.Direction.LeftToRight);
                failedOuterLayout.setContentsMargins(0, 0, 0, 0);

                // Failed icon (error_icon.svg - standalone warning icon, no background)
                const failedIconView = new Ui.ImageView(this.tiles[i][j].failed_container);
                failedIconView.pixmap = this.failedIcon;
                failedIconView.setFixedWidth(20);
                failedIconView.setFixedHeight(20);
                failedIconView.scaledContents = true;

                // Failed label
                const failedLabel = new Ui.Label(this.tiles[i][j].failed_container);
                failedLabel.text = 'Failed';
                failedLabel.fontRole = Ui.FontRole.TitleBold;

                // Center the inner widget both vertically and horizontally
                failedOuterLayout.addStretch(1);
                failedOuterLayout.addWidgetWithStretch(failedIconView, 0, Ui.Alignment.AlignCenter);
                failedOuterLayout.addWidgetWithStretch(failedLabel, 0, Ui.Alignment.AlignCenter);
                failedOuterLayout.addStretch(1);

                this.tiles[i][j].failed_container.layout = failedOuterLayout;
            }
        }

        grid.layout = gridLayout;

        // layout.addWidget(header);
        // layout.addStretch(0);
        layout.addWidgetWithStretch(grid, 0, Ui.Alignment.AlignCenter);
        // layout.addStretch(0);

        this.preview.layout = layout;

        return this.preview;
    }

    updateCheck(ai, aj) {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                if (ai == i && aj == j) {
                    if (this.tiles[i][j].checked) {
                        this.tiles[i][j].checked = false;
                        this.tiles[i][j].tile_fg.pixmap = this.hoverForegroundImage;
                    } else {
                        if (this.tiles[i][j].preview_loaded) {
                            this.tiles[i][j].checked = true;
                            this.tiles[i][j].tile_fg.pixmap = this.checkedForegroundImage;
                        }
                    }
                } else {
                    this.tiles[i][j].checked = false;
                    this.tiles[i][j].tile_fg.pixmap = this.defaultForegroundImage;
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

    generateAsset(asset_id, driving_image_id) {
        this.newGenerationStartedCallbacks.forEach((callback) => {
            callback();
        })
        this.ctaButton.enabled = false;
        app.log('Creating new asset...', { 'progressBar': true });
        let inputFormat = "PROMPT_TEXT";
        let settings = this.parentScreen == "preview" ? "UPDATE_EXISTING" : "NEW";

        continueGeneration(asset_id, driving_image_id, (response) => {
            if (response.statusCode == 200) {
                if (this.animation_prompt) {
                    app.log('Creating animation previews...', { 'progressBar': true });
                    this.enableAnimationMode();
                } else {
                    logEventAssetCreation("SUCCESS", settings, inputFormat, "SUBMISSION");
                    this.onStateChanged({
                        'screen': 'default',
                        'needsUpdate': true,
                        'creation': true,
                    });
                    app.log('Attachment is queued. Attachment creation is estimated to take 5-10 min, please check back later.', { 'progressBar': true });
                }
            } else if (response.statusCode == 422) {
                logEventAssetCreation("GUIDELINES_VIOLATION", settings, inputFormat, "SUBMISSION");
                app.log('The result violates our community guidelines');

                this.ctaButton.enabled = true;
            } else {
                logEventAssetCreation("FAILED", settings, inputFormat, "SUBMISSION");
                app.log('Something went wrong, please try again.');

                this.ctaButton.enabled = true;
            }
        });
    }

    generateAnimation(asset_id, draft_animation_id) {
        this.newGenerationStartedCallbacks.forEach((callback) => {
            callback();
        })
        this.ctaButton.enabled = false;
        app.log('Creating new asset with animation...', { 'progressBar': true });
        let inputFormat = "PROMPT_TEXT";
        let settings = this.parentScreen == "preview" ? "UPDATE_EXISTING" : "NEW";

        continueAnimationGeneration(asset_id, draft_animation_id, (response) => {
            if (response.statusCode == 200) {
                logEventAssetCreation("SUCCESS", settings, inputFormat, "SUBMISSION");
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                    'creation': true,
                });
                app.log('Attachment with animation is queued. Attachment creation is estimated to take 2 hours, please check back later.', { 'progressBar': true });
            } else if (response.statusCode == 422) {
                logEventAssetCreation("GUIDELINES_VIOLATION", settings, inputFormat, "SUBMISSION");
                app.log('The result violates our community guidelines');

                this.ctaButton.enabled = true;
            } else {
                logEventAssetCreation("FAILED", settings, inputFormat, "SUBMISSION");
                app.log('Something went wrong, please try again.');

                this.ctaButton.enabled = true;
            }
        });
    }

    ctaButtonClicked() {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                if (this.tiles[i][j].checked) {
                    if (this.animationMode) {
                        this.generateAnimation(this.asset_id, this.tiles[i][j].driving_image_id);
                    } else {
                        this.generateAsset(this.asset_id, this.tiles[i][j].driving_image_id);
                    }
                    return;
                }
            }
        }
    }

    reset(state) {
        this.resetModel();
        this.parentScreen = null;
        this.animationMode = false;

        if (state) {
            this.parentScreen = state.screen;

            if (state.updateOnlyAnimation) {
                this.asset_id = state.assetData.id;
                this.waitingForPreviewCount = 4;
                this.animation_prompt = state.assetData.promptAnimation;
                this.enableAnimationMode();
                this.updatePreview();
            } else {
                this.updateModel(state.assetData);
                this.updatePreview();
            }
        }
    }

    init() {
        this.reset();
    }

    createColor(r, g, b, a) {
        const color = new Ui.Color();
        color.red = r;
        color.green = g;
        color.blue = b;
        color.alpha = a;
        return color;
    }

    resetTiles() {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                this.tiles[i][j].checked = false;
                this.tiles[i][j].tile_image.visible = false;
                this.tiles[i][j].tile_fg.pixmap = this.defaultForegroundImage;
                this.tiles[i][j].loading.widget.visible = true;
                this.tiles[i][j].loading.stop();
                this.tiles[i][j].loading.start();

                this.tiles[i][j].driving_image_id = null;
                this.tiles[i][j].driving_image_loaded = false;
                this.tiles[i][j].previewImageUrl = null;
                this.tiles[i][j].preview_loaded = false;
                this.tiles[i][j].state = null;
                this.tiles[i][j].failed = false;
                this.tiles[i][j].failed_container.visible = false;
            }
        }
    }

    resetModel() {
        this.resetTiles();

        this.modelIsReady = false;
        this.asset_id = null;
        this.waitingForPreviewCount = 4;
        this.animation_prompt = null;
        this.animationMode = false;
        this.updateGenerateButton();
    }

    enableAnimationMode() {
        const id = this.asset_id;

        this.resetModel();

        this.animationMode = true;
        this.ctaButton.text = 'Generate Attachment';

        this.tryToUpdateModel(id);
    }

    tryToUpdateModel(id) {
        if (!id) {
            id = this.asset_id;
        }
        if (id && !this.modelIsReady) {
            try {
                getAsset(id, (data) => {
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
                    if (this.tiles[i][j].driving_image_id && !this.tiles[i][j].driving_image_loaded) {
                        let foundDrivingImage = null;

                        if (this.animationMode) {
                            foundDrivingImage = data.drivingAnimations.find(draftAnimation => draftAnimation.id == this.tiles[i][j].driving_image_id);
                        } else {
                            foundDrivingImage = data.drivingImages.find(drivingImage => drivingImage.id == this.tiles[i][j].driving_image_id);
                        }

                        if (!foundDrivingImage) {
                            throw Error('Coudn\'t find driving image');
                        }

                        this.tiles[i][j].state = foundDrivingImage.state;
                        if (foundDrivingImage.state === 'FAILED' || foundDrivingImage.state === 'UNSAFE') {
                            // Mark tile as failed: stop showing progress and show centered failed overlay.
                            this.tiles[i][j].driving_image_loaded = true;
                            this.tiles[i][j].failed = true;
                            this.tiles[i][j].preview_loaded = false;
                            this.tiles[i][j].tile_fg.pixmap = this.defaultForegroundImage;
                            this.tiles[i][j].checked = false;
                            this.waitingForPreviewCount--;
                            if (this.waitingForPreviewCount <= 0) {
                                this.previewCallbacksQueue.forEach((callback) => {
                                    callback();
                                })
                            }
                            this.updateGenerateButton();
                            this.updatePreview();
                            continue;
                        }

                        if (this.animationMode) {
                            foundDrivingImage.previewImageUrl = foundDrivingImage.previewAnimationUrl;
                        }

                        if (foundDrivingImage.previewImageUrl) {
                            // download preview from bucker
                            this.tiles[i][j].driving_image_loaded = true;
                            this.tiles[i][j].previewImageUrl = foundDrivingImage.previewImageUrl;

                            downloadFileFromBucket(foundDrivingImage.previewImageUrl, this.tiles[i][j].driving_image_id + '.webp', (preview_path, tempDir) => {
                                const movie = new Ui.Movie(preview_path);
                                movie.resize(186, 186);
                                this.tiles[i][j].tile_image.movie = movie;
                                this.tiles[i][j].preview_loaded = true;
                                this.waitingForPreviewCount--;
                                if (this.waitingForPreviewCount <= 0) {
                                    this.previewCallbacksQueue.forEach((callback) => {
                                        callback();
                                    })
                                }
                                this.updatePreview();
                                app.log('', { 'enabled': false });
                            });
                        } else {
                            // no url, need to wait
                            needsToUpdate = true;
                        }
                    } else if (!this.tiles[i][j].driving_image_id) {
                        throw Error('asset_id is not null, driving_image_id is null, reached impossible invariant');
                    }
                }
            }
        } else {
            needsToUpdate = true;
            this.asset_id = data.id;
            this.waitingForPreviewCount = 4;
            this.animation_prompt = data.promptAnimation;
            if (this.animationMode) {
                for (let i = 0; i < data.drivingAnimations.length; i++) {
                    this.tiles[Math.floor(i / 2)][i % 2].driving_image_id = data.drivingAnimations[i].id;
                    this.tiles[Math.floor(i / 2)][i % 2].state = data.drivingAnimations[i].state;
                }
            } else {
                for (let i = 0; i < data.drivingImages.length; i++) {
                    this.tiles[Math.floor(i / 2)][i % 2].driving_image_id = data.drivingImages[i].id;
                    this.tiles[Math.floor(i / 2)][i % 2].state = data.drivingImages[i].state;
                }
            }
        }

        if (this.animation_prompt && !this.animationMode) {
            this.ctaButton.text = 'Preview animations';
        } else {
            this.ctaButton.text = 'Generate Attachment';
        }

        if (!needsToUpdate) {
            this.modelIsReady = true;
        }
    }

    addOnAllPreviewsGeneratedCallback(callback) {
        this.previewCallbacksQueue.push(callback);
    }

    addOnNewGenerationStartedCallback(callback) {
        this.newGenerationStartedCallbacks.push(callback);
    }

    updatePreview() {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                if (this.tiles[i][j].failed) {
                    this.tiles[i][j].tile_image.visible = false;
                    this.tiles[i][j].loading.widget.visible = false;
                    this.tiles[i][j].loading.stop();
                    this.tiles[i][j].failed_container.visible = true;
                } else if (this.tiles[i][j].preview_loaded) {
                    this.tiles[i][j].tile_image.visible = true;
                    this.tiles[i][j].loading.widget.visible = false;
                    this.tiles[i][j].loading.stop();
                    this.tiles[i][j].failed_container.visible = false;
                } else {
                    this.tiles[i][j].tile_image.visible = false;
                    this.tiles[i][j].loading.widget.visible = true;
                    this.tiles[i][j].loading.start();
                    this.tiles[i][j].failed_container.visible = false;
                }
            }
        }
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(56);
        this.footer.setContentsMargins(0, 0, 0, 0);

        this.footer.autoFillBackground = true;
        this.footer.backgroundRole = Ui.ColorRole.Base;

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 0, 16, 0);

        // Import To Project button
        this.ctaButton = new Ui.PushButton(this.footer);
        this.ctaButton.text = 'Generate Attachment';
        this.ctaButton.primary = false;

        this.connections.push(this.ctaButton.onClick.connect(() => {
            this.ctaButtonClicked();
        }));

        // footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.ctaButton, 0, Ui.Alignment.AlignRight);
        // footerLayout.addStretch(0);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(422);
        this.widget.setFixedHeight(620);
        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.widget.autoFillBackground = true;
        this.widget.backgroundRole = Ui.ColorRole.Mid;

        this.layout.addWidget(this.createPreview(this.widget));
        this.layout.addStretch(0);

        const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator);

        this.layout.addWidget(this.createFooter(this.widget));

        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }
}
