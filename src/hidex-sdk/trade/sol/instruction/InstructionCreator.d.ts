import * as anchor from '@project-serum/anchor';
import { AddressLookupTableAccount, PublicKey, TransactionInstruction, VersionedTransaction } from '@solana/web3.js';
import { INetworkService } from '../../../network/interfaces';
import { CurrentSymbol } from '../../interfaces';
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
export declare function getTotalFee(currentSymbol: CurrentSymbol): string;
export declare function createSwapPrepareInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createSwapCompleteInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createBuySwapPrepareInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function signTransaction(): void;
export declare function createBuySwapCompletedInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createSaleSwapPrepareInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createSaleSwapCompletedInstruction(currentSymbol: CurrentSymbol, owner: any, network: INetworkService): Promise<anchor.web3.TransactionInstruction>;
export declare function createTipTransferInstruction(from: PublicKey, to: PublicKey, lamports: bigint): Promise<TransactionInstruction>;
//# sourceMappingURL=InstructionCreator.d.ts.map