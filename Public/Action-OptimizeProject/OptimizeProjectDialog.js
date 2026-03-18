import { PanelPlugin } from 'LensStudio:PanelPlugin';
import {ProjectOptimizer} from "./ProjectOptimizer.js";
import {OptimizationOption, OptimizationOptionType} from "./OptimizationOptions.js";
import * as Ui from 'LensStudio:Ui';
import * as fs from 'LensStudio:FileSystem';
export class OptimizeProjectDialog extends PanelPlugin {
    static descriptor() {
        return {
            id: 'Com.Snap.OptimizeProjectDialog',
            name: 'Optimize Project',
            description: 'Panel to define optimization options for the further project optimization',
            minimumSize: new Ui.Size(360, 436),
        };
    }

    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);
        this.selectedAssets = new Set();
        this.modelRoot = pluginSystem.findInterface(Editor.Model.IModel);
        this.project = this.modelRoot.project;
        this.assetManager = this.project.assetManager;
        this.projectOptimizer = new ProjectOptimizer(pluginSystem, this.project);

        this.assetTypeCheckBoxes = null;
        this.removeUnusedAssetsCheckBox = null;
        this.removeEmptyFoldersCheckBox = null;
        this.removeUnusedRenderLayersCheckBox = null;
        this.removeUnusedLightSourcesCheckBox = null;
        this.removeDisabledObjectsCheckBox = null;
        this.scopeFolderLineEdit = null;
        this.scopeFolderPathValue = null;
        this._scopeTextSetByUs = null;
        this._scopeLineEditAcceptedValue = '';
    }

    clearScopeField() {
        this.scopeFolderPathValue = null;
        this._scopeLineEditAcceptedValue = '';
        if (this.scopeFolderLineEdit) {
            this.scopeFolderLineEdit.text = '';
            this.scopeFolderLineEdit.readonly = false;
        }
    }

    onAssetSelectionChanged(assetTypeName, checked){
        if (!checked){
            this.selectedAssets.delete(assetTypeName);
        } else {
            this.selectedAssets.add(assetTypeName);
        }
        this.allAssetsCheckBox.checked = this.selectedAssets.size === this.allAssets.length
    }

    createWidget(parent){
        try {
            return this.buildPanelContent(parent);
        } catch (e) {
            console.error(e.message);
            console.error(e.stack);
            return new Ui.Widget(parent);
        }
    }

    createAssetsWidget(dialog, allAssets){
        const vLayout = new Ui.BoxLayout();
        vLayout.setDirection(Ui.Direction.TopToBottom);
        vLayout.setContentsMargins(10, 0, 0, 0);
        this.assetTypeCheckBoxes = {};

        {
            {
                const gridLayout = new Ui.GridLayout();
                gridLayout.setContentsMargins(0, 0, 0, 0);
                let gridWidget = new Ui.Widget(dialog);
                gridWidget.layout = gridLayout;

                const assetTypeLabel = new Ui.Label(dialog);
                assetTypeLabel.text = "Asset Type";
                gridLayout.addWidgetAt(assetTypeLabel, 0, 0, Ui.Alignment.Default);

                const removeLabel = new Ui.Label(dialog);
                removeLabel.text = "";
                gridLayout.addWidgetAt(removeLabel, 0, 1, Ui.Alignment.Default);

                const separator = new Ui.Separator(
                    Ui.Orientation.Horizontal,
                    Ui.Shadow.Raised,
                    dialog);

                gridLayout.addWidgetWithSpan(separator, 1, 0, 1, 2, Ui.Alignment.Default);
                vLayout.addWidget(gridWidget);
            }

            {
                const gridLayout = new Ui.GridLayout();
                gridLayout.setContentsMargins(0, 0, 0, 0);
                const scrollWidget = new Ui.Widget(dialog);
                scrollWidget.layout = gridLayout;
                const scrollArea = new Ui.VerticalScrollArea(dialog);
                scrollArea.setWidget(scrollWidget);

                const labels = allAssets;


                let relatedCheckBoxes = {
                    allAssetsCheckBox: null,
                    assetTypeCheckBoxes: []
                }

                let ignoreRelatedSignals = {
                    ignore: false
                };

                {
                    const label = new Ui.Label(dialog);
                    label.text = "All Assets";
                    gridLayout.addWidgetAt(label, 0, 0, Ui.Alignment.Default);

                    const checkBox = new Ui.CheckBox(dialog);
                    gridLayout.addWidgetAt(checkBox, 0, 1, Ui.Alignment.AlignHCenter);

                    checkBox.onToggle.connect((checked) => {
                        if (ignoreRelatedSignals.ignore){
                            return;
                        }
                        ignoreRelatedSignals.ignore = true;
                        relatedCheckBoxes.assetTypeCheckBoxes.forEach((checkBox) => {
                            checkBox.checked = checked;
                        });
                        ignoreRelatedSignals.ignore = false;
                    });

                    relatedCheckBoxes.allAssetsCheckBox = checkBox;
                }

                for (let i = 0; i < labels.length; i++) {
                    const label = new Ui.Label(dialog);
                    label.text = labels[i];
                    gridLayout.addWidgetAt(label, i + 1, 0, Ui.Alignment.Default);

                    const checkBox = new Ui.CheckBox(dialog);
                    this.assetTypeCheckBoxes[labels[i]] = checkBox;

                    gridLayout.addWidgetAt(checkBox, i + 1, 1, Ui.Alignment.AlignHCenter);
                    relatedCheckBoxes.assetTypeCheckBoxes.push(checkBox);

                    checkBox.onToggle.connect((checked) => {
                        if (ignoreRelatedSignals.ignore){
                            return;
                        }
                        ignoreRelatedSignals.ignore = true;
                        if (!checked) {
                            relatedCheckBoxes.allAssetsCheckBox.checked = false;
                        } else {
                            let checkedCount = 0;
                            relatedCheckBoxes.assetTypeCheckBoxes.forEach((checkBox) => {
                                checkedCount += checkBox.checked ? 1 : 0;
                            });
                            relatedCheckBoxes.allAssetsCheckBox.checked =
                                relatedCheckBoxes.assetTypeCheckBoxes.length === checkedCount;
                        }
                        ignoreRelatedSignals.ignore = false;
                    })

                }

                relatedCheckBoxes.allAssetsCheckBox.checked = true;

                vLayout.addWidget(scrollArea);

            }

        }

        const parentWidget = new Ui.Widget(dialog);
        parentWidget.layout = vLayout;

        return parentWidget;

    }

    buildPanelContent(parent){
        const panelRoot = new Ui.Widget(parent);

        const vLayout = new Ui.BoxLayout();
        vLayout.setDirection(Ui.Direction.TopToBottom);

        const label = new Ui.Label(panelRoot);
        label.text = "Optimize your project by removing \nunused source files in Assets folder,\n" +
            "empty folders, render layers and light sources\n";
        vLayout.addWidget(label);

        {
            const gridLayout = new Ui.GridLayout();
            gridLayout.setContentsMargins(0, 0, 0, 0);

            this.removeEmptyFoldersCheckBox = new Ui.CheckBox(panelRoot);
            this.removeEmptyFoldersCheckBox.checked = true;
            this.removeUnusedRenderLayersCheckBox = new Ui.CheckBox(panelRoot);
            this.removeUnusedRenderLayersCheckBox.checked = true;
            this.removeUnusedLightSourcesCheckBox = new Ui.CheckBox(panelRoot);
            this.removeUnusedLightSourcesCheckBox.checked = true;
            this.removeDisabledObjectsCheckBox = new Ui.CheckBox(panelRoot);
            this.removeDisabledObjectsCheckBox.checked = false;

            const checkBoxLabels = [
                {
                    label: "Remove empty folders",
                    checkBox: this.removeEmptyFoldersCheckBox
                },
                {
                    label: "Remove unused render layers",
                    checkBox: this.removeUnusedRenderLayersCheckBox
                },
                {
                    label: "Remove unused light sources",
                    checkBox: this.removeUnusedLightSourcesCheckBox
                },
                {
                    label: "Remove disabled scene objects",
                    checkBox: this.removeDisabledObjectsCheckBox
                }
            ];

            for (let i = 0; i < checkBoxLabels.length; i++) {
                const labelText = checkBoxLabels[i].label;
                const checkBox = checkBoxLabels[i].checkBox;
                const labelWidget = new Ui.Label(panelRoot);
                labelWidget.text = labelText;
                gridLayout.addWidgetAt(labelWidget, i, 0, Ui.Alignment.Default);
                gridLayout.addWidgetAt(checkBox, i, 1, Ui.Alignment.AlignHCenter);
            }

            const gridWidget = new Ui.Widget(panelRoot);
            gridWidget.layout = gridLayout;

            vLayout.addWidget(gridWidget);

            const labelText = "Remove unused assets";
            const labelWidget = new Ui.Label(panelRoot);
            labelWidget.text = labelText;
            const checkBox = new Ui.CheckBox(panelRoot);
            this.removeUnusedAssetsCheckBox = checkBox;
            this.removeUnusedAssetsCheckBox.checked = true;
            gridLayout.addWidgetAt(labelWidget, checkBoxLabels.length, 0, Ui.Alignment.Default);
            gridLayout.addWidgetAt(checkBox, checkBoxLabels.length, 1, Ui.Alignment.AlignHCenter);

            let projectAssetsSet = new Set();
            this.assetManager.assets.forEach((asset) => {
                projectAssetsSet.add(asset.getTypeName());
            })
            let projectAssets = [];
            projectAssetsSet.forEach((item) => {
                projectAssets.push(item);
            })
            projectAssets = projectAssets.sort();

            let assetsWidget = this.createAssetsWidget(panelRoot, projectAssets);
            assetsWidget.setMaximumHeight(300);

            gridLayout.addWidgetWithSpan(assetsWidget, checkBoxLabels.length + 1, 0, 1, 2, Ui.Alignment.Default);

            assetsWidget.visible = checkBox.checked;

            checkBox.onToggle.connect((checked) => {
                assetsWidget.visible = checked;
                gridWidget.adjustSize();
                panelRoot.adjustSize();
            });

        }

        {
            const scopeLayout = new Ui.GridLayout();
            scopeLayout.setContentsMargins(0, 10, 0, 0);
            const scopeLabel = new Ui.Label(panelRoot);
            scopeLabel.text = "Scope to folder (optional)";
            this.scopeFolderLineEdit = new Ui.LineEdit(panelRoot);
            this.scopeFolderLineEdit.placeholderText = "Drag and drop a folder here to scope optimization";
            this.scopeFolderLineEdit.readonly = false;
            this.scopeFolderLineEdit.onTextChange.connect((text) => {
                if (!text || !text.trim()) {
                    this._scopeLineEditAcceptedValue = '';
                    this._scopeTextSetByUs = '';
                    this.scopeFolderLineEdit.text = '';
                    return;
                }
                const looksLikeDrop = text.indexOf('Paths:') >= 0 || text.indexOf('\n') >= 0;
                if (!looksLikeDrop) {
                    this._scopeTextSetByUs = this._scopeLineEditAcceptedValue || '';
                    this.scopeFolderLineEdit.text = this._scopeLineEditAcceptedValue || '';
                    return;
                }
                const scopeFolderPath = this.projectOptimizer.normalizeScopePath(text.trim());
                if (!scopeFolderPath) {
                    this._scopeTextSetByUs = this._scopeLineEditAcceptedValue || '';
                    this.scopeFolderLineEdit.text = this._scopeLineEditAcceptedValue || '';
                    return;
                }
                const fullPath = this.project.assetsDirectory.appended(scopeFolderPath);
                if (!fs.isDirectory(fullPath)) {
                    this._scopeTextSetByUs = this._scopeLineEditAcceptedValue || '';
                    this.scopeFolderLineEdit.text = this._scopeLineEditAcceptedValue || '';
                    return;
                }
                this._scopeLineEditAcceptedValue = scopeFolderPath;
                if (this.scopeFolderLineEdit.text.trim() !== scopeFolderPath) {
                    this._scopeTextSetByUs = scopeFolderPath;
                    this.scopeFolderLineEdit.text = scopeFolderPath;
                }
            });
            const clearButton = new Ui.PushButton(panelRoot);
            clearButton.text = "Clear";
            clearButton.onClick.connect(() => this.clearScopeField());
            scopeLayout.addWidgetAt(scopeLabel, 0, 0, Ui.Alignment.Default);
            scopeLayout.addWidgetAt(this.scopeFolderLineEdit, 0, 1, Ui.Alignment.Default);
            scopeLayout.addWidgetAt(clearButton, 0, 2, Ui.Alignment.Default);
            const scopeWidget = new Ui.Widget(panelRoot);
            scopeWidget.layout = scopeLayout;
            vLayout.addWidget(scopeWidget);
        }

        {

            const gridLayout = new Ui.GridLayout();
            gridLayout.setContentsMargins(0, 12, 0, 0);

            const gridWidget = new Ui.Widget(panelRoot);
            gridWidget.layout = gridLayout;

            vLayout.addWidget(gridWidget);

            const buttonOptimizeProject = new Ui.PushButton(panelRoot);
            buttonOptimizeProject.setIconMode(Ui.IconMode.Regular);
            buttonOptimizeProject.text = 'Optimize Project';
            buttonOptimizeProject.onClick.connect(() => {
                this.onOptimizeProjectButtonClicked();
            });
            gridLayout.addWidgetAt(buttonOptimizeProject, 0, 0, Ui.Alignment.AlignHCenter);
        }

        panelRoot.layout = vLayout;

        return panelRoot;
    }

    onOptimizeProjectButtonClicked(){
        try {
            let optimizationOptions = [];
            optimizationOptions[OptimizationOptionType.Asset] = new OptimizationOption(OptimizationOptionType.Asset,
                this.removeUnusedAssetsCheckBox.checked, (asset) => {
                    let assetType = asset.getTypeName();
                    if (this.assetTypeCheckBoxes[assetType]){
                        return this.assetTypeCheckBoxes[assetType].checked;
                    }
                    return false;
                });
            optimizationOptions[OptimizationOptionType.Directory] = new OptimizationOption(OptimizationOptionType.Directory,
                this.removeEmptyFoldersCheckBox.checked);
            optimizationOptions[OptimizationOptionType.RenderLayer] = new OptimizationOption(OptimizationOptionType.RenderLayer,
                this.removeUnusedRenderLayersCheckBox.checked)
            optimizationOptions[OptimizationOptionType.LightSource] = new OptimizationOption(OptimizationOptionType.LightSource,
                this.removeUnusedLightSourcesCheckBox.checked);
            optimizationOptions[OptimizationOptionType.SceneObject] = new OptimizationOption(OptimizationOptionType.SceneObject,
                this.removeDisabledObjectsCheckBox.checked, (sceneObject) => {
                    return !sceneObject.enabled;
                })
            const rawScope = this.scopeFolderPathValue || (this.scopeFolderLineEdit && this.scopeFolderLineEdit.text ? this.scopeFolderLineEdit.text.trim() : null);
            let scopeFolderPath = this.projectOptimizer.normalizeScopePath(rawScope);
            if (scopeFolderPath) {
                const fullPath = this.project.assetsDirectory.appended(scopeFolderPath);
                if (!fs.isDirectory(fullPath)) {
                    if (this.scopeFolderLineEdit) {
                        this.scopeFolderLineEdit.text = '';
                        this.scopeFolderLineEdit.readonly = false;
                    }
                    return;
                }
            }
            this.projectOptimizer.optimizeProject(optimizationOptions, scopeFolderPath || null);
        } catch (e){
            console.error(e.message);
            console.error(e.stack);
        }
    }

}
