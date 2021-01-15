import * as dotenv from 'dotenv';
import { BigNumber } from 'bignumber.js';
import { mnemonic, secp256k1, Transaction } from 'thor-devkit';
import { thorify } from 'thorify';

dotenv.config();
// listner for SQS

// TODO: Make a test / main toggle
const createTransaction = async (to: string, amount: number) => {
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
    const body: Transaction.Body = {
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
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.log(error);
    }
    // TODO: Wait for the next block and check to see if the transaction made it
  }
};

createTransaction('0x224474d7af5a80708A36DaE803CB4477177A95DE', 1);
