import * as Ui from "LensStudio:Ui";
import { StatusIndicator, StatusType } from "./statusIndicator.js";
import { EventDispatcher } from "../../EventDispatcher.js";
import { WidgetFactory } from "../../WidgetFactory.js";
import { highlightColor, opaqueColor } from "./colors.js";

export class GridTile extends EventDispatcher {
    constructor(parent, provider, aspectRatio = 1) {
        super();

        this.marginRatio = 0.05;
        this.minWidth = 144;
        this.minHeight = this.minWidth * aspectRatio;
        this.aspectRatio = aspectRatio;

        this.isSelected = false;

        this.provider = provider;

        this.widget = WidgetFactory.beginWidget(parent).minimumWidth(this.minWidth).minimumHeight(this.minHeight).end();
        this.widget.onResize.connect((width, height) => this.handleResize(width, height));

        this.frame = WidgetFactory.beginCalloutFrame(this.widget).sizePolicy(Ui.SizePolicy.Policy.Expanding).lineWidth(1).foregroundColor(opaqueColor).contentsMargings(0).end();

        this.preview = WidgetFactory.beginResizableImageView(this.frame).contentsMargings(Ui.Sizes.Padding).end();

        this.statusIndicator = new StatusIndicator(this.widget);

        this.touchZone = WidgetFactory.beginResizableImageView(this.widget).end();
        this.touchZone.onHover.connect((hovered) => this.handleHover(hovered));
        this.touchZone.onClick.connect(() => this.handleClick());

        this.frame.layout = WidgetFactory.beginStackedLayout()
            .spacing(0)
            .stackingMode(Ui.StackingMode.StackAll)
            .addWidget(this.preview)
            .end();

        this.widget.layout = WidgetFactory.beginStackedLayout()
            .contentsMargings(0)
            .spacing(0)
            .stackingMode(Ui.StackingMode.StackAll)
            .addWidget(this.touchZone)
            .addWidget(this.statusIndicator.widget)
            .addWidget(this.frame)
            .end();
    }

    updateProvider(provider) {
        this.provider = provider;
        this.data = this.data;
    }

    set data(data) {
        this.preview.pixmap = null;
        this.statusIndicator.status = StatusType.LOADING;
        this.item = data;

        this.provider.getPreviewImage(this.item).then((pixmap) => {
            pixmap.aspectRatioMode = Ui.AspectRatioMode.KeepAspectRatio;
            this.statusIndicator.status = StatusType.NONE;
            this.preview.pixmap = pixmap;
            this.handleResize(this.widget.width, this.widget.height);
        });
    }

    refresh() {
        this.data = this.data;
    }

    get data() {
        return this.item;
    }

    set selected(value) {
        this.isSelected = value;

        if (this.frame.isNull) {
            return;
        }

        if (this.isSelected) {
            this.frame.setForegroundColor(highlightColor);
        } else {
            this.frame.setForegroundColor(opaqueColor);
        }
    }

    get selected() {
        return this.isSelected;
    }

    handleHover(hovered) {

    }

    handleClick() {
        this.dispatchEvent({ type: GridTile.Clicked, data: this.item });
    }

    handleResize(width, height) {
        // Ensure widget is square
        const size = Math.min(width, height);

        // Set consistent base padding on widget
        const basePadding = size * this.marginRatio;
        this.widget.setContentsMargins(basePadding, basePadding, basePadding, basePadding);

        // Get pixmap dimensions
        const pixmap = this.preview.pixmap;
        if (pixmap) {
            const pixmapWidth = pixmap.width;
            const pixmapHeight = pixmap.height;

            // Calculate aspect ratio
            const aspectRatio = pixmapWidth / pixmapHeight;

            // Calculate available space after widget padding
            const availableWidth = width - 2 * (basePadding + Ui.Sizes.Padding);
            const availableHeight = height - 2 * (basePadding + Ui.Sizes.Padding);

            // Determine how to scale and pad to preserve aspect ratio
            const containerRatio = availableWidth / availableHeight;

            if (containerRatio > aspectRatio) {
                // Container is wider than pixmap: center horizontally
                const scaledWidth = availableHeight * aspectRatio;
                const horizontalPadding = (availableWidth - scaledWidth) / 2;
                this.frame.setContentsMargins(horizontalPadding, 0, horizontalPadding, 0);
            } else {
                // Container is taller than pixmap: center vertically
                const scaledHeight = availableWidth / aspectRatio;
                const verticalPadding = (availableHeight - scaledHeight) / 2;
                this.frame.setContentsMargins(0, verticalPadding, 0, verticalPadding);
            }
        } else {
            // Default frame padding if no pixmap
            this.frame.setContentsMargins(0, 0, 0, 0);
        }
    }
}

GridTile.Clicked = Symbol("Click");
