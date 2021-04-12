"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTronLinkEngine = void 0;
// TODO
const java_tron_provider_1 = require("@tofudefi/java-tron-provider");
const json_rpc_engine_1 = __importDefault(require("json-rpc-engine"));
const createAsyncMiddleware_js_1 = __importDefault(require("json-rpc-engine/src/createAsyncMiddleware.js"));
const eth_rpc_errors_1 = __importDefault(require("eth-rpc-errors"));
const methods = __importStar(require("./methods.js"));
async function pause(timeoutMs) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeoutMs);
    });
}
// wait for window.tronweb to be ready
// by default it also makes sure that defaultAddress is set
async function waitForTronWeb({ timeout = 2000, waitDefaultAddress = true, } = {}) {
    const DELAY = 50;
    let timer = timeout;
    while (true) {
        if (window.tronWeb) {
            if (!waitDefaultAddress)
                return window.tronWeb;
            if (window.tronWeb.defaultAddress.hex) {
                return window.tronWeb;
            }
        }
        await pause(DELAY);
        timer -= DELAY;
        if (timer <= 0) {
            throw eth_rpc_errors_1.default.ethErrors.provider.disconneced("tronWeb not detected");
        }
    }
}
function createTronLinkMiddleware(opts = {}) {
    // TODO: wait X secs for tronWeb to be available...
    // const javaTronProvider = ... put on ctx
    return createAsyncMiddleware_js_1.default(async (req, res, next) => {
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
function createTronLinkEngine(opts = {}) {
    const engine = new json_rpc_engine_1.default();
    engine.push(createTronLinkMiddleware(opts));
    engine.push(java_tron_provider_1.createJavaTronMiddleware(opts));
    return engine;
}
exports.createTronLinkEngine = createTronLinkEngine;
function createTronLinkProvider(opts = {}) {
    const engine = createTronLinkEngine(opts);
    const provider = java_tron_provider_1.providerFromEngine(engine);
    return provider;
}
exports.default = createTronLinkProvider;
