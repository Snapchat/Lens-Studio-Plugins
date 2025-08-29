import * as Ui from "LensStudio:Ui";
import {downloadFile} from "./api.js";
import * as FileSystem from 'LensStudio:FileSystem';

export class GalleryItem {

    private frame: Ui.ImageView;
    private border: Ui.ImageView;
    private loading: Ui.ProgressIndicator;
    private loadingOverlay: Ui.ImageView;
    private tileWidth: number = 118;
    private tileHeight: number = 206;
    private tempDir: FileSystem.TempDir;
    private id: string;
    private isFailed: boolean = false;
    private connections: Array<any> = [];
    private curState: string = "RUNNING";
    private onClickCallback: Function = () => {};

    constructor(parent: Ui.Widget, id: string) {
        this.id = id;
        this.tempDir = FileSystem.TempDir.create();

        this.frame = new Ui.ImageView(parent);
        this.frame.setFixedWidth(this.tileWidth);
        this.frame.setFixedHeight(this.tileHeight);
        this.frame.radius = 0;
        this.frame.scaledContents = true;
        this.frame.responseHover = true;
        this.frame.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/default_tile.svg'));

        this.loadingOverlay = new Ui.ImageView(this.frame);
        this.loadingOverlay.setFixedWidth(this.tileWidth);
        this.loadingOverlay.setFixedHeight(this.tileHeight);
        this.loadingOverlay.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/grey_rectangle.svg'));

        const spinner = new Ui.ProgressIndicator(this.loadingOverlay);
        spinner.start();
        spinner.visible = true;
        spinner.move(51, 95);

        const trainingLabel = new Ui.Label(this.loadingOverlay);
        trainingLabel.text = '<center>' + 'Training<br>in progress' + '</center>';
        trainingLabel.foregroundRole = Ui.ColorRole.BrightText;
        trainingLabel.setFixedWidth(100);
        trainingLabel.move(9, 119);

        this.loadingOverlay.visible = false;

        this.border = new Ui.ImageView(this.frame);
        this.border.scaledContents = true;
        this.border.setFixedWidth(this.tileWidth);
        this.border.setFixedHeight(this.tileHeight);
        this.border.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.border.setContentsMargins(0, 0, 0, 0);
        this.border.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/full_frame_hover.svg'));

        this.border.visible = false;

        this.connections.push(this.frame.onHover.connect((hovered) => {
            if (this.isFailed) {
                return;
            }
            this.border.visible = hovered;
        }));

        [this.frame, this.border].forEach((item: Ui.ImageView) => {
            this.connections.push(item.onClick.connect(() => {
                this.onClickCallback(this.id);
            }))
        })

        this.loading = new Ui.ProgressIndicator(this.frame);
        this.loading.start();
        this.loading.visible = true;
        this.loading.move(8, 182);
    }

    addPreview(previewUrl: string) {
        const tempDir = this.tempDir;
        downloadFile(previewUrl, (response: any) => {
            if (response.statusCode !== 200) {
                return;
            }
            const path = tempDir.path.appended(this.id + "_preview.jpeg");

            const resolvedDirectoryPath = import.meta.resolve(tempDir.path.toString());
            const resolvedFilePath = import.meta.resolve(path.toString());

            if (resolvedFilePath.startsWith(resolvedDirectoryPath)) {
                FileSystem.writeFile(path, response.body.toBytes());
                this.frame.radius = 16;
                this.frame.pixmap = new Ui.Pixmap(path);
                this.loading.visible = false;
                this.curState = "SUCCESS";
            }
            else {
                throw new Error(`Resolved file path is not inside the resolved directory. resolvedFilePath: ${resolvedFilePath} | resolvedDirectoryPath: ${resolvedDirectoryPath}`);
            }
        });
    }

    addDefaultItemPreview() {
        this.curState = "DEFAULT";
        this.frame.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/menu_tile.svg'));
        this.frame.radius = 0;
        this.loading.visible = false;
    }

    showLoadingOverlay() {
        this.loadingOverlay.visible = true;
    }

    setOnClickCallback(callback: Function) {
        this.onClickCallback = callback;
    }

    enableLoading() {
        this.loading.visible = true;
    }

    disableLoading() {
        this.loading.visible = false;
    }

    setFailed() {
        this.curState = "FAILED";
        this.isFailed = true;
        this.loading.visible = false;
        this.border.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/failed_frame_hover.svg'));
        this.border.visible = true;

        const label = new Ui.Label(this.border);
        label.text = "Failed";

        label.move(44, 94);
    }

    get state() {
        return this.curState;
    }

    get widget() {
        return this.frame;
    }
}
