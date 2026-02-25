import * as Ui from 'LensStudio:Ui';

import { importToProject, createGenerationErrorWidget, createGennerationInProgressWidget } from '../utils.js';
import { deleteAsset, getAsset } from '../api.js';

import app from '../../application/app.js';

import { logEventAssetImport } from '../../application/analytics.js';
import { LazyMovieView } from './LazyMovieView.js';

import { downloadFileFromBucket } from '../utils.js';

export class AssetPreview {
    constructor(onStateChanged) {
        this.connections = [];
        this.asset_id = null;
        this.onStateChanged = onStateChanged;
        this.importCheckboxWasVisible = false;
    }

    onImportToProject() {
        if (this.asset_id) {
            app.log('Importing Selfie Attachments asset to the project...', { 'progressBar': true });

            getAsset(this.asset_id, (data) => {
                if (data) {
                    let lspkgUrl = null;

                    if (this.importWithAnimationCheckbox.checked && data.lspkgAnimationLsUrl) {
                        lspkgUrl = data.lspkgAnimationLsUrl;
                    } else {
                        lspkgUrl = data.lspkgLsUrl;
                    }

                    if (lspkgUrl) {
                        importToProject(lspkgUrl, (success) => {
                            logEventAssetImport(success ? "SUCCESS" : "FAILED");
                            app.log(success ? 'Selfie Attachments asset is succesfully imported to the project' : 'Import failed, please try again');
                        });
                    } else {
                        logEventAssetImport("PREPARING");
                        app.log('Files for import are still preparing. Please, try again in few seconds.');
                    }
                } else {
                    logEventAssetImport("FAILED");
                    app.log('Something went wrong during importing Selfie Attachments asset to the project, please try again.');
                }
            });
        } else {
            logEventAssetImport("FAILED");
            app.log('Something went wrong during importing Selfie Attachments asset to the project, please try again.');
        }
    }

    deleteAsset(id) {
        app.log('Deleting Selfie Attachments asset...', { 'progressBar': true });

        deleteAsset(id, (response) => {
            this.deletionDialog.close();

            if (response.statusCode == 204) {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                    'exclude_id': id
                });

                app.log('Selfie Attachments asset has been deleted.');
            } else {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                });

                app.log('Selfie Attachments asset could not be deleted. Please, try again.');
            }
        });
    }

    init() {
    }

    createPreview(parent) {
        const frame = new Ui.CalloutFrame(parent);
        frame.setFixedWidth(388);
        frame.setFixedHeight(388);
        frame.setContentsMargins(0, 0, 0, 0);

        const frameLayout = new Ui.BoxLayout();
        frameLayout.setDirection(Ui.Direction.TopToBottom);
        frameLayout.spacing = 0;
        frameLayout.setContentsMargins(0, 0, 0, 0);

        frame.layout = frameLayout;

        this.preview = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 0, 0, 0);

        this.staticPreviewImage = new LazyMovieView(this.preview);

        this.staticPreviewImage.setFixedHeight(386);
        this.staticPreviewImage.setFixedWidth(386);

        this.animatedPreviewImage = new LazyMovieView(this.preview);

        this.animatedPreviewImage.setFixedHeight(386);
        this.animatedPreviewImage.setFixedWidth(386);

        layout.addWidgetWithStretch(this.staticPreviewImage, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.animatedPreviewImage, 0, Ui.Alignment.AlignCenter);

        frameLayout.addWidget(this.preview)

        this.preview.layout = layout;

        return frame;
    }

    createColor(r, g, b, a) {
        const color = new Ui.Color();
        color.red = r;
        color.green = g;
        color.blue = b;
        color.alpha = a;
        return color;
    }

    updatePreview(state) {
        this.state = state;
        this.delayedMessage = null;

        this.animatedPreviewImage.movie = null;
        this.staticPreviewImage.movie = null;

        this.animatedTabBar.visible = false;

        if (state.object_url) {
            this.objectUrl = state.object_url;
        } else {
            this.objectUrl = null;
        }

        if (state.animation_url) {
            this.animationUrl = state.animation_url;
        } else {
            this.animationUrl = null;
        }

        if (state.status) {
            this.status = state.status;

            this.importToProjectButton.enabled = this.objectUrl ? true : false;

            if (state.settings.promptAnimation) {
                this.importWithAnimationCheckbox.checked = true;
                this.importWithAnimationCheckbox.visible = true;
                this.animatedTabBar.visible = true;
                this.importCheckboxWasVisible = true;

                if (this.status === 'SUCCESS') {
                    this.importWithAnimationCheckbox.enabled = true;
                } else {
                    this.importWithAnimationCheckbox.checked = false;
                    this.importWithAnimationCheckbox.enabled = false;
                }
            } else {
                this.importWithAnimationCheckbox.checked = false;
                this.importWithAnimationCheckbox.visible = false;
                this.animatedTabBar.visible = false;
                this.importCheckboxWasVisible = false;
            }

            if (this.status === 'FAILED' || this.status === 'UNSAFE') {
                this.stackedWidget.currentIndex = 1;
                if (this.status === 'UNSAFE') {
                    app.log('This asset violates our community guidelines and should be deleted.', { 'enabled': true });
                }
            } else {
                if (state.staticPreviewUrl) {
                    this.staticPreviewImage.visible = true;
                    this.animatedPreviewImage.visible = false;


                    downloadFileFromBucket(state.staticPreviewUrl, state.asset_id + '_static_preview.webp', (preview_path) => {
                        this.staticPreviewMovie = new Ui.Movie(preview_path);
                        this.staticPreviewMovie.resize(386, 386);
                        this.staticPreviewImage.movie = this.staticPreviewMovie;
                        this.staticPreviewImage.animated = true;
                    });

                    if (state.animatedPreviewUrl) {
                        downloadFileFromBucket(state.animatedPreviewUrl, state.asset_id + '_animated_preview.webp', (preview_path) => {
                            this.animatedPreviewMovie = new Ui.Movie(preview_path);
                            this.animatedPreviewMovie.resize(386, 386);
                            this.animatedPreviewImage.movie = this.animatedPreviewMovie;
                            this.animatedPreviewImage.animated = true;
                        });

                        this.animatedTabBar.visible = true;
                        this.animatedTabBar.currentIndex = 1;
                        this.onAnimatedTabBarCurrentChange(1);
                    } else {
                        this.animatedTabBar.currentIndex = 0;
                        this.onAnimatedTabBarCurrentChange(0);
                        this.animatedTabBar.visible = false;
                    }

                    this.stackedWidget.currentIndex = 0;
                } else {
                    this.stackedWidget.currentIndex = 2;
                }
            }
        } else {
            this.importToProjectButton.enabled = false;
        }

        if (state.asset_id) {
            this.asset_id = state.asset_id;
        } else {
            this.asset_id = null;
        }

        this.showFooter();
    }

    reset() {
        this.delayedMessage = null;

        this.asset_id = null;
        this.importToProjectButton.enabled = false;
        this.importWithAnimationCheckbox.checked = true;
    }

    createDeletionDialog() {
        // Deletion dialog
        const gui = app.gui;

        this.deletionDialog = gui.createDialog();
        this.deletionDialog.windowTitle = 'Delete Selfie Attachments asset';

        this.deletionDialog.resize(460, 140);

        const boxLayout1 = new Ui.BoxLayout();
        boxLayout1.setDirection(Ui.Direction.TopToBottom);

        const captionWidget = new Ui.Widget(this.deletionDialog);
        const captionLayout = new Ui.BoxLayout();
        captionLayout.setDirection(Ui.Direction.LeftToRight);

        const alertWidget = new Ui.ImageView(captionWidget);

        const alertImagePath = new Editor.Path(import.meta.resolve('../Resources/alert.png'));
        const alertImage = new Ui.Pixmap(alertImagePath);

        alertWidget.setFixedWidth(56);
        alertWidget.setFixedHeight(56);
        alertWidget.scaledContents = true;
        alertWidget.pixmap = alertImage;

        const textWidget = new Ui.Widget(captionWidget);
        const textLayout = new Ui.BoxLayout();
        textLayout.setDirection(Ui.Direction.TopToBottom);

        const headerLabel = new Ui.Label(textWidget);
        const paragraphLabel = new Ui.Label(textWidget);

        headerLabel.text = 'Delete the Selfie Attachments asset?';
        headerLabel.fontRole = Ui.FontRole.TitleBold;
        paragraphLabel.text = 'This will delete this Selfie Attachments asset permanently. You cannot undo this action.';

        textLayout.setContentsMargins(0, 0, 0, 0);
        textLayout.addWidget(headerLabel);
        textLayout.addWidget(paragraphLabel);

        textWidget.layout = textLayout;

        alertWidget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        textWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);

        captionLayout.addWidget(alertWidget);
        captionLayout.addWidget(textWidget);
        captionWidget.layout = captionLayout;

        const buttonsWidget = new Ui.Widget(this.deletionDialog);
        const buttonsLayout = new Ui.BoxLayout();
        buttonsLayout.setDirection(Ui.Direction.LeftToRight);

        const cancelButton = new Ui.PushButton(buttonsWidget);
        const deleteButton = new Ui.PushButton(buttonsWidget);

        cancelButton.text = 'Cancel';
        deleteButton.text = 'Delete';
        deleteButton.primary = true;

        this.connections.push(cancelButton.onClick.connect(function() {
            this.deletionDialog.close();
        }.bind(this)));

        this.connections.push(deleteButton.onClick.connect(function() {
            this.deleteAsset(this.asset_id);
        }.bind(this)));

        buttonsLayout.addStretch(0);
        buttonsLayout.addWidget(cancelButton);
        buttonsLayout.addWidget(deleteButton);

        buttonsWidget.layout = buttonsLayout;

        boxLayout1.addWidget(captionWidget);
        boxLayout1.addStretch(0);
        boxLayout1.addWidget(buttonsWidget);

        this.deletionDialog.layout = boxLayout1;

        return this.deletionDialog;
    }

    hideFooter() {
        this.deleteButton.visible = false;
        this.importToProjectButton.visible = false;
    }

    showFooter() {
        this.deleteButton.visible = true;
        this.importToProjectButton.visible = true;
    }

    hideImportButton() {
        if (!this.importToProjectButton || !this.importWithAnimationCheckbox || !this.previewAnimationsButton) {
            return;
        }
        this.importToProjectButton.visible = false;
        this.importWithAnimationCheckbox.visible = false;
        this.previewAnimationsButton.visible = true;
    }

    showImportButton() {
        if (!this.importToProjectButton || !this.importWithAnimationCheckbox || !this.previewAnimationsButton) {
            return;
        }
        this.importToProjectButton.visible = true;
        this.importWithAnimationCheckbox.visible = this.importCheckboxWasVisible;
        this.previewAnimationsButton.visible = false;
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(56);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 0, 16, 0);

        this.dialog = this.createDeletionDialog();

        this.importWithAnimationCheckbox = new Ui.CheckBox(this.footer);
        this.importWithAnimationCheckbox.text = 'Include animation';
        this.importWithAnimationCheckbox.checked = false;

        // Import To Project button
        this.importToProjectButton = new Ui.PushButton(this.footer);
        this.importToProjectButton.text = 'Import to project';
        const importImagePath = new Editor.Path(import.meta.resolve('../Resources/import.svg'));
        this.importToProjectButton.setIconWithMode(Editor.Icon.fromFile(importImagePath), Ui.IconMode.MonoChrome);
        this.importToProjectButton.primary = true;

        this.connections.push(this.importToProjectButton.onClick.connect(function() {
            this.onImportToProject();
        }.bind(this)));

        // Preview Animations button
        this.previewAnimationsButton = new Ui.PushButton(this.footer);
        this.previewAnimationsButton.text = 'Preview animations';
        this.previewAnimationsButton.primary = false;
        this.previewAnimationsButton.visible = false;

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.importWithAnimationCheckbox, 0, Ui.Alignment.AlignRight);
        footerLayout.addWidgetWithStretch(this.importToProjectButton, 0, Ui.Alignment.AlignRight);
        footerLayout.addWidgetWithStretch(this.previewAnimationsButton, 0, Ui.Alignment.AlignRight);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    getPreviewAnimationsButton() {
        return this.previewAnimationsButton;
    }

    setDeleteButton(button) {
        this.deleteButton = button;

        this.connections.push(this.deleteButton.onClick.connect(function() {
            this.dialog.show();
            app.log('', { 'enabled': false });
        }.bind(this)));
    }

    onAnimatedTabBarCurrentChange(index) {
        if (index == 0) {
            this.staticPreviewImage.visible = true;
            this.animatedPreviewImage.visible = false;
        } else if (index == 1) {
            this.staticPreviewImage.visible = false;
            this.animatedPreviewImage.visible = true;
        }
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(422);
        this.widget.setFixedHeight(620);
        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.stackedWidget = new Ui.StackedWidget(this.widget);
        this.stackedWidget.setContentsMargins(0, 0, 0, 0);

        this.stackedWidget.addWidget(this.createPreview(this.widget));
        this.stackedWidget.addWidget(createGenerationErrorWidget(this.widget));
        this.stackedWidget.addWidget(createGennerationInProgressWidget(this.widget));

        this.stackedWidget.currentIndex = 0;

        this.layout.addStretch(0);

        this.animatedTabBar = new Ui.TabBar(this.widget);
        this.animatedTabBar.addTab('    Static    ');
        this.animatedTabBar.addTab('   Animated   ');

        this.connections.push(this.animatedTabBar.onCurrentChange.connect((index) => {
            this.onAnimatedTabBarCurrentChange(index);
        }));

        this.layout.addWidgetWithStretch(this.animatedTabBar, 0, Ui.Alignment.AlignCenter);

        const spacer = new Ui.Widget(this.widget);
        spacer.setFixedHeight(8);
        this.layout.addWidgetWithStretch(spacer, 0, Ui.Alignment.AlignCenter);

        this.layout.addWidgetWithStretch(this.stackedWidget, 0, Ui.Alignment.AlignCenter);

        this.layout.addStretch(0);

        const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator);

        this.layout.addWidget(this.createFooter(this.widget));

        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }

    findInterface(interfaceID) {
        return this.pluginSystem.findInterface(interfaceID);
    }
}
