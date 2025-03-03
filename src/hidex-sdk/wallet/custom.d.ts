import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
export default class CustomWallet {
    private keypair;
    constructor(keypair: Keypair);
    get publicKey(): PublicKey;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}
//# sourceMappingURL=custom.d.ts.map