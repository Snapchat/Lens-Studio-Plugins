import * as Ui from "LensStudio:Ui";
import { Widget } from "../common/widgets/widget.js";
import { ImageView } from "../common/widgets/imageView.js";
import { VBoxLayout } from "../common/layouts/vBoxLayout.js";
import { HBoxLayout } from "../common/layouts/hBoxLayout.js";
var States;
(function (States) {
    States[States["Default"] = 0] = "Default";
    States[States["Processing"] = 1] = "Processing";
    States[States["Failed"] = 2] = "Failed";
})(States || (States = {}));
export class GridTile extends Widget {
    constructor(parent, curId) {
        super(parent);
        this.wasGenerated = false;
        this.isClickableWhenSelected = false;
        this.type = "";
        this.isRemoved = false;
        this.onClickCallback = () => { };
        this.onRemoveCallback = () => { };
        this.id = curId;
        this.description = "";
        this.minWidth = 110;
        this.minHeight = 160;
        this._hasPreview = false;
        this.isSelected = false;
        this.setMinimumWidth(this.minWidth);
        this.setMinimumHeight(this.minHeight);
        this.frame = new ImageView(this.__widget__);
        this.frame.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.frame.scaledContents = true;
        this.frame.responseHover = true;
        this.frame.setMinimumWidth(110);
        this.frame.setMinimumHeight(160);
        this.frame.onHover.connect((hovered) => this.handleHover(hovered));
        this.frame.onClick.connect(() => this.handleClick());
        this.onResize.connect((width, height) => this.handleResize(width, height));
        const layout = new VBoxLayout();
        layout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        layout.spacing = 0;
        this.curState = States.Processing;
        this.bottomWidget = new Widget(this.frame);
        const bottomLayout = new HBoxLayout();
        bottomLayout.setContentsMargins(0, 0, 0, 0);
        this.bottomWidget.layout = bottomLayout;
        this.loading = new Ui.ProgressIndicator(this.frame.toNativeWidget());
        this.loading.start();
        this.loading.visible = true;
        this.progressPercentLabel = new Ui.Label(this.bottomWidget.toNativeWidget());
        this.progressPercentLabel.text = "0%";
        this.progressPercentLabel.foregroundRole = Ui.ColorRole.BrightText;
        this.progressPercentLabel.visible = false;
        bottomLayout.addNativeWidget(this.loading);
        bottomLayout.addNativeWidget(this.progressPercentLabel);
        bottomLayout.addStretch(1);
        this.movieView = new Ui.MovieView(this.frame.toNativeWidget());
        this.movieView.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.movieView.scaledContents = true;
        this.movieView.visible = false;
        this.movieView.onClick.connect(() => this.handleClick());
        this.imageView = new Ui.ImageView(this.frame.toNativeWidget());
        this.imageView.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.imageView.scaledContents = true;
        this.imageView.visible = false;
        this.imageView.onClick.connect(() => this.handleClick());
        layout.addWidgetWithStretch(this.bottomWidget, 0, Ui.Alignment.AlignBottom);
        layout.addNativeWidgetWithStretch(this.movieView, 0, Ui.Alignment.AlignLeft);
        layout.addNativeWidget(this.imageView);
        this.frame.layout = layout;
    }
    set background(image) {
        this.defaultImage = image;
        this.frame.pixmap = image;
    }
    set hoveredBackground(image) {
        this.hoveredImage = image;
    }
    set errorBackground(image) {
        this.errorImage = image;
    }
    handleHover(hovered) {
        if (this.removeButton && this.curState !== States.Processing) {
            this.removeButton.visible = hovered;
        }
        if (!this.hoveredImage) {
            return;
        }
        if (this.curState === States.Processing) {
            this.frame.pixmap = hovered ? this.hoveredImage : this.defaultImage;
        }
        else if (this.curState === States.Default) {
            this.frame.pixmap = (hovered || this.isSelected) ? this.hoveredImage : this.defaultImage;
            this.movieView.animated = hovered;
        }
    }
    addPreview(path) {
        this.setDefaultState();
        const movie = new Ui.Movie(path);
        movie.resize(220, 320);
        this.movieView.movie = movie;
        this.movieView.visible = true;
        this.movieView.enabled = true;
        this.movieView.raise();
        if (this.removeButton) {
            this.removeButton.raise();
        }
    }
    addBodyMorphPreview(path) {
        this.setDefaultState();
        const movie = new Ui.Movie(path);
        movie.resize(106, 106);
        this.movieView.movie = movie;
        this.movieView.visible = true;
        this.movieView.enabled = true;
        this.movieView.raise();
        this.movieView.setFixedHeight(106);
        this.movieView.setFixedWidth(106);
        this.frame.layout.setContentsMargins(2, 2, 2, 2);
    }
    handleResize(width, height) {
        this.frame.setFixedWidth(width);
        this.frame.setFixedHeight(height);
        if (this.removeButton) {
            this.removeButton.move(width - 32, 8);
        }
    }
    handleClick() {
        if (this.curState === States.Default && (!this.isSelected || this.isClickableWhenSelected)) {
            this.onClickCallback(this.id);
        }
    }
    setDefaultState() {
        this.curState = States.Default;
        this.bottomWidget.visible = false;
    }
    addOnClickCallback(callback) {
        this.onClickCallback = callback;
    }
    addOnRemoveCallback(callback) {
        this.onRemoveCallback = callback;
    }
    addDescription(newDescription) {
        this.description = newDescription;
    }
    getDescription() {
        return this.description;
    }
    select() {
        this.isSelected = true;
        if (this.hoveredImage) {
            this.frame.pixmap = this.hoveredImage;
        }
    }
    deselect() {
        this.isSelected = false;
        this.frame.pixmap = this.defaultImage;
    }
    getId() {
        return this.id;
    }
    onFailed() {
        this.curState = States.Failed;
        this.frame.pixmap = this.errorImage;
        this.bottomWidget.visible = false;
    }
    showCheckmarkOverlay() {
        this.imageView.visible = true;
    }
    hideCheckmarkOverlay() {
        this.imageView.visible = false;
    }
    resetContentsMargins() {
        this.frame.layout.setContentsMargins(0, 0, 0, 0);
    }
    setType(type) {
        this.type = type;
    }
    getType() {
        return this.type;
    }
    addRemoveButton() {
        this.removeButton = new Ui.PushButton(this.frame.toNativeWidget());
        this.removeButton.setFixedWidth(24);
        this.removeButton.setFixedHeight(20);
        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        this.removeButton.layout = layout;
        const trashCanImageView = new Ui.ImageView(this.removeButton);
        trashCanImageView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/trashCan.svg'));
        trashCanImageView.setFixedHeight(16);
        trashCanImageView.setFixedWidth(16);
        layout.addWidgetWithStretch(trashCanImageView, 0, Ui.Alignment.AlignCenter);
        this.removeButton.visible = false;
        const items = [this.removeButton, trashCanImageView];
        items.forEach((item) => {
            item.onClick.connect(() => {
                this.isRemoved = true;
                this.onRemoveCallback(this.id);
            });
        });
    }
    setProgress(value) {
        this.progressPercentLabel.visible = true;
        this.progressPercentLabel.text = Math.floor(value) + "%";
    }
    get removed() {
        return this.isRemoved;
    }
    get selected() {
        return this.isSelected;
    }
    set selected(selected) {
        this.isSelected = selected;
    }
    get hasPreview() {
        return this._hasPreview;
    }
    set hasPreview(value) {
        this._hasPreview = value;
    }
    set radius(radius) {
        this.frame.radius = radius;
    }
    set clickableIfSelected(value) {
        this.isClickableWhenSelected = value;
    }
    set checkmarkImage(image) {
        this.imageView.pixmap = image;
    }
    get isGenerated() {
        return this.wasGenerated;
    }
    set isGenerated(value) {
        this.wasGenerated = value;
    }
}
