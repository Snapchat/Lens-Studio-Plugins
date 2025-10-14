// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { deleteAnimatorById } from "./api";
export class GalleryItem {
    constructor(parent) {
        this.tileWidth = 122;
        this.tileHeight = 122;
        this.previewPath = null;
        this.loading = Ui.ProgressIndicator;
        this.connections = [];
        this.onClickCallback = () => { };
        this.onImportClickCallback = () => { };
        this.onRemoveCallback = () => { };
        this.itemData = {};
        this.isFailed = false;
        this.isRemoved = false;
        this.isTrained = false;
        this.frame = new Ui.ImageView(parent);
        this.frame.setFixedWidth(this.tileWidth);
        this.frame.setFixedHeight(this.tileHeight);
        this.frame.scaledContents = true;
        this.frame.responseHover = true;
        this.frame.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/default_tile.svg'));
        const videoView = new Ui.VideoView(this.frame);
        videoView.setFixedWidth(this.tileWidth);
        videoView.setFixedHeight(this.tileHeight);
        videoView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        videoView.radius = 6;
        videoView.muted = true;
        videoView.loopCount = -1;
        videoView.visible = false;
        this.videoView = videoView;
        this.loadingOverlay = new Ui.ImageView(this.frame);
        this.loadingOverlay.setFixedWidth(this.tileWidth);
        this.loadingOverlay.setFixedHeight(this.tileHeight);
        this.loadingOverlay.scaledContents = true;
        this.loadingOverlay.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/grey_rectangle.svg'));
        const spinner = new Ui.ProgressIndicator(this.loadingOverlay);
        spinner.setFixedWidth(32);
        spinner.setFixedHeight(32);
        spinner.start();
        spinner.visible = true;
        spinner.move(47, 47);
        this.movieView = spinner;
        const trainingLabel = new Ui.Label(this.loadingOverlay);
        trainingLabel.text = '<center>' + 'Training<br>in progress' + '</center>';
        trainingLabel.foregroundRole = Ui.ColorRole.BrightText;
        trainingLabel.setFixedWidth(100);
        trainingLabel.move(11, 81);
        this.loadingOverlay.visible = false;
        this.border = new Ui.ImageView(this.frame);
        this.border.scaledContents = true;
        this.border.setFixedWidth(this.tileWidth);
        this.border.setFixedHeight(this.tileHeight);
        this.border.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.border.setContentsMargins(0, 0, 0, 0);
        this.border.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/full_frame_hover.svg'));
        this.border.visible = false;
        this.loading = new Ui.ProgressIndicator(this.frame);
        this.loading.start();
        this.loading.visible = true;
        this.loading.move(6, 100);
        this.connections.push(this.frame.onHover.connect((hovered) => {
            this.border.visible = hovered;
            if (hovered) {
                videoView.play();
            }
            else {
                videoView.pause();
            }
            if (this.isTrained) {
                if (hovered) {
                    this.importButton.text = 'Import';
                    this.importButton.setFixedWidth(72);
                }
                else {
                    this.importButton.text = '';
                    this.importButton.setFixedWidth(32);
                }
            }
        }));
        const items = [this.frame, this.videoView, this.border];
        items.forEach((item) => {
            this.connections.push(item.onClick.connect(() => {
                if (this.isFailed) {
                    return;
                }
                if (this.itemData.previewPath) {
                    this.onClickCallback(this.itemData);
                }
            }));
        });
        this.importButton = new Ui.PushButton(this.frame);
        this.importButton.setIconWithMode(Editor.Icon.fromFile(import.meta.resolve('./Resources/import.svg')), Ui.IconMode.MonoChrome);
        this.importButton.primary = true;
        this.importButton.visible = false;
        this.importButton.move(6, 96);
        this.connections.push(this.importButton.onClick.connect(() => {
            this.onImportClickCallback(this.itemData);
        }));
    }
    setPreview(path) {
        this.videoView.stop();
        this.videoView.visible = true;
        this.videoView.setSource(path);
        this.videoView.play();
        const timeout = setTimeout(() => {
            this.videoView.pause();
        }, 300);
        this.connections.push(timeout);
        this.previewPath = path;
        this.itemData.previewPath = path;
    }
    setFailed() {
        this.isFailed = true;
        this.loading.visible = false;
        this.frame.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/default_tile.svg'));
        this.videoView.visible = false;
        this.border.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/failed_frame_hover.svg'));
        const label = new Ui.Label(this.frame);
        label.text = 'Failed';
        label.move(47, 54);
        label.foregroundRole = Ui.ColorRole.BrightText;
        const removeButton = new Ui.PushButton(this.frame);
        removeButton.setFixedWidth(24);
        removeButton.setFixedHeight(20);
        removeButton.move(90, 8);
        const layout = new Ui.BoxLayout();
        layout.setContentsMargins(0, 0, 0, 0);
        removeButton.layout = layout;
        const trashCanImageView = new Ui.ImageView(removeButton);
        trashCanImageView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/trashCan.svg'));
        trashCanImageView.setFixedHeight(16);
        trashCanImageView.setFixedWidth(16);
        trashCanImageView.scaledContents = true;
        layout.addWidgetWithStretch(trashCanImageView, 0, Ui.Alignment.AlignCenter);
        const errorImage = new Ui.ImageView(this.frame);
        errorImage.setFixedWidth(16);
        errorImage.setFixedHeight(16);
        errorImage.scaledContents = true;
        errorImage.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/error.svg'));
        errorImage.move(8, 98);
        const items = [removeButton, trashCanImageView];
        items.forEach((item) => {
            item.onClick.connect(() => {
                this.isRemoved = true;
                deleteAnimatorById(this.itemData.id);
                this.onRemoveCallback();
            });
        });
    }
    showLoadingOverlay() {
        this.loadingOverlay.visible = true;
        this.loading.visible = false;
    }
    setOnClickCallback(callback) {
        this.onClickCallback = callback;
    }
    setOnImportClickCallback(callback) {
        this.onImportClickCallback = callback;
    }
    setOnRemoveCallback(callback) {
        this.onRemoveCallback = callback;
    }
    setItemData(data) {
        this.itemData = data;
        if (this.previewPath) {
            this.itemData.previewPath = this.previewPath;
        }
    }
    getId() {
        return this.itemData.id;
    }
    setTrained() {
        this.isTrained = true;
        this.importButton.visible = true;
        this.loading.visible = false;
    }
    hideLoading() {
        this.loading.visible = false;
    }
    get removed() {
        return this.isRemoved;
    }
    get widget() {
        return this.frame;
    }
}
