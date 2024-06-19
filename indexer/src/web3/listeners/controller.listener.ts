import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { AppConfiguration } from "src/configuration/app-configuration";
import { MongoStorageService } from "src/store/mongo-storage.service";
import { parseAbiItem } from "viem";
import { Web3Clients } from "../clients";
import { getContractAddresses } from "../contract-addresses";
import { Network } from "../types";

@Injectable()
export class ControllerListener implements OnApplicationBootstrap {
  constructor(
    private readonly clients: Web3Clients,
    private readonly storageService: MongoStorageService,
    private readonly config: AppConfiguration,
  ) {}

  async onApplicationBootstrap() {
    try {
      for (const chain of this.config.supportedChains) {
        await this.initialize(chain as Network);
        await this.listen(chain as Network);
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async initialize(network: Network) {
    const publicClient = this.clients.getClient(network);

    const address = getContractAddresses(network).controller;

    const nodes = await this.storageService.getSubnameNodes(network);

    const fromBlock = nodes?.block || BigInt(0);

    const toBlock = await publicClient.getBlockNumber();

    const logs = await publicClient.getLogs({
      address,
      fromBlock,
      toBlock,
      event: parseAbiItem(
        "event NameMinted(string label, string parentLabel, bytes32 subnameNode, bytes32 parentNode, address owner, uint256 price, uint256 fee, address paymentReceiver)",
      ),
    });

    logs.map(async (log) => {
      await this.storageService.setSubnameNode(
        network,
        toBlock,
        this.createSubnode(log.args),
      );
    });
  }

  private async listen(network: Network) {
    const publicClient = this.clients.getClient(network);

    const address = getContractAddresses(network).controller;

    const fromBlock = await publicClient.getBlockNumber();

    publicClient.watchEvent({
      fromBlock,
      address,
      event: parseAbiItem(
        "event NameMinted(string label, string parentLabel, bytes32 subnameNode, bytes32 parentNode, address owner, uint256 price, uint256 fee, address paymentReceiver)",
      ),
      onLogs: (logs) => {
        logs.map(async (log: any) => {
          await this.storageService.setSubnameNode(
            network,
            fromBlock,
            this.createSubnode(log.args),
          );
        });
      },
    });
  }

  private createSubnode(nodeLog: {
    label: any;
    subnameNode: any;
    parentNode: any;
    owner: any;
  }) {
    return {
      label: nodeLog.label,
      node: nodeLog.subnameNode,
      parentNode: nodeLog.parentNode,
      owner: nodeLog.owner,
    };
  }
}
