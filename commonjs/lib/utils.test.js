"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const utils_js_1 = require("./utils.js");
ava_1.default("decodeFunctionCall", (t) => {
    const decoded = utils_js_1.decodeFunctionCall("0x60fe47b10000000000000000000000000000000000000000000000000000000000000539", [
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
    ]);
    t.is(decoded.functionAbi.name, "set");
    t.deepEqual(decoded.params, ["1337"]);
});
ava_1.default("decodeFunctionCall (abis with no name)", (t) => {
    const decoded = utils_js_1.decodeFunctionCall("0x60fe47b10000000000000000000000000000000000000000000000000000000000000539", [
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
    ]);
    t.is(decoded.functionAbi.name, "set");
    t.deepEqual(decoded.params, ["1337"]);
});
