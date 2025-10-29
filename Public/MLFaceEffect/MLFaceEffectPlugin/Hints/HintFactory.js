import * as Ui from 'LensStudio:Ui';

export const HintID = {
    'intensity': 0,
    'user_skin_tone': 1,
    'user_identity': 2,
    'user_skin_texture': 3,
    'eyes_preservation': 4,
    'mouth_preservation': 5,
    'nose_preservation': 6,
    'ears_preservation': 7,
    'brows_preservation': 8,
    'face_contour_preservation': 9,
    'hair_preservation': 10,
    'prompt': 11,
    'effect_prompt': 12,
    'image_reference': 13,
    'reference_strength': 14,
    'attributes_preservation': 15,
    'seed': 16,
    'standard_mode': 17,
    'enhanced_mode': 18
};

const hintScheme = {
    [HintID.intensity] : {
        'image_width': 256,
        'image_height': 86,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/effect_intensity.png')),
        'title': 'Effect Intensity',
        'text': 'Higher value - more deformation to the effect.'
    },
    [HintID.user_identity] : {
        'image_width': 256,
        'image_height': 127,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/user_identity.png')),
        'title': 'User Identity',
        'text': 'Save the identity features of the user face.'
    },
    [HintID.user_skin_tone] : {
        'image_width': 256,
        'image_height': 127,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/user_skin_tone.png')),
        'title': 'User Skin Tone',
        'text': 'Make the skin tone closer to the initial user face color.'
    },
    [HintID.user_skin_texture] : {
        'image_width': 256,
        'image_height': 127,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/user_skin_texture.png')),
        'title': 'User Skin Texture',
        'text': 'Make the effect texture closer to the realistic user face.'
    },
    [HintID.eyes_preservation] : {
        'image_width': 256,
        'image_height': 127,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/eyes_preservation.png')),
        'title': 'Eyes Preservation',
        'text': 'Save the initial user eyes.'
    },
    [HintID.mouth_preservation] : {
        'image_width': 256,
        'image_height': 127,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/mouth_preservation.png')),
        'title': 'Mouth Preservation',
        'text': 'Save the initial user mouth.'
    },
    [HintID.nose_preservation] : {
        'image_width': 256,
        'image_height': 127,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/nose_preservation.png')),
        'title': 'Nose Preservation',
        'text': 'Save the initial user nose.'
    },
    [HintID.ears_preservation] : {
        'image_width': 256,
        'image_height': 127,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/ears_preservation.png')),
        'title': 'Ears Preservation',
        'text': 'Save the initial user ears.'
    },
    [HintID.brows_preservation] : {
        'image_width': 256,
        'image_height': 127,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/brows_preservation.png')),
        'title': 'Brows Preservation',
        'text': 'Save the initial user brows.'
    },
    [HintID.face_contour_preservation] : {
        'image_width': 256,
        'image_height': 127,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/face_contour_preservation.png')),
        'title': 'Face Contour Preservation',
        'text': 'Save the initial user face contour.'
    },
    [HintID.hair_preservation] : {
        'image_width': 256,
        'image_height': 127,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/hair_preservation.png')),
        'title': 'Hair Preservation',
        'text': 'Save the initial user hair.'
    },
    [HintID.prompt]: {
        'title': 'Text Prompt',
        'text': 'Describe the effect you want to create in details. For example: big head, big cheeks, big lips, happy'
    },
    [HintID.image]: {
        'title': 'Image Reference',
        'text': 'Provide up to 5 images emphasizing the features you want to generate. For example: images of smiling people'
    },
    [HintID.effect_prompt]: {
        'title': 'Effect Prompt',
        'text': 'Describe the effect you’d like to create. For more consistent and predictable results, we recommend also adding an Image Reference.'
    },
    [HintID.image_reference]: {
        'title': 'Image Reference',
        'text': 'Add an image reference to guide the effect. This is the most informative input to shape the result.'
    },
    [HintID.reference_strength]: {
        'title': 'Reference Strength',
        'text': 'Controls how strongly the effect follows the Image Reference. A higher value makes the result closer to the Image Reference, but reduces similarity to the original user photo.'
    },
    [HintID.attributes_preservation]: {
        'title': 'Attributes preservation',
        'text': 'Affects the hair and headwear area the most. When increasing the value, the model maintains greater consistency in the hair area and does not remove hair or headwear from the head.'
    },
    [HintID.seed]: {
        'title': 'Seed',
        'text': 'Control randomness with a seed. Use the same number to recreate the same look, or try different ones for new variations!'
    },
    [HintID.standard_mode] : {
        'image_width': 256,
        'image_height': 86,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/standard_mode.png')),
        'title': 'Standard Model',
        'text': 'A familiar mode featuring classic face transformations.'
    },
    [HintID.enhanced_mode] : {
        'image_width': 256,
        'image_height': 86,
        'image_path': new Editor.Path(import.meta.resolve('./Resources/enhanced_mode.png')),
        'title': 'Enhanced Model',
        'text': 'Good for morphs, characters, and animal transformations, while preserving identity.'
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
