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

console.log('Genesis block: ', bitcoin);

const previousBlockHash = '0239423FPGPA2SSQWSA'
const currentBlockData = [
    {
        amount: 10,
        sender: '2ZSDFESKDFLKWLSDKF',
        recipient: '3AAZSDFESKDFLKWLSDKF'
    },
    {
        amount: 20,
        sender: '0ZSDFESKDFLKWLSDKF',
        recipient: '4AAZSDFESKDFLKWLSDKF'
    },
    {
        amount: 30,
        sender: '1ZSDFESKDFLKWLSDKF',
        recipient: '5AAZSDFESKDFLKWLSDKF'
    }
];

const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
console.log('nonce: ', nonce);

// Test for transaction
bitcoin.createNewBlock(1234, '0294DFSWFKDKD', '0239423FPGPA');

console.log(bitcoin.chain[1]);

bitcoin.createNewTransaction(100, '0294DFSWFKDKD', '0294DFSWFKDKE');

bitcoin.createNewBlock(1235, '0294DFSWFKDKE', '0239423FPGPB');

console.log(bitcoin.chain[2]);

console.log('-');
console.log(bitcoin.createNewTransaction(50, '0294DFSWFKDKD', '0294DFSWFKDKE'));
console.log(bitcoin.createNewTransaction(20, '0294DFSWFKDKD', '0294DFSWFKDKE'));
console.log(bitcoin.createNewTransaction(10, '0294DFSWFKDKD', '0294DFSWFKDKE'));
console.log('-');
bitcoin.createNewBlock(1236, '0294DFSWFKDKF', '0239423FPGPC');

console.log(bitcoin.chain[3]);