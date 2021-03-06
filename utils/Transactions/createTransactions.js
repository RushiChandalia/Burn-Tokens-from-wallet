const { Transaction, PublicKey } = require("@solana/web3.js");
const { Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");

const createBurnAndCloseTransaction = async (
  mint,
  pubKey,
  MyAccount,
  connection
) => {
  const transaction = new Transaction();

  const BurnInstruction = Token.createBurnInstruction(
    TOKEN_PROGRAM_ID,
    new PublicKey(mint),
    pubKey,
    MyAccount.publicKey,
    [],
    1
  );
  const closeAccountInstruction = Token.createCloseAccountInstruction(
    TOKEN_PROGRAM_ID,
    pubKey,
    MyAccount.publicKey,
    MyAccount.publicKey,
    []
  );
  transaction.add(BurnInstruction, closeAccountInstruction);
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;
  transaction.feePayer = MyAccount.publicKey;

  return transaction;
};

const createBurnTransaction = async(mint, pubKey, MyAccount, connection, amount) => {
  const transaction = new Transaction();

  const BurnInstruction = Token.createBurnInstruction(
    TOKEN_PROGRAM_ID,
    new PublicKey(mint),
    pubKey,
    MyAccount.publicKey,
    [],
    amount
  );
  transaction.add(BurnInstruction);
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;
  transaction.feePayer = MyAccount.publicKey;

  return transaction;
};

const createCloseTransaction = async (pubKey, MyAccount, connection) => {
  const transaction = new Transaction();

  const closeAccountInstruction = Token.createCloseAccountInstruction(
    TOKEN_PROGRAM_ID,
    pubKey,
    MyAccount.publicKey,
    MyAccount.publicKey,
    []
  );
  transaction.add(closeAccountInstruction);
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;
  transaction.feePayer = MyAccount.publicKey;

  return transaction;
};

module.exports = {
  createBurnAndCloseTransaction,
  createCloseTransaction,
  createBurnTransaction
};
