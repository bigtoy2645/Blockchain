const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

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