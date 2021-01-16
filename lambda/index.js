console.log('Loading function');

const BigNumber = require('bignumber.js');
const thorify = require("thorify").thorify;
const mnemonic = require("thor-devkit").mnemonic;
const secp256k1 = require("thor-devkit").secp256k1;
const Transaction = require("thor-devkit").Transaction;
const Web3 = require('web3');


exports.handler = async (event) => {
  for (const { messageAttributes } of event.Records) {
    const to = messageAttributes.Address.stringValue;
    const amount = Number(messageAttributes.Amount.stringValue);
  // TODO: Check there is enough funds in the wallet before trying to send.
  const Web3 = require('web3');
  const web3 = thorify(new Web3(), 'https://sync-testnet.veblocks.net');
  const words = JSON.parse(process.env.MNEMONIC);
  const valid = mnemonic.validate(words);
  // tslint:disable-next-line: no-console
  if (!valid) console.log('inavalid mnemonic from .env');
  else {
    const privateKey = mnemonic.derivePrivateKey(words);
    const blockRef = await web3.eth.getBlockRef();
    const chainTag = await web3.eth.getChainTag();
    const value = new BigNumber(amount).times(1e18).integerValue().toString();
    const clauses = [{ data: '0x', to, value }];
    const gas = Transaction.intrinsicGas(clauses);
    const body = {
      blockRef,
      chainTag,
      clauses,
      dependsOn: null,
      expiration: 32,
      gas,
      gasPriceCoef: 128,
      nonce: new Date().getTime(),
    };
    const tx = new Transaction(body);
    const signingHash = tx.signingHash();
    tx.signature = secp256k1.sign(signingHash, privateKey);
    const raw = tx.encode();
    try {
      await web3.eth.sendSignedTransaction('0x' + raw.toString('hex'));
      return `Successfully processed ${event.Records.length} messages.`;
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.log(error);
      return `Error`;
    }
    // TODO: Wait for the next block and check to see if the transaction made it
  }
  }
};


// exports.handler = async event => {
//   for (const { messageAttributes } of event.Records) {
//     const to = messageAttributes.Address.stringValue;
//     const amount = Number(messageAttributes.Amount.stringValue);
//     try {
//       const web3 = thorify(new Web3(), 'https://sync-testnet.veblocks.net');
//       const words = JSON.parse(process.env.MNEMONIC);
//       const valid = mnemonic.validate(words);
//       if (!valid) console.log('inavalid mnemonic from .env');
//       else {
//         console.log('VALID')
//         const privateKey = mnemonic.derivePrivateKey(words);
//         const blockRef = await web3.eth.getBlockRef();
//         const chainTag = await web3.eth.getChainTag();
//         const value = new BigNumber(amount)
//           .times(1e18)
//           .toFixed(0, BigNumber.ROUND_FLOOR);
//         const clauses = [{ data: '0x', to, value }];
//         const gas = Transaction.intrinsicGas(clauses);
//         const body = {
//           blockRef,
//           chainTag,
//           clauses,
//           dependsOn: null,
//           expiration: 32,
//           gas,
//           gasPriceCoef: 128,
//           nonce: new Date().getTime(),
//         };
//         console.log('MAKING TX')
//         const tx = new Transaction(body);
//         console.log('SIGNING TX')
//         const signingHash = tx.signingHash();
//         tx.signature = secp256k1.sign(signingHash, privateKey);
//         console.log('SIGNING DONE')
//         const raw = tx.encode();
//         console.log('SENDING')
//         await web3.eth.sendSignedTransaction('0x' + raw.toString('hex'));
//         console.log('DONE')
//         return `Successfully processed ${event.Records.length} messages.`;
//       }
//     } catch (error) {
//       console.log('Transaction Error', error);
//       return `FAIL.`;
//     }
//   }
// };
