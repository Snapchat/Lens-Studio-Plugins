import * as Ui from "LensStudio:Ui";
import { Layout } from "./layout.js";
export class GridLayout extends Layout {
    constructor() {
        super();
        this.__layout__ = new Ui.GridLayout();
    }
    addLayout(layout: any, row: any, column: any, alignment: any) {
        this.__layout__.addLayout(layout.toLayout(), row, column, alignment);
    }
    addWidgetAt(widget: any, row: any, column: any, alignment: any) {
        this.__layout__.addWidgetAt(widget.toNativeWidget(), row, column, alignment);
    }
    addWidgetWithSpan(widget: any, fromRow: any, fromColumn: any, rowSpan: any, columnSpan: any, alignment: any) {
        this.__layout__.addWidgetWithSpan(widget.toNativeWidget(), fromRow, fromColumn, rowSpan, columnSpan, alignment);
    }
    getColumnMinimumWidth(column: any) {
        return this.__layout__.getColumnMinimumWidth(column);
    }
    getColumnStretch(column: any) {
        return this.__layout__.getColumnStretch(column);
    }
    getRowMinimumHeight(row: any) {
        return this.__layout__.getRowMinimumHeight(row);
    }
    getRowStretch(row: any) {
        return this.__layout__.getRowStretch(row);
    }
    setColumnMinimumWidth(column: any, width: any) {
        return this.__layout__.setColumnMinimumWidth(column, width);
    }
    setColumnStretch(column: any, stretch: any) {
        return this.__layout__.setColumnMinimumWidth(column, stretch);
    }
    setRowMinimumHeight(row: any, height: any) {
        return this.__layout__.setRowMinimumHeight(row, height);
    }
    setRowStretch(row: any, stretch: any) {
        return this.__layout__.setRowStretch(row, stretch);
    }
}
