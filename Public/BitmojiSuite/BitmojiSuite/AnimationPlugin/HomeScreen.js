// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { Widget } from "./components/common/widgets/widget.js";
import { HBoxLayout } from "./components/common/layouts/hBoxLayout.js";
import { Menu } from "./Menu/Menu.js";
import { Preview } from "./Preview/Preview.js";
import { dependencyContainer, DependencyKeys } from "./DependencyContainer.js";
export class HomeScreen {
    constructor() {
        this.menu = new Menu();
        this.preview = new Preview(this.onProcessingStart.bind(this), this.onProcessingEnd.bind(this));
        dependencyContainer.register(DependencyKeys.Preview, this.preview);
    }
    create(parent) {
        const widget = new Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const layout = new HBoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        const menuWidget = this.menu.create(widget);
        const previewWidget = this.preview.create(widget);
        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, widget.toNativeWidget());
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);
        layout.addWidget(menuWidget);
        layout.addNativeWidget(separator);
        layout.addWidget(previewWidget);
        widget.layout = layout;
        this.createLoadingScreen(widget.toNativeWidget());
        return widget;
    }
    createLoadingScreen(parent) {
        this.loadingScreen = new Ui.ImageView(parent);
        this.loadingScreen.setSizePolicy(Ui.SizePolicy.Policy.Maximum, Ui.SizePolicy.Policy.Maximum);
        this.loadingScreen.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/blur_1.svg'));
        this.loadingScreen.scaledContents = true;
        this.loadingScreen.visible = false;
        const loadingScreenLayout = new Ui.BoxLayout();
        loadingScreenLayout.setContentsMargins(0, 0, 0, 0);
        loadingScreenLayout.setDirection(Ui.Direction.TopToBottom);
        this.loadingScreen.layout = loadingScreenLayout;
        loadingScreenLayout.addStretch(0);
        this.progressLabel = new Ui.ClickableLabel(this.loadingScreen);
        this.progressLabel.text = "Processing <span style='color:#ffffff'>0%</span>";
        loadingScreenLayout.addWidgetWithStretch(this.progressLabel, 0, Ui.Alignment.AlignCenter);
        this.progressBar = new Ui.ProgressBar(this.loadingScreen);
        this.progressBar.setFixedHeight(Ui.Sizes.ProgressBarHeight);
        this.progressBar.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.progressBar.minimum = 0;
        this.progressBar.maximum = 100;
        this.progressBar.value = 0;
        loadingScreenLayout.addWidgetWithStretch(this.progressBar, 0, Ui.Alignment.AlignCenter);
        loadingScreenLayout.addStretch(0);
        parent.onResize.connect((w, h) => {
            this.loadingScreen.setFixedWidth(w);
            this.loadingScreen.setFixedHeight(h);
            this.progressBar.setFixedWidth(Math.max(0, w - 190));
        });
    }
    onProcessingStart() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        let prevVal = 0;
        this.progressLabel.text = "Processing <span style='color:#ffffff'>" + "0" + "%</span>";
        this.interval = setInterval(() => {
            const newVal = this.nextProgress(prevVal);
            prevVal = newVal;
            this.progressLabel.text = "Processing <span style='color:#ffffff'>" + Math.floor(newVal) + "%</span>";
            this.progressBar.value = newVal;
        }, 50);
        this.loadingScreen.visible = true;
    }
    onProcessingEnd() {
        clearInterval(this.interval);
        this.loadingScreen.visible = false;
    }
    nextProgress(p) {
        const cap = 99.9;
        const t = p / cap;
        const k = (0.006 * (1 - t) + 0.001) * 0.5;
        const step = (cap - p) * (1 - Math.exp(-k));
        return Math.min(cap, p + step);
    }
    deinit() {
        clearInterval(this.interval);
        this.menu.deinit();
    }
}
