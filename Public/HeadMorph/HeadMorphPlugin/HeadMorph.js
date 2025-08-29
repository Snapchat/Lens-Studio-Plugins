import * as Ui from 'LensStudio:Ui';

import { Preview } from './Preview/Preview.js';
import { HomeScreen } from './HomeScreen/HomeScreen.js';

import app from '../application/app.js';
import { logEventOpen } from '../application/analytics.js';

export class HeadMorphPlugin {
    constructor(dialog) {
        this.width = 800;
        this.height = 620;

        this.dialog = dialog;
        this.dialog.setFixedWidth(this.width);
        this.dialog.setFixedHeight(this.height);
        this.dialog.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        this.preview = new Preview(this.stateChanged.bind(this));
        this.homeScreen = new HomeScreen(this.stateChanged.bind(this));

        this.configureDialog();

        app.subscribeOnAuth((status) => {
            if (!status) {
                this.stateChanged({
                    'screen': 'default'
                });
                this.init();
            }
        });
    };

    stateChanged(state) {
        if (state.init === true) {
            this.homeScreen.init();
            this.views.currentIndex = 0;
        }

        if (state.screen == 'preview') {
            this.preview.updatePreview(state);
            this.views.currentIndex = 1;
        } else if (state.screen == 'default') {
            this.views.currentIndex = 0;
            this.homeScreen.reset(state);
        }
    }

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
        this.views.currentIndex = 0;
        this.homeScreen.stop();
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
        this.homeScreen.init();
        if (this.hideError) {
            this.hideError();
        }
    }

    configureDialog() {
        this.views = new Ui.StackedWidget(this.dialog);

        this.views.addWidget(this.homeScreen.create(this.views));
        this.views.addWidget(this.preview.create(this.views));

        this.views.currentIndex = 0;

        this.errorScreen = new Ui.StatusIndicator('Error happend', this.dialog);

        this.errorScreen.setFixedWidth(800);
        const positionX = 800 / 2 - this.errorScreen.width / 2;
        const positionY = 600;
        this.errorScreen.move(positionX, positionY);

        this.hideError();

        return this.dialog;
    }
}
