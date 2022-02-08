const inquirer = require("inquirer");
const chalk = require("chalk");
const dotenv = require("dotenv");
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const { fetchNFTs } = require("../utils/Fetch/fetchAllNFTs");
const { fetchEmptyTA } = require("../utils/Fetch/fetchEmptyTokenAccounts");
const {
  createBurnAndCloseTransaction,
  createCloseTransaction,
  createBurnTransaction,
} = require("../utils/Transactions/createTransactions");
dotenv.config();
const log = console.log;
if (process.env.RPC_ENDPOINT !== "https://api.devnet.solana.com") {
  log(
    chalk.red("You are not on devnet, please select EXIT to cancel the process")
  );
}

const connection = new Connection(process.env.RPC_ENDPOINT);
secretKey = Buffer.from(JSON.parse(process.env.SECRET_KEY));
const MyAccount = Keypair.fromSecretKey(secretKey);
var TokenAccountData;

const iterate = async (TokenAccountData, choice) => {
  inquirer
    .prompt([
      {
        type: "confirm",
        message:
          "Are you sure you want to continue, you cant revert after this step!",
        name: "command",
      },
    ])
    .then(async (answers) => {
      if (answers.command) {
        log(chalk.green("Burn Started"));

        for (const t of TokenAccountData) {
          log("\n");
          log(chalk.blue("Token Account: ", t.pubkey.toBase58()));
          log(
            chalk.blue(
              "Assosiated Mint Address: ",
              t.account.data.parsed.info.mint
            )
          );

          switch (choice) {
            case 1:
              transaction = await createBurnAndCloseTransaction(
                t.account.data.parsed.info.mint,
                t.pubkey,
                MyAccount,
                connection
              );
              break;
            case 2:
              transaction = await createCloseTransaction(
                t.pubkey,
                MyAccount,
                connection
              );
              break;

            default:
              break;
          }
          try {
            var stx = await connection.sendTransaction(
              transaction,
              [MyAccount],
              {
                preflightCommitment: "confirmed",
                skipPreflight: false,
              }
            );
            await connection.confirmTransaction(stx, "confirmed");
            log(chalk.yellow("Transaction was confirmed!"));
          } catch (err) {
            log(chalk.red(err.message));
          }
          log("\n");
        }
        log(chalk.green("Burn completed successfully!"));
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const getPrompt = () => {
  log(
    chalk.green(
      `Process started for wallet address ${MyAccount.publicKey.toBase58()} \n`
    )
  );
  inquirer
    .prompt([
      {
        type: "list",
        message: "Pick the process",
        name: "command",
        choices: [
          "Burn All NFTs",
          "Close 0 amount ATA",
          "Burn specific Mint token",
          "Exit",
        ],
      },
    ])
    .then(async (answers) => {
      if (answers.command === "Burn All NFTs") {
        TokenAccountData = await fetchNFTs(MyAccount, connection);
        if (TokenAccountData.length !== 0) {
          await iterate(TokenAccountData, 1);
        } else {
          log(chalk.red("No NFTs to burn"));
        }
      } else if (answers.command === "Close 0 amount ATA") {
        TokenAccountData = await fetchEmptyTA(MyAccount, connection);
        if (TokenAccountData.length !== 0) {
          await iterate(TokenAccountData, 2);
        } else {
          log(chalk.red("No ATA to close"));
        }
      } else if (answers.command === "Burn specific Mint token") {
        inquirer
          .prompt([
            {
              type: "input",
              message: "Enter mint Address:",
              name: "mint",
            },
          ])
          .then(async (answers) => {
            const ATA = await connection.getParsedTokenAccountsByOwner(
              MyAccount.publicKey,
              {
                mint: new PublicKey(answers.mint),
              }
            );
            burnTransaction = await createBurnTransaction(
              answers.mint,
              ATA.value[0].pubkey,
              MyAccount,
              connection,
              ATA.value[0].account.data.parsed.info.tokenAmount.amount
            );
            try {
              var stx = await connection.sendTransaction(
                burnTransaction,
                [MyAccount],
                {
                  preflightCommitment: "confirmed",
                  skipPreflight: false,
                }
              );
              await connection.confirmTransaction(stx, "confirmed");
              log(chalk.yellow("Transaction was confirmed!"));
            } catch (err) {
              log(chalk.red(err.message));
            }
          });
      } else if (answers.command === "Exit") {
        log(chalk.blue("You saved your mainnet wallet!!"));
      }
    });
};

getPrompt();
