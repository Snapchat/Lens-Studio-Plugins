// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import * as MultimediaWidgets from 'LensStudio:MultimediaWidgets';
import {MediaState} from 'LensStudio:MultimediaWidgets';
import {deleteAnimatorById} from "./api";

export class GalleryItem {

    private frame: Ui.ImageView;
    private frame1: Ui.ImageView;
    private border: Ui.ImageView;
    private tileWidth: number = 122;
    private tileHeight: number = 122;
    private videoWidget: MultimediaWidgets.VideoWidget;
    private mediaPlayer: MultimediaWidgets.MediaPlayer;
    private previewPath: Editor.Path | null = null
    private connections: Array<any> = [];
    private onClickCallback: Function = () => {};
    private onRemoveCallback: Function =  () => {};
    private itemData: any = {};
    private isFailed: boolean = false;
    private isRemoved: boolean = false;

    constructor(parent: Ui.Widget) {
        this.frame = new Ui.ImageView(parent);
        this.frame.setFixedWidth(this.tileWidth);
        this.frame.setFixedHeight(this.tileHeight);
        this.frame.scaledContents = true;
        this.frame.responseHover = true;
        this.frame.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/black_tile.svg'));

        this.border = new Ui.ImageView(this.frame);
        this.border.scaledContents = true;
        this.border.setFixedWidth(this.tileWidth);
        this.border.setFixedHeight(this.tileHeight);
        this.border.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.border.setContentsMargins(0, 0, 0, 0);
        this.border.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/full_frame_hover.svg'));
        this.border.visible = false;

        this.videoWidget = new MultimediaWidgets.VideoWidget(this.frame);
        this.videoWidget.setFixedWidth(116);
        this.videoWidget.setFixedHeight(116);
        this.videoWidget.move(3, 3);
        this.videoWidget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.videoWidget.visible = true;

        this.mediaPlayer = new MultimediaWidgets.MediaPlayer();

        this.connections.push(this.frame.onHover.connect((hovered) => {
            if (!this.isFailed) {
                return;
            }

            this.border.visible = hovered;
        }));

        this.connections.push(this.mediaPlayer.onStateChanged.connect((newState: any) => {
            if (newState === MediaState.PlayingState) {
                const timeout = setTimeout(() => {
                    this.mediaPlayer.pause();
                }, 200);

                this.connections.push(timeout);
            }
        }))

        this.connections.push(this.frame.onClick.connect(() => {
            if (this.isFailed) {
                return;
            }
            if (this.itemData.previewPath) {
                this.onClickCallback(this.itemData);
            }
        }))
    }

    setPreview(path: string) {
        this.mediaPlayer.setMedia(path);
        this.mediaPlayer.setVideoOutput(this.videoWidget);
        this.mediaPlayer.play();

        this.previewPath = path;
        this.itemData.previewPath = path;
    }

    setFailed() {
        this.isFailed = true;
        this.frame.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/default_tile.svg'));
        this.videoWidget.visible = false;

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
        layout.addWidgetWithStretch(trashCanImageView, 0, Ui.Alignment.AlignCenter);

        const errorImage = new Ui.ImageView(this.frame);
        errorImage.setFixedWidth(16);
        errorImage.setFixedHeight(16);
        errorImage.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/error.svg'));

        errorImage.move(8, 98);

        const items = [removeButton, trashCanImageView];
        items.forEach((item) => {
            item.onClick.connect(() => {
                this.isRemoved = true;
                deleteAnimatorById(this.itemData.id);
                this.onRemoveCallback();
            });
        })
    }

    setOnClickCallback(callback: Function) {
        this.onClickCallback = callback;
    }

    setOnRemoveCallback(callback: Function) {
        this.onRemoveCallback = callback;
    }

    setItemData(data: any) {
        this.itemData = data;
        if (this.previewPath) {
            this.itemData.previewPath = this.previewPath;
        }
    }

    getId(): string {
        return this.itemData.id;
    }

    get removed() {
        return this.isRemoved;
    }

    get widget() {
        return this.frame;
    }
}