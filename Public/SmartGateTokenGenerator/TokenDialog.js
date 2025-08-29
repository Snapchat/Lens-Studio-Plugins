import * as Ui from 'LensStudio:Ui';
import Strings from './TokenDialogStrings.js';

const DIALOG_WIDTH = 300;
const DIALOG_HEIGHT = 100;
const TEXT_FIELD_HEIGHT = 20;

const VIEW_MAIN = 0;
const VIEW_CONFIRMATION = 1;
const VIEW_UNAUTHORIZED = 2;

export default class TokenDialog {
    constructor(tokenService, pluginSystem) {
        this.tokenService = tokenService;
        this.containerLayout = null;
        this.pluginSystem = pluginSystem;
        this.mAuthComponent = this.pluginSystem.findInterface(Editor.IAuthorization);
        this.authConnectionGuard = null;
    }

    create(mainWindow) {
        const dialog = this.createBaseDialog(mainWindow);
        this.containerLayout = new Ui.StackedLayout();

        const resultField = new Ui.TextEdit(dialog);
        resultField.acceptRichText = false;
        resultField.readOnly = true;
        resultField.setFixedHeight(TEXT_FIELD_HEIGHT);

        const existingToken = this.tokenService.getStoredToken();
        if (existingToken) {
            resultField.plainText = existingToken;
        } else {
            resultField.plainText = Strings.DEFAULT_TEXT;
        }

        this.containerLayout.addWidget(this.createMainContent(dialog, resultField));
        this.containerLayout.addWidget(this.createConfirmationContent(dialog, resultField));
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

    switchToConfirmationView() {
        if (this.containerLayout) {
            this.containerLayout.currentIndex = VIEW_CONFIRMATION;
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

        const messageLabel = new Ui.Label(dialog);
        messageLabel.text = Strings.UNAUTHORIZED_MESSAGE;
        messageLabel.wordWrap = true;
        vLayout.addWidget(messageLabel);

        const authorizeButton = new Ui.PushButton(dialog);
        authorizeButton.text = Strings.LOGIN_BUTTON;
        authorizeButton.primary = true;
        authorizeButton.onClick.connect(() => {
            if (this.mAuthComponent) {
                this.mAuthComponent.authorize();
            }
        });

        const buttonLayout = new Ui.BoxLayout();
        buttonLayout.setDirection(Ui.Direction.LeftToRight);
        buttonLayout.addStretch(1);
        buttonLayout.addWidget(authorizeButton);
        buttonLayout.addStretch(1);

        vLayout.addLayout(buttonLayout);

        unauthorizedContent.layout = vLayout;
        return unauthorizedContent;
    }

    createBaseDialog(mainWindow) {
        const dialog = new Ui.Dialog(mainWindow);
        dialog.windowTitle = Strings.DIALOG_TITLE;
        dialog.resize(DIALOG_WIDTH, DIALOG_HEIGHT);
        return dialog;
    }

    createMainContent(dialog, resultField) {
        const mainContent = new Ui.Widget(dialog);
        const vLayout = new Ui.BoxLayout();
        vLayout.setDirection(Ui.Direction.TopToBottom);
        vLayout.setContentsMargins(Ui.Sizes.DialogContentMargin, Ui.Sizes.DialogContentMargin,
                                  Ui.Sizes.DialogContentMargin, Ui.Sizes.DialogContentMargin);

        const titleLabel = new Ui.Label(dialog);
        titleLabel.text = Strings.TITLE_LABEL;
        vLayout.addWidget(titleLabel);

        vLayout.addWidget(resultField);

        const buttonLayout = this.createButtonLayout(dialog, resultField);
        vLayout.addLayout(buttonLayout);

        mainContent.layout = vLayout;
        return mainContent;
    }

    createButtonLayout(dialog, resultField) {
        const buttonLayout = new Ui.BoxLayout();
        buttonLayout.setDirection(Ui.Direction.LeftToRight);
        buttonLayout.addStretch(1);

        const generateButton = new Ui.PushButton(dialog);
        generateButton.text = Strings.GENERATE_BUTTON;
        generateButton.primary = true;

        generateButton.onClick.connect(() => {
            resultField.plainText = Strings.LOADING;
            this.tokenService.generateToken(
                (token) => {
                    resultField.plainText = token;
                },
                (error) => {
                    resultField.plainText = error;
                }
            );
        });
        buttonLayout.addWidget(generateButton);

        const revokeButton = new Ui.PushButton(dialog);
        revokeButton.text = Strings.REVOKE_BUTTON;
        revokeButton.onClick.connect(() => {
            this.switchToConfirmationView();
        });
        buttonLayout.addWidget(revokeButton);

        return buttonLayout;
    }

    createConfirmationContent(dialog, resultField) {
        const confirmContent = new Ui.Widget(dialog);
        const confirmLayout = new Ui.BoxLayout();
        confirmLayout.setDirection(Ui.Direction.TopToBottom);
        confirmLayout.setContentsMargins(Ui.Sizes.DialogContentMargin, Ui.Sizes.DialogContentMargin,
                                        Ui.Sizes.DialogContentMargin, Ui.Sizes.DialogContentMargin);

        const warningLabel = new Ui.Label(dialog);
        warningLabel.text = Strings.WARNING_LABEL;
        warningLabel.wordWrap = true;
        confirmLayout.addWidget(warningLabel);

        const confirmButtonLayout = this.createConfirmButtonLayout(dialog, resultField);
        confirmLayout.addLayout(confirmButtonLayout);
        confirmContent.layout = confirmLayout;

        return confirmContent;
    }

    createConfirmButtonLayout(dialog, resultField) {
        const confirmButtonLayout = new Ui.BoxLayout();
        confirmButtonLayout.setDirection(Ui.Direction.LeftToRight);
        confirmButtonLayout.addStretch(1);

        const cancelButton = new Ui.PushButton(dialog);
        cancelButton.text = Strings.CANCEL_BUTTON;
        cancelButton.onClick.connect(() => {
            this.switchToMainView();
        });
        confirmButtonLayout.addWidget(cancelButton);

        const confirmRevokeButton = new Ui.PushButton(dialog);
        confirmRevokeButton.text = Strings.CONFIRM_REVOKE_BUTTON;
        confirmRevokeButton.primary = true;

        confirmRevokeButton.onClick.connect(() => {
            this.switchToMainView();
            resultField.plainText = Strings.REVOKING;

            this.tokenService.revokeToken(
                () => {
                    resultField.plainText = Strings.TOKEN_REVOKED;
                },
                (error) => {
                    resultField.plainText = error;
                }
            );
        });
        confirmButtonLayout.addWidget(confirmRevokeButton);

        return confirmButtonLayout;
    }
}
