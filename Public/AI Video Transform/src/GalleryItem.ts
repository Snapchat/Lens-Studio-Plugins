import * as Ui from "LensStudio:Ui";
import {downloadFile} from "./api.js";
import * as FileSystem from 'LensStudio:FileSystem';

export class GalleryItem {

    private static uniqueCounter = 0;

    private frame: Ui.ImageView;
    private movieView: Ui.MovieView;
    private videoView: Ui.VideoView;
    private isShowingVideo: boolean = false;
    private isHovered: boolean = false;
    private border: Ui.ImageView;
    private loading: Ui.ProgressIndicator;
    private loadingOverlay: Ui.ImageView;
    private tileWidth: number = 118;
    private tileHeight: number = 206;
    private tempDir: FileSystem.TempDir;
    private previewPath: Editor.Path | undefined;
    private id: string;
    private isFailed: boolean = false;
    private isTrained: boolean = false
    private description: string;
    private importButton: Ui.PushButton;
    private importOverlay: Ui.ImageView;
    private favoriteButton: Ui.ImageView;
    private favoriteTruePixmap: Ui.Pixmap;
    private favoriteFalsePixmap: Ui.Pixmap;
    private _isFavorite: boolean = false;
    private connections: Array<Editor.ScopedConnection | Timeout> = [];
    private curState: string = "RUNNING";
    private disposed: boolean = false;
    private onClickCallback: Function = () => {};
    private onImportClickCallback: Function = () => {};
    private onFavoriteClickCallback: Function = () => {};

    constructor(parent: Ui.Widget, id: string) {
        this.id = id;
        this.tempDir = FileSystem.TempDir.create();
        this.description = "";

        this.frame = new Ui.ImageView(parent);
        this.frame.setFixedWidth(this.tileWidth);
        this.frame.setFixedHeight(this.tileHeight);
        this.frame.radius = 0;
        this.frame.scaledContents = true;
        this.frame.responseHover = true;
        this.frame.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/default_tile.svg')));

        this.movieView = new Ui.MovieView(this.frame);
        this.movieView.setFixedWidth(this.tileWidth);
        this.movieView.setFixedHeight(this.tileHeight);
        this.movieView.scaledContents = true;
        this.movieView.animated = false;
        this.movieView.responseHover = true;
        this.movieView.visible = false;

        // VideoView overlays the MovieView to actually play back downloaded
        // .mp4 previews - Ui.Movie/MovieView only decode animated image
        // formats (GIF/APNG/WEBP), not real video codecs.
        this.videoView = new Ui.VideoView(this.frame);
        this.videoView.setFixedWidth(this.tileWidth);
        this.videoView.setFixedHeight(this.tileHeight);
        this.videoView.radius = 16;
        this.videoView.muted = true;
        this.videoView.loopCount = -1;
        this.videoView.responseHover = true;
        this.videoView.visible = false;

        this.loadingOverlay = new Ui.ImageView(this.frame);
        this.loadingOverlay.setFixedWidth(this.tileWidth);
        this.loadingOverlay.setFixedHeight(this.tileHeight);
        this.loadingOverlay.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/grey_rectangle.svg')));

        const spinner = new Ui.ProgressIndicator(this.loadingOverlay);
        spinner.setFixedWidth(32);
        spinner.setFixedHeight(32);
        spinner.start();
        spinner.visible = true;
        spinner.move(45, 85);

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
        this.border.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/full_frame_hover.svg')));

        this.border.visible = false;

        this.connections.push(this.frame.onHover.connect((hovered) => {
            if (this.isFailed) {
                return;
            }
            this.isHovered = hovered;
            this.border.visible = hovered;
            if (this.isShowingVideo && this.videoView) {
                if (hovered) {
                    this.videoView.play();
                } else {
                    this.videoView.pause();
                }
            } else if (this.movieView) {
                this.movieView.animated = hovered;
            }
            if (this.isTrained) {
                if (hovered) {
                    this.importButton.text = 'Import';
                    this.importButton.setFixedWidth(72);
                } else {
                    this.importButton.text = '';
                    this.importButton.setFixedWidth(32);
                }
            }
            this.favoriteButton.visible = hovered || this._isFavorite;
        }));

        [this.frame, this.border, this.movieView, this.videoView].forEach((item) => {
            this.connections.push(item.onClick.connect(() => {
                this.onClickCallback(this.id);
            }))
        })

        this.loading = new Ui.ProgressIndicator(this.frame);
        this.loading.start();
        this.loading.visible = true;
        this.loading.setFixedWidth(32);
        this.loading.setFixedHeight(32);
        this.loading.move(45, 85);

        this.importOverlay = new Ui.ImageView(this.frame);
        this.importOverlay.setFixedWidth(this.tileWidth);
        this.importOverlay.setFixedHeight(this.tileHeight);
        this.importOverlay.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/grey_rectangle.svg')));
        this.importOverlay.visible = false;

        const importSpinner = new Ui.ProgressIndicator(this.importOverlay);
        importSpinner.setFixedWidth(32);
        importSpinner.setFixedHeight(32);
        importSpinner.start();
        importSpinner.move(45, 85);

        this.importButton = new Ui.PushButton(this.frame);
        this.importButton.setIconWithMode(Editor.Icon.fromFile(new Editor.Path(import.meta.resolve('./Resources/import.svg'))), Ui.IconMode.MonoChrome);
        this.importButton.primary = true;
        this.importButton.visible = false;
        this.importButton.move(8, 178);

        this.connections.push(this.importButton.onClick.connect(() => {
            this.importOverlay.visible = true;
            this.importButton.enabled = false;
            const result = this.onImportClickCallback(this.id);
            if (result && typeof result.then === 'function') {
                result.then(() => {
                    this.importOverlay.visible = false;
                    this.importButton.enabled = true;
                }).catch(() => {
                    this.importOverlay.visible = false;
                    this.importButton.enabled = true;
                });
            }
        }));

        this.favoriteTruePixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/favorite_true.svg')));
        this.favoriteFalsePixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/favorite_false.svg')));

        const favoriteIconSize = 16;
        const favoriteIconMargin = 8;
        this.favoriteButton = new Ui.ImageView(this.frame);
        this.favoriteButton.setFixedWidth(favoriteIconSize);
        this.favoriteButton.setFixedHeight(favoriteIconSize);
        this.favoriteButton.scaledContents = true;
        this.favoriteButton.move(this.tileWidth - favoriteIconMargin - favoriteIconSize, favoriteIconMargin);
        this.favoriteButton.pixmap = this.favoriteFalsePixmap;
        this.favoriteButton.visible = false;

        this.connections.push(this.favoriteButton.onClick.connect(() => {
            this._isFavorite = !this._isFavorite;
            this.favoriteButton.pixmap = this._isFavorite ? this.favoriteTruePixmap : this.favoriteFalsePixmap;
            this.onFavoriteClickCallback(this.id, this._isFavorite);
        }));
    }

    private extensionForContentType(contentType: string): string {
        const map: Record<string, string> = {
            "video/mp4": ".mp4",
            "video/quicktime": ".mov",
            "video/webm": ".webm",
            "image/webp": ".webp",
            "image/png": ".png",
            "image/jpeg": ".jpg",
            "image/gif": ".gif",
        };
        const key = contentType ? contentType.split(';')[0].trim() : "";
        return map[key] || ".webp";
    }

    private isVideoContentType(contentType: string): boolean {
        return !!contentType && contentType.toLowerCase().startsWith('video/');
    }

    private removeIfPossible(path: Editor.Path): void {
        try {
            if (FileSystem.exists(path)) {
                FileSystem.remove(path);
            }
        } catch (e) {
            // MovieView/VideoView may still hold the file open, which on Windows
            // means an exclusive lock - leave it for the TempDir teardown.
            console.error(`[AI Video Transform] GalleryItem could not remove superseded preview "${path.toString()}":`, e, console.None);
        }
    }

    addPreview(previewUrl: string) {
        const tempDir = this.tempDir;
        downloadFile(previewUrl, (response: any) => {
            if (this.disposed) {
                return;
            }
            if (response.statusCode !== 200) {
                console.error(`[AI Video Transform] GalleryItem.addPreview failed for "${this.id}", status code: ${response.statusCode}`);
                return;
            }
            const bytes = response.body.toBytes();
            if (!bytes || bytes.length === 0) {
                console.error(`[AI Video Transform] GalleryItem.addPreview "${this.id}" got an empty body from the preview URL`);
                return;
            }

            const isVideo = this.isVideoContentType(response.contentType);
            const extension = this.extensionForContentType(response.contentType);
            // A tile can be given a preview more than once, and the file already on
            // disk may still be open by the MovieView/VideoView. Windows refuses to
            // delete open files, so write each preview under a fresh name rather
            // than overwriting in place.
            const uniqueName = `${this.id}_animated_${Date.now().toString(36)}_${GalleryItem.uniqueCounter++}`;
            const path = tempDir.path.appended(new Editor.Path(uniqueName + extension));

            const resolvedDirectoryPath = import.meta.resolve(tempDir.path.toString());
            const resolvedFilePath = import.meta.resolve(path.toString());

            if (resolvedFilePath.startsWith(resolvedDirectoryPath)) {
                try {
                    FileSystem.writeFile(path, bytes);
                    const supersededPath = this.previewPath;
                    this.previewPath = path;

                    if (isVideo) {
                        this.isShowingVideo = true;
                        this.videoView.setSource(path);
                        this.videoView.visible = true;
                        this.movieView.visible = false;
                        // VideoView renders nothing until playback starts, so the tile
                        // is just black at rest. Briefly play to force-decode a poster
                        // frame, then pause again unless the user is already hovering.
                        this.videoView.play();
                        this.connections.push(setTimeout(() => {
                            if (this.disposed) {
                                return;
                            }
                            if (this.videoView && !this.isHovered) {
                                this.videoView.pause();
                            }
                        }, 80));
                    } else {
                        this.isShowingVideo = false;
                        const movie = new Ui.Movie(path);
                        movie.resize(this.tileWidth, this.tileHeight);
                        this.movieView.movie = movie;
                        this.movieView.visible = true;
                        this.videoView.visible = false;
                    }
                    this.loading.visible = false;
                    this.curState = "SUCCESS";

                    // Now that the views point at the new file, the old one may be
                    // unlocked - drop it so temp usage doesn't grow with refreshes.
                    if (supersededPath) {
                        this.removeIfPossible(supersededPath);
                    }
                } catch (e) {
                    console.error(`[AI Video Transform] GalleryItem.addPreview failed to save/load preview "${this.id}" (contentType: ${response.contentType}):`, e);
                }
            }
            else {
                console.error(`[AI Video Transform] Resolved file path is not inside the resolved directory. resolvedFilePath: ${resolvedFilePath} | resolvedDirectoryPath: ${resolvedDirectoryPath}`);
            }
        });
    }

    addDefaultItemPreview() {
        this.curState = "DEFAULT";
        this.frame.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/menu_tile.svg')));
        this.frame.radius = 0;
        this.loading.visible = false;
    }

    showLoadingOverlay() {
        this.loadingOverlay.visible = true;
    }

    hideLoadingOverlay() {
        this.loadingOverlay.visible = false;
    }

    setOnClickCallback(callback: Function) {
        this.onClickCallback = callback;
    }

    setOnImportClickCallback(callback: Function) {
        this.onImportClickCallback = callback;
    }

    setOnFavoriteClickCallback(callback: Function) {
        this.onFavoriteClickCallback = callback;
    }

    setFavorite(isFavorite: boolean) {
        this._isFavorite = isFavorite;
        this.favoriteButton.pixmap = isFavorite ? this.favoriteTruePixmap : this.favoriteFalsePixmap;
        this.favoriteButton.visible = isFavorite;
    }

    revertFavorite() {
        this._isFavorite = !this._isFavorite;
        this.favoriteButton.pixmap = this._isFavorite ? this.favoriteTruePixmap : this.favoriteFalsePixmap;
        this.favoriteButton.visible = this._isFavorite;
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
        this.border.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/failed_frame_hover.svg')));
        this.border.visible = true;

        const label = new Ui.Label(this.border);
        label.text = "Failed";

        label.move(44, 94);
    }

    setTrained() {
        this.isTrained = true;
        this.importButton.visible = true;
    }

    addDescription(newDescription: string) {
        this.description = newDescription.replace(/(?<!\d)([1-3])\./g, ' ').replace(/\s+/g, ' ').trim();
    }

    getDescription() {
        return this.description;
    }

    get state() {
        return this.curState;
    }

    get widget() {
        return this.frame;
    }

    /**
     * Releases native preview media and destroys the tile widget. Must be
     * called when the gallery resets - simply dropping the JS reference
     * leaves MovieView/VideoView decoded frames resident in Lens Studio.
     */
    dispose(): void {
        if (this.disposed) {
            return;
        }
        this.disposed = true;

        this.connections.forEach((connection) => {
            if (connection && typeof (connection as Editor.ScopedConnection).disconnect === 'function') {
                (connection as Editor.ScopedConnection).disconnect();
            } else if (connection) {
                clearTimeout(connection as Timeout);
            }
        });
        this.connections = [];

        try {
            this.movieView.animated = false;
            this.videoView.stop();
        } catch (e) {
            console.error('[AI Video Transform] GalleryItem.dispose failed to stop preview media:', e, console.None);
        }

        this.frame.visible = false;
        this.frame.deleteLater();
    }
}
