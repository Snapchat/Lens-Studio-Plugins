// @ts-nocheck
import { ImageView } from "LensStudio:Ui";
import * as Ui from "LensStudio:Ui";
export class TransitionTile {
    constructor(parent) {
        this.width = 40;
        this.height = 32;
        this.isSelected = false;
        this.onClickCallback = () => { };
        this.onRemoveCallback = () => { };
        this.defaultImage = new Ui.Pixmap(import.meta.resolve("../../Menu/Resources/transitionPreview.svg"));
        this.hoveredImage = new Ui.Pixmap(import.meta.resolve("../../Menu/Resources/transitionPreview_h.svg"));
        this.transparentImage = new Ui.Pixmap(import.meta.resolve("../../Menu/Resources/transparent.png"));
        this.deleteImage = new Ui.Pixmap(import.meta.resolve("../../Menu/Resources/delete.svg"));
        this.frame = new ImageView(parent);
        this.frame.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.frame.scaledContents = true;
        this.frame.responseHover = true;
        this.frame.setFixedHeight(this.height);
        this.frame.setFixedWidth(this.width);
        this.frame.pixmap = this.defaultImage;
        this.imageView = new ImageView(this.frame);
        this.imageView.setFixedHeight(this.height - 2);
        this.imageView.setFixedWidth(this.width - 2);
        this.imageView.move(1, 1);
        this.imageView.scaledContents = true;
        this.imageView.visible = false;
        this.frame.onHover.connect((hovered) => this.handleHover(hovered));
        [this.frame, this.imageView].forEach((item) => {
            item.onClick.connect(() => {
                if (!this.isSelected) {
                    this.handleClick();
                }
                else {
                    this.remove();
                    this.frame.pixmap = this.hoveredImage;
                }
            });
        });
    }
    handleHover(hovered) {
        if (!this.isSelected) {
            this.frame.pixmap = hovered ? this.hoveredImage : this.defaultImage;
        }
        else {
            this.frame.pixmap = hovered ? this.deleteImage : this.hoveredImage;
            this.imageView.visible = !hovered;
        }
    }
    handleClick() {
        this.onClickCallback(this.id);
    }
    remove() {
        this.onRemoveCallback();
    }
    setPreviewImage(path) {
        if (path) {
            this.curPreviewPath = path;
            const pixmap = new Ui.Pixmap(path);
            pixmap.crop(new Ui.Rect(40, 30, 140, 112));
            this.imageView.pixmap = pixmap;
        }
        else {
            this.curPreviewPath = null;
            this.imageView.pixmap = this.transparentImage;
        }
        this.imageView.visible = true;
    }
    select() {
        this.isSelected = true;
        this.frame.pixmap = this.hoveredImage;
    }
    deselect() {
        this.isSelected = false;
        this.frame.pixmap = this.defaultImage;
    }
    reset() {
        this.imageView.pixmap = this.transparentImage;
        this.imageView.visible = false;
        this.deselect();
        this.curPageName = null;
        this.curId = null;
        this.curPreviewPath = null;
    }
    setData(pageName, id) {
        this.curPageName = pageName;
        this.curId = id;
    }
    addOnClickCallback(callback) {
        this.onClickCallback = callback;
    }
    addOnRemoveCallback(callback) {
        this.onRemoveCallback = callback;
    }
    get previewPath() {
        return this.curPreviewPath;
    }
    get pageName() {
        return this.curPageName;
    }
    get id() {
        return this.curId;
    }
    get widget() {
        return this.frame;
    }
}
