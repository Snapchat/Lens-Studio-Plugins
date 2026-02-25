import ProjectSettingsPlugin from 'LensStudio:ProjectSettingsPlugin';
import * as Ui from "LensStudio:Ui";

import { IconGenerator } from "../IconGenerator/IconGenerator.js";
import { HomeScreen } from '../HomeScreen/HomeScreen.js';
import { IconCropper } from '../IconCropper/IconCropper.js';
import { CalloutManager } from '../CalloutManager/CalloutManager.js';

import { Generator } from './generator.js';
import { NetworkingManager } from './networking.js';

import { PluginID, PluginName, PluginIcon, PluginSection } from './common.js';
import { logEventOpen, logEventAssetImport } from './analytics.js';
import { GenAIIconName } from './common.js';
import { AuthProvider } from './authProvider.js';

const AppState = {
    HomeScreen: 0,
    IconGenerator: 1,
    IconCropper: 2
}

export function setIcon(iconPath, pluginSystem) {
    const model = pluginSystem.findInterface(Editor.Model.IModel);
    const project = model.project;

    const metainfo = project.metaInfo;
    metainfo.setIcon(iconPath);

    // could be either be string or Editor.Path, so we always convert to Editor.Path first
    const fileName = (new Editor.Path(iconPath.toString())).fileName

    if (fileName == GenAIIconName) {
        logEventAssetImport("SUCCESS", "GEN_AI");
    } else {
        logEventAssetImport("SUCCESS", "FROM_FILE");
    }

    project.metaInfo = metainfo;
}

export class LensIconWidget extends ProjectSettingsPlugin {
    static descriptor() {
        return {
            id: PluginID,
            name: PluginName,
            description: 'Lens Icon Plugin allows to import icon and generate it using Generative AI',
            title: PluginName,
            section: PluginSection,
            icon: PluginIcon,
            dependencies: [Ui.IGui]
        };
    }

    constructor(pluginSystem, descriptor) {
        super(pluginSystem, descriptor);

        const model = this.pluginSystem.findInterface(Editor.Model.IModel);

        this.metaInfoChangedConnection = model.onMetaInfoChanged.connect(() => {
            this.updateIssueStatus();
        });

        this.updateIssueStatus();
    };

    deinit() {
        if (this.metaInfoChangedConnection) {
            this.metaInfoChangedConnection.disconnect();
            this.metaInfoChangedConnection = null;
        }

        // deinit is called even if createWidget wasn't called
        // so this.iconCropper would be null in that case
        if (this.iconCropper) {
            this.iconCropper.deinit();
        }

        if (this.calloutManager) {
            this.calloutManager.deinit();
        }
    }

    updateIssueStatus() {
        if (this.setIssues) {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel);

            if (model.project.metaInfo.isIconSet) {
                this.setIssues([]);
            } else {
                this.setIssues([new Ui.ProjectSettings.Error(PluginName)]);
            }
        }
    }

    isConfigEmpty(config) {
        if (!config.prompt) {
            return true;
        }

        return false;
    }

    requestCancelation() {
        if (this.currentState === AppState.IconGenerator) {
            this.init();
        } else if (this.currentState === AppState.IconCropper) {
            switch(this.previousState) {
                case AppState.HomeScreen:
                    this.init();
                    break;
                case AppState.IconGenerator:
                    this.views.currentIndex = AppState.IconGenerator;
                    this.previousState = this.currentState;
                    this.currentState = AppState.IconGenerator;
                    break;
            }
        }
    }

    requestGeneration(prompt) {
        this.previousState = this.currentState;
        this.currentState = AppState.IconGenerator;

        this.iconGenerator.init({
            "prompt": prompt
        });
        this.views.currentIndex = AppState.IconGenerator;
    }

    requestIconCropper(imageBuffer, iconPath) {
        if (!iconPath) {
            iconPath = "icon.png";
        }

        this.iconCropper.init({
            "image_buffer": imageBuffer,
            "iconPath": iconPath
        });
        this.views.currentIndex = AppState.IconCropper;

        this.previousState = this.currentState;
        this.currentState = AppState.IconCropper;
    }

    requestIconSet(path) {
        this.homeScreen.init({
            "iconPath": path
        });

        this.views.currentIndex = 0;
        this.previousState = this.currentState;
        this.currentState = AppState.HomeScreen;
    }

    init() {
        this.homeScreen.init();
        this.views.currentIndex = 0;
        this.previousState = this.currentState;
        this.currentState = AppState.HomeScreen;
    }

    createWidget(parent, authorization = this.pluginSystem.findInterface(Editor.IAuthorization), networkingManager = new NetworkingManager(), authProvider = new AuthProvider(networkingManager, authorization)) {
        this.networkingManager = networkingManager;
        this.authorization = authorization;
        this.authProvider = authProvider;

        this.previousState = AppState.HomeScreen;
        this.currentState = AppState.HomeScreen;

        this.calloutManager = new CalloutManager();

        this.iconGenerator = new IconGenerator(this.pluginSystem, new Generator(networkingManager, authProvider), this.requestIconCropper.bind(this), this.requestCancelation.bind(this));
        this.homeScreen = new HomeScreen(this.pluginSystem, this.authorization, this.calloutManager, this.requestGeneration.bind(this), this.requestIconCropper.bind(this));
        this.iconCropper = new IconCropper(this.pluginSystem, this.requestIconSet.bind(this), this.requestCancelation.bind(this));

        this.widget = new Ui.Widget(parent);
        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.widget.setContentsMargins(0, 0, 0, 0);

        // The layout overlays `callout containers` (for error and info logs) on top of `views`
        const layout = new Ui.StackedLayout();
        layout.stackingMode = Ui.StackingMode.StackAll;
        layout.setContentsMargins(0, 0, 0, 0);

        this.views = new Ui.StackedWidget(this.widget);
        this.views.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.views.setContentsMargins(0, 0, 0, 0);

        this.views.addWidget(this.homeScreen.createWidget(this.views));
        this.views.addWidget(this.iconGenerator.createWidget(this.views));
        this.views.addWidget(this.iconCropper.createWidget(this.views));

        const calloutContainerWidget = this.calloutManager.createWidget(this.widget);

        layout.addWidget(calloutContainerWidget);
        layout.addWidget(this.views);

        this.widget.layout = layout;

        logEventOpen();
        this.init();

        const model = this.pluginSystem.findInterface(Editor.Model.IModel);

        model.onMetaInfoChanged.connect(() => {
            if (!this.widget.isNull && this.views.currentIndex == 0) {
                this.init();
            }
        });

        return this.widget;
    }
}
