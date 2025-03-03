import Encryptor from 'browser-passworder';
class PassworderController {
    encryptor = Encryptor;
    constructor() {
    }
    encrypt = async (password, secrets) => {
        try {
            return await this.encryptor.encrypt(password, secrets);
            ;
        }
        catch (error) {
            console.log(error);
            throw new Error('Error encrypting password' + error);
        }
    };
    decrypt = async (password, encrypted) => {
        try {
            return await this.encryptor.decrypt(password, encrypted);
        }
        catch (error) {
            throw new Error('Error decryption password' + error);
        }
    };
}
export default new PassworderController();
