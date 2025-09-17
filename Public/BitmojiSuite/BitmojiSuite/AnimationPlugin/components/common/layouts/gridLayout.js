// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { Layout } from "./layout.js";
export class GridLayout extends Layout {
    constructor() {
        super();
        this.__layout__ = new Ui.GridLayout();
    }
    addLayout(layout, row, column, alignment) {
        this.__layout__.addLayout(layout.toLayout(), row, column, alignment);
    }
    addWidgetAt(widget, row, column, alignment) {
        this.__layout__.addWidgetAt(widget.toNativeWidget(), row, column, alignment);
    }
    addWidgetWithSpan(widget, fromRow, fromColumn, rowSpan, columnSpan, alignment) {
        this.__layout__.addWidgetWithSpan(widget.toNativeWidget(), fromRow, fromColumn, rowSpan, columnSpan, alignment);
    }
    getColumnMinimumWidth(column) {
        return this.__layout__.getColumnMinimumWidth(column);
    }
    getColumnStretch(column) {
        return this.__layout__.getColumnStretch(column);
    }
    getRowMinimumHeight(row) {
        return this.__layout__.getRowMinimumHeight(row);
    }
    getRowStretch(row) {
        return this.__layout__.getRowStretch(row);
    }
    setColumnMinimumWidth(column, width) {
        return this.__layout__.setColumnMinimumWidth(column, width);
    }
    setColumnStretch(column, stretch) {
        return this.__layout__.setColumnMinimumWidth(column, stretch);
    }
    setRowMinimumHeight(row, height) {
        return this.__layout__.setRowMinimumHeight(row, height);
    }
    setRowStretch(row, stretch) {
        return this.__layout__.setRowStretch(row, stretch);
    }
}
