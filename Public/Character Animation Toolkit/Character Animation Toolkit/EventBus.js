// @ts-nocheck
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
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)?.add(listener);
    }
    emit(event, ...args) {
        if (this.events.has(event)) {
            this.events.get(event)?.forEach((listener) => listener(...args));
        }
    }
    off(event, listener) {
        if (this.events.has(event)) {
            this.events.get(event)?.delete(listener);
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
