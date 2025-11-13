import * as Ui from 'LensStudio:Ui';

export const HintID = {
    'prompt': 0,
    'cartoonish': 1,
    'realistic': 2,
    'reference_strength': 3,
    'enhanced': 4,
    'enhancedTextPrompt': 5,
    'enhancedImagePrompt': 6,
    'seed': 7
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
        'image_path': new Editor.Path(import.meta.resolve('./Resources/cartoonish_1.png')),
        'title': 'Cartoonish Effect Type',
        'text': 'Useful for illustration style experiments.'
    },
    [HintID.realistic] : {
        'image_width': 256,
        'image_height': 86,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/realistic_1.png')),
        'title': 'Realistic Effect Type',
        'text': 'Good for clothes, hair, accessories.'
    },
    [HintID.reference_strength]: {
        'title': 'Reference Strength',
        'text': 'Controls how strongly the effect follows the Image Reference. A higher value makes the result closer to the Image Reference, but reduces similarity to the original user photo.'
    },
    [HintID.enhanced] : {
        'image_width': 256,
        'image_height': 86,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/enhanced.png')),
        'title': 'Enhanced Effect Type',
        'text': 'Offers a wide spectrum of high-quality visual styles, from hyper-realistic to graphic and cartoonish.'
    },
    [HintID.enhancedTextPrompt]: {
        'title': 'Effect Prompt',
        'text': 'Describe the effect you’d like to create. For more consistent and predictable results, we recommend also adding an Image Reference.'
    },
    [HintID.enhancedImagePrompt]: {
        'title': 'Image Reference',
        'text': 'Add an image reference to guide the effect. This is the most informative input to shape the result.'
    },
    [HintID.seed]: {
        'title': 'Seed',
        'text': 'Control randomness with a seed. Use the same number to recreate the same look, or try different ones for new variations!'
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
