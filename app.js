const dotenv = require("dotenv");
const { Connection, Keypair } = require("@solana/web3.js");
const { fetchNFTs } = require("./utils/fetchAllNFTs");
const { createTransaction } = require("./utils/createTransaction");
dotenv.config();
const connection = new Connection(process.env.RPC_ENDPOINT);

secretKey = Buffer.from(JSON.parse(process.env.SECRET_KEY));
const MyAccount = Keypair.fromSecretKey(secretKey);

const BurnMyNfts = async () => {
  var AllNFTsData = await fetchNFTs(MyAccount, connection);
  console.log("Number of NFTs to be Burned: ", AllNFTsData.length);
  for (const t of AllNFTsData) {
    console.log("Token Account: ", t.pubkey.toBase58());
    console.log("Assosiated Mint Address: ", t.account.data.parsed.info.mint);

    transaction = await createTransaction(
      t.account.data.parsed.info.mint,
      t.pubkey,
      MyAccount,
      connection
    );
    try {
      var stx = await connection.sendTransaction(transaction, [MyAccount], {
        preflightCommitment: "confirmed",
        skipPreflight: false,
      });
      await connection.confirmTransaction(stx, "confirmed");
      console.log("NFT burnt and Token Account closed successfully!!");
    } catch (err) {
      console.log(err.message);
    }
  }
};

BurnMyNfts();
