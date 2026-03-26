export class Logger {
    constructor() {
        this.subscribers = [];
    }

    subscribe(subscriber) {
        if (typeof subscriber === 'function') {
            this.subscribers.push(subscriber);
        } else {
            console.log('[Logger] Error: Subscriber should be a function');
        }
    }

    log(text, options = { type: 'logger', enabled: true, progressBar: false }) {
        if (options.type == null) {
            options.type = 'logger';
        }

        if (options.enabled == null) {
            options.enabled = true;
        }

        if (options.progressBar == null) {
            options.progressBar = false;
        }

        this.notifySubscribers(text, options);
    }

    notifySubscribers(text, options) {
        this.subscribers.forEach(subscriber => subscriber(text, options));
    }
}
