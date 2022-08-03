const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("defender-relay-client/lib/ethers");
const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const credentials = {
	apiKey: process.env.API_KEY,
	apiSecret: process.env.API_SECRET
};
const provider = new DefenderRelayProvider(credentials);
const relayer = new DefenderRelaySigner(
	credentials,
	provider,
	{ speed: 'fast' }
);

const MinimalForwarder = require("./contracts/MinimalForwarder.json");
const TokenA = require("./contracts/TokenA.json");
const TokenB = require("./contracts/TokenB.json");

//const provider = new ethers.providers.JsonRpcProvider();
//const relayer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const minimalForwarder = new ethers.Contract(
  MinimalForwarder.address,
  MinimalForwarder.abi,
  provider
);
const tokenA = new ethers.Contract(TokenA.address, TokenA.abi, provider);
const tokenB = new ethers.Contract(TokenB.address, TokenB.abi, provider);

const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(express.static("dist"));

app.post("/owner/execute", async (req, res) => {
  const { id } = req.body;
  const requests = fs.readFileSync("requests.json");
  let requestsJson = JSON.parse(requests);
  requestsJson = requestsJson.filter((item) => item.id != id);
  fs.writeFileSync("requests.json", JSON.stringify(requestsJson));
  res.json({ requests: requestsJson });
});

app.get("/requests", async (req, res) => {
  const data = req.body.data;
  const request = req.body.request;
  const signature = req.body.signature;
  const requests = fs.readFileSync("requests.json");
  const requestsJson = JSON.parse(requests);
  res.json({
    requests: requestsJson,
  });
});

app.post("/execute", async (req, res) => {
  const data = req.body.data;
  const request = req.body.request;
  const signature = req.body.signature;
  try {
    const tx = await minimalForwarder
      .connect(relayer)
      .execute(request, signature);
    const result = await tx.wait();
    const txStatus = result.status;
    if (txStatus === 1) {
      const requests = fs.readFileSync("requests.json");
      const requestsJson = JSON.parse(requests);
      const id = uuidv4();
      requestsJson.push({
        ...data,
        id,
      });
      fs.writeFileSync("requests.json", JSON.stringify(requestsJson));
    }
    const balanceTKA = await tokenA.balanceOf(request.from);
    const balanceTKB = await tokenB.balanceOf(request.from);
    res.json({
      status: "success",
      balanceTKA: balanceTKA.toString(),
      balanceTKB: balanceTKB.toString(),
    });
  } catch (error) {
    res.json({ status: "error" });
    console.log("Error:", error);
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
