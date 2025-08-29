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

    constructor(parent: Ui.Widget, openEffectSettingsPage: Function, checkDreamStateById: Function) {
        this.gallery = new Gallery(this.onTileClicked.bind(this));
        this.curWidget = this.create(parent);
        this.openEffectSettingsPage = openEffectSettingsPage;
        this.checkDreamStateById = checkDreamStateById;

        this.settings['00'] = {"state" : "DEFAULT", "prompt" : ""};
    }

    private create(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);
        widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        widget.autoFillBackground = true;
        widget.backgroundRole = ColorRole.Base;

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.spacing = Ui.Sizes.DoublePadding;
        layout.setContentsMargins(Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding, Ui.Sizes.DoublePadding)

        const label = new Ui.Label(widget);
        label.text = 'Effect gallery';
        label.fontRole = Ui.FontRole.TitleBold;
        label.foregroundRole = Ui.ColorRole.BrightText;
        layout.addWidgetWithStretch(label, 0, Ui.Alignment.AlignTop | Ui.Alignment.AlignCenter)

        const searchLine = new Ui.SearchLineEdit(widget);
        searchLine.setFixedWidth(384);
        layout.addWidgetWithStretch(searchLine, 0, Ui.Alignment.AlignTop | Ui.Alignment.AlignCenter)
        layout.addStretch(0);

        this.stackedWidget = new Ui.StackedWidget(widget);
        this.stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.stackedWidget.setFixedHeight(520);

        const initWidget = this.createInitWidget(this.stackedWidget);
        this.stackedWidget.addWidget(initWidget);

        const galleryWidget = this.gallery.create(this.stackedWidget);
        this.stackedWidget.addWidget(galleryWidget);
        this.gallery.addDefaultItem();

        const loginWidget = this.createLoginWidget(this.stackedWidget);
        this.stackedWidget.addWidget(loginWidget);


        layout.addWidget(this.stackedWidget);

        widget.layout = layout;

        this.authComponent = app.pluginSystem?.findInterface(Editor.IAuthorization) as Editor.IAuthorization;

        if (this.authComponent.isAuthorized) {
            this.stackedWidget.currentIndex = 0;
        }
        else {
            this.stackedWidget.currentIndex = 2;
        }

        this.authComponent.onAuthorizationChange.connect((authStatus) => {
            if (!this.stackedWidget) {
                return;
            }
            if (authStatus) {
                this.stackedWidget.currentIndex = 0;
                this.updateGallery();
            }
            else {
                this.stackedWidget.currentIndex = 2;
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
        imageView.move(310, 104);

        const label = new Ui.Label(widget);
        label.text = '<center>' + 'You don’t have any Pre-Generated Effect.' + '</center>';
        label.setFixedWidth(280);
        label.move(260, 274);

        const createNewButton = new Ui.PushButton(widget);
        createNewButton.text = 'Create New';
        createNewButton.primary = true;
        createNewButton.setFixedWidth(78);
        createNewButton.setFixedHeight(24);
        createNewButton.move(361, 310);

        this.connections.push(createNewButton.onClick.connect(() => {
            this.openEffectSettingsPage(this.settings["00"]);
        }));

        widget.layout = layout;

        return widget;
    }

    private createLoginWidget(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        const imageView = new Ui.ImageView(widget);
        imageView.setFixedWidth(180);
        imageView.setFixedHeight(180);
        imageView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/init.svg'));
        imageView.move(310, 104);

        const label = new Ui.Label(widget);
        label.text = '<center>' + 'Log-in to MyLenses account <br>to get access for Gen AI tools' + '</center>';
        label.setFixedWidth(280);
        label.move(260, 264);

        const createNewButton = new Ui.PushButton(widget);
        createNewButton.text = 'Login';
        createNewButton.primary = true;
        createNewButton.setFixedWidth(78);
        createNewButton.setFixedHeight(24);
        createNewButton.move(361, 310);

        this.connections.push(createNewButton.onClick.connect(() => {
            this.authComponent?.authorize();
        }));

        widget.layout = layout;

        return widget;
    }

    private getDreamsGallery() {
        if (!this.authComponent || !this.authComponent.isAuthorized) {
            return;
        }
        getMyDreams((response: any) => {
            if (response.statusCode !== 200) {
                return;
            }

            if (JSON.parse(response.body).items.length > 0 && this.stackedWidget) {
                this.stackedWidget.currentIndex = 1;
                JSON.parse(response.body).items.forEach((item: any) => {
                    if (item.state.startsWith("PACK") && item.state !== "PACK_FAILED" && item.state !== "PACK_SUCCESS") {
                        this.gallery.addItem(item.id, item.previewUrl, false, false, true);
                    }
                    else if (item.state === "SUCCESS" || item.state === "PACK_SUCCESS") {
                        this.gallery.addItem(item.id, item.previewUrl);
                    }
                    else {
                        this.gallery.addItem(item.id, item.previewUrl, false, true);
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
