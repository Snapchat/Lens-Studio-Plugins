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
