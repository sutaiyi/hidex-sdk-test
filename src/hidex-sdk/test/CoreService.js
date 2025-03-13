export class CoreService {
    status = 'stopped';
    config = {};
    eventListeners = new Map();
    async start(config) {
        if (this.status !== 'stopped') {
            throw new Error('Service is already running');
        }
        this.status = 'starting';
        this.config = { ...this.config, ...config };
        try {
            await this.initialize();
            this.status = 'running';
            this.emit('start', this.config);
        }
        catch (error) {
            this.status = 'error';
            this.emit('error', error);
            throw error;
        }
    }
    async stop() {
        if (this.status !== 'running') {
            throw new Error('Service is not running2');
        }
        this.status = 'stopping';
        try {
            await this.cleanup();
            this.status = 'stopped';
            this.emit('stop');
        }
        catch (error) {
            this.status = 'error';
            this.emit('error', error);
            throw error;
        }
    }
    getStatus() {
        return this.status;
    }
    on(event, callback) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.push(callback);
        this.eventListeners.set(event, listeners);
    }
    async initialize() {
        await this.validateConfig();
        await this.connectToDependencies();
    }
    async cleanup() {
        await this.closeConnections();
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }
    async validateConfig() {
    }
    async connectToDependencies() {
    }
    async closeConnections() {
    }
}
