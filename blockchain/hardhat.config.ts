import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
		version: "0.8.9",
		settings: {
			optimizer: { enabled: true, runs: 200 },
		},
	},
  networks: {
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/",
      accounts: [""],
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 1337,
      accounts: [""],
    },
		hardhat: {
			chainId: 1337,
		}
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
