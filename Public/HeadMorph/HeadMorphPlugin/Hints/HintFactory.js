import * as Ui from 'LensStudio:Ui';

export const HintID = {
    'intensity': 0,
    'prompt': 1,
    'image': 2,
    'text_reference': 3
};

const hintScheme = {
    [HintID.intensity] : {
        'image_width': 256,
        'image_height': 86,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/intensity_hint.png')),
        'title': 'Intensity',
        'text': 'Higher value - more deformation on the shape.'
    },
    [HintID.prompt]: {
        'title': 'Text Prompt',
        'text': 'Describe the effect you want to create in details. For example: big head, big cheeks, big lips, happy'
    },
    [HintID.image]: {
        'title': 'Image Reference',
        'text': 'Provide an image reference emphasizing the head generator you want to create.'
    },
    [HintID.text_reference]: {
        'title': 'Text Reference',
        'text': 'Provide additional context on how you want to change the image.'
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
        }

        const header = new Ui.Label(content);
        header.text = title;
        header.fontRole = Ui.FontRole.TitleBold;

        const desc = new Ui.Label(content);
        desc.text = text;
        desc.wordWrap = true;

        layout.addWidget(header);
        layout.addWidget(desc);

        content.layout = layout;
        return content;
    }
}

const hintFactory = new HintFactory();

export function getHintFactory() {
    return hintFactory;
}
