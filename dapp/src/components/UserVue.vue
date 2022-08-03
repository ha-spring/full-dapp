<template>
  <div>
    <h1>Account: {{ account }}</h1>
    <h2>
      {{ balanceUSDC }} USDC | {{ balanceTKA }} TKA | {{ balanceTKB }} TKB
    </h2>
    <div v-if="isProcessing">Processing...</div>
    <div v-if="!isProcessing">
      <h2>Swap A to B</h2>
      <input type="text" v-model="amountToSwap" placeholder="0.0 TKA" />
      <button v-on:click="swap">Swap</button>
    </div>
    <div v-if="!isProcessing">
      <h2>Reedem TKA</h2>
      <input type="text" v-model="amountToRedeem" placeholder="0.0 TKA" />
      <button v-on:click="redeem">Redeem</button>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import MinimalForwarder from "../contracts/MinimalForwarder.json";
import TokenA from "../contracts/TokenA.json";
import TokenB from "../contracts/TokenB.json";
import USDC from "../contracts/USDC.json";
const { executeRequest } = require("../common/util.ts");

export default {
  name: "App",
  data() {
    return {
      account: "",
      amountToSwap: "",
      amountToRedeem: "",
      isProcessing: false,
      balanceUSDC: "",
      balanceTKA: "",
      balanceTKB: "",
    };
  },
  async created() {
    this.updateBalances();
  },
  methods: {
    async getContracts() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const minimalForwarder = new ethers.Contract(
        MinimalForwarder.address,
        MinimalForwarder.abi,
        signer
      );
      const tokenA = new ethers.Contract(TokenA.address, TokenA.abi, signer);
      const tokenB = new ethers.Contract(TokenB.address, TokenB.abi, signer);
      const usdc = new ethers.Contract(USDC.address, USDC.abi, signer);
      return { minimalForwarder, tokenA, tokenB, usdc };
    },
    async updateBalances() {
      const { tokenA, tokenB, usdc } = await this.getContracts();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      this.account = accounts[0];
      const balanceUSDC = await usdc.balanceOf(this.account);
      this.balanceUSDC = ethers.utils.formatEther(balanceUSDC, "ether");
      const balanceTKA = await tokenA.balanceOf(this.account);
      this.balanceTKA = ethers.utils.formatEther(balanceTKA, "ether");
      const balanceTKB = await tokenB.balanceOf(this.account);
      this.balanceTKB = ethers.utils.formatEther(balanceTKB, "ether");
    },
    async swap() {
      this.isProcessing = true;
      const { minimalForwarder, tokenA } = await this.getContracts();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const request = {
        from: this.account,
        to: tokenA.address,
        data: tokenA.interface.encodeFunctionData("burn", [
          ethers.utils.parseEther(this.amountToSwap).toString(),
        ]),
      };
      const data = {
        from: this.account,
        amount: this.amountToSwap,
        type: "swap",
      };
      const message = await executeRequest(
        signer,
        minimalForwarder,
        request,
        data
      );
      this.balanceTKA = ethers.utils.formatEther(message.balanceTKA, "ether");
      this.balanceTKB = ethers.utils.formatEther(message.balanceTKB, "ether");
      this.amountToSwap = "";
      this.isProcessing = false;
    },
    async redeem() {
      this.isProcessing = true;
      const { minimalForwarder, tokenA } = await this.getContracts();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const request = {
        from: this.account,
        to: tokenA.address,
        data: tokenA.interface.encodeFunctionData("burn", [
          ethers.utils.parseEther(this.amountToRedeem).toString(),
        ]),
      };
      const data = {
        from: this.account,
        amount: this.amountToRedeem,
        type: "redeem",
      };
      const message = await executeRequest(
        signer,
        minimalForwarder,
        request,
        data
      );
      this.balanceTKA = ethers.utils.formatEther(message.balanceTKA, "ether");
      this.balanceTKB = ethers.utils.formatEther(message.balanceTKB, "ether");
      this.amountToRedeem = "";
      this.isProcessing = false;
    },
  },
};
</script>

<style></style>
