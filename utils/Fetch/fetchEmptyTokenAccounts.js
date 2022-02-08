const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");

const fetchEmptyTA = async (MyAccount, connection) => {
  try {
    const AllTokenAccountsByOwner =
      await connection.getParsedTokenAccountsByOwner(MyAccount.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });
    const AllNFTsData = AllTokenAccountsByOwner.value.filter(
      (t) => parseInt(t.account.data.parsed.info.tokenAmount.amount) === 0
    );

    return AllNFTsData;
  } catch (err) {
    console.log("Error fetching the Token Accounts");
  }
};

module.exports = {
  fetchEmptyTA,
};
