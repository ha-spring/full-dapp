import { ethers } from "hardhat";
var fs = require("fs");

async function main() {
  // acconuts[4] is the relayer in localhost

	const accounts = await ethers.getSigners();

  const USDC = await ethers.getContractFactory("USDC");
  const usdc = await USDC.deploy();

  const Wallet = await ethers.getContractFactory("Wallet");
  const wallet = await Wallet.deploy(usdc.address);
	await usdc.mint(wallet.address, (10e18).toString())
	await usdc.mint(wallet.address, (10e18).toString())
	await usdc.mint(wallet.address, (10e18).toString())
	await usdc.mint(wallet.address, (10e18).toString())
	await usdc.mint(wallet.address, (10e18).toString())
	await usdc.mint(wallet.address, (10e18).toString())

  const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
  const minimalForwarder = await MinimalForwarder.deploy();

  const TokenA = await ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy(minimalForwarder.address);
	const minterRole = await tokenA.MINTER_ROLE();
	await tokenA.grantRole(minterRole, '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65');

  const TokenB = await ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy(minimalForwarder.address);
	await tokenB.grantRole(minterRole, '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65');

	console.log("TokenA deployed to:", tokenA.address);
  console.log("TokenB deployed to:", tokenB.address);
  console.log("Wallet deployed to:", wallet.address);
  console.log("MinimalForwarder deployed to:", minimalForwarder.address);
  console.log("USDC deployed to:", usdc.address);

  // DAPP
  let forwarderContent = fs.readFileSync(
    "artifacts/@openzeppelin/contracts/metatx/MinimalForwarder.sol/MinimalForwarder.json"
  );
  let forwarderJson = JSON.parse(forwarderContent);
  forwarderJson.address = minimalForwarder.address;
  fs.writeFileSync(
    "../dapp/src/contracts/MinimalForwarder.json",
    JSON.stringify(forwarderJson)
  );

  let usdcContent = fs.readFileSync("artifacts/contracts/USDC.sol/USDC.json");
  let usdcJson = JSON.parse(usdcContent);
  usdcJson.address = usdc.address;
  fs.writeFileSync("../dapp/src/contracts/USDC.json", JSON.stringify(usdcJson));

  let tokenAContent = fs.readFileSync(
    "artifacts/contracts/TokenA.sol/TokenA.json"
  );
  let tokenAJson = JSON.parse(tokenAContent);
  tokenAJson.address = tokenA.address;
  fs.writeFileSync(
    "../dapp/src/contracts/TokenA.json",
    JSON.stringify(tokenAJson)
  );

  let tokenBContent = fs.readFileSync(
    "artifacts/contracts/TokenB.sol/TokenB.json"
  );
  let tokenBJson = JSON.parse(tokenBContent);
  tokenBJson.address = tokenB.address;
  fs.writeFileSync(
    "../dapp/src/contracts/TokenB.json",
    JSON.stringify(tokenBJson)
  );

  let walletContent = fs.readFileSync(
    "artifacts/contracts/Wallet.sol/Wallet.json"
  );
  let walletJson = JSON.parse(walletContent);
  walletJson.address = wallet.address;
  fs.writeFileSync(
    "../dapp/src/contracts/Wallet.json",
    JSON.stringify(walletJson)
  );

  // API
  fs.writeFileSync(
    "../api/contracts/MinimalForwarder.json",
    JSON.stringify(forwarderJson)
  );
  fs.writeFileSync("../api/contracts/USDC.json", JSON.stringify(usdcJson));
  fs.writeFileSync(
    "../api/contracts/TokenA.json",
    JSON.stringify(tokenAJson)
  );
  fs.writeFileSync(
    "../api/contracts/TokenB.json",
    JSON.stringify(tokenBJson)
  );
  fs.writeFileSync(
    "../api/contracts/Wallet.json",
    JSON.stringify(walletJson)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
