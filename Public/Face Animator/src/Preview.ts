// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import {Pixmap} from "LensStudio:Ui";
import {downloadFile} from "./api.js";
import * as FileSystem from "LensStudio:FileSystem";
import {Importer} from "./Importer.js";
import app from "./app";
import {logEventImport} from "./analytics";

enum PreviewMode {
    source,
    target
}

export class Preview {

    private mainWidget: Ui.Widget;
    private footer: Ui.Widget;
    private previewWidget: Ui.Widget;
    private tempDir: FileSystem.TempDir;
    private connections: Array<any> = [];
    private imageView: Ui.ImageView | undefined;
    private videoView: Ui.VideoView | undefined;
    private leftArrow: Ui.ImageView | undefined;
    private rightArrow: Ui.ImageView | undefined;
    private spinner: Ui.ProgressIndicator | undefined;
    private defaultSpinner: Ui.ProgressIndicator | undefined;
    private ctaButton: Ui.ImageView | undefined;
    private generatingPreviewLabel: Ui.Label | undefined;
    private defaultImage: Pixmap;
    private mutedImage: Pixmap;
    private unmutedImage: Pixmap;
    private trainModelButton: Ui.PushButton | undefined;
    private importButton: Ui.PushButton | undefined;
    private previews: Record<string, Record<number, any>> = {};
    private importer: Importer;
    private warningDialog: Ui.Dialog | undefined;
    private previewUrls: any;
    private id: string = "";
    private previewId: number = 0;
    private isMuted: boolean = false;
    private mode: PreviewMode = PreviewMode.target;
    private outputModelUrl: string = "";
    private mp3Url: any = "";
    private timeout: any;
    private importToProject: Function = () => {};
    private onItemRemovedCallback: Function = () => {};
    private onTrainingStartedCallback: Function = () => {};
    private onVideoPlayStartCallback: Function = () => {};
    private onVideoPlayStopCallback: Function = () => {};

    constructor(parent: Ui.Widget, onItemRemovedCallback: Function, onTrainingStartedCallback: Function) {
        this.tempDir = FileSystem.TempDir.create();
        this.onItemRemovedCallback = onItemRemovedCallback;
        this.onTrainingStartedCallback = onTrainingStartedCallback;
        this.importer = new Importer();
        this.defaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/no_preview.svg'));
        this.mutedImage = new Ui.Pixmap(import.meta.resolve('./Resources/muted.svg'));
        this.unmutedImage = new Ui.Pixmap(import.meta.resolve('./Resources/unmuted.svg'));

        const widget = new Ui.Widget(parent);

        widget.setContentsMargins(0, 0, 0, 0);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        widget.autoFillBackground = true;
        widget.backgroundRole = Ui.ColorRole.Base;
        widget.setFixedWidth(421);
        widget.setFixedHeight(620);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, widget);
        separator.setFixedHeight(Ui.Sizes.SeparatorLineWidth);

        this.previewWidget = this.createPreview(widget);
        this.footer = this.createFooter(widget);

        layout.addWidgetWithStretch(this.previewWidget, 0, Ui.Alignment.AlignTop);
        layout.addWidgetWithStretch(separator, 0, Ui.Alignment.AlignBottom);
        layout.addWidgetWithStretch(this.footer, 0, Ui.Alignment.AlignBottom);

        widget.layout = layout;

        this.mainWidget = widget;
    }

    private createFooter(parent: Ui.Widget) {
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);
        widget.setFixedHeight(56);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        const removeButton = new Ui.PushButton(widget);
        removeButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/trashCan.svg')), Ui.IconMode.MonoChrome)
        removeButton.primary = false;

        const trainModelButton = new Ui.PushButton(widget);
        trainModelButton.text = 'Train the Model';
        trainModelButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/generate.svg')), Ui.IconMode.MonoChrome)
        trainModelButton.primary = true;
        trainModelButton.visible = true;
        this.trainModelButton = trainModelButton;

        const importButton = new Ui.PushButton(widget);
        importButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/import.svg')), Ui.IconMode.MonoChrome);
        importButton.text = 'Import to project';
        importButton.primary = true;
        importButton.visible = false;
        this.importButton = importButton;

        layout.addStretch(0);
        layout.addWidgetWithStretch(removeButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignTop);
        layout.addWidgetWithStretch(trainModelButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignTop);
        layout.addWidgetWithStretch(importButton, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignTop);

        widget.layout = layout;

        removeButton.onClick.connect(() => {
            this.onItemRemovedCallback(this.id);
        })

        trainModelButton.onClick.connect(() => {
            if (this.trainModelButton) {
                this.trainModelButton.enabled = false;
            }
            this.onTrainingStartedCallback(this.id);
        })

        const _this = this;
        const importToProject = (dnnPath: any, audioPath: any) => {
            _this.downloadAsset(_this.outputModelUrl, _this.id + "_output.dnn", (path: string) => {
                dnnPath = path;

                if (audioPath !== null) {
                    if (audioPath === "failed") {
                        _this.importer.importToProject(dnnPath, null);
                        logEventImport("SUCCESS", "NO_AUDIO")
                    }
                    else {
                        _this.importer.importToProject(dnnPath, audioPath);
                        logEventImport("SUCCESS", "AUDIO")
                    }
                    if (_this.importButton) {
                        _this.importButton.enabled = true;
                    }
                }
            })

            if (audioPath === null) {
                _this.downloadAsset(_this.mp3Url, _this.id + "_audio.mp3", (path: string) => {
                    audioPath = path;

                    if (dnnPath !== null) {
                        if (audioPath === "failed") {
                            _this.importer.importToProject(dnnPath, null);
                            logEventImport("SUCCESS", "NO_AUDIO")
                        } else {
                            _this.importer.importToProject(dnnPath, audioPath);
                            logEventImport("SUCCESS", "AUDIO")
                        }
                        if (_this.importButton) {
                            _this.importButton.enabled = true;
                        }
                    }
                })
            }
        }

        this.importToProject = importToProject;

        this.createWarningDialog(() => {
            if (this.importButton) {
                this.importButton.enabled = false;
            }
            importToProject(null, null);
        },
        () => {
            if (this.importButton) {
                this.importButton.enabled = false;
            }
            importToProject(null, "failed");
        });

        importButton.onClick.connect(() => {
            this.onImportButtonClicked();
        })

        return widget;
    }

    private createPreview(parent: Ui.Widget) {
        const widget = new Ui.Widget(parent);
        widget.setFixedHeight(563);
        widget.setFixedWidth(421);
        widget.autoFillBackground = true;
        widget.backgroundRole = Ui.ColorRole.Base;

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(8, 0, 8, 0);

        this.defaultSpinner = new Ui.ProgressIndicator(widget);
        this.defaultSpinner.setFixedHeight(16);
        this.defaultSpinner.setFixedWidth(16);
        this.defaultSpinner.start();
        this.defaultSpinner.move(202, 273);

        const leftArrow = new Ui.ImageView(widget);
        leftArrow.setFixedWidth(36);
        leftArrow.setFixedHeight(36);
        leftArrow.scaledContents = true;
        leftArrow.responseHover = true;
        const leftArrowDefaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/leftArrow.svg'));
        const leftArrowHoveredImage = new Ui.Pixmap(import.meta.resolve('./Resources/leftArrow_h.svg'));
        leftArrow.pixmap = leftArrowDefaultImage;

        leftArrow.onHover.connect((hovered: boolean) => {
            leftArrow.pixmap = hovered ? leftArrowHoveredImage : leftArrowDefaultImage;
        })

        layout.addWidgetWithStretch(leftArrow, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);

        // Image Preview

        this.imageView = new Ui.ImageView(widget);
        this.imageView.setFixedHeight(534);
        this.imageView.setFixedWidth(300);
        this.imageView.scaledContents = true;
        this.imageView.radius = 4;
        this.imageView.pixmap = this.defaultImage;
        this.imageView.visible = false;

        const imageViewLayout = new Ui.BoxLayout();
        this.imageView.layout = imageViewLayout;

        this.spinner = new Ui.ProgressIndicator(this.imageView);
        this.spinner.setFixedHeight(16);
        this.spinner.setFixedWidth(16);
        this.spinner.start();
        this.spinner.move(142, 221);

        this.spinner.visible = false;

        this.generatingPreviewLabel = new Ui.Label(widget);
        this.generatingPreviewLabel.text = '<center>' + 'Generating preview...<br>This may take up to 3 minutes.<br><br>You can close the window<br>and return later.' + '</center>';
        this.generatingPreviewLabel.setFixedWidth(350);
        this.generatingPreviewLabel.setFixedHeight(90);
        this.generatingPreviewLabel.move(35, 258);
        this.generatingPreviewLabel.foregroundRole = Ui.ColorRole.Text;

        this.generatingPreviewLabel.visible = false;

        layout.addWidgetWithStretch(this.imageView, 0, Ui.Alignment.AlignCenter);

        // Video Preview

        const videoView = new Ui.VideoView(widget);
        videoView.setFixedWidth(300);
        videoView.setFixedHeight(534);
        videoView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        videoView.radius = 8;
        videoView.loopCount = -1;
        // videoView.volume = 1;
        videoView.visible = true;

        this.videoView = videoView;

        this.videoView.onShow.connect(() => {
            videoView.play();
        })

        this.videoView.onHide.connect(() => {
            videoView.pause();
        })

        const muteButton = new Ui.ImageView(videoView);
        muteButton.pixmap = this.unmutedImage;
        muteButton.setFixedWidth(56);
        muteButton.setFixedHeight(20);
        muteButton.scaledContents = true;
        muteButton.move(8, 506);

        muteButton.onClick.connect(() => {
            this.isMuted = !this.isMuted;
            if (this.isMuted) {
                muteButton.pixmap = this.mutedImage;
                videoView.muted = true;
            }
            else {
                muteButton.pixmap = this.unmutedImage;
                videoView.muted = false;
            }
        })

        layout.addWidgetWithStretch(this.videoView, 0, Ui.Alignment.AlignCenter);

        const rightArrow = new Ui.ImageView(widget);
        rightArrow.setFixedWidth(36);
        rightArrow.setFixedHeight(36);
        rightArrow.scaledContents = true;
        rightArrow.responseHover = true;
        const rightArrowDefaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/rightArrow.svg'));
        const rightArrowHoveredImage = new Ui.Pixmap(import.meta.resolve('./Resources/rightArrow_h.svg'));
        rightArrow.pixmap = rightArrowDefaultImage;
        rightArrow.onHover.connect((hovered: boolean) => {
            rightArrow.pixmap = hovered ? rightArrowHoveredImage : rightArrowDefaultImage;
        })

        layout.addWidgetWithStretch(rightArrow, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);

        this.connections.push(leftArrow.onClick.connect(() => {
            this.onLeftArrowClicked();
        }))

        this.connections.push(rightArrow.onClick.connect(() => {
            this.onRightArrowClicked();
        }))

        this.ctaButton = new Ui.ImageView(widget);
        this.ctaButton.setFixedWidth(28);
        this.ctaButton.setFixedHeight(20);
        this.ctaButton.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/cta_button.svg'));
        this.ctaButton.move(326, 520);
        this.ctaButton.scaledContents = true;
        this.ctaButton.visible = true;
        this.ctaButton.raise();

        this.connections.push(this.ctaButton.onClick.connect(() => {
            if (this.mode === PreviewMode.target) {
                this.mode = PreviewMode.source;
                if (this.imageView && this.videoView) {
                    this.videoView.stop();
                    this.videoView.visible = false;
                    this.imageView.visible = true;
                }
            }
            else {
                this.mode = PreviewMode.target;
                if (this.imageView && this.videoView) {
                    this.videoView.stop();
                    this.videoView.play();
                    this.onVideoPlayStartCallback();
                    this.imageView.visible = false;
                    this.videoView.visible = true;
                }
            }

        }));

        this.leftArrow = leftArrow;
        this.rightArrow = rightArrow;

        widget.layout = layout;

        return widget;
    }

    private onImportButtonClicked() {
        if (this.mp3Url) {
            this.warningDialog?.show();
        }
        else {
            if (this.importButton) {
                this.importButton.enabled = false;
            }
            this.importToProject(null, "failed");
        }
    }

    import(dnnUrl: string, mp3Url: any) {
        this.outputModelUrl = dnnUrl;
        this.mp3Url = mp3Url;
        this.onImportButtonClicked();
    }

    setId(newId: string) {
        this.id = newId;
        this.outputModelUrl = "";
        this.mp3Url = "";
    }

    setState(newState: string) {
        if (!this.trainModelButton || !this.importButton) {
            return;
        }
        if (newState === "GENERATION_SUCCESS") {
            this.trainModelButton.visible = false;
            this.importButton.visible = true;
        }
        else {
            this.importButton.visible = false;
            this.trainModelButton.visible = true;
            this.trainModelButton.enabled = newState === "PREVIEW_SUCCESS";
        }
    }

    setImportData(dnnUrl: string, mp3Url: any) {
        this.outputModelUrl = dnnUrl;
        this.mp3Url = mp3Url;
    }

    setPreviews(previews: any) {
        this.previewUrls = previews;
        this.previewId = 0;
        if (!this.previews[this.id]) {
            this.previews[this.id] = {};
        }
        this.previewIdxChanged(this.id, this.previewId);

        if (this.leftArrow && this.rightArrow && this.spinner && this.generatingPreviewLabel) {
            this.leftArrow.visible = true;
            this.rightArrow.visible = true;
            this.spinner.visible = false;
            this.generatingPreviewLabel.visible = false;
        }
    }

    setDefaultPreviewState() {
        this.videoView.visible = false;
        this.imageView.pixmap = this.defaultImage;
        this.imageView.visible = true;
        this.ctaButton.visible = false;
        if (this.leftArrow && this.rightArrow && this.spinner && this.generatingPreviewLabel) {
            this.leftArrow.visible = false;
            this.rightArrow.visible = false;
            this.spinner.visible = true;
            this.generatingPreviewLabel.visible = true;
        }
    }

    getId(): string {
        return this.id;
    }

    setVideoPlayStartListener(callback: Function) {
        this.onVideoPlayStartCallback = callback;
    }

    setVideoPlayStopListener(callback: Function) {
        this.onVideoPlayStopCallback = callback;
    }

    stopVideo() {
        this.videoView.stop();
    }

    private onLeftArrowClicked() {
        this.previewId--;
        this.previewId = this.mod(this.previewId, this.previewUrls.length);
        this.videoView.stop();
        if (this.mode === PreviewMode.target) {
            this.onVideoPlayStopCallback();
        }
        this.previewIdxChanged(this.id, this.previewId);
    }

    private onRightArrowClicked() {
        this.previewId++;
        this.previewId = this.mod(this.previewId, this.previewUrls.length);
        this.videoView.stop();
        if (this.mode === PreviewMode.target) {
            this.onVideoPlayStopCallback();
        }
        this.previewIdxChanged(this.id, this.previewId);
    }

    private previewIdxChanged(id: string, previewId: number): void {
        if (this.previews[id][previewId]) {
            this.imageView.pixmap = new Ui.Pixmap(this.previews[id][previewId].sourceImagePath);
            this.videoView.stop();
            this.videoView.setSource(this.previews[id][previewId].outputVideoPath);
            this.ctaButton.visible = true;
            if (this.mode === PreviewMode.source) {
                this.videoView.visible = false;
                this.imageView.visible = true;
            }
            else if (this.mode === PreviewMode.target) {
                this.videoView.play();
                this.onVideoPlayStartCallback();
                this.imageView.visible = false;
                this.videoView.visible = true;
            }
        }
        else {
            this.previews[id][previewId] = {"sourceImagePath" : null, "outputVideoPath" : null};
            this.ctaButton.visible = false;
            if (this.imageView) {
                this.imageView.visible = false;
            }
            this.downloadAsset(this.previewUrls[previewId].sourceImageUrl, id + "_" + previewId + "_sourceImage.webp", (path: string) => {
                this.previews[id][previewId].sourceImagePath = path;

                if (this.id === id && previewId === this.previewId) {
                    if (this.imageView) {
                        this.imageView.pixmap = new Ui.Pixmap(path);
                        if (this.mode === PreviewMode.source) {
                            this.videoView.visible = false;
                            this.imageView.visible = true;
                            this.ctaButton.visible = true;
                        }
                    }
                }

            })
            if (this.videoView) {
                this.videoView.visible = false;
            }
            this.downloadAsset(this.previewUrls[previewId].outputVideoUrl, id + "_" + previewId + "_outputVideo.mp4", (path: string) => {
                this.previews[id][previewId].outputVideoPath = path;

                if (this.id === id && previewId === this.previewId) {
                    if (this.videoView) {
                        this.videoView.stop();
                        this.videoView.setSource(path);

                        if (this.mode === PreviewMode.target) {
                            this.videoView.play();
                            this.onVideoPlayStartCallback();
                            this.imageView.visible = false;
                            this.videoView.visible = true;
                            this.ctaButton.visible = true;
                        }
                    }
                }
            })
        }
    }

    private downloadAsset(url: string, fileName: string,  callback: Function): void {
        const tempDir = this.tempDir;
        downloadFile(url, (response: any) => {
            if (response.statusCode === 200) {
                const path = tempDir.path.appended(fileName);

                const resolvedDirectoryPath = import.meta.resolve(tempDir.path.toString());
                const resolvedFilePath = import.meta.resolve(path.toString());

                if (resolvedFilePath.startsWith(resolvedDirectoryPath)) {
                    FileSystem.writeFile(path, response.body.toBytes());
                    callback(path);
                }
                else {
                    throw new Error(`Resolved file path is not inside the resolved directory. resolvedFilePath: ${resolvedFilePath} | resolvedDirectoryPath: ${resolvedDirectoryPath}`);
                }
            }
            else {
                callback("failed");
            }
        })
    }

    private createWarningDialog(addAudioCallback: Function, skipAudioCallback: Function): void {
        const gui = app.findInterface(Ui.IGui)
        this.warningDialog = gui.createDialog();
        this.warningDialog.setFixedWidth(288);
        this.warningDialog.setFixedHeight(136);
        this.warningDialog.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.warningDialog.setModal(true);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding);

        const captionWidget = new Ui.Widget(this.warningDialog);
        const captionLayout = new Ui.BoxLayout();
        captionLayout.setDirection(Ui.Direction.LeftToRight);
        captionLayout.setContentsMargins(0, 0, 0, 0);
        captionLayout.spacing = Ui.Sizes.DoublePadding;

        const warningImage = new Ui.ImageView(captionWidget);
        warningImage.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/audio.svg'));
        warningImage.setFixedWidth(48);
        warningImage.setFixedHeight(48);
        warningImage.scaledContents = true;

        const textWidget = new Ui.Widget(captionWidget);
        const textLayout = new Ui.BoxLayout();
        textLayout.setContentsMargins(Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding);
        textLayout.setDirection(Ui.Direction.TopToBottom);
        textLayout.spacing = Ui.Sizes.Padding;

        const headerLabel = new Ui.Label(textWidget);
        const paragraphLabel = new Ui.Label(textWidget);

        headerLabel.text = 'Add Audio';
        headerLabel.fontRole = Ui.FontRole.TitleBold;
        headerLabel.foregroundRole = Ui.ColorRole.BrightText
        paragraphLabel.text = 'Decide whether your effect will  include source video’s audio file or will be muted.';
        paragraphLabel.wordWrap = true;
        paragraphLabel.fontRole = Ui.FontRole.Default;

        textLayout.addWidget(headerLabel);
        textLayout.addWidget(paragraphLabel);

        textWidget.layout = textLayout;

        captionLayout.addWidget(warningImage);
        captionLayout.addWidget(textWidget);
        captionWidget.layout = captionLayout;

        const buttonsWidget = new Ui.Widget(this.warningDialog);
        const buttonsLayout = new Ui.BoxLayout();
        buttonsLayout.setDirection(Ui.Direction.LeftToRight);
        buttonsLayout.setContentsMargins(0, 0, 0, 0);

        const cancelButton = new Ui.PushButton(buttonsWidget);
        const deleteButton = new Ui.PushButton(buttonsWidget);

        cancelButton.text = 'Skip Audio';
        deleteButton.text = 'Add Audio';

        const _this = this;

        this.connections.push(cancelButton.onClick.connect(function() {
            _this.warningDialog?.close();
            skipAudioCallback();
        }.bind(this)));

        this.connections.push(deleteButton.onClick.connect(function() {
            _this.warningDialog?.close();
            addAudioCallback();
        }.bind(this)));

        buttonsLayout.addStretch(0);
        buttonsLayout.addWidget(cancelButton);
        buttonsLayout.addWidget(deleteButton);

        buttonsWidget.layout = buttonsLayout;

        layout.addWidget(captionWidget);
        layout.addStretch(0);
        layout.addWidgetWithStretch(buttonsWidget, 0, Ui.Alignment.AlignBottom | Ui.Alignment.AlignCenter);

        this.warningDialog.layout = layout;
    }

    private mod(a: number, b: number): number {
        return ((a % b) + b) % b;
    }

    get widget(): Ui.Widget {
        return this.mainWidget;
    }
}
