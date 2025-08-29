import { PanelPlugin as Panel } from 'LensStudio:PanelPlugin';
import * as Ui from 'LensStudio:Ui';
import { WidgetFactory } from '../WidgetFactory.js';
import { BitmojiComponentPreset } from './preset.js';
import { PLUGIN_ID } from './constants.js';

export class EmptyPlugin extends Panel {
    static descriptor() {
        return {
            id: PLUGIN_ID,
            name: 'Bitmoji Empty Panel',
            dependencies: [Ui.IGui],
            menuActionHierarchy: [''],
            isUnique: true,
        };
    }

    createWidget(parent) {
        const widget = WidgetFactory.beginWidget(parent).sizePolicy(Ui.SizePolicy.Policy.Expanding).end();

        this.label = WidgetFactory.beginLabel(widget).text("Select Bitmoji 3D Component to edit").fontRole(Ui.FontRole.LargeTitle).end();

        this.button = WidgetFactory.beginPushButton(widget).text("Bitmoji 3D Component").icon(Editor.Icon.fromFile(import.meta.resolve("./Resources/icon_plus.svg"))).iconMode(Ui.IconMode.MonoChrome).end();
        this.onButtonClickedConnection = this.button.onClick.connect(() => this.importBitmoji());

        widget.layout = WidgetFactory.beginVerticalLayout()
            .addStretch()
            .addWidget(this.label, Ui.Alignment.AlignCenter)
            .addWidget(this.button, Ui.Alignment.AlignCenter)
            .addStretch()
            .end();

        return widget;
    }

    importBitmoji() {
        const model = this.pluginSystem.findInterface(Editor.Model.IModel);
        const project = model.project;
        const selection = project.selection;

        let destination = selection.entities.find((entity) => entity.isOfType("SceneObject"));

        const preset = new BitmojiComponentPreset(this.pluginSystem);
        preset.createAsync(destination).then((so) => {
            project.selection.set([so]);
        }).catch((error) => {
            console.error("Failed to import:", error);
        });
    }

    deinit() {
        if (this.onButtonClickedConnection) {
            this.onButtonClickedConnection.disconnect();
            this.onButtonClickedConnection = null;
        }
    }
}
