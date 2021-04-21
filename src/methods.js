import Web3 from "web3";
import { ethAddress } from "@tofudefi/java-tron-provider";
import { decodeFunctionCall } from "./utils.js";

// ensures abi is tronweb compatible (new tronweb assumes abi contains
// stateMutability prop but ABIs generated with older solc lack that prop)
function normalizeAbi(abi) {
  // https://solidity.readthedocs.io/en/v0.5.10/abi-spec.html#json
  let stateMutability = abi.stateMutability;
  if (!abi.stateMutability) {
    if (abi.constant) {
      stateMutability = "view";
    } else {
      if (abi.payable) {
        stateMutability = "payable";
      } else {
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
  const { params: fnParams, functionAbi } = decodeFunctionCall(
    params.data,
    ctx.functionSignatures
  );
  // console.log({ params, fnParams, functionAbi });
  const contract = tronWeb.contract(
    [normalizeAbi(functionAbi)],
    ethAddress.toTronHex(params.to)
  );

  const callValue = Web3.utils.hexToNumber(params.value);

  const sendParams = {
    callValue,
    ...(params.gas
      ? { feeLimit: Web3.utils.hexToNumberString(params.gas) }
      : {}),
  };
  console.log({ web3params: params, tronLinkParams: sendParams });

  const txHash = await contract.methods[functionAbi.name](...fnParams).send(
    sendParams
  );
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
