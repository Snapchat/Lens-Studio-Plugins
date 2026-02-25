import * as Ui from 'LensStudio:Ui';
import { createErrorCalloutFrame, createInfoCalloutFrame } from './CalloutWidgetFactory.js';

export class CalloutManager {
    constructor() {
        this.mDisplayDuration = 5000;
        this.mCalloutTimer = null;
    }

    deinit() {
        if (this.mCalloutTimer) {
            clearTimeout(this.mCalloutTimer);
            this.mCalloutTimer = null;
        }
    }

    createWidget(parent) {
        const calloutContainer = new Ui.Widget(parent);
        calloutContainer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Expanding);
        calloutContainer.setFixedHeight(40);
        calloutContainer.setContentsMargins(0, 0, 0, 0);

        const calloutLayout = new Ui.BoxLayout();
        calloutLayout.setDirection(Ui.Direction.TopToBottom);
        calloutLayout.setContentsMargins(0, 0, 0, 0);
        calloutLayout.spacing = 0;

        this.errorWidgetNoPreview = createErrorCalloutFrame(calloutContainer, "No preview panels detected. Activate at least one preview panel to use this feature.");
        this.infoWidgetMultiPreview = createInfoCalloutFrame(calloutContainer, "Multiple preview panels found. Captured from the last opened one.");

        this.errorWidgetNoPreview.visible = false;
        this.infoWidgetMultiPreview.visible = false;

        calloutLayout.addWidgetWithStretch(this.errorWidgetNoPreview, 1, Ui.Alignment.AlignTop | Ui.Alignment.AlignHCenter);
        calloutLayout.addWidgetWithStretch(this.infoWidgetMultiPreview, 1, Ui.Alignment.AlignTop | Ui.Alignment.AlignHCenter);

        calloutContainer.layout = calloutLayout;

        return calloutContainer;
    }

    set displayDuration(durationInMilliseconds) {
        if (durationInMilliseconds <= 0) {
            throw new Error("Duration must be greater than 0");
        }
        this.mDisplayDuration = durationInMilliseconds;
    }

    showCallout(calloutWidget) {
        calloutWidget.visible = true;
        if (this.mCalloutTimer) {
            clearTimeout(this.mCalloutTimer);
        }
        this.mCalloutTimer = setTimeout(() => {
            if (calloutWidget.visible) {
                calloutWidget.visible = false;
                clearTimeout(this.mCalloutTimer);
                this.mCalloutTimer = null;
            }
        }, this.mDisplayDuration);
    }

    showErrorNoPreview() {
        this.showCallout(this.errorWidgetNoPreview);
    }

    showInfoMultiPreview() {
        this.showCallout(this.infoWidgetMultiPreview);
    }
}
