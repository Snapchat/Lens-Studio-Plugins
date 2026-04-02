import * as Ui from 'LensStudio:Ui';
import * as GuidelineAndTermsWidget from '../common-ui/GuidelineAndTermsWidget';
import * as Hint from '../common-ui/Hint';
import { UIConfig } from '../UIConfig';
import { TextInput } from '../common-ui/controls/TextInput';
export class CreationMenu {
    constructor() {
        this.controls = {};
        this.menuLayout = new Ui.BoxLayout();
    }
    init() {
        this.reset();
    }
    stop() {
        this.reset();
    }
    reset() {
        this.controls["prompt"].reset();
    }
    createMenu(parent) {
        this.menu = new Ui.Widget(parent);
        this.menu.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.menu.setContentsMargins(0, 0, 0, 0);
        this.menuLayout = new Ui.BoxLayout();
        this.menuLayout.setDirection(Ui.Direction.TopToBottom);
        // Title
        const titleWidget = new Ui.Widget(this.menu);
        const titleLayout = new Ui.BoxLayout();
        titleLayout.setDirection(Ui.Direction.LeftToRight);
        const titleLabel = new Ui.Label(titleWidget);
        titleLabel.text = 'Texture Generation';
        titleLabel.fontRole = Ui.FontRole.MediumTitleBold;
        titleLayout.addStretch(0);
        titleLayout.addWidget(titleLabel);
        titleLayout.addStretch(0);
        titleWidget.layout = titleLayout;
        this.menuLayout.addWidget(titleWidget);
        this.menuLayout.addWidget(GuidelineAndTermsWidget.createGuidelinesWidget(this.menu));
        this.menuLayout.addWidget(GuidelineAndTermsWidget.createTermsWidget(this.menu));
        this.menuLayout.addStretch(0);
        const promptContainer = new Ui.Widget(this.menu);
        const promptLayout = new Ui.BoxLayout();
        promptLayout.setDirection(Ui.Direction.TopToBottom);
        promptLayout.setContentsMargins(0, 16, 0, 0);
        promptLayout.spacing = Ui.Sizes.Spacing;
        // Prompt input
        const promptHint = Hint.createStandardHintWidget(promptContainer, 'Prompt', 'Describe the texture you want to generate. Be specific about details, style, and appearance.');
        this.controls["prompt"] = new TextInput(promptContainer, 'Prompt', '', 'Describe the texture...', 200, promptHint, true);
        this.controls["prompt"].setSurpriseMeCallback(() => {
            this.controls["prompt"].value = this.getRandomPrompt();
        });
        promptLayout.addWidget(this.controls["prompt"].widget);
        promptContainer.layout = promptLayout;
        this.menuLayout.addWidget(promptContainer);
        this.menuLayout.spacing = Ui.Sizes.Spacing;
        this.menu.layout = this.menuLayout;
        this.reset();
        return this.menu;
    }
    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(UIConfig.CREATION_MENU.WIDTH);
        this.widget.setFixedHeight(UIConfig.CREATION_MENU.HEIGHT);
        this.widget.setContentsMargins(8, 0, 8, 0);
        const menu = this.createMenu(this.widget);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;
        layout.addWidget(menu);
        layout.addStretch(0);
        this.widget.autoFillBackground = true;
        layout.spacing = 0;
        this.widget.layout = layout;
        return this.widget;
    }
    getRandomPrompt() {
        const prompts = [
            "Hand-painted watercolor texture with soft pastel tones and subtle brush strokes.",
            "Vibrant abstract geometric pattern in a modern art style, sharp edges and bold colors.",
            "Oil painting canvas texture with visible brush details and rich color blending.",
            "Seamless moss-covered stone texture, detailed and realistic, with natural lighting.",
            "Wood grain texture with warm tones, organic imperfections, and visible knots.",
            "Marble surface texture with white and gold veins, polished and glossy finish.",
            "Holographic texture with iridescent reflections and shifting neon hues.",
            "Denim fabric texture with visible stitching and realistic fabric weave.",
            "Reflective leather surface with fine wrinkles and soft light reflections.",
        ];
        return prompts[Math.floor(Math.random() * prompts.length)];
    }
}
