import Encryptor from 'browser-passworder';
class PassworderController {
    encryptor = Encryptor;
    constructor() { }
    encrypt = async (password, secrets) => {
        try {
            return await this.encryptor.encrypt(password, secrets);
        }
        catch (error) {
            throw new Error('Error Encrypting Password' + error);
        }
    };
    decrypt = async (password, encrypted) => {
        try {
            return await this.encryptor.decrypt(password, encrypted);
        }
        catch (error) {
            console.log('decrypterror', error);
            throw new Error('Error Decryption Password' + error);
        }
    };
}
export default new PassworderController();
