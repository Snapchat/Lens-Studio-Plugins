import * as Ui from 'LensStudio:Ui';
import * as Clipboard from 'LensStudio:Clipboard';
import Strings from './TokenDialogStrings.js';

const DIALOG_WIDTH = 420;
const DIALOG_HEIGHT = 380;
const TEXT_FIELD_HEIGHT = 21;
const ROW_HEIGHT = 90;

const VIEW_MAIN = 0;
const VIEW_UNAUTHORIZED = 1;

// UI sizing constants (used multiple times)
const BUTTON_WIDTH = 90;
const BUTTON_HEIGHT = 20;

// Timing constants
const COPY_FEEDBACK_DURATION = 900;

export default class TokenDialog {
    constructor(tokenService, pluginSystem) {
        this.tokenService = tokenService;
        this.containerLayout = null;
        this.pluginSystem = pluginSystem;
        this.mAuthComponent = this.pluginSystem.findInterface(Editor.IAuthorization);
        this.authConnectionGuard = null;
        this.copyTimeouts = new Map(); // Track copy button timeouts
    }

    create(mainWindow) {
        const dialog = this.createBaseDialog(mainWindow);
        this.containerLayout = new Ui.StackedLayout();

        this.containerLayout.addWidget(this.createMainContent(dialog));
        this.containerLayout.addWidget(this.createUnauthorizedContent(dialog));

        dialog.layout = this.containerLayout;

        this.updateAuthState();

        if (this.mAuthComponent) {
            this.authConnectionGuard = this.mAuthComponent.onAuthorizationChange.connect(() => {
                this.updateAuthState();
            });
        }

        return dialog;
    }

    createSpacer(parent, height) {
        const spacer = new Ui.Widget(parent);
        spacer.setFixedHeight(height);
        return spacer;
    }

    createCenteredLayout(parent, leftMargin = 0, rightMargin = 0) {
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.LeftToRight);
        if (leftMargin || rightMargin) {
            layout.setContentsMargins(leftMargin, 0, rightMargin, 0);
        }
        layout.addStretch(1);
        return layout;
    }

    createStandardButton(parent, text, isPrimary = false) {
        const button = new Ui.PushButton(parent);
        button.text = text;
        button.primary = isPrimary;
        button.setFixedHeight(BUTTON_HEIGHT);
        button.setFixedWidth(BUTTON_WIDTH);
        return button;
    }

    cleanup() {
        this.copyTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.copyTimeouts.clear();
        
        if (this.authConnectionGuard) {
            this.authConnectionGuard.disconnect();
            this.authConnectionGuard = null;
        }
    }

    hasValidToken(token) {
        return token && token.token && token.token !== Strings.DEFAULT_TEXT;
    }

    updateAuthState() {
        if (!this.mAuthComponent || this.mAuthComponent.isAuthorized) {
            this.switchToMainView();
        } else {
            this.switchToUnauthorizedView();
        }
    }

    switchToMainView() {
        if (this.containerLayout) {
            this.containerLayout.currentIndex = VIEW_MAIN;
        }
    }

    switchToUnauthorizedView() {
        if (this.containerLayout) {
            this.containerLayout.currentIndex = VIEW_UNAUTHORIZED;
        }
    }

    createUnauthorizedContent(dialog) {
        const unauthorizedContent = new Ui.Widget(dialog);
        const vLayout = new Ui.BoxLayout();
        vLayout.setDirection(Ui.Direction.TopToBottom);
        vLayout.setContentsMargins(Ui.Sizes.DialogContentMargin, Ui.Sizes.DialogContentMargin,
                                  Ui.Sizes.DialogContentMargin, Ui.Sizes.DialogContentMargin);

        vLayout.addStretch(1);

        const iconLayout = new Ui.BoxLayout();
        iconLayout.setDirection(Ui.Direction.LeftToRight);
        iconLayout.addStretch(1);
        
        const warningIcon = new Ui.ImageView(dialog);
        const warningPixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./logo.svg')));
        warningPixmap.resize(200, 200);
        warningIcon.pixmap = warningPixmap;
        iconLayout.addWidget(warningIcon);
        iconLayout.addStretch(1);
        
        vLayout.addLayout(iconLayout);

        vLayout.addWidget(this.createSpacer(dialog, 25));

        const unauthorizedTitle = new Ui.Label(dialog);
        unauthorizedTitle.text = `<b><font size="5">${Strings.UNAUTHORIZED_TITLE}</font></b>`;
        unauthorizedTitle.wordWrap = false;
        unauthorizedTitle.alignment = Ui.Alignment.AlignCenter;

        const titleHLayout = this.createCenteredLayout(dialog, 40, 40);
        titleHLayout.addWidget(unauthorizedTitle);
        titleHLayout.addStretch(1);
        vLayout.addLayout(titleHLayout);

        vLayout.addWidget(this.createSpacer(dialog, 25));

        const unauthorizedMessage = new Ui.Label(dialog);
        unauthorizedMessage.text = `<font size="4">${Strings.UNAUTHORIZED_MESSAGE}</font>`;
        unauthorizedMessage.wordWrap = true;
        unauthorizedMessage.alignment = Ui.Alignment.AlignCenter;

        const messageHLayout = new Ui.BoxLayout();
        messageHLayout.setDirection(Ui.Direction.LeftToRight);
        messageHLayout.setContentsMargins(60, 0, 60, 0);
        messageHLayout.addWidget(unauthorizedMessage);
        vLayout.addLayout(messageHLayout);

        vLayout.addWidget(this.createSpacer(dialog, 30));

        const buttonLayout = new Ui.BoxLayout();
        buttonLayout.setDirection(Ui.Direction.LeftToRight);
        buttonLayout.addStretch(1);

        const loginButton = new Ui.PushButton(dialog);
        loginButton.text = Strings.LOGIN_BUTTON;
        loginButton.primary = true;
        loginButton.setFixedWidth(120);
        loginButton.setFixedHeight(25);
        loginButton.onClick.connect(() => {
            if (this.mAuthComponent) {
                this.mAuthComponent.authorize();
            }
        });
        buttonLayout.addWidget(loginButton);
        buttonLayout.addStretch(1);

        vLayout.addLayout(buttonLayout);

        vLayout.addWidget(this.createSpacer(dialog, 12));

        const learnMoreLayout = this.createCenteredLayout(dialog);
        const learnMoreLink = new Ui.Label(dialog);
        learnMoreLink.text = `<a href="${Strings.LEARN_MORE_URL}">${Strings.LEARN_MORE_BUTTON}</a>`;
        learnMoreLink.openExternalLinks = true;
        learnMoreLayout.addWidget(learnMoreLink);
        learnMoreLayout.addStretch(1);
        vLayout.addLayout(learnMoreLayout);

        vLayout.addStretch(1);

        unauthorizedContent.layout = vLayout;
        return unauthorizedContent;
    }

    createBaseDialog(mainWindow) {
        const dialog = new Ui.Dialog(mainWindow);
        dialog.windowTitle = Strings.DIALOG_TITLE;
        dialog.resize(DIALOG_WIDTH, DIALOG_HEIGHT);
        return dialog;
    }

    createMainContent(dialog) {
        const mainContent = new Ui.Widget(dialog);
        const vLayout = new Ui.BoxLayout();
        vLayout.setDirection(Ui.Direction.TopToBottom);
        vLayout.setContentsMargins(Ui.Sizes.DialogContentMargin, Ui.Sizes.DialogContentMargin,
                                  Ui.Sizes.DialogContentMargin, Ui.Sizes.DialogContentMargin);

        const introText = new Ui.Label(dialog);
        introText.text = Strings.TITLE_LABEL;
        introText.openExternalLinks = true;
        vLayout.addWidget(introText);
        

        vLayout.addWidget(this.createSpacer(dialog, 5));

        const tokenTypes = this.tokenService.getTokenTypes();
        
        const tokenContainer = new Ui.Widget(dialog);
        const tokenContainerLayout = new Ui.BoxLayout();
        tokenContainerLayout.setDirection(Ui.Direction.TopToBottom);
        tokenContainerLayout.setContentsMargins(0, 0, 0, 0);
        
        const topSeparator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, tokenContainer);
        topSeparator.setFixedHeight(1);
        topSeparator.setContentsMargins(10, 5, 10, 5);
        tokenContainerLayout.addWidget(topSeparator);

        tokenTypes.forEach((tokenType, index) => {
            const tokenRow = this.createTokenRow(tokenContainer, tokenType);
            tokenContainerLayout.addWidget(tokenRow);
            
            if (index < tokenTypes.length - 1) {
                const separator = new Ui.Separator(Ui.Orientation.Horizontal, Ui.Shadow.Plain, tokenContainer);
                separator.setFixedHeight(1);
                separator.setContentsMargins(10, 5, 10, 5);
                tokenContainerLayout.addWidget(separator);
            }
        });
        
        tokenContainer.layout = tokenContainerLayout;
        vLayout.addWidget(tokenContainer);

        mainContent.layout = vLayout;
        return mainContent;
    }

    createTokenRow(dialog, tokenType) {
        const tokenRow = new Ui.Widget(dialog);
        tokenRow.setFixedHeight(ROW_HEIGHT);
        
        const rowStackedLayout = new Ui.StackedLayout();
        
        const normalView = this.createNormalTokenView(dialog, tokenType, rowStackedLayout);
        rowStackedLayout.addWidget(normalView);
        
        const confirmationView = this.createConfirmationView(dialog, tokenType, rowStackedLayout, normalView);
        rowStackedLayout.addWidget(confirmationView);
        
        rowStackedLayout.currentIndex = 0;
        
        tokenRow.layout = rowStackedLayout;
        return tokenRow;
    }

    createNormalTokenView(dialog, tokenType, parentStackedLayout) {
        const tokenView = new Ui.Widget(dialog);
        
        const mainLayout = new Ui.BoxLayout();
        mainLayout.setDirection(Ui.Direction.LeftToRight);
        mainLayout.setContentsMargins(10, 5, 10, 5);

        const leftLayout = new Ui.BoxLayout();
        leftLayout.setDirection(Ui.Direction.TopToBottom);

        const tokenTypeLabel = new Ui.Label(dialog);
        tokenTypeLabel.text = `<b><font size="5">${Strings[`${tokenType}_LABEL`]}</font></b>`;
        leftLayout.addWidget(tokenTypeLabel);

        leftLayout.addStretch(2);

        const tokenDisplay = new Ui.TextEdit(dialog);
        tokenDisplay.acceptRichText = false;
        tokenDisplay.readOnly = true;
        tokenDisplay.setFixedHeight(TEXT_FIELD_HEIGHT);

        const existingToken = this.tokenService.getStoredToken(tokenType);
        tokenDisplay.plainText = existingToken ? existingToken.token : Strings.DEFAULT_TEXT;

        leftLayout.addWidget(tokenDisplay);

        leftLayout.addStretch(0);

        const issuedLabel = new Ui.Label(dialog);
        const issuedText = existingToken && existingToken.timestamp 
            ? `${Strings.ISSUED_LABEL} ${this.formatTimestamp(existingToken.timestamp)}`
            : Strings.ISSUED_PLACEHOLDER;
        issuedLabel.text = issuedText;
        issuedLabel.setFixedHeight(18);
        leftLayout.addWidget(issuedLabel);

        mainLayout.addLayout(leftLayout);
        mainLayout.addStretch(1);

        const buttonLayout = new Ui.BoxLayout();
        buttonLayout.setDirection(Ui.Direction.TopToBottom);

        const generateButton = this.createStandardButton(dialog, Strings.GENERATE_BUTTON, true);

        const revokeButton = this.createStandardButton(dialog, Strings.REVOKE_BUTTON);

        const copyButton = this.createStandardButton(dialog, Strings.COPY_BUTTON);

        const updateButtonStates = () => {
            const currentToken = this.tokenService.getStoredToken(tokenType);
            const hasValidToken = this.hasValidToken(currentToken);
            
            revokeButton.enabled = hasValidToken;
            copyButton.enabled = hasValidToken;
        };

        const refreshTokenDisplay = () => {
            const currentToken = this.tokenService.getStoredToken(tokenType);
            if (currentToken && currentToken.token) {
                tokenDisplay.plainText = currentToken.token;
                issuedLabel.text = `${Strings.ISSUED_LABEL} ${this.formatTimestamp(currentToken.timestamp)}`;
            } else {
                tokenDisplay.plainText = Strings.DEFAULT_TEXT;
                issuedLabel.text = Strings.ISSUED_PLACEHOLDER;
            }
            updateButtonStates();
        };

        generateButton.onClick.connect(() => {
            tokenDisplay.plainText = Strings.LOADING;
            issuedLabel.text = "";
            updateButtonStates(); // Disable buttons while loading
            
            this.tokenService.generateToken(
                tokenType,
                (tokenEntity) => {
                    tokenDisplay.plainText = tokenEntity.token;
                    issuedLabel.text = `${Strings.ISSUED_LABEL} ${this.formatTimestamp(tokenEntity.timestamp)}`;
                    updateButtonStates(); // Re-enable buttons after successful generation
                },
                (error) => {
                    tokenDisplay.plainText = error;
                    issuedLabel.text = Strings.ISSUED_PLACEHOLDER;
                    updateButtonStates(); // Update button states after error
                }
            );
        });
        buttonLayout.addWidget(generateButton);

        revokeButton.onClick.connect(() => {
            parentStackedLayout.currentIndex = 1;
        });
        buttonLayout.addWidget(revokeButton);

        copyButton.onClick.connect(() => {
            const currentToken = this.tokenService.getStoredToken(tokenType);
            if (this.hasValidToken(currentToken)) {
                Clipboard.clipboard.text = currentToken.token;
                copyButton.text = Strings.COPIED_BUTTON;
                
                const existingTimeout = this.copyTimeouts.get(tokenType);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                }
                
                const timeoutId = setTimeout(() => {
                    if (copyButton && copyButton.text) {
                        copyButton.text = Strings.COPY_BUTTON;
                    }
                    this.copyTimeouts.delete(tokenType);
                }, COPY_FEEDBACK_DURATION);
                
                this.copyTimeouts.set(tokenType, timeoutId);
            }
        });
        buttonLayout.addWidget(copyButton);

        tokenView.refreshTokenDisplay = refreshTokenDisplay;

        updateButtonStates();

        mainLayout.addLayout(buttonLayout);
        tokenView.layout = mainLayout;
        return tokenView;
    }

    createConfirmationView(dialog, tokenType, parentStackedLayout, normalView) {
        const confirmationWidget = new Ui.Widget(dialog);
        
        const mainLayout = new Ui.BoxLayout();
        mainLayout.setDirection(Ui.Direction.TopToBottom);
        mainLayout.setContentsMargins(10, 5, 10, 5);

        const confirmationQuestion = new Ui.Label(dialog);
        const questionText = Strings.CONFIRMATION_QUESTION.replace('{TOKEN_TYPE}', Strings[`${tokenType}_LABEL`]);
        confirmationQuestion.text = `<b><font size="4">${questionText}</font></b>`;
        confirmationQuestion.wordWrap = true;
        mainLayout.addWidget(confirmationQuestion);

        const horizontalLayout = new Ui.BoxLayout();
        horizontalLayout.setDirection(Ui.Direction.LeftToRight);
        horizontalLayout.setContentsMargins(0, 5, 0, 0); // Reduced top margin

        const warningIcon = new Ui.ImageView(dialog);
        const warningPixmap = new Ui.Pixmap(new Editor.Path(import.meta.resolve('./warning.svg')));
        warningPixmap.resize(64, 64);
        warningIcon.pixmap = warningPixmap;
        horizontalLayout.addWidget(warningIcon);
        
        const spacer = new Ui.Widget(dialog);
        spacer.setFixedWidth(5);
        horizontalLayout.addWidget(spacer);

        const rightContentLayout = new Ui.BoxLayout();
        rightContentLayout.setDirection(Ui.Direction.TopToBottom);

        const warningText = new Ui.Label(dialog);
        warningText.text = Strings.CONFIRMATION_WARNING;
        warningText.wordWrap = true;
        rightContentLayout.addWidget(warningText);

        rightContentLayout.addStretch(1);

        const buttonLayout = new Ui.BoxLayout();
        buttonLayout.setDirection(Ui.Direction.LeftToRight);

        buttonLayout.addStretch(1); // Push buttons to the right

        const cancelButton = this.createStandardButton(dialog, Strings.CANCEL_BUTTON);
        cancelButton.onClick.connect(() => {
            parentStackedLayout.currentIndex = 0;
        });
        buttonLayout.addWidget(cancelButton);

        const confirmRevokeButton = this.createStandardButton(dialog, Strings.CONFIRM_REVOKE_BUTTON, true);
        confirmRevokeButton.onClick.connect(() => {
            this.tokenService.revokeToken(
                tokenType,
                () => {
                    parentStackedLayout.currentIndex = 0;

                    if (normalView && normalView.refreshTokenDisplay) {
                        normalView.refreshTokenDisplay();
                    }
                },
                (error) => {
                    parentStackedLayout.currentIndex = 0;

                    if (normalView && normalView.refreshTokenDisplay) {
                        normalView.refreshTokenDisplay();
                    }
                }
            );
        });
        buttonLayout.addWidget(confirmRevokeButton);

        rightContentLayout.addLayout(buttonLayout);
        horizontalLayout.addLayout(rightContentLayout);
        mainLayout.addLayout(horizontalLayout);

        confirmationWidget.layout = mainLayout;
        return confirmationWidget;
    }

    formatTimestamp(timestamp) {
        try {
            const date = new Date(timestamp);
            const options = {
                month: 'short',
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true           
             };
            return date.toLocaleString('en-US', options);
        } catch (e) {
            return "";
        }
    }
}
