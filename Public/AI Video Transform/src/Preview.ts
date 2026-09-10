import * as Ui from "LensStudio:Ui";
import {Pixmap} from "LensStudio:Ui";

export class Preview {

    private mainWidget: Ui.Widget | undefined;
    private imageView: Ui.MovieView | undefined;
    private videoView: Ui.VideoView | undefined;
    private defaultImage: Ui.Movie;
    private transparentImage: Ui.Movie;
    // Only a single preview is shown now, so the left/right arrow UI for
    // switching between previews has been disabled.
    // private leftArrow: Ui.ImageView | undefined;
    // private rightArrow: Ui.ImageView | undefined;
    private spinner: Ui.ProgressIndicator | undefined;
    private generatingPreviewLabel: Ui.Label | undefined;
    private errorContainer: Ui.Widget | undefined;
    private previewId: number = 0;
    private id: string = "";
    private previewImages: any;
    private onPreviewIndexChanged: Function = () => {};
    private previewRadius: number = 0;

    private connections: Array<any> = [];

    constructor(onPreviewIndexChangedCallback: Function) {
        this.onPreviewIndexChanged = onPreviewIndexChangedCallback;
        this.defaultImage = new Ui.Movie(new Editor.Path(import.meta.resolve('./Resources/no_img.png')));
        this.transparentImage = new Ui.Movie(new Editor.Path(import.meta.resolve('./Resources/transparent.png')));
    }

    create(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);
        widget.setFixedHeight(563);
        widget.setFixedWidth(421);
        widget.autoFillBackground = true;
        widget.backgroundRole = Ui.ColorRole.Mid;
        this.mainWidget = widget;

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        layout.setContentsMargins(8, 0, 8, 0);

        this.imageView = new Ui.MovieView(widget);
        this.imageView.scaledContents = true;

        // VideoView overlays the MovieView to actually play back downloaded
        // .mp4 previews - Ui.Movie/MovieView only decode animated image
        // formats (GIF/APNG/WEBP), not real video codecs.
        this.videoView = new Ui.VideoView(this.imageView);
        this.videoView.muted = true;
        this.videoView.loopCount = -1;
        this.videoView.visible = false;
        this.videoView.move(0, 0);

        const imageViewLayout = new Ui.BoxLayout();
        this.imageView.layout = imageViewLayout;

        this.spinner = new Ui.ProgressIndicator(this.imageView);
        this.spinner.setFixedHeight(32);
        this.spinner.setFixedWidth(32);
        this.spinner.start();

        imageViewLayout.addWidgetWithStretch(this.spinner, 0, Ui.Alignment.AlignCenter);

        this.generatingPreviewLabel = new Ui.Label(widget);
        this.generatingPreviewLabel.text = '<center>' + 'Generating previews...<br>This may take up to 1 minute.<br><br>You can close this window and return later.' + '</center>';
        this.generatingPreviewLabel.setFixedWidth(350);
        this.generatingPreviewLabel.setFixedHeight(90);
        this.generatingPreviewLabel.move(35, 298);

        this.generatingPreviewLabel.foregroundRole = Ui.ColorRole.BrightText;

        this.generatingPreviewLabel.visible = false;

        this.errorContainer = new Ui.Widget(widget);
        this.errorContainer.setFixedWidth(350);
        this.errorContainer.setFixedHeight(180);
        this.errorContainer.move(35, 180);

        const errorLayout = new Ui.BoxLayout();
        errorLayout.setDirection(Ui.Direction.TopToBottom);
        errorLayout.setContentsMargins(0, 0, 0, 0);

        const errorTitleRow = new Ui.Widget(this.errorContainer);
        const errorTitleRowLayout = new Ui.BoxLayout();
        errorTitleRowLayout.setDirection(Ui.Direction.LeftToRight);
        errorTitleRowLayout.setContentsMargins(0, 0, 0, 0);

        errorLayout.addStretch(0);

        const errorIcon = new Ui.ImageView(errorTitleRow);
        errorIcon.setFixedWidth(16);
        errorIcon.setFixedHeight(16);
        errorIcon.scaledContents = true;
        errorIcon.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/error_icon.svg')));
        errorTitleRowLayout.addWidgetWithStretch(errorIcon, 0, Ui.Alignment.AlignCenter);

        const errorTitle = new Ui.Label(errorTitleRow);
        errorTitle.text = '<span style="font-size: 16pt; font-weight: bold;">Generation Failed</span>';
        errorTitleRowLayout.addWidgetWithStretch(errorTitle, 0, Ui.Alignment.AlignCenter);

        errorTitleRow.layout = errorTitleRowLayout;
        errorLayout.addWidgetWithStretch(errorTitleRow, 0, Ui.Alignment.AlignCenter);

        const errorSubtitle = new Ui.Label(this.errorContainer);
        errorSubtitle.text = '<center>There was a problem with the generation process.<br>Please try again.</center>';
        errorSubtitle.foregroundRole = Ui.ColorRole.PlaceholderText;
        errorLayout.addWidgetWithStretch(errorSubtitle, 0, Ui.Alignment.AlignCenter);
        errorLayout.addStretch(0);

        this.errorContainer.layout = errorLayout;
        this.errorContainer.visible = false;

        layout.addWidgetWithStretch(this.imageView, 0, Ui.Alignment.AlignCenter);

        this.setDefaultState();

        widget.layout = layout;

        return widget;
    }

    private hideVideo() {
        if (!this.videoView) {
            return;
        }
        this.videoView.stop();
        this.videoView.visible = false;
    }

    private syncVideoViewGeometry(width: number, height: number, radius: number) {
        if (!this.videoView) {
            return;
        }
        this.videoView.setFixedWidth(width);
        this.videoView.setFixedHeight(height);
        this.videoView.radius = radius;
        this.videoView.move(0, 0);
    }

    setDefaultState() {
        if (!this.imageView || !this.spinner || !this.generatingPreviewLabel || !this.errorContainer) {
            return;
        }
        this.imageView.setFixedHeight(262);
        this.imageView.setFixedWidth(262);
        this.previewRadius = 0;
        this.imageView.movie = this.defaultImage;
        this.hideVideo();
        this.spinner.visible = false;
        this.generatingPreviewLabel.visible = false;
        this.errorContainer.visible = false;
    }

    setFailedState() {
        if (!this.imageView || !this.spinner || !this.generatingPreviewLabel || !this.errorContainer) {
            return;
        }
        this.imageView.setFixedHeight(262);
        this.imageView.setFixedWidth(262);
        this.previewRadius = 0;
        this.imageView.movie = this.transparentImage;
        this.hideVideo();
        this.spinner.visible = false;
        this.generatingPreviewLabel.visible = false;
        this.errorContainer.visible = true;
    }

    setPreviewState(id: string) {
        if (!this.imageView || !this.spinner || !this.generatingPreviewLabel || !this.errorContainer) {
            return;
        }
        this.id = id;
        this.imageView.setFixedHeight(540);
        this.imageView.setFixedWidth(308);
        this.previewRadius = 16;
        this.imageView.movie = this.transparentImage;
        this.hideVideo();
        this.spinner.visible = true;
        this.generatingPreviewLabel.visible = false;
        this.errorContainer.visible = false;
        this.previewId = 0;
        this.onPreviewIndexChanged(this.id, this.previewId);
    }

    setWaitingState(id: string) {
        if (!this.imageView || !this.spinner || !this.generatingPreviewLabel || !this.errorContainer) {
            return;
        }

        this.id = id;
        this.imageView.movie = this.transparentImage;
        this.hideVideo();
        this.spinner.visible = true;
        this.generatingPreviewLabel.visible = true;
        this.errorContainer.visible = false;
    }

    setPreviewImages(previewImages: any, prevPreviewId: number, previewCnt: number) {
        this.previewId = this.mod(this.previewId, previewCnt);
        if (!this.imageView || !this.spinner || this.previewId !== prevPreviewId || !this.generatingPreviewLabel) {
            return;
        }
        if (!previewImages || !previewImages.targetImagePath) {
            // Download for this preview is still in flight (placeholder entry with
            // no path yet) - keep showing the spinner instead of trying to build a
            // Movie from a null path, which would throw a native error.
            this.hideVideo();
            this.spinner.visible = true;
            return;
        }
        this.previewImages = previewImages;
        this.spinner.visible = false;
        this.generatingPreviewLabel.visible = false;
        this.setPreviewImage();
    }

    getId(): string {
        return this.id;
    }

    setId(newId: string) {
        this.id = newId;
    }

    isVisible(): boolean {
        return !!(this.mainWidget && this.mainWidget.visible);
    }

    private isVideoPath(path: any): boolean {
        const pathStr = path.toString().toLowerCase();
        return pathStr.endsWith('.mp4') || pathStr.endsWith('.mov') || pathStr.endsWith('.webm');
    }

    private setPreviewImage() {
        if (!this.imageView || !this.previewImages || !this.previewImages.targetImagePath) {
            return;
        }
        const path = this.previewImages.targetImagePath;
        if (this.isVideoPath(path)) {
            // Ui.Movie/MovieView only decode animated image formats - use the
            // VideoView overlay for actual video files (e.g. mp4 previews).
            this.imageView.movie = this.transparentImage;
            if (this.videoView) {
                this.syncVideoViewGeometry(this.imageView.width, this.imageView.height, this.previewRadius);
                this.videoView.visible = true;
                this.videoView.setSource(path);
                this.videoView.play();
            }
        } else {
            this.hideVideo();
            this.imageView.movie = new Ui.Movie(path);
            this.imageView.animated = true;
        }
    }

    private mod(a: number, b: number): number {
        return ((a % b) + b) % b;
    }
}
