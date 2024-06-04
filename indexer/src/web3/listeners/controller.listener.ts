import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { MongoStorageService } from "src/store/mongo-storage.service";
import { parseAbiItem } from "viem";
import ABI from "../abi/nameregistry-controller.json";
import { Web3Clients } from "../clients";
import { getContractAddresses } from "../contract-addresses";
import { Network } from "../types";

@Injectable()
export class ControllerListener implements OnApplicationBootstrap {
  constructor(
    private readonly clients: Web3Clients,
    private readonly storageService: MongoStorageService,
  ) {}

  onApplicationBootstrap() {
    this.listen("localhost");
    this.initialize("localhost");
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
        "event NameMinted(string label, string parentLabel, bytes32 subnameNode, bytes32 parentNode, address owner, uint256 price, uint256 fee, address paymentReceiver, uint64 expiry)",
      ),
    });

    logs.map(async (log) => {
      const nodeAlreadyMinted = nodes?.subnames?.some(
        (s) =>
          s.node.toLocaleLowerCase() ===
          log.args.subnameNode.toLocaleLowerCase(),
      );

      if (!nodeAlreadyMinted) {
        this.storageService.setSubnameNode(
          "localhost",
          toBlock,
          this.createSubnode(log.args),
        );
      }
    });
  }

  private async listen(network: Network) {
    const publicClient = this.clients.getClient(network);

    const address = getContractAddresses(network).controller;

    const toBlock = await publicClient.getBlockNumber();

    publicClient.watchContractEvent({
      address,
      abi: ABI,
      eventName: "NameMinted",
      onLogs: (logs) => {
        logs.map(async (log: any) => {
          this.storageService.setSubnameNode(
            network,
            toBlock,
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
    expiry: any;
  }) {
    return {
      label: nodeLog.label,
      node: nodeLog.subnameNode,
      parentNode: nodeLog.parentNode,
      owner: nodeLog.owner,
      expiry: nodeLog.expiry,
    };
  }
}
