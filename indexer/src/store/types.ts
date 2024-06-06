import { Network } from "src/web3/types";
import { Address, Hash } from "viem";

export interface IStorageService {
  // setText(node: string, key: string, record: string);
  // setAddr(node: string, coinType: string, address: string);
  // setContentHash(node: string, contentHash: string);
  // getSubnameNode(node: string);

  // getSubnameNode(node: string): Promise<ISubnameNode>;
  getSubnameNodes(network: Network);
  setSubnameNode(network: Network, syncBlock: bigint, node: ISubnameNode);
}

export interface ISubnameNode {
  label: string;
  node: Hash;
  parentNode: Hash;
  owner: Address;
  texts?: Record<string, string>;
  contentHash?: Hash;
  expiry: bigint;
  addresses?: Record<string, Address>;
}
