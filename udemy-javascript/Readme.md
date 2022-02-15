# Learn Blockchain By Building Your Own In JavaScript

강의 : https://www.udemy.com/share/1024hC3@O0pAtPMKCcBkDQXtCmw9JgC_GpGaCA-Csc9j5Fam4NydzD4vqnaASLTya0adzwqn/   
소스 : https://github.com/erictraub/Learn-Blockchain-By-Building-Your-Own-In-JavaScript

### 블록체인의 특성
- Ledger
- Immutable
- Distributed

### Genesis Block
블록체인에서 생성된 첫 번째 블록
```js
function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];

    this.createNewBlock(100, '0', '0'); // Genesis Block
}
```js

### Block
```js
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
```

### Transaction
```js
/* Transaction 생성 */
Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
    const newTransaction = {
        amount: amount,
        sender: sender,
        recipient: recipient
    };

    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock()['index'] + 1;
}
```

### Proof of work
이전 블록 해시 값을 기준으로 nonce 값을 찾아 작업을 증명한다.
```js
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
```
#### 해시함수를 사용하는 이유
- 공개키의 해시 값을 지갑 주소로 활용해 익명 거래가 가능하다.
- 체인으로 연결된 previousBlockHash를 사용하여 현재 블록의 해시 값 검증이 가능하다.
- 블록에 담긴 거래를 한번에 해시한 값(Merkle Root)을 저장하여 개별 거래의 위변조 검증이 가능하다.
- Proof of work에 활용이 가능하다.

### 블록체인을 통한 거래 방법
1. A가 B에게 송금을 요청한다.
2. 거래 정보가 담긴 블록이 생성된다.
3. 모든 네트워크 참여자에게 블록이 전송된다.
4. 참여자는 거래 정보의 유효성을 상호 검증한다.
5. 참여자 과반수가 일치하는 정보를 정상 거래로 판단한다.
6. 검증이 완료된 블록은 이전 블록과 연결된다.
7. 사본이 참여자의 컴퓨터에 각자 저장된다.
8. A의 송금이 완료된다.
