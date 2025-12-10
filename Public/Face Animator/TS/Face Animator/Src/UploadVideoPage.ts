// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import {Alignment, ColorRole} from "LensStudio:Ui";
import app from "./app.js";
import {uploadVideo} from "./api";
import {logEventCreate} from "./analytics.js";

export class UploadVideoPage {

    private mainWidget: Ui.Widget;
    private defaultBackground: Ui.Pixmap;
    private hoveredBackground: Ui.Pixmap;
    private connections: Array<any> = [];
    private currentVideoFilePath: Editor.Path | null = null;
    private popup: Ui.CalloutFrame | undefined;
    private popupLabel: Ui.Label | undefined;
    private onNewAnimatorCreatedCallback: Function = () => {}
    private onVideoProcessingStartCallback: Function;
    private onVideoProcessingEndCallback: Function;

    constructor(parent: Ui.Widget, onNewAnimatorCreatedCallback: Function) {
        this.onNewAnimatorCreatedCallback = onNewAnimatorCreatedCallback;
        this.defaultBackground = new Ui.Pixmap(import.meta.resolve('./Resources/videoUploadBackground.svg'));
        this.hoveredBackground = new Ui.Pixmap(import.meta.resolve('./Resources/videoUploadBackground_h.svg'));

        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        widget.autoFillBackground = true;
        widget.backgroundRole = ColorRole.Base;
        widget.setFixedWidth(378);
        widget.setFixedHeight(620);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        const uploadWidget = this.createUploadWidget(widget);

        layout.addWidget(uploadWidget);

        widget.layout = layout;

        this.createPopup(widget);

        this.mainWidget = widget;
    }

    createUploadWidget(parent: Ui.Widget, onReturnCallback: Function, goToGalleryPage: Function): Ui.Widget {
        const widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);

        const header = new Ui.Label(parent);
        header.text = "Upload Video";
        header.fontRole = Ui.FontRole.Title;
        header.foregroundRole = Ui.ColorRole.BrightText;

        const contentLayout = new Ui.BoxLayout();
        contentLayout.setDirection(Ui.Direction.TopToBottom);
        contentLayout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        contentLayout.spacing = Ui.Sizes.DoublePadding;

        const label = new Ui.Label(parent);
        label.wordWrap = true;
        label.text =  "Choose a file to upload. Once uploaded, video will be analyzed to detect audio and facial expressions.<br><br>" +
            "• Format: <b>.mp4, .mov</b><br>" +
            "• Max File Size: <b>20 MB</b><br><br>" +
            "Only the first 20 seconds will be processed.";

        contentLayout.addWidget(label);
        contentLayout.addStretch(0);

        // Video Upload

        const videoUpload = new Ui.ImageView(parent);
        videoUpload.responseHover = true;
        videoUpload.scaledContents = true;
        videoUpload.pixmap = this.defaultBackground;
        videoUpload.setFixedWidth(288);
        videoUpload.setFixedHeight(288);

        const iconView = new Ui.ImageView(videoUpload);
        iconView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        iconView.move(125, 120);
        iconView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/uploadIcon.svg'));

        const iconSize: number = 36;
        iconView.setFixedHeight(iconSize);
        iconView.setFixedWidth(iconSize);

        const buttonLabel = new Ui.ClickableLabel(videoUpload);
        buttonLabel.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        buttonLabel.setFixedWidth(72);
        buttonLabel.wordWrap = true;
        buttonLabel.text = '<center>' + 'Upload Video <br> <br> .mp4, .mov' + '</center>';
        buttonLabel.move(109, 159);

        const unsuccessfulImage = new Ui.ImageView(videoUpload);
        unsuccessfulImage.setFixedHeight(260);
        unsuccessfulImage.setFixedWidth(260);
        unsuccessfulImage.scaledContents = true;
        unsuccessfulImage.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/unsuccessful.svg'));
        unsuccessfulImage.move(14, 14);
        unsuccessfulImage.visible = false;

        const videoView = new Ui.VideoView(videoUpload);
        videoView.setFixedWidth(288);
        videoView.setFixedHeight(288);
        videoView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        videoView.radius = 8;
        videoView.muted = true;
        // videoView.volume = 1;
        videoView.visible = false;

        contentLayout.addWidgetWithStretch(videoUpload, 0, (Ui.Alignment.AlignCenter));
        contentLayout.addStretch(0);

        //Process Button

        const settingsIcon = Editor.Icon.fromFile(import.meta.resolve('./Resources/settings.svg'));

        const processVideoButton = new Ui.PushButton(widget);
        processVideoButton.text = 'Process Video';
        processVideoButton.setIconWithMode(settingsIcon, Ui.IconMode.MonoChrome);
        processVideoButton.setFixedWidth(110);
        processVideoButton.setFixedHeight(20);
        processVideoButton.primary = true;
        processVideoButton.enabled = false;

        contentLayout.addWidgetWithStretch(processVideoButton, 0, Alignment.AlignCenter);
        contentLayout.addStretch(1);

        layout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignCenter);
        layout.addLayout(contentLayout);

        const calloutWidgets = new Ui.Widget(widget);
        widget.setContentsMargins(0, 0, 0, 0);
        const calloutLayout = new Ui.BoxLayout();
        calloutLayout.setDirection(Ui.Direction.TopToBottom);
        calloutLayout.setContentsMargins(8, 8, 8, 8);
        calloutWidgets.layout = calloutLayout;

        const termsLink = 'https://www.snap.com/terms/lens-studio-license-agreement';
        const termsUrlString = Ui.getUrlString('Generative Lens Tools Terms', termsLink);
        const termsText = 'By using it, you agree to our ' + termsUrlString + '.';
        const terms = this.createCalloutWidget(widget, termsText);

        calloutLayout.addWidgetWithStretch(terms, 0, Ui.Alignment.AlignBottom);

        const guidelinesLink = 'https://developers.snap.com/lens-studio/features/genai-suite/face-animator';
        const guideUrlString = Ui.getUrlString('guidelines', guidelinesLink);
        const guideLinesText = 'Check our ' + guideUrlString + ' for examples, prompting best practices.';
        const guideLines = this.createCalloutWidget(widget, guideLinesText);

        calloutLayout.addWidgetWithStretch(guideLines, 0, Ui.Alignment.AlignBottom);

        layout.addWidgetWithStretch(calloutWidgets, 0, Ui.Alignment.AlignBottom);

        this.connections.push(videoUpload.onHover.connect((hovered) => {
            if (hovered) {
                videoUpload.pixmap = this.hoveredBackground;
            }
            else {
                videoUpload.pixmap = this.defaultBackground;
            }
        }))

        let uploadIsInProgress = false;

        const buttonItems = [videoUpload, iconView, buttonLabel, videoView, unsuccessfulImage];
        buttonItems.forEach((item: any) => {
            this.connections.push(item.onClick.connect(() => {
                if (uploadIsInProgress) {
                    return;
                }

                unsuccessfulImage.visible = false;

                const filePath = app.findInterface(Ui.IGui).dialogs.selectFileToOpen({ 'caption': 'Select file to open', 'filter': '*.mp4 *.mov' }, '');
                if (!filePath.isEmpty) {
                    this.currentVideoFilePath = filePath;
                    videoView.visible = true;
                    videoView.stop();
                    videoView.setSource(filePath);
                    videoView.loopCount = -1;
                    videoView.play();
                    processVideoButton.enabled = true;
                    processVideoButton.primary = true;
                }
            }))
        })

        processVideoButton.onClick.connect(() => {
            uploadIsInProgress = true;
            processVideoButton.enabled = false;
            if (this.popup) {
                this.popup.visible = false;
            }
            videoView.pause();
            if (this.currentVideoFilePath) {
                this.onVideoProcessingStartCallback();
                const fileName: string = this.currentVideoFilePath.toString().split('/').pop() as string;
                uploadVideo(this.currentVideoFilePath as unknown as Editor.Path, fileName, (response: any) => {
                    uploadIsInProgress = false;
                    this.currentVideoFilePath = null;
                    videoView.visible = false;
                    this.onVideoProcessingEndCallback();
                    if (response.statusCode === 201) {
                        logEventCreate("SUCCESS", "NEW", "PROMPT_VIDEO");
                        this.onNewAnimatorCreatedCallback(JSON.parse(response.body));
                    }
                    else {
                        if (response.statusCode === 429) {
                            if (this.popup) {
                                this.popup.visible = true;
                            }
                        }

                        unsuccessfulImage.visible = true;

                        if (response.statusCode === 400) {
                            logEventCreate("GUIDELINES_VIOLATION", "NEW", "PROMPT_VIDEO");
                        }
                        else {
                            logEventCreate("FAILED", "NEW", "PROMPT_VIDEO");
                        }
                    }
                })
            }
        });

        widget.layout = layout;

        return widget;
    }

    get widget(): Ui.Widget {
        return this.mainWidget;
    }

    private createCalloutWidget(parent: Ui.Widget, text: string): Ui.Widget {
        const frame = new Ui.CalloutFrame(parent);
        frame.setBackgroundColor(this.createColor(68, 74, 85, 255));

        const frameLayout = new Ui.BoxLayout();
        frameLayout.setDirection(Ui.Direction.LeftToRight);
        frameLayout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        frameLayout.spacing = Ui.Sizes.Padding;

        const info = this.createInfoIcon(frame);

        frameLayout.addWidget(info);
        frameLayout.addStretch(0);

        const guidelinesLabel = new Ui.Label(frame);
        guidelinesLabel.text = text;
        guidelinesLabel.wordWrap = true;
        guidelinesLabel.openExternalLinks = true;

        frameLayout.addWidgetWithStretch(guidelinesLabel, 1, Ui.Alignment.Default);

        frame.layout = frameLayout;
        return frame;
    }

    createPopup(widget: Ui.Widget): void {
        this.popup = new Ui.CalloutFrame(widget);
        this.popup.setForegroundColor(this.createColor(234, 85, 99, 255));
        this.popup.setBackgroundColor(this.createColor(234, 85, 99, 255));

        const popupLayout = new Ui.BoxLayout();
        this.popup.layout = popupLayout;
        popupLayout.setContentsMargins(8, 0, 8, 0);

        const infoImage = new Ui.ImageView(this.popup);
        infoImage.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/warning.svg'));
        infoImage.setFixedWidth(16);
        infoImage.setFixedHeight(16);

        popupLayout.addWidgetWithStretch(infoImage, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter)

        this.popupLabel = new Ui.Label(this.popup);
        this.popupLabel.foregroundRole = Ui.ColorRole.BrightText;

        this.popup.visible = false;

        this.popup.setFixedHeight(32);
        this.popup.setFixedWidth(374);
        // this.popup.move(213, 4);
        this.popup.move(2, 4);

        this.popupLabel.text = "Limit reached - A maximum of 5 previews can be trained at once.";

        popupLayout.addWidgetWithStretch(this.popupLabel, 1, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter)
    }

    setVideoProcessingStartListener(callback: Function) {
        this.onVideoProcessingStartCallback = callback;
    }

    setVideoProcessingEndListener(callback: Function) {
        this.onVideoProcessingEndCallback = callback;
    }

    private createColor(r: number, g: number, b: number, a: number) {
        const color = new Ui.Color();
        color.red = r;
        color.green = g;
        color.blue = b;
        color.alpha = a;
        return color;
    }

    private createInfoIcon(parent: Ui.Widget): Ui.Widget {
        return this.createIcon(parent, new Ui.Pixmap(import.meta.resolve('./Resources/info.svg')));
    }

    private createIcon(parent: Ui.Widget, iconImage: Ui.Pixmap) {
        const imageView = new Ui.ImageView(parent);

        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        imageView.setFixedWidth(Ui.Sizes.IconSide);
        imageView.setFixedHeight(Ui.Sizes.IconSide);

        imageView.scaledContents = true;
        imageView.pixmap = iconImage;

        return imageView;
    }
}
