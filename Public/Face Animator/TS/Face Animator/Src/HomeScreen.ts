// @ts-nocheck
import * as Ui from "LensStudio:Ui";
import {GeneratePage} from "./GeneratePage";
import {AnimatorPage} from "./AnimatorPage";
import app from "./app.js";


export class HomeScreen {

    private generatePage: GeneratePage;
    private animatorPage: AnimatorPage;
    private stackedWidget: Ui.StackedWidget | undefined;
    private authComponent: Editor.IAuthorization | undefined;
    private connections: Array<any> = [];

    constructor() {
        this.generatePage = new GeneratePage(this.onTileClicked.bind(this), this.onItemDataChanged.bind(this), this.checkGenerationState.bind(this));
        this.animatorPage = new AnimatorPage();
    }

    create(parent: Ui.Widget): Ui.Widget {
        this.authComponent = app.pluginSystem?.findInterface(Editor.IAuthorization) as Editor.IAuthorization;
        const stackedWidget = new Ui.StackedWidget(parent);
        stackedWidget.setContentsMargins(0, 0, 0, 0);
        stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        stackedWidget.autoFillBackground = true;
        stackedWidget.backgroundRole = Ui.ColorRole.Base;
        stackedWidget.setFixedWidth(800);
        stackedWidget.setFixedHeight(620);

        const generatePageWidget = this.generatePage.create(stackedWidget, this.authComponent);
        stackedWidget.addWidget(generatePageWidget);

        const animatorPage = this.animatorPage.create(stackedWidget, this.openGeneratePage.bind(this), this.onItemRemoved.bind(this), this.updateAnimatorData.bind(this));
        stackedWidget.addWidget(animatorPage);

        const loginWidget = this.createLoginWidget(stackedWidget);
        stackedWidget.addWidget(loginWidget);

        this.stackedWidget = stackedWidget;

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
                this.generatePage.updateGrid();
            }
            else {
                this.stackedWidget.currentIndex = 2;
            }
        })

        return stackedWidget;
    }

    openGeneratePage(): void {
        if (this.stackedWidget) {
            this.stackedWidget.currentIndex = 0;
        }
    }

    private onTileClicked(animatorData: any) {
        if (this.stackedWidget) {
            this.animatorPage.setPreview(animatorData.previewPath);
            this.animatorPage.setAnimatorData(animatorData);
            this.stackedWidget.currentIndex = 1;
        }
    }

    private onItemDataChanged(animatorData: any): void {
        if (this.stackedWidget && this.stackedWidget.currentIndex === 1) {
            this.animatorPage.updateAnimatorData(animatorData);
        }
    }

    private createLoginWidget(parent: Ui.Widget): Ui.Widget {
        const widget = new Ui.Widget(parent);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        const imageView = new Ui.ImageView(widget);
        imageView.setFixedWidth(180);
        imageView.setFixedHeight(180);
        imageView.pixmap = new Ui.Pixmap(import.meta.resolve('./Resources/gen_ai.svg'));
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

    onItemRemoved(id: string): void {
        this.generatePage.removeById(id);
    }

    updateAnimatorData(animatorData: any): void {
        this.generatePage.updateItemData(animatorData);
    }

    checkGenerationState(id: string, intervalVal: number) {
        this.animatorPage.checkGenerationState(id, intervalVal);
    }

    updateGrid(): void {
        this.generatePage.updateGrid();
    }
}