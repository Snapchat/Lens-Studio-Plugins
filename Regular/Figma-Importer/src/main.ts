import { PanelPlugin } from 'LensStudio:PanelPlugin'
import * as Ui from 'LensStudio:Ui'
import FigmaFileAgent from './services/FigmaFileAgent.js'
import NodeMaterializer from './processors/NodeMaterializer.js'
import FigmaUtils from './utils/FigmaUtils.js'
import accessTokenManager from './services/AccessTokenManager.js'
import userPrefManager, { ConfigOptions } from './services/UserPrefManager.js'
import * as utils from './utils/generalUtils.js'
import * as widgetHelper from './utils/widgetHelper.js'
import * as oAuthHelper from './services/OAuthHelper.js'
import { logger } from './utils/FigmaUtils.js'
import { fetchUser } from './services/FigmaApiService.js'




const importNodeUrl = typeof internalImportNodeUrl !== 'undefined' ? internalImportNodeUrl : ''

export class FigmaImporter extends PanelPlugin {

    private stackedWidget!: Ui.StackedWidget
    private readonly nodeMaterializer: NodeMaterializer
    private readonly filenames = {
        figmaLogo: 'Figma-Icon.svg',
        preauthIllustration: 'Illustration_Figma_Token.png',
        postauthIllustration: 'Illustration_Figma_Frame.png'
    }
    private readonly spacing = Ui.Sizes.Spacing
    private readonly magicNumbers = Object.freeze(
        {
            figmaLogoHeight: 50,
            topHeaderWidget: 40,
            containerWidgetMinimumHeight: 550,
            containerWidgetMinimumWidth: 300,
            postauthIlluViewFixedHeight: 250,
            instructionFixedHeight: 80,
            configurationButtonMinimumHeight: 20,
            dialogResizeWidth: 500,
            dialogResizeHeight: 50,
        })

    signals: Editor.ScopedConnection[] = []

    private readonly version = '1.1.11'

    static descriptor() {
        const name = 'Figma Importer'
        return {
            id: 'Com.Snap.Scripts.' + name,
            name: name,
            //TODO: add dependencies property back
            description: 'Import your figma designs into Lens Studio',
        }
    }

    constructor(pluginSystem: Editor.PluginSystem) {
        super(pluginSystem)

        const model = pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel
        const assetManager = model.project.assetManager
        const scene = model.project.scene

        this.nodeMaterializer = new NodeMaterializer(
            {
                model: model,
                assetManager: assetManager,
                scene: scene,
                pluginSystem: pluginSystem,
                workingDirectory: new Editor.Path(import.meta.resolve('')).parent
            }
        )

    }

    createWidget(parent: Ui.Widget) {
        try {
            //setup the main widget which serves as a container for all other widgets
            const mainWidget = Ui.Widget.create(parent)
            mainWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.MinimumExpanding)

            //create a box layout for main widget
            const mainWidgetLayout = Ui.BoxLayout.create()
            mainWidgetLayout.setDirection(Ui.Direction.TopToBottom)
            const dialogContentMargin = Ui.Sizes.DialogContentMargin
            mainWidgetLayout.setContentsMargins(dialogContentMargin, dialogContentMargin, dialogContentMargin, dialogContentMargin)
            mainWidget.layout = mainWidgetLayout

            //setup stacked widget to be the base of multi-page UI
            this.stackedWidget = Ui.StackedWidget.create(mainWidget)
            this.stackedWidget.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.MinimumExpanding)

            mainWidgetLayout.addWidget(this.stackedWidget)

            // Adding Pre-Authentication and Post-Authentication Widgets to the Stacked Widget
            const preAuthScreenWidget = this.createPreAuthWidget()
            this.stackedWidget.addWidget(preAuthScreenWidget)

            const postAuthScreenWidget = this.createPostAuthWidget()
            this.stackedWidget.addWidget(postAuthScreenWidget)

            const configurationPanel = this.createConfigurationPanel()
            this.stackedWidget.addWidget(configurationPanel)

            //check if token exist if yes then show postauth or else show preauth
            const accessTokenValue = accessTokenManager.getAccessToken()

            if (accessTokenValue) {
                //we use this to test if the token is still valid
                //if not we will prompt the user to re-authenticate
                fetchUser(() => {
                    logger.info('Token expired. Please re-authenticate.')
                    this.stackedWidget.currentIndex = 0
                })
            }

            //check if the token has expired
            if (!accessTokenValue || typeof accessTokenValue !== 'string' || accessTokenValue.trim() === '') {
                this.stackedWidget.currentIndex = 0
            } else {
                this.stackedWidget.currentIndex = 1
            }
            ////version label
            const topHeaderWidget = Ui.Widget.create(mainWidget)
            topHeaderWidget.setFixedHeight(this.magicNumbers.topHeaderWidget)
            const topHeaderLayout = Ui.BoxLayout.create()
            topHeaderLayout.setDirection(Ui.Direction.LeftToRight)
            topHeaderWidget.layout = topHeaderLayout
            //create the label for the plugin version number
            const versionLabel = Ui.Label.create(topHeaderWidget)
            versionLabel.foregroundRole = Ui.ColorRole.Dark
            versionLabel.text = `v${this.version}`
            //add the new label into the layout
            topHeaderLayout.addWidget(versionLabel)
            mainWidgetLayout.addWidget(topHeaderWidget)

            return mainWidget
        } catch (e) {
            logger.error('', e)
            // Ensure a widget is always returned
            return Ui.Widget.create(parent)
        }

    }

    createConfigurationPanel() {
        const configurationPanel = Ui.Widget.create(this.stackedWidget)
        const configurationLayout = Ui.BoxLayout.create()
        configurationLayout.setDirection(Ui.Direction.TopToBottom)
        configurationLayout.spacing = this.spacing

        //back button
        const backButton = Ui.PushButton.create(configurationPanel)
        backButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed)
        backButton.text = '↶ Back'
        this.signals.push(backButton.onClick.connect(() => {
            this.stackedWidget.currentIndex = 1
        }))
        configurationLayout.addWidget(backButton)

        //1. figma design scaler
        const scalerSectionTitle = widgetHelper.createLabel(configurationPanel, 'Figma Design Scaler', Ui.FontRole.MediumTitle, Ui.ColorRole.BrightText)
        configurationLayout.addWidget(scalerSectionTitle)
        //create a horizontal layout
        const hLayout = Ui.BoxLayout.create()
        hLayout.setDirection(Ui.Direction.LeftToRight)
        hLayout.spacing = this.spacing
        configurationLayout.addLayout(hLayout)
        //create a label
        const explainer = widgetHelper.createLabel(configurationPanel, 'Select the scale used in your Figma design', Ui.FontRole.Default, Ui.ColorRole.NoRole)
        hLayout.addWidget(explainer)
        //create a dropdown
        const scalerDropdown = Ui.ComboBox.create(configurationPanel)
        //get the options from the user pref manager

        const scalerOptionKeyName = 'figma_canvas_scaler'
        const options = ConfigOptions.find(option => option.keyName === scalerOptionKeyName)?.options
        if (options == undefined) {
            throw new Error(`No options found for key: ${scalerOptionKeyName}`)
        }
        for (const option of options) {
            scalerDropdown.addItem(option)
        }
        //get the current value
        const currentValue = userPrefManager.readPref(scalerOptionKeyName)
        scalerDropdown.currentText = currentValue
        //add widget to the horizontal layout
        hLayout.addWidget(scalerDropdown)

        //2. image component stretch mode
        const stretchModeSectionTitle = widgetHelper.createLabel(configurationPanel, 'Image Component Stretch Mode', Ui.FontRole.MediumTitle, Ui.ColorRole.BrightText)
        configurationLayout.addWidget(stretchModeSectionTitle)
        //create a horizontal layout
        const hLayout2 = Ui.BoxLayout.create()
        hLayout2.setDirection(Ui.Direction.LeftToRight)
        hLayout2.spacing = this.spacing
        configurationLayout.addLayout(hLayout2)
        //create a label
        const explainer2 = widgetHelper.createLabel(configurationPanel, 'Select the stretch mode for images', Ui.FontRole.Default, Ui.ColorRole.NoRole)
        // explainer2.setFixedHeight(defaultWidgetHeight)
        hLayout2.addWidget(explainer2)
        //create a dropdown
        const stretchModeDropdown = Ui.ComboBox.create(configurationPanel)
        //get the options from the user pref manager
        const stretchModeOptionKeyName = 'image_component_stretch_mode'
        const options2 = ConfigOptions.find(option => option.keyName === stretchModeOptionKeyName)?.options
        if (options2 == undefined) {
            throw new Error(`No options found for key: ${stretchModeOptionKeyName}`)
        }
        for (const option of options2) {
            stretchModeDropdown.addItem(option)
        }
        //get the current value
        const currentValue2 = userPrefManager.readPref(stretchModeOptionKeyName)
        stretchModeDropdown.currentText = currentValue2
        hLayout2.addWidget(stretchModeDropdown)

        //3. save button
        const saveBtn = Ui.PushButton.create(configurationPanel)
        saveBtn.primary = true
        saveBtn.text = 'Save'
        this.signals.push(saveBtn.onClick.connect(() => {
            try {
                userPrefManager.writePref(scalerOptionKeyName, scalerDropdown.currentText)
                userPrefManager.writePref(stretchModeOptionKeyName, stretchModeDropdown.currentText)
                logger.info('Settings saved successfully.')
            } catch (e) {
                logger.error('', e)
            }

        }))
        configurationLayout.addWidget(saveBtn)
        configurationPanel.layout = configurationLayout

        const emptyLabelForSpacing = Ui.Label.create(configurationPanel)
        emptyLabelForSpacing.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Expanding)
        configurationLayout.addWidget(emptyLabelForSpacing)

        return configurationPanel
    }

    createPreAuthWidget() {

        const preAuthWidget = Ui.Widget.create(this.stackedWidget)
        const preAuthLayout = Ui.BoxLayout.create()
        preAuthLayout.setDirection(Ui.Direction.TopToBottom)
        preAuthWidget.layout = preAuthLayout
        preAuthLayout.spacing = this.spacing

        //1. Figma Logo
        const logoPath = new Editor.Path(import.meta.resolve('../UI/' + this.filenames.figmaLogo))
        const figmaLogoView = widgetHelper.createImageView(preAuthWidget, logoPath)
        figmaLogoView.setFixedHeight(this.magicNumbers.figmaLogoHeight)
        //center the logo
        preAuthLayout.addWidgetWithStretch(figmaLogoView, 2, Ui.Alignment.AlignCenter)

        //3. Call to action title
        const bigTitle = widgetHelper.createLabel(preAuthWidget, 'We need permission to read your Figma files', Ui.FontRole.MediumTitle, Ui.ColorRole.BrightText)
        preAuthLayout.addWidget(bigTitle)

        //add button to start the authentication process
        const authButton = Ui.PushButton.create(preAuthWidget)
        authButton.primary = true
        authButton.text = 'Start Authentication'
        const authBtnClickCallback = async () => {
            //core oauth logic
            const json: any = await oAuthHelper.startOAuth().catch((e) => {
                logger.error('', e)
            })
            //save the obtained token
            if (json) {
                //print out the expiration time
                logger.info(`Token expires in ${utils.secondsToDHM(json.expires_in)}`)
                const token = json.access_token
                const expiresIn = json.expires_in
                const refreshToken = json.refresh_token
                //save the tokens
                accessTokenManager.setAccessToken(token, expiresIn, refreshToken)
                //switch to the next screen
                this.stackedWidget.currentIndex = 1
            } else {
                logger.warn('An error occurred during authentication. Please try again.')
            }
        }
        this.signals.push(authButton.onClick.connect(authBtnClickCallback))

        preAuthLayout.addWidget(authButton)

        return preAuthWidget
    }

    createPostAuthWidget() {
        //create the vertical scroll area and the main widget for containing all the content
        //TODO: show the scrollbar when the area is too small
        const vsa = Ui.VerticalScrollArea.create(this.stackedWidget)

        const containerWidget = Ui.Widget.create(vsa)
        containerWidget.setSizePolicy(Ui.SizePolicy.Policy.Preferred, Ui.SizePolicy.Policy.Preferred)
        containerWidget.setMinimumHeight(this.magicNumbers.containerWidgetMinimumHeight)
        containerWidget.setMinimumWidth(this.magicNumbers.containerWidgetMinimumWidth)

        //now we grant a layout for postAuthWidget
        const containerLayout = Ui.BoxLayout.create()
        containerLayout.setDirection(Ui.Direction.TopToBottom)
        containerLayout.spacing = this.spacing

        const pull = async (url: string) => {

            logger.info('Importing started...')
            const progressBarInfo = this.createProgressBarDialog()
            if (!progressBarInfo) {
                logger.warn('Error creating progress bar dialog')
                return
            }
            logger.debug('Progress bar created...')
            const progressReporter = progressBarInfo.progressReporter
            logger.debug('Progress bar update function created...')

            try {
                const parsed = FigmaUtils.linkParser(url)
                if (!parsed.fileKey || !parsed.nodeId) {
                    throw new Error(`Link parsing unsuccessfully, double check your link and try again. parsing result: ${JSON.stringify(parsed)}`)
                }
                logger.info('Fetching Figma file...')
                //get the figma file
                const figmaFile = await FigmaFileAgent.create(parsed.fileKey, parsed.nodeId)

                if (!figmaFile.document) {
                    throw new Error('Figma file is empty')
                }
                //find the selected node within the figma file
                const targetNode = FigmaUtils.deepFind(figmaFile.document, node => node.id === parsed.nodeId)[0]

                if (!targetNode) {
                    throw new Error(`Node with id ${parsed.nodeId} not found`)
                }
                //render the node hierarchy
                await this.nodeMaterializer.renderNodeHierarchy(targetNode, figmaFile, progressReporter)
                logger.info('Importing completed!')
            } catch (error) {
                logger.error('', error)
                progressBarInfo.dialog.close()
                logger.warn('An error occurred. Please try again.')
            }
        }

        //back to auth panel button
        const backButton = Ui.PushButton.create(containerWidget)
        backButton.text = '↶ Re-authenticate'
        this.signals.push(backButton.onClick.connect(() => {
            this.stackedWidget.currentIndex = 0
        }))
        backButton.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed)
        containerLayout.addWidget(backButton)

        //1. Figma Logo
        const logoPath = new Editor.Path(import.meta.resolve('../UI/' + this.filenames.figmaLogo))
        const figmaLogoView = widgetHelper.createImageView(containerWidget, logoPath)

        figmaLogoView.setSizePolicy(Ui.SizePolicy.Policy.MinimumExpanding, Ui.SizePolicy.Policy.Fixed)
        figmaLogoView.setFixedHeight(this.magicNumbers.figmaLogoHeight)
        containerLayout.addWidgetWithStretch(figmaLogoView, 2, Ui.Alignment.AlignCenter)

        //2. big thumbnail image
        const illuPath = new Editor.Path(import.meta.resolve('../UI/' + this.filenames.postauthIllustration))
        const postauthIlluView = widgetHelper.createImageView(containerWidget, illuPath)

        postauthIlluView.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed)
        postauthIlluView.setFixedHeight(this.magicNumbers.postauthIlluViewFixedHeight)
        containerLayout.addWidgetWithStretch(postauthIlluView, 2, Ui.Alignment.AlignCenter)

        //3. Call to action title
        const bigTitle = widgetHelper.createLabel(containerWidget, 'Copy Link to Import Frame', Ui.FontRole.MediumTitle, Ui.ColorRole.BrightText)
        bigTitle.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Maximum)
        bigTitle.setFixedHeight(Ui.Sizes.ButtonHeight)
        containerLayout.addWidget(bigTitle)

        //4. Input bar and confirm button
        //create a horizontal layout for the input bar and confirm button
        this.signals.push(widgetHelper.createLineWithButton(
            containerWidget,
            containerLayout,
            'Paste link here...',
            'Import',
            importNodeUrl,
            (url: string) => {
                try {
                    pull(url)
                } catch (e) {
                    logger.error('', e)
                }
            }
        ))

        const instructionText = [
            'To import a frame:',
            '1. Select the frame you wish to import',
            '2. Right click on the frame to open the context menu',
            '3. Copy the link by selecting \'Copy/Paste as\' > \'Copy Link\'',
            '4. Paste the copied link into the field above and click \'Import\''
        ].join('\n')

        const instruction = widgetHelper.createLabel(containerWidget, instructionText, Ui.FontRole.Default, Ui.ColorRole.NoRole)

        containerLayout.addWidget(instruction)
        instruction.setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed)
        instruction.setFixedHeight(this.magicNumbers.instructionFixedHeight)

        //5. Configuration button
        const configurationButton = Ui.PushButton.create(containerWidget)
        configurationButton.text = '⚙ Settings'
        configurationButton.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed)
        configurationButton.setMinimumHeight(Ui.Sizes.ButtonHeight)

        this.signals.push(configurationButton.onClick.connect(() => {
            this.stackedWidget.currentIndex = 2
        }))
        containerLayout.addWidget(configurationButton)

        containerWidget.layout = containerLayout
        vsa.setWidget(containerWidget)

        return vsa
    }

    createProgressBarDialog() {
        try {
            const gui = this.pluginSystem.findInterface(Ui.IGui) as Ui.Gui

            const dialog = gui.createDialog()

            dialog.resize(this.magicNumbers.dialogResizeWidth, this.magicNumbers.dialogResizeHeight)
            dialog.windowTitle = 'Importing...'

            //create a layout for the main widget
            const layout = Ui.BoxLayout.create()
            layout.setDirection(Ui.Direction.TopToBottom)
            layout.spacing = Ui.Sizes.Spacing
            dialog.layout = layout

            //create a progress bar
            const progressBar = Ui.ProgressBar.create(dialog)
            progressBar.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed)
            progressBar.setFixedHeight(Ui.Sizes.ProgressBarHeight)
            progressBar.setRange(0, 100)
            layout.addWidget(progressBar)

            dialog.show()

            let progress = 0
            const updateProgress = (addition: number) => {
                progress += addition
                progressBar.value = progress
                if (progress > 99) {
                    dialog.close()
                }
                return progress
            }
            return {
                dialog,
                progressReporter: updateProgress
            }
        } catch (e) {
            logger.error('', e)
        }
    }
}
