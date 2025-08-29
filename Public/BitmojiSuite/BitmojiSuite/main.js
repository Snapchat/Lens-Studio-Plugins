import * as Ui from "LensStudio:Ui";

import { EditorPlugin } from 'LensStudio:EditorPlugin';
import { BITMOJI_3D_COMPONENT_UID, PLUGIN_ID } from './constants.js';

import { BitmojiOutfit } from "./OutfitPlugin/main.js";
import { BitmojiAnimation } from "./AnimationPlugin/main.js";
import { BitmojiProps } from "./PropsPlugin/main.js";
import { EmptyPlugin } from "./EmptyPlugin/main.js";
import { LoginPlugin } from "./LoginPlugin/main.js";

import { findDescriptor } from "./utils.js";
import { WidgetFactory } from "./WidgetFactory.js";

const plugins = [
    BitmojiOutfit,
    BitmojiAnimation,
    BitmojiProps
]

const isBitmojiComponent = (entity) => {
    if (entity.isOfType("ScriptComponent")) {
        if (entity.scriptAsset && entity.scriptAsset.componentId == BITMOJI_3D_COMPONENT_UID) {
            return true;
        }
    }

    return false;
}

const findBitmojiComponent = (entity) => {
    if (Array.isArray(entity)) {
        return entity.find((entity) => isBitmojiComponent(entity));
    } else if (entity.isOfType('SceneObject')) {
        return entity.getComponents('ScriptComponent').find((component) => isBitmojiComponent(component));
    } else if (entity.isOfType('ScriptComponent') && isBitmojiComponent(entity)) {
        return entity;
    } else {
        return undefined;
    }
}

export class BitmojiSuite extends EditorPlugin {
    static descriptor() {
        const descriptor = {
            id: PLUGIN_ID,
            name: "Bitmoji Suite",
            description: "Bitmoji Suite",
            canEdit: isBitmojiComponent,
            defaultSize: new Ui.Size(800, 500),
            minimumSize: new Ui.Size(650, 500),
            isUnique: true
        };

        return descriptor;
    }

    constructor(pluginSystem) {
        super(pluginSystem);

        this.onSelectionChangeConnection = null;
        this.onProjectChangedConnection = null;

        this.model = this.pluginSystem.findInterface(Editor.Model.IModel);
        this.onProjectChangedConnection = this.model.onProjectChanged.connect(() => this.subscribe());

        this.panelPluginList = [];

        plugins.forEach((plugin) => {
            const descriptor = findDescriptor(pluginSystem, plugin);
            this.panelPluginList.push(pluginSystem.create(descriptor));
        });

        // to-do: consider adding to plugin list
        {
            const descriptor = findDescriptor(pluginSystem, EmptyPlugin);
            this.emptyPlugin = pluginSystem.create(descriptor);
        }

        {
            const descriptor = findDescriptor(pluginSystem, LoginPlugin);
            this.loginPlugin = pluginSystem.create(descriptor);
        }
    }

    createWidget(parent) {
        this.currentIndex = -1;
        this.currentWidget = null;

        this.widget = WidgetFactory.beginWidget(parent).sizePolicy(Ui.SizePolicy.Policy.Expanding).end();

        const { container: tabContainer, widget: tabBar } = this.createTabBar(this.widget);
        this.tabBar = tabBar;

        const separator = WidgetFactory.beginSeparator(this.widget).end();

        this.widget.layout = WidgetFactory.beginVerticalLayout()
                                              .contentsMargings(0, Ui.Sizes.Padding, 0, 0)
                                              .spacing(0)
                                              .addWidget(tabContainer)
                                              .addWidget(separator)
                                              .end();

        plugins.forEach((plugin) => this.tabBar.addTab(plugin.descriptor().bitmojiSuite.title));

        this.subscribe();
        this.onSelectionChanged();
        return this.widget;
    }

    createTabBar(parent) {
        const container = WidgetFactory.beginWidget(parent).sizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed).end();

        const widget = WidgetFactory.beginTabBar(container).sizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed).end();

        container.layout = WidgetFactory.beginVerticalLayout().contentsMargings(Ui.Sizes.Padding, 0, Ui.Sizes.Padding, Ui.Sizes.Padding).addWidget(widget).end();

        return { container, widget };
    }

    enablePanel() {
        const pluginWidget = this.panelPluginList[this.currentIndex].createWidget(this.widget);
        this.currentWidget = pluginWidget;

        // to-do: consider storing them on stack like Project Settings Dialog does
        this.widget.layout.addWidget(pluginWidget);
        this.widget.layout = this.widget.layout;
    }

    resetPanel() {
        if (this.currentIndex >= 0) {
            this.panelPluginList[this.currentIndex].deinit();
        }

        if (this.currentWidget && !this.currentWidget.isNull) {
            this.currentWidget.visible = false;
            this.currentWidget.deleteLater();
        }
    }

    onEntitiesChanged(entities) {
        this.editableComponent = findBitmojiComponent(entities)

        if (this.editableComponent && this.checkAuthorization()) {
            if (this.currentIndex < 0) {
                this.activate(this.tabBar.currentIndex);
            } else {
                this.activate(this.currentIndex);
            }

            return true;
        } else {
            this.deactivate();
            return false;
        }
    }

    activate(index) {
        if (this.currentIndex != index) {
            this.resetPanel();
            this.currentIndex = index;
            this.enablePanel();
        }

        if (this.editableComponent) {
            this.panelPluginList[this.currentIndex].edit(this.editableComponent);
        }

        this.tabBar.enabled = true;
    }

    deactivate() {
        this.resetPanel();

        if (this.checkAuthorization()) {
            this.enableEmptyPanel();
        } else {
            this.enableLoginPanel();
        }

        this.tabBar.enabled = false;
        this.currentIndex = -1;
    }

    handleAuthorization(authStatus) {
        if (authStatus) {
            // fixme: update avatar id in LBE instance when it's changed
            // if pass auth immediately, it
            // doesn't have enough time to warp up Bitmoji avatar
            this.authTimeout = setTimeout(() => {
                this.onSelectionChanged();
            }, 1000);
        } else {
            this.deactivate();
        }
    }

    checkAuthorization() {
        const authComponent = this.pluginSystem.findInterface(Editor.IAuthorization);
        return authComponent.isAuthorized;
    }

    enableEmptyPanel() {
        const pluginWidget = this.emptyPlugin.createWidget(this.widget);
        this.currentWidget = pluginWidget;

        // to-do: consider storing them on stack like Project Settings Dialog does
        this.widget.layout.addWidget(pluginWidget);
        this.widget.layout = this.widget.layout;
    }

    enableLoginPanel() {
        const pluginWidget = this.loginPlugin.createWidget(this.widget);
        this.currentWidget = pluginWidget;

        // to-do: consider storing them on stack like Project Settings Dialog does
        this.widget.layout.addWidget(pluginWidget);
        this.widget.layout = this.widget.layout;
    }

    deinit() {
        if (this.onSelectionChangeConnection) {
            this.onSelectionChangeConnection.disconnect();
            this.onSelectionChangeConnection = null;
        }
        if (this.onProjectChangedConnection) {
            this.onProjectChangedConnection.disconnect();
            this.onProjectChangedConnection = null;
        }
        if (this.onAuthStatusChangedConnection) {
            this.onAuthStatusChangedConnection.disconnect();
            this.onAuthStatusChangedConnection = null;
        }
        if (this.panelPluginList) {
            this.panelPluginList.forEach((panelPlugin) => panelPlugin.deinit());
        }
    }

    subscribe() {
        if (this.onSelectionChangeConnection) {
            this.onSelectionChangeConnection.disconnect();
            this.onSelectionChangeConnection = null;
        }

        if (this.onAuthStatusChangedConnection) {
            this.onAuthStatusChangedConnection.disconnect();
            this.onAuthStatusChangedConnection = null;
        }

        const authComponent = this.pluginSystem.findInterface(Editor.IAuthorization);

        this.onAuthStatusChangedConnection = authComponent.onAuthorizationChange.connect((authStatus) => this.handleAuthorization(authStatus));
        this.onSelectionChangeConnection = this.model.project.selection.onSelectionChange.connect(() => this.onSelectionChanged());
        this.onTabChanged = this.tabBar.onCurrentChange.connect((index) => this.activate(index));
    }

    onSelectionChanged() {
        const entities = this.model.project.selection.entities;
        if (entities.length === 1) {
            this.onEntitiesChanged(entities[0]);
        } else {
            this.onEntitiesChanged([]);
        }
    }
}
