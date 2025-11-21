import * as Ui from 'LensStudio:Ui';

import * as GuidelineAndTermsWidget from '../common-ui/GuidelineAndTermsWidget';
import * as Hint from '../common-ui/Hint';
import { UIConfig } from '../UIConfig';
import { TextInput } from '../common-ui/controls/TextInput';
import { SeedControl } from '../common-ui/controls/SeedControl';

function getRandomSeed(): number {
    return Math.floor(Math.random() * 2147483647);
}

export class CreationMenu {
    public controls: Record<string, TextInput | SeedControl> = {};
    private widget!: Ui.Widget;
    private menu!: Ui.Widget;
    private menuLayout: Ui.BoxLayout = new Ui.BoxLayout();

    constructor() {}

    init() {
        this.reset();
    }

    stop() {
        this.reset();
    }

    reset() {
        this.controls["prompt"].reset();
        this.controls["negativePrompt"].reset();
        this.controls["seed"].reset();
    }

    createMenu(parent: Ui.Widget): Ui.Widget {
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
        titleLabel.text = 'Face Mask Texture';
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
        const promptHint = Hint.createStandardHintWidget(
            promptContainer,
            'Prompt',
            'Describe the face mask you want to generate. Be specific about details, style, and appearance.'
        );
        this.controls["prompt"] = new TextInput(
            promptContainer,
            'Prompt',
            '',
            'Describe the face texture...',
            200,
            promptHint,
            true
        );
        this.controls["prompt"].setSurpriseMeCallback(() => {
            this.controls["prompt"].value = this.getRandomPrompt();
        });
        promptLayout.addWidget(this.controls["prompt"].widget);


        const negativePromptHint = Hint.createStandardHintWidget(
            promptContainer,
            'Negative Prompt',
            'Specify what you don\'t want to see in the generated face mask. This helps refine the output.'
        );
        this.controls["negativePrompt"] = new TextInput(
            promptContainer,
            'Negative Prompt',
            '',
            'Enter what you don\'t want...',
            200,
            negativePromptHint
        );
        promptLayout.addWidget(this.controls["negativePrompt"].widget);
        promptContainer.layout = promptLayout;
        this.menuLayout.addWidget(promptContainer);

        // Separator line
        const separatorContainer = new Ui.Widget(this.menu);
        const separatorLayout = new Ui.BoxLayout();
        separatorLayout.setDirection(Ui.Direction.TopToBottom);
        separatorLayout.setContentsMargins(0, 16, 0, 16);

        const separator = new Ui.Widget(separatorContainer);
        separator.setFixedHeight(1);
        separator.autoFillBackground = true;
        separator.backgroundRole = Ui.ColorRole.Light;

        separatorLayout.addWidget(separator);
        separatorContainer.layout = separatorLayout;
        this.menuLayout.addWidget(separatorContainer);

        // Seed
        const seedHint = Hint.createStandardHintWidget(
            this.menu,
            'Seed',
            'The seed value controls randomness. Using the same seed with identical settings will produce consistent results.'
        );
        this.controls["seed"] = new SeedControl(this.menu, 'Seed', getRandomSeed(), seedHint, undefined, undefined);
        this.menuLayout.addWidget(this.controls["seed"].widget);

        this.menuLayout.addStretch(0);
        this.menuLayout.spacing = Ui.Sizes.Spacing;
        this.menu.layout = this.menuLayout;

        this.reset();

        return this.menu;
    }

    create(parent: Ui.Widget): Ui.Widget {
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

    getRandomPrompt(): string {
        const prompts = [
            'Neon cyberpunk face mask with glowing circuit patterns and bright pink-blue highlights.',
            'Hand-painted watercolor mask with soft pastel tones and abstract brush textures.',
            'Futuristic chrome mask with reflective surfaces and smooth metallic details.',
            'Wood-carved tribal mask with detailed engravings and earthy tones.',
            'Holographic mask with animated glitch effects and floating geometric fragments.',
            'Steampunk mask with brass textures, gears, and glowing mechanical eyes.',
            'Mystical crystal mask with glowing runes and magical aura around the eyes.',
            'Cartoon-style mask with bold outlines and exaggerated facial features.',
        ];
        return prompts[Math.floor(Math.random() * prompts.length)];
    }
}
