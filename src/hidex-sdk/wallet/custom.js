export default class CustomWallet {
    keypair;
    constructor(keypair) {
        this.keypair = keypair;
    }
    get publicKey() {
        return this.keypair.publicKey;
    }
    async signTransaction(transaction) {
        transaction.partialSign(this.keypair);
        return transaction;
    }
    async signAllTransactions(transactions) {
        transactions.forEach(transaction => transaction.partialSign(this.keypair));
        return transactions;
    }
}
