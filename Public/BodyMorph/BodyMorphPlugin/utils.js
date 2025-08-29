import * as Ui from 'LensStudio:Ui';

import * as Network from 'LensStudio:Network';
import * as fs from 'LensStudio:FileSystem';
import { importBodymorph } from './import_bodymorph.js';
import { getHintFactory } from './Hints/HintFactory.js';

import { logEventLinkOpen } from '../application/analytics.js';

import app from '../application/app.js';

const guidelinesLink = 'https://developers.snap.com/lens-studio/features/genai-suite/body-morph-generation';
const termsLink = 'https://www.snap.com/terms/lens-studio-license-agreement';

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

export function concatArrays(lhs, rhs) {
    const mergedArray = new Uint8Array(lhs.length + rhs.length);

    mergedArray.set(lhs, 0);
    mergedArray.set(rhs, lhs.length);

    return mergedArray;
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

export function createInfoIcon(parent) {
    return createIcon(parent, new Ui.Pixmap(new Editor.Path(import.meta.resolve('Resources/info.svg'))));
}

export function createBackButton(parent) {
    return createIcon(parent, new Ui.Pixmap(new Editor.Path(import.meta.resolve('Resources/arrow.svg'))));
}

export function createErrorIcon(parent) {
    return createIcon(parent, new Ui.Pixmap(new Editor.Path(import.meta.resolve('Resources/error_icon.svg'))));
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
    disclaimerLabel.text = `<center>There was a problem generating the ${app.name}.</center><center>Please try to generate another one.</center>`;

    frameLayout.addWidgetWithStretch(disclaimerLabel, 0, Ui.Alignment.AlignCenter);
    frameLayout.addStretch(0);

    frame.layout = frameLayout;
    return frame;
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
        } else {
            callback(null, null);
        }
    });
}

export function getRandomPrompt() {
    const prompts = [
        'Steampunk explorer, brass and leather, goggles, clockwork gears, Victorian style, brown tones, intricate details, mechanical elements',
        'Mystical forest elf, green ethereal robes, leafy details, glowing runes, pointed ears, flowing hair, natural colors',
        'Ancient Egyptian pharaoh, golden headdress, ornate jewelry, white linen kilt, regal posture, intricate patterns, traditional sandals',
        'medieval knight in shining armor, intricate engravings, full plate armor, chainmail details, armored boots, and gauntlets, helmet with visor, polished steel',
        'Victorian vampire, dark elegant suit, high collar cape, pale complexion, slicked-back hair, red and black hues, gothic details',
        'Retro astronaut suit, bright orange fabric, rounded helmet with visor, 60s sci-fi style, silver details, patches and emblems',
        'Neon punk rocker, vibrant mohawk, spiked leather jacket, ripped jeans, colorful tattoos, bold makeup',
        'Ice queen, flowing icy blue gown, sparkling snowflake details, silver crown, pale complexion, cold aura',
        'Neon samurai, glowing armor, futuristic design, vibrant colors, katana sheath, traditional patterns, sleek helmet',
        'a 3D model, humanoid dragon, red scaled skin, large wings, spiked tail, fierce expression, medieval fantasy style, realistic textures, symmetry, hi poly geometry, high displacement 3d model, masterpiece',
        'Greek goddess, flowing white toga, golden laurel crown, intricate jewelry, sandals, elegant posture, divine aura',
        'Post-apocalyptic survivor, rugged clothing, patched armor, gas mask, worn boots, utility belt, grimy details',
        'Alien astronaut, sleek silver suit, glowing blue patterns, elongated helmet, extraterrestrial features, advanced tech details',
        'Retro-futuristic spaceman, metallic silver suit, bubble helmet, glowing accents, sleek jetpack, vintage 1950s sci-fi style',
        'Fire mage, flowing red and orange robes, glowing runes, flame patterns, intense expression, flowing hair, mystical aura',
        'Cyberpunk hacker, neon-lit jacket, tech-embedded clothing, augmented reality glasses, sleek and futuristic look',
        'Forest ranger, mossy green cloak, leather armor, earthy tones, leaf patterns, rugged boots',
        'Viking warrior, fur-lined leather armor, horned helmet, braided beard, rugged look, earthy tones, intricate patterns',
        'Fantasy pirate captain, rugged coat, tricorn hat, eye patch, ornate belt, weathered boots, adventurous look',
        'Gothic steampunk vampire, dark Victorian attire, brass and leather details, red accents, high collar, intricate patterns',
        'Phoenix warrior, fiery armor, flaming wings, vibrant reds and oranges, intricate feather details, intense expression',
        'Samurai warrior, traditional armor, intricate patterns, dark and crimson colors, fierce expression, topknot hairstyle, detailed textures',
        'Medieval sorceress, dark flowing robes, mystical runes, hooded cloak, arcane patterns, ancient and mysterious look',
        'Ancient Roman gladiator, muscular build, bronze armor, detailed helmet, leather sandals and straps, fierce expression',
        'a 3D model, fairy princess, ethereal dress, sparkly wings, floral patterns, pastel colors, delicate details, glowing aura, fantastical look',
        'Classic circus ringmaster, red tailcoat, black top hat, white gloves, gold epaulets, striped pants, confident stance',
        'Cybernetic samurai, neon-lit armor, sleek black and red design, robotic limbs, detailed plating, high-tech visor',
        'Haunted scarecrow, tattered clothes, straw details, weathered hat, creepy expression, patchwork patterns',
        'Ice dragon, crystalline scales, sharp claws, frosty blue tones, majestic wings, intricate detailing',
        'Steampunk aviator, leather flight jacket, goggles, mechanical wings, brass details, rugged boots, vintage pilot look',
        'Ice warrior, crystalline armor, frosty blue and white tones, jagged ice patterns, cold aura',
        'Ancient Greek warrior, bronze armor, crested helmet, muscular build, leather skirt, sandals, traditional patterns',
        'Cyberpunk street samurai, neon-lit armor, sleek black design, glowing blue accents, high-tech visor, robotic limbs',
        'a 3D model, zombie pirate, tattered clothes, decayed skin, barnacles, eye patch, rugged look, eerie aura',
        'Egyptian mummy, ancient bandages, golden jewelry, weathered textures, mystical aura, traditional headdress',
        'Medieval alchemist, tattered robes, potion vials, leather satchel, mysterious aura, arcane symbols',
        'Samurai cat, traditional Japanese armor, feline features, intricate patterns, vibrant colors, topknot hair, detailed textures',
        'Mystical forest druid, leafy robes, wooden staff, intricate vine patterns, earthy tones, wise expression',
        'Retro superhero, bright spandex suit, bold emblem, cape, mask, primary colors, muscular build',
        'Steampunk time traveler, intricate gadgets, leather corset, brass goggles, Victorian-inspired dress, clockwork accessories',
        'Dark sorcerer, tattered black robes, glowing red runes, skeletal details, ominous aura',
        'Space marine, heavy futuristic armor, blue and silver tones, helmet with visor, bulky design, detailed plating',
        'Cyberpunk mercenary, tactical armor, neon accents, visor helmet, sleek design, dark palette, detailed gadgets',
        'a 3D model, ice fairy, translucent blue wings, frost-covered dress, sparkling details, glowing aura, intricate patterns, symmetrical design, high poly geometry, high quality textures, fantasy look',
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
}

export function importToProject(objectUrl, callback) {
    downloadFileFromBucket(objectUrl, `${app.name} Package.lspkg`, function(filePath, tempDir) {
        importBodymorph(filePath, tempDir).then(() => {
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
