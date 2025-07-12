import chillSwapABI from './DeTradeSwapABI';
import FACTORY_ABI_V2 from './factoryABI_v2';
import FACTORY_ABI_V3 from './factoryABI_v3';
import PAIR_ABI_V2 from './pairABI_V2';
import PAIR_ABI_V3 from './pairABI_V3';
import solanaIDL from './solanaIDL';
import tokenABI from './tokenABI';
const abis = {
    factoryABI: {
        v1: [],
        v2: FACTORY_ABI_V2,
        v3: FACTORY_ABI_V3
    },
    pairABI: {
        v1: [],
        v2: PAIR_ABI_V2,
        v3: PAIR_ABI_V3
    },
    tokenABI,
    chillSwapABI,
    solanaIDL
};
export default abis;
