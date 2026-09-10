import * as Ui from "LensStudio:Ui";
import {Pixmap} from "LensStudio:Ui";

export class Preview {

    private mainWidget: Ui.Widget | undefined;
    private imageView: Ui.ImageView | undefined;
    private defaultImage: Pixmap;
    private transparentImage: Pixmap;
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

    private connections: Array<any> = [];

    constructor(onPreviewIndexChangedCallback: Function) {
        this.onPreviewIndexChanged = onPreviewIndexChangedCallback;
        this.defaultImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/no_img.png')));
        this.transparentImage = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/transparent.png')));
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

        this.imageView = new Ui.ImageView(widget);
        this.imageView.scaledContents = true;

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

    setDefaultState() {
        if (!this.imageView || !this.spinner || !this.generatingPreviewLabel || !this.errorContainer) {
            return;
        }
        this.imageView.setFixedHeight(262);
        this.imageView.setFixedWidth(262);
        this.imageView.radius = 0;
        this.imageView.pixmap = this.defaultImage;
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
        this.imageView.radius = 0;
        this.imageView.pixmap = this.transparentImage;
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
        this.imageView.radius = 16;
        this.imageView.pixmap = this.transparentImage;
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
        this.imageView.pixmap = this.transparentImage;
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
            // Pixmap from a null path, which would throw a native error.
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

    private setPreviewImage() {
        if (!this.imageView || !this.previewImages || !this.previewImages.targetImagePath) {
            return;
        }
        this.imageView.pixmap = new Ui.Pixmap(this.previewImages.targetImagePath);
    }

    private mod(a: number, b: number): number {
        return ((a % b) + b) % b;
    }
}
