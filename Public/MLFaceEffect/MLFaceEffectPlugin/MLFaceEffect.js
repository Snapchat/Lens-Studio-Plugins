import * as Ui from 'LensStudio:Ui';

import { Preview } from './Preview/Preview.js';
import { HomeScreen } from './HomeScreen/HomeScreen.js';

import app from '../application/app.js';
import { logEventOpen } from '../application/analytics.js';

class PercentageScreen {
    constructor(parent) {
        this.widget = new Ui.Widget(parent);

        this.widget.setFixedWidth(800);
        this.widget.backgroundRole = Ui.ColorRole.Mid;
        this.widget.autoFillBackground = true;
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        this.layout = new Ui.BoxLayout();
        this.layout.setContentsMargins(Ui.Sizes.PaddingLarge, 0, Ui.Sizes.PaddingLarge, 0);
        this.label = new Ui.Label(this.widget);
        this.bar = new Ui.ProgressBar(this.widget);
        this.percentage = new Ui.Label(this.widget);

        this.bar.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        this.bar.setFixedHeight(Ui.Sizes.ProgressBarHeight);
        this.bar.setRange(0, 100);
        this.bar.value = 0;
        this.bar.primary = true;

        this.percentage.text = this.percentage.value + '%';

        this.layout.addWidget(this.label);
        this.layout.addWidget(this.bar);
        this.layout.addWidget(this.percentage);

        this.widget.layout = this.layout;
    }

    get value() {
        return this.bar.value;
    }

    set value(val) {
        this.bar.value = val;
        this.percentage.text = '' + this.bar.value + '%';
    }

    get text() {
        return this.label.text;
    }

    set text(val) {
        this.label.text = val;
    }
}

function createProgressScreen(parent) {
    return new PercentageScreen(parent);
}

export class MLFaceEffectPlugin {
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
                } else {
                    if (this.hideError) {
                        this.hideError();
                    }
                }
            } else {
                if (this.hideError) {
                    this.hideError();
                }
            }
        }

        if (options.type && options.type == 'percentageBar') {
            if (options.enabled && this.showPercentage && this.views.currentIndex == 1) {
                this.showPercentage(text, options.value);
            } else {
                if (this.hideError) {
                    this.hideError();
                }
            }
        }
    }

    hideError() {
        if (this.errorScreen) {
            this.errorScreen.currentIndex = 0;
            this.errorScreen.visible = false;
            this.statusScreen.visible = false;
            this.progressScreen.widget.visible = false;
        }
    }

    showError(text, progressBar) {
        if (this.errorScreen) {
            this.errorScreen.visible = true;
            this.errorScreen.currentIndex = 0;
            this.statusScreen.visible = true;
            this.progressScreen.widget.visible = false;

            this.statusScreen.text = text;

            if (progressBar) {
                this.statusScreen.start();
            } else {
                this.statusScreen.stop();
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

    setName(name) {
        this.dialog.windowTitle = name;
    }

    constructor(dialog) {
        this.width = 800;
        this.height = 620;

        this.dialog = dialog;
        this.dialog.setFixedWidth(this.width);
        this.dialog.setFixedHeight(this.height);
        this.dialog.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

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
    };

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
    }

    configureDialog() {
        this.views = new Ui.StackedWidget(this.dialog);

        this.views.addWidget(this.homeScreen.create(this.views));
        this.views.addWidget(this.preview.create(this.views));

        this.views.currentIndex = 0;

        this.errorScreen = new Ui.StackedWidget(this.dialog);

        this.statusScreen = new Ui.StatusIndicator('Error happend', this.dialog);
        this.progressScreen = createProgressScreen(this.dialog);

        this.errorScreen.addWidget(this.statusScreen);
        this.errorScreen.addWidget(this.progressScreen.widget);
        this.errorScreen.currentIndex = 0;

        this.errorScreen.setFixedWidth(800);
        this.errorScreen.setFixedHeight(20);

        const positionX = 800 / 2 - this.errorScreen.width / 2;
        const positionY = 600;
        this.errorScreen.move(positionX, positionY);

        this.hideError();

        return this.dialog;
    }
}
