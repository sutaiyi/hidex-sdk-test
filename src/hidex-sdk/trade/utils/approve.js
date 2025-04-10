import { mTokenAddress } from '../../common/config';
import CatcherService from '../../catch';
import { isSol } from '.';
class ApproveService extends CatcherService {
    trade;
    network;
    constructor(options) {
        super(options.apparatus);
        this.trade = options.trade;
        this.network = options.network;
    }
    async hasApprovedInLoca(tokenAddress, accountAddress, authorizedAddress) {
        const currentNetWork = this.network.get();
        if (tokenAddress === mTokenAddress)
            return true;
        const value = await this.get(currentNetWork.chain, accountAddress, tokenAddress);
        if (!value || value !== authorizedAddress) {
            const allowance = await this.trade.getAllowance(tokenAddress, accountAddress, authorizedAddress);
            if (allowance?.toString() !== '0') {
                return true;
            }
        }
        return !!value;
    }
    getApprovedVerify(tokenAddress, accountAddress, authorizedAddress, chain) {
        setTimeout(async () => {
            const allowance = await this.trade.getAllowance(tokenAddress, accountAddress, authorizedAddress);
            if (allowance?.toString() === '0') {
                this.remove(chain, accountAddress, tokenAddress);
            }
        }, 800);
    }
    async execute(tokenAddress, accountAddress, authorizedAddress, chain) {
        try {
            if (isSol(chain)) {
                return true;
            }
            const currentNetWork = this.network.get(chain);
            this.getApprovedVerify(tokenAddress, accountAddress, authorizedAddress, currentNetWork.chain.toUpperCase());
            const hasApprove = await this.hasApprovedInLoca(tokenAddress, accountAddress, authorizedAddress);
            if (hasApprove) {
                this.set(currentNetWork.chain, accountAddress, tokenAddress, authorizedAddress);
                return true;
            }
            const approvedResult = await this.trade.toApprove(tokenAddress, accountAddress, authorizedAddress);
            if (approvedResult) {
                await this.set(currentNetWork.chain, accountAddress, tokenAddress, authorizedAddress);
            }
            return true;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async set(key, accountAddress, tokenAddress, value) {
        const allData = await this.getAll();
        allData[`${key.toLowerCase()}-${accountAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`] = value;
        return await this.setItem(`Approved-Tokens`, value);
    }
    async get(key, accountAddress, tokenAddress) {
        const allData = await this.getAll();
        return allData[`${key.toLowerCase()}-${accountAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`];
    }
    async getAll() {
        const tokens = await this.getItem('Approved-Tokens');
        if (tokens && typeof tokens === 'object') {
            return tokens;
        }
        return {};
    }
    async remove(key, accountAddress, tokenAddress) {
        const allData = await this.getAll();
        delete allData[`${key.toLowerCase()}-${accountAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`];
        return await this.setItem(`Approved-Tokens`, allData);
    }
}
export default ApproveService;
