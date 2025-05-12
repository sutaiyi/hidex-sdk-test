export default class EventEmitter {
    _events = {};
    on(event, listener) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(listener);
        return () => this.off(event, listener);
    }
    off(event, listener) {
        const listeners = this._events[event];
        if (!listeners) {
            console.warn(`No listeners found for event: ${String(event)}`);
            return;
        }
        if (!Array.isArray(listeners)) {
            console.error(`Listeners for event ${String(event)} is not an array:`, listeners);
            return;
        }
        const initialLength = listeners.length;
        this._events[event] = listeners.filter((l) => l !== listener);
        if (this._events[event].length === initialLength) {
            console.warn(`No matching listener found for event ${String(event)} to remove`);
        }
    }
    emit(event, ...args) {
        const listeners = this._events[event];
        if (listeners) {
            listeners.slice().forEach((listener) => listener(...args));
        }
    }
    once(event, listener) {
        const onceListener = (...args) => {
            this.off(event, onceListener);
            listener(...args);
        };
        return this.on(event, onceListener);
    }
}
