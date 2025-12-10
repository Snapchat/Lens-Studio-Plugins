// @ts-nocheck
import {Widget} from "../components/common/widgets/widget.js";
import * as Ui from "LensStudio:Ui";
import {VBoxLayout} from "../components/common/layouts/vBoxLayout.js";
import {TransitionTile} from "../components/ui/transitionTile.js";
import {ImageView} from "../components/common/widgets/imageView.js";

export class TransitionMenu {

    private mainWidget: Widget | undefined;
    private addButton: ImageView | undefined;
    private tiles: TransitionTile[] = [];
    private maxTileCount = 5;
    private curIdx: number = 0;
    private visibleTilesCount: number = 0;
    private onClickCallback: Function =  () => {};
    private onAddButtonClickCallback: Function =  () => {};
    private onTileRemovedCallback: Function =  () => {};

    constructor() {
    }

    create(parent: Widget): Widget {
        const widget = new Widget(parent);
        this.mainWidget = widget;
        widget.backgroundRole = Ui.ColorRole.Base;
        widget.autoFillBackground = true;
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        widget.setFixedHeight(32);

        const layout = new VBoxLayout()
        layout.setContentsMargins(16, 0, 16, 0);
        layout.spacing = 4;
        layout.setDirection(Ui.Direction.LeftToRight);

        for (let i = 0; i < this.maxTileCount; i++) {
            const transitionTile = new TransitionTile(widget.toNativeWidget());
            layout.addNativeWidgetWithStretch(transitionTile.widget, 0, Ui.Alignment.AlignLeft);
            transitionTile.widget.visible = false;
            this.tiles.push(transitionTile);
        }

        this.tiles[0].select();

        this.tiles.forEach((tile, i) => {
            tile.addOnClickCallback(() => {
                this.resetSelection();
                this.curIdx = i;
                tile.select();
                this.onClickCallback(tile.pageName, tile.id);
            })

            tile.addOnRemoveCallback(() => {
                let needUpdate = true;
                this.visibleTilesCount--;
                for (let j = i; j < this.tiles.length; j++) {
                    if (j + 1 !== this.tiles.length && this.tiles[j + 1].widget.visible) {
                        this.tiles[j].setData(this.tiles[j + 1].pageName, this.tiles[j + 1].id);
                        this.tiles[j].setPreviewImage(this.tiles[j + 1].previewPath);
                    }
                    else {
                        this.tiles[j].reset();
                        this.tiles[j].widget.visible = false;
                        if (this.addButton) {
                            this.addButton.visible = true;
                        }
                        if (i === j) {
                            if (j !== 0) {
                                this.curIdx = j - 1;
                            }
                            else {
                                needUpdate = false;
                                this.reset();
                            }
                        }

                        break;
                    }
                }

                if (needUpdate) {
                    const curTile = this.tiles[this.curIdx];
                    curTile.select();
                    this.onClickCallback(curTile.pageName, curTile.id);
                }

                this.onTileRemovedCallback();
            })
        })

        const addButton = new ImageView(widget.toNativeWidget());
        addButton.setFixedHeight(28);
        addButton.setFixedWidth(28);
        addButton.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/add.svg'));
        addButton.visible = false;
        this.addButton = addButton;
        layout.addWidgetWithStretch(addButton, 0, Ui.Alignment.AlignLeft | Ui.Alignment.AlignCenter);

        addButton.onClick.connect(() => {
            for (let i = 0; i < this.tiles.length; i++) {
                if (this.tiles[i].widget.visible) {
                    this.tiles[i].deselect();
                    continue;
                }

                this.tiles[i].widget.visible = true;
                this.tiles[i].select();
                this.curIdx = i;
                this.visibleTilesCount++;
                if (i === this.tiles.length - 1) {
                    addButton.visible = false;
                }
                this.onAddButtonClickCallback();
                break;
            }
        })

        layout.addStretch(1);

        widget.layout = layout;

        return widget;
    }

    resetSelection() {
        this.tiles.forEach((tile) => {
            tile.deselect();
        })
    }

    selectTile(pageName: string, id: number, path: Editor.Path): void {
        if (this.curIdx === 0) {
            this.tiles[this.curIdx].widget.visible = true;
            this.addButton.visible = true;
        }
        this.tiles[this.curIdx].setData(pageName, id);
        this.tiles[this.curIdx].setPreviewImage(path);
    }

    addOnClickCallback(callback: Function) {
        this.onClickCallback = callback;
    }

    addNewTileCallback(callback: Function) {
        this.onAddButtonClickCallback = callback;
    }

    addOnTileRemovedCallback(callback: Function) {
        this.onTileRemovedCallback = callback;
    }

    getSelectedAnimationsData() {
        const data: any[] = [];
        this.tiles.forEach((tile) => {
            if (tile.widget.visible && tile.pageName !== null && tile.id !== null && tile.id !== undefined && tile.pageName !== undefined) {
                data.push({"pageName": tile.pageName, "id": tile.id});
            }
        })

        return data;
    }

    show() {
        if (this.addButton && this.visibleTilesCount < 5) {
            this.addButton.visible = true;
        }
        if (this.mainWidget) {
            this.mainWidget.visible = true;
        }

        if (this.visibleTilesCount === 0) {
            this.visibleTilesCount = 1;
        }
    }

    reset() {
        this.tiles.forEach((tile) => {
            tile.reset();
            tile.widget.visible = false;
        })

        this.visibleTilesCount = 0;
        this.tiles[0].select();

        this.curIdx = 0;
        if (this.addButton) {
            this.addButton.visible = false;
        }
        if (this.mainWidget) {
            this.mainWidget.visible = false;
        }
    }

    getVisibleTilesCount() {
        return this.visibleTilesCount;
    }
}
