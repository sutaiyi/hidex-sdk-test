import { mTokenAddress } from "../../common/config";
const abi = [
    ['function chillSwapTokenToToken(uint256 amountIn, uint256 amountOutMin, bytes calldata path, address inviter)'],
    ['function swapTokenWithETHForCustomCommissionRate(uint256 amountIn, uint256 amountOutMin, bytes calldata path, bytes signature, bytes contents)'],
    ['function swapTokenToETHForCustomCommissionRate(uint256 amountIn, uint256 amountOutMin, bytes calldata path, bytes signature, bytes contents)'],
];
export const abiInFun = {
    chillSwapTokenToToken: abi[0],
    swapTokenWithETHForCustomCommissionRate: abi[1],
    swapTokenToETHForCustomCommissionRate: abi[2],
};
export const wethAbi = ['function deposit() payable', 'function withdraw(uint256 wad)', 'function balanceOf(address owner) view returns (uint256)'];
export const actionNameAndValue = (inAddress, outAddress, amountIn) => {
    let action = 'chillSwapTokenToToken';
    let value = '0x00';
    if (inAddress.toLowerCase() === mTokenAddress.toLowerCase()) {
        action = 'swapTokenWithETHForCustomCommissionRate';
        value = amountIn;
    }
    if (outAddress.toLowerCase() === mTokenAddress.toLowerCase()) {
        action = 'swapTokenToETHForCustomCommissionRate';
    }
    return { action, value };
};
