import { ETH_SERIES, NOAPPROVE_CHAINID, mTokenAddress } from '../../common/config';
import CatcherService from '../../catch';
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
    async execute(tokenAddress, accountAddress, authorizedAddress) {
        try {
            const currentNetWork = this.network.get();
            this.getApprovedVerify(tokenAddress, accountAddress, authorizedAddress, currentNetWork.chain.toUpperCase());
            if (NOAPPROVE_CHAINID.indexOf(currentNetWork.chainID) !== -1) {
                return true;
            }
            if (ETH_SERIES.indexOf(currentNetWork.chain.toUpperCase()) !== -1) {
                const hasApprove = await this.hasApprovedInLoca(tokenAddress, accountAddress, authorizedAddress);
                console.log('ETH系，是否授权过', hasApprove, authorizedAddress, tokenAddress, accountAddress);
                if (hasApprove) {
                    this.set(currentNetWork.chain, accountAddress, tokenAddress, authorizedAddress);
                    return true;
                }
                const approvedResult = await this.trade.toApprove(tokenAddress, accountAddress, authorizedAddress);
                if (approvedResult) {
                    await this.set(currentNetWork.chain, accountAddress, tokenAddress, authorizedAddress);
                }
            }
            return true;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async set(key, accountAddress, tokenAddress, value) {
        return await this.setItem(`Approved-Token:${key.toLowerCase()}-${accountAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`, value);
    }
    async get(key, accountAddress, tokenAddress) {
        return await this.getItem(`Approved-Token:${key.toLowerCase()}-${accountAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`);
    }
    async remove(key, accountAddress, tokenAddress) {
        if (await this.get(key, accountAddress, tokenAddress)) {
            return await this.removeItem(`Approved-Token:${key.toLowerCase()}-${accountAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`);
        }
    }
}
export default ApproveService;
