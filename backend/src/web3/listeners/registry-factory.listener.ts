import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { NameListing } from 'src/dto/name-listing.dto';
import { Network } from 'src/dto/types';
import { ListedNamesService } from 'src/listed-names/listed-names.service';
import { parseAbiItem } from 'viem';
import { getContracts } from '../contracts/contract-addresses';
import { RpcClient } from '../rpc-client';
import abi from '../abi/nameregistry-factory.json';
import { AppConfig } from 'src/config/app-config.service';

type EnsTokenCreated = {
  tokenAddress: `0x${string}`;
  listerAddress: `0x${string}`;
  listingName: string;
  symbol: string;
  ensName: string;
  baseUri: string;
  owner: `0x${string}`;
  resolver: `0x${string}`;
};

@Injectable()
export class FactoryListener implements OnApplicationBootstrap {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly listedNameService: ListedNamesService,
    private readonly config: AppConfig,
  ) {}

  async onApplicationBootstrap() {
    try {
      for (const chain of this.config.supportedChains) {
        await this.initialize(chain as Network);
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async initialize(network: Network) {
    const publicClient = this.rpcClient.getPublicClient(network);

    const address = getContracts(network).factory;

    const listings = await this.listedNameService.getListings(network);

    const fromBlock = listings?.block || BigInt(0);

    const toBlock = await publicClient.getBlockNumber();

    const logs = await publicClient.getLogs({
      address,
      fromBlock,
      toBlock,
      event: parseAbiItem(
        'event EnsTokenCreated(address tokenAddress, address listerAddress, string listingName, string symbol, string ensName, string baseUri, address owner, address resolver)',
      ),
    });

    logs.map(async (log) => {
      await this.listedNameService.updateListing(
        this.createListing(log.args, network),
        toBlock,
      );
    });
  }

  private async listen(network: Network) {
    const publicClient = this.rpcClient.getPublicClient(network);

    const address = getContracts(network).factory;

    const fromBlock = await publicClient.getBlockNumber();

    publicClient.watchContractEvent({
      fromBlock,
      address,
      eventName: 'EnsTokenCreated',
      abi,
      onLogs: (logs) => {
        logs.map(async (log: any) => {
          await this.listedNameService.updateListing(
            this.createListing(log.args, network),
          );
        });
      },
    });
  }

  private createListing(
    tokenLog: EnsTokenCreated,
    network: Network,
  ): Partial<NameListing> {
    return {
      name: tokenLog.ensName + '.eth',
      label: tokenLog.ensName,
      listingName: tokenLog.listingName,
      owner: tokenLog.owner,
      symbol: tokenLog.symbol,
      token: tokenLog.tokenAddress,
      network,
    };
  }
}
