import * as Network from 'LensStudio:Network';
import * as fs from 'LensStudio:FileSystem';
import { importEffect } from './import_effect.js';
import { getHintFactory } from './Hints/HintFactory.js';
import * as Ui from 'LensStudio:Ui';
import app from '../application/app.js';

import { logEventLinkOpen } from '../application/analytics.js';

const termsLink = 'https://www.snap.com/terms/lens-studio-license-agreement';
const guidelinesLink = 'https://developers.snap.com/lens-studio/features/genai-suite/immersive-ml-generation';

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

const infoImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('Resources/info_icon.svg')));
const calloutInfoImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('Resources/info.svg')));

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
    frame.setBackgroundColor(createColor(68, 74, 85, 255));

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

function createColor(r, g, b, a) {
    const color = new Ui.Color();
    color.red = r;
    color.green = g;
    color.blue = b;
    color.alpha = a;
    return color;
}

export function createTermsWidget(parent) {
    const urlString = Ui.getUrlString('Generative Lens Tools Terms', termsLink);

    return createCalloutWidget(parent, 'By using the feature, you agree to our ' + urlString, termsLink)
}

export function createGuidelinesWidget(parent) {
    const urlString = Ui.getUrlString('guidelines', guidelinesLink);

    return createCalloutWidget(parent, 'Check our ' + urlString + ' for examples, prompting best practices and usage guidelines.', guidelinesLink);
}

export function createErrorIcon(parent) {
    return createIcon(parent, new Ui.Pixmap(new Editor.Path(import.meta.resolve('Resources/error_icon.svg'))));
}

export function createInfoIcon(parent) {
    return createIcon(parent, calloutInfoImage);
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
    disclaimerLabel.text = '<center>There was a problem with creating generator.</center><center>Please try again.</center>';

    frameLayout.addWidgetWithStretch(disclaimerLabel, 0, Ui.Alignment.AlignCenter);
    frameLayout.addStretch(0);

    frame.layout = frameLayout;
    return frame;
}

export function createGenerationInProgressWidget(parent, isStandard = false) {
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
    icon.setFixedHeight(32);
    icon.setFixedWidth(32);

    headerLayout.addWidget(icon);

    header.layout = headerLayout;

    frameLayout.addStretch(0);
    frameLayout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignCenter);

    const disclaimerLabel = new Ui.Label(frame);
    if (isStandard) {
        disclaimerLabel.text = '<center>Generating preview...<br>This may take up to 10-15 minutes.<br><br>You can close this window and return later.</center>';
    }
    else {
        disclaimerLabel.text = '<center>Generating preview...<br>This may take up to 5 minutes.<br><br>You can close this window and return later.</center>';
    }

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
        '16-bit game character',
        '80\'s aesthetic watercolour summer wildflower clipart with a variety of colored flowers neutral with green stems',
        'beautiful 80\'s anime style, flat',
        'fine art portrait from 18 century, museum masterpiece, floral background, pastel colors',
        'pixel art',
        '2d anime style 2d illustration',
        'a colorful comic noir illustration 2d illustration',
        'anime artwork',
        'as a comic book character',
        'bauhaus style poster',
        'cartoon style of the 50s 2d art',
        'comic book art graphic illustration comic graphic novel art vibrant highly detailed',
        'cubism art',
        'doodle art style',
        'isometric pixel art',
        'isometric',
        'low poly style',
        'marker drawing',
        'old classic cartoon style 2d graphic with black stroke',
        'relief wood carving sculpture wood carving',
        'stained glass style'
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
}

export function getRealisticRandomPrompt() {
    const prompts = [
        'pale green hair styled in soft loose waves, dark green coat decorated with intricate floral patterns and brass accessories, top hat decorated with detailed gears, lenses and mechanical parts, steampunk functionality',
        'frontal illustration of an angel looking up at the sky, with soft features, curly hair, and detailed wings. Surround the figure with a radiant, romantic Valentine’s Day atmosphere, including warm pastel tones, subtle heart motifs, and a serene background of glowing rays',
        'detailed luxurious hat of crimson roses with golden highlights, paired with a detailed scarlet shirt adorned with bead embroidery, hair blowing dramatically, standing in the middle of a whirlwind of red rose petals, creating a surreal and enchanting effect, mystical fog of red and black and glitter around, confetti everywhere, rose petals levitate in the air',
        'baseball player standing confidently on a professional field, dressed in a full uniform including a cap, jersey, pants, and cleats. Player holds a bat over their shoulder, exuding focus and determination, with a sunny sky and a lively stadium crowd in the background. The field features neatly trimmed grass, a well-maintained diamond, and bases visible in the distance. The scene captures the essence of America\'s pastime, with a sense of anticipation and athleticism',
        'dressed in intricate theatrical clown costumes, made in the style of painterly digital illustration with a semi-realistic approach, a whimsical fantasy with an emphasis on a bright vintage circus aesthetic',
        'fantasy that depicts characters dressed in luxurious golden attire with a celestial and royal aesthetic. The clothing includes flowing, radiant dresses made of multi-layered shimmering fabrics that mimic the glow of sunlight, details with gold embroidery, jewelry and natural motifs such as leaves and wings, ornate crowns, elegant clothing, wings are large and luminous, seeming translucent and shining with golden light, ethereal sparkles',
        'vibrant flower crown adorning the head, hippie-inspired style, figure in a colorful hippie-inspired outfit layered with fringe accessories, standing in a sunlit meadow with wildflowers, sharp details and vivid textures illuminated by soft golden light',
        'punk mohawk with yellow-red-pink-green colors hairstyle, black leather jacket completely covered with silver spikes, graffiti alley background, dramatic lighting',
        'elaborate white huge wig adorned with roses and pearl accents, lifelike realistic hair, detailed rococo male figure wearing pastel blue and pale pink embroidered high-neck attire, ornate rococo garden with overflowing rose bushes, a decorative palace in the distance, soft golden sunlight casting delicate shadows, intricate textures on fabric and flowers, glowing highlights on the wig and pearls, ultra-detailed rococo architecture, cinematic lighting, 8k textures, smooth gradients for realism',
        'waist-up rococo figure, white wig with pearls and roses, pastel embroidered male jacket with intricate gold details, soft daylight, realistic textures, ornate style, pastel colors, clear details, lush rococo garden filled with blooming rose bushes'
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
}

export function getEnhancedRandomPrompt() {
    const prompts = [
        'retro comic art, crisp lines, graphic style, high quality, vibrant, cute features',
        '2d art, detailed illustration, cute, soft colors, blush, background city park, green jacket, shadows, ginger, sunset, falling leaves, fully dressed',
        'pencil drawing, line art, linear artistic style, stylized graphic portrait, sketch, graphic, blue-toned, sepia, expressive sketch art with a focus on realism and abstraction, intricate linework, monochromatic palette, hyper-realistic features, abstract flow, cloth, stylized exaggeration',
        'pixel art, brown, mint, pink, blue, minimalistic, vibrant, fully dressed',
        'detailed 2d illustration, 2d art, cute, drawn hair, fully covered outfit, background open space, a lot of stars, clean skin, soft freckles, dressed',
        'neon, vivid pink neon light, saturated hues, softly illuminated, futuristic, dynamic aesthetic, dark black background, cute, modern, warm tones',
        '2d art, high quality, illustration, sharp edges, night sky, moon, stars, clouds, soft pink and soft blue, fully covered outfit',
        'oil painting, brush strokes texture, flowers, hydrangea, fully dressed',
        'low-poly style, blocks, planes, sculpt, sharp edges, visible brush strokes texture, cold-toned, (pink, blue, teal, purple)',
        'soft pink, magic aesthetics, glowing, charming, soft rose-pink, sparkles, dark pink background, cinematic lighting, fully dressed, beige, red, pink, purple',
        'pink magic glowing background, charming, beautiful soft rose-pink, glitter, sparkles, dark background, cinematic lighting, fully dressed, pink, nostalgic'
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
