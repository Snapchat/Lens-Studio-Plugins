import * as Ui from 'LensStudio:Ui';

export const HintID = {
    'intensity': 0,
    'prompt': 1
};

const hintScheme = {
    [HintID.prompt]: {
        'title': 'Prompt',
        'text': 'Describe what you want to generate on a cloth using separate keywords.' +
        ' The words at the beginning have the most influence.'
    }
};

class HintFactory {
    createHint(parent, id) {
        const image_width = hintScheme[id].image_width;
        const image_height = hintScheme[id].image_height;
        const image_path = hintScheme[id].image_path;
        const title = hintScheme[id].title;
        const text = hintScheme[id].text;

        const layout = Ui.BoxLayout.create();
        layout.setDirection(Ui.Direction.TopToBottom);

        const content = Ui.Widget.create(parent);

        if (image_path) {
            const imageView = Ui.ImageView.create(content);

            const image = Ui.Pixmap.create(image_path);

            image.resize(image_width * 2, image_height * 2);

            imageView.pixmap = image;
            imageView.setFixedWidth(image_width);
            imageView.setFixedHeight(image_height);
            imageView.scaledContents = true;

            layout.addWidget(imageView);
        }

        const header = Ui.Label.create(content);
        header.text = title;
        header.fontRole = Ui.FontRole.TitleBold;

        const desc = Ui.Label.create(content);
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
