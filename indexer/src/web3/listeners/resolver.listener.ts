/* eslint-disable prettier/prettier */
import { Web3Clients } from "../clients";
import { Injectable } from "@nestjs/common";
import { Network } from "../types";
import { parseAbi } from "viem";
import { getContractAddresses } from "../contract-addresses";

const ContentHashEvent = "event ContenthashChanged(bytes32 indexed node, bytes hash)";
const AddressSetEvent = "event AddressChanged(bytes32 indexed node, uint256 coinType, bytes newAddress)";
const AddressSetEventOld = "event AddrChanged(bytes32 indexed node, address a)"
const TextSetEvent = "event TextChanged(bytes32 indexed node, string indexed indexedKey, string key,string value)" 

@Injectable()
export class ResolverListener {
  
  constructor(private readonly clients: Web3Clients) {}
  private initialize() {
    const publicClient = this.clients.getClient("sepolia");

    publicClient.getLogs();
  }

  private startListener = async (network: Network) => {
    
    this.syncPastEvents(network);

  }

  private subscribeToCurrentEvents = async (network: Network) => {
    
  }

  private syncPastEvents = async (network: Network) => {
    const publicClient = this.clients.getClient(network);
    const contractAddr = getContractAddresses(network).resolver;
    const resolverEventsFilter = await publicClient.createEventFilter({
      address: contractAddr,
      events: parseAbi([
        ContentHashEvent,
        AddressSetEvent,
        AddressSetEventOld,
        TextSetEvent
      ]),
      fromBlock: BigInt(0),
      toBlock: BigInt(0)
    })

    const _logs = await publicClient.getFilterLogs({ filter: resolverEventsFilter });
  }
}
