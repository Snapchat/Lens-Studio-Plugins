import * as Ui from 'LensStudio:Ui';
import * as Shell from 'LensStudio:Shell';

import app from '../../application/app.js';
import { DIALOG_HEIGHT } from '../GarmentDialog.js';
import { createErrorIcon } from '../utils.js';
import { GeneratorState } from '../../generator/generator.js';

const PREVIEW_IMAGE_WIDTH = 320;
const PREVIEW_IMAGE_HEIGHT = 480;

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
            [GeneratorState.Running]: this.showLoading,
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

        this.disclaimer.text = '<center>Create garment by<br>specifiying type and prompt.</center>';
        this.disclaimer.visible = true;
        this.ctaButton.visible = false;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 2;
        this.importToProjectButton.enabled = false;
    }

    showTexture() {
        this.state = PreviewState.Preview;

        this.previewImage.pixmap = Ui.Pixmap.create(app.storage.createFile("Garment Image Preview.png", app.generator.textureBytes));

        this.stackedWidget.currentIndex = 0;
        this.importToProjectButton.enabled = true;
    }

    showFailed() {
        this.state = PreviewState.Failed;

        this.stackedWidget.currentIndex = 1;
        this.importToProjectButton.enabled = false;
    }

    showLogin() {
        this.state = PreviewState.Login;

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

        this.ctaButton.visible = false;
        this.disclaimer.visible = false;
        this.loading.visible = true;

        this.stackedWidget.currentIndex = 2;
        this.importToProjectButton.enabled = false;
    }

    showReload() {
        this.state = PreviewState.Reload;

        this.ctaButton.visible = true;
        this.ctaButton.text = '   Reload   ';
        this.disclaimer.text = '<center>Oops, something went wrong,<br> please reaload the page to try again.</center>';
        this.disclaimer.visible = true;
        this.disclaimer.visible = true;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 2;
        this.importToProjectButton.enabled = false;
    }

    showTerms() {
        this.state = PreviewState.Terms;

        this.ctaButton.visible = true;
        this.ctaButton.text = '   Read and Accept   ';
        this.disclaimer.text = '<center>Please, accept terms and <br>conditions to continue.</center>';
        this.disclaimer.visible = true;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 2;
        this.importToProjectButton.enabled = false;
    }

    createPreview(parent) {
        this.preview = Ui.Widget.create(parent);
        const layout = Ui.BoxLayout.create();
        layout.setDirection(Ui.Direction.LeftToRight);

        this.previewImage = Ui.ImageView.create(this.preview);
        this.previewImage.scaledContents = true;
        this.previewImage.setFixedHeight(PREVIEW_IMAGE_HEIGHT);
        this.previewImage.setFixedWidth(PREVIEW_IMAGE_WIDTH);

        layout.addStretch(0);
        layout.addWidget(this.previewImage);
        layout.addStretch(0);

        this.preview.layout = layout;

        return this.preview;
    }

    createGenerationErrorWidget(parent) {
        const frame = Ui.Widget.create(parent);

        frame.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const frameLayout = Ui.BoxLayout.create();
        frameLayout.setDirection(Ui.Direction.TopToBottom);
        frameLayout.setContentsMargins(0, 0, 0, 0);
        frameLayout.spacing = Ui.Sizes.Spacing;

        const header = Ui.Widget.create(parent);

        const headerLayout = Ui.BoxLayout.create();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(0, 0, 0, 0);

        const icon = createErrorIcon(header);
        const headerLabel = Ui.Label.create(header);

        headerLabel.text = 'Generation Failed';
        headerLabel.fontRole = Ui.FontRole.TitleBold;

        headerLayout.addWidget(icon);
        headerLayout.addWidget(headerLabel);

        header.layout = headerLayout;

        frameLayout.addStretch(0);
        frameLayout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignCenter);

        const disclaimerLabel = Ui.Label.create(frame);
        disclaimerLabel.text = '<center>There was a problem generating the garment.</center><center>Please try to generate another one.</center>';

        frameLayout.addWidgetWithStretch(disclaimerLabel, 0, Ui.Alignment.AlignCenter);
        frameLayout.addStretch(0);

        frame.layout = frameLayout;
        return frame;
    }

    createHomeScreen(parent) {
        this.homeScreen = Ui.Widget.create(parent);
        this.homeScreen.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.homeScreen.setFixedWidth(480);
        this.homeScreen.setFixedHeight(620);

        const layout = Ui.BoxLayout.create();
        layout.setDirection(Ui.Direction.TopToBottom);

        this.logo = Ui.ImageView.create(this.homeScreen);
        this.logo.pixmap = Ui.Pixmap.create(import.meta.resolve('../Resources/gen_ai_wizzard.svg'));
        this.logo.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.logo.setFixedWidth(180);
        this.logo.setFixedHeight(180);
        this.logo.scaledContents = true;

        this.disclaimer = Ui.Label.create(this.homeScreen);
        this.disclaimer.wordWrap = true;
        this.disclaimer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        this.disclaimer.setFixedWidth(300);
        this.disclaimer.text = '<center>Log-in to MyLenses account <br>to get access for Gen AI tools</center>';

        this.ctaButton = Ui.PushButton.create(this.homeScreen);
        this.ctaButton.text = '   Login   ';
        this.ctaButton.primary = true;
        this.ctaButton.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.ctaButton.setFixedHeight(32);
        this.ctaButton.setContentsMargins(Ui.Sizes.DoublePadding, Ui.Sizes.Padding, Ui.Sizes.DoublePadding, Ui.Sizes.Padding);
        this.connections.push(this.ctaButton.onClick.connect(() => {
            this.onCtaClicked();
        }));

        this.loading = Ui.ProgressIndicator.create(this.homeScreen);
        this.loading.start();
        this.loading.visible = false;

        layout.addStretch(1);
        layout.addWidgetWithStretch(this.logo, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.disclaimer, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.ctaButton, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.loading, 0, Ui.Alignment.AlignCenter);
        layout.addStretch(2);

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
        this.footer = Ui.Widget.create(parent);
        this.footer.setFixedHeight(65);

        const footerLayout = Ui.BoxLayout.create();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 12, 8, 8);

        // Import To Project button
        this.importToProjectButton = Ui.PushButton.create(this.footer);
        this.importToProjectButton.text = 'Import to Project';
        const importImagePath = import.meta.resolve('../Resources/import.svg');
        this.importToProjectButton.setIconWithMode(Editor.Icon.fromFile(importImagePath), Ui.IconMode.MonoChrome);
        this.importToProjectButton.primary = true;

        this.connections.push(this.importToProjectButton.onClick.connect(function() {
            app.log('Importing Garment to the project...', { 'enabled': true, 'progressBar': true });
            app.importer.import(app.generator.textureBytes, app.generator.maskBytes).then(() => {
                app.log('Garment has been imported succesfully.');
            }).catch((error) => {
                app.log('Failed to import Garment, please try again.');
            });
        }.bind(this)));

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.importToProjectButton, 0, Ui.Alignment.AlignTop);

        this.footer.layout = footerLayout;
        return this.footer;
    }

    create(parent) {
        this.widget = Ui.Widget.create(parent);
        this.widget.setFixedWidth(480);
        this.widget.setFixedHeight(DIALOG_HEIGHT);
        this.layout = Ui.BoxLayout.create();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.stackedWidget = Ui.StackedWidget.create(this.widget);
        this.stackedWidget.setContentsMargins(0, 0, 0, 0);

        this.stackedWidget.addWidget(this.createPreview(this.widget));
        this.stackedWidget.addWidget(this.createGenerationErrorWidget(this.widget));
        this.stackedWidget.addWidget(this.createHomeScreen(this.widget));

        this.layout.addStretch(0);
        this.layout.addWidget(this.stackedWidget);
        this.layout.addStretch(0);

        const separator = Ui.Separator.create(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator);

        this.layout.addWidget(this.createFooter(this.widget));

        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }
}
