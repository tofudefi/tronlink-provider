"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeFunctionCall = exports.signatureToAbi = void 0;
const web3_1 = __importDefault(require("web3"));
const web3 = new web3_1.default();
// maps function signature to clear text function name
// this map is shared across all library users
const encodedSignatureMap = new Map();
// memorize reverse mapping so we can avoid slow hash function when
// function name already in signatureMap
const encodedSignatureMapReverse = new Map();
// slow, so we memoize and only call if not called already for a given array
function addToEncodedSignatureMap(signature) {
    // skip... already done
    if (encodedSignatureMapReverse.has(signature))
        return;
    // strip leading 0x
    const encodedSignature = web3.eth.abi
        .encodeFunctionSignature(signature)
        .substr(2);
    encodedSignatureMap.set(encodedSignature, signature);
    encodedSignatureMapReverse.set(signature, encodedSignature);
}
function signatureToAbi(sig, signatures = []) {
    signatures
        .filter((sig) => sig.type === "function" || (!sig.type && sig.name))
        .forEach(addToEncodedSignatureMap);
    if (!encodedSignatureMap.has(sig)) {
        throw new Error(`cannot find function name mapping for signature ${sig}`);
    }
    return encodedSignatureMap.get(sig);
}
exports.signatureToAbi = signatureToAbi;
function decodeFunctionCall(data_, signatures = []) {
    // striop leading 0x
    const data = data_.substr(2);
    const encodedFunctionSignature = data.substr(0, 8);
    const encodedParams = data.substr(8);
    const functionAbi = signatureToAbi(encodedFunctionSignature, signatures);
    const paramsResult = web3.eth.abi.decodeParameters(functionAbi.inputs, `0x${encodedParams}`);
    const params = [];
    for (let i = 0; i < paramsResult.__length__; i++) {
        params.push(paramsResult[i]);
    }
    return { functionAbi, params };
}
exports.decodeFunctionCall = decodeFunctionCall;
