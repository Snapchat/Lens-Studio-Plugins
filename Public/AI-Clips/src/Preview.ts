// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import {Pixmap} from "LensStudio:Ui";

export class Preview {

    private mainWidget: Ui.Widget | undefined;
    private imageView: Ui.MovieView | undefined;
    private defaultImage: Movie;
    private transparentImage: Movie;
    private leftArrow: Ui.ImageView | undefined;
    private rightArrow: Ui.ImageView | undefined;
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
        this.defaultImage = new Ui.Movie(import.meta.resolve('./Resources/no_img.png'));
        this.transparentImage = new Ui.Movie(import.meta.resolve('./Resources/transparent.png'));
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

        this.imageView = new Ui.MovieView(widget);
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
        errorIcon.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/error_icon.svg'));
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

        this.leftArrow = leftArrow;
        this.rightArrow = rightArrow;

        this.setDefaultState();

        widget.layout = layout;

        return widget;
    }

    setDefaultState() {
        if (!this.imageView || !this.leftArrow || !this.rightArrow || !this.spinner || !this.generatingPreviewLabel || !this.errorContainer) {
            return;
        }
        this.imageView.setFixedHeight(262);
        this.imageView.setFixedWidth(262);
        this.imageView.radius = 0;
        this.imageView.movie = this.defaultImage;
        this.leftArrow.visible = false;
        this.rightArrow.visible = false;
        this.spinner.visible = false;
        this.generatingPreviewLabel.visible = false;
        this.errorContainer.visible = false;
    }

    setFailedState() {
        if (!this.imageView || !this.leftArrow || !this.rightArrow || !this.spinner || !this.generatingPreviewLabel || !this.errorContainer) {
            return;
        }
        this.imageView.setFixedHeight(262);
        this.imageView.setFixedWidth(262);
        this.imageView.radius = 0;
        this.imageView.movie = this.transparentImage;
        this.leftArrow.visible = false;
        this.rightArrow.visible = false;
        this.spinner.visible = false;
        this.generatingPreviewLabel.visible = false;
        this.errorContainer.visible = true;
    }

    setPreviewState(id: string) {
        if (!this.imageView || !this.leftArrow || !this.rightArrow || !this.spinner || !this.generatingPreviewLabel || !this.errorContainer) {
            return;
        }
        this.id = id;
        this.imageView.setFixedHeight(540);
        this.imageView.setFixedWidth(308);
        this.imageView.radius = 16;
        this.imageView.movie = this.transparentImage;
        this.leftArrow.visible = true;
        this.rightArrow.visible = true;
        this.spinner.visible = true;
        this.generatingPreviewLabel.visible = false;
        this.errorContainer.visible = false;
        this.previewId = 0;
        this.onPreviewIndexChanged(this.id, this.previewId);
    }

    setWaitingState(id: string) {
        if (!this.imageView || !this.spinner || !this.generatingPreviewLabel || !this.leftArrow || !this.rightArrow || !this.errorContainer) {
            return;
        }

        this.id = id;
        this.imageView.movie = this.transparentImage;
        this.leftArrow.visible = false;
        this.rightArrow.visible = false;
        this.spinner.visible = true;
        this.generatingPreviewLabel.visible = true;
        this.errorContainer.visible = false;
    }

    setPreviewImages(previewImages: any, prevPreviewId: number, previewCnt: number) {
        this.previewId = this.mod(this.previewId, previewCnt);
        if (!this.imageView || !this.spinner || this.previewId !== prevPreviewId || !this.generatingPreviewLabel) {
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
        return this.mainWidget && this.mainWidget.visible;
    }

    private setPreviewImage() {
        if (!this.imageView || !this.previewImages) {
            return;
        }
        this.imageView.movie = new Ui.Movie(this.previewImages.targetImagePath);
        this.imageView.animated = true;
    }

    private previewIndexChanged() {
        if (!this.imageView || !this.spinner) {
            return;
        }
        this.imageView.movie = this.transparentImage;
        this.spinner.visible = true;
        this.onPreviewIndexChanged(this.id, this.previewId);
    }

    private onLeftArrowClicked() {
        this.previewId--;
        this.previewIndexChanged();
    }

    private onRightArrowClicked() {
        this.previewId++;
        this.previewIndexChanged();
    }

    private mod(a: number, b: number): number {
        return ((a % b) + b) % b;
    }
}
