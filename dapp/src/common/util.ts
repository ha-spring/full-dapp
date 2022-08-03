const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

const ForwardRequest = [
  { name: "from", type: "address" },
  { name: "to", type: "address" },
  { name: "value", type: "uint256" },
  { name: "gas", type: "uint256" },
  { name: "nonce", type: "uint256" },
  { name: "data", type: "bytes" },
];

const executeRequest = async (signer, minimalForwarder, request, data) => {
  const chainId = await minimalForwarder.provider
    .getNetwork()
    .then((n) => n.chainId);

  const nonce = await minimalForwarder
    .getNonce(request.from)
    .then((nonce) => nonce.toString());

  const requestToSend = {
    from: request.from,
    to: request.to,
    value: 0,
    gas: 1e6,
    nonce,
    data: request.data,
  };

  const dataToSend = {
    types: {
      EIP712Domain,
      ForwardRequest,
    },
    domain: {
      name: "MinimalForwarder",
      version: "0.0.1",
      chainId,
      verifyingContract: minimalForwarder.address,
    },
    primaryType: "ForwardRequest",
    message: requestToSend,
  };

  const signature = await signer.provider.send("eth_signTypedData_v4", [
    request.from,
    JSON.stringify(dataToSend),
  ]);

  const res = await fetch("/execute", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      request: requestToSend,
      signature,
      data,
    }),
  });

  const message = await res.json();

  return message;
};

module.exports = {
  executeRequest,
};
