import * as anchor from '@project-serum/anchor';
import { AddressLookupTableAccount, Connection, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { INetworkService } from '../../../network/interfaces';
import { CurrentSymbol } from '../../interfaces';
import { ConnectedSolanaWallet, SupportedSolanaTransaction, UseSignTransactionInterface } from '@privy-io/react-auth/solana';
export declare const isBuy: (currentSymbol: CurrentSymbol) => boolean;
export declare function initAnchor(owner: any, network: INetworkService): void;
export declare function information(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<{
    program: anchor.Program<anchor.Idl>;
    dataPda: PublicKey;
    swapPda: PublicKey;
    tradePda: PublicKey;
    bump2: number;
    bump3: number;
    associateTokenProgram: PublicKey;
    tokenOutMint: PublicKey;
    tokenInMint: PublicKey;
    amount: any;
    userAtaAccount: PublicKey;
    inviterPublic: any;
    wSol: PublicKey;
    swapWsolPdaAta: PublicKey;
    userwSolAta: PublicKey;
}>;
export declare function priorityFeeInstruction(limit: number, fee: number): Promise<TransactionInstruction[]>;
export declare function versionedTra(instructions: TransactionInstruction[], owner: any, latestBlockhash: string, addressLookupTableAccounts: AddressLookupTableAccount[]): Promise<VersionedTransaction>;
export declare function createVersionTransaction(instructions: TransactionInstruction[], ownerAddress: string, latestBlockhash: string, addressLookupTableAccounts: AddressLookupTableAccount[]): VersionedTransaction;
export declare function multiSignVersionedTraByPrivy(wallet: ConnectedSolanaWallet & {
    useSignTransaction: UseSignTransactionInterface['signTransaction'];
}, connection: Connection, transactions: VersionedTransaction[]): Promise<SupportedSolanaTransaction[]>;
export declare function signVersionedTraByPrivy(wallet: ConnectedSolanaWallet & {
    useSignTransaction: UseSignTransactionInterface['signTransaction'];
}, connection: Connection, transactions: VersionedTransaction[]): Promise<VersionedTransaction>;
export declare function nomalVersionedTransaction(wallet: ConnectedSolanaWallet & {
    useSignTransaction: UseSignTransactionInterface['signTransaction'];
}, instructions: TransactionInstruction[], ownerAddr: PublicKey, connection: Connection, latestBlockhash: string): Promise<VersionedTransaction>;
export declare function getTotalFee(currentSymbol: CurrentSymbol): string;
export declare function deleteTransactionGasInstruction(instructions: TransactionInstruction[]): Promise<void>;
export declare function getTransactionGasLimitUintsInInstruction(instructions: TransactionInstruction[]): number;
export declare function isParameterValid(currentSymbol: CurrentSymbol): false | undefined;
export declare function createSwapPrepareInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createSimpleSwapCompleteInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService, gasFee: number): Promise<anchor.web3.TransactionInstruction>;
export declare function createSwapCompleteInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createBuySwapPrepareInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createBuySwapCompletedInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createSaleSwapPrepareInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createClaimInstruction(contents: string, signatrue: string, ownerAddr: string): Promise<anchor.web3.TransactionInstruction>;
export declare function createTradeNonceVerifyInstruction(timeStamp: number, owner: PublicKey, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function getTradeNonce(owner: any, network: INetworkService): Promise<number>;
export declare function createEd25519ProgramIx(signer: string, contents: string, signatrue: string): Promise<anchor.web3.TransactionInstruction>;
export declare function createSaleSwapCompletedInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createSimpleBuySwapCompletedInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService, gasFee: number): Promise<anchor.web3.TransactionInstruction>;
export declare function createSimpleSaleSwapCompletedInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService, gasFee: number): Promise<anchor.web3.TransactionInstruction>;
export declare function createTipTransferInstruction(from: PublicKey, to: PublicKey, lamports: bigint): Promise<TransactionInstruction>;
export declare function numberToLittleEndianHex(num: number, byteLength: number): string;
export declare function checkAccountCloseInstruction(currentSymbol: CurrentSymbol, instruction: TransactionInstruction, owner: any, network: INetworkService): Promise<boolean>;
export declare function getInstructionAmounts(currentSymbol: CurrentSymbol, instruction: TransactionInstruction): {
    input: bigint;
    output: bigint;
};
export declare function getInstructionReplaceDataHex(currentSymbol: CurrentSymbol, programId: string, dataHex: string, inputHex: string, outputHex: string): string;
export declare function setTransferInstructionLamports(instruction: TransactionInstruction, dataHex: string, newLamports: bigint): boolean;
export declare function setCreateAccountBySeedInstructionLamports(preAmountIn: string, instruction: TransactionInstruction, dataHex: string, newLamports: bigint): boolean;
export declare function createMemoInstructionWithTxInfo(currentSymbol: CurrentSymbol): TransactionInstruction;
export declare function getDexCommisionReceiverAndLamports(currentSymbol: CurrentSymbol): Promise<{
    swap_pda: PublicKey;
    commissionAmount: number;
}>;
export declare function deleteTipCurrentInInstructions(transactionMessage: TransactionMessage): Promise<void>;
export declare function getTipAndPriorityByUserPriorityFee(priorityFee: number): {
    tipAmount: number;
    priorityAmount: number;
};
//# sourceMappingURL=InstructionCreator.d.ts.map