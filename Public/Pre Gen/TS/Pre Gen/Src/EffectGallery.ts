// @ts-nocheck
import * as Ui from "LensStudio:Ui";
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

        const initWidget = this.createInitWidget(this.stackedWidget);
        this.stackedWidget.addWidget(initWidget);

        const galleryWidget = this.gallery.create(this.stackedWidget);
        this.stackedWidget.addWidget(galleryWidget);

        layout.addWidget(this.stackedWidget);

        widget.layout = layout;

        this.authComponent = app.pluginSystem?.findInterface(Editor.IAuthorization) as Editor.IAuthorization;

        this.authComponent.onAuthorizationChange.connect((authStatus) => {
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
