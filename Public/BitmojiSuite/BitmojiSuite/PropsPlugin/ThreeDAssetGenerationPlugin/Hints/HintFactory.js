import * as Ui from 'LensStudio:Ui';

export const HintID = {
    'remove_shadows': 0,
    'prompt': 1
};

const hintScheme = {
    [HintID.remove_shadows] : {
        'image_width': 256,
        'image_height': 127,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/remove_shadows.png')),
        'title': 'Remove Shadows',
        'text': 'Generate 3D Asset without baked shadows.'
    },
    [HintID.prompt]: {
        'title': 'Prompt',
        'text': 'Describe what object you want to create and select the best 3D model from the previews for the final result.'
    },
    [HintID.negative_prompt]: {
        'title': 'Negative Prompt',
        'text': 'Describe what you want to exclude from generation.'
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
