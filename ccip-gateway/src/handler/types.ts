import { Address, Hash } from "viem";

export interface IHandler {
  handle: (caller: Address, data: Hash) => any;
}
