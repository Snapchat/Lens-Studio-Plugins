import * as Ui from 'LensStudio:Ui';

function createCalloutFrame(parent, iconPath, color, message) {
    const calloutFrame = new Ui.CalloutFrame(parent);
    calloutFrame.setContentsMargins(0, 0, 0, 0);
    calloutFrame.setFixedWidth(350);
    calloutFrame.setFixedHeight(40);

    calloutFrame.setBackgroundColor(color);
    calloutFrame.backgroundRole = Ui.ColorRole.Light;

    const frameLayout = new Ui.BoxLayout();
    frameLayout.setDirection(Ui.Direction.LeftToRight);
    frameLayout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
    frameLayout.spacing = Ui.Sizes.Padding;

    const iconImagePath = import.meta.resolve(iconPath);
    const iconPixmap = new Ui.Pixmap(iconImagePath);
    const iconView = new Ui.ImageView(calloutFrame);
    iconView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
    iconView.setFixedHeight(Ui.Sizes.IconSide);
    iconView.setFixedWidth(Ui.Sizes.IconSide);
    iconView.scaledContents = true;
    iconView.pixmap = iconPixmap;

    frameLayout.addWidget(iconView);

    const contentLabel = new Ui.Label(calloutFrame);
    contentLabel.text = message;
    contentLabel.wordWrap = true;

    frameLayout.addWidgetWithStretch(contentLabel, 1, Ui.Alignment.Default);
    calloutFrame.layout = frameLayout;

    return calloutFrame;
}

export function createErrorCalloutFrame(parent, message) {
    const backgroundColor = new Ui.Color();
    backgroundColor.red = 210;
    backgroundColor.green = 92;
    backgroundColor.blue = 99;
    backgroundColor.alpha = 255;

    return createCalloutFrame(parent, './Resources/error.svg', backgroundColor, message);
}

export function createInfoCalloutFrame(parent, message) {
    const backgroundColor = new Ui.Color();
    backgroundColor.red = 154;
    backgroundColor.green = 112;
    backgroundColor.blue = 205;
    backgroundColor.alpha = 255;

    return createCalloutFrame(parent, './Resources/error.svg', backgroundColor, message);
}
