import {AssetPreview} from "./AssetPreview.js";
import * as Ui from 'LensStudio:Ui';
import {TransitionMenu} from "./TransitionMenu.js";
import app from "../application/app.js";
import {AssetExporter} from "./AssetExporter.js";
import * as Shell from 'LensStudio:Shell';
import {getBlendedAnimation} from "../application/api.js";
import { logEventAssetImport } from "../application/analytics.js";

let _this = null;

const PreviewState = {
    Login: 0,
    Preview: 1,
    Terms: 2,
    ApiVersion: 3,
    Reload: 4
}

export class Preview {
    constructor() {

        this.stateToScreen = {
            [app.animationDialog.States.Unauthorized]: this.showLogin,
            [app.animationDialog.States.UnsupportedApiVersion]: this.showApiVersion,
            [app.animationDialog.States.RequestedTermsAndConditions]: this.showTerms,
            [app.animationDialog.States.ConnectionFailed]: this.showReload,
            [app.animationDialog.States.Preview]: this.showPreview
        }

        Object.entries(this.stateToScreen).forEach(([state, show]) => {
            app.animationDialog.stateChanged.on(state, show.bind(this));
        });

        this.assetPreview = new AssetPreview();
        this.transitionMenu = new TransitionMenu(this.onSelectionChanged);
        this.assetExporter = new AssetExporter();
        this.blendedAnimationCount = 0;
        _this = this;
        this.isSelected = false;
        this.removeButton = null;
        this.connections = [];

        this.removeActiveImage = new Ui.Pixmap(import.meta.resolve('./Resources/remove_active.svg'));
        this.removeInactiveImage = new Ui.Pixmap(import.meta.resolve('./Resources/remove_inactive.svg'));
    }

    createHeader(parent) {
        this.header = new Ui.Widget(parent);
        this.header.setFixedHeight(32);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(4, 4, 6, 4);

        const imageView = new Ui.ImageView(this.header);
        imageView.backgroundRole = Ui.ColorRole.Light;
        imageView.autoFillBackground = true;
        imageView.radius = 10;

        const imageLayout = new Ui.BoxLayout();
        imageLayout.setContentsMargins(0, 0, 0, 0)

        const label = new Ui.Label(imageView);
        label.text = "Bitmoji";

        imageLayout.addWidgetWithStretch(label, 0, Ui.Alignment.AlignCenter)

        imageView.layout = imageLayout;

        headerLayout.addWidget(imageView);

        this.header.layout = headerLayout;
        return this.header;
    }

    createFooter(parent) {
        this.footer = new Ui.Widget(parent);
        this.footer.setFixedHeight(57);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(20, 8, 20, 0);

        this.removeButton = new Ui.PushButton(this.footer);
        this.removeButton.setFixedWidth(32);
        this.removeButton.setFixedHeight(20);
        this.removeButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/bin.svg')), Ui.IconMode.MonoChrome);
        this.removeButton.enabled = false;

        this.connections.push(this.removeButton.onClick.connect(() => {
            if (!app.getPluginStatus() || (app.animationDialog.lbeIsBusy && !this.transitionMenu.isBlended)) {
                return;
            }
            this.transitionMenu.removeItem();
        }))

        this.importToProjectButton = new Ui.PushButton(this.footer);
        this.importToProjectButton.text = 'Import to Project';
        this.importToProjectButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/import.svg')), Ui.IconMode.MonoChrome);
        this.importToProjectButton.primary = true;
        this.importToProjectButton.enabled = false;
        this.importToProjectButton.visible = true;
        this.importToProjectButton.setFixedWidth(126);
        this.importToProjectButton.setFixedHeight(20);

        this.connections.push(this.importToProjectButton.onClick.connect(() => {
            if (!app.getPluginStatus()) {
                app.log('Something went wrong, please try again.');
                return;
            }

            if (this.transitionMenu.isBlended) {
                this.assetExporter.importPackage();
                const blended = "BLENDED_" + this.blendedAnimationCount;
                logEventAssetImport("SUCCESS", blended);
                this.transitionMenu.removeItem();
            }
            else if (this.transitionMenu.getEnabledAnimationCount() === 1) {
                app.log('Importing to Project', { 'enabled': true, 'progressBar': true });
                app.animationDialog.setLbeStatus(true);
                app.animationDialog.setPreviewAssetId(null);
                app.animationDialog.sendMessage(JSON.stringify({status : "start_loading"}));
                let fbxAssetsPath = [];
                this.transitionMenu.getVisibleLibraryIds().forEach(function (id) {
                    if ((typeof id) === "string") {
                        fbxAssetsPath.push(app.animationDialog.animationImport.getAssetPath(id));
                    }
                    else {
                        fbxAssetsPath.push(app.animationDialog.getAssetPath(id));
                    }
                })

                getBlendedAnimation(fbxAssetsPath, (response) => {
                    if (response.statusCode !== 201){
                        app.log('Something went wrong, please try again.');
                        logEventAssetImport("FAILED", "BLENDED_NONE");
                        app.animationDialog.changeState(app.animationDialog.States.ConnectionFailed);
                        app.animationDialog.sendMessage(JSON.stringify({status: "hide"}), false, false);
                        app.animationDialog.setLbeStatus(false);
                        return;
                    }
                    const assetPath = this.assetExporter.saveFbxFile(response);
                    this.assetExporter.importToProject(assetPath, () => {
                        this.transitionMenu.removeItem(true);
                        app.log('Importing to Project', { 'enabled': false });

                        logEventAssetImport("SUCCESS", "BLENDED_NONE");
                    }, true);
                });
            }

            this.importToProjectButton.enabled = false;
        }))

        this.blendAnimationButton = new Ui.PushButton(this.footer);
        this.blendAnimationButton.text = 'Blend Animation';
        this.blendAnimationButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/blendIcon.svg')), Ui.IconMode.MonoChrome);
        this.blendAnimationButton.primary = true;
        this.blendAnimationButton.enabled = false;
        this.blendAnimationButton.visible = false;
        this.blendAnimationButton.setFixedWidth(126);
        this.blendAnimationButton.setFixedHeight(20);

        this.connections.push(this.blendAnimationButton.onClick.connect(() => {
            if (!app.getPluginStatus()) {
                app.log('Something went wrong, please try again.');
                return;
            }

            if (app.animationDialog.lbeIsBusy || !this.isSelected) {
                return;
            }

            app.animationDialog.setLbeStatus(true);
            app.log('Blending Animation', { 'enabled': true, 'progressBar': true });
            app.animationDialog.setPreviewAssetId(null);
            app.animationDialog.sendMessage(JSON.stringify({status : "start_loading"}));


            let fbxAssetsPath = [];
            this.transitionMenu.getVisibleLibraryIds().forEach(function (id) {
                if ((typeof id) === "string") {
                    fbxAssetsPath.push(app.animationDialog.animationImport.getAssetPath(id));
                }
                else {
                    fbxAssetsPath.push(app.animationDialog.getAssetPath(id));
                }
            })

            this.blendedAnimationCount = fbxAssetsPath.length;
            getBlendedAnimation(fbxAssetsPath, (response) => {
                if (response.statusCode !== 201 || !app.animationDialog.isEnabled){
                    app.log('Something went wrong, please try again.');
                    app.animationDialog.changeState(app.animationDialog.States.ConnectionFailed);
                    app.animationDialog.sendMessage(JSON.stringify({status: "hide"}), false, false);
                    app.animationDialog.setLbeStatus(false);
                    return;
                }
                const assetPath = this.assetExporter.saveFbxFile(response);

                app.animationDialog.getAnimationImport().showBlendedAnimation(assetPath, () => {
                    app.log('Animation is ready', { 'enabled': true, 'progressBar': false });
                    this.transitionMenu.addCombinedItem();
                    this.transitionMenu.setBlendedData(assetPath);
                    this.blendAnimationButton.visible = false;
                    this.importToProjectButton.enabled = true;
                    this.importToProjectButton.visible = true;
                    this.removeButton.enabled = true;
                })
            });
        }))

        app.animationDialog.addOnLbeStartedCallback(() => {
            this.removeButton.enabled = false;
            this.importToProjectButton.enabled = false;
            this.blendAnimationButton.enabled = false;
        })

        app.animationDialog.addOnLbeFinishedCallback(() => {
            if (this.isSelected) {

                if (this.transitionMenu.getVisibleItemsCount() > 1) {
                    this.removeButton.enabled = true;
                }
                this.importToProjectButton.enabled = true;
                this.blendAnimationButton.enabled = true;
            }
        })

        footerLayout.addWidgetWithStretch(this.removeButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.importToProjectButton, 0, Ui.Alignment.AlignTop)
        footerLayout.addWidgetWithStretch(this.blendAnimationButton, 0, Ui.Alignment.AlignTop)

        this.footer.backgroundRole = Ui.ColorRole.Base;
        this.footer.autoFillBackground = true;
        this.footer.layout = footerLayout;

        return this.footer;
    }

    updateButtons() {
        if (this.transitionMenu.isBlended || this.transitionMenu.getEnabledAnimationCount() <= 1) {
            this.blendAnimationButton.visible = false;
            this.importToProjectButton.visible = true;
        }
        else {
            this.importToProjectButton.visible = false;
            this.blendAnimationButton.visible = true;
        }
    }

    createPreview(parent) {
        const preview = new Ui.Widget(parent);
        preview.setContentsMargins(0, 0, 0, 0);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        const assetPreview = this.assetPreview.create(preview);
        const transitionMenu = this.transitionMenu.create(preview);
        layout.addWidget(assetPreview);
        layout.addWidget(transitionMenu);

        preview.layout = layout;

        return preview;
    }

    onCtaClicked() {
        switch(this.state) {
            case PreviewState.Login:
                app.authorize();
                break;
            case PreviewState.Reload:
                app.animationDialog.init();
                break;
            case PreviewState.ApiVersion:
                Shell.openUrl('https://ar.snap.com/download', {});
                break;
            case PreviewState.Terms:
                Shell.openUrl('https://www.snap.com/terms/lens-studio-license-agreement', {});
                this.showReload();
                break;
            default:
                console.warn("CTA has been clicked from the wrong state, please report the bug.")

        }
    }

    showLogin() {
        this.state = PreviewState.Login;

        this.disclaimer.text = '<center>Log-in to MyLenses account <br>to get access for Gen AI tools</center>';
        this.disclaimer.visible = true;
        this.ctaButton.text = '   Login   ';
        this.ctaButton.visible = true;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 1;
    }

    showTerms() {
        this.state = PreviewState.Terms;

        this.ctaButton.visible = true;
        this.ctaButton.text = '   Read and Accept   ';
        this.disclaimer.text = '<center>Please, accept terms and <br>conditions to continue.</center>';
        this.disclaimer.visible = true;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 1;
    }

    showApiVersion() {
        this.state = PreviewState.ApiVersion;

        this.disclaimer.text = '<center>Please, update the plugin to <br>newer version to continue.</center>';
        this.disclaimer.visible = true;
        this.ctaButton.text = '   Update   ';
        this.ctaButton.visible = true;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 1;
    }

    showReload() {
        this.state = PreviewState.Reload;

        this.ctaButton.visible = true;
        this.ctaButton.text = '   Reload   ';
        this.disclaimer.text = '<center>Oops, something went wrong,<br> please reaload the page to try again.</center>';
        this.disclaimer.visible = true;
        this.disclaimer.visible = true;
        this.loading.visible = false;

        this.stackedWidget.currentIndex = 1;
    }

    showPreview() {
        this.state = PreviewState.Preview;

        this.stackedWidget.currentIndex = 0;
    }

    createHomeScreen(parent) {
        this.homeScreen = new Ui.Widget(parent);
        this.homeScreen.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.homeScreen.setFixedWidth(480);
        this.homeScreen.setFixedHeight(620);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        this.logo = new Ui.ImageView(this.homeScreen);
        this.logo.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/gen_ai_wizzard.svg'));
        this.logo.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.logo.setFixedWidth(180);
        this.logo.setFixedHeight(180);
        this.logo.scaledContents = true;

        this.disclaimer = new Ui.Label(this.homeScreen);
        this.disclaimer.wordWrap = true;
        this.disclaimer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
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
        layout.addWidgetWithStretch(this.disclaimer, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.ctaButton, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.loading, 0, Ui.Alignment.AlignCenter);
        layout.addStretch(2);

        layout.spacing = Ui.Sizes.Padding;

        this.homeScreen.layout = layout;

        return this.homeScreen;
    }

    create (parent) {
        this.widget = new Ui.Widget(parent);

        this.widget.setFixedWidth(480);
        this.widget.setFixedHeight(620);

        this.widget.setContentsMargins(0, 0, 0, 0);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        const header = this.createHeader(this.widget);
        const footer = this.createFooter(this.widget);

        this.layout.addWidget(header);

        this.stackedWidget = new Ui.StackedWidget(this.widget);
        this.stackedWidget.setContentsMargins(0, 0, 0, 0);

        this.stackedWidget.addWidget(this.createPreview(this.widget));
        this.stackedWidget.addWidget(this.createHomeScreen(this.widget));

        this.layout.addWidget(this.stackedWidget);

        this.stackedWidget.currentIndex = 0;

        const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, this.widget);
        separator.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        this.layout.addWidget(separator);

        this.layout.addWidget(footer);

        this.widget.backgroundRole = Ui.ColorRole.Base;
        this.widget.autoFillBackground = true;
        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }

    onSelectionChanged(isSelected) {
        _this.isSelected = isSelected;

        if (isSelected) {
            if (_this.transitionMenu.getVisibleItemsCount() > 1 && !app.animationDialog.lbeIsBusy) {
                _this.removeButton.enabled = true;
            }
            if (_this.transitionMenu.getEnabledAnimationCount() > 0) {
                _this.blendAnimationButton.enabled = true;
            }
            else {
                _this.importToProjectButton.enabled = false;
            }
        }
        else{
            _this.removeButton.enabled = false;
            _this.importToProjectButton.enabled = false;
            _this.blendAnimationButton.enabled = false;
        }

        if (_this.transitionMenu.getVisibleItemsCount() > 1) {
            app.animationDialog.changeTitleText("Add New Animation Frame");
        }
        else{
            app.animationDialog.changeTitleText("Create Animation");
        }

        _this.updateButtons();
    }

    addIconToTransitionMenu(id, content) {
        this.transitionMenu.addIcon(id, content)
    }

    setSelectedTransitionItem(id) {
        this.transitionMenu.setSelectedTransitionItem(id);
    }

    setSelectedStatus(status, id) {
        this.transitionMenu.setSelectedStatus(status, id);
    }

    getTransitionTexture() {
        this.transitionMenu.getTransitionTexture();
    }

    sendMessage(message, callback, waitForStart) {
        this.assetPreview.sendMessage(message, callback, waitForStart);
    }

    deinit() {
        this.assetPreview.deinit()
    }

    setPreviewAssetId(assetId) {
        this.assetPreview.setPreviewAssetId(assetId);
    }

    getAssetExporter() {
        return this.assetExporter;
    }
}
