
export enum EventTypes {
    OnAuthorizationChange = 'onAuthorizationChange',
    DialogShown = 'dialogShown'
}

export class EventBus {
    private events: Map<string, Set<Function>> = new Map();

    public on(event: string | EventTypes, listener: Function): void {

        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }

        this.events.get(event)?.add(listener);
    }

    public emit(event: string | EventTypes, ...args: any[]): void {
        if (this.events.has(event)) {
            this.events.get(event)?.forEach((listener) => listener(...args));
        }
    }

    public off(event: string | EventTypes, listener: Function): void {
        if (this.events.has(event)) {
            this.events.get(event)?.delete(listener);
        }
    }

    public addDynamicEvent(event: string): void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
    }

    public has(event: string | EventTypes): boolean {
        return this.events.has(event);
    }
}

export const eventBus = new EventBus();
