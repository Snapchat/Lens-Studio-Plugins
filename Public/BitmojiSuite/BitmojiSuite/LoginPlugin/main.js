import { PanelPlugin as Panel } from 'LensStudio:PanelPlugin';
import * as Ui from 'LensStudio:Ui';
import { WidgetFactory } from '../WidgetFactory.js';
import { PLUGIN_ID } from './constants.js';

export class LoginPlugin extends Panel {
    static descriptor() {
        return {
            id: PLUGIN_ID,
            name: 'Bitmoji Login',
            dependencies: [Ui.IGui],
            menuActionHierarchy: [''],
            isUnique: true,
        };
    }

    createWidget(parent) {
        const widget = WidgetFactory.beginWidget(parent).sizePolicy(Ui.SizePolicy.Policy.Expanding).end();

        this.icon = WidgetFactory.beginImageView(widget)
            .pixmap(new Ui.Pixmap(import.meta.resolve("./Resources/login_icon.svg")))
            .scaledContents(true)
            .end();

        this.titleLabel = WidgetFactory.beginLabel(widget)
            .text("<center>Welcome to Bitmoji Suite</center>")
            .fontRole(Ui.FontRole.TitleBold)
            .end();

        this.label = WidgetFactory.beginLabel(widget)
            .text("<center>Log-in to MyLenses account to get access for Bitmoji Suite tools</center>")
            .end();

        this.button = WidgetFactory.beginPushButton(widget)
            .text("Login")
            .icon(Editor.Icon.fromFile(import.meta.resolve("./Resources/profile_icon.svg")))
            .primary(true)
            .iconMode(Ui.IconMode.MonoChrome)
            .end();

        this.onButtonClickedConnection = this.button.onClick.connect(() => this.login());

        widget.layout = WidgetFactory.beginVerticalLayout()
            .spacing(Ui.Sizes.Spacing * 2)
            .addStretch(0)
            .addWidget(this.icon, Ui.Alignment.AlignCenter)
            .addWidget(this.titleLabel, Ui.Alignment.AlignCenter)
            .addWidget(this.label, Ui.Alignment.AlignCenter)
            .addWidget(this.button, Ui.Alignment.AlignCenter)
            .addStretch(0)
            .end();

        return widget;
    }

    login() {
        const authComponent = this.pluginSystem.findInterface(Editor.IAuthorization);
        authComponent.authorize();
    }

    deinit() {
        if (this.onButtonClickedConnection) {
            this.onButtonClickedConnection.disconnect();
            this.onButtonClickedConnection = null;
        }
    }
}
