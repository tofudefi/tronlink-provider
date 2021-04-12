// TODO
import {
  providerFromEngine,
  createJavaTronMiddleware,
} from "@tofudefi/java-tron-provider";

import JsonRpcEngine from "json-rpc-engine";
import createAsyncMiddleware from "json-rpc-engine/src/createAsyncMiddleware.js";
import ethRpcErrors from "eth-rpc-errors";

import * as methods from "./methods.js";

async function pause(timeoutMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeoutMs);
  });
}

// wait for window.tronweb to be ready
// by default it also makes sure that defaultAddress is set
async function waitForTronWeb({
  timeout = 2000,
  waitDefaultAddress = true,
} = {}) {
  const DELAY = 50;
  let timer = timeout;
  while (true) {
    if (window.tronWeb) {
      if (!waitDefaultAddress) return window.tronWeb;
      if (window.tronWeb.defaultAddress.hex) {
        return window.tronWeb;
      }
    }
    await pause(DELAY);
    timer -= DELAY;
    if (timer <= 0) {
      throw ethRpcErrors.ethErrors.provider.disconneced("tronWeb not detected");
    }
  }
}

function createTronLinkMiddleware(opts = {}) {
  // TODO: wait X secs for tronWeb to be available...
  // const javaTronProvider = ... put on ctx

  return createAsyncMiddleware(async (req, res, next) => {
    const methodFn = methods[req.method];
    if (!(typeof methodFn === "function")) {
      next();
      return;
    }
    const tronweb = await waitForTronWeb();
    const ctx = { tronweb, functionSignatures: opts.functionSignatures };
    const result = await methodFn(req.params, ctx);
    res.result = result;
  });
}

export function createTronLinkEngine(opts = {}) {
  const engine = new JsonRpcEngine();
  engine.push(createTronLinkMiddleware(opts));
  engine.push(createJavaTronMiddleware(opts));
  return engine;
}

export default function createTronLinkProvider(opts = {}) {
  const engine = createTronLinkEngine(opts);
  const provider = providerFromEngine(engine);
  return provider;
}
