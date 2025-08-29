import * as Ui from 'LensStudio:Ui';

import { ComboBox } from '../Effects/Controls/ComboBox.js';
import { TabSelection } from '../Effects/Controls/TabSelection.js';

import app from '../../application/app.js';

export class ImportDialog {
    constructor(onImportCallback) {
        this.onImportCallback = onImportCallback;
        this.connections = [];

        this.presetMap = {
            'Standard': {
                'polycount': 7500,
                'textureSize': 512
            },
            'High': {
                'polycount': 15000,
                'textureSize': 1024
            },
            'Max': {
                'polycount': 30000,
                'textureSize': 2048
            }
        };

        this.createImportDialog();
        this.configureControls();
    }

    configureControls() {
        const fillControlsFromPreset = (value) => {
            if (this.presetMap[value]) {
                const polycount = this.presetMap[value].polycount;
                const textureSize = this.presetMap[value].textureSize;

                this.polyCountSettings.blockSignals(true);
                this.polyCountSettings.value = String(polycount);
                this.polyCountSettings.blockSignals(false);

                this.textureSizeSettings.blockSignals(true);
                this.textureSizeSettings.value = String(textureSize);
                this.textureSizeSettings.blockSignals(false);

                this.sizeLabel.text = this.calculateAssetSize(polycount, textureSize) + ' Kb';
            }
        };

        const getPresetFrom = (value, from) => {
            for (const preset in this.presetMap) {
                if (this.presetMap[preset][from] === value) {
                    return preset;
                }
            }
            return null;
        };

        this.assetQualitySettings.addOnValueChanged((value) => {
            fillControlsFromPreset(value);
        });

        this.textureSizeSettings.addOnValueChanged((value) => {
            this.assetQualitySettings.value = getPresetFrom(Number(value), 'textureSize');
        });

        this.polyCountSettings.addOnValueChanged((value) => {
            this.assetQualitySettings.value = getPresetFrom(Number(value), 'polycount');
        });

        fillControlsFromPreset(this.assetQualitySettings.value);
    }

    createImportDialog() {
        // Deletion dialog
        const gui = app.gui;

        this.importDialog = gui.createDialog();
        this.importDialog.windowTitle = 'Import Asset to Project';
        this.importDialog.resize(460, 140);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        // Content

        const contentWidget = new Ui.Widget(this.importDialog);
        contentWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        const contentLayout = new Ui.BoxLayout();
        contentLayout.setDirection(Ui.Direction.TopToBottom);

        this.assetQualitySettings = new ComboBox(contentWidget, 'Asset Quality', null, null, Object.keys(this.presetMap));

        contentLayout.addWidget(this.assetQualitySettings.widget);

        // Frame

        const frame = new Ui.CalloutFrame(contentWidget);
        frame.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);

        const frameLayout = new Ui.BoxLayout();
        frameLayout.setDirection(Ui.Direction.TopToBottom);

        this.polyCountSettings = new TabSelection(frame, 'Polycount', null, null, ['7500', '15000', '30000']); ;

        this.textureSizeSettings = new TabSelection(frame, 'Texture size', null, null, ['512', '1024', '2048']);

        frameLayout.addWidget(this.polyCountSettings.widget);
        frameLayout.addWidget(this.textureSizeSettings.widget);

        frame.layout = frameLayout;

        contentLayout.addWidget(frame);

        // Estimated asset size

        const estAssetSizeWidget = new Ui.Widget(contentWidget);
        const estAssetSizeLayout = new Ui.BoxLayout();

        estAssetSizeLayout.setDirection(Ui.Direction.LeftToRight);

        const titleLabel = new Ui.Label(estAssetSizeWidget);
        titleLabel.text = 'Estimated Asset Size';

        this.sizeLabel = new Ui.Label(estAssetSizeWidget);
        this.sizeLabel.foregroundRole = Ui.ColorRole.HighlightedText;

        estAssetSizeLayout.addWidget(titleLabel);
        estAssetSizeLayout.addStretch(0);
        estAssetSizeLayout.addWidget(this.sizeLabel);

        estAssetSizeWidget.layout = estAssetSizeLayout;

        contentLayout.addWidget(estAssetSizeWidget);

        contentWidget.layout = contentLayout;

        // Cancel / Delete buttons

        const buttonsWidget = new Ui.Widget(this.importDialog);
        const buttonsLayout = new Ui.BoxLayout();
        buttonsLayout.setDirection(Ui.Direction.LeftToRight);

        const cancelButton = new Ui.PushButton(buttonsWidget);
        const importButton = new Ui.PushButton(buttonsWidget);

        cancelButton.text = 'Cancel';
        importButton.text = 'Import';
        importButton.primary = true;

        this.connections.push(cancelButton.onClick.connect(function() {
            this.importDialog.close();
        }.bind(this)));

        this.connections.push(importButton.onClick.connect(function() {
            this.onImportCallback(this.importSettings);
        }.bind(this)));

        buttonsLayout.addStretch(0);
        buttonsLayout.addWidget(cancelButton);
        buttonsLayout.addWidget(importButton);

        buttonsWidget.layout = buttonsLayout;

        layout.addWidget(contentWidget);
        layout.addWidget(buttonsWidget);
        layout.addStretch(0);

        this.importDialog.layout = layout;
    }

    calculateAssetSize(polycount, textureSize) {
        const textureMemoryFootprint = {
            512: 50,
            1024: 210,
            1536: 480,
            2048: 840
        };

        return Math.round((polycount / 50 + textureMemoryFootprint[textureSize]) * 10) / 10;
    }

    get importSettings() {
        return {
            'textureSize': Number(this.textureSizeSettings.value),
            'polycount': Number(this.polyCountSettings.value),
            'preset': this.assetQualitySettings.value.toUpperCase()
        };
    }

    show() {
        this.reset();
        this.importDialog.show();
        this.importDialog.activateWindow();
        this.importDialog.raise();
    }

    close() {
        this.importDialog.close();
    }

    reset() {
        this.assetQualitySettings.value = Object.keys(this.presetMap)[0];
    }
}
