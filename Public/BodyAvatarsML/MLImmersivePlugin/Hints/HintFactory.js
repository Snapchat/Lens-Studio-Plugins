import * as Ui from 'LensStudio:Ui';

export const HintID = {
    'imagePrompt': 0,
    'humanoidAnatomy': 1,
    'faceSwap': 2
};

const hintScheme = {
    [HintID.imagePrompt] : {
        'image_width': 256,
        'image_height': 86,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/img.png')),
        'text': 'Examples of good image references'
    },
    [HintID.humanoidAnatomy]: {
        'title': 'Non-humanoid anatomy',
        'text': 'Enable this option if your reference image shows a character or object without a human-like body structure (for example: a banana, cactus, snowman, or other non-humanoid shapes).'
    },
    [HintID.faceSwap]: {
        'title': 'Preserve user’s face',
        'text': '"Preserve user’s face" inserts the Lens user’s face into the generated character. This option works only if the uploaded image reference contains recognizable human facial features.'
    }
};

class HintFactory {
    createHint(parent, id) {
        const image_width = hintScheme[id].image_width;
        const image_height = hintScheme[id].image_height;
        const image_path = hintScheme[id].image_path;
        const title = hintScheme[id].title;
        const text = hintScheme[id].text;

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        const content = new Ui.Widget(parent);
        if (image_path) {
            const imageView = new Ui.ImageView(content);

            const image = new Ui.Pixmap(image_path);

            image.resize(image_width * 2, image_height * 2);

            imageView.pixmap = image;
            imageView.setFixedWidth(image_width);
            imageView.setFixedHeight(image_height);
            imageView.scaledContents = true;
            layout.addWidget(imageView);

            imageView.raise();
        }

        if (title) {
            const header = new Ui.Label(content);
            header.text = title;
            header.fontRole = Ui.FontRole.TitleBold;
            layout.addWidget(header);
        }

        if (text) {
            const desc = new Ui.Label(content);
            desc.text = text;
            desc.wordWrap = true;

            layout.addWidget(desc);
        }

        content.layout = layout;
        return content;
    }
}

const hintFactory = new HintFactory();

export function getHintFactory() {
    return hintFactory;
}
