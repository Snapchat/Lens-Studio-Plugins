import * as Ui from 'LensStudio:Ui';
import { logEventLinkOpen } from '../App/analytics.js';

function createIcon(parent, iconImage) {
    const imageView = new Ui.ImageView(parent);

    imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

    imageView.setFixedWidth(Ui.Sizes.IconSide);
    imageView.setFixedHeight(Ui.Sizes.IconSide);

    imageView.scaledContents = true;

    imageView.pixmap = iconImage;

    return imageView;
}

export function createInfoIcon(parent) {
    return createIcon(parent, new Ui.Pixmap(import.meta.resolve('Resources/info.svg')));
}

export function createGuidelinesWidget(parent) {
    const frame = new Ui.CalloutFrame(parent);
    frame.setContentsMargins(0, 0, 0, 0);
    frame.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Maximum);

    const frameLayout = new Ui.BoxLayout();
    frameLayout.setDirection(Ui.Direction.LeftToRight);
    frameLayout.setContentsMargins(Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding);
    frameLayout.spacing = Ui.Sizes.Spacing;

    const info = createInfoIcon(frame);

    frameLayout.addWidget(info);

    const guidelinesLink = 'https://docs.snap.com/lens-studio/publishing/configuring/creating-an-icon';
    const urlString = Ui.getUrlString('usage guidelines', guidelinesLink);

    const guidelinesLabel = new Ui.ClickableLabel(frame);
    guidelinesLabel.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Maximum);
    guidelinesLabel.text = 'Check our ' + urlString + ' for more examples, prompting best practices and latest techniques.';
    guidelinesLabel.wordWrap = true;
    guidelinesLabel.openExternalLinks = true;
    guidelinesLabel.onClick.connect(() => logEventLinkOpen(guidelinesLink));

    frameLayout.addWidgetWithStretch(guidelinesLabel, 1, Ui.Alignment.Default);

    frame.layout = frameLayout;
    return frame;
}
