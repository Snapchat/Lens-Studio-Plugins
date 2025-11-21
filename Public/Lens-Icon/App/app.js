import ProjectSettingsPlugin from 'LensStudio:ProjectSettingsPlugin';
import * as Ui from "LensStudio:Ui";

import { IconGenerator } from "../IconGenerator/IconGenerator.js";
import { HomeScreen } from '../HomeScreen/HomeScreen.js';
import { IconCropper } from '../IconCropper/IconCropper.js';

import { Generator } from './generator.js';
import { NetworkingManager } from './networking.js';

import { PluginID, PluginName, PluginIcon, PluginSection } from './common.js';
import { logEventOpen } from './analytics.js';
import { AuthProvider } from './authProvider.js';

const AppState = {
    HomeScreen: 0,
    IconGenerator: 1,
    IconCropper: 2
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
        if (this.currenState == AppState.IconGenerator) {
            this.init();
        } else if (this.currenState == AppState.IconCropper) {
            switch(this.previousState) {
                case AppState.HomeScreen:
                    this.init();
                    break;
                case AppState.IconGenerator:
                    this.views.currentIndex = 1;
                    this.previousState = this.currenState;
                    this.currenState = AppState.IconGenerator;
                    break;
            }
        }
    }

    requestGeneration(prompt) {
        this.previousState = this.currenState;
        this.currenState = AppState.IconGenerator;

        this.iconGenerator.init({
            "prompt": prompt
        });
        this.views.currentIndex = 1;
    }

    requestIconCropper(imageBuffer, iconPath) {
        if (!iconPath) {
            iconPath = "icon.png";
        }

        this.iconCropper.init({
            "image_buffer": imageBuffer,
            "iconPath": iconPath
        });
        this.views.currentIndex = 2;

        this.previousState = this.currenState;
        this.currenState = AppState.IconCropper;
    }

    requestIconSet(path) {
        this.homeScreen.init({
            "iconPath": path
        });

        this.views.currentIndex = 0;
        this.previousState = this.currenState;
        this.currenState = AppState.HomeScreen;
    }

    init() {
        this.homeScreen.init();
        this.views.currentIndex = 0;
        this.previousState = this.currenState;
        this.currenState = AppState.HomeScreen;
    }

    createWidget(parent, authorization = this.pluginSystem.findInterface(Editor.IAuthorization), networkingManager = new NetworkingManager(), authProvider = new AuthProvider(networkingManager, authorization)) {
        this.networkingManager = networkingManager;
        this.authorization = authorization;
        this.authProvider = authProvider;

        this.previousState = AppState.HomeScreen;
        this.currenState = AppState.HomeScreen;

        this.iconGenerator = new IconGenerator(this.pluginSystem, new Generator(networkingManager, authProvider), this.requestIconCropper.bind(this), this.requestCancelation.bind(this));
        this.homeScreen = new HomeScreen(this.pluginSystem, this.authorization, this.requestGeneration.bind(this), this.requestIconCropper.bind(this));
        this.iconCropper = new IconCropper(this.pluginSystem, this.requestIconSet.bind(this), this.requestCancelation.bind(this));

        this.widget = new Ui.Widget(parent);

        this.widget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.widget.setContentsMargins(0, 0, 0, 0);

        this.layout = new Ui.BoxLayout();
        this.layout.setDirection(Ui.Direction.TopToBottom);
        this.layout.setContentsMargins(0, 0, 0, 0);

        this.views = new Ui.StackedWidget(this.widget);
        this.views.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding);
        this.views.setContentsMargins(0, 0, 0, 0);

        this.views.addWidget(this.homeScreen.createWidget(this.views));
        this.views.addWidget(this.iconGenerator.createWidget(this.views));
        this.views.addWidget(this.iconCropper.createWidget(this.views));

        this.layout.addWidget(this.views);

        this.widget.layout = this.layout;

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
