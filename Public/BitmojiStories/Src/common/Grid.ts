import { Event, Unsubscribe } from "LensStudio:Event.js";
import {
    Widget,
    CalloutFrame,
    ImageView,
    Pixmap,
    StackedLayout,
    StackingMode,
    GridLayout,
    BoxLayout,
    Direction,
    VerticalScrollArea,
    SizePolicy,
    Alignment,
    ClearLayoutBehavior,
    Color,
} from "LensStudio:Ui";

function createColor(r: number, g: number, b: number, a: number): Color {
    const color = new Color();
    color.red = r;
    color.green = g;
    color.blue = b;
    color.alpha = a;
    return color;
}

const TRANSPARENT = createColor(0, 0, 0, 0);
const HIGHLIGHT = createColor(8, 113, 196, 255);

export interface GridItem {
    index: number;
    preview: string;
    cachedPixmap?: Pixmap;
    [key: string]: unknown;
}

export class GridTile<T extends GridItem> {
    readonly widget: Widget;
    readonly onClick = new Event<T>();

    private frame: CalloutFrame;
    private imageView: ImageView;
    private clickConnection: Editor.ScopedConnection;
    private _item: T | null = null;
    private _selected = false;

    constructor(parent: Widget) {
        this.widget = new Widget(parent);

        this.frame = new CalloutFrame(this.widget);
        this.frame.lineWidth = 1;
        this.frame.setForegroundColor(TRANSPARENT);

        this.imageView = new ImageView(this.frame);
        this.imageView.scaledContents = true;
        this.imageView.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);

        const frameLayout = new StackedLayout();
        frameLayout.stackingMode = StackingMode.StackAll;
        frameLayout.setContentsMargins(2, 2, 2, 2);
        frameLayout.addWidget(this.imageView);
        this.frame.layout = frameLayout;

        const touchZone = new ImageView(this.widget);
        touchZone.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);
        touchZone.scaledContents = true;
        touchZone.responseHover = true;
        this.clickConnection = touchZone.onClick.connect(() => {
            console.log("Tile clicked:", this._item);
            if (this._item) (this.onClick as Event<unknown>).trigger(this._item);
        });

        const stackLayout = new StackedLayout();
        stackLayout.stackingMode = StackingMode.StackAll;
        stackLayout.setContentsMargins(0, 0, 0, 0);
        stackLayout.addWidget(touchZone);
        stackLayout.addWidget(this.frame);
        this.widget.layout = stackLayout;
    }

    set data(item: T) {
        this._item = item;
        this.imageView.pixmap = item.cachedPixmap ?? new Pixmap(new Editor.Path(item.preview));
    }

    get data(): T | null {
        return this._item;
    }

    set selected(value: boolean) {
        this._selected = value;
        this.frame.setForegroundColor(value ? HIGHLIGHT : TRANSPARENT);
    }

    get selected(): boolean {
        return this._selected;
    }
}

export class Grid<T extends GridItem> {
    readonly widget: Widget;
    readonly onTileClicked = new Event<T>();

    private tiles: GridTile<T>[] = [];
    private gridWidget: Widget;
    private gridLayout: GridLayout;
    private spacer: Widget;
    private minTileWidth: number;
    private maxTileWidth: number;
    private tileAspect: number;
    private unsubs: Unsubscribe[] = [];

    constructor(parent: Widget, minTileWidth = 120, maxTileWidth = 140, aspectRatio = 1.5) {
        this.minTileWidth = minTileWidth;
        this.maxTileWidth = maxTileWidth;
        this.tileAspect = aspectRatio;

        this.widget = new Widget(parent);
        this.widget.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);
        this.widget.setMinimumWidth(minTileWidth);
        this.widget.setMinimumHeight(minTileWidth * this.tileAspect);

        this.gridWidget = new Widget(this.widget);
        this.gridWidget.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);

        this.gridLayout = new GridLayout();
        this.gridLayout.spacing = 0;
        this.gridLayout.setContentsMargins(0, 0, 0, 0);
        this.gridWidget.layout = this.gridLayout;

        const scrollArea = new VerticalScrollArea(this.widget);
        scrollArea.setContentsMargins(0, 0, 0, 0);
        scrollArea.setWidget(this.gridWidget);

        this.spacer = new Widget(this.gridWidget);
        this.spacer.setSizePolicy(SizePolicy.Policy.Expanding, SizePolicy.Policy.Expanding);

        const outerLayout = new BoxLayout();
        outerLayout.setDirection(Direction.TopToBottom);
        outerLayout.setContentsMargins(0, 0, 0, 0);
        outerLayout.addWidget(scrollArea);
        this.widget.layout = outerLayout;

        this.widget.onResize.connect(() => this.arrangeLayout());
    }

    setItems(items: T[]): void {
        for (const unsub of this.unsubs) unsub();
        this.unsubs = [];
        this.tiles = [];

        for (const item of items) {
            const tile = new GridTile<T>(this.gridWidget);
            tile.data = item;
            this.unsubs.push((tile.onClick as Event<GridItem>).add((pose) => (this.onTileClicked as Event<unknown>).trigger(pose)));
            this.tiles.push(tile);
        }
        this.arrangeLayout();
    }

    selectByIndex(index: number): void {
        for (const tile of this.tiles) {
            tile.selected = tile.data?.index === index;
        }
    }

    clearSelection(): void {
        for (const tile of this.tiles) {
            tile.selected = false;
        }
    }

    private arrangeLayout(): void {
        const galleryWidth = this.widget.width || this.minTileWidth;
        const tilesPerRow = Math.max(1, Math.floor(galleryWidth / this.minTileWidth));
        const tileWidth =
            this.tiles.length <= tilesPerRow
                ? Math.min(Math.floor(galleryWidth / Math.max(1, this.tiles.length)), this.maxTileWidth)
                : Math.floor(galleryWidth / tilesPerRow);
        const tileHeight = tileWidth * this.tileAspect;

        this.gridLayout.clear(ClearLayoutBehavior.KeepClearedWidgets);

        let row = 0;
        let col = 0;
        for (const tile of this.tiles) {
            if (col === 0) {
                this.gridLayout.setRowStretch(row, 0);
            }
            tile.widget.setFixedWidth(tileWidth);
            tile.widget.setFixedHeight(tileHeight);
            this.gridLayout.addWidgetAt(tile.widget, row, col, Alignment.AlignCenter);
            col++;
            if (col >= tilesPerRow) {
                col = 0;
                row++;
            }
        }
        this.gridLayout.addWidgetAt(this.spacer, row + 1, 0, Alignment.Default);
        this.gridLayout.setRowStretch(row + 1, 1);
    }

    deinit(): void {
        for (const unsub of this.unsubs) unsub();
        this.unsubs = [];
        this.onTileClicked.clear();
    }
}
