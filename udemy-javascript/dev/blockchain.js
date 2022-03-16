const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid');

function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];

    this.createNewBlock(100, '0', '0'); // Genesis Block
}

// Javascript는 class를 거의 쓰지 않는다.

/* Block 생성 */ 
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
}

/* 마지막 Block */ 
Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
}

/* Transaction 생성 */
Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
    const newTransaction = {
        amount: amount,
        sender: sender,
        recipient: recipient,
        transactionId: uuid.v4().split('-').join('')
    };

    return newTransaction;
}

/* Transaction 추가 */
Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock()['index'] + 1;
};

/* sha256 Hash */
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
}

/* Hash 값이 0000으로 시작할 때까지 시도해서 nonce 값을 알아냄. */
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
    let nonce = -1;
    let hash;
    do {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    } while (hash.substring(0, 4) !== '0000');

    console.log('hash: ', hash);

    return nonce;
}

/* 블록체인이 유효한 지 확인한다. */ 
Blockchain.prototype.chainIsValid = function(blockchain) {
    let validChain = true;

    // 이전 블록의 해시값을 비교하여 체인이 유효한 지 확인한다.
    for (var i = 1; i < blockchain.length; i++) {
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i - 1];
        const blockHash = this.hashBlock(
            prevBlock["hash"],
            {
              transactions: currentBlock["transactions"],
              index: currentBlock["index"],
            },
            currentBlock["nonce"]
          );
        if (blockHash.substring(0, 4) !== "0000") {
            validChain = false; 
            console.log('Blockhash not corrected :', blockHash);
        }
        if (currentBlock['previousBlockHash'] !== prevBlock['hash']) {
            validChain = false;
            console.log('PreviousBlockHash not corrected');
        }

        console.log('previousBlockHash =>', prevBlock['hash']);
        console.log('currentBlockHash  =>', currentBlock['hash']);
        console.log('-');
    }

    // 최초 블록 유효성 체크
    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce'] === 100;
    const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
    const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock['transactions'].length === 0;
    if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) {
        validChain = false;
        console.log('genesis not corrected');
    }

    return validChain;
}

module.exports = Blockchain;