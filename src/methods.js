import Web3 from "web3";
import { ethAddress } from "@tofudefi/java-tron-provider";
import { decodeFunctionCall } from "./utils.js";

// 1000 TRX
// TODO: use gasLimit instead?
const DEFAULT_FEE_LIMIT = 1_000_000_000;

async function triggerSmartContract(params, ctx) {
  const { params: fnParams, functionAbi } = decodeFunctionCall(
    params.data,
    ctx.functionSignatures
  );
  // console.log({ params, fnParams, functionAbi });
  const contract = tronWeb.contract(
    [functionAbi],
    ethAddress.toTronHex(params.to)
  );

  const callValue = Web3.utils.hexToNumber(params.value);
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
  const amount = Web3.utils.hexToNumber(params.value);
  const to = ethAddress.toTron(params.to);
  const res = await ctx.tronweb.trx.sendTransaction(to, amount);
  return `0x${res.txid}`;
}

export async function eth_sendTransaction([params], ctx) {
  if (params.data) {
    return triggerSmartContract(params, ctx);
  }
  // TODO: simple transfer...
  return simpleTransfer(params, ctx);
}

export function eth_accounts(_params, ctx) {
  const tronweb = ctx.tronweb;
  const defaultAddress = ethAddress.fromTronHex(tronweb.defaultAddress.hex);
  return [defaultAddress];
}

// TODO: eth_chainId .. should return chain selected in tronlink, not the one
// from createTronLinkProvider({ network })...
