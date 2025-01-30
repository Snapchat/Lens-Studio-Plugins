import * as Ui from 'LensStudio:Ui';
import { getHintFactory } from './Hints/HintFactory.js';
import { logEventLinkOpen } from '../application/analytics.js';

const termsLink = 'https://www.snap.com/terms/generative-lens-tools';
const guidelinesLink = 'https://developers.snap.com/lens-studio/features/genai-suite/garment-generation';

const infoImage = Ui.Pixmap.create(import.meta.resolve('Resources/info.svg'));

export function addHint(widget, parent, hint_id) {
    const info = Ui.ImageView.create(parent);
    info.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
    info.setFixedHeight(Ui.Sizes.IconSide);
    info.setFixedWidth(Ui.Sizes.IconSide);
    info.scaledContents = true;

    info.pixmap = infoImage;
    info.responseHover = true;

    const popupWidget = Ui.PopupWithArrow.create(info, Ui.ArrowPosition.Top);

    popupWidget.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);

    popupWidget.setMainWidget(getHintFactory().createHint(popupWidget, hint_id));

    const connection = info.onHover.connect((hovered) => {
        if (hovered) {
            popupWidget.popup(info);
        } else {
            popupWidget.close();
            parent.activateWindow();
        }
    });

    const layout = Ui.BoxLayout.create();
    layout.setDirection(Ui.Direction.LeftToRight);
    layout.addWidget(widget);
    layout.addStretch(0);
    layout.addWidget(info);
    layout.setContentsMargins(0, 0, 0, 0);

    parent.layout = layout;

    return connection;
}

export function tieWidgets(keyWidget, valueWidget, parent) {
    const layout = Ui.BoxLayout.create();

    layout.setDirection(Ui.Direction.LeftToRight);
    if (keyWidget) {
        layout.addWidgetWithStretch(keyWidget, 45, Ui.Alignment.Default);
    }
    if (valueWidget) {
        layout.addWidgetWithStretch(valueWidget, 55, Ui.Alignment.Default);
    }

    layout.setContentsMargins(0, 0, 0, 0);
    parent.layout = layout;
}

function createIcon(parent, iconImage) {
    const imageView = Ui.ImageView.create(parent);

    imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

    imageView.setFixedWidth(Ui.Sizes.IconSide);
    imageView.setFixedHeight(Ui.Sizes.IconSide);

    imageView.scaledContents = true;

    imageView.pixmap = iconImage;

    return imageView;
}

export function createInfoIcon(parent) {
    return createIcon(parent, Ui.Pixmap.create(import.meta.resolve('Resources/info.svg')));
}

export function createErrorIcon(parent) {
    return createIcon(parent, Ui.Pixmap.create(import.meta.resolve('Resources/error_icon.svg')));
}

function createCalloutWidget(parent, text, link) {
    const frame = Ui.CalloutFrame.create(parent);

    const frameLayout = Ui.BoxLayout.create();
    frameLayout.setDirection(Ui.Direction.LeftToRight);
    frameLayout.setContentsMargins(Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding);
    frameLayout.spacing = Ui.Sizes.Spacing;

    const info = createInfoIcon(frame);

    frameLayout.addWidget(info);

    const guidelinesLabel = Ui.ClickableLabel.create(frame);
    guidelinesLabel.text = text;
    guidelinesLabel.wordWrap = true;
    guidelinesLabel.openExternalLinks = true;
    guidelinesLabel.onClick.connect(() => logEventLinkOpen(link));

    frameLayout.addWidgetWithStretch(guidelinesLabel, 1, Ui.Alignment.Default);

    frame.layout = frameLayout;
    return frame;
}

export function createTermsWidget(parent) {
    const urlString = Ui.getUrlString('Generative Lens Tools Terms', termsLink);

    return createCalloutWidget(parent, 'By using the feature, you agree to our ' + urlString, termsLink)
}

export function createGuidelinesWidget(parent) {
    const urlString = Ui.getUrlString('guidelines', guidelinesLink);

    return createCalloutWidget(parent, 'Check our ' + urlString + ' for examples, prompting best practices and usage guidelines.', guidelinesLink);
}

export function getRandomPrompt() {
    const prompts = [
        'sunset',
        'galaxy',
        'summer',
        'art',
        'camouflage',
        'rainbow',
        'colors',
        'western',
        'tie dye',
        'dragon',
        'drip',
        'gold',
        'graffiti',
        'space',
        'textured brushstrokes background with earth tones and indigo stripes',
        'tropical',
        'unicorn',
        'vector illustration of cute cartoon flowers, stars and rainbows, warm color scheme on a dark background',
        'waves',
        'marble'
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
