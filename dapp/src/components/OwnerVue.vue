<template>
  <div>
    <h1>Owner Vue</h1>
    <div v-if="isProcessing">Processing...</div>
    <div v-if="!isProcessing">
      <h2>Transfer USDC</h2>
      <input type="text" v-model="to" placeholder="0x000..." />
      <input type="text" v-model="amountToTransfer" placeholder="0.0 USDC" />
      <button v-on:click="transferUSDC">Transfer</button>
    </div>
    <div v-if="!isProcessing">
      <h2>Mint USDC</h2>
      <input type="text" v-model="toMintUSDC" placeholder="0x000..." />
      <input type="text" v-model="amountToMintUSDC" placeholder="0.0 USDC" />
      <button v-on:click="mintUSDC">Mint USDC</button>
    </div>
    <div v-if="!isProcessing">
      <h2>Mint Token A</h2>
      <input type="text" v-model="toMintA" placeholder="0x000..." />
      <input type="text" v-model="amountToMintA" placeholder="0.0 TKA" />
      <button v-on:click="mintA">Mint TKA</button>
    </div>
    <div v-if="!isProcessing">
      <h2>Mint Token B</h2>
      <input type="text" v-model="toMintB" placeholder="0x000..." />
      <input type="text" v-model="amountToMintB" placeholder="0.0 TKB" />
      <button v-on:click="mintB">Mint TKB</button>
    </div>
    <div v-if="requests.length > 0 && !isProcessing">
      <h2>Pending requests</h2>
      <table>
        <tr>
          <th>Type</th>
          <th>From</th>
          <th>Amount</th>
          <th>Actions</th>
        </tr>
        <tr v-for="(request, index) in requests" :key="index">
          <td>{{ request.type }}</td>
          <td>{{ request.from }}</td>
          <td>{{ request.amount }}</td>
          <td><button v-on:click="execute(request)">execute</button></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import TokenA from "../contracts/TokenA.json";
import TokenB from "../contracts/TokenB.json";
import USDC from "../contracts/USDC.json";
import Wallet from "../contracts/Wallet.json";

export default {
  name: "App",
  data() {
    return {
      account: "",
      to: "",
      amountToTransfer: "",
      toMintA: "",
      amountToMintA: "",
      toMintB: "",
      amountToMintB: "",
      toMintUSDC: "",
      amountToMintUSDC: "",
      isProcessing: false,
      requests: [],
    };
  },
  async mounted() {
    const res = await fetch("/requests");
    const data = await res.json();
    this.requests = data.requests;
  },
  methods: {
    async execute(request) {
      this.isProcessing = true;
      if (request.type === "redeem") {
        const { wallet } = await this.getContracts();
        const amount = ethers.utils.parseEther(request.amount) * 2; // rate
        const tx = await wallet.transfer(request.from, amount.toString());
        const res = await tx.wait();
        if (res.status == 1) {
          const res = await fetch("/owner/execute", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...request }),
          });
          const message = await res.json();
          this.requests = message.requests;
        }
      }
      if (request.type === "swap") {
        const { tokenB } = await this.getContracts();
        const amount = ethers.utils.parseEther(request.amount) * 2; // rate
        const tx = await tokenB.mint(request.from, amount.toString());
        const res = await tx.wait();
        if (res.status == 1) {
          const res = await fetch("/owner/execute", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...request }),
          });
          const message = await res.json();
          this.requests = message.requests;
        }
      }
      this.isProcessing = false;
    },
    async getContracts() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenA = new ethers.Contract(TokenA.address, TokenA.abi, signer);
      const tokenB = new ethers.Contract(TokenB.address, TokenB.abi, signer);
      const usdc = new ethers.Contract(USDC.address, USDC.abi, signer);
      const wallet = new ethers.Contract(Wallet.address, Wallet.abi, signer);
      return { tokenA, tokenB, wallet, usdc };
    },
    async transferUSDC() {
      this.isProcessing = true;
      const { wallet } = await this.getContracts();
      const tx = await wallet.transfer(
        this.to,
        ethers.utils.parseEther(this.amountToTransfer).toString()
      );
      await tx.wait();
      this.to = "";
      this.amountToTransfer = "";
      this.isProcessing = false;
    },
    async mintUSDC() {
      this.isProcessing = true;
      const { usdc } = await this.getContracts();
      const tx = await usdc.mint(
        this.toMintUSDC,
        ethers.utils.parseEther(this.amountToMintUSDC).toString()
      );
      await tx.wait();
      this.toMintUSDC = "";
      this.amountToMintUSDC = "";
      this.isProcessing = false;
    },
    async mintA() {
      this.isProcessing = true;
      const { tokenA } = await this.getContracts();
      const tx = await tokenA.mint(
        this.toMintA,
        ethers.utils.parseEther(this.amountToMintA).toString()
      );
      await tx.wait();
      this.toMintA = "";
      this.amountToMintA = "";
      this.isProcessing = false;
    },
    async mintB() {
      this.isProcessing = true;
      const { tokenB } = await this.getContracts();
      const tx = await tokenB.mint(
        this.toMintB,
        ethers.utils.parseEther(this.amountToMintB).toString()
      );
      await tx.wait();
      this.toMintB = "";
      this.amountToMintB = "";
      this.isProcessing = false;
    },
  },
};
</script>

<style>
th,
td {
  padding: 6px 30px 6px 0px;
  text-align: left;
}
</style>
