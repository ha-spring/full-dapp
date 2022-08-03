import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

const signAndRun = async (
		minimalForwarder: any, from: any, to: any, data: any, accounts: any
	) => {	
    const chainId = await minimalForwarder.provider
      .getNetwork()
      .then((n: any) => n.chainId);

    const domain = {
      name: "MinimalForwarder",
      version: "0.0.1",
      chainId,
      verifyingContract: minimalForwarder.address,
    };

    const types = {
      ForwardRequest: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "gas", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "data", type: "bytes" },
      ],
    };
		
		const nonce = await minimalForwarder
      .getNonce(from)
      .then((nonce: any) => nonce.toString());

    const value = {
      from,
      to,
      value: 0,
      gas: 1e6,
			nonce,
      data,
    };

    let signature = await accounts[1]._signTypedData(
      domain,
      types,
      value
    );

    await minimalForwarder
      .connect(accounts[2])
      .execute(value, signature);

}

describe("Swap", function () {
  let tokenA: Contract;
  let tokenB: Contract;
  let swapAB: Contract;
  let minimalForwarder: Contract;
  let accounts: any[];

  beforeEach(async () => {
    const MinimalForwarder = await ethers.getContractFactory(
      "MinimalForwarder"
    );
    minimalForwarder = await MinimalForwarder.deploy();

    const TokenA = await ethers.getContractFactory("TokenA");
    tokenA = await TokenA.deploy(minimalForwarder.address);

    const TokenB = await ethers.getContractFactory("TokenB");
    tokenB = await TokenB.deploy(minimalForwarder.address);

    const SwapAB = await ethers.getContractFactory("SwapAB");
    swapAB = await SwapAB.deploy(
      minimalForwarder.address,
      tokenA.address,
      tokenB.address,
      2
    );

    accounts = await ethers.getSigners();
  });

  it("Should swap 10 TKA to 5 TKB", async () => {
    const to = await accounts[1].getAddress();
    await tokenA.mint(to, 10);
    await tokenB.mint(swapAB.address, 5);
    await tokenA.connect(accounts[1]).approve(swapAB.address, 10);
    await swapAB.connect(accounts[1]).swapAtoB(10);
    expect(await tokenA.balanceOf(swapAB.address)).to.equal(10);
    expect(await tokenA.balanceOf(to)).to.equal(0);
    expect(await tokenB.balanceOf(swapAB.address)).to.equal(0);
    expect(await tokenB.balanceOf(to)).to.equal(5);
  });

  it("Should swap 20 TKB to 40 TKA", async () => {
    const to = await accounts[1].getAddress();
    await tokenB.mint(to, 20);
    await tokenA.mint(swapAB.address, 40);
    await tokenB.connect(accounts[1]).approve(swapAB.address, 20);
    await swapAB.connect(accounts[1]).swapBtoA(20);
    expect(await tokenA.balanceOf(swapAB.address)).to.equal(0);
    expect(await tokenA.balanceOf(to)).to.equal(40);
    expect(await tokenB.balanceOf(swapAB.address)).to.equal(20);
    expect(await tokenB.balanceOf(to)).to.equal(0);
  });

	it("should swap using forwarder", async () => {
    
		const accounts = await ethers.getSigners();
    const fromAccount = accounts[1];
    const fromAddress = await fromAccount.getAddress();

    const owner = await accounts[0].getAddress();

    await tokenA.mint(fromAddress, 40)
    await tokenB.mint(swapAB.address, 1000);
		
		await signAndRun(
			minimalForwarder, 
			await accounts[1].getAddress(), 
			tokenA.address, 
			tokenA.interface.encodeFunctionData("approve", [swapAB.address, 20]),
			accounts
		)
		
		await signAndRun(
			minimalForwarder, 
			await accounts[1].getAddress(), 
			swapAB.address, 
			swapAB.interface.encodeFunctionData("swapAtoB", [20]),
			accounts
		)
    
		expect(await tokenA.balanceOf(fromAddress)).to.equal(20);
    expect(await tokenB.balanceOf(fromAddress)).to.equal(10);
  });
});
