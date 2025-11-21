// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import * as Shell from 'LensStudio:Shell';
import {ColorRole} from "LensStudio:Ui";
import {Gallery} from "./Gallery.js";
import {getDreamByID, getMyDreams} from "./api.js";
import app from "./app.js";

export class EffectGallery {

    private stackedWidget: Ui.StackedWidget | undefined;
    private gallery: Gallery;
    private curWidget: Ui.Widget;
    private openEffectSettingsPage: Function;
    private checkDreamStateById: Function;
    private connections: Array<any> = [];
    private movieViews: Array<any> = [];
    private settings: Record<string, object> = {};
    private authComponent: Editor.IAuthorization | undefined;
    private lastRequestId = 0;

    constructor(parent: Ui.Widget, openEffectSettingsPage: Function, checkDreamStateById: Function, onImportClickCallback: Function, showLoginPageCallback: Function, showPluginPageCallback: Function) {
        this.gallery = new Gallery(this.onTileClicked.bind(this), onImportClickCallback, this.updateGallery.bind(this));
        this.curWidget = this.create(parent, showLoginPageCallback, showPluginPageCallback);
        this.openEffectSettingsPage = openEffectSettingsPage;
        this.checkDreamStateById = checkDreamStateById;

        this.settings['00'] = {"state" : "DEFAULT", "prompt" : ""};
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

        this.authComponent.onAuthorizationChange.connect((authStatus) => {
            if (!this.stackedWidget || !this.stackedWidget.visible) {
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
        })

        return widget;
    }

    private createInitWidget(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        const imageView = new Ui.ImageView(widget);
        imageView.setFixedWidth(180);
        imageView.setFixedHeight(180);
        imageView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/init.svg'));
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

    private createEmptyGalleryPage(parent) {
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
        title.text = '<center>Welcome to<br><span style="font-size: 16px; font-weight: bold; color: #FFF0B9;">AI Portraits Beta</span><center>';
        title.wordWrap = true;
        title.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        title.setFixedWidth(180);

        title.move(105, 112);

        const movieView = new Ui.MovieView(emptyGalleryPage);
        movieView.setFixedWidth(122);
        movieView.setFixedHeight(216);
        movieView.radius = 8;
        movieView.scaledContents = true;
        movieView.animated = true;

        const movie = new Ui.Movie(new Editor.Path(import.meta.resolve('./Resources/p_01.webp')));
        movie.resize(122, 216);
        movieView.movie = movie;

        movieView.move(4, 170);

        const movieView1 = new Ui.MovieView(emptyGalleryPage);
        movieView1.setFixedWidth(122);
        movieView1.setFixedHeight(216);
        movieView1.radius = 8;
        movieView1.scaledContents = true;
        movieView1.animated = true;

        const movie1 = new Ui.Movie(new Editor.Path(import.meta.resolve('./Resources/p_02.webp')));
        movie1.resize(122, 216);
        movieView1.movie = movie1;

        movieView1.move(133, 170);

        const movieView2 = new Ui.MovieView(emptyGalleryPage);
        movieView2.setFixedWidth(122);
        movieView2.setFixedHeight(216);
        movieView2.radius = 8;
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

        const guidelinesButton = new Ui.PushButton(emptyGalleryPage);
        guidelinesButton.text = 'Guidelines';
        const importImagePath = new Editor.Path(import.meta.resolve('./Resources/Guides.svg'));
        guidelinesButton.setIconWithMode(Editor.Icon.fromFile(importImagePath), Ui.IconMode.MonoChrome);
        guidelinesButton.primary = false;
        guidelinesButton.enabled = true;
        guidelinesButton.visible = true;

        guidelinesButton.move(148, 468);

        guidelinesButton.onClick.connect(() => {
            Shell.openUrl('https://developers.snap.com/lens-studio/features/genai-suite/ai-portraits', {});
        })

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
        getMyDreams((response: any) => {
            if (response.statusCode !== 200 || currentRequestId != this.lastRequestId) {
                return;
            }

            if (JSON.parse(response.body).items.length > 0 && this.stackedWidget) {
                this.stackedWidget.currentIndex = 1;
                JSON.parse(response.body).items.forEach((item: any) => {
                    if (item.state.startsWith("PACK") && item.state !== "PACK_FAILED" && item.state !== "PACK_SUCCESS") {
                        this.gallery.addItem(item.id, item.prompt, item.previewUrl, false, false, true);
                    }
                    else if (item.state === "PACK_SUCCESS") {
                        this.gallery.addItem(item.id, item.prompt, item.previewUrl, false, false, false, true);
                    }
                    else if (item.state === "SUCCESS" || item.state === "PACK_SUCCESS") {
                        this.gallery.addItem(item.id, item.prompt, item.previewUrl);
                    }
                    else {
                        this.gallery.addItem(item.id, item.prompt, item.previewUrl, false, true);
                        if (item.state === "FAILED" || item.state === "PACK_FAILED") {
                            this.gallery.setFailed(item.id);
                        }
                        else {
                            this.checkDreamStateById(item.id, item.state);
                        }
                    }
                })
            }
        })
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
                    return;
                }
                this.settings[id] = JSON.parse(response.body);
                this.openEffectSettingsPage(this.settings[id]);
            })
        }
    }

    resetGallery() {
        this.lastRequestId++;
        this.gallery.reset();
    }

    updateGallery() {
        this.gallery.reset();
        this.settings = {};
        this.settings['00'] = {"state" : "DEFAULT", "prompt" : ""};
        this.getDreamsGallery();
    }

    addPreview(id: string, previewUrl: string, isFailed: boolean = false) {
        if (isFailed) {
            this.gallery.setFailed(id);
        }
        else {
            this.gallery.addPreview(id, previewUrl);
        }
    }

    updateSettings(settings: any) {
        this.settings[settings.id] = settings;
    }

    get widget() {
        return this.curWidget;
    }

    deinit(): void {

    }
}
