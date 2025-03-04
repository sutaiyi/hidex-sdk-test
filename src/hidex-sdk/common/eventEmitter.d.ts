type EventMap = Record<string | symbol, any[]>;
export default class EventEmitter<TEventMap extends EventMap = EventMap> {
    private _events;
    on<K extends keyof TEventMap>(event: K, listener: (...args: TEventMap[K]) => void): () => void;
    off<K extends keyof TEventMap>(event: K, listener: (...args: TEventMap[K]) => void): void;
    emit<K extends keyof TEventMap>(event: K, ...args: TEventMap[K]): void;
    once<K extends keyof TEventMap>(event: K, listener: (...args: TEventMap[K]) => void): () => void;
}
export {};
//# sourceMappingURL=eventEmitter.d.ts.map