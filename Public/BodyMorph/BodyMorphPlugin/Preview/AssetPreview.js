import * as Ui from 'LensStudio:Ui';

import { importToProject } from '../utils.js';
import app from '../../application/app.js';
import { deleteMorph } from '../api.js';
import { createGenerationErrorWidget, createGennerationInProgressWidget } from '../utils.js';
import { logEventAssetImport } from '../../application/analytics.js';

export class AssetPreview {
    constructor(onStateChanged) {
        this.connections = [];
        this.bodymorph_id = null;
        this.onStateChanged = onStateChanged;
    }

    deleteHeadmorph(id) {
        app.log(`Deleting the ${app.name}...`, { 'progressBar': true });

        deleteMorph(id, function(response) {
            this.deletionDialog.close();

            if (response.statusCode == 204) {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                    'exclude_id': id,
                });
                app.log(`${app.name} has been deleted.`);
            } else {
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                });
                app.log(`${app.name} could not be deleted. Please, try again.`);
            }
        }.bind(this));
    }

    createPreview(parent) {
        this.preview = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        this.previewImage = new Ui.MovieView(this.preview);
        this.previewImage.setFixedHeight(480);
        this.previewImage.setFixedWidth(480);

        layout.addStretch(0);
        layout.addWidget(this.previewImage);
        layout.addStretch(0);

        this.preview.layout = layout;

        return this.preview;
    }

    updatePreview(state) {
        if (state.status == 'FAILED') {
            this.stackedWidget.currentIndex = 1;
        } else if (state.status == 'SUCCESS' || state.preview_image) {
            state.preview_image.resize(480, 480);
            this.previewImage.movie = state.preview_image;
            this.previewImage.animated = true;
            this.previewImage.movie.speed = 80;
            this.stackedWidget.currentIndex = 0;
        } else {
            this.stackedWidget.currentIndex = 2;
        }

        this.objectUrl = state.object_url;

        if (this.objectUrl) {
            this.importToProjectButton.enabled = true;
        } else {
            this.importToProjectButton.enabled = false;
        }

        this.bodymorph_id = state.bodymorph_id;
        this.showFooter();
    }

    createDeletionDialog() {
        // Deletion dialog
        const gui = app.gui;

        this.deletionDialog = gui.createDialog();
        this.deletionDialog.windowTitle = `Delete ${app.name}`;

        this.deletionDialog.resize(460, 140);

        const boxLayout1 = new Ui.BoxLayout();
        boxLayout1.setDirection(Ui.Direction.TopToBottom);

        const captionWidget = new Ui.Widget(this.deletionDialog);
        const captionLayout = new Ui.BoxLayout();
        captionLayout.setDirection(Ui.Direction.LeftToRight);

        const alertWidget = new Ui.ImageView(captionWidget);

        const alertImagePath = new Editor.Path(import.meta.resolve('../Resources/alert_icon.png'));
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

        headerLabel.text = `Delete the ${app.name}?`;
        headerLabel.fontRole = Ui.FontRole.TitleBold;
        paragraphLabel.text = `This will delete this ${app.name} permanently. You cannot undo this action.`;

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
            this.deleteHeadmorph(this.bodymorph_id);
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

    onImportClicked() {
        app.log(`Importing ${app.name} to the project...`, { 'enabled': true, 'progressBar': true });
        try {
            importToProject(this.objectUrl, function(success) {
                logEventAssetImport(success ? "SUCCESS" : "FAILED");
                app.log(success ? `${app.name} is successfully imported to the project` : 'Import failed, please try again');
            }.bind(this));
        } catch (error) {
            logEventAssetImport("FAILED");
            app.log(`${app.name} import is failed. Please, try again`);
        }
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(65);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 12, 8, 8);

        this.deleteButton = new Ui.PushButton(this.footer);
        this.deleteButton.text = '';
        const deleteImagePath = new Editor.Path(import.meta.resolve('../Resources/delete.svg'));
        this.deleteButton.setIconWithMode(Editor.Icon.fromFile(deleteImagePath), Ui.IconMode.MonoChrome);

        this.dialog = this.createDeletionDialog();

        this.connections.push(this.deleteButton.onClick.connect(function() {
            this.dialog.show();
            app.log('', { 'enabled' : false });
        }.bind(this)));

        // Import To Project button
        this.importToProjectButton = new Ui.PushButton(this.footer);
        this.importToProjectButton.text = 'Import to Project';
        const importImagePath = new Editor.Path(import.meta.resolve('../Resources/import.svg'));
        this.importToProjectButton.setIconWithMode(Editor.Icon.fromFile(importImagePath), Ui.IconMode.MonoChrome);
        this.importToProjectButton.primary = true;

        this.connections.push(this.importToProjectButton.onClick.connect(() => this.onImportClicked()));

        footerLayout.addWidgetWithStretch(this.deleteButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.importToProjectButton, 0, Ui.Alignment.AlignTop);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(480);
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
