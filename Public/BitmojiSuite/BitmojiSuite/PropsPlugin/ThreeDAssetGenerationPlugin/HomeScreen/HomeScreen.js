import * as Ui from 'LensStudio:Ui';

import { GalleryView } from './GalleryView.js';
import { CreationMenu } from './CreationMenu.js';
import { DraftMeshPreview } from './DraftMeshPreview.js';
import { AccessMenu } from './AccessMenu.js';

import app from '../../application/app.js';

import { versions, me, acceptTerms } from '../api.js';

const autoAcceptedTerms = ['ls_terms_1'];

export class HomeScreen {
    constructor(onStateChanged) {
        this.connections = [];
        this.galleryView = new GalleryView(onStateChanged);
        this.creationMenu = new CreationMenu(onStateChanged, this.reset.bind(this));
        this.draftMeshPreview = new DraftMeshPreview(onStateChanged, this.reset.bind(this));

        this.accessMenu = new AccessMenu(onStateChanged);

        this.onStateChanged = onStateChanged;
        this.isDeinitialized = false;

        app.subscribeOnAuth((status) => {
            this.onLoginChanged(status);
        });
    }

    init(status) {
        if (status == null) {
            status = app.authStatus;
        }

        if (status) {
            //this.galleryView.stop();
            this.creationMenu.stop();

            this.accessMenu.updateStatus('loading');

            this.stackedWidget.currentIndex = 2;
            app.authorize();

            me((user) => {
                if (this.isDeinitialized) {
                    return;
                }
                if (user.statusCode != 200) {
                    console.log("Access to server failed with error: " + user.statusCode);
                    this.galleryView.stop();
                    this.creationMenu.stop();
                    this.accessMenu.updateStatus('reload');

                    this.stackedWidget.currentIndex = 2;
                    return;
                }

                user = JSON.parse(user.body.toString());

                for (const terms of autoAcceptedTerms) {
                    if (!user.termsAccepted.includes(terms)) {
                        acceptTerms(terms, (response) => {
                            if (this.isDeinitialized) {
                                return;
                            }
                            this.init();
                        });

                        return;
                    }
                }

                versions((version_list) => {
                    if (this.isDeinitialized) {
                        return;
                    }
                    if (version_list.includes(app.apiVersion)) {
                        this.galleryView.init();
                        this.creationMenu.init();
                        this.draftMeshPreview.init();
                        this.stackedWidget.currentIndex = 0;
                    } else if (version_list.includes(-1)) {
                        this.galleryView.stop();
                        this.creationMenu.stop();
                        this.draftMeshPreview.reset();

                        this.accessMenu.updateStatus('reload');

                        this.stackedWidget.currentIndex = 1;
                    } else {
                        this.galleryView.stop();
                        this.creationMenu.stop();
                        this.draftMeshPreview.reset();

                        this.accessMenu.updateStatus('api_version');

                        this.stackedWidget.currentIndex = 2;
                    }
                });

            });
        } else {
            this.galleryView.stop();
            this.creationMenu.stop();
            this.draftMeshPreview.reset();

            this.accessMenu.updateStatus('login');

            this.stackedWidget.currentIndex = 2;
        }
    }

    stop() {
        this.galleryView.stop();
        this.creationMenu.stop();
        this.draftMeshPreview.reset();
    }

    reset(state) {
        this.galleryView.reset(state);
        this.creationMenu.reset(state);
        this.draftMeshPreview.reset();

        if (state.screen) {
            if (state.sub_screen && state.sub_screen == 'draft_mesh') {
                this.draftMeshPreview.reset(state);
                this.stackedWidget.currentIndex = 1;
                //this.creationMenu.backButton.visible = true;
            } else {
                this.stackedWidget.currentIndex = 0;
                //this.creationMenu.backButton.visible = false;
            }
        }
    }

    onLoginChanged(status) {
        if (app.plugin.isActive) {
            this.init(status);
        }
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        this.menuWidget = this.creationMenu.create(this.widget);

        layout.addWidget(this.menuWidget);

        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, this.widget);
        separator.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Expanding);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);

        layout.addWidget(separator);

        this.stackedWidget = new Ui.StackedWidget(this.widget);
        this.stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        this.stackedWidget.setContentsMargins(0, 0, 0, 0);
        this.stackedWidget.setMinimumWidth(1);

        this.galleryViewWidget = this.galleryView.create(this.stackedWidget);
        this.draftMeshPreviewWidget = this.draftMeshPreview.create(this.stackedWidget);
        this.accessMenuWidget = this.accessMenu.create(this.stackedWidget);

        this.stackedWidget.addWidget(this.galleryViewWidget);
        this.stackedWidget.addWidget(this.draftMeshPreviewWidget);
        this.stackedWidget.addWidget(this.accessMenuWidget);

        layout.addWidget(this.stackedWidget);
        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        this.widget.layout = layout;

        return this.widget;
    }

    deinit() {
        this.isDeinitialized = true;
        if (this.creationMenu) {
            this.creationMenu.deinit();
        }
        if (this.galleryView) {
            this.galleryView.deinit();
        }
        if (this.draftMeshPreview) {
            this.draftMeshPreview.deinit();
        }
    }
};
