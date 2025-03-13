import * as anchor from '@project-serum/anchor';
import { PublicKey, TransactionInstruction, VersionedTransaction } from '@solana/web3.js';
import { INetworkService } from '../../network/interfaces';
import { CurrentSymbol } from '../interfaces';
export declare const isBuy: (currentSymbol: CurrentSymbol) => boolean;
export declare function initAnchor(owner: any, network: INetworkService): void;
export declare function information(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<{
    program: anchor.Program<anchor.Idl>;
    dataPda: PublicKey;
    swapPda: PublicKey;
    bump2: number;
    associateTokenProgram: PublicKey;
    tokenOutMint: PublicKey;
    tokenInMint: PublicKey;
    amount: any;
    swapAtaAccount: PublicKey;
    userAtaAccount: PublicKey;
    inviterPublic: any;
    wSol: PublicKey;
    swapWsolPdaAta: PublicKey;
    userwSolAta: PublicKey;
}>;
export declare function priorityFeeInstruction(limit: number, fee: number): Promise<TransactionInstruction[]>;
export declare function transactionTx(owner: any, latestBlockhash: any, instruction: any, currentSymbol: CurrentSymbol, ed25519Instruction?: any): Promise<VersionedTransaction>;
export declare function versionedTra(instructions: TransactionInstruction[], owner: any, latestBlockhash: any): Promise<VersionedTransaction>;
export declare function getTotalFee(currentSymbol: CurrentSymbol): string;
export declare function raydiumCreateBuy(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function raydiumCompleteBuy(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createTokenIdempotentAnchor(currentSymbol: CurrentSymbol, owner: any, latestBlockhash: any, network: INetworkService, INSTRUCTION?: boolean, RAYDIUM?: boolean): Promise<VersionedTransaction | anchor.web3.TransactionInstruction>;
export declare function completeAnchor(currentSymbol: CurrentSymbol, inviter: string, owner: any, network: INetworkService, latestBlockhash: any, INSTRUCTION?: boolean, RAYDIUM?: boolean): Promise<VersionedTransaction | {
    completeTx: anchor.web3.TransactionInstruction | undefined;
    ed25519Instruction: TransactionInstruction;
}>;
export declare function commissionComplete(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function getRecipient(currentSymbol: CurrentSymbol): Promise<PublicKey>;
//# sourceMappingURL=instruction.d.ts.map