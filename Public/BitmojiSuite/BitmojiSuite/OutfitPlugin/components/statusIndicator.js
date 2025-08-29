import * as Ui from "LensStudio:Ui";
import { WidgetFactory } from "../../WidgetFactory.js";
export var StatusType;
(function (StatusType) {
    StatusType[StatusType["LOADING"] = 0] = "LOADING";
    StatusType[StatusType["QUEUED"] = 1] = "QUEUED";
    StatusType[StatusType["PROGRESS"] = 2] = "PROGRESS";
    StatusType[StatusType["NONE"] = 3] = "NONE";
})(StatusType || (StatusType = {}));

export class StatusIndicator {
    constructor(parent) {
        this.widget = WidgetFactory.beginWidget(parent).contentsMargings(0).end();

        this.statusIndicatorCircle = new Ui.ProgressIndicator(this.widget);

        this.statusLabel = WidgetFactory.beginLabel(this.widget).fontRole(Ui.FontRole.DefaultBold).end();

        this.widget.layout = WidgetFactory.beginHorizontalLayout()
            .contentsMargings(Ui.Sizes.DoublePadding)
            .addWidget(this.statusIndicatorCircle, Ui.Alignment.AlignLeft | Ui.Alignment.AlignBottom)
            .addWidget(this.statusLabel, Ui.Alignment.AlignLeft | Ui.Alignment.AlignBottom)
            .addStretch()
            .end();

        this.__percents__ = null;
        this.__status__ = StatusType.NONE;
    }

    updateView() {
        switch (this.__status__) {
            case StatusType.NONE:
                this.statusIndicatorCircle.visible = false;
                this.statusIndicatorCircle.stop();
                this.statusLabel.text = "";
                this.statusLabel.visible = false;
                this.widget.visible = false;
                break;
            case StatusType.LOADING:
                this.statusIndicatorCircle.visible = true;
                this.statusIndicatorCircle.start();
                this.statusLabel.text = "";
                this.statusLabel.visible = false;
                this.widget.visible = true;
                break;
            case StatusType.PROGRESS:
                this.statusIndicatorCircle.visible = true;
                this.statusIndicatorCircle.start();
                if (this.__percents__ !== null) {
                    this.statusLabel.text = this.__percents__ + "%";
                    this.statusLabel.visible = true;
                }
                else {
                    this.statusLabel.text = "";
                    this.statusLabel.visible = false;
                }
                this.widget.visible = true;
                break;
            case StatusType.QUEUED:
                this.statusIndicatorCircle.visible = true;
                this.statusIndicatorCircle.start();
                this.statusLabel.text = "Queued";
                this.statusLabel.visible = true;
                this.widget.visible = true;
                break;
        }
    }
    set status(status) {
        this.__status__ = status;
        this.updateView();
    }
    set percents(progress) {
        this.__percents__ = progress;
        this.updateView();
    }
    get status() {
        return this.__status__;
    }
    get percents() {
        return this.__percents__;
    }
    reset() {
        this.__status__ = StatusType.NONE;
        this.__percents__ = null;
        this.updateView();
    }
}
