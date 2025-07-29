import { Connection, TransactionMessage, VersionedTransaction, AddressLookupTableAccount } from '@solana/web3.js';
import { CurrentSymbol, OptionsCommon } from '../../../main/interfaces';
import { ConnectedSolanaWallet, SupportedSolanaTransaction, UseSignTransactionInterface } from '@privy-io/react-auth/solana';
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
export declare function getClaimSignature(signer: string, contentsHex: string, claimSignHex: string, recentBlockhash: string, wallet: ConnectedSolanaWallet & {
    useSignTransaction: UseSignTransactionInterface['signTransaction'];
}, connection: Connection): Promise<VersionedTransaction | undefined>;
export declare function getTransactionsSignature(transactionMessage: TransactionMessage, addressLookupTableAccounts: AddressLookupTableAccount[], recentBlockhash: string, currentSymbol: CurrentSymbol, owner: any, HS: OptionsCommon): Promise<Array<VersionedTransaction>>;
export declare function getOwnerTradeNonce(owner: any, HS: OptionsCommon): Promise<number>;
export declare function getTransactionsSignatureArray(transactionMessage: TransactionMessage, addressLookupTableAccounts: AddressLookupTableAccount[], recentBlockhash: string, currentSymbol: CurrentSymbol, wallet: ConnectedSolanaWallet & {
    useSignTransaction: UseSignTransactionInterface['signTransaction'];
}, connection: Connection, HS: OptionsCommon): Promise<Array<Array<SupportedSolanaTransaction>>>;
export declare function getTransactionsSignatureArray2(transactionMessage: TransactionMessage, addressLookupTableAccounts: AddressLookupTableAccount[], recentBlockhash: string, currentSymbol: CurrentSymbol, wallet: ConnectedSolanaWallet & {
    useSignTransaction: UseSignTransactionInterface['signTransaction'];
}, connection: Connection, HS: OptionsCommon): Promise<Array<Array<SupportedSolanaTransaction>>>;
//# sourceMappingURL=index.d.ts.map