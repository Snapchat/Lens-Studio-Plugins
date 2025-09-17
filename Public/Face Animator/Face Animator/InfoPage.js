// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import { Gallery } from "./Gallery.js";
import { getMyAnimators, downloadFile, deleteAnimatorById, getAnimatorById } from "./api.js";
import * as FileSystem from 'LensStudio:FileSystem';
export class InfoPage {
    constructor(parent, onTileClickedCallback, onItemDataChangedCallback, checkGenerationState, authComponent) {
        this.connections = [];
        this.gridWasUpdated = false;
        this.onItemDataChangedCallback = () => { };
        this.checkGenerationState = () => { };
        this.onNewAnimatorCreated = (animatorData) => {
            this.stackedWidget.currentIndex = 1;
            const newItem = this.gallery.addItemToFront(animatorData);
            this.checkAnimatorState(animatorData.id, 5000);
            this.downloadPreview(animatorData.uploadUrl, animatorData.id + "_preview" + ".mp4", (path) => {
                newItem.setPreview(path);
            });
        };
        this.onItemDataChangedCallback = onItemDataChangedCallback;
        this.checkGenerationState = checkGenerationState;
        this.authComponent = authComponent;
        this.tempDir = FileSystem.TempDir.create();
        this.gallery = new Gallery(onTileClickedCallback);
        const widget = new Ui.Widget(parent);
        widget.setContentsMargins(0, 0, 0, 0);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        widget.autoFillBackground = true;
        widget.backgroundRole = Ui.ColorRole.NoRole;
        widget.setFixedWidth(421);
        widget.setFixedHeight(620);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = 0;
        layout.setContentsMargins(16, 16, 6, 16);
        const stackedWidget = new Ui.StackedWidget(widget);
        this.stackedWidget = stackedWidget;
        const initWidget = this.createInitWidget(widget);
        stackedWidget.addWidget(initWidget);
        const galleryWidget = this.gallery.create(widget);
        stackedWidget.addWidget(galleryWidget);
        layout.addWidget(stackedWidget);
        widget.layout = layout;
        this.mainWidget = widget;
    }
    createInitWidget(parent) {
        const widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        const imageView = new Ui.ImageView(widget);
        imageView.setFixedWidth(180);
        imageView.setFixedHeight(180);
        imageView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/gen_ai.svg'));
        imageView.move(104, 120);
        const label = new Ui.Label(widget);
        label.text = '<center>' + 'Welcome to<br>' +
            'Lens Studio Gen AI' + '</center>';
        label.fontRole = Ui.FontRole.LargeTitle;
        label.foregroundRole = Ui.ColorRole.BrightText;
        label.setFixedHeight(100);
        label.setFixedWidth(360);
        label.move(15, 273);
        const label1 = new Ui.Label(widget);
        label1.text = '<center>' + 'You don\'t have any generated effects yet. <br>' +
            'Try creating a new one!' + '</center>';
        label1.fontRole = Ui.FontRole.Default;
        label1.foregroundRole = Ui.ColorRole.Text;
        label1.setFixedWidth(360);
        label1.move(15, 359);
        widget.layout = layout;
        return widget;
    }
    updateGrid() {
        if (this.gridWasUpdated || !this.authComponent.isAuthorized) {
            return;
        }
        this.gridWasUpdated = true;
        getMyAnimators((response) => {
            if (response.statusCode !== 200) {
                return;
            }
            if (JSON.parse(response.body).items.length > 0) {
                this.stackedWidget.currentIndex = 1;
            }
            JSON.parse(response.body).items.forEach((item) => {
                const newItem = this.gallery.addItem(item);
                if (item.state === "PREVIEW_FAILED") {
                    newItem.setFailed();
                    return;
                }
                if (item.state === "PREVIEW_QUEUED" || item.state === "PREVIEW_RUNNING") {
                    this.checkAnimatorState(item.id, 5000);
                }
                if (item.state === "GENERATION_QUEUED" || item.state === "GENERATION_RUNNING") {
                    this.checkGenerationState(item.id, 60000);
                }
                this.downloadPreview(item.uploadUrl, item.id + "_preview" + ".mp4", (path) => {
                    newItem.setPreview(path);
                });
            });
        });
    }
    checkAnimatorState(id, intervalVal) {
        const checkState = (id) => {
            getAnimatorById(id, (response) => {
                if (response.statusCode !== 200) {
                    return;
                }
                const curSettings = JSON.parse(response.body);
                if (curSettings.state === "PREVIEW_SUCCESS" || curSettings.state === "PREVIEW_FAILED") {
                    clearInterval(interval);
                    this.gallery.updateItemData(JSON.parse(response.body));
                    this.onItemDataChangedCallback(JSON.parse(response.body));
                }
            });
        };
        const interval = setInterval(() => {
            checkState(id);
        }, intervalVal);
        this.connections.push(interval);
    }
    downloadPreview(url, filename, callback) {
        downloadFile(url, (response) => {
            if (response.statusCode === 200) {
                const path = this.tempDir.path.appended(filename);
                const resolvedDirectoryPath = import.meta.resolve(this.tempDir.path.toString());
                const resolvedFilePath = import.meta.resolve(path.toString());
                if (resolvedFilePath.startsWith(resolvedDirectoryPath)) {
                    FileSystem.writeFile(path, response.body.toBytes());
                    callback(path);
                }
            }
        });
    }
    removeById(id) {
        deleteAnimatorById(id);
        this.gallery.removeById(id);
    }
    updateItemData(animatorData) {
        this.gallery.updateItemData(animatorData);
    }
    get widget() {
        return this.mainWidget;
    }
}
