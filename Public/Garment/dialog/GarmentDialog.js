import * as Ui from 'LensStudio:Ui';

import { logEventOpen } from '../application/analytics.js';
import { CreationMenu } from './CreationMenu/CreationMenu.js';
import { Preview } from './Preview/Preview.js';

export const DIALOG_WIDTH = 800;
export const DIALOG_HEIGHT = 620;

export class GarmentDialog {
    constructor(dialog) {
        this.width = DIALOG_WIDTH;
        this.height = DIALOG_HEIGHT;

        this.dialog = dialog;
        this.dialog.setFixedWidth(this.width);
        this.dialog.setFixedHeight(this.height);
        this.dialog.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        this.creationMenu = new CreationMenu();
        this.preview = new Preview();

        this.configureDialog();
    };

    onLog(text, options) {
        if (options.type && options.type == 'logger') {
            if (options.enabled) {
                if (this.showError) {
                    this.showError(text, options.progressBar);
                }
            } else {
                if (this.hideError) {
                    this.hideError();
                }
            }
        }
    }

    stop() {
    }

    hideError() {
        if (this.errorScreen) {
            this.errorScreen.visible = false;
        }
    }

    showError(text, progressBar) {
        if (this.errorScreen) {
            this.errorScreen.text = text;

            this.errorScreen.visible = true;

            if (progressBar) {
                this.errorScreen.start();
            } else {
                this.errorScreen.stop();
            }
        }
    }

    setName(name) {
        this.dialog.windowTitle = name;
    }

    show() {
        if (this.isActive) {
            this.dialog.show();
            this.dialog.raise();
            this.dialog.activateWindow();
        }
    }

    close() {
        this.isActive = false;
        this.stop();
    }

    init() {
        logEventOpen();
        this.creationMenu.init();
        this.preview.init();

        if (this.hideError) {
            this.hideError();
        }
    }

    configureErrorScreen() {
        this.errorScreen = new Ui.StatusIndicator('Error happend', this.dialog);

        this.errorScreen.setFixedWidth(DIALOG_WIDTH);
        const positionX = 0;
        const positionY = DIALOG_HEIGHT - 20;
        this.errorScreen.move(positionX, positionY);

        this.hideError();
    }

    configureDialog() {
        this.widget = new Ui.Widget(this.dialog);
        this.widget.setContentsMargins(0, 0, 0, 0);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        this.configureErrorScreen();

        this.menuWidget = this.creationMenu.create(this.widget);

        layout.addWidget(this.menuWidget);

        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, this.widget);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);

        layout.addWidget(separator);

        this.previewWidget = this.preview.create(this.widget);

        layout.addWidget(this.previewWidget);

        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        this.widget.layout = layout;

        return this.dialog;
    }
}
