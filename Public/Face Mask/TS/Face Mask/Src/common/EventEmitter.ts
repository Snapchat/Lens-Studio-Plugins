import { GeneratorState } from "../generator/Generator";

export default class EventEmitter {
    events: Record<string, Function[]>;

    constructor() {
        this.events = {};
    }

    on(event: GeneratorState, listener: Function) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event: GeneratorState, listener: Function) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event: GeneratorState, ...args: any[]) {
        if (!this.events[event]) return;

        this.events[event].forEach(listener => {
            listener(...args);
        });
    }
}
