import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

describe("Wallet", function () {
  let token: Contract;
  let wallet: Contract;
  let accounts: Signer[];

  beforeEach(async () => {
    const MinimalForwarder = await ethers.getContractFactory(
      "MinimalForwarder"
    );
    const minimalForwarder = await MinimalForwarder.deploy();

    const Token = await ethers.getContractFactory("TokenA");
    token = await Token.deploy(minimalForwarder.address);

    const Wallet = await ethers.getContractFactory("Wallet");
    wallet = await Wallet.deploy(token.address);

    accounts = await ethers.getSigners();
  });

  it("Should transfer tokens", async () => {
    await token.mint(wallet.address, 10);
    const to = await accounts[1].getAddress();
    await wallet.transfer(to, 2);
    expect(await token.balanceOf(wallet.address)).to.equal(8);
    expect(await token.balanceOf(to)).to.equal(2);
  });

  it("Should transfer tokens to 2 accounts", async () => {
    await token.mint(wallet.address, 10);
    const to1 = await accounts[1].getAddress();
    const to2 = await accounts[2].getAddress();
    await wallet.bulkTransfer([to1, to2], [2, 3]);
    expect(await token.balanceOf(wallet.address)).to.equal(5);
    expect(await token.balanceOf(to1)).to.equal(2);
    expect(await token.balanceOf(to2)).to.equal(3);
  });
});
