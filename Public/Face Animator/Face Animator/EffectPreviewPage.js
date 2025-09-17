// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { ColorRole } from "LensStudio:Ui";
import * as MultimediaWidgets from 'LensStudio:MultimediaWidgets';
import { MediaState } from 'LensStudio:MultimediaWidgets';
export class EffectPreviewPage {
    constructor(parent, onReturnCallback) {
        this.connections = [];
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
        const uploadWidget = this.createEffectPreviewWidget(widget, onReturnCallback);
        layout.addWidget(uploadWidget);
        widget.layout = layout;
        this.mainWidget = widget;
    }
    createEffectPreviewWidget(parent, onReturnCallback) {
        const widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding, Ui.Sizes.Padding);
        layout.spacing = 16;
        // Header
        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        const arrow = new Ui.ImageView(widget);
        arrow.responseHover = true;
        const defaultImage = new Ui.Pixmap(import.meta.resolve('./Resources/arrow.svg'));
        const hoveredImage = new Ui.Pixmap(import.meta.resolve('./Resources/arrow_h.svg'));
        arrow.pixmap = defaultImage;
        this.connections.push(arrow.onClick.connect(() => {
            onReturnCallback();
        }));
        this.connections.push(arrow.onHover.connect((hovered) => {
            arrow.pixmap = hovered ? hoveredImage : defaultImage;
        }));
        const header = new Ui.Label(parent);
        header.text = "Effect Preview";
        header.fontRole = Ui.FontRole.Title;
        header.foregroundRole = Ui.ColorRole.BrightText;
        headerLayout.addWidgetWithStretch(arrow, 0, Ui.Alignment.AlignLeft);
        headerLayout.addStretch(0);
        headerLayout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignCenter);
        headerLayout.addStretch(0);
        layout.addLayout(headerLayout);
        const contentWidget = new Ui.Widget(widget);
        contentWidget.setContentsMargins(0, 0, 0, 0);
        const contentLayout = new Ui.BoxLayout();
        contentLayout.setDirection(Ui.Direction.TopToBottom);
        contentLayout.setContentsMargins(8, 8, 8, 8);
        contentWidget.layout = contentLayout;
        const guidelinesLink = 'https://developers.snap.com/lens-studio/features/genai-suite/face-animator';
        const guideUrlString = Ui.getUrlString('guidelines', guidelinesLink);
        const guideLinesText = 'Check our ' + guideUrlString + ' for examples, prompting best practices.';
        const guideLines = this.createCalloutWidget(widget, guideLinesText);
        contentLayout.addWidgetWithStretch(guideLines, 0, Ui.Alignment.AlignTop);
        // Created on label
        const createdOnLayout = new Ui.BoxLayout();
        createdOnLayout.setDirection(Ui.Direction.LeftToRight);
        createdOnLayout.setContentsMargins(0, Ui.Sizes.Padding, 0, 0);
        const label = new Ui.Label(widget);
        label.text = 'Created on';
        createdOnLayout.addWidget(label);
        const lockedBox = new Ui.ImageView(widget);
        lockedBox.setFixedWidth(164);
        lockedBox.setFixedHeight(20);
        lockedBox.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/locked_box.svg'));
        const lockedBoxLayout = new Ui.BoxLayout();
        lockedBoxLayout.setContentsMargins(Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding, Ui.Sizes.HalfPadding);
        lockedBox.layout = lockedBoxLayout;
        const lockedLabel = new Ui.Label(lockedBox);
        lockedLabel.wordWrap = true;
        lockedLabel.setFixedWidth(152);
        lockedLabel.foregroundRole = Ui.ColorRole.ToolTipText;
        this.lockedLabel = lockedLabel;
        lockedBoxLayout.addWidgetWithStretch(lockedLabel, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);
        createdOnLayout.addStretch(0);
        createdOnLayout.addWidgetWithStretch(lockedBox, 0, Ui.Alignment.AlignCenter);
        createdOnLayout.addStretch(0);
        contentLayout.addLayout(createdOnLayout);
        layout.addWidget(contentWidget);
        // Video Preview
        this.videoWidget = new MultimediaWidgets.VideoWidget(widget);
        this.videoWidget.setFixedWidth(288);
        this.videoWidget.setFixedHeight(288);
        this.videoWidget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.mediaPlayer = new MultimediaWidgets.MediaPlayer();
        this.connections.push(this.mediaPlayer.onStateChanged.connect((newState) => {
            //@ts-ignore
            if (newState === MediaState.StoppedState) {
                this.mediaPlayer.play();
            }
        }));
        layout.addWidgetWithStretch(this.videoWidget, 0, (Ui.Alignment.AlignCenter));
        layout.addStretch(1);
        widget.layout = layout;
        return widget;
    }
    setPreview(path) {
        this.mediaPlayer.stop();
        this.mediaPlayer.setMedia(path);
        this.mediaPlayer.setVideoOutput(this.videoWidget);
        this.mediaPlayer.play();
    }
    setDate(newDate) {
        if (this.lockedLabel) {
            this.lockedLabel.text = this.convertDate(newDate);
        }
    }
    get widget() {
        return this.mainWidget;
    }
    convertDate(inputDate) {
        const dateObj = new Date(inputDate);
        const outputDate = dateObj.getFullYear() + '/' +
            ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' +
            ('0' + dateObj.getDate()).slice(-2);
        return outputDate;
    }
    createCalloutWidget(parent, text) {
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
    createColor(r, g, b, a) {
        const color = new Ui.Color();
        color.red = r;
        color.green = g;
        color.blue = b;
        color.alpha = a;
        return color;
    }
    createInfoIcon(parent) {
        return this.createIcon(parent, new Ui.Pixmap(import.meta.resolve('./Resources/info.svg')));
    }
    createIcon(parent, iconImage) {
        const imageView = new Ui.ImageView(parent);
        imageView.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        imageView.setFixedWidth(Ui.Sizes.IconSide);
        imageView.setFixedHeight(Ui.Sizes.IconSide);
        imageView.scaledContents = true;
        imageView.pixmap = iconImage;
        return imageView;
    }
}
