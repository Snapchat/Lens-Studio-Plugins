import * as Ui from 'LensStudio:Ui';

import { importToProject, createGenerationErrorWidget, createGennerationInProgressWidget } from '../utils.js';
import { deleteAsset, getAsset } from '../api.js';

import app from '../../application/app.js';

import { logEventAssetImport } from '../../application/analytics.js';

export class AssetPreview {
    constructor(onStateChanged) {
        this.connections = [];
        this.asset_id = null;
        this.onStateChanged = onStateChanged;
    }

    onImportToProject() {
        if (this.asset_id) {
            app.log('Importing Head Generator asset to the project...', { 'progressBar': true });

            getAsset(this.asset_id, (data) => {
                if (data) {
                    let lspkgUrl = data.lspkgLsUrl;

                    if (lspkgUrl) {
                        importToProject(lspkgUrl, (success) => {
                            logEventAssetImport(success ? "SUCCESS" : "FAILED");
                            app.log(success ? 'Head Generator asset is succesfully imported to the project' : 'Import failed, please try again');
                            this.updatePreview(this.state);
                        });
                    } else {
                        logEventAssetImport("PREPARING");
                        app.log('Files for import are still preparing. Please, try again in few seconds.');
                    }
                } else {
                    logEventAssetImport("FAILED");
                    app.log('Something went wrong during importing Head Generator asset to the project, please try again.');
                }
            });
        } else {
            logEventAssetImport("FAILED");
            app.log('Something went wrong during importing Head Generator asset to the project, please try again.');
        }
    }

    deleteAsset(id) {
        app.log('Deleting Head Generator asset...', { 'progressBar': true });

        deleteAsset(id, (response) => {
            this.deletionDialog.close();

            if (response.statusCode == 204) {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                    'exclude_id': id
                });

                app.log('Head Generator asset has been deleted.');
            } else {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                });

                app.log('Head Generator asset could not be deleted. Please, try again.');
            }
        });
    }

    init() {
    }

    createPreview(parent) {
        this.preview = new Ui.Widget(parent);
        this.preview.setFixedHeight(554);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(16, 0, 16, 0);

        this.previewImage = new Ui.MovieView(this.preview);

        this.previewImage.setFixedHeight(388);
        this.previewImage.setFixedWidth(388);

        layout.addWidgetWithStretch(this.previewImage, 0, Ui.Alignment.AlignCenter);

        this.preview.layout = layout;

        return this.preview;
    }

    updatePreview(state) {
        this.state = state;
        this.delayedMessage = null;

        if (state.object_url) {
            this.objectUrl = state.object_url;
        }

        if (state.status) {
            this.status = state.status;
            this.importToProjectButton.enabled = (this.status === 'SUCCESS');
            if (this.status === 'FAILED' || this.status === 'UNSAFE') {
                this.stackedWidget.currentIndex = 1;
                if (this.status === 'UNSAFE') {
                    app.log('This asset violates our community guidelines and should be deleted.', { 'enabled': true });
                }
            } else {
                if (state.preview_image) {
                    state.preview_image.resize(422, 422);
                    this.previewImage.movie = state.preview_image;
                    this.previewImage.animated = true;

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
    }

    createDeletionDialog() {
        // Deletion dialog
        const gui = app.gui;

        this.deletionDialog = gui.createDialog();
        this.deletionDialog.windowTitle = 'Delete Head Generator asset';
        this.deletionDialog.setModal(true);

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

        headerLabel.text = 'Delete the Head Generator asset?';
        headerLabel.fontRole = Ui.FontRole.TitleBold;
        paragraphLabel.text = 'This will delete this Head Generator asset permanently. You cannot undo this action.';

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
        if (!this.importToProjectButton || !this.generatePreviewsButton) {
            return;
        }
        this.importToProjectButton.visible = false;
        this.generatePreviewsButton.visible = true;
    }

    showImportButton() {
        if (!this.importToProjectButton || !this.generatePreviewsButton) {
            return;
        }
        this.importToProjectButton.visible = true;
        this.generatePreviewsButton.visible = false;
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(56);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 0, 16, 0);

        this.dialog = this.createDeletionDialog();

        // Import To Project button
        this.importToProjectButton = new Ui.PushButton(this.footer);
        this.importToProjectButton.text = 'Import to Project';
        const importImagePath = new Editor.Path(import.meta.resolve('../Resources/import.svg'));
        this.importToProjectButton.setIconWithMode(Editor.Icon.fromFile(importImagePath), Ui.IconMode.MonoChrome);
        this.importToProjectButton.primary = true;

        this.connections.push(this.importToProjectButton.onClick.connect(function() {
            this.onImportToProject();
        }.bind(this)));

        this.generatePreviewsButton = new Ui.PushButton(this.footer);
        this.generatePreviewsButton.text = 'Generate previews';
        this.generatePreviewsButton.primary = false;
        this.generatePreviewsButton.visible = false;

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.importToProjectButton, 0, Ui.Alignment.AlignRight);
        footerLayout.addWidgetWithStretch(this.generatePreviewsButton, 0, Ui.Alignment.AlignRight);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    getGeneratePreviewsButton() {
        return this.generatePreviewsButton;
    }

    setDeleteButton(button) {
        this.deleteButton = button;

        this.connections.push(this.deleteButton.onClick.connect(function() {
            this.dialog.show();
            app.log('', { 'enabled': false });
        }.bind(this)));
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
        this.layout.addWidget(this.stackedWidget);

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
