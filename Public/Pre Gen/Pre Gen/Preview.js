// @ts-nocheck
import * as Ui from "LensStudio:Ui";
var PreviewMode;
(function (PreviewMode) {
    PreviewMode[PreviewMode["source"] = 0] = "source";
    PreviewMode[PreviewMode["target"] = 1] = "target";
})(PreviewMode || (PreviewMode = {}));
export class Preview {
    constructor(onPreviewIndexChangedCallback) {
        this.previewId = 0;
        this.id = "";
        this.onPreviewIndexChanged = () => { };
        this.mode = PreviewMode.target;
        this.connections = [];
        this.onPreviewIndexChanged = onPreviewIndexChangedCallback;
        this.defaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/no_img.png'));
        this.transparentImage = new Ui.Pixmap(import.meta.resolve('./Resources/transparent.png'));
    }
    create(parent) {
        const widget = new Ui.Widget(parent);
        widget.setFixedHeight(563);
        widget.setFixedWidth(421);
        widget.autoFillBackground = true;
        widget.backgroundRole = Ui.ColorRole.Mid;
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
        leftArrow.onHover.connect((hovered) => {
            leftArrow.pixmap = hovered ? leftArrowHoveredImage : leftArrowDefaultImage;
        });
        layout.addWidgetWithStretch(leftArrow, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
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
        this.generatingPreviewLabel.text = '<center>' + 'Generating previews...<br>At this time, generations can take an hour or two due to<br>the technical limitations and high demand.<br>We are working to improve this time.<br><br>You can close this window and return later' + '</center>';
        this.generatingPreviewLabel.setFixedWidth(350);
        this.generatingPreviewLabel.setFixedHeight(90);
        this.generatingPreviewLabel.move(35, 298);
        this.generatingPreviewLabel.foregroundRole = Ui.ColorRole.BrightText;
        this.generatingPreviewLabel.visible = false;
        this.ctaButton = new Ui.ImageView(this.imageView);
        this.ctaButton.setFixedWidth(36);
        this.ctaButton.setFixedHeight(28);
        this.ctaButton.scaledContents = true;
        this.ctaButton.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/cta_button.svg'));
        this.ctaButton.move(264, 504);
        this.ctaButton.visible = false;
        this.connections.push(this.ctaButton.onClick.connect(() => {
            if (this.mode === PreviewMode.target) {
                this.mode = PreviewMode.source;
            }
            else {
                this.mode = PreviewMode.target;
            }
            this.setPreviewImage();
        }));
        layout.addWidgetWithStretch(this.imageView, 0, Ui.Alignment.AlignCenter);
        const rightArrow = new Ui.ImageView(widget);
        rightArrow.setFixedWidth(36);
        rightArrow.setFixedHeight(36);
        rightArrow.scaledContents = true;
        rightArrow.responseHover = true;
        const rightArrowDefaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/rightArrow.svg'));
        const rightArrowHoveredImage = new Ui.Pixmap(import.meta.resolve('./Resources/rightArrow_h.svg'));
        rightArrow.pixmap = rightArrowDefaultImage;
        rightArrow.onHover.connect((hovered) => {
            rightArrow.pixmap = hovered ? rightArrowHoveredImage : rightArrowDefaultImage;
        });
        layout.addWidgetWithStretch(rightArrow, 0, Ui.Alignment.AlignRight | Ui.Alignment.AlignCenter);
        this.connections.push(leftArrow.onClick.connect(() => {
            this.onLeftArrowClicked();
        }));
        this.connections.push(rightArrow.onClick.connect(() => {
            this.onRightArrowClicked();
        }));
        this.leftArrow = leftArrow;
        this.rightArrow = rightArrow;
        this.setDefaultState();
        widget.layout = layout;
        return widget;
    }
    setDefaultState() {
        if (!this.imageView || !this.leftArrow || !this.rightArrow || !this.spinner || !this.ctaButton || !this.generatingPreviewLabel) {
            return;
        }
        this.imageView.setFixedHeight(262);
        this.imageView.setFixedWidth(262);
        this.imageView.radius = 0;
        this.imageView.pixmap = this.defaultImage;
        this.leftArrow.visible = false;
        this.rightArrow.visible = false;
        this.spinner.visible = false;
        this.generatingPreviewLabel.visible = false;
        this.ctaButton.visible = false;
    }
    setPreviewState(id) {
        if (!this.imageView || !this.leftArrow || !this.rightArrow || !this.spinner || !this.ctaButton || !this.generatingPreviewLabel) {
            return;
        }
        this.id = id;
        this.imageView.setFixedHeight(540);
        this.imageView.setFixedWidth(308);
        this.imageView.radius = 16;
        this.imageView.pixmap = this.transparentImage;
        this.leftArrow.visible = true;
        this.rightArrow.visible = true;
        this.spinner.visible = true;
        this.generatingPreviewLabel.visible = false;
        this.ctaButton.visible = false;
        this.previewId = 0;
        this.mode = PreviewMode.target;
        this.onPreviewIndexChanged(this.id, this.previewId);
    }
    setWaitingState(id) {
        if (!this.imageView || !this.spinner || !this.ctaButton || !this.generatingPreviewLabel || !this.leftArrow || !this.rightArrow) {
            return;
        }
        this.id = id;
        this.imageView.pixmap = this.transparentImage;
        this.leftArrow.visible = false;
        this.rightArrow.visible = false;
        this.spinner.visible = true;
        this.generatingPreviewLabel.visible = true;
        this.ctaButton.visible = false;
    }
    setPreviewImages(previewImages, prevPreviewId, previewCnt) {
        this.previewId = this.mod(this.previewId, previewCnt);
        if (!this.imageView || !this.spinner || this.previewId !== prevPreviewId || !this.ctaButton || !this.generatingPreviewLabel) {
            return;
        }
        this.previewImages = previewImages;
        this.spinner.visible = false;
        this.generatingPreviewLabel.visible = false;
        this.ctaButton.visible = true;
        this.setPreviewImage();
    }
    getId() {
        return this.id;
    }
    setPreviewImage() {
        if (!this.imageView || !this.previewImages) {
            return;
        }
        if (this.mode == PreviewMode.target) {
            this.imageView.pixmap = new Ui.Pixmap(this.previewImages.targetImagePath);
        }
        else {
            const pixmap = new Ui.Pixmap(this.previewImages.sourceImagePath);
            pixmap.crop(new Ui.Rect(37, 0, 438, 768));
            this.imageView.pixmap = pixmap;
        }
    }
    previewIndexChanged() {
        if (!this.imageView || !this.spinner || !this.ctaButton) {
            return;
        }
        this.imageView.pixmap = this.transparentImage;
        this.spinner.visible = true;
        this.ctaButton.visible = false;
        this.onPreviewIndexChanged(this.id, this.previewId);
    }
    onLeftArrowClicked() {
        this.previewId--;
        this.previewIndexChanged();
    }
    onRightArrowClicked() {
        this.previewId++;
        this.previewIndexChanged();
    }
    mod(a, b) {
        return ((a % b) + b) % b;
    }
}
