Idea:
https://docs.metamask.io/guide/registering-function-names.html#registering-your-contract-s-method-names

Problem: tronlink requires the name and params of the contract method to
call but web3 provider is only passed the encoded hex `data`.

Possible solutions:

1. pre-register all method names that will be potentially used (e.g. can
   later be used to map hash to function name)

PRO: always works
CON: tedious... need to enumerate all function names

```
const provider = createTronLinkProvider({
  functionNames: ["set", "get"]
})
```

2. query on-chain abi

PRO: convenient for developer
CON: will not always work (e.g. some contracts don't have an ABI or incorrect one)

3. query on-chain contract

See:
https://docs.metamask.io/guide/registering-function-names.html#registering-your-contract-s-method-names

PRO: convenient for developer
CON: a bit like solution 1 but would have to be done only once. It would however cost some TRX.

---

Use tronlink extension to detect which network to use! (e.g. request block 0 using window.tronweb and map to a known network)
