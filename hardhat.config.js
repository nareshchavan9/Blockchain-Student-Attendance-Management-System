require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19", // Make sure this matches your contract's pragma
  networks: {
    hardhat: { // This is the default network when you run `npx hardhat node`
      chainId: 31337 // Default chain ID for Hardhat Network
    },
    localhost: { // You can explicitly define localhost if you want
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  }
};
