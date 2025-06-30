import { TransactionMessage, VersionedTransaction, AddressLookupTableAccount } from '@solana/web3.js';
import { CurrentSymbol, OptionsCommon } from '../../../main/interfaces';
export declare function resetInstructions(currentSymbol: CurrentSymbol, transactionMessage: TransactionMessage, newInputAmount: bigint, newOutputAmount: bigint): TransactionMessage;
export declare function compileTransaction(swapBase64Str: string, HS: OptionsCommon): Promise<{
    message: TransactionMessage;
    addressesLookup: AddressLookupTableAccount[];
}>;
export declare function compileTransactionByAddressLookup(swapBase64Str: string, addressLookupTableAccounts: AddressLookupTableAccount[], HS: OptionsCommon): Promise<{
    message: TransactionMessage;
    addressesLookup: AddressLookupTableAccount[];
}>;
export declare function getAddressLookup(swapBase64Str: string, HS: OptionsCommon): Promise<{
    addressesLookup: AddressLookupTableAccount[];
}>;
export declare function getActualLamports(currentSymbol: CurrentSymbol, swapBase64Str: string, addressesLookup: AddressLookupTableAccount[]): bigint | undefined;
export declare function isInstructionsSupportReset(transactionMessage: TransactionMessage, currentSymbol: CurrentSymbol): boolean;
export declare function getClainSignature(signer: string, contentsHex: string, claimSignHex: string, recentBlockhash: string, owner: any, HS: OptionsCommon): Promise<VersionedTransaction>;
export declare function getTransactionsSignature(transactionMessage: TransactionMessage, addressLookupTableAccounts: AddressLookupTableAccount[], recentBlockhash: string, currentSymbol: CurrentSymbol, owner: any, HS: OptionsCommon): Promise<Array<VersionedTransaction>>;
export declare function getOwnerTradeNonce(owner: any, HS: OptionsCommon): Promise<number>;
export declare function getTransactionsSignatureArray(transactionMessage: TransactionMessage, addressLookupTableAccounts: AddressLookupTableAccount[], recentBlockhash: string, tradeNonce: number | undefined, currentSymbol: CurrentSymbol, owner: any, HS: OptionsCommon): Promise<Array<Array<VersionedTransaction>>>;
//# sourceMappingURL=index.d.ts.map