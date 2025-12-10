import * as Ui from 'LensStudio:Ui';
import * as Shell from 'LensStudio:Shell';

import app from '../../application/app.js';
import { createErrorIcon } from '../utils.js';
import { GeneratorState } from '../../generator/generator.js';
import { UIConfig } from '../UIConfig.js';

const PreviewState = {
    Login: 0,
    Loading: 1,
    Preview: 2,
    Failed: 3,
    Reload: 4,
    HomeScreen: 5,
    Terms: 6,
    ApiVersion: 7
}

export class Preview {
    constructor() {
        this.connections = [];
        this.state = PreviewState.Idle;

        this.stateToScreen = {
            [GeneratorState.Uninitialized]: this.showLoading,
            [GeneratorState.Unauthorized]: this.showLogin,
            [GeneratorState.UnsupportedApiVersion]: this.showApiVersion,
            [GeneratorState.RequestedTermsAndConditions]: this.showTerms,
            [GeneratorState.Idle]: this.showHomeScreen,
            [GeneratorState.Loading]: this.showLoading,
            [GeneratorState.Running]: this.showRunning,
            [GeneratorState.Success]: this.showTexture,
            [GeneratorState.ConnectionFailed]: this.showReload,
            [GeneratorState.Failed]: this.showFailed
        }

        Object.entries(this.stateToScreen).forEach(([state, show]) => {
            app.generator.stateChanged.on(state, show.bind(this));
        });
    }

    init() {
        this.stateToScreen[app.generator.state].bind(this)();
    }

    onCtaClicked() {
        switch(this.state) {
            case PreviewState.Login:
                app.authorize();
                break;
            case PreviewState.Reload:
                app.generator.init();
                break;
            case PreviewState.ApiVersion:
                Shell.openUrl('https://ar.snap.com/download', {});
                break;
            case PreviewState.Terms:
                Shell.openUrl('https://www.snap.com/terms/mlkit', {});
                this.showReload();
                break;
            default:
                console.warn("CTA has been clicked from the wrong state, please report the bug.")

        }
    }

    showHomeScreen() {
        this.state = PreviewState.HomeScreen;

        this.logo.visible = true;
        this.disclaimer.text = '<center>You don\'t have any generated effects yet.<br>Try creating a new one!</center>';
        this.welcomeText.visible = true;
        this.disclaimer.visible = true;
        this.ctaButton.visible = false;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 2;
        this.importToProjectButton.enabled = false;
    }

    showTexture() {
        this.state = PreviewState.Preview;

        this.previewImage.pixmap = new Ui.Pixmap(app.storage.createFile("Garment Image Preview.png", app.generator.textureBytes));

        this.stackedWidget.currentIndex = 0;
        this.importToProjectButton.enabled = true;
    }

    showRunning() {
        this.state = PreviewState.Running;

        this.logo.visible = false;
        this.welcomeText.visible = false;
        this.disclaimer.text = '<center>Generating preview...<br> This may take up to 10 seconds.</center>';
        this.disclaimer.visible = true;
        this.ctaButton.visible = false;
        this.loading.visible = true;

        this.stackedWidget.currentIndex = 2;
        this.importToProjectButton.enabled = false;
    }

    showFailed() {
        this.state = PreviewState.Failed;

        this.stackedWidget.currentIndex = 1;
        this.importToProjectButton.enabled = false;
    }

    showLogin() {
        this.state = PreviewState.Login;

        this.welcomeText.visible = true;
        this.disclaimer.text = '<center>Log-in to MyLenses account <br>to get access for Gen AI tools</center>';
        this.disclaimer.visible = true;
        this.ctaButton.text = '   Login   ';
        this.ctaButton.visible = true;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 2;
        this.importToProjectButton.enabled = false;
    }

    showApiVersion() {
        this.state = PreviewState.ApiVersion;

        this.logo.visible = true;
        this.welcomeText.visible = false;
        this.disclaimer.text = '<center>Please, update the plugin to <br>newer version to continue.</center>';
        this.disclaimer.visible = true;
        this.ctaButton.text = '   Update   ';
        this.ctaButton.visible = true;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 2;
        this.importToProjectButton.enabled = false;
    }

    showLoading() {
        this.state = PreviewState.Loading;

        this.logo.visible = false;
        this.ctaButton.visible = false;
        this.welcomeText.visible = false;
        this.disclaimer.visible = false;
        this.loading.visible = true;

        this.stackedWidget.currentIndex = 2;
        this.importToProjectButton.enabled = false;
    }


    showReload() {
        this.state = PreviewState.Reload;

        this.logo.visible = false;
        this.ctaButton.visible = true;
        this.ctaButton.text = '   Reload   ';
        this.disclaimer.text = '<center>Oops, something went wrong,<br> please reaload the page to try again.</center>';
        this.welcomeText.visible = false;
        this.disclaimer.visible = true;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 2;
        this.importToProjectButton.enabled = false;
    }

    showTerms() {
        this.state = PreviewState.Terms;

        this.logo.visible = true;
        this.ctaButton.visible = true;
        this.ctaButton.text = '   Read and Accept   ';
        this.disclaimer.text = '<center>Please, accept terms and <br>conditions to continue.</center>';
        this.disclaimer.visible = true;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 2;
        this.importToProjectButton.enabled = false;
    }

    createPreview(parent) {
        this.preview = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        this.previewImage = new Ui.ImageView(this.preview);
        this.previewImage.scaledContents = true;
        this.previewImage.setFixedHeight(UIConfig.PREVIEW.IMAGE_HEIGHT);
        this.previewImage.setFixedWidth(UIConfig.PREVIEW.IMAGE_WIDTH);

        layout.addStretch(0);
        layout.addWidget(this.previewImage);
        layout.addStretch(0);

        this.preview.layout = layout;

        return this.preview;
    }

    createGenerationErrorWidget(parent) {
        const frame = new Ui.Widget(parent);

        frame.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const frameLayout = new Ui.BoxLayout();
        frameLayout.setDirection(Ui.Direction.TopToBottom);
        frameLayout.setContentsMargins(0, 0, 0, 0);
        frameLayout.spacing = Ui.Sizes.Spacing;

        const header = new Ui.Widget(parent);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(0, 0, 0, 0);

        const icon = createErrorIcon(header);
        const headerLabel = new Ui.Label(header);

        headerLabel.text = 'Generation Failed';
        headerLabel.fontRole = Ui.FontRole.TitleBold;

        headerLayout.addWidget(icon);
        headerLayout.addWidget(headerLabel);

        header.layout = headerLayout;

        frameLayout.addStretch(0);
        frameLayout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignCenter);

        const disclaimerLabel = new Ui.Label(frame);
        disclaimerLabel.text = '<center>There was a problem generating the garment.</center><center>Please try to generate another one.</center>';

        frameLayout.addWidgetWithStretch(disclaimerLabel, 0, Ui.Alignment.AlignCenter);
        frameLayout.addStretch(0);

        frame.layout = frameLayout;
        return frame;
    }

    createHomeScreen(parent) {
        this.homeScreen = new Ui.Widget(parent);
        this.homeScreen.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.homeScreen.setFixedHeight(UIConfig.PREVIEW.HEIGHT);
        this.homeScreen.setFixedWidth(UIConfig.PREVIEW.WIDTH);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        this.logo = new Ui.ImageView(this.homeScreen);
        this.logo.pixmap = new Ui.Pixmap(import.meta.resolve('../Resources/gen_ai_wizzard.svg'));
        this.logo.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.logo.setFixedWidth(180);
        this.logo.setFixedHeight(180);
        this.logo.scaledContents = true;

        this.welcomeText = new Ui.Label(this.homeScreen);
        this.welcomeText.text = '<center>Welcome to<br>Lens Studio Gen AI</center>';
        this.welcomeText.fontRole = Ui.FontRole.LargeTitle;
        this.welcomeText.foregroundRole = Ui.ColorRole.BrightText;
        this.welcomeText.setFixedHeight(42);
        this.welcomeText.setFixedWidth(360);

        this.disclaimer = new Ui.Label(this.homeScreen);
        this.disclaimer.wordWrap = true;
        this.disclaimer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        this.disclaimer.setFixedHeight(28);
        this.disclaimer.setFixedWidth(300);
        this.disclaimer.text = '<center>Log-in to MyLenses account <br>to get access for Gen AI tools</center>';

        this.ctaButton = new Ui.PushButton(this.homeScreen);
        this.ctaButton.text = '   Login   ';
        this.ctaButton.primary = true;
        this.ctaButton.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.ctaButton.setFixedHeight(32);
        this.ctaButton.setContentsMargins(Ui.Sizes.DoublePadding, Ui.Sizes.Padding, Ui.Sizes.DoublePadding, Ui.Sizes.Padding);
        this.connections.push(this.ctaButton.onClick.connect(() => {
            this.onCtaClicked();
        }));

        this.loading = new Ui.ProgressIndicator(this.homeScreen);
        this.loading.start();
        this.loading.visible = false;

        layout.addStretch(1);
        layout.addWidgetWithStretch(this.logo, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.welcomeText, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.loading, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.disclaimer, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.ctaButton, 0, Ui.Alignment.AlignCenter);
        layout.addStretch(1);

        layout.spacing = Ui.Sizes.Padding;

        this.homeScreen.layout = layout;

        return this.homeScreen;
    }


    hideFooter() {
        this.importToProjectButton.visible = false;
    }

    showFooter() {
        this.importToProjectButton.visible = true;
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(16, 16, 16, 16);

        // Import To Project button
        this.importToProjectButton = new Ui.PushButton(this.footer);
        this.importToProjectButton.text = 'Import to Project';
        const importImagePath = import.meta.resolve('../Resources/import.svg');
        this.importToProjectButton.setIconWithMode(Editor.Icon.fromFile(importImagePath), Ui.IconMode.MonoChrome);
        this.importToProjectButton.primary = true;

        this.connections.push(this.importToProjectButton.onClick.connect(() => this.onImportClicked()));

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.importToProjectButton, 0, Ui.Alignment.AlignTop);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedHeight(UIConfig.PREVIEW.HEIGHT);
        this.widget.setFixedWidth(UIConfig.PREVIEW.WIDTH);
        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.stackedWidget = new Ui.StackedWidget(this.widget);
        this.stackedWidget.setContentsMargins(0, 0, 0, 0);

        this.stackedWidget.addWidget(this.createPreview(this.widget));
        this.stackedWidget.addWidget(this.createGenerationErrorWidget(this.widget));
        this.stackedWidget.addWidget(this.createHomeScreen(this.widget));

        this.layout.addStretch(0);
        this.layout.addWidget(this.stackedWidget);
        this.layout.addStretch(0);

        this.createFooter(this.widget)

        this.layout.spacing = 0;
        this.widget.backgroundRole = Ui.ColorRole.Midlight;
        this.widget.layout = this.layout;

        return this.widget;
    }
}
