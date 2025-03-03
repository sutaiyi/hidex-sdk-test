type Listener<T extends any[] = any[]> = (...args: T) => void;
declare class EventEmitter {
    private listeners;
    on<T extends any[]>(event: string, callback: Listener<T>): void;
    emit<T extends any[]>(event: string, ...args: T): void;
    off<T extends any[]>(event: string, callback: Listener<T>): void;
}
export default EventEmitter;
//# sourceMappingURL=eventEmitter.d.ts.map