import * as Ui from "LensStudio:Ui";
import {ColorRole} from "LensStudio:Ui";
import {EffectGallery} from "./EffectGallery.js";
import {EffectSettings} from "./EffectSettings.js";
import app from "./app.js";


export class HomeScreen {

    private effectGallery: EffectGallery | undefined;
    private effectSettings: EffectSettings;
    private stackedWidget: Ui.StackedWidget | undefined;
    private connections: Array<any> = [];
    private authComponent: Editor.IAuthorization | undefined;

    constructor() {
        this.effectSettings = new EffectSettings(this.openGallery.bind(this), this.onNewDreamCreated.bind(this), this.onPreviewLoaded.bind(this), this.updateSettings.bind(this), this.resetGallery.bind(this));
    }

    create(parent: Ui.Widget): Ui.Widget {
        this.authComponent = app.pluginSystem?.findInterface(Editor.IAuthorization) as Editor.IAuthorization;
        const stackedWidget = new Ui.StackedWidget(parent);
        stackedWidget.setContentsMargins(0, 0, 0, 0);
        stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        stackedWidget.autoFillBackground = true;
        stackedWidget.backgroundRole = ColorRole.Base;
        stackedWidget.setFixedWidth(800);
        stackedWidget.setFixedHeight(620);

        this.effectGallery = new EffectGallery(stackedWidget, this.openEffectSettingsPage.bind(this), this.checkDreamStateById.bind(this), this.onImportClick.bind(this), this.showLoginPage.bind(this), this.showPluginPage.bind(this));
        // stackedWidget.addWidget(this.effectGallery.widget);

        const effectSettingsWidget = this.effectSettings.create(stackedWidget, this.effectGallery.widget);
        stackedWidget.addWidget(effectSettingsWidget);

        const loginWidget = this.createLoginWidget(stackedWidget);
        stackedWidget.addWidget(loginWidget);

        stackedWidget.currentIndex = 0;

        this.stackedWidget = stackedWidget;

        if (!this.authComponent.isAuthorized) {
            this.showLoginPage();
        }

        return stackedWidget;
    }

    private createLoginWidget(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        const imageView = new Ui.ImageView(widget);
        imageView.setFixedWidth(180);
        imageView.setFixedHeight(180);
        imageView.scaledContents = true;
        imageView.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./Resources/init.svg')));
        imageView.move(310, 144);

        const label = new Ui.Label(widget);
        label.text = '<center>' + 'Log-in to MyLenses account <br>to get access for Gen AI tools' + '</center>';
        label.setFixedWidth(280);
        label.move(260, 304);

        const createNewButton = new Ui.PushButton(widget);
        createNewButton.text = 'Login';
        createNewButton.primary = true;
        createNewButton.setFixedWidth(78);
        createNewButton.setFixedHeight(24);
        createNewButton.move(361, 350);

        this.connections.push(createNewButton.onClick.connect(() => {
            this.authComponent?.authorize();
        }));

        widget.layout = layout;

        return widget;
    }

    openGallery(): void {
        if (!this.stackedWidget) {
            return;
        }
        // this.stackedWidget.currentIndex = 0;
        this.effectSettings.setSettings({"state" : "DEFAULT", "prompt" : ""});
        this.effectSettings.openGallery();
    }

    openEffectSettingsPage(settings: any): void {
        if (!this.stackedWidget) {
            return;
        }

        this.effectSettings.setSettings(settings);
        this.effectSettings.openSettingsPage();
        // this.stackedWidget.currentIndex = 1;
    }

    showLoginPage(): void {
        if (!this.stackedWidget) {
            return;
        }
        this.stackedWidget.currentIndex = 1;
    }

    showPluginPage(): void {
        if (!this.stackedWidget) {
            return;
        }
        this.stackedWidget.currentIndex = 0;
    }

    onNewDreamCreated() {
        this.effectGallery?.updateGallery();
    }

    resetGallery() {
        this.effectGallery?.resetGallery();
    }

    onPreviewLoaded(id: string, previewUrl: string, isFailed: boolean = false, isTrained: boolean = false) {
        if (isTrained) {
            // A dream can jump straight from RUNNING to PACK_SUCCESS between
            // polls (e.g. fast auto-packing) without ever being observed as
            // plain SUCCESS - in that case the gallery tile never got its
            // thumbnail loaded, so its "loading" spinner would spin forever.
            // Load the preview first (harmless no-op if it's already loaded)
            // before marking the tile as trained.
            if (previewUrl) {
                this.effectGallery?.addPreview(id, previewUrl, false);
            }
            this.effectGallery?.setItemTrained(id);
        } else {
            this.effectGallery?.addPreview(id, previewUrl, isFailed);
        }
    }

    checkDreamStateById(id: string, state: string): void {
        this.effectSettings.checkDreamStateById(id, state);
    }

    updateSettings(settings: any): void {
        this.effectGallery?.updateSettings(settings);
    }

    updateGallery() {
        this.effectGallery?.updateGallery();
    }

    onImportClick(id: string): Promise<void> {
        return this.effectSettings.importById(id);
    }

    deinit(): void {

    }
}
