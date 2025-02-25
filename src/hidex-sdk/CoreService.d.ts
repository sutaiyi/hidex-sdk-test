import { ICoreService, ServiceStatus, EventCallback } from './interfaces';
export declare class CoreService implements ICoreService {
    private status;
    private config;
    private eventListeners;
    start(config?: Record<string, unknown>): Promise<void>;
    stop(): Promise<void>;
    getStatus(): ServiceStatus;
    on(event: string, callback: EventCallback): void;
    private initialize;
    private cleanup;
    private emit;
    private validateConfig;
    private connectToDependencies;
    private closeConnections;
}
