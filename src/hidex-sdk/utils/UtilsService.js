import ErrorService from './error';
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';
import * as tradeUtils from '../trade/utils';
import * as commonUtils from '../common/utils';
import * as timeStatisticsUtils from './timeStatistics';
export default class UtilsService {
    constructor() { }
    getErrorMessage(error) {
        console.error('Hidex SDK: ' + error.message);
        return ErrorService(error);
    }
    ownerKeypair(key) {
        return Keypair.fromSecretKey(bs58.decode(key));
    }
    environmental = commonUtils.environmental;
    trade = tradeUtils;
    common = commonUtils;
    getStatistics = timeStatisticsUtils.getStatistics;
    setStatistics = timeStatisticsUtils.setStatistics;
    clearStatistics = timeStatisticsUtils.clearStatistics;
}
