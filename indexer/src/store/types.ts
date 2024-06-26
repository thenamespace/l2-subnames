import { Network } from "src/web3/types";
import { Address, Hash } from "viem";

export interface IStorageService {
  setText(network: Network, node: string, key: string, record: string);
  setAddr(network: Network, node: string, coinType: string, address: string);
  setContentHash(network: Network, node: string, contentHash: string);

  getSubnameNodes(network: Network);
  setSubnameNode(network: Network, syncBlock: bigint, node: ISubnameNode);
}

export interface ISubnameNode {
  label: string;
  node: Hash;
  parentNode: Hash;
  owner: Address;
  textRecords?: Record<string, string>;
  contentHash?: Hash;
  addresses?: Record<string, Address>;
  expiry: number;
}
