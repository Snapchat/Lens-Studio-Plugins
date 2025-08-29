import * as Ui from "LensStudio:Ui";
import { Alignment } from "LensStudio:Ui";
import { MenuTemplate } from "./MenuTemplate.js";
//@ts-ignore
import * as MultimediaWidgets from 'LensStudio:MultimediaWidgets';
//@ts-ignore
import { MediaState } from 'LensStudio:MultimediaWidgets';
import { dependencyContainer, DependencyKeys } from "../DependencyContainer.js";
import { getAnimationById, uploadAnimation } from "../api.js";
import { SelectCharacterPage } from "./SelectCharacterPage.js";
export class CaptureFromVideoMode {
    constructor(animationLibrary) {
        this.currentVideoFilePath = null;
        this.connections = [];
        this.menuTemplate = new MenuTemplate();
        this.animationLibrary = animationLibrary;
        this.selectCharacterPage = new SelectCharacterPage(this.animationLibrary);
        this.isActive = true;
        this.defaultBackground = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/videoUploadBackground.svg')));
        this.hoveredBackground = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/videoUploadBackground_h.svg')));
    }
    create(parent, onReturnCallback, goToGalleryPage) {
        this.stackedWidget = new Ui.StackedWidget(parent);
        this.stackedWidget.setContentsMargins(0, 0, 0, 0);
        this.stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const widget = this.menuTemplate.createWidget(this.stackedWidget);
        widget.setMinimumHeight(552);
        const layout = this.menuTemplate.createLayout();
        //@ts-ignore
        const selectCharacterWidget = this.selectCharacterPage.create(this.stackedWidget, () => { var _a; (_a = this.stackedWidget) === null || _a === void 0 ? void 0 : _a.currentIndex = 0; }, goToGalleryPage);
        this.stackedWidget.addWidget(widget);
        this.stackedWidget.addWidget(selectCharacterWidget);
        this.stackedWidget.currentIndex = 0;
        const header = this.menuTemplate.createHeader(widget, 'Video Source', () => {
            onReturnCallback();
        });
        const contentLayout = this.menuTemplate.createContentLayout();
        contentLayout.spacing = Ui.Sizes.DoublePadding;
        contentLayout.addWidget(this.menuTemplate.createLabel(widget, "Upload Video"));
        contentLayout.addStretch(0);
        const label = new Ui.Label(parent);
        label.wordWrap = true;
        label.text = "• Format: <b>.mp4 only</b><br>" +
            "• Max File Size: <b>20 MB</b><br><br>" +
            "Only the first 10 seconds or 512 frames will be processed.";
        contentLayout.addWidget(label);
        contentLayout.addStretch(0);
        // Video Upload
        const videoUpload = new Ui.ImageView(parent);
        videoUpload.responseHover = true;
        videoUpload.pixmap = this.defaultBackground;
        videoUpload.setFixedWidth(288);
        videoUpload.setFixedHeight(288);
        const iconView = new Ui.ImageView(videoUpload);
        iconView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        iconView.move(125, 120);
        iconView.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/uploadIcon.svg')));
        const iconSize = 36;
        iconView.setFixedHeight(iconSize);
        iconView.setFixedWidth(iconSize);
        const buttonLabel = new Ui.ClickableLabel(videoUpload);
        buttonLabel.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        buttonLabel.setFixedWidth(72);
        buttonLabel.wordWrap = true;
        buttonLabel.text = '<center>' + 'Upload Video <br> <br> .mp4' + '</center>';
        buttonLabel.move(109, 159);
        //@ts-ignore
        const videoWidget = MultimediaWidgets.VideoWidget.create(videoUpload);
        videoWidget.setFixedWidth(288);
        videoWidget.setFixedHeight(288);
        videoWidget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        videoWidget.visible = false;
        //@ts-ignore
        const mediaPlayer = MultimediaWidgets.MediaPlayer.create();
        contentLayout.addWidgetWithStretch(videoUpload, 0, (Ui.Alignment.AlignCenter));
        contentLayout.addStretch(0);
        // Reload
        const reloadWidget = new Ui.ImageView(parent);
        reloadWidget.responseHover = true;
        reloadWidget.pixmap = this.defaultBackground;
        reloadWidget.setFixedWidth(288);
        reloadWidget.setFixedHeight(288);
        const warningIconView = new Ui.ImageView(reloadWidget);
        warningIconView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        warningIconView.move(125, 88);
        warningIconView.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/warning_triangle.svg')));
        warningIconView.setFixedHeight(iconSize);
        warningIconView.setFixedWidth(iconSize);
        const warningLabel = new Ui.Label(reloadWidget);
        warningLabel.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        warningLabel.setFixedWidth(174);
        warningLabel.wordWrap = true;
        warningLabel.text = '<center>' + 'No characters found. <br> Please try again!' + '</center>';
        warningLabel.foregroundRole = Ui.ColorRole.PlaceholderText;
        warningLabel.move(57, 133);
        const reloadButton = new Ui.PushButton(reloadWidget);
        reloadButton.text = "Reload";
        reloadButton.setIconWithMode(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/refresh.svg'))), Ui.IconMode.MonoChrome);
        reloadButton.setFixedWidth(72);
        reloadButton.setFixedHeight(24);
        reloadButton.primary = true;
        reloadButton.enabled = true;
        reloadButton.move(108, 178);
        reloadWidget.visible = false;
        contentLayout.addWidgetWithStretch(reloadWidget, 0, (Ui.Alignment.AlignCenter));
        contentLayout.addStretch(0);
        //Process Button
        const settingsIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/settings.svg')));
        const transparentIcon = Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/transparent.png')));
        const processVideoButton = new Ui.PushButton(widget);
        processVideoButton.text = 'Process Video';
        processVideoButton.setIconWithMode(settingsIcon, Ui.IconMode.MonoChrome);
        processVideoButton.setFixedWidth(110);
        processVideoButton.setFixedHeight(20);
        processVideoButton.primary = true;
        processVideoButton.enabled = false;
        const loading = new Ui.ProgressIndicator(processVideoButton);
        loading.start();
        loading.move(8, 2);
        loading.visible = false;
        contentLayout.addWidgetWithStretch(processVideoButton, 0, Alignment.AlignCenter);
        contentLayout.addStretch(1);
        const guidelinesLink = 'https://developers.snap.com/lens-studio/features/bitmoji-suite/animate#capture-from-video';
        const guideUrlString = Ui.getUrlString('guidelines', guidelinesLink);
        const guideLinesText = 'Check our ' + guideUrlString + ' for examples, prompting best practices.';
        const guideLines = this.menuTemplate.createCalloutWidget(widget, guideLinesText);
        contentLayout.addWidget(guideLines);
        contentLayout.addStretch(0);
        layout.addWidget(header);
        layout.addLayout(contentLayout);
        this.connections.push(videoUpload.onHover.connect((hovered) => {
            if (hovered) {
                videoUpload.pixmap = this.hoveredBackground;
            }
            else {
                videoUpload.pixmap = this.defaultBackground;
            }
        }));
        let isProcessing = false;
        const buttonItems = [videoUpload, iconView, buttonLabel];
        buttonItems.forEach((item) => {
            this.connections.push(item.onClick.connect(() => {
                if (isProcessing) {
                    return;
                }
                const pluginSystem = dependencyContainer.get(DependencyKeys.PluginSystem);
                //@ts-ignore
                const filePath = pluginSystem.findInterface(Ui.IGui).dialogs.selectFileToOpen({ 'caption': 'Select file to open', 'filter': '*.mp4' }, '');
                if (!filePath.isEmpty) {
                    this.currentVideoFilePath = filePath;
                    videoWidget.visible = true;
                    mediaPlayer.setMedia(filePath);
                    mediaPlayer.setVideoOutput(videoWidget);
                    mediaPlayer.play();
                    processVideoButton.enabled = true;
                    processVideoButton.primary = true;
                    processVideoButton.text = 'Process Video';
                }
            }));
        });
        this.connections.push(mediaPlayer.onStateChanged.connect((newState) => {
            //@ts-ignore
            if (newState === MediaState.StoppedState) {
                mediaPlayer.play();
            }
        }));
        const toDefaultState = () => {
            videoUpload.visible = true;
            videoWidget.visible = true;
            processVideoButton.text = 'Process Video';
            processVideoButton.primary = true;
            processVideoButton.enabled = true;
            processVideoButton.visible = true;
            mediaPlayer.play();
            loading.visible = false;
            isProcessing = false;
            processVideoButton.setIconWithMode(settingsIcon, Ui.IconMode.MonoChrome);
        };
        const showReloadWidget = () => {
            videoWidget.visible = false;
            videoUpload.visible = false;
            reloadWidget.visible = true;
            processVideoButton.visible = false;
        };
        reloadButton.onClick.connect(() => {
            reloadWidget.visible = false;
            toDefaultState();
        });
        processVideoButton.onClick.connect(() => {
            if (this.currentVideoFilePath) {
                processVideoButton.enabled = false;
                processVideoButton.primary = false;
                processVideoButton.text = 'Processing...';
                mediaPlayer.pause();
                loading.visible = true;
                isProcessing = true;
                processVideoButton.setIconWithMode(transparentIcon, Ui.IconMode.MonoChrome);
                const fileName = this.currentVideoFilePath.toString().split('/').pop();
                uploadAnimation(this.currentVideoFilePath, fileName, (response) => {
                    if (!this.isActive) {
                        return;
                    }
                    if (response.statusCode === 200 || response.statusCode === 201) {
                        const animationId = JSON.parse(response.body).id;
                        const maxRequestsCnt = 8;
                        let requestsSent = 0;
                        let isRequestInProgress = false;
                        const interval = setInterval(() => {
                            if (isRequestInProgress) {
                                return;
                            }
                            requestsSent++;
                            isRequestInProgress = true;
                            getAnimationById(animationId, (response) => {
                                if (!this.isActive) {
                                    clearInterval(interval);
                                    isRequestInProgress = false;
                                    return;
                                }
                                if (response.statusCode === 200 || response.statusCode === 201) {
                                    if (JSON.parse(response.body).tracks.length > 0) {
                                        clearInterval(interval);
                                        if (this.stackedWidget) {
                                            this.selectCharacterPage.addTracks(JSON.parse(response.body).tracks);
                                            this.selectCharacterPage.setAnimationId(animationId);
                                            this.stackedWidget.currentIndex = 1;
                                            this.currentVideoFilePath = null;
                                            processVideoButton.enabled = false;
                                            processVideoButton.primary = true;
                                            processVideoButton.text = 'Process Video';
                                            videoWidget.visible = false;
                                            loading.visible = false;
                                            isProcessing = false;
                                            processVideoButton.setIconWithMode(settingsIcon, Ui.IconMode.MonoChrome);
                                        }
                                    }
                                    else {
                                        if (requestsSent >= maxRequestsCnt) {
                                            clearInterval(interval);
                                            showReloadWidget();
                                            isRequestInProgress = false;
                                            return;
                                        }
                                    }
                                }
                                else {
                                    if (requestsSent >= maxRequestsCnt) {
                                        clearInterval(interval);
                                        showReloadWidget();
                                        isRequestInProgress = false;
                                        return;
                                    }
                                }
                                isRequestInProgress = false;
                            });
                        }, 4000);
                    }
                    else {
                        showReloadWidget();
                    }
                });
            }
        });
        widget.layout = layout;
        return this.stackedWidget;
    }
    deinit() {
        this.isActive = false;
        this.selectCharacterPage.deinit();
    }
}
