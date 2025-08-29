import * as Ui from 'LensStudio:Ui';

import { GalleryView } from './GalleryView.js';
import { CreationMenu } from './CreationMenu.js';
import { AccessMenu } from './AccessMenu.js';

import app from '../../application/app.js';

import { versions, me, acceptTerms } from '../api.js';

const autoAcceptedTerms = ['ls_terms_1'];

export class HomeScreen {
    constructor(onStateChanged) {
        this.connections = [];
        this.galleryView = new GalleryView(onStateChanged);
        this.creationMenu = new CreationMenu(onStateChanged, this.reset.bind(this));
        this.accessMenu = new AccessMenu(onStateChanged);

        this.onStateChanged = onStateChanged;

        app.subscribeOnAuth((status) => {
            this.onLoginChanged(status);
        });
    }

    init(status) {
        if (status == null) {
            status = app.authStatus;
        }

        if (status) {
            this.galleryView.stop();
            this.creationMenu.stop();

            this.accessMenu.updateStatus('loading');

            this.stackedWidget.currentIndex = 1;
            app.authorize();
            me((user) => {
                if (user.statusCode != 200) {
                    console.log("Access to server failed with error: " + user.statusCode);
                    this.galleryView.stop();
                    this.creationMenu.stop();
                    this.accessMenu.updateStatus('reload');

                    this.stackedWidget.currentIndex = 1;
                    return;
                }

                user = JSON.parse(user.body.toString());

                for (const terms of autoAcceptedTerms) {
                    if (!user.termsAccepted.includes(terms)) {
                        acceptTerms(terms, (response) => {
                            this.init();
                        });

                        return;
                    }
                }

                versions((version_list) => {
                    if (version_list.includes(app.apiVersion)) {
                        this.galleryView.init();
                        this.creationMenu.init();
                        this.stackedWidget.currentIndex = 0;
                    } else if (version_list.includes(-1)) {
                        this.galleryView.stop();
                        this.creationMenu.stop();
                        this.accessMenu.updateStatus('reload');

                        this.stackedWidget.currentIndex = 1;
                    } else {
                        this.galleryView.stop();
                        this.creationMenu.stop();

                        this.accessMenu.updateStatus('api_version');

                        this.stackedWidget.currentIndex = 1;
                    }
                });
            });
        } else {
            this.galleryView.stop();
            this.creationMenu.stop();

            this.accessMenu.updateStatus('login');

            this.stackedWidget.currentIndex = 1;
        }
    }

    stop() {
        this.galleryView.stop();
        this.creationMenu.stop();
    }

    reset(state) {
        this.galleryView.reset(state);
        this.creationMenu.reset();
    }

    onLoginChanged(status) {
        if (app.plugin.isActive) {
            this.init(status);
        }
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        this.menuWidget = this.creationMenu.create(this.widget);

        layout.addWidget(this.menuWidget);

        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, this.widget);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);

        layout.addWidget(separator);

        this.stackedWidget = new Ui.StackedWidget(this.widget);
        this.stackedWidget.setContentsMargins(0, 0, 0, 0);

        this.galleryViewWidget = this.galleryView.create(this.stackedWidget);
        this.accessMenuWidget = this.accessMenu.create(this.stackedWidget);

        this.stackedWidget.addWidget(this.galleryViewWidget);
        this.stackedWidget.addWidget(this.accessMenuWidget);

        layout.addWidget(this.stackedWidget);

        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        this.widget.layout = layout;

        return this.widget;
    }
};
