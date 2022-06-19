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
- node : 서버용 JavaScript Runtime   
- npm : Node JavaScript를 위한 패키지 매니저. node가 패키지를 찾을 수 있도록 모듈을 관리한다.

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

/* 블록체인 정보 전달
   test : localhost:3000/blockchain
 */
app.get('/blockchain', function (req, res) {
  res.send(bitcoin)
});

/* req.body 정보로 Transaction을 생성한다.
   test : postman
 */
app.post('/transaction', function(req, res) {
    const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

/* 채굴하여 블록을 생성한다.
   test : localhost:3000/mine
 */
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
    
### 서버 구동
package.json에 api.js 파일 수정 시 서버 재구동하도록 등록
```js
"scripts": {
  "start": "nodemon --watch dev -e js dev/api.js"
},
```    
```
$ node dev/api.js 
```
</details>

<details>
<summary>Chapter 3. Creating a decentralized blockchain network</summary>

## Creating a decentralized blockchain network

### 필요한 모듈 설치
- node : 서버용 JavaScript Runtime   
- npm : Node JavaScript를 위한 패키지 매니저. node가 패키지를 찾을 수 있도록 모듈을 관리한다.

```js
$ npm i request-promise --save  // 비동기 처리를 간편하게 사용. deprecated.      
```

```js
const rp = require('request-promise');
```

### 신규 노드가 추가되었을 때 블록체인 네트워크의 동작 방식 

#### Blockchain.js
```js
const currentNodeUrl = process.argv[3];     // 서버 구동 시 URL 입력 받음

function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;   // 노드 URL 지정
    this.networkNodes = [];                 // 연결된 노드 URL 저장

    this.createNewBlock(100, '0', '0');     // Genesis Block
}
```

#### networkNode.js
```js
/* 신규 노드를 등록하고 연결된 노드에 등록을 요청한다 */
app.post('/register-and-broadcast-node', function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);

    // 노드 등록 요청
    const regNodesPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };
        regNodesPromises.push(rp(requestOptions));
    });

    // 연결된 노드들이 등록을 마치면 신규 노드에 노드 목록 전송
    Promise.all(regNodesPromises)
    .then(data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl] },
            json: true
        };

        return rp(bulkRegisterOptions);
    })
    .then(data => {
        res.json({ note: 'New node registered with network successfully.' });
    });
});

/* 신규 노드를 등록한다. */
app.post('/register-node', function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1 &&
        bitcoin.currentNodeUrl != newNodeUrl) bitcoin.networkNodes.push(newNodeUrl);
    res.json({ note: `New node registered successfully with node ${newNodeUrl}.` });
});


/* 여러 노드를 등록한다. */ 
app.post('/register-nodes-bulk', function(req, res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        if (bitcoin.networkNodes.indexOf(networkNodeUrl) == -1 &&
            bitcoin.currentNodeUrl != networkNodeUrl) bitcoin.networkNodes.push(networkNodeUrl);
    });

    res.json({ note: 'Bulk registration successful.' });
});

/* 입력받은 포트로 요청 대기 */
app.listen(port, function() {
    console.log(`Listening on port ${port}...`);
})
```

### package.json
노드를 여러 대 생성하여 테스트한다.
```js
$ npm run node_1
$ npm run node_2
$ npm run node_3
$ npm run node_4
$ npm run node_5
```

```js
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "node_1": "nodemon --watch dev -e js dev/networkNode.js 3001 http://localhost:3001",
    "node_2": "nodemon --watch dev -e js dev/networkNode.js 3002 http://localhost:3002",
    "node_3": "nodemon --watch dev -e js dev/networkNode.js 3003 http://localhost:3003",
    "node_4": "nodemon --watch dev -e js dev/networkNode.js 3004 http://localhost:3004",
    "node_5": "nodemon --watch dev -e js dev/networkNode.js 3005 http://localhost:3005"
  },
```
</details>

<details>
<summary>Chapter 4. Synchronizing the network</summary>

## Synchronizing the network

### 연결된 노드와 Transaction 동기화
#### blockchain.js
```js
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
```

#### networkNode.js
```js
/* req.body 정보로 Transaction을 생성한다. */
app.post('/transaction', function(req, res) {
    const newTransaction = req.body;
    const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
    res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

/* 연결된 노드에게 Transaction을 전달한다. */ 
app.post('/transaction/broadcast', function(req, res) {
    const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionToPendingTransactions(newTransaction);

    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data => {
        res.json({ note: 'Transaction created and broadcast successfully.' });
    });
});
```

### 채굴 시 연결된 노드에게 신규 블록 생성을 알리고 동기화한다.
#### networkNode.js
```js
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
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
    
    const requestPromises = [];
    // 연결된 노드에게 새로운 블록 생성 알림
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + "/receive-new-block",
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

     // 채굴 보상
    Promise.all(requestPromises)
    .then(data => {
        const requestOptions = {
            uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body: {
                amount: 12.5,
                sender: "00",
                recipient: nodeAddress
            },
            json: true
        };

        return rp(requestOptions);
    })
    .then(data => {
        res.json({
            none: "New block mined successfully",
            block: newBlock
        });
    });
});

/* 신규 블록을 연결한다. */ 
app.post('/receive-new-block', function(req, res) {
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

    if (correctHash && correctIndex) {
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];
        res.json({
            note: 'New block received and accepted.',
            newBlock: newBlock
        });
    } else {
        res.json({
            note: 'New block rejected.',
            newBlock: newBlock
        })
    }
});
```
</details>

<details>
<summary>Chapter 5. Consensus</summary>

## Consensus

블록체인의 합의 : 부정확한 데이터를 솎아내기 위해 합의를 진행한다.   
Longest chain rule를 따른다.   

### blockchain.js
```js
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
```

### test.js
```js
const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

const bc1 = 
{
    "chain": [
    {
    "index": 1,
    "timestamp": 1647438160002,
    "transactions": [],
    "nonce": 100,
    "hash": "0",
    "previousBlockHash": "0"
    },
    {
    "index": 2,
    "timestamp": 1647438165628,
    "transactions": [],
    "nonce": 18140,
    "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
    "previousBlockHash": "0"
    },
    {
    "index": 3,
    "timestamp": 1647438180981,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "037a948073b84387bca25f40f7f93b6d",
    "transactionId": "f5cd7a9bb2844b83ad7f0bff11c95379"
    },
    {
    "amount": "70",
    "sender": "VVPPEEEDDIEFADFSWKFKS",
    "recipient": "XXEEXXXBBGDDSSDFGKWQBOOO",
    "transactionId": "5d46840d069547e094def9a40fd5a808"
    },
    {
    "amount": "60",
    "sender": "VVPPEEEDDIEFADFSWKFKS",
    "recipient": "XXEEXXXBBGDDSSDFGKWQBOOO",
    "transactionId": "eb263b2409a0487b80fe2b9ea6b738c2"
    }
    ],
    "nonce": 24218,
    "hash": "00006ce6bbfca012b658e1802076d8481f9f7392273da0326ddfd038eb1b2b2f",
    "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
    },
    {
    "index": 4,
    "timestamp": 1647438189802,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "037a948073b84387bca25f40f7f93b6d",
    "transactionId": "54c6e58b23f048d898e2b7dd5a49feba"
    },
    {
    "amount": "50",
    "sender": "VVPPEEEDDIEFADFSWKFKS",
    "recipient": "XXEEXXXBBGDDSSDFGKWQBOOO",
    "transactionId": "2d75868400e143bb80df2ccb7ac3566b"
    }
    ],
    "nonce": 66981,
    "hash": "0000951c6e124bf436d1df3be0d7cd29c78b92a7950d0c95d4640ee501072468",
    "previousBlockHash": "00006ce6bbfca012b658e1802076d8481f9f7392273da0326ddfd038eb1b2b2f"
    },
    {
    "index": 5,
    "timestamp": 1647438207488,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "037a948073b84387bca25f40f7f93b6d",
    "transactionId": "b857198a54d544f0a8724aef3459c85b"
    },
    {
    "amount": "40",
    "sender": "VVPPEEEDDIEFADFSWKFKS",
    "recipient": "XXEEXXXBBGDDSSDFGKWQBOOO",
    "transactionId": "8482de56b818499caab6f930233d0b64"
    },
    {
    "amount": "10",
    "sender": "VVPPEEEDDIEFADFSWKFKS",
    "recipient": "XXEEXXXBBGDDSSDFGKWQBOOO",
    "transactionId": "bc9b49c884ec4c16897df2ecfeb7011e"
    }
    ],
    "nonce": 14857,
    "hash": "000053a32386a154fc574056560c75d18b6279b985917d08931d8116ad59aeb6",
    "previousBlockHash": "0000951c6e124bf436d1df3be0d7cd29c78b92a7950d0c95d4640ee501072468"
    },
    {
    "index": 6,
    "timestamp": 1647438209319,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "037a948073b84387bca25f40f7f93b6d",
    "transactionId": "cfdcab85a62c4a13b899a66f8ba5734b"
    }
    ],
    "nonce": 136613,
    "hash": "0000e18a4f9a029b86c76e43c69a18efacc59a80640efab5ff985a898040c6a8",
    "previousBlockHash": "000053a32386a154fc574056560c75d18b6279b985917d08931d8116ad59aeb6"
    }
    ],
    "pendingTransactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "037a948073b84387bca25f40f7f93b6d",
    "transactionId": "0cc1908f4b494b0a9bcb69c5a774ce4f"
    }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
};

console.log('Chain is valid: ', bitcoin.chainIsValid(bc1.chain));
```

### networkNode.js
의문점 : 가장 긴 블록체인을 먼저 찾을 게 아니라, 유효한 블록체인 중 제일 긴 걸 동기화해야 하지 않는가? 계산 시간 문제?

```js
/* 합의 */
app.get('/consensus', function(req, res) {
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(blockchains => {
        const currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;

        // 가장 길이가 긴 블록체인을 찾는다.
        blockchains.forEach(blockchain => {
            if (blockchain.chain.length > maxChainLength) {
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions;
            };
        });

        // 유효한 경우 데이터를 동기화한다.
        if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
            res.json({
                note: 'Current chain has not been replaced.',
                chain: bitcoin.chain
            });
        } else {
            bitcoin.chain = newLongestChain;
            bitcoin.pendingTransactions = newPendingTransactions;
            res.json({
                note: 'Current chain has been replaced.',
                chain: bitcoin.chain
            });
        }
    });
});
```

#### 테스트
1. 3001번 ~ 3004번 노드를 먼저 연결한다.
2. 채굴한다. (3001번 ~ 3004번 데이터 동기화됨.)
3. 3001번에 3005번을 등록 및 연결한다.
4. 3005번/consensus 한다.
5. 3001번 ~ 3005번의 데이터가 동기화 된다.

### Longest chain rule의 단점
비슷한 시간대에 채굴한 두 정직한 노드가 있을 경우, 둘 중 하나는 가장 긴 체인에 합류하지 못해 고아블록(orphan blocks)이 됨.   
고아블록이 많을 수록 가장 긴 체인의 성장률이 저하되어 공격 당하기 쉬운 상태가 됨.
    
</details>
    
<details>
<summary>Chapter 6. Block Explorer</summary>
    
## Block Explorer
    
### blockchain.js
```js
/* 해시 값이 일치하는 블록을 찾는다. */
Blockchain.prototype.getBlock = function(blockHash) {
    let correctBlock = null;
    this.chain.forEach(block => {
        if (block.hash === blockHash) correctBlock = block;
    });
    return correctBlock;
}

/* 트랜잭션 ID 값이 일치하는 블록과 트랜잭션을 찾는다. */
Blockchain.prototype.getTransaction = function(transactionId) {
    let correctTransaction = null;
    let correctBlock = null;

    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if (transaction.transactionId === transactionId) {
                correctTransaction = transaction;
                correctBlock = block;
            }
        });
    });
    return {
        transaction: correctTransaction,
        block: correctBlock
    };
}

/* 주소값으로 송신/수신한 트랜잭션을 찾는다. */
Blockchain.prototype.getAddressData = function(address) {
    const addressTransactions = [];
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if (transaction.sender === address || transaction.recipient === address) {
                addressTransactions.push(transaction);
            }
        });
    });

    let balance = 0;
    addressTransactions.forEach(transaction => {
        if (transaction.recipient === address) balance += transaction.amount;
        else if (transaction.sender === address) balance -= transaction.amount;
    });

    return {
        addressTransactions: addressTransactions,
        addressBalance: balance
    };
}
```
    
### networkNode.js
```js
/* 해시 값으로 블록 정보를 조회한다. */
app.get('/block/:blockHash', function(req, res) { // localhost:3001/block/WERASDFDS231SDFASDF
    const blockHash = req.params.blockHash;
    const correctBlock = bitcoin.getBlock(blockHash);
    res.json({
        block: correctBlock
    });
});

/* 트랜잭션 ID로 트랜잭션과 블록 정보를 조회한다. */
app.get('/transaction/:transactionId', function(req, res) {
    const transactionId = req.params.transactionId;
    const transactionData = bitcoin.getTransaction(transactionId);
    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block
    });
});

/* 주소값으로 거래가 발생한 트랜잭션 정보를 조회한다. */
app.get('/address/:address', function(req, res) {
    const address = req.params.address;
    const addressData = bitcoin.getAddressData(address);
    res.json({
        addressData: addressData
    });
});

/* front-end */
app.get('/block-explorer', function(req, res) {
    res.sendFile('./block-explorer/index.html', { root: __dirname }); // 현재 디렉터리에서 block-explorer/index.html을 찾는다.
});
```

#### /block/:blockHash   
<img width="700" alt="스크린샷 2022-03-23 오후 10 38 59" src="https://user-images.githubusercontent.com/17891566/159712732-3090c9d4-3876-4ecd-abea-06c5dc7ff6a0.png">

    
#### /transaction/:transactionId   
<img width="700" alt="스크린샷 2022-03-23 오후 10 38 01" src="https://user-images.githubusercontent.com/17891566/159712704-0ca20f10-8fed-4720-842e-612500e370d3.png">
      
#### /address/:address    
<img width="700" alt="스크린샷 2022-03-23 오후 10 38 39" src="https://user-images.githubusercontent.com/17891566/159712718-65c3d3e0-7548-4bf6-be25-caaf2e6deed0.png">

</details>
