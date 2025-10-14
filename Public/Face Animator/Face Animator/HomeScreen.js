// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { GeneratePage } from "./GeneratePage";
import { AnimatorPage } from "./AnimatorPage";
import app from "./app.js";
export class HomeScreen {
    constructor() {
        this.connections = [];
        this.generatePage = new GeneratePage(this.onTileClicked.bind(this), this.onItemDataChanged.bind(this), this.checkGenerationState.bind(this), this.importToProject.bind(this));
        this.generatePage.setVideoProcessingStartListener(this.onVideoProcessingStart.bind(this));
        this.generatePage.setVideoProcessingEndListener(this.onVideoProcessingEnd.bind(this));
        this.animatorPage = new AnimatorPage();
    }
    create(parent) {
        var _a;
        this.authComponent = (_a = app.pluginSystem) === null || _a === void 0 ? void 0 : _a.findInterface(Editor.IAuthorization);
        const stackedWidget = new Ui.StackedWidget(parent);
        stackedWidget.setContentsMargins(0, 0, 0, 0);
        stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        stackedWidget.autoFillBackground = true;
        stackedWidget.backgroundRole = Ui.ColorRole.Base;
        stackedWidget.setFixedWidth(800);
        stackedWidget.setFixedHeight(620);
        const generatePageWidget = this.generatePage.create(stackedWidget, this.authComponent);
        stackedWidget.addWidget(generatePageWidget);
        const animatorPage = this.animatorPage.create(stackedWidget, this.openGeneratePage.bind(this), this.onItemRemoved.bind(this), this.updateAnimatorData.bind(this));
        stackedWidget.addWidget(animatorPage);
        const loginWidget = this.createLoginWidget(stackedWidget);
        stackedWidget.addWidget(loginWidget);
        this.stackedWidget = stackedWidget;
        if (this.authComponent.isAuthorized) {
            this.stackedWidget.currentIndex = 0;
        }
        else {
            this.stackedWidget.currentIndex = 2;
        }
        this.authComponent.onAuthorizationChange.connect((authStatus) => {
            if (!this.stackedWidget) {
                return;
            }
            if (authStatus) {
                this.stackedWidget.currentIndex = 0;
                this.generatePage.updateGrid();
            }
            else {
                this.stackedWidget.currentIndex = 2;
            }
        });
        this.loadingScreen = new Ui.ImageView(parent);
        this.loadingScreen.setFixedWidth(800);
        this.loadingScreen.setFixedHeight(620);
        this.loadingScreen.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/blur.svg'));
        this.loadingScreen.scaledContents = true;
        this.loadingScreen.visible = false;
        const loadingScreenLayout = new Ui.BoxLayout();
        loadingScreenLayout.setContentsMargins(0, 0, 0, 0);
        loadingScreenLayout.setDirection(Ui.Direction.TopToBottom);
        this.loadingScreen.layout = loadingScreenLayout;
        loadingScreenLayout.addStretch(0);
        this.progressLabel = new Ui.ClickableLabel(this.loadingScreen);
        this.progressLabel.text = "Processing <span style='color:#ffffff'>0%</span>";
        loadingScreenLayout.addWidgetWithStretch(this.progressLabel, 0, Ui.Alignment.AlignCenter);
        this.progressBar = new Ui.ProgressBar(this.loadingScreen);
        this.progressBar.setFixedHeight(Ui.Sizes.ProgressBarHeight);
        this.progressBar.setFixedWidth(610);
        this.progressBar.minimum = 0;
        this.progressBar.maximum = 100;
        this.progressBar.value = 0;
        loadingScreenLayout.addWidgetWithStretch(this.progressBar, 0, Ui.Alignment.AlignCenter);
        loadingScreenLayout.addStretch(0);
        return stackedWidget;
    }
    nextProgress(p) {
        const cap = 99.9;
        const t = p / cap;
        const k = 0.006 * (1 - t) + 0.001;
        const step = (cap - p) * (1 - Math.exp(-k));
        return Math.min(cap, p + step);
    }
    openGeneratePage() {
        if (this.stackedWidget) {
            this.stackedWidget.currentIndex = 0;
        }
    }
    onTileClicked(animatorData) {
        if (this.stackedWidget) {
            this.animatorPage.setPreview(animatorData.previewPath);
            this.animatorPage.setAnimatorData(animatorData);
            this.stackedWidget.currentIndex = 1;
        }
    }
    importToProject(animatorData) {
        this.animatorPage.importToProject(animatorData);
    }
    onItemDataChanged(animatorData) {
        if (this.stackedWidget && this.stackedWidget.currentIndex === 1) {
            this.animatorPage.updateAnimatorData(animatorData);
        }
    }
    createLoginWidget(parent) {
        const widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        const imageView = new Ui.ImageView(widget);
        imageView.setFixedWidth(180);
        imageView.setFixedHeight(180);
        imageView.scaledContents = true;
        imageView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/gen_ai.svg'));
        imageView.move(310, 144);
        const label = new Ui.Label(widget);
        label.text = '<center>' + 'Log-in to MyLenses account <br>to get access for Gen AI tools' + '</center>';
        label.setFixedWidth(280);
        label.move(260, 304);
        const createNewButton = new Ui.PushButton(widget);
        createNewButton.text = 'Login';
        createNewButton.primary = true;
        createNewButton.setFixedWidth(78);
        createNewButton.setFixedHeight(24);
        createNewButton.move(361, 350);
        this.connections.push(createNewButton.onClick.connect(() => {
            var _a;
            (_a = this.authComponent) === null || _a === void 0 ? void 0 : _a.authorize();
        }));
        widget.layout = layout;
        return widget;
    }
    onItemRemoved(id) {
        this.generatePage.removeById(id);
    }
    updateAnimatorData(animatorData) {
        this.generatePage.updateItemData(animatorData);
    }
    checkGenerationState(id, intervalVal) {
        this.animatorPage.checkGenerationState(id, intervalVal);
    }
    updateGrid() {
        this.generatePage.updateGrid();
    }
    onVideoProcessingStart() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        let prevVal = 0;
        this.progressLabel.text = "Processing <span style='color:#ffffff'>" + "0" + "%</span>";
        this.interval = setInterval(() => {
            const newVal = this.nextProgress(prevVal);
            prevVal = newVal;
            this.progressLabel.text = "Processing <span style='color:#ffffff'>" + Math.floor(newVal) + "%</span>";
            this.progressBar.value = newVal;
        }, 50);
        this.loadingScreen.visible = true;
    }
    onVideoProcessingEnd() {
        clearInterval(this.interval);
        this.loadingScreen.visible = false;
    }
}
