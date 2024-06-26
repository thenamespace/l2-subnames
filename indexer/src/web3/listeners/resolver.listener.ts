/* eslint-disable prettier/prettier */
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { AppConfiguration } from "src/configuration/app-configuration";
import { MongoStorageService } from "src/store/mongo-storage.service";
import { Address, Hash, parseAbi, parseAbiItem } from "viem";
import { Web3Clients } from "../clients";
import { getContractAddresses } from "../contract-addresses";
import { Network } from "../types";

const ContentHashEvent =
  "event ContenthashChanged(bytes32 indexed node, bytes hash)";
const AddressSetEvent =
  "event AddressChanged(bytes32 indexed node, uint256 coinType, bytes newAddress)";
const AddressSetEventOld = "event AddrChanged(bytes32 indexed node, address a)";
const TextSetEvent =
  "event TextChanged(bytes32 indexed node, string indexed indexedKey, string key,string value)";

type ResolverEvent =
  | "ContenthashChanged"
  | "AddressChanged"
  | "AddrChanged"
  | "TextChanged";

const events: Record<
  ResolverEvent,
  | typeof ContentHashEvent
  | typeof AddressSetEvent
  | typeof AddressSetEventOld
  | typeof TextSetEvent
> = {
  AddrChanged: AddressSetEvent,
  AddressChanged: AddressSetEventOld,
  ContenthashChanged: ContentHashEvent,
  TextChanged: TextSetEvent,
};

@Injectable()
export class ResolverListener implements OnApplicationBootstrap {
  constructor(
    private readonly clients: Web3Clients,
    private readonly storageService: MongoStorageService,
    private readonly config: AppConfiguration,
  ) {}

  async onApplicationBootstrap() {
    try {
      for (const chain of this.config.supportedChains) {
        await this.syncPastEvents(chain as Network);
        await this.subscribeToCurrentEvents(chain as Network);
      }
    } catch (error) {
      console.log(error);
    }
  }

  private syncPastEvents = async (network: Network) => {
    const publicClient = this.clients.getClient(network);

    const nodes = await this.storageService.getSubnameNodes(network);

    const fromBlock = nodes?.block || BigInt(0);

    const toBlock = await publicClient.getBlockNumber();

    const contractAddr = getContractAddresses(network).resolver;
    const resolverEventsFilter = await publicClient.createEventFilter({
      address: contractAddr,
      events: parseAbi([
        ContentHashEvent,
        AddressSetEvent,
        AddressSetEventOld,
        TextSetEvent,
      ]),
      fromBlock,
      toBlock,
    });

    const logs = await publicClient.getFilterLogs({
      filter: resolverEventsFilter,
    });

    logs.map(async (log) => {
      const handleEvent = this.handleEvent[log.eventName as ResolverEvent];
      await handleEvent(log.args, network);
    });
  };

  private subscribeToCurrentEvents = async (network: Network) => {
    const publicClient = this.clients.getClient(network);

    const fromBlock = await publicClient.getBlockNumber();

    const address = getContractAddresses(network).resolver;

    const watchEvent = (event: ResolverEvent) =>
      publicClient.watchEvent({
        fromBlock,
        address,
        event: parseAbiItem(events[event]),
        onLogs: (logs) => {
          logs.map(async (log: any) => {
            const handleEvent = this.handleEvent[event];
            await handleEvent(log.args, network);
          });
        },
      });

    watchEvent("AddrChanged");
    watchEvent("AddressChanged");
    watchEvent("ContenthashChanged");
    watchEvent("TextChanged");
  };

  private handleEvent: Record<ResolverEvent, any> = {
    TextChanged: async (
      args: { node: Hash; key: string; value: string },
      network: Network,
    ) =>
      await this.storageService.setText(
        network,
        args.node,
        args.key,
        args.value,
      ),

    AddressChanged: async (
      args: { node: Hash; coinType: string; newAddress: Address },
      network: Network,
    ) =>
      await this.storageService.setAddr(
        network,
        args.node,
        args.coinType,
        args.newAddress,
      ),

    AddrChanged: async (args: { node: Hash; a: Address }, network: Network) =>
      await this.storageService.setAddr(network, args.node, "60", args.a),

    ContenthashChanged: async (
      args: { node: Hash; hash: Hash },
      network: Network,
    ) =>
      await this.storageService.setContentHash(network, args.node, args.hash),
  };
}
