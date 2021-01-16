import * as dotenv from 'dotenv';
import { BigNumber } from 'bignumber.js';
import { mnemonic, secp256k1, Transaction } from 'thor-devkit';
import { thorify } from 'thorify';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';

dotenv.config();

const QueueUrl = process.env.SQS_QUEUE_URL;
const params = {
  AttributeNames: ['SentTimestamp'],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: ['All'],
  QueueUrl,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0,
};

const sqs = new SQSClient({ region: process.env.SQS_REGION });



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


const run = async () => {
  try {
    const data = await sqs.send(new ReceiveMessageCommand(params));
    if (data.Messages) {
      for (const val of data.Messages) {
        const address = val.MessageAttributes.Address.StringValue;
        const amount = Number(val.MessageAttributes.Amount.StringValue);
        console.log(address);
        console.log(amount);
        createTransaction(address, amount);
        const deleteParams = {
          QueueUrl,
          ReceiptHandle: val.ReceiptHandle,
        };
        try {
          await sqs.send(new DeleteMessageCommand(deleteParams));
        } catch (err) {
          // tslint:disable-next-line: no-console
          console.log('Message Deleted', data);
        }
      }
    } else {
      // tslint:disable-next-line: no-console
      console.log('No messages to delete');
    }
  } catch (error) {
    // tslint:disable-next-line: no-console
    console.log('Receive Error', error);
  }
};
run();

// createTransaction('0x224474d7af5a80708A36DaE803CB4477177A95DE', 1);