<template>
  <div>
    <div v-if="!account">Connecting wallet...</div>
    <div v-if="account">
      <OwnerVue v-if="isOwner" />
      <UserVue v-if="!isOwner" />
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import Wallet from "./contracts/Wallet.json";
import OwnerVue from "./components/OwnerVue";
import UserVue from "./components/UserVue";

export default {
  name: "App",
  components: {
    OwnerVue,
    UserVue,
  },
  data() {
    return {
      account: "",
      isOwner: false,
    };
  },
  async created() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const wallet = new ethers.Contract(Wallet.address, Wallet.abi, signer);
    const owner = await wallet.owner();
    this.account = accounts[0];
    this.isOwner = owner.toLowerCase() == accounts[0].toLowerCase();
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
  margin-left: 60px;
}
h1 {
  font-size: 24px;
}
h2 {
  font-size: 20px;
}
* {
  font-size: 18px;
}
button,
input {
  margin: 2px 8px 8px 0px;
  padding: 10px 20px;
}
div {
  overflow-wrap: break-word;
}
</style>
