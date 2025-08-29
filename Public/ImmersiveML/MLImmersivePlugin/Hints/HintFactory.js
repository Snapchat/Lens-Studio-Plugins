import * as Ui from 'LensStudio:Ui';

export const HintID = {
    'prompt': 0,
    'cartoonish': 1,
    'realistic': 2
};

const hintScheme = {
    [HintID.prompt]: {
        'title': 'Text Prompt',
        'text': 'Describe the style you want to create in details. Very descriptive prompt are better, for example: comic book, art graphic illustration, vibrant, highly detailed'
    },
    [HintID.image]: {
        'title': 'Image Reference',
        'text': 'Provide up to 5 images emphasising the features you want to generate. You can use different references to mix the styles'
    },
    [HintID.cartoonish] : {
        'image_width': 256,
        'image_height': 86,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/cartoonish.png')),
        'title': 'Cartoonish Effect Type',
        'text': 'Useful for illustration style experiments.'
    },
    [HintID.realistic] : {
        'image_width': 256,
        'image_height': 86,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/realistic.png')),
        'title': 'Realistic Effect Type',
        'text': 'Good for clothes, hair, accessories.'
    },
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
