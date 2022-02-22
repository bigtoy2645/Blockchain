const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid');

// uuid.v1() : timestamp
const nodeAddress = uuid.v1().split('-').join(''); // - 구분 제거
const bitcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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