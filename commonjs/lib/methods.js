"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eth_accounts = exports.eth_sendTransaction = void 0;
const web3_1 = __importDefault(require("web3"));
const java_tron_provider_2 = require("@tofudefi/java-tron-provider");
const utils_js_1 = require("./utils.js");
// 1000 TRX
// TODO: use gasLimit instead?
const DEFAULT_FEE_LIMIT = 1000000000;
async function triggerSmartContract(params, ctx) {
    const { params: fnParams, functionAbi } = utils_js_1.decodeFunctionCall(params.data, ctx.functionSignatures);
    // console.log({ params, fnParams, functionAbi });
    const contract = tronWeb.contract([functionAbi], java_tron_provider_2.ethAddress.toTronHex(params.to));
    const callValue = web3_1.default.utils.hexToNumber(params.value);
    const txHash = await contract.methods[functionAbi.name](...fnParams).send({
        // TODO: proper feeLimit, etc.
        // TODO: why params dont show up in tronlink? maybe need to use
        // contract[functionAbi.name] instead?
        // from,
        feeLimit: DEFAULT_FEE_LIMIT,
        callValue,
    });
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
