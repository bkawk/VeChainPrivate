import { BigNumber } from 'bignumber.js';
import { secp256k1, Transaction } from 'thor-devkit';

// listner for SQS

// Create transaction
const createTransaction = (to: string, value: number) => {
    const clauses =  [{data: '0x', to, value}];
    const gas = Transaction.intrinsicGas(clauses);
    const body: Transaction.Body = {
        blockRef: '0x0000000000000000',
        chainTag: 0x9a,
        clauses,
        dependsOn: null,
        expiration: 32,
        gas: 21000,
        gasPriceCoef: 128,
        nonce: 12345678,
    };
    const tx = new Transaction(body);
    const signingHash = tx.signingHash();
    tx.signature = secp256k1.sign(signingHash, process.env.PRIVATEKEY); // TODO: convert to pkeyto buffer
    const raw = tx.encode();
};

// broadcast transaction
