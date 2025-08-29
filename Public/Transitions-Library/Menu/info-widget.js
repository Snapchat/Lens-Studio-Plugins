import * as Ui from "LensStudio:Ui";
import {Direction} from "LensStudio:Ui";
const GUIDE_LINK = 'https://docs.snap.com/lens-studio/extending-lens-studio/plugins/transitions-library';

const GUIDE_TEXT = "Choose from a library of animated transitions. ";
export class InfoWidget {
    constructor(parentWidget, parentLayout) {
        this.infoWidget = new Ui.Widget(parentWidget);
        this.infoWidgetLayout = new Ui.BoxLayout();
        this.infoWidgetLayout.setDirection(Direction.LeftToRight);
        this.infoWidgetLayout.setContentsMargins(8, 8, 8, 0);
        this.infoWidget.layout = this.infoWidgetLayout;
        this.createCalloutWidget();
        parentLayout.addWidget(this.infoWidget);
    }
    show() {
        this.infoWidget.visible = true;
    }
    hide() {
        this.infoWidget.visible = false;
    }
    createCalloutWidget() {
        const calloutWidget = new Ui.CalloutFrame(this.infoWidget);

        const calloutWidgetLayout = new Ui.BoxLayout();
        calloutWidgetLayout.setDirection(Ui.Direction.LeftToRight);
        calloutWidgetLayout.setContentsMargins(2, 8, 0, 8);

        const infoImageView = new Ui.ImageView(calloutWidget);

        infoImageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        infoImageView.setFixedHeight(Ui.Sizes.IconSide);
        infoImageView.setFixedWidth(Ui.Sizes.IconSide * 1.5);
        infoImageView.scaledContents = true;
        infoImageView.setContentsMargins(7, 0, 0, 0);
        infoImageView.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/Info.svg')));

        calloutWidgetLayout.addWidget(infoImageView);
        const urlString = Ui.getUrlString('Check here for guidelines.', GUIDE_LINK);

        const guidelinesLabel = new Ui.Label(calloutWidget);
        guidelinesLabel.text = GUIDE_TEXT + urlString;
        guidelinesLabel.wordWrap = true;
        guidelinesLabel.openExternalLinks = true;
        guidelinesLabel.setContentsMargins(2, 0, 5, 0);

        calloutWidgetLayout.addWidget(guidelinesLabel);
        calloutWidget.layout = calloutWidgetLayout;
        this.infoWidgetLayout.addWidget(calloutWidget);
    }
}
