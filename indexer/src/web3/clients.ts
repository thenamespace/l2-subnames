import { PublicClient, createPublicClient, webSocket } from "viem";
import { Network } from "./types";
import { sepolia, base } from "viem/chains";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { AppConfiguration } from "src/configuration/app-configuration";

@Injectable()
export class Web3Clients implements OnApplicationBootstrap {
  private clients: Record<Network, PublicClient>;

  constructor(private readonly appConfig: AppConfiguration) {
    // this.initializeClients();
  }

  onApplicationBootstrap() {
    this.initializeClients();
  }

  private initializeClients = () => {
    const baseClient = createPublicClient({
      chain: base as any,
      transport: webSocket(
        this.appConfig.baseRpcWsUrl,
      ),
    });

    const sepoliaClient = createPublicClient({
      chain: sepolia,
      transport: webSocket(
        this.appConfig.sepoliaRpcWsUrl,
      ),
    });

    this.clients = {
      base: baseClient as any,
      sepolia: sepoliaClient as any,
    };
  };

  public getClient(network: Network) {
    return this.clients[network];
  }
}
