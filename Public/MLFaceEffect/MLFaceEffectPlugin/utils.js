import * as Network from 'LensStudio:Network';
import * as fs from 'LensStudio:FileSystem';
import { importEffect } from './import_effect.js';
import { getHintFactory } from './Hints/HintFactory.js';
import * as Ui from 'LensStudio:Ui';
import app from '../application/app.js';

import { logEventLinkOpen } from '../application/analytics.js';

const termsLink = 'https://www.snap.com/terms/lens-studio-license-agreement';
const guidelinesLink = 'https://developers.snap.com/lens-studio/features/genai-suite/face-ml-generation';

export function convertIntensityToAPIStyle(intensityString) {
    switch (intensityString) {
        case 'Low':
            return 'low';
        case 'Medium':
            return 'med';
        case 'High':
            return 'high';
    }
}

export function convertIntensityToString(input) {
    switch (input) {
        case 'low':
            return 'Low';
        case 'med':
            return 'Medium';
        case 'high':
            return 'High';
    }
}

export function convertDate(inputDate) {
    // Parse the input string into a Date object
    const dateObj = new Date(inputDate);

    // Format the date object into the desired output format
    const outputDate = dateObj.getFullYear() + '/' +
                     ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' +
                     ('0' + dateObj.getDate()).slice(-2);

    return outputDate;
}

export function tieWidgets(keyWidget, valueWidget, parent) {
    const layout = new Ui.BoxLayout();

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

const infoImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('Resources/info.svg')));

export function addHint(widget, parent, hint_id) {
    const info = new Ui.ImageView(parent);
    info.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
    info.setFixedHeight(Ui.Sizes.IconSide);
    info.setFixedWidth(Ui.Sizes.IconSide);
    info.scaledContents = true;

    info.pixmap = infoImage;
    info.responseHover = true;

    const popupWidget = new Ui.PopupWithArrow(info, Ui.ArrowPosition.Top);

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

    const layout = new Ui.BoxLayout();
    layout.setDirection(Ui.Direction.LeftToRight);
    layout.addWidget(widget);
    layout.addStretch(0);
    layout.addWidget(info);
    layout.setContentsMargins(0, 0, 0, 0);

    parent.layout = layout;

    return connection;
}

function createCalloutWidget(parent, text, link) {
    const frame = new Ui.CalloutFrame(parent);

    const frameLayout = new Ui.BoxLayout();
    frameLayout.setDirection(Ui.Direction.LeftToRight);
    frameLayout.setContentsMargins(Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding);
    frameLayout.spacing = Ui.Sizes.Spacing;

    const info = createInfoIcon(frame);

    frameLayout.addWidget(info);

    const guidelinesLabel = new Ui.ClickableLabel(frame);
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

export function createGennerationInProgressWidget(parent) {
    const frame = new Ui.Widget(parent);

    frame.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

    const frameLayout = new Ui.BoxLayout();
    frameLayout.setDirection(Ui.Direction.TopToBottom);
    frameLayout.setContentsMargins(0, 0, 0, 0);
    frameLayout.spacing = Ui.Sizes.Spacing;

    const header = new Ui.Widget(parent);

    const headerLayout = new Ui.BoxLayout();
    headerLayout.setDirection(Ui.Direction.LeftToRight);
    headerLayout.setContentsMargins(0, 0, 0, 0);

    const icon = new Ui.ProgressIndicator(header);
    icon.start();
    const headerLabel = new Ui.Label(header);

    headerLabel.text = 'In Progress';
    headerLabel.fontRole = Ui.FontRole.TitleBold;

    headerLayout.addWidget(icon);
    headerLayout.addWidget(headerLabel);

    header.layout = headerLayout;

    frameLayout.addStretch(0);
    frameLayout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignCenter);

    const disclaimerLabel = new Ui.Label(frame);
    disclaimerLabel.text = '<center>Generation is running.</center><center>Please, return back later.</center>';

    frameLayout.addWidgetWithStretch(disclaimerLabel, 0, Ui.Alignment.AlignCenter);
    frameLayout.addStretch(0);

    frame.layout = frameLayout;
    return frame;
}

export function createErrorIcon(parent) {
    return createIcon(parent, new Ui.Pixmap(new Editor.Path(import.meta.resolve('Resources/error_icon.svg'))));
}

export function createInfoIcon(parent) {
    return createIcon(parent, infoImage);
}

function createIcon(parent, iconImage) {
    const imageView = new Ui.ImageView(parent);

    imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

    imageView.setFixedWidth(Ui.Sizes.IconSide);
    imageView.setFixedHeight(Ui.Sizes.IconSide);

    imageView.scaledContents = true;

    imageView.pixmap = iconImage;

    return imageView;
}

export function createGenerationErrorWidget(parent) {
    const frame = new Ui.Widget(parent);

    frame.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

    const frameLayout = new Ui.BoxLayout();
    frameLayout.setDirection(Ui.Direction.TopToBottom);
    frameLayout.setContentsMargins(0, 0, 0, 0);
    frameLayout.spacing = Ui.Sizes.Spacing;

    const header = new Ui.Widget(parent);

    const headerLayout = new Ui.BoxLayout();
    headerLayout.setDirection(Ui.Direction.LeftToRight);
    headerLayout.setContentsMargins(0, 0, 0, 0);

    const icon = createErrorIcon(header);
    const headerLabel = new Ui.Label(header);

    headerLabel.text = 'Generation Failed';
    headerLabel.fontRole = Ui.FontRole.TitleBold;

    headerLayout.addWidget(icon);
    headerLayout.addWidget(headerLabel);

    header.layout = headerLayout;

    frameLayout.addStretch(0);
    frameLayout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignCenter);

    const disclaimerLabel = new Ui.Label(frame);
    disclaimerLabel.text = '<center>There was a problem generating the effect.</center><center>Please try to generate another one.</center>';

    frameLayout.addWidgetWithStretch(disclaimerLabel, 0, Ui.Alignment.AlignCenter);
    frameLayout.addStretch(0);

    frame.layout = frameLayout;
    return frame;
}

export function downloadFileFromBucket(url, file_name, callback) {
    const request = new Network.HttpRequest();
    request.url = url;
    request.method = Network.HttpRequest.Method.Get;

    Network.performHttpRequest(request, function(response) {
        if (response.statusCode === 200) {
            const tempDir = fs.TempDir.create();
            const tempFilePath = tempDir.path.appended(new Editor.Path(file_name));

            const resolvedDirectoryPath = import.meta.resolve(tempDir.path.toString());
            const resolvedFilePath = import.meta.resolve(tempFilePath.toString());

            if (resolvedFilePath.startsWith(resolvedDirectoryPath)) {
                fs.writeFile(tempFilePath, response.body.toBytes());
                callback(tempFilePath, tempDir);
            } else {
                throw new Error(`Resolved file path is not inside the resolved directory. resolvedFilePath: ${resolvedFilePath} | resolvedDirectoryPath: ${resolvedDirectoryPath}`);
            }
        }
    });
}

export function getRandomPrompt() {
    const prompts = [
        'Shocked with wide eyes, open mouth',
        'Angry with clenched jaw, furrowed brows',
        'A vampire with pale skin, sharp fangs, dark eyes, mysterious aura',
        'A goth with dark makeup, black attire, intense stare, pale skin',
        'An elf with pointy ears, large dark eyes, small nose, full glossy lips, soft smile, glowing sun-kissed skin',
        'No brows, crazy big smile, big face, big cheeks',
        'Yawning with wide open mouth and closed eyes face',
        'Huge head, big cheeks, big lips, happy'
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
}

export function importToProject(objectUrl, callback) {
    downloadFileFromBucket(objectUrl, `${app.name} Component.lsc`, function(filePath, tempDir) {
        importEffect(filePath, tempDir).then(() => {
            callback(true);
        })
        .catch((error) => {
            console.log(`Import failed: ${error.message}`);
            callback(false);
        });
    });
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function concatArrays(lhs, rhs) {
    const mergedArray = new Uint8Array(lhs.length + rhs.length);

    mergedArray.set(lhs, 0);
    mergedArray.set(rhs, lhs.length);

    return mergedArray;
}

export function getContentType(file_path) {
    switch (file_path.extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'webp':
            return 'image/webp';
        case 'avif':
        case 'avifs':
            return 'image/avif';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        default:
            return 'application/octet-stream';
    }
}
