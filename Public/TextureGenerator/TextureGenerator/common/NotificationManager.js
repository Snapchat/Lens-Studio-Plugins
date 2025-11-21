import * as Ui from 'LensStudio:Ui';
import { ErrorNotificationWidget, InfoNotificationWidget } from '../common-ui/NotificationWidget';
import { UIConfig } from '../UIConfig';
/**
 * The notification manager is responsible for displaying notifications that pop up on the top of the dialog.
 * The main dialog should use the createWidget function to get a widget that serve as a container for the notification widgets,
 * and this container widget should be stacked with the main content of the dialog.
 *
 * If new notification is needed, please
 *   1. Add a new the NotificationKey
 *   2. Add your notification widget in the `configureNotification()` function.
 */
export var NotificationType;
(function (NotificationType) {
    NotificationType["Error"] = "error";
    NotificationType["Info"] = "info";
})(NotificationType || (NotificationType = {}));
export var NotificationKey;
(function (NotificationKey) {
    NotificationKey[NotificationKey["ErrorViolatesCommunityGuidelines"] = 0] = "ErrorViolatesCommunityGuidelines";
    NotificationKey[NotificationKey["ErrorReachedLimit"] = 1] = "ErrorReachedLimit";
    NotificationKey[NotificationKey["ErrorUnknown"] = 2] = "ErrorUnknown";
    NotificationKey[NotificationKey["InfoImportSuccess"] = 3] = "InfoImportSuccess";
    NotificationKey[NotificationKey["ErrorImportFailed"] = 4] = "ErrorImportFailed";
})(NotificationKey || (NotificationKey = {}));
export class NotificationManager {
    constructor() {
        this.notificationWidgets = {};
        this.mDisplayDuration = 5000;
        this.mNotificationTimer = null;
    }
    deinit() {
        if (this.mNotificationTimer) {
            clearTimeout(this.mNotificationTimer);
            this.mNotificationTimer = null;
        }
    }
    createWidget(parent) {
        if (this.notificationContainer) {
            return this.notificationContainer;
        }
        this.notificationContainer = new Ui.Widget(parent);
        this.notificationContainer.setSizePolicy(Ui.SizePolicy.Policy.Expanding, Ui.SizePolicy.Policy.Fixed);
        this.notificationContainer.setFixedHeight(UIConfig.NOTIFICATION_BANNER.HEIGHT);
        this.notificationContainer.setContentsMargins(0, 0, 0, 0);
        this.notificationLayout = new Ui.BoxLayout();
        this.notificationLayout.setDirection(Ui.Direction.TopToBottom);
        this.notificationLayout.setContentsMargins(0, 0, 0, 0);
        this.notificationLayout.spacing = 0;
        this.notificationContainer.layout = this.notificationLayout;
        this.configureNotification();
        return this.notificationContainer;
    }
    addNotificationWidget(key, type, message, width = UIConfig.NOTIFICATION_BANNER.WIDTH) {
        if (!this.notificationContainer) {
            throw new Error("Notification container not created");
        }
        if (this.notificationWidgets[key]) {
            throw new Error("Notification widget already added with key: " + key);
        }
        switch (type) {
            case NotificationType.Error:
                this.notificationWidgets[key] = new ErrorNotificationWidget(this.notificationContainer, message);
                break;
            case NotificationType.Info:
                this.notificationWidgets[key] = new InfoNotificationWidget(this.notificationContainer, message);
                break;
        }
        this.notificationWidgets[key].setSizePolicy(Ui.SizePolicy.Policy.Fixed, Ui.SizePolicy.Policy.Fixed);
        this.notificationWidgets[key].setFixedWidth(width);
        this.notificationWidgets[key].setFixedHeight(UIConfig.NOTIFICATION_BANNER.HEIGHT);
        this.notificationLayout.addWidgetWithStretch(this.notificationWidgets[key], 1, Ui.Alignment.AlignTop | Ui.Alignment.AlignHCenter);
        this.notificationWidgets[key].visible = false;
    }
    configureNotification() {
        // generation
        this.addNotificationWidget(NotificationKey.ErrorViolatesCommunityGuidelines, NotificationType.Error, 'Prompt does not comply with community guidelines.', 320);
        this.addNotificationWidget(NotificationKey.ErrorReachedLimit, NotificationType.Error, 'Limit reached. Please try again later.', 240);
        this.addNotificationWidget(NotificationKey.ErrorUnknown, NotificationType.Error, 'Generation failed for unknown reason. Please try again later.', 365);
        // import
        this.addNotificationWidget(NotificationKey.InfoImportSuccess, NotificationType.Info, 'Texture has been imported successfully.', 275);
        this.addNotificationWidget(NotificationKey.ErrorImportFailed, NotificationType.Error, 'Failed to import Texture, please try again.', 280);
    }
    set notificationDuration(durationInMilliseconds) {
        if (durationInMilliseconds <= 0) {
            throw new Error("Duration must be greater than 0");
        }
        this.mDisplayDuration = durationInMilliseconds;
    }
    showNotification(key) {
        const notificationWidget = this.notificationWidgets[key];
        if (!notificationWidget) {
            throw new Error("Notification widget not found with key: " + key);
        }
        notificationWidget.visible = true;
        if (this.mNotificationTimer) {
            clearTimeout(this.mNotificationTimer);
        }
        this.mNotificationTimer = setTimeout(() => {
            notificationWidget.visible = false;
            if (this.mNotificationTimer) {
                clearTimeout(this.mNotificationTimer);
            }
            this.mNotificationTimer = null;
        }, this.mDisplayDuration);
    }
}
