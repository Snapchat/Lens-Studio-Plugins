import * as Ui from 'LensStudio:Ui';
import * as Shell from 'LensStudio:Shell';

import app from '../../application/app.js';

export class AccessMenu {
    constructor(onStateChanged) {
        this.connections = [];
        this.onStateChanged = onStateChanged;
    }

    updateStatus(status) {
        this.status = status;

        switch (status) {
            case 'login':
                this.disclaimer.text = '<center>Log-in to MyLenses account <br>to get access for Gen AI tools</center>';
                this.disclaimer.visible = true;
                this.loginButton.text = '   Login   ';
                this.loginButton.visible = true;
                this.loading.visible = false;
                break;
            case 'api_version':
                this.disclaimer.text = '<center>Please, update the plugin to <br>newer version to continue.</center>';
                this.disclaimer.visible = true;
                this.loginButton.text = '   Update   ';
                this.loginButton.visible = true;
                this.loading.visible = false;
                break;
            case 'loading':
                this.loginButton.visible = false;
                this.disclaimer.visible = false;
                this.loading.visible = true;
                break;
            case 'terms':
                this.loginButton.visible = true;
                this.loginButton.text = '   Read and Accept   ';
                this.disclaimer.text = '<center>Please, accept terms and <br>conditions to continue.</center>';
                this.disclaimer.visible = true;
                this.loading.visible = false;
                break;
            case 'reload':
                this.loginButton.visible = true;
                this.loginButton.text = '   Reload   ';
                this.disclaimer.text = '<center>Oops, something went wrong,<br> please reload the page to try again.</center>';
                this.disclaimer.visible = true;
                this.disclaimer.visible = true;
                this.loading.visible = false;
                break;
        }
    }

    onLoginClicked() {
        if (this.status === 'login') {
            app.authorize();
        } else if (this.status === 'api_version') {
            Shell.openUrl('https://ar.snap.com/download', {});
        } else if (this.status == 'terms') {
            Shell.openUrl('https://www.snap.com/terms/lens-studio-license-agreement', {});
            this.updateStatus('reload');
        } else if (this.status == 'reload') {
            this.onStateChanged({
                'init': true
            });
        }
    }

    createPreview(parent) {
        this.preview = new Ui.Widget(parent);
        this.preview.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.preview.setFixedWidth(480);
        this.preview.setFixedHeight(620);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        this.logo = new Ui.ImageView(this.preview);
        this.logo.pixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/gen_ai_wizzard.svg')));
        this.logo.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.logo.setFixedWidth(180);
        this.logo.setFixedHeight(180);
        this.logo.scaledContents = true;

        this.title = new Ui.Label(this.preview);
        this.title.fontRole = Ui.FontRole.LargeTitleBold;
        this.title.text = '<center>Welcome to<br>Lens Studio Gen AI<center>';
        this.title.wordWrap = true;
        this.title.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        this.title.setFixedWidth(180);

        this.disclaimer = new Ui.Label(this.preview);
        this.disclaimer.wordWrap = true;
        this.disclaimer.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Preferred);
        this.disclaimer.setFixedWidth(300);

        this.loginButton = new Ui.PushButton(this.preview);
        this.loginButton.text = 'Login';
        this.loginButton.primary = true;
        this.loginButton.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.loginButton.setFixedHeight(32);

        this.loginButton.setContentsMargins(Ui.Sizes.DoublePadding, Ui.Sizes.Padding, Ui.Sizes.DoublePadding, Ui.Sizes.Padding);
        this.connections.push(this.loginButton.onClick.connect(() => {
            this.onLoginClicked();
        }));

        this.loading = new Ui.ProgressIndicator(this.preview);
        this.loading.start();
        this.loading.visible = false;

        layout.addStretch(1);
        layout.addWidgetWithStretch(this.logo, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.title, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.disclaimer, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.loginButton, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.loading, 0, Ui.Alignment.AlignCenter);
        layout.addStretch(2);

        layout.spacing = Ui.Sizes.Padding;

        this.preview.layout = layout;

        return this.preview;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setFixedWidth(480);
        this.widget.setFixedHeight(620);
        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.layout.addWidget(this.createPreview(this.widget));

        this.layout.spacing = 0;
        this.widget.layout = this.layout;

        return this.widget;
    }
}
