import test from "ava";
import { decodeFunctionCall } from "./utils.js";

test("decodeFunctionCall", (t) => {
  const decoded = decodeFunctionCall(
    "0x60fe47b10000000000000000000000000000000000000000000000000000000000000539",
    [
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
    ]
  );
  t.is(decoded.functionAbi.name, "set");
  t.deepEqual(decoded.params, ["1337"]);
});

test("decodeFunctionCall (abis with no name)", (t) => {
  const decoded = decodeFunctionCall(
    "0x60fe47b10000000000000000000000000000000000000000000000000000000000000539",
    [
      { payable: true, stateMutability: "payable", type: "fallback" },
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
    ]
  );
  t.is(decoded.functionAbi.name, "set");
  t.deepEqual(decoded.params, ["1337"]);
});
