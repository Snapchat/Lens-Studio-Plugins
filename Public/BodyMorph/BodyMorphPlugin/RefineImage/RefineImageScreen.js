import * as Ui from 'LensStudio:Ui';

import { createBackButton, downloadFileFromBucket, convertIntensityToAPIStyle, createErrorIcon, getRandomInt } from '../utils.js';
import { generateUpload, updateUpload, createMorph } from '../api.js';
import { TextEdit } from '../Effects/Controls/TextEdit.js';

import app from '../../application/app.js';
import { logEventAssetCreation } from '../../application/analytics.js';

const MAX_SYMBOLS = 200;
const ARROW_ICON_SIZE = 24;

export class RefineImageScreen {
    constructor(onStateChanged) {
        this.connections = [];
        this.onStateChanged = onStateChanged;

        this.currentUploadUid = null;
        this.currentUploadUrl = null;
        this.useCase = 'default';
        this.intensity = 'Medium';
        this.headless = false;
        this.initialPrompt = '';
        this.isGenerating = false;
        this.showingError = false;

        this.history = [];
        this.historyIndex = -1;
    }

    updateState(state) {
        this.currentUploadUid = state.uploadUid;
        this.currentUploadUrl = state.uploadUrl;
        this.useCase = state.useCase;
        this.intensity = state.intensity;
        this.headless = state.headless;
        this.initialPrompt = state.prompt || '';

        this.promptEdit.value = '';
        this.refineButton.enabled = false;
        this.trainButton.enabled = false;
        this.history = [];
        this.historyIndex = -1;
        this.updateHistoryButtons();

        if (this.useCase === 'bodymorph') {
            this.inProgressLabel.text = '<center>Don\'t close this screen.</center><center>Image refinement is in progress.</center><center>Usually it takes about 10 seconds.</center>';
        } else {
            this.inProgressLabel.text = '<center>Don\'t close this screen.</center><center>Image generation is in progress.</center><center>Usually it takes about 10 seconds.</center>';
        }
        this.previewStack.currentIndex = 1;

        if (this.useCase === 'bodymorph') {
            updateUpload(this.initialPrompt, this.currentUploadUid, function(response) {
                if (response.statusCode == 200 || response.statusCode == 201) {
                    const body = JSON.parse(response.body.toString());
                    this.currentUploadUid = body.uid;
                    this.currentUploadUrl = body.url;
                    this.pushToHistory(body.uid, body.url);
                    this.loadPreviewImage(body.url, body.uid);
                    this.trainButton.enabled = true;
                } else {
                    app.log('Failed to generate initial preview, please try again.');
                    this.previewStack.currentIndex = 2;
                }
            }.bind(this), 'bodymorph');
        } else {
            generateUpload(this.initialPrompt, function(response) {
                if (response.statusCode == 200 || response.statusCode == 201) {
                    const body = JSON.parse(response.body.toString());
                    this.currentUploadUid = body.uid;
                    this.currentUploadUrl = body.url;
                    this.pushToHistory(body.uid, body.url);
                    this.loadPreviewImage(body.url, body.uid);
                    this.trainButton.enabled = true;
                } else {
                    app.log('Failed to generate image, please try again.');
                    this.previewStack.currentIndex = 2;
                }
            }.bind(this));
        }
    }

    loadPreviewImage(url, uid) {
        downloadFileFromBucket(url, uid, (filePath) => {
            if (filePath) {
                const pixmap = new Ui.Pixmap(filePath);
                pixmap.resize(400, 400);
                this.cachePixmap(uid, pixmap);
                this.previewImageView.pixmap = pixmap;
                this.previewStack.currentIndex = 0;
            }
        });
    }

    cachePixmap(uid, pixmap) {
        const entry = this.history.find(h => h.uid === uid);
        if (entry) {
            entry.pixmap = pixmap;
        }
    }

    refine() {
        const prompt = this.promptEdit.value;
        if (!prompt || prompt.length === 0) {
            return;
        }

        this.refineButton.enabled = false;
        this.trainButton.enabled = false;
        this.prevActive = false;
        this.nextActive = false;
        this.prevButton.pixmap = this.transparentPixmap;
        this.nextButton.pixmap = this.transparentPixmap;
        this.isGenerating = true;
        this.inProgressLabel.text = '<center>Don\'t close this screen.</center><center>Image refinement is in progress.</center><center>Usually it takes about 10 seconds.</center>';
        this.previewStack.currentIndex = 1;

        app.log('Refining image...', { 'progressBar': true });

        updateUpload(prompt, this.currentUploadUid, function(response) {
            this.isGenerating = false;
            this.showingError = false;
            if (response.statusCode == 200 || response.statusCode == 201) {
                const body = JSON.parse(response.body.toString());
                this.currentUploadUid = body.uid;
                this.currentUploadUrl = body.url;
                this.pushToHistory(body.uid, body.url);
                this.loadPreviewImage(body.url, body.uid);
                this.trainButton.enabled = true;
                app.log('', { 'enabled': false });
            } else if (response.statusCode == 400) {
                app.log('The result violates our community guidelines');
                this.showingError = true;
                this.previewStack.currentIndex = 2;
                this.trainButton.enabled = false;
            } else {
                app.log('Something went wrong, please try again.');
                this.showingError = true;
                this.previewStack.currentIndex = 2;
                this.trainButton.enabled = true;
            }
            this.updateRefineButtonState();
            this.updateHistoryButtons();
        }.bind(this), 'default');
    }

    train() {
        this.trainButton.enabled = false;
        this.refineButton.enabled = false;
        app.log(`Creating new ${app.name}...`, { 'progressBar': true });

        const request = {
            'userNotes': '',
            'settings': {
                'pipeline': 'bodymorph',
                'prompt': this.initialPrompt,
                'intensity': convertIntensityToAPIStyle(this.intensity),
                'speedQuality': false,
                'skipMorphing': false,
                'seed': getRandomInt(1, Math.pow(2, 31) - 1),
                'parentId': null,
                'costumeOnly': this.headless,
            },
            'uploadUid': this.currentUploadUid,
        };

        let status;
        let preset = request.settings.costumeOnly ? "WITHOUT_HEAD" : "WITH_HEAD";
        let settings;

        createMorph(request, function(response) {
            if (response.statusCode == 201) {
                status = "SUCCESS";
                this.onStateChanged({
                    'screen': 'default',
                    'needsUpdate': true,
                });
                app.log(`${app.name} is queued. ${app.name} creation is estimated to take 15-20 min, please check back later.`, { 'progressBar': true });
            } else if (response.statusCode == 400) {
                status = "GUIDELINES_VIOLATION";
                app.log('The result violates our community guidelines');
                this.trainButton.enabled = true;
            } else {
                status = "FAILED";
                app.log('Something went wrong, please try again.');
                this.trainButton.enabled = true;
            }

            switch (request.settings.intensity) {
                case "low":
                    settings = "INTENSITY_LOW";
                    break;
                case "med":
                    settings = "INTENSITY_MEDIUM";
                    break;
                case "high":
                    settings = "INTENSITY_HIGH";
                    break;
            }

            logEventAssetCreation(status, preset, settings, "NEW", "PROMPT_IMAGE");
            this.updateRefineButtonState();
        }.bind(this));
    }

    pushToHistory(uid, url) {
        this.history.push({ uid, url });
        this.historyIndex = this.history.length - 1;
        this.updateHistoryButtons();
    }

    navigateHistory(index) {
        if (this.showingError) {
            this.showingError = false;
            const entry = this.history[this.historyIndex];
            if (entry.pixmap) {
                this.previewImageView.pixmap = entry.pixmap;
                this.previewStack.currentIndex = 0;
            } else {
                this.loadPreviewImage(entry.url, entry.uid);
            }
            this.trainButton.enabled = true;
            this.updateHistoryButtons();
            return;
        }
        if (index < 0 || index >= this.history.length) {
            return;
        }
        this.historyIndex = index;
        const entry = this.history[this.historyIndex];
        this.currentUploadUid = entry.uid;
        this.currentUploadUrl = entry.url;
        if (entry.pixmap) {
            this.previewImageView.pixmap = entry.pixmap;
            this.previewStack.currentIndex = 0;
        } else {
            this.loadPreviewImage(entry.url, entry.uid);
        }
        this.trainButton.enabled = true;
        this.updateHistoryButtons();
    }

    updateHistoryButtons() {
        this.prevActive = this.showingError || this.historyIndex > 0;
        this.nextActive = !this.showingError && this.historyIndex < this.history.length - 1;

        if (this.prevButton) {
            this.prevButton.pixmap = this.prevActive ? this.leftArrowPixmap : this.transparentPixmap;
        }
        if (this.nextButton) {
            this.nextButton.pixmap = this.nextActive ? this.rightArrowPixmap : this.transparentPixmap;
        }
    }

    updateRefineButtonState() {
        const prompt = this.promptEdit.value;
        this.refineButton.enabled = (prompt && prompt.length > 0) && !this.isGenerating;
    }

    createHeader(parent) {
        const header = new Ui.Widget(parent);
        header.setFixedHeight(33);

        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(8, 8, 8, 8);

        this.backButton = createBackButton(header);
        this.connections.push(this.backButton.onClick.connect(function() {
            this.onStateChanged({
                'screen': 'default',
                'needsUpdate': false,
            });
            app.log('', { 'enabled': false });
        }.bind(this)));

        const headerTitle = new Ui.Label(header);
        headerTitle.text = 'Refine Image';
        headerTitle.fontRole = Ui.FontRole.TitleBold;

        headerLayout.addWidget(this.backButton);
        headerLayout.addStretch(0);
        headerLayout.addWidget(headerTitle);
        headerLayout.addStretch(0);

        header.layout = headerLayout;
        return header;
    }

    createMenu(parent) {
        const menu = new Ui.Widget(parent);
        const menuLayout = new Ui.BoxLayout();
        menuLayout.setDirection(Ui.Direction.TopToBottom);
        menuLayout.setContentsMargins(16, 8, 16, 8);
        menuLayout.spacing = Ui.Sizes.Spacing;

        const promptLabel = new Ui.Label(menu);
        promptLabel.text = 'Prompt';

        this.promptEdit = new TextEdit(menu, null, null, null, 'Describe changes...', MAX_SYMBOLS);
        this.promptEdit.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        this.promptEdit.addOnValueChanged(() => {
            this.updateRefineButtonState();
        });

        const descriptionLabel = new Ui.Label(menu);
        descriptionLabel.text = 'Targeted Image Editing allows you to change specific parts of an image by describing exactly what you want to edit. The model focuses on the requested area while keeping the rest of the image consistent, so you can refine the same image across multiple steps.';
        descriptionLabel.wordWrap = true;

        const examplesLabel = new Ui.Label(menu);
        examplesLabel.text = 'For example:\n- Add a red tie\n- Remove the glasses\n- Make the car blue';
        examplesLabel.wordWrap = true;

        const spacer = new Ui.Widget(menu);
        spacer.setFixedHeight(16);

        menuLayout.addWidget(descriptionLabel);
        menuLayout.addWidget(spacer);
        menuLayout.addWidget(examplesLabel);
        menuLayout.addWidget(spacer);
        menuLayout.addWidget(promptLabel);
        menuLayout.addWidget(this.promptEdit.widget);
        menuLayout.addStretch(0);

        menu.layout = menuLayout;
        return menu;
    }

    createFooter(parent) {
        const footer = new Ui.Widget(parent);
        footer.setFixedHeight(65);

        const footerLayout = new Ui.BoxLayout();
        footerLayout.setDirection(Ui.Direction.LeftToRight);
        footerLayout.setContentsMargins(8, 12, 8, 8);
        footerLayout.spacing = 4;

        this.refineButton = new Ui.PushButton(footer);
        this.refineButton.text = 'Refine Image';
        this.refineButton.enabled = false;
        this.connections.push(this.refineButton.onClick.connect(() => {
            this.refine();
        }));

        this.trainButton = new Ui.PushButton(footer);
        this.trainButton.text = 'Confirm Changes';
        this.trainButton.enabled = false;
        this.connections.push(this.trainButton.onClick.connect(() => {
            this.train();
        }));

        footerLayout.addStretch(0);
        footerLayout.addWidgetWithStretch(this.refineButton, 0, Ui.Alignment.AlignTop);
        footerLayout.addWidgetWithStretch(this.trainButton, 0, Ui.Alignment.AlignTop);

        footer.layout = footerLayout;
        return footer;
    }

    createRefineInProgressWidget(parent) {
        const frame = new Ui.Widget(parent);
        frame.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const frameLayout = new Ui.BoxLayout();
        frameLayout.setDirection(Ui.Direction.TopToBottom);
        frameLayout.setContentsMargins(0, 0, 0, 0);
        frameLayout.spacing = Ui.Sizes.Spacing;

        const header = new Ui.Widget(parent);
        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(0, 0, 0, 0);

        const icon = new Ui.ProgressIndicator(header);
        icon.start();
        const headerLabel = new Ui.Label(header);
        headerLabel.text = 'In Progress';
        headerLabel.fontRole = Ui.FontRole.TitleBold;

        headerLayout.addWidget(icon);
        headerLayout.addWidget(headerLabel);
        header.layout = headerLayout;

        frameLayout.addStretch(0);
        frameLayout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignCenter);

        this.inProgressLabel = new Ui.Label(frame);
        this.inProgressLabel.text = '';

        frameLayout.addWidgetWithStretch(this.inProgressLabel, 0, Ui.Alignment.AlignCenter);
        frameLayout.addStretch(0);

        frame.layout = frameLayout;
        return frame;
    }

    createRefineErrorWidget(parent) {
        const frame = new Ui.Widget(parent);
        frame.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const frameLayout = new Ui.BoxLayout();
        frameLayout.setDirection(Ui.Direction.TopToBottom);
        frameLayout.setContentsMargins(0, 0, 0, 0);
        frameLayout.spacing = Ui.Sizes.Spacing;

        const header = new Ui.Widget(parent);
        const headerLayout = new Ui.BoxLayout();
        headerLayout.setDirection(Ui.Direction.LeftToRight);
        headerLayout.setContentsMargins(0, 0, 0, 0);

        const icon = createErrorIcon(header);
        const headerLabel = new Ui.Label(header);
        headerLabel.text = 'Generation Failed';
        headerLabel.fontRole = Ui.FontRole.TitleBold;

        headerLayout.addWidget(icon);
        headerLayout.addWidget(headerLabel);
        header.layout = headerLayout;

        frameLayout.addStretch(0);
        frameLayout.addWidgetWithStretch(header, 0, Ui.Alignment.AlignCenter);

        const disclaimerLabel = new Ui.Label(frame);
        disclaimerLabel.text = '<center>There was a problem with generating the image.</center><center>Please try to generate another one.</center>';

        frameLayout.addWidgetWithStretch(disclaimerLabel, 0, Ui.Alignment.AlignCenter);
        frameLayout.addStretch(0);

        frame.layout = frameLayout;
        return frame;
    }

    createHistoryArrows(parent) {
        this.leftArrowPixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/arrow-left.svg')));
        this.leftArrowHoverPixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/arrow-left-hover.svg')));
        this.rightArrowPixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/arrow-right.svg')));
        this.rightArrowHoverPixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/arrow-right-hover.svg')));
        this.transparentPixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('../Resources/transparent.png')));

        this.prevActive = false;
        this.nextActive = false;

        this.prevButton = new Ui.ImageView(parent);
        this.prevButton.pixmap = this.transparentPixmap;
        this.prevButton.scaledContents = true;
        this.prevButton.responseHover = true;
        this.prevButton.setFixedWidth(ARROW_ICON_SIZE);
        this.prevButton.setFixedHeight(ARROW_ICON_SIZE);
        this.prevButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        this.connections.push(
            this.prevButton.onHover.connect((hovered) => {
                if (!this.prevActive) return;
                this.prevButton.pixmap = hovered ? this.leftArrowHoverPixmap : this.leftArrowPixmap;
            }),
            this.prevButton.onClick.connect(() => {
                if (!this.prevActive) return;
                this.navigateHistory(this.historyIndex - 1);
            }),
        );

        this.nextButton = new Ui.ImageView(parent);
        this.nextButton.pixmap = this.transparentPixmap;
        this.nextButton.scaledContents = true;
        this.nextButton.responseHover = true;
        this.nextButton.setFixedWidth(ARROW_ICON_SIZE);
        this.nextButton.setFixedHeight(ARROW_ICON_SIZE);
        this.nextButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);

        this.connections.push(
            this.nextButton.onHover.connect((hovered) => {
                if (!this.nextActive) return;
                this.nextButton.pixmap = hovered ? this.rightArrowHoverPixmap : this.rightArrowPixmap;
            }),
            this.nextButton.onClick.connect(() => {
                if (!this.nextActive) return;
                this.navigateHistory(this.historyIndex + 1);
            }),
        );
    }

    createPreviewPanel(parent) {
        const previewWidget = new Ui.Widget(parent);
        previewWidget.setFixedWidth(480);
        previewWidget.setFixedHeight(620);

        const previewLayout = new Ui.BoxLayout();
        previewLayout.setDirection(Ui.Direction.TopToBottom);
        previewLayout.setContentsMargins(0, 0, 0, 0);

        const imageRow = new Ui.Widget(previewWidget);
        const imageRowLayout = new Ui.BoxLayout();
        imageRowLayout.setDirection(Ui.Direction.LeftToRight);
        imageRowLayout.spacing = 8;

        this.createHistoryArrows(imageRow);

        this.previewStack = new Ui.StackedWidget(imageRow);
        this.previewStack.setFixedWidth(400);
        this.previewStack.setFixedHeight(400);

        this.previewImageView = new Ui.ImageView(this.previewStack);
        this.previewImageView.setFixedHeight(400);
        this.previewImageView.setFixedWidth(400);
        this.previewImageView.scaledContents = true;

        this.previewStack.addWidget(this.previewImageView);
        this.previewStack.addWidget(this.createRefineInProgressWidget(this.previewStack));
        this.previewStack.addWidget(this.createRefineErrorWidget(this.previewStack));
        this.previewStack.currentIndex = 0;

        imageRowLayout.addStretch(0);
        imageRowLayout.addWidgetWithStretch(this.prevButton, 0, Ui.Alignment.AlignVCenter);
        imageRowLayout.addWidget(this.previewStack);
        imageRowLayout.addWidgetWithStretch(this.nextButton, 0, Ui.Alignment.AlignVCenter);
        imageRowLayout.addStretch(0);
        imageRow.layout = imageRowLayout;

        previewLayout.addStretch(0);
        previewLayout.addWidget(imageRow);
        previewLayout.addStretch(0);

        const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, previewWidget);
        separator.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        previewLayout.addWidget(separator);

        previewLayout.addWidget(this.createFooter(previewWidget));

        previewLayout.spacing = 0;
        previewWidget.layout = previewLayout;

        return previewWidget;
    }

    createMenuPanel(parent) {
        const menuPanel = new Ui.Widget(parent);
        menuPanel.setFixedWidth(320);
        menuPanel.setFixedHeight(620);
        menuPanel.setContentsMargins(0, 0, 0, 0);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);

        layout.addWidget(this.createHeader(menuPanel));

        const separator1 = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, menuPanel);
        separator1.setFixedHeight(Ui.Sizes.SeparatorLineWidth);
        layout.addWidget(separator1);

        layout.addWidget(this.createMenu(menuPanel));
        layout.addStretch(0);

        menuPanel.backgroundRole = Ui.ColorRole.Midlight;
        menuPanel.autoFillBackground = true;
        layout.spacing = 0;
        menuPanel.layout = layout;

        return menuPanel;
    }

    create(parent) {
        this.widget = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);

        layout.addWidget(this.createMenuPanel(this.widget));

        const separator = new Ui.Separator(Ui.Orientation.Vertical, Ui.Shadow.Plain, this.widget);
        separator.setFixedWidth(Ui.Sizes.SeparatorLineWidth);
        layout.addWidget(separator);

        layout.addWidget(this.createPreviewPanel(this.widget));

        layout.setContentsMargins(0, 0, 0, 0);
        layout.spacing = 0;

        this.widget.layout = layout;

        return this.widget;
    }
}
