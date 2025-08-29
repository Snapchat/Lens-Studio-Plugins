export var EventTypes;
(function (EventTypes) {
    EventTypes["OnAuthorizationChange"] = "onAuthorizationChange";
    EventTypes["DialogShown"] = "dialogShown";
})(EventTypes || (EventTypes = {}));
export class EventBus {
    constructor() {
        this.events = new Map();
    }
    on(event, listener) {
        var _a;
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        (_a = this.events.get(event)) === null || _a === void 0 ? void 0 : _a.add(listener);
    }
    emit(event, ...args) {
        var _a;
        if (this.events.has(event)) {
            (_a = this.events.get(event)) === null || _a === void 0 ? void 0 : _a.forEach((listener) => listener(...args));
        }
    }
    off(event, listener) {
        var _a;
        if (this.events.has(event)) {
            (_a = this.events.get(event)) === null || _a === void 0 ? void 0 : _a.delete(listener);
        }
    }
    addDynamicEvent(event) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
    }
    has(event) {
        return this.events.has(event);
    }
}
export const eventBus = new EventBus();
