import * as Ui from "LensStudio:Ui";
import * as Utils from "./Utils";

export class CalloutWidget extends Ui.CalloutFrame {
    label: Ui.ClickableLabel;

    constructor(parent: Ui.Widget, text: string, color: Ui.Color, iconPath: Editor.Path) {
        super(parent);
        this.setContentsMargins(0, 0, 0, 0);
        this.setBackgroundColor(color);

        const frameLayout = new Ui.BoxLayout();
        frameLayout.setDirection(Ui.Direction.LeftToRight);
        frameLayout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        frameLayout.spacing = Ui.Sizes.Padding;

        const icon = Utils.createIcon(this, new Ui.Pixmap(iconPath));

        frameLayout.addWidget(icon);
        frameLayout.addStretch(0);

        this.label = new Ui.ClickableLabel(this);
        this.label.text = text;
        this.label.wordWrap = true;

        frameLayout.addWidgetWithStretch(this.label, 1, Ui.Alignment.Default);

        this.layout = frameLayout;
    }
}
