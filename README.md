# @tofudefi/java-tron-provider

Like [@tofudefi/java-tron-provider](../java-tron-provider) but uses the
[TronLink extension](https://chrome.google.com/webstore/detail/tronlink%EF%BC%88%E6%B3%A2%E5%AE%9D%E9%92%B1%E5%8C%85%EF%BC%89/ibnejdfjmmkpcnlpebklmnkoeoihofec) for signing transactions.

See [tronlink-provider-demo](../tronlink-provider-demo) for a demo.

## Install

```sh
npm install @tofudefi/tronlink-provider
```

## Usage

The `functionSignatures` array must contain all mutable function that
will potentially be called. Otherwise, you could get an "cannot find
function name mapping for signature" error.

```javascript
const abi = [
  {
    constant: true,
    inputs: [],
    name: "get",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ internalType: "uint256", name: "_value", type: "uint256" }],
    name: "set",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];
const provider = createTronLinkProvider({
  network: "nile",
  functionSignatures: abi,
});
const web3 = new Web3(provider);
```

## TODO

- `eth_requestAccounts`
