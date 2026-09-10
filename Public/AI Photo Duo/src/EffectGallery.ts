import * as Ui from "LensStudio:Ui";
import {ColorRole} from "LensStudio:Ui";
import {Gallery} from "./Gallery.js";
import {getDreamByID, listDreams, favoriteDream, unfavoriteDream, tryParseJson} from "./api.js";
import app from "./app.js";
import {DreamSettings} from "./dreamTypes.js";

export class EffectGallery {

    private stackedWidget: Ui.StackedWidget | undefined;
    private gallery: Gallery;
    private curWidget: Ui.Widget;
    private openEffectSettingsPage: Function;
    private checkDreamStateById: Function;
    private connections: Editor.ScopedConnection[] = [];
    private movieViews: Ui.MovieView[] = [];
    private settings: Record<string, DreamSettings> = {};
    private authComponent: Editor.IAuthorization | undefined;
    private lastRequestId = 0;
    private nextPageToken: string | null = null;
    private searchQuery: string = '';
    private favoritesFilterQuery: string = '';
    private prefetchedItems: any[] | null = null;
    private prefetchedPageToken: string | null = null;
    private isPrefetching: boolean = false;
    private readonly INITIAL_PAGE_SIZE = 12;
    private readonly EXPAND_PAGE_SIZE = 3;

    constructor(parent: Ui.Widget, openEffectSettingsPage: Function, checkDreamStateById: Function, onImportClickCallback: Function, showLoginPageCallback: Function, showPluginPageCallback: Function) {
        this.gallery = new Gallery(this.onTileClicked.bind(this), onImportClickCallback, this.updateGallery.bind(this), this.expandGallery.bind(this), this.onSearchTextChanged.bind(this), this.onFavoriteClicked.bind(this), this.onFavoritesFilterChanged.bind(this));
        this.curWidget = this.create(parent, showLoginPageCallback, showPluginPageCallback);
        this.openEffectSettingsPage = openEffectSettingsPage;
        this.checkDreamStateById = checkDreamStateById;

        this.settings['00'] = {state: "DEFAULT", prompt: ""};
    }

    private create(parent: Ui.Widget, showLoginPageCallback: Function, showPluginPageCallback: Function): Ui.Widget {
        const widget = new Ui.Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        widget.autoFillBackground = true;
        widget.backgroundRole = ColorRole.Base;
        widget.setFixedHeight(563);
        widget.setFixedWidth(421);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.DoublePadding;
        layout.setContentsMargins(Ui.Sizes.DoublePadding, Ui.Sizes.Padding, 19, 0)

        this.stackedWidget = new Ui.StackedWidget(widget);
        this.stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const initWidget = this.createEmptyGalleryPage(this.stackedWidget);
        this.stackedWidget.addWidget(initWidget);

        const galleryWidget = this.gallery.create(this.stackedWidget);
        this.stackedWidget.addWidget(galleryWidget);

        layout.addWidget(this.stackedWidget);

        widget.layout = layout;

        this.authComponent = app.pluginSystem?.findInterface(Editor.IAuthorization) as Editor.IAuthorization;

        this.connections.push(this.authComponent.onAuthorizationChange.connect((authStatus) => {
            // Do not check stackedWidget.visible: when the home screen shows the login
            // page, this gallery is under a hidden parent, so the handler would never run.
            if (!this.stackedWidget) {
                return;
            }
            if (authStatus) {
                this.stackedWidget.currentIndex = 0;
                showPluginPageCallback();
                this.updateGallery();
            }
            else {
                showLoginPageCallback();
            }
        }));

        return widget;
    }

    private createInitWidget(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        const imageView = new Ui.ImageView(widget);
        imageView.setFixedWidth(180);
        imageView.setFixedHeight(180);
        imageView.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/init.svg')));
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

    private createEmptyGalleryPage(parent: Ui.Widget): Ui.Widget {
        const emptyGalleryPage = new Ui.Widget(parent);
        emptyGalleryPage.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        emptyGalleryPage.setFixedWidth(390);
        emptyGalleryPage.setFixedHeight(500);

        const logo = new Ui.ImageView(emptyGalleryPage);
        logo.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/mainIcon.svg')));
        logo.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        logo.setFixedWidth(32);
        logo.setFixedHeight(32);
        logo.scaledContents = true;

        logo.move(176, 69);

        const title = new Ui.Label(emptyGalleryPage);
        title.fontRole = Ui.FontRole.TitleBold;
        title.foregroundRole = Ui.ColorRole.BrightText;
        title.text = '<center>Welcome to<br><span style="font-size: 16px; font-weight: bold; color: #FFF0B9;">AI Photo Duo</span><center>';
        title.wordWrap = true;
        title.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        title.setFixedWidth(180);

        title.move(105, 112);

        const movieView = new Ui.MovieView(emptyGalleryPage);
        movieView.setFixedWidth(122);
        movieView.setFixedHeight(216);
        movieView.scaledContents = true;
        movieView.animated = true;

        const movie = new Ui.Movie(new Editor.Path(import.meta.resolve('./Resources/p_01.webp')));
        movie.resize(122, 216);
        movieView.movie = movie;

        movieView.move(4, 170);

        const movieView1 = new Ui.MovieView(emptyGalleryPage);
        movieView1.setFixedWidth(122);
        movieView1.setFixedHeight(216);
        movieView1.scaledContents = true;
        movieView1.animated = true;

        const movie1 = new Ui.Movie(new Editor.Path(import.meta.resolve('./Resources/p_02.webp')));
        movie1.resize(122, 216);
        movieView1.movie = movie1;

        movieView1.move(133, 170);

        const movieView2 = new Ui.MovieView(emptyGalleryPage);
        movieView2.setFixedWidth(122);
        movieView2.setFixedHeight(216);
        movieView2.scaledContents = true;
        movieView2.animated = true;

        const movie2 = new Ui.Movie(new Editor.Path(import.meta.resolve('./Resources/p_03.webp')));
        movie2.resize(122, 216);
        movieView2.movie = movie2;

        movieView2.move(262, 170);

        const disclaimer = new Ui.Label(emptyGalleryPage);
        disclaimer.wordWrap = true;
        disclaimer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        disclaimer.setFixedWidth(300);

        disclaimer.text = `<center>You don’t have any generated effects yet.<br>Try creating a new one!<center>`;

        disclaimer.move(45, 424)

        const guidelinesLink = new Ui.Label(emptyGalleryPage);
        guidelinesLink.wordWrap = true;
        guidelinesLink.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        guidelinesLink.setFixedWidth(300);
        guidelinesLink.openExternalLinks = true;
        guidelinesLink.text = `<center>${Ui.getUrlString('Guidelines', 'https://developers.snap.com/lens-studio/features/genai-suite/ai-photo-duo')}<center>`;

        guidelinesLink.move(45, 468);

        // Keep references so MovieViews (and their animated Movies) are not
        // garbage-collected while the empty gallery page is off-screen.
        this.movieViews.push(movieView);
        this.movieViews.push(movieView1);
        this.movieViews.push(movieView2);

        // emptyGalleryPage.visible = false;
        return emptyGalleryPage;
    }

    private getDreamsGallery() {
        if (!this.authComponent || !this.authComponent.isAuthorized) {
            return;
        }
        this.lastRequestId++;
        const currentRequestId = this.lastRequestId;
        const combinedQuery = this.searchQuery + this.favoritesFilterQuery;
        listDreams(this.INITIAL_PAGE_SIZE, (response: any) => {
            if (currentRequestId !== this.lastRequestId) {
                return;
            }
            if (response.statusCode !== 200) {
                console.error(`[AI Photo Duo] listDreams failed, status code: ${response.statusCode}`);
                return;
            }

            const body = tryParseJson(response.body, "getDreamsGallery");
            if (!body) {
                return;
            }
            this.nextPageToken = body.nextPageToken || null;

            if (body.items.length > 0 && this.stackedWidget) {
                this.stackedWidget.currentIndex = 1;
                // Show the full first page. Failed items are filtered in
                // processItems, which can leave the grid short of a scrollable
                // height - prefetchNextPage auto-expands while still near the
                // bottom so remaining effects keep loading without a scroll.
                this.processItems(body.items);
                this.prefetchNextPage();
            } else if (this.stackedWidget) {
                if (this.searchQuery || this.favoritesFilterQuery) {
                    // No results for an active filter/search (e.g. no favorited
                    // effects yet) - keep the gallery UI (header, search, filter)
                    // visible and show an empty-grid placeholder instead.
                    this.stackedWidget.currentIndex = 1;
                    this.gallery.showEmpty(this.favoritesFilterQuery ? 'No favorite effects yet.' : 'No effects found.');
                } else {
                    // No effects at all yet, no filter active - show the full
                    // "Welcome" onboarding screen instead.
                    this.stackedWidget.currentIndex = 0;
                }
            }
        }, combinedQuery);
    }

    private expandGallery() {
        if (this.prefetchedItems && this.prefetchedItems.length > 0) {
            const items = this.prefetchedItems;
            this.prefetchedItems = null;
            this.nextPageToken = this.prefetchedPageToken;
            this.prefetchedPageToken = null;
            this.processItems(items);
            this.prefetchNextPage();
            return;
        }

        if (this.isPrefetching) {
            return;
        }

        if (!this.nextPageToken || !this.authComponent || !this.authComponent.isAuthorized) {
            return;
        }

        this.isPrefetching = true;
        this.lastRequestId++;
        const currentRequestId = this.lastRequestId;
        const combinedQuery = this.searchQuery + this.favoritesFilterQuery;
        listDreams(this.EXPAND_PAGE_SIZE, (response: any) => {
            if (currentRequestId !== this.lastRequestId) {
                this.isPrefetching = false;
                return;
            }
            if (response.statusCode !== 200) {
                console.error(`[AI Photo Duo] listDreams (expand) failed, status code: ${response.statusCode}`);
                this.isPrefetching = false;
                return;
            }

            const body = tryParseJson(response.body, "expandGallery");
            if (!body) {
                this.isPrefetching = false;
                return;
            }
            this.nextPageToken = body.nextPageToken || null;
            this.processItems(body.items);
            this.isPrefetching = false;
            this.prefetchNextPage();
        }, combinedQuery, this.nextPageToken);
    }

    private prefetchNextPage() {
        if (!this.nextPageToken || !this.authComponent || !this.authComponent.isAuthorized) {
            return;
        }
        this.isPrefetching = true;
        const currentRequestId = this.lastRequestId;
        const combinedQuery = this.searchQuery + this.favoritesFilterQuery;
        listDreams(this.EXPAND_PAGE_SIZE, (response: any) => {
            if (currentRequestId !== this.lastRequestId) {
                this.isPrefetching = false;
                return;
            }
            if (response.statusCode !== 200) {
                console.error(`[AI Photo Duo] listDreams (prefetch) failed, status code: ${response.statusCode}`);
                this.isPrefetching = false;
                return;
            }
            const body = tryParseJson(response.body, "prefetchNextPage");
            if (!body) {
                this.isPrefetching = false;
                return;
            }
            this.prefetchedItems = body.items;
            this.prefetchedPageToken = body.nextPageToken || null;
            this.isPrefetching = false;
            if (this.gallery.isNearBottom()) {
                this.expandGallery();
            }
        }, combinedQuery, this.nextPageToken);
    }

    private onSearchTextChanged(text: string) {
        if (text.length > 0) {
            this.searchQuery = '&filter[]=search%3D' + encodeURIComponent(text);
        } else {
            this.searchQuery = '';
        }
        this.resetAndReload();
    }

    private onFavoriteClicked(dreamId: string, isFavorite: boolean, galleryItem: any) {
        const apiCall = isFavorite ? favoriteDream : unfavoriteDream;
        apiCall(dreamId, (response: any) => {
            if (response.statusCode !== 200) {
                galleryItem.revertFavorite();
            }
        });
    }

    private onFavoritesFilterChanged(isActive: boolean) {
        this.favoritesFilterQuery = isActive ? '&filter[]=is_favorite%3Dtrue' : '';
        this.resetAndReload();
    }

    private resetAndReload() {
        this.gallery.reset();
        this.settings = {};
        this.settings['00'] = {state: "DEFAULT", prompt: ""};
        this.nextPageToken = null;
        this.prefetchedItems = null;
        this.prefetchedPageToken = null;
        this.isPrefetching = false;
        this.getDreamsGallery();
    }

    private processItems(items: any[]) {
        // Failed effects aren't shown in the gallery at all - filter them out
        // up front rather than rendering a tile just to mark it "Failed".
        const visibleItems = items.filter((item: any) => item.state !== "FAILED" && item.state !== "PACK_FAILED");

        const batchData: Array<{id: string, description: string, previewUrl: string, isDefault?: boolean, inProgress?: boolean, isTraining?: boolean, isTrained?: boolean, isFavorite?: boolean}> = [];

        visibleItems.forEach((item: any) => {
            const isFavorite = item.isFavorite === true;
            if (item.state.startsWith("PACK") && item.state !== "PACK_SUCCESS") {
                batchData.push({id: item.id, description: item.prompt, previewUrl: item.previewUrl, isTraining: true, isFavorite});
            }
            else if (item.state === "PACK_SUCCESS") {
                batchData.push({id: item.id, description: item.prompt, previewUrl: item.previewUrl, isTrained: true, isFavorite});
            }
            else if (item.state === "SUCCESS") {
                batchData.push({id: item.id, description: item.prompt, previewUrl: item.previewUrl, isFavorite});
            }
            else {
                batchData.push({id: item.id, description: item.prompt, previewUrl: item.previewUrl, inProgress: true, isFavorite});
            }
        });

        this.gallery.addItems(batchData);

        visibleItems.forEach((item: any) => {
            if (item.state !== "PACK_SUCCESS" && item.state !== "SUCCESS") {
                this.checkDreamStateById(item.id, item.state);
            }
        });
    }

    private onTileClicked(id: string, callback: Function) {
        if (this.settings[id]) {
            this.openEffectSettingsPage(this.settings[id]);
            callback();
        }
        else {
            getDreamByID(id, (response: any) => {
                callback();
                if (response.statusCode !== 200) {
                    console.error(`[AI Photo Duo] getDreamByID failed, status code: ${response.statusCode}`);
                    return;
                }
                const settings = tryParseJson(response.body, "onTileClicked");
                if (!settings) {
                    return;
                }
                this.settings[id] = settings;
                this.openEffectSettingsPage(this.settings[id]);
            })
        }
    }

    resetGallery() {
        this.lastRequestId++;
        this.gallery.reset();
        this.prefetchedItems = null;
        this.prefetchedPageToken = null;
        this.isPrefetching = false;
    }

    updateGallery() {
        this.searchQuery = '';
        this.favoritesFilterQuery = '';
        this.gallery.resetFilter();
        this.resetAndReload();
    }

    setItemTrained(id: string) {
        this.gallery.setItemTrained(id);
    }

    addPreview(id: string, previewUrl: string, isFailed: boolean = false) {
        if (isFailed) {
            // Failed effects aren't shown in the gallery - remove the tile
            // rather than marking it "Failed" in place.
            this.gallery.removeItem(id);
        }
        else {
            this.gallery.addPreview(id, previewUrl);
        }
    }

    updateSettings(settings: DreamSettings) {
        if (settings.id) {
            this.settings[settings.id] = settings;
        }
    }

    get widget() {
        return this.curWidget;
    }

    deinit(): void {
        this.connections.forEach((connection) => connection.disconnect());
        this.connections = [];
        this.gallery.reset();
    }
}
