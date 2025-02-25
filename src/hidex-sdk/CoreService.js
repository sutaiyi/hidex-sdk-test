"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreService = void 0;
class CoreService {
    constructor() {
        // 实例变量
        this.status = 'stopped';
        this.config = {};
        this.eventListeners = new Map();
    }
    // 公共方法
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
            throw new Error('Service is not running');
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
    // 内部方法
    async initialize() {
        // 初始化逻辑
        await this.validateConfig();
        await this.connectToDependencies();
    }
    async cleanup() {
        // 清理逻辑
        await this.closeConnections();
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }
    // 私有辅助方法
    async validateConfig() {
        // 配置验证逻辑
    }
    async connectToDependencies() {
        // 连接外部依赖
    }
    async closeConnections() {
        // 关闭连接
    }
}
exports.CoreService = CoreService;
