import { Address, Hash, decodeAbiParameters, parseAbiParameters, decodeFunctionData } from "viem";
import { IHandler } from "./types";
import RESOLVER_ABI from "./resolver.json";

export class Web3Handler implements IHandler {
  
    public handle(caller: Address, callData: Hash) {
    // removing first 10 charachers of a byte string
    // 2 - 0x prefix
    // 8 - 'resolve' function signature
    const data = callData.substring(10);

    const parsedCallData = decodeAbiParameters(
      parseAbiParameters("bytes name, bytes callData"),
      `0x${data}`
    );

    const dnsEncodedName = parsedCallData[0];
    const encodedFunctionData = parsedCallData[1];

    const decodedName = decodeDnsName(
      Buffer.from(dnsEncodedName.slice(2), "hex")
    );

    const decodedFunction = decodeFunctionData({
        abi: RESOLVER_ABI,
        data: encodedFunctionData,
      });
  }
}

function decodeDnsName(dnsname: Buffer) {
  const labels = [];
  let idx = 0;
  while (true) {
    const len = dnsname.readUInt8(idx);
    if (len === 0) break;
    //@ts-ignore
    labels.push(dnsname.slice(idx + 1, idx + len + 1).toString("utf8"));
    idx += len + 1;
  }
  return labels.join(".");
}
