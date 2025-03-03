import Encryptor from 'browser-passworder';
declare class PassworderController {
    encryptor: typeof Encryptor;
    constructor();
    encrypt: (password: string, secrets: string) => Promise<string>;
    decrypt: (password: string, encrypted: string) => Promise<string>;
}
declare const _default: PassworderController;
export default _default;
//# sourceMappingURL=passworder.d.ts.map