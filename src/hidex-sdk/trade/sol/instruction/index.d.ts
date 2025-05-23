import { TransactionMessage, VersionedTransaction, AddressLookupTableAccount } from '@solana/web3.js';
import { CurrentSymbol, OptionsCommon } from '../../../main/interfaces';
export declare function resetInstructions(currentSymbol: CurrentSymbol, transactionMessage: TransactionMessage, newInputAmount: bigint, newOutputAmount: bigint): TransactionMessage;
export declare function compileTransaction(swapBase64Str: string, HS: OptionsCommon): Promise<{
    message: TransactionMessage;
    addressesLookup: AddressLookupTableAccount[];
}>;
export declare function isInstructionsSupportReset(transactionMessage: TransactionMessage, currentSymbol: CurrentSymbol): boolean;
export declare function getClainSignature(signer: string, contentsHex: string, claimSignHex: string, recentBlockhash: string, owner: any, HS: OptionsCommon): Promise<VersionedTransaction>;
export declare function getTransactionsSignature(transactionMessage: TransactionMessage, addressLookupTableAccounts: AddressLookupTableAccount[], recentBlockhash: string, currentSymbol: CurrentSymbol, owner: any, HS: OptionsCommon): Promise<Array<VersionedTransaction>>;
//# sourceMappingURL=index.d.ts.map