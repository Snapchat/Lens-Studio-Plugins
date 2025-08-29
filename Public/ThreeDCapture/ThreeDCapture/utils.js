import * as Network from 'LensStudio:Network';
import * as fs from 'LensStudio:FileSystem';
import { importEffect } from './import_effect.js';
import { getHintFactory } from './Hints/HintFactory.js';
import * as Ui from 'LensStudio:Ui';

import { logEventLinkOpen } from '../application/analytics.js';

const termsLink = 'https://www.snap.com/terms/lens-studio-license-agreement';
const guidelinesLink = 'https://developers.snap.com/lens-studio/features/genai-suite/3d-capture';

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

    return createCalloutWidget(parent, 'By using the feature, you agree to our ' + urlString, termsLink);
}

export function createGuidelinesWidget(parent) {
    const urlString = Ui.getUrlString('guidelines', guidelinesLink);

    return createCalloutWidget(parent, 'Check our ' + urlString + ' for examples, prompting best practices and usage guidelines.', guidelinesLink);
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
    disclaimerLabel.text = '<center>There was a problem generating the Gaussian Splatting asset.</center><center>Please try to generate another one.</center>';

    const setErrorMessage = (text) => { disclaimerLabel.text = text; };

    frameLayout.addWidgetWithStretch(disclaimerLabel, 0, Ui.Alignment.AlignCenter);
    frameLayout.addStretch(0);

    frame.layout = frameLayout;
    return [frame, setErrorMessage];
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
        '3D modeled necklace charm in the shape of a vibrant green parrot, detailed textures',
        'Playful monkey, brown fur, animatedly eating a banana, lively posture',
        'Chimpanzee, black fur, dressed in a red and white football uniform, holding a football',
        'Detailed bronze sculpture of a squirrel, bushy tail, wearing a textured purple hoodie',
        'Adorable husky puppy, blue eyes, fluffy white and grey fur, sitting pose',
        'Small, fluffy gray cat, vivid green eyes, high-resolution textures, curled up',
        'Paddington bear, standing pose, dark brown fur, with a bright red hat, blue coat, and yellow rainboots',
        'Majestic reindeer, brown and white fur, grand antlers',
        'Chibi character, oversized eyes, pastel colors, high contrast and detail, adorable expression',
        'Chubby penguin, black and white plumage, orange beak and feet',
        'Bright sunflower, large yellow petals, lush green leaves',
        'Vibrant pink flamingo, elegant pose, fluffy feathers',
        'Magical blue unicorn, sparkling horn, fluffy mane',
        'Adorable red dragon, small wings, wearing a festive Christmas sweater, joyful pose',
        'Perchet Blue Jay, bright blue and white plumage'
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
}

export function importToProject(objectUrl, callback) {
    downloadFileFromBucket(objectUrl, 'Generated Splat.ply', function(file_path, tempDir) {
        importEffect(file_path, tempDir).then(() => {
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
    switch (file_path.extension.toLowerCase()) {
        case 'mov':
            return 'video/quicktime';
        case '3gp':
            return 'video/3gpp';
        case 'webm':
            return 'video/webm';
        case 'mp4':
            return 'video/mp4';
        case 'mkv':
            return 'video/x-matroska';
        case 'hevc':
            return 'video/hevc';
        default:
            return 'application/octet-stream';
    }
}

export function createSegmentationFrame(width, height) {
    const data = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" width="${width - 14}" height="7" fill="url(#paint0_linear)"/>
        <rect x="${width - 7}" width="7" height="7" fill="url(#paint1_radial)"/>
        <rect x="${width}" y="${height - 7}" width="7" height="7" transform="rotate(90 ${width} ${height - 7})" fill="url(#paint2_radial)"/>
        <rect x="${width}" y="7" width="${height - 14}" height="7" transform="rotate(90 ${width} 7)" fill="url(#paint3_linear)"/>
        <rect x="${width - 7}" y="${height}" width="${width - 14}" height="7" transform="rotate(180 ${width - 7} ${height})" fill="url(#paint4_linear)"/>
        <rect y="${height - 7}" width="${height - 14}" height="7" transform="rotate(-90 0 ${height - 7})" fill="url(#paint5_linear)"/>
        <rect x="7" y="${height}" width="7" height="7" transform="rotate(180 7 ${height})" fill="url(#paint6_radial)"/>
        <rect y="7" width="7" height="7" transform="rotate(-90 0 7)" fill="url(#paint7_radial)"/>
        <defs>
            <linearGradient id="paint0_linear" x1="${width / 2}" y1="0" x2="${width / 2}" y2="7" gradientUnits="userSpaceOnUse">
                <stop stop-color="#D9D9D9" stop-opacity="0"/>
                <stop offset="1" stop-color="#FFFF00"/>
            </linearGradient>
            <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width - 7} 7) scale(7)">
                <stop stop-color="#FFFF00"/>
                <stop offset="1" stop-color="#D9D9D9" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="paint2_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width} ${height}) scale(7)">
                <stop stop-color="#FFFF00"/>
                <stop offset="1" stop-color="#D9D9D9" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="paint3_linear" x1="${width + width / 2}" y1="7" x2="${width + width / 2}" y2="14" gradientUnits="userSpaceOnUse">
                <stop stop-color="#D9D9D9" stop-opacity="0"/>
                <stop offset="1" stop-color="#FFFF00"/>
            </linearGradient>
            <linearGradient id="paint4_linear" x1="${width + width / 2 - 7}" y1="${height}" x2="${width + width / 2 - 7}" y2="${height + 7}" gradientUnits="userSpaceOnUse">
                <stop stop-color="#D9D9D9" stop-opacity="0"/>
                <stop offset="1" stop-color="#FFFF00"/>
            </linearGradient>
            <linearGradient id="paint5_linear" x1="${width / 2 - 7}" y1="${height - 7}" x2="${width / 2 - 7}" y2="${height}" gradientUnits="userSpaceOnUse">
                <stop stop-color="#D9D9D9" stop-opacity="0"/>
                <stop offset="1" stop-color="#FFFF00"/>
            </linearGradient>
            <radialGradient id="paint6_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(7 ${height + 7}) scale(7)">
                <stop stop-color="#FFFF00"/>
                <stop offset="1" stop-color="#D9D9D9" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="paint7_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 14) scale(7)">
                <stop stop-color="#FFFF00"/>
                <stop offset="1" stop-color="#D9D9D9" stop-opacity="0"/>
            </radialGradient>
        </defs>
    </svg>`

    const tempDir = fs.TempDir.create();
    const tempFilePath = tempDir.path.appended(new Editor.Path("image.svg"));

    const resolvedDirectoryPath = import.meta.resolve(tempDir.path.toString());
    const resolvedFilePath = import.meta.resolve(tempFilePath.toString());

    if (resolvedFilePath.startsWith(resolvedDirectoryPath)) {
        fs.writeFile(tempFilePath, data);
        return new Ui.Pixmap(tempFilePath);
    } else {
        throw new Error(`Resolved file path is not inside the resolved directory. resolvedFilePath: ${resolvedFilePath} | resolvedDirectoryPath: ${resolvedDirectoryPath}`);
    }
}
