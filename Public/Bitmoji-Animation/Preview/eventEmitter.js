export default class EventEmitter {
    constructor() {
        this.events = {};
    }

    // Method to add an event listener
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    // Method to remove an event listener
    off(event, listener) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    // Method to emit an event
    emit(event, ...args) {
        if (!this.events[event]) return;

        this.events[event].forEach(listener => {
            listener(...args);
        });
    }
}
