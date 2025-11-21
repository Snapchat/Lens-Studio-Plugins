import * as Ui from 'LensStudio:Ui';

import { Preview } from './Preview/Preview.js';
import { HomeScreen } from './HomeScreen/HomeScreen.js';

import app from '../application/app.js';

import { logEventOpen } from '../application/analytics.js';

export class ThreeDAssetGenerationPlugin {

    stateChanged(state) {
        if (state.init === true) {
            this.homeScreen.init();
            this.views.currentIndex = 0;
        }

        if (state.screen) {
            // rework to event dispatcher
            if (state.screen == 'preview') {
                this.preview.updatePreview(state);
                this.views.currentIndex = 1;
            } else if (state.screen == 'default') {
                this.homeScreen.reset(state);
                this.views.currentIndex = 0;
            }
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

    showPercentage(text, value) {
        if (this.errorScreen) {
            this.errorScreen.visible = true;
            this.errorScreen.currentIndex = 1;
            this.progressScreen.widget.visible = true;
            this.statusScreen.visible = false;

            this.progressScreen.value = value;
            this.progressScreen.text = text;
        }
    }

    stop() {
        this.views.currentIndex = 0;
        this.homeScreen.stop();
        this.preview.stop();
    }

    close() {
        this.isActive = false;
        this.stop();
    }

    setName(name) {
        //this.widget.windowTitle = name;
    }

    constructor(pluginSystem, descriptor) {
        app.initialize(this, pluginSystem);
    }

    createWidget(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.isActive = false;

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

        this.init();

        return this.widget;
    };

    show() {
        if (this.isActive) {
            this.widget.show();
            this.widget.raise();
            this.widget.activateWindow();
        }
    }

    init() {
        logEventOpen();
        this.homeScreen.init();
        //this.preview.init();
        if (this.hideError) {
            this.hideError();
        }
    }

    configureDialog() {
        this.views = new Ui.StackedWidget(this.widget);
        this.views.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        this.views.addWidget(this.homeScreen.create(this.views));
        this.views.addWidget(this.preview.create(this.views));

        this.views.currentIndex = 0;

        this.errorScreen = new Ui.StatusIndicator('Error happend', this.widget);
        this.errorScreen.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        this.widget.onResize.connect(() => {
            this.errorScreen.setFixedWidth(this.widget.width);
            const positionX = this.widget.width / 2 - this.errorScreen.width / 2;
            const positionY = this.widget.height - 20;
            this.errorScreen.move(positionX, positionY);
        })

        this.hideError();

        this.layout.addWidget(this.views);

        this.widget.layout = this.layout;
    }

    deinit() {
        if (this.homeScreen) {
            this.homeScreen.deinit();
        }
        if (this.preview) {
            this.preview.deinit();
        }
    }
}
