import { TransactionMessage, AddressLookupTableAccount } from "@solana/web3.js";
import { CurrentSymbol, OptionsCommon } from '../../../main/interfaces';
export declare function resetInstructions(transactionMessage: TransactionMessage, newInputAmount: bigint, newOutputAmount: bigint): TransactionMessage;
export declare function compileTransaction(swapBase64Str: string, HS: OptionsCommon): Promise<{
    message: TransactionMessage;
    addressesLookup: AddressLookupTableAccount[];
}>;
export declare function isInstructionsSupportReset(transactionMessage: TransactionMessage): boolean;
export declare function getTransactionsSignature(transactionMessage: TransactionMessage, addressLookupTableAccounts: AddressLookupTableAccount[], recentBlockhash: string, currentSymbol: CurrentSymbol, owner: any, HS: OptionsCommon): Promise<string[] | null>;
//# sourceMappingURL=index.d.ts.map