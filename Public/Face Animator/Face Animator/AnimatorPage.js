// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { ColorRole } from "LensStudio:Ui";
import { EffectPreviewPage } from "./EffectPreviewPage.js";
import { Preview } from "./Preview.js";
import { generateAnimator, getAnimatorById } from "./api.js";
import { logEventEffectTraining } from "./analytics.js";
export class AnimatorPage {
    constructor() {
        this.connections = [];
        this.removedItems = {};
        this.updateItemDataCallback = () => { };
    }
    create(parent, onReturnCallback, onItemRemovedCallback, updateItemDataCallback) {
        this.updateItemDataCallback = updateItemDataCallback;
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        widget.autoFillBackground = true;
        widget.backgroundRole = ColorRole.Base;
        widget.setFixedWidth(800);
        widget.setFixedHeight(620);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        this.effectPreviewPage = new EffectPreviewPage(widget, () => {
            this.preview.stopVideo();
            onReturnCallback();
        });
        this.preview = new Preview(widget, (id) => {
            this.removedItems[id] = true;
            onItemRemovedCallback(id);
            this.preview.stopVideo();
            onReturnCallback();
        }, this.onTrainingStarted.bind(this));
        this.preview.setVideoPlayStartListener(this.onVideoPlayStart.bind(this));
        this.preview.setVideoPlayStopListener(this.onVideoPlayStop.bind(this));
        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, widget);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);
        layout.addWidgetWithStretch(this.effectPreviewPage.widget, 0, Ui.Alignment.AlignLeft);
        layout.addWidgetWithStretch(separator, 0, Ui.Alignment.AlignLeft);
        layout.addWidgetWithStretch(this.preview.widget, 0, Ui.Alignment.AlignLeft);
        widget.layout = layout;
        this.createFooter(widget);
        this.createPopup(widget);
        return widget;
    }
    setPreview(path) {
        if (this.effectPreviewPage) {
            this.effectPreviewPage.setPreview(path);
        }
    }
    setAnimatorData(data) {
        this.popup.visible = false;
        this.curId = data.id;
        if (this.footer) {
            this.footer.visible = false;
        }
        if (this.preview) {
            this.preview.setId(this.curId);
            this.preview.setState(data.state);
            if (data.state === "PREVIEW_SUCCESS" || data.state.startsWith("GENERATION")) {
                this.preview.setPreviews(data.previews);
            }
            else {
                this.preview.setDefaultPreviewState();
            }
            if (data.state === "GENERATION_QUEUED" || data.state === "GENERATION_RUNNING") {
                this.footer.visible = true;
                this.progressLabel.text = Math.floor(data.progressPercent) + "%";
            }
            else if (data.state === "GENERATION_SUCCESS") {
                this.preview.setImportData(data.outputModelUrl, data.mp3Url);
            }
        }
        if (this.effectPreviewPage) {
            this.effectPreviewPage.setDate(data.createdAt);
        }
    }
    importToProject(data) {
        this.preview.import(data.outputModelUrl, data.mp3Url);
    }
    updateAnimatorData(data) {
        if (data.id === this.curId && data.state === "PREVIEW_SUCCESS") {
            this.preview.setState(data.state);
            this.preview.setPreviews(data.previews);
        }
    }
    createFooter(parent) {
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);
        widget.setFixedWidth(800);
        widget.setFixedHeight(24);
        widget.autoFillBackground = true;
        widget.backgroundRole = ColorRole.Mid;
        widget.visible = false;
        this.footer = widget;
        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        widget.layout = layout;
        const label = new Ui.Label(widget);
        label.text = '<center>' + 'Model training in progress. This may take up to 7 hours. You can close the window and return later.' + '</center>';
        label.setFixedWidth(520);
        label.foregroundRole = Ui.ColorRole.Text;
        layout.addStretch(1);
        layout.addWidgetWithStretch(label, 0, Ui.Alignment.AlignCenter);
        const spinner = new Ui.ProgressIndicator(widget);
        spinner.start();
        layout.addWidgetWithStretch(spinner, 0, Ui.Alignment.AlignCenter);
        this.progressLabel = new Ui.Label(widget);
        this.progressLabel.text = "0%";
        this.progressLabel.foregroundRole = Ui.ColorRole.BrightText;
        layout.addWidgetWithStretch(this.progressLabel, 0, Ui.Alignment.AlignCenter);
        layout.addStretch(1);
        widget.move(0, 596);
    }
    createPopup(widget) {
        this.popup = new Ui.CalloutFrame(widget);
        this.popup.setForegroundColor(this.createColor(234, 85, 99, 255));
        this.popup.setBackgroundColor(this.createColor(234, 85, 99, 255));
        const popupLayout = new Ui.BoxLayout();
        this.popup.layout = popupLayout;
        popupLayout.setContentsMargins(8, 0, 8, 0);
        const infoImage = new Ui.ImageView(this.popup);
        infoImage.scaledContents = true;
        infoImage.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/warning.svg'));
        infoImage.setFixedWidth(16);
        infoImage.setFixedHeight(16);
        popupLayout.addWidgetWithStretch(infoImage, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
        this.popupLabel = new Ui.Label(this.popup);
        this.popupLabel.foregroundRole = Ui.ColorRole.BrightText;
        this.popup.visible = false;
        this.popup.setFixedHeight(32);
        this.popup.setFixedWidth(368);
        this.popup.move(216, 4);
        this.popupLabel.text = "Limit reached - A maximum of 2 models can be trained at once";
        popupLayout.addWidgetWithStretch(this.popupLabel, 1, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
    }
    onTrainingStarted(id) {
        generateAnimator(id, (response) => {
            if (response.statusCode === 429) {
                if (this.popup) {
                    this.popup.visible = true;
                }
                logEventEffectTraining("RATE_LIMITED");
                return;
            }
            this.popup.visible = false;
            if (response.statusCode !== 201) {
                logEventEffectTraining("FAILED");
                return;
            }
            logEventEffectTraining("SUCCESS");
            this.progressLabel.text = "0%";
            this.updateItemDataCallback(JSON.parse(response.body));
            this.checkGenerationState(id, 60000);
            if (this.footer) {
                this.footer.visible = true;
            }
        });
    }
    onVideoPlayStart() {
        this.effectPreviewPage.playVideo();
    }
    onVideoPlayStop() {
        this.effectPreviewPage.pauseVideo();
    }
    checkGenerationState(id, intervalVal) {
        const checkState = (id) => {
            if (this.removedItems[id]) {
                clearInterval(interval);
                return;
            }
            getAnimatorById(id, (response) => {
                if (response.statusCode !== 200) {
                    return;
                }
                const curSettings = JSON.parse(response.body);
                if (curSettings.state === "GENERATION_SUCCESS" || curSettings.state === "GENERATION_FAILED") {
                    clearInterval(interval);
                }
                else {
                    if (this.curId === curSettings.id) {
                        this.updateItemDataCallback(JSON.parse(response.body));
                        this.progressLabel.text = Math.floor(curSettings.progressPercent) + "%";
                    }
                }
            });
        };
        const interval = setInterval(() => {
            checkState(id);
        }, intervalVal);
        this.connections.push(interval);
    }
    createColor(r, g, b, a) {
        const color = new Ui.Color();
        color.red = r;
        color.green = g;
        color.blue = b;
        color.alpha = a;
        return color;
    }
}
