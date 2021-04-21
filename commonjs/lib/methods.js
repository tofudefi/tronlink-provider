"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eth_accounts = exports.eth_sendTransaction = void 0;
const web3_1 = __importDefault(require("web3"));
const java_tron_provider_2 = require("@tofudefi/java-tron-provider");
const utils_js_1 = require("./utils.js");
// ensures abi is tronweb compatible (new tronweb assumes abi contains
// stateMutability prop but ABIs generated with older solc lack that prop)
function normalizeAbi(abi) {
    // https://solidity.readthedocs.io/en/v0.5.10/abi-spec.html#json
    let stateMutability = abi.stateMutability;
    if (!abi.stateMutability) {
        if (abi.constant) {
            stateMutability = "view";
        }
        else {
            if (abi.payable) {
                stateMutability = "payable";
            }
            else {
                stateMutability = "nonpayable";
            }
        }
    }
    return {
        stateMutability,
        ...abi,
    };
}
async function triggerSmartContract(params, ctx) {
    const { params: fnParams, functionAbi } = utils_js_1.decodeFunctionCall(params.data, ctx.functionSignatures);
    const contract = tronWeb.contract([normalizeAbi(functionAbi)], java_tron_provider_2.ethAddress.toTronHex(params.to));
    const callValue = web3_1.default.utils.hexToNumber(params.value);
    const sendParams = {
        callValue,
        ...(params.gas
            ? { feeLimit: web3_1.default.utils.hexToNumberString(params.gas) }
            : {}),
    };
    console.log({ web3params: params, tronLinkParams: sendParams });
    const txHash = await contract.methods[functionAbi.name](...fnParams).send(sendParams);
    return `0x${txHash}`;
}
async function simpleTransfer(params, ctx) {
    const amount = web3_1.default.utils.hexToNumber(params.value);
    const to = java_tron_provider_2.ethAddress.toTron(params.to);
    const res = await ctx.tronweb.trx.sendTransaction(to, amount);
    return `0x${res.txid}`;
}
async function eth_sendTransaction([params], ctx) {
    if (params.data) {
        return triggerSmartContract(params, ctx);
    }
    // TODO: simple transfer...
    return simpleTransfer(params, ctx);
}
exports.eth_sendTransaction = eth_sendTransaction;
function eth_accounts(_params, ctx) {
    const tronweb = ctx.tronweb;
    const defaultAddress = java_tron_provider_2.ethAddress.fromTronHex(tronweb.defaultAddress.hex);
    return [defaultAddress];
}
exports.eth_accounts = eth_accounts;
// TODO: eth_chainId .. should return chain selected in tronlink, not the one
// from createTronLinkProvider({ network })...
