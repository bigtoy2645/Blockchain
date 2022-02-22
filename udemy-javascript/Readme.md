# Learn Blockchain By Building Your Own In JavaScript

강의 : https://www.udemy.com/share/1024hC3@O0pAtPMKCcBkDQXtCmw9JgC_GpGaCA-Csc9j5Fam4NydzD4vqnaASLTya0adzwqn/   
소스 : https://github.com/erictraub/Learn-Blockchain-By-Building-Your-Own-In-JavaScript

<details>
<summary>Chapter 1. Building a blockchain</summary>

## Building a blockchain
    
### 블록체인의 특성
- Ledger
- Immutable
- Distributed

#### 블록체인의 종류
<img width="486" alt="스크린샷 2022-02-16 오전 12 17 34" src="https://user-images.githubusercontent.com/17891566/154091730-1a50a128-9fd4-467a-9b7e-53a54cf79716.png">

#### Genesis Block
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
    
</details>

<details>
<summary>Chapter 2. Accessing the blockchain through an api</summary>

## Accessing the blockchain through an api

### 필요한 모듈 설치
node : 서버용 JavaScript Runtime
npm : Node JavaScript를 위한 패키지 매니저. node가 패키지를 찾을 수 있도록 모듈을 관리한다.

```js
$ npm i express --save      // 웹 서비스 쉽게 구현할 수 있음
$ npm i nodemon --save      // 파일이 수정되면 서버를 자동으로 Restart
$ npm i body-parser --save  // req.body parsing
$ npm i uuid --save         // uuid 생성
```

```js
const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid');
```

### api.js
```js
const app = express();

// uuid.v1() : timestamp
const nodeAddress = uuid.v1().split('-').join(''); // - 구분 제거
const bitcoin = new Blockchain();

app.use(bodyParser.json());                             // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false }));    // for parsing application/x-www-form-urlencoded

/* 블록체인 정보 전달 */
app.get('/blockchain', function (req, res) {
  res.send(bitcoin)
});

/* req.body 정보로 Transaction을 생성한다. */
app.post('/transaction', function(req, res) {
    const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

/* 채굴하여 블록을 생성한다. */
app.get('/mine', function(req, res) {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transaction: bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1
    };
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    bitcoin.createNewTransaction(12.5, "00", nodeAddress); // 채굴 보상

    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
    res.json({
        none: "New block mined successfully",
        block: newBlock
    })
});

/* 3000 포트로 요청 대기 */
app.listen(3000, function() {
    console.log('Listening on port 3000...');
})
```

</details>
