export interface ICoreService {
    start(config?: Record<string, unknown>): Promise<void>;
    stop(): Promise<void>;
    getStatus(): ServiceStatus;
    on(event: string, callback: EventCallback): void;
}
export type ServiceStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
export type EventCallback = (data?: unknown) => void;
