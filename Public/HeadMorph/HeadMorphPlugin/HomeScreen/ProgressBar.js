import * as Ui from 'LensStudio:Ui';

const backgroundColor = new Ui.Color();
backgroundColor.red = 13;
backgroundColor.green = 15;
backgroundColor.blue = 17;
backgroundColor.alpha = 255;

const foregroundColor = new Ui.Color();
foregroundColor.red = 76;
foregroundColor.green = 172;
foregroundColor.blue = 248;
foregroundColor.alpha = 255;

export class ProgressBar {
    constructor(parent, settings = {
        height: Ui.Sizes.ProgressBarHeight * 2,
        minimum: 0,
        maximum: 100,
        defaultValue: 0,
        approximateTime: 60, // seconds,
        maxWhileLoading: 98
    }) {
        this.settings = settings;
        this.randomSpeedFactor = 0.8 + Math.random() * 0.4;  // 0.8..1.2

        this.widget = new Ui.Widget(parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(Ui.Sizes.PaddingLarge, 0, Ui.Sizes.PaddingLarge, 0);

        this.label = new Ui.Label(this.widget);
        this.label.fontRole = Ui.FontRole.DefaultBold;

        this.progressBar = new Ui.ProgressBar(this.widget);

        this.progressBar.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        this.progressBar.setFixedHeight(settings.height);
        this.progressBar.minimum = settings.minimum;
        this.progressBar.maximum = settings.maximum;
        this.progressBar.setPrimaryColor(foregroundColor);
        this.progressBar.setSecondaryColor(backgroundColor);

        layout.addStretch(0);
        layout.addWidgetWithStretch(this.label, 0, Ui.Alignment.AlignCenter);
        layout.addWidget(this.progressBar);
        layout.addStretch(0);

        this.widget.layout = layout;

        this._interval = null;
        this._finishing = false;
        this.value = settings.defaultValue;
    }

    set value(val) {
        this.progressBar.value = val;
        this.label.text = "" + val.toFixed(0) + '%';
        this._value = val;
    }

    get value() {
        return this._value;
    }

    start() {
        if (this._interval || this._finishing) return;

        const tickMs = 100 * this.randomSpeedFactor; // slight variation
        const maxTarget = this.settings.maxWhileLoading;

        // Slight variation in total expected loading time
        const approxTimeMs = this.settings.approximateTime * 1000 * this.randomSpeedFactor;

        // Slight variation in easing curve strength (k)
        const kBase = 3;
        const k = kBase * this.randomSpeedFactor;

        const startTime = Date.now();
        const initialValue = this.value;

        this._interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / approxTimeMs, 1); // 0..1

            // Exponential approach with slightly different speed for each bar
            const targetFromZero = maxTarget * (1 - Math.exp(-k * t));

            const next = Math.max(initialValue, targetFromZero);

            this.value = Math.min(next, maxTarget);
        }, tickMs);
    }

    stop() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
        this.value = this.settings.defaultValue;
    }
}
