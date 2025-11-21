import { DialogPlugin } from 'LensStudio:DialogPlugin';
import {ProjectOptimizer} from "./ProjectOptimizer.js";
import {OptimizationOption, OptimizationOptionType} from "./OptimizationOptions.js";
import * as Ui from 'LensStudio:Ui';
export class OptimizeProjectDialog extends DialogPlugin {
    static descriptor() {
        return {
            id: 'Com.Snap.OptimizeProjectDialog',
            name: 'Optimize Project',
            description: 'Dialog to define optimization options for the further project optimization',
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
    }

    onAssetSelectionChanged(assetTypeName, checked){
        if (!checked){
            this.selectedAssets.delete(assetTypeName);
        } else {
            this.selectedAssets.add(assetTypeName);
        }
        this.allAssetsCheckBox.checked = this.selectedAssets.size === this.allAssets.length
    }

    show(mainWindow){
        try {
            return this.createDialog(mainWindow);
        } catch (e) {
            console.error(e.message);
            console.error(e.stack);
            return new Ui.Dialog(mainWindow);
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

    createDialog(mainWindow){
        const dialog = new Ui.Dialog(mainWindow);

        const vLayout = new Ui.BoxLayout();
        vLayout.setDirection(Ui.Direction.TopToBottom);

        const label = new Ui.Label(dialog);
        label.text = "Optimize your project by removing \nunused source files in Assets folder,\n" +
            "empty folders, render layers and light sources\n";
        vLayout.addWidget(label);

        {
            const gridLayout = new Ui.GridLayout();
            gridLayout.setContentsMargins(0, 0, 0, 0);

            this.removeEmptyFoldersCheckBox = new Ui.CheckBox(dialog);
            this.removeEmptyFoldersCheckBox.checked = true;
            this.removeUnusedRenderLayersCheckBox = new Ui.CheckBox(dialog);
            this.removeUnusedRenderLayersCheckBox.checked = true;
            this.removeUnusedLightSourcesCheckBox = new Ui.CheckBox(dialog);
            this.removeUnusedLightSourcesCheckBox.checked = true;
            this.removeDisabledObjectsCheckBox = new Ui.CheckBox(dialog);
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
                const labelWidget = new Ui.Label(dialog);
                labelWidget.text = labelText;
                gridLayout.addWidgetAt(labelWidget, i, 0, Ui.Alignment.Default);
                gridLayout.addWidgetAt(checkBox, i, 1, Ui.Alignment.AlignHCenter);
            }

            const gridWidget = new Ui.Widget(dialog);
            gridWidget.layout = gridLayout;

            vLayout.addWidget(gridWidget);

            const labelText = "Remove unused assets";
            const labelWidget = new Ui.Label(dialog);
            labelWidget.text = labelText;
            const checkBox = new Ui.CheckBox(dialog);
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

            let assetsWidget = this.createAssetsWidget(dialog, projectAssets);
            assetsWidget.setMaximumHeight(300);

            gridLayout.addWidgetWithSpan(assetsWidget, checkBoxLabels.length + 1, 0, 1, 2, Ui.Alignment.Default);

            assetsWidget.visible = checkBox.checked;

            checkBox.onToggle.connect((checked) => {
                assetsWidget.visible = checked;
                gridWidget.adjustSize();
                dialog.adjustSize();
            });

        }

        {

            const gridLayout = new Ui.GridLayout();
            gridLayout.setContentsMargins(0, 0, 0, 0);

            const gridWidget = new Ui.Widget(dialog);
            gridWidget.layout = gridLayout;

            vLayout.addWidget(gridWidget);

            const buttonCancel = new Ui.PushButton(dialog);
            buttonCancel.text = 'Cancel';
            buttonCancel.onClick.connect(() => {
                dialog.close();
            });
            buttonCancel.setIconMode(Ui.IconMode.MonoChrome)
            gridLayout.addWidgetAt(buttonCancel, 0, 0, Ui.Alignment.AlignHCenter);

            const buttonOptimizeProject = new Ui.PushButton(dialog);
            buttonOptimizeProject.setIconMode(Ui.IconMode.Regular);
            buttonOptimizeProject.text = 'Optimize Project';
            buttonOptimizeProject.onClick.connect(() => {
                this.onOptimizeProjectButtonClicked();
            });
            gridLayout.addWidgetAt(buttonOptimizeProject, 0, 1, Ui.Alignment.AlignHCenter);
        }

        dialog.layout = vLayout;

        return dialog;
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
            this.projectOptimizer.optimizeProject(optimizationOptions);
        } catch (e){
            console.error(e.message);
            console.error(e.stack);
        }
    }

}
