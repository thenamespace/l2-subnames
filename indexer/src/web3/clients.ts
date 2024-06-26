import { Injectable } from "@nestjs/common";
import { AppConfiguration } from "src/configuration/app-configuration";
import { PublicClient, createPublicClient, webSocket } from "viem";
import { base, localhost, sepolia } from "viem/chains";
import { Network } from "./types";

@Injectable()
export class Web3Clients {
  private clients: Record<Network, PublicClient>;

  constructor(private readonly appConfig: AppConfiguration) {
    this.initializeClients();
  }

  private initializeClients = () => {
    const baseClient = createPublicClient({
      chain: base as any,
      transport: webSocket(this.appConfig.baseRpcWsUrl),
    });

    const sepoliaClient = createPublicClient({
      chain: sepolia,
      transport: webSocket(this.appConfig.sepoliaRpcWsUrl),
    });

    const localClient = createPublicClient({
      chain: localhost,
      transport: webSocket(this.appConfig.localhostRpcWsUrl),
    });

    this.clients = {
      base: baseClient as any,
      sepolia: sepoliaClient as any,
      localhost: localClient as any,
    };
  };

  public getClient(network: Network): PublicClient {
    return this.clients[network];
  }
}
