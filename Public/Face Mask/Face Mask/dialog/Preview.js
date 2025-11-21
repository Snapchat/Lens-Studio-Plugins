import * as Ui from 'LensStudio:Ui';
import * as Shell from 'LensStudio:Shell';
import app from '../Application';
import { GeneratorState } from '../generator/Generator';
import { UIConfig } from '../UIConfig';
const PreviewState = {
    Login: 0,
    Loading: 1,
    Preview: 2,
    Failed: 3,
    Reload: 4,
    HomeScreen: 5,
    Terms: 6,
    ApiVersion: 7
};
var PageIndex;
(function (PageIndex) {
    PageIndex[PageIndex["preview"] = 0] = "preview";
    PageIndex[PageIndex["error"] = 1] = "error";
    PageIndex[PageIndex["home"] = 2] = "home";
})(PageIndex || (PageIndex = {}));
export class Preview {
    constructor() {
        this.connections = [];
        this.state = PreviewState.HomeScreen;
        this.stateToScreen = {
            [GeneratorState.Uninitialized]: this.showLoading.bind(this),
            [GeneratorState.Unauthorized]: this.showLogin.bind(this),
            [GeneratorState.UnsupportedApiVersion]: this.showApiVersion.bind(this),
            [GeneratorState.RequestedTermsAndConditions]: this.showTerms.bind(this),
            [GeneratorState.Idle]: this.showHomeScreen.bind(this),
            [GeneratorState.Loading]: this.showLoading.bind(this),
            [GeneratorState.Running]: this.showRunning.bind(this),
            [GeneratorState.Success]: this.showTexture.bind(this),
            [GeneratorState.ConnectionFailed]: this.showReload.bind(this),
            [GeneratorState.Failed]: this.showFailed.bind(this)
        };
        Object.entries(this.stateToScreen).forEach(([state, show]) => {
            var _a;
            (_a = app.generator) === null || _a === void 0 ? void 0 : _a.stateChanged.on(parseInt(state), show);
        });
    }
    init() {
        var _a, _b, _c, _d;
        const currentState = (_b = (_a = app.generator) === null || _a === void 0 ? void 0 : _a.state) !== null && _b !== void 0 ? _b : GeneratorState.Uninitialized;
        (_d = (_c = this.stateToScreen)[currentState]) === null || _d === void 0 ? void 0 : _d.call(_c);
    }
    onCtaClicked() {
        var _a;
        switch (this.state) {
            case PreviewState.Login:
                app.authorize();
                break;
            case PreviewState.Reload:
                (_a = app.generator) === null || _a === void 0 ? void 0 : _a.init();
                break;
            case PreviewState.ApiVersion:
                Shell.openUrl('https://ar.snap.com/download', {});
                break;
            case PreviewState.Terms:
                Shell.openUrl('https://www.snap.com/terms/mlkit', {});
                this.showReload();
                break;
            default:
                console.warn("CTA has been clicked from the wrong state, please report the bug.");
        }
    }
    showHomeScreen() {
        this.state = PreviewState.HomeScreen;
        this.logo.visible = true;
        this.disclaimer.text = '<center>Try creating a new effect!</center>';
        this.welcomeText.visible = true;
        this.disclaimer.visible = true;
        this.ctaButton.visible = false;
        this.loading.visible = false;
        this.stackedWidget.currentIndex = PageIndex.home;
    }
    showTexture() {
        var _a;
        this.state = PreviewState.Preview;
        this.stackedWidget.currentIndex = PageIndex.preview;
        if ((_a = app.generator) === null || _a === void 0 ? void 0 : _a.textureBytes) {
            this.previewImage.pixmap = new Ui.Pixmap(app.storage.createFile("Face Mask Preview.png", app.generator.textureBytes));
        }
    }
    showRunning() {
        this.state = PreviewState.Loading;
        this.logo.visible = false;
        this.welcomeText.visible = false;
        this.disclaimer.text = '<center>Generating preview...<br> This may take up to 7 seconds.</center>';
        this.disclaimer.visible = true;
        this.ctaButton.visible = false;
        this.loading.visible = true;
        this.stackedWidget.currentIndex = PageIndex.home;
    }
    showFailed() {
        this.state = PreviewState.Failed;
        this.stackedWidget.currentIndex = PageIndex.error;
    }
    showLogin() {
        this.state = PreviewState.Login;
        this.logo.visible = true;
        this.welcomeText.visible = true;
        this.disclaimer.text = '<center>Log-in to MyLenses account <br>to get access for Gen AI tools</center>';
        this.disclaimer.visible = true;
        this.ctaButton.text = '   Login   ';
        this.ctaButton.visible = true;
        this.loading.visible = false;
        this.stackedWidget.currentIndex = PageIndex.home;
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
        this.stackedWidget.currentIndex = PageIndex.home;
    }
    showLoading() {
        this.state = PreviewState.Loading;
        this.logo.visible = false;
        this.ctaButton.visible = false;
        this.welcomeText.visible = false;
        this.disclaimer.visible = false;
        this.loading.visible = true;
        this.stackedWidget.currentIndex = PageIndex.home;
    }
    showReload() {
        this.state = PreviewState.Reload;
        this.logo.visible = false;
        this.ctaButton.visible = true;
        this.ctaButton.text = '   Reload   ';
        this.disclaimer.text = '<center>Oops, something went wrong,<br> please reload the page to try again.</center>';
        this.welcomeText.visible = false;
        this.disclaimer.visible = true;
        this.loading.visible = false;
        this.stackedWidget.currentIndex = PageIndex.home;
    }
    showTerms() {
        this.state = PreviewState.Terms;
        this.logo.visible = true;
        this.ctaButton.visible = true;
        this.ctaButton.text = '   Read and Accept   ';
        this.disclaimer.text = '<center>Please, accept terms and <br>conditions to continue.</center>';
        this.disclaimer.visible = true;
        this.loading.visible = false;
        this.stackedWidget.currentIndex = PageIndex.home;
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
        const iconImagePath = new Editor.Path(import.meta.resolve('../common-ui/Resources/error_icon.svg'));
        const iconPixmap = new Ui.Pixmap(iconImagePath);
        const icon = new Ui.ImageView(header);
        icon.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        icon.setFixedHeight(Ui.Sizes.IconSide);
        icon.setFixedWidth(Ui.Sizes.IconSide);
        icon.scaledContents = true;
        icon.pixmap = iconPixmap;
        const headerLabel = new Ui.Label(header);
        headerLabel.text = 'Generation Failed';
        headerLabel.fontRole = Ui.FontRole.TitleBold;
        headerLayout.addWidget(icon);
        headerLayout.addWidget(headerLabel);
        header.layout = headerLayout;
        frameLayout.addStretch(0);
        frameLayout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignCenter);
        const disclaimerLabel = new Ui.Label(frame);
        disclaimerLabel.text = '<center>There was a problem generating the face mask.</center><center>Please try to generate another one.</center>';
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
        this.logo.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../common-ui/Resources/gen_ai_wizzard.svg')));
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
    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedHeight(UIConfig.PREVIEW.HEIGHT);
        this.widget.setFixedWidth(UIConfig.PREVIEW.WIDTH);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        this.stackedWidget = new Ui.StackedWidget(this.widget);
        this.stackedWidget.setContentsMargins(0, 0, 0, 0);
        this.stackedWidget.addWidget(this.createPreview(this.widget));
        this.stackedWidget.addWidget(this.createGenerationErrorWidget(this.widget));
        this.stackedWidget.addWidget(this.createHomeScreen(this.widget));
        layout.addStretch(0);
        layout.addWidget(this.stackedWidget);
        layout.addStretch(0);
        layout.spacing = 0;
        this.widget.backgroundRole = Ui.ColorRole.Midlight;
        this.widget.layout = layout;
        return this.widget;
    }
}
